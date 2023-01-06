import http.client
import json
import xml.etree.ElementTree as ET
import os
import time
from socket import timeout
from time import gmtime, strftime
from xml.sax.saxutils import escape
from datetime import datetime, timedelta

import config
import util
import userManager

#TODO:
# Use findall instead of parsing xml by index
# Remove sys and sys.exit
# xml encode data

def tally_getCustomerByCode(code):

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
		                    	<NATIVEMETHOD>GUID</NATIVEMETHOD>
		                        <NATIVEMETHOD>Address</NATIVEMETHOD>
		                        <NATIVEMETHOD>City</NATIVEMETHOD>
		                        <NATIVEMETHOD>PINCODE</NATIVEMETHOD>
		                        <NATIVEMETHOD>UDFSIMPLYTEXTILECUSTOMERCODE</NATIVEMETHOD>
                                <NATIVEMETHOD>PARENT</NATIVEMETHOD>
                                <NATIVEMETHOD>GROUP</NATIVEMETHOD>
                                <NATIVEMETHOD>CREDITLIMIT</NATIVEMETHOD>
                                <NATIVEMETHOD>BILLCREDITPERIOD</NATIVEMETHOD>
		                    	<NATIVEMETHOD>OPENINGBALANCE</NATIVEMETHOD>
		                    	<NATIVEMETHOD>CLOSINGBALANCE</NATIVEMETHOD>
		                    	<FILTERS>MYFILTER</FILTERS>
		 					</COLLECTION>
		                    <SYSTEM TYPE="Formulae" NAME="MYFILTER" ISMOIFY="NO" ISFIXED="NO" ISINTERNAL="NO">$UDFSimplyTextileCustomerCode = \"""" + escape(str(code)) + """\"</SYSTEM>
						</TDLMESSAGE>
					</TDL>
				</DESC>
			</BODY>
		</ENVELOPE>"""

		data = values.encode('utf-8') # data should be bytes

		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/xml"}
		conn = util.getHttpConnection(config.TALLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("POST", '/', data, headers, conn)
		util.closeHttpConnection(conn)

		response = response.decode("utf-8").replace("`", "").replace("UDF:", "")

		# find if ledger exists by parsing response
		hStatus = parseTallyLedgerResponse(response)

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
		hStatus["statuscode"] = -203
		hStatus["statusmessage"] = str(error)

	return hStatus


def parseTallyLedgerResponse(response):

	hStatus = {}

	try:

		root = ET.fromstring(response)

		ledger_list = root.findall("BODY/DATA/COLLECTION/LEDGER")

		if len(ledger_list) > 0:
			hStatus["statuscode"] = 0
			hStatus["guid"] = root.find("BODY/DATA/COLLECTION/LEDGER/GUID").text
			hStatus["name"] = root.find("BODY/DATA/COLLECTION/LEDGER").attrib["NAME"]
		else:
			hStatus["statuscode"] = 1
			hStatus["statusmessage"] = "No ledger found"

	except Exception as error:
		hStatus["statuscode"] = -105
		hStatus["statusmessage"] = str(error)

	return hStatus

def tally_getPendingBillsByCustomerName(name):

	hStatus = {}

	try:

		values = """<ENVELOPE>
				    <HEADER>
				        <VERSION>1</VERSION>
				        <TALLYREQUEST>EXPORT</TALLYREQUEST>
				        <TYPE>COLLECTION</TYPE>
				        <ID>Collection of Bills</ID>
				    </HEADER>
				    <BODY>
				        <DESC>
				            <STATICVARIABLES>
								<SVCURRENTCOMPANY>""" + escape(config.TALLY_COMPANY_NAME) + """</SVCURRENTCOMPANY>
				            </STATICVARIABLES>
				            <TDL>
				                <TDLMESSAGE>
				                    <COLLECTION NAME="Collection of Bills" ISMODIFY="No" ISFIXED="No" ISINITIALIZE="No" ISOPTION="No" ISINTERNAL="No">
				                        <TYPE>Bill</TYPE>
				                        <NATIVEMETHOD>PARTYLEDGERNAME</NATIVEMETHOD>
				                        <NATIVEMETHOD>LEDGERNAME</NATIVEMETHOD>
				                        <NATIVEMETHOD>PARTYUDFSIMPLYTEXTILECUSTOMERCODE</NATIVEMETHOD>
				                        <NATIVEMETHOD>BILLDATE</NATIVEMETHOD>
				                        <NATIVEMETHOD>BILLCREDITPERIOD</NATIVEMETHOD>
				                        <NATIVEMETHOD>OPENINGBALANCE</NATIVEMETHOD>
				                        <NATIVEMETHOD>FINALBALANCE</NATIVEMETHOD>
				                        <NATIVEMETHOD>CLOSINGBALANCE</NATIVEMETHOD>
				                        <NATIVEMETHOD>CLEAREDON</NATIVEMETHOD>
				                    	<FILTERS>MYFILTER</FILTERS>
				 					</COLLECTION>
				                    <SYSTEM TYPE="Formulae" NAME="MYFILTER" ISMOIFY="NO" ISFIXED="NO" ISINTERNAL="NO">$LEDGERNAME = \"""" + escape(str(name)) + """\"</SYSTEM>
				                </TDLMESSAGE>
				            </TDL>
				        </DESC>
				    </BODY>
				</ENVELOPE>"""

		data = values.encode('utf-8') # data should be bytes

		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/xml"}
		conn = util.getHttpConnection(config.TALLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("POST", "/", data, headers, conn)
		util.closeHttpConnection(conn)

		# replace the response
		response = response.decode("utf-8").replace("`", "").replace("UDF:", "")

		# parse tally response
		hStatus = parseTallyBillResponse(response, name)

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

def parseTallyBillResponse (response, name):

	hStatus = {}
	lBills = []

	try:

		root = ET.fromstring(response)
		status_node = root.find("HEADER/STATUS")

		if (status_node.text == "1"):

			for billNode in root.findall("BODY/DATA/COLLECTION/BILL"):

				billdate = billNode.find("BILLDATE").text
				billref = billNode.find("NAME").text
				bill_amount = billNode.find("OPENINGBALANCE").text
				balance = billNode.find("FINALBALANCE").text
				duedate = billNode.find("BILLCREDITPERIOD").text
				billid = billNode.find("BILLID").text
				ledgername = billNode.find("LEDGERNAME").text

				conv = time.strptime(billdate, "%Y%m%d")
				billdate = time.strftime("%Y-%m-%d",conv)

				if (duedate is None):
					duedate = billdate
				else:
					days_pos = duedate.find(" Days")
					if (days_pos > -1):
						days = int(duedate[0:days_pos])
						dBillDate = datetime.strptime(billdate, '%Y-%m-%d')
						dDueDate = dBillDate + timedelta(days=days) 

						duedate = dDueDate.strftime("%Y-%m-%d")

					else:
						conv = time.strptime(duedate, "%d-%b-%Y")
						duedate = time.strftime("%Y-%m-%d",conv)

				bill = {};
				bill["bill_number"] = billid
				bill["bill_ref_number"] = billref
				bill["bill_date"] = billdate
				bill["bill_amount"] = round(float(bill_amount), 2) * -1
				bill["balance_amount"] = round(float(balance), 2) * -1
				bill["due_date"] = duedate

				lBills.append(bill)

			hStatus["statuscode"] = 0
			hStatus["statusmessage"] = "Success"
			hStatus["response"] = lBills

		else:
			hStatus["statuscode"] = -200
			hStatus["statusmessage"] = root.find("BODY/DATA/LINEERROR").text
			hStatus["name"] = name

	except Exception as error:
		hStatus["statuscode"] = -105
		hStatus["statusmessage"] = "Tally customer response parse error!" + str(error)

	return hStatus

def api_createPendingBills (lBills, sessionid):

	hStatus = {}

	try:

		headers = {}
		headers["Authorization"] = "Bearer " + sessionid
		headers["Content-type"] = "application/json"

		data = json.dumps(lBills).encode('ascii')

		conn = util.getHttpConnection(config.SIMPLY_URL)
		response = util.invokeHttpMethod("POST", '/api/customerbills', data, headers, conn)

		util.closeHttpConnection(conn)

		# loading response
		hResponse = json.loads(response)

		# setting return status
		hStatus["statuscode"] = 0
		hStatus["statusmessage"] = "Success"
		hStatus["response"] = hResponse["data"]["statuslist"][0]

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


def api_getCustomers (sessionid):

	hStatus = {}

	try:

		headers = {}
		headers["Authorization"] = "Bearer " + sessionid
		headers["Content-type"] = "application/x-www-form-urlencoded"
		headers["Accept"] = "text/json"

		# headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/json"}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("GET", '/api/customers/?enabled_only=1', "", headers, conn)
		util.closeHttpConnection(conn)

		# load the response
		hResponse = json.loads(response)

		# parse the response
		if (hResponse["statuscode"] == 0):
			if "data" in hResponse:
				if "customerlist" in hResponse["data"]:
					hCustomerList = hResponse["data"]["customerlist"]
					hStatus["statuscode"] = 0
					hStatus["response"] = hCustomerList
			else:
				hStatus["statuscode"] = -107

			hStatus["statusmessage"] = hResponse["message"]

		else:
			hStatus["statuscode"] = hResponse["statuscode"]
			hStatus["statusmessage"] = hResponse["message"]

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
		hStatus["statuscode"] = -206
		hStatus["statusmessage"] = str(error)

	return hStatus


def process(customerList, guid, sessionid):

	lCustomer = []
	for customer in customerList:
		
		hRecordStatus = {}

		hTallyCustomerOutput = tally_getCustomerByCode(customer["code"])

		if (hTallyCustomerOutput["statuscode"] == 0):
			name = hTallyCustomerOutput["name"]

			hTallyBillOutput = tally_getPendingBillsByCustomerName(name)

			if (hTallyBillOutput["statuscode"] == 0):
				lBills = hTallyBillOutput["response"]

				hRequest = {}
				hRequest["guid"] = guid
				hRequest["code"] = customer["code"]
				hRequest["id"]   = customer["id"]
				hRequest["name"] = customer["name"]
				hRequest["billlist"] = lBills;

				# we want to send only one customer request at a time so initalizig Request list
				lRequest = []
				lRequest.append(hRequest)

				hStatus = api_createPendingBills(lRequest, sessionid)

				hRecordStatus = hStatus["response"]

			else:

				hRecordStatus["statuscode"] = hTallyBillOutput["statuscode"]
				hRecordStatus["statusmessage"] = "Unable to find Bills for " + customer["name"] + " in Tally."
				hRecordStatus["name"] = customer["name"]
				hRecordStatus["code"] = customer["code"]

		else:
			hRecordStatus["statuscode"] = hTallyCustomerOutput["statuscode"]
			hRecordStatus["statusmessage"] = hTallyCustomerOutput["statusmessage"] + " " + customer["name"] + " not found in Tally."
			hRecordStatus["name"] = customer["name"]
			hRecordStatus["code"] = customer["code"]

		lCustomer.append(hRecordStatus)

	hStatus = {}
	hStatus["statuscode"] = 0
	hStatus["statusmessage"] = "Success"
	hStatus["response"] = lCustomer

	return hStatus

#===============================
# main program
#===============================
hPageStatus = {}

try:

	# login to remote page to retrieve customers
	hLogin         = userManager.login()

	if (hLogin["statuscode"] == 0):

		# get customer list from remote page
		sessionid = hLogin["sessionid"]
		guid = util.generateRandomString(32)
		hCustomerOutput = api_getCustomers(sessionid)

		if (hCustomerOutput["statuscode"] == 0):
			hCustomerList = hCustomerOutput["response"]

			# create or update customers in Tally
			hProcessOutput = process(hCustomerList, guid, sessionid)

			# return the page level response
			hPageStatus["statuscode"] = 0
			hPageStatus["statusmessage"] = "Success"
			hPageStatus["response"]   = hProcessOutput["response"]

		else:

			hPageStatus["statuscode"] = hCustomerOutput["statuscode"]
			hPageStatus["statusmessage"] =  hCustomerOutput["statusmessage"]

	else:

		# api login failed from remote url. Set the error at page level
		hPageStatus["statuscode"] =  hLogin["statuscode"]
		hPageStatus["statusmessage"] =  hLogin["statusmessage"]

	# writing to file
	f = open(config.LOG_FOLDER + "/" + strftime("%Y%m%d%H%M%S", gmtime()) + "_pending_bills.txt", "w")
	f.write (json.dumps(hPageStatus, indent=4))
	f.close()

except Exception as error:

	# writing to file
	f = open(config.LOG_FOLDER + "/" + strftime("%Y%m%d%H%M%S", gmtime()) + "_pending_bills.txt", "w")
	f.write (str(error))
	f.close()

#print (json.dumps(hPageStatus, indent=4))

