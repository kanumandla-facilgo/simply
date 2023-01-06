import http.client
import json
import xml.etree.ElementTree as ET
from socket import timeout
from time import gmtime, strftime
from xml.sax.saxutils import escape

import config
import util
import userManager

def tally_extractBalance():

	hStatus = {}

	try:

		values = """<ENVELOPE>
			<HEADER>
				<VERSION>1</VERSION>
				<TALLYREQUEST>EXPORT</TALLYREQUEST>
				<TYPE>COLLECTION</TYPE>
				<ID>Collection of Ledgers</ID>
			</HEADER>
			<BODY>
				<DESC>
					<STATICVARIABLES>
						<SVCURRENTCOMPANY>""" + escape(config.TALLY_COMPANY_NAME) + """</SVCURRENTCOMPANY>
					</STATICVARIABLES>
					<TDL>
						<TDLMESSAGE>
							<COLLECTION NAME="Collection of Ledgers" ISMODIFY="No" ISFIXED="No" ISINITIALIZE="No" ISOPTION="No" ISINTERNAL="No">
		 						<TYPE>Ledger</TYPE>
		                    	<NATIVEMETHOD>NAME</NATIVEMETHOD>
		                        <NATIVEMETHOD>Address</NATIVEMETHOD>
		                        <NATIVEMETHOD>City</NATIVEMETHOD>
		                        <NATIVEMETHOD>PARENT</NATIVEMETHOD>
		                        <NATIVEMETHOD>GROUP</NATIVEMETHOD>
		                        <NATIVEMETHOD>GROUPNAME</NATIVEMETHOD>
		                        <NATIVEMETHOD>UDFPAYMENTTERM</NATIVEMETHOD>
		                    	<NATIVEMETHOD>OpeningBalance</NATIVEMETHOD>
		                    	<NATIVEMETHOD>ClosingBalance</NATIVEMETHOD>
								<NATIVEMETHOD>BILLCREDITPERIOD</NATIVEMETHOD>
								<NATIVEMETHOD>CREDITLIMIT</NATIVEMETHOD>
								<NATIVEMETHOD>UDFSIMPLYTEXTILECUSTOMERCODE</NATIVEMETHOD>
		                    	<FILTERS>MYFILTER</FILTERS>
		 					</COLLECTION>
		                    <SYSTEM TYPE="Formulae" NAME="MYFILTER" ISMOIFY="NO" ISFIXED="NO" ISINTERNAL="NO">$UDFSimplyTextileCustomerCode IS NOT NULL</SYSTEM>
						</TDLMESSAGE>
					</TDL>
				</DESC>
			</BODY>
		</ENVELOPE>"""

		data = values.encode('utf-8') # data should be bytes

		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/xml"}
		conn = util.getHttpConnection(config.TALLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("POST", "/", data, headers, conn)
		# conn.request("POST", "/", data, headers)
		# responseStream = conn.getresponse()
		# response = responseStream.read()
		util.closeHttpConnection(conn)

		# setting response status
		hStatus["statuscode"] = 0
		hStatus["response"] = response.decode("utf-8").replace("`", "").replace("UDF:", "")

	except (OSError) as error:
		hStatus["statuscode"] = -104
		hStatus["statusmessage"] = str(error)

	except (http.client.HTTPException, http.client.NotConnected) as error:
		hStatus["statuscode"] = -105
		hStatus["statusmessage"] = str(error)

	except timeout as error:
		hStatus["statuscode"] = -106
		hStatus["statusmessage"] = str(error)

	except Exception as error:
		hStatus["statuscode"] = -200
		hStatus["statusmessage"] = str(error)

	return hStatus


def parseTallyResponse (response):

	try:

		root = ET.fromstring(response)
		status_node = root.find("HEADER/STATUS")

		if (status_node.text == "1"):

			ledger_list = []

			for ledger in root.findall('BODY/DATA/COLLECTION/LEDGER'):

				name = ledger.attrib.get("NAME")
				balance = ledger.find("CLOSINGBALANCE").text

				if balance is None:
					balance = 0

				code = ledger.find("UDFSIMPLYTEXTILECUSTOMERCODE").text

				hLedger = {}
				hLedger["name"] = name
				hLedger["balance"] = int(float(balance)) * -1
				hLedger["code"] = code

				# adding a ledger info into list
				ledger_list.append(hLedger)

			# returning response
			return ledger_list

		else:
			hStatus["statuscode"] = -200
			hStatus["statusmessage"] = root.find("BODY/DATA/LINEERROR").text

	except:
		return None


def api_updateCustomerBalance (sessionid, ledger_list):

	hStatus = {}

	try:

		headers = {}
		headers["Authorization"] = "Bearer " + sessionid
		headers["Content-type"] = "application/json"

		data = json.dumps(ledger_list).encode('ascii')

		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("POST", '/api/customerbalance', data, headers, conn)
		util.closeHttpConnection(conn)

		# loading response
		hResponse = json.loads(response)

		# setting return status
		hStatus["statuscode"] = 0
		hStatus["response"] = hResponse

	except (OSError) as error:
		hStatus["statuscode"] = -104
		hStatus["statusmessage"] = str(error)

	except (http.client.HTTPException, http.client.NotConnected) as error:
		hStatus["statuscode"] = -105
		hStatus["statusmessage"] = str(error)

	except timeout as error:
		hStatus["statuscode"] = -106
		hStatus["statusmessage"] = str(error)

	except Exception as error:
		hStatus["statuscode"] = -200
		hStatus["statusmessage"] = str(error)

	return hStatus

# main program
hPageStatus = {}

try:

	hTallyResponse = tally_extractBalance()

	if (hTallyResponse["statuscode"] == 0):
		ledger_list    = parseTallyResponse(hTallyResponse["response"])
		hLogin         = userManager.login()

		if (hLogin["statuscode"] == 0):
			hStatus = api_updateCustomerBalance(hLogin["sessionid"], ledger_list)

			if (hStatus["statuscode"] == 0):
				hPageStatus["statuscode"] = 0
				hPageStatus["statusmessage"] =  "Success"
				hPageStatus["response"]   = hStatus["response"]["data"]
			else:
				hPageStatus["statuscode"] = hStatus["statuscode"]
				hPageStatus["statusmessage"] =  hStatus["statusmessage"]

		else:

			hPageStatus["statuscode"] =  hLogin["statuscode"]
			hPageStatus["statusmessage"] =  hLogin["statusmessage"]

	else:

		hPageStatus["statuscode"] =  hTallyResponse["statuscode"]
		hPageStatus["statusmessage"] =  hTallyResponse["statusmessage"]

	# writing to file
	f = open(config.LOG_FOLDER + "/" + strftime("%Y%m%d%H%M%S", gmtime()) + "_customer_balance_sync.txt", "w")
	f.write (json.dumps(hPageStatus, indent=4))
	f.close()

except Exception as error:

	# writing to file
	f = open(config.LOG_FOLDER + "/" + strftime("%Y%m%d%H%M%S", gmtime()) + "_customer_balance_sync.txt", "w")
	f.write (str(error))
	f.close()

print (json.dumps(hPageStatus, indent=4))

