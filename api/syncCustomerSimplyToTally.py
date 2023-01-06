import json
import http.client
import xml.etree.ElementTree as ET
import os
from socket import timeout
from time import gmtime, strftime
from xml.sax.saxutils import escape

import config
import util
import userManager

#TODO:
# Use findall instead of parsing xml by index
# Remove sys and sys.exit
# xml encode data

def tally_createCustomer(customer):

	hStatus = {}

	try: 

		customer["address"]["first_name"] = "" if customer["address"]["first_name"] == None else customer["address"]["first_name"]
		customer["address"]["last_name"] = "" if customer["address"]["last_name"] == None else customer["address"]["last_name"]

		customer["address"]["email1"] = "" if customer["address"]["email1"] == None else customer["address"]["email1"]
		customer["address"]["phone1"] = "" if customer["address"]["phone1"] == None else customer["address"]["phone1"]
		customer["address"]["phone2"] = "" if customer["address"]["phone2"] == None else customer["address"]["phone2"]

		values = """<ENVELOPE>
			<HEADER>
				<VERSION>1</VERSION>
				<TALLYREQUEST>IMPORT</TALLYREQUEST>
				<TYPE>DATA</TYPE>
				<ID>All Masters</ID>
			</HEADER>
			<BODY>
				<DESC>
					<STATICVARIABLES>
						<IMPORTDUPS>@@DUPCOMBINE</IMPORTDUPS>
						<SVCURRENTCOMPANY>""" + escape(config.TALLY_COMPANY_NAME) + """</SVCURRENTCOMPANY>
					</STATICVARIABLES>
				</DESC>
				<DATA>
					<TALLYMESSAGE>
						<LEDGER Action="Alter" Name=\"""" + escape(customer["name"]) + """\">
							<NAME>""" +  escape(customer["name"]) + """</NAME>
							<PARENT>""" + escape(customer["agent"]["accounting_name"]) + """</PARENT>
							<ADDRESS.LIST>
							<ADDRESS>""" + escape(customer["address"]["address1"]) + """</ADDRESS>
							<ADDRESS>""" + escape(customer["address"]["address2"]) + """</ADDRESS>
							<ADDRESS>""" + escape(customer["address"]["city"]) + """</ADDRESS>
							</ADDRESS.LIST>
							<STATENAME>""" + escape(customer["address"]["state"]) + """</STATENAME>
							<LEDSTATENAME>""" + escape(customer["address"]["state"]) + """</LEDSTATENAME>
							<PINCODE>""" + escape(str(customer["address"]["zip"])) + """</PINCODE>
							<LEDGERCONTACT>""" +  escape(customer["address"]["first_name"]) + " " +  escape(customer["address"]["last_name"]) + """</LEDGERCONTACT>
							<LEDGERMOBILE>""" + escape(str(customer["address"]["phone1"])) + """</LEDGERMOBILE>
							<LEDGERPHONE>""" + escape(str(customer["address"]["phone2"])) + """</LEDGERPHONE>
							<EMAIL>""" + escape(customer["address"]["email1"]) + """</EMAIL>
							<OPENINGBALANCE>""" + str(customer["current_balance"]) + """</OPENINGBALANCE>
							<BILLCREDITPERIOD>""" + str(customer["payment_term"]["days"]) + """</BILLCREDITPERIOD>
							<CREDITLIMIT>""" + str(customer["allowed_balance"]) + """</CREDITLIMIT>
							<INCOMETAXNUMBER>""" + escape(str(customer["pan_number"])) + """</INCOMETAXNUMBER>
							<INTERSTATESTNUMBER>""" + escape(str(customer["cst_number"])) + """</INTERSTATESTNUMBER>
							<PARTYGSTIN>""" + escape(str(customer["gst_number"])) + """</PARTYGSTIN>
							<GSTREGISTRATIONTYPE>""" + escape(str(customer["gst_registration_type"])) + """</GSTREGISTRATIONTYPE>
							<VATTINNUMBER>""" + escape(str(customer["vat_number"])) + """</VATTINNUMBER>
							<UDFSIMPLYTEXTILECUSTOMERCODE>""" + escape(str(customer["code"])) + """</UDFSIMPLYTEXTILECUSTOMERCODE>
							<UDFSIMPLYTEXTILETRANSPORTERCODE>""" + escape(str(customer["transporter"]["code"])) + """</UDFSIMPLYTEXTILETRANSPORTERCODE>
							<UDFSIMPLYTEXTILECUSTOMERTYPECODE>""" + escape(str(customer["custom_type_id"])) + """</UDFSIMPLYTEXTILECUSTOMERTYPECODE>
							<LANGUAGENAME.LIST>
							      <NAME.LIST TYPE="String">
							       <NAME>""" + escape(customer["name"]) + """</NAME>
							       <NAME>""" + escape(str(customer["code"])) + """</NAME>
							      </NAME.LIST>
							      <LANGUAGEID TYPE="Number"> 1033</LANGUAGEID>
							</LANGUAGENAME.LIST>					
						</LEDGER>
					</TALLYMESSAGE>
				</DATA>
			</BODY>
			</ENVELOPE>"""


		data = values.encode('utf-8') # data should be bytes

		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/xml"}
		conn = util.getHttpConnection(config.TALLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("POST", '/', data, headers, conn)

		util.closeHttpConnection(conn)

		hStatus = parseTallyResponse(response)

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
		hStatus["statuscode"] = -201
		hStatus["statusmessage"] = str(error)

	return hStatus
#						<UDFPAYMENTTERM>30 DAYS</UDFPAYMENTTERM>
#						<OPENINGBALANCE>-200</OPENINGBALANCE> <!-- this is not needed for alter -->

def tally_updateCustomer(customer, originalname, guid):

	hStatus = {}

	try:

		values = """<ENVELOPE>
			<HEADER>
				<VERSION>1</VERSION>
				<TALLYREQUEST>IMPORT</TALLYREQUEST>
				<TYPE>DATA</TYPE>
				<ID>All Masters</ID>
			</HEADER>
			<BODY>
				<DESC>
					<STATICVARIABLES>
						<IMPORTDUPS>@@DUPCOMBINE</IMPORTDUPS>
						<SVCURRENTCOMPANY>""" + escape(config.TALLY_COMPANY_NAME) + """</SVCURRENTCOMPANY>
					</STATICVARIABLES>
				</DESC>
				<DATA>
					<TALLYMESSAGE>
						<LEDGER Action="Alter" Name=\"""" + escape(originalname) + """\">
							<GUID>""" + escape(guid) + """</GUID>
							<NAME>""" +  escape(customer["name"]) + """</NAME>
							<PARENT>""" + escape(customer["agent"]["accounting_name"]) + """</PARENT>
							<ADDRESS.LIST>
							<ADDRESS>""" + escape(customer["address"]["address1"]) + """</ADDRESS>
							<ADDRESS>""" + escape(customer["address"]["address2"]) + """</ADDRESS>
							<ADDRESS>""" + escape(customer["address"]["city"]) + """</ADDRESS>
							</ADDRESS.LIST>
							<STATENAME>""" + escape(customer["address"]["state"]) + """</STATENAME>
							<LEDSTATENAME>""" + escape(customer["address"]["state"]) + """</LEDSTATENAME>
							<PINCODE>""" + escape(str(customer["address"]["zip"])) + """</PINCODE>
							<LEDGERCONTACT>""" +  escape(customer["address"]["first_name"]) + " " +  escape(customer["address"]["last_name"]) + """</LEDGERCONTACT>
							<LEDGERMOBILE>""" + escape(str(customer["address"]["phone1"])) + """</LEDGERMOBILE>
							<LEDGERPHONE>""" + escape(str(customer["address"]["phone2"])) + """</LEDGERPHONE>
							<EMAIL>""" + escape(customer["address"]["email1"]) + """</EMAIL>
							<BILLCREDITPERIOD>""" + str(customer["payment_term"]["days"]) + """</BILLCREDITPERIOD>
							<CREDITLIMIT>""" + str(customer["allowed_balance"]) + """</CREDITLIMIT>
							<INCOMETAXNUMBER>""" + escape(str(customer["pan_number"])) + """</INCOMETAXNUMBER>
							<INTERSTATESTNUMBER>""" + escape(str(customer["cst_number"])) + """</INTERSTATESTNUMBER>
							<PARTYGSTIN>""" + escape(str(customer["gst_number"])) + """</PARTYGSTIN>
							<GSTREGISTRATIONTYPE>""" + escape(str(customer["gst_registration_type"])) + """</GSTREGISTRATIONTYPE>
							<VATTINNUMBER>""" + escape(str(customer["vat_number"])) + """</VATTINNUMBER>
							<UDFSIMPLYTEXTILECUSTOMERCODE>""" + escape(str(customer["code"])) + """</UDFSIMPLYTEXTILECUSTOMERCODE>
							<UDFSIMPLYTEXTILETRANSPORTERCODE>""" + escape(str(customer["transporter"]["code"])) + """</UDFSIMPLYTEXTILETRANSPORTERCODE>
							<UDFSIMPLYTEXTILECUSTOMERTYPECODE>""" + escape(str(customer["custom_type_id"])) + """</UDFSIMPLYTEXTILECUSTOMERTYPECODE>
						</LEDGER>
					</TALLYMESSAGE>
				</DATA>
			</BODY>
			</ENVELOPE>"""

		# <LANGUAGENAME.LIST>
		#       <NAME.LIST TYPE="String">
		#        <NAME>""" + escape(customer["name"]) + """</NAME>
		#       </NAME.LIST>
		#       <LANGUAGEID TYPE="Number"> 1033</LANGUAGEID>
		# </LANGUAGENAME.LIST>					

		data = values.encode('utf-8') # data should be bytes

		url = config.TALLY_URL #'http://192.168.200.29:9000'

		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/xml"}
		conn = util.getHttpConnection(config.TALLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("POST", '/', data, headers, conn)
		util.closeHttpConnection(conn)

		# parse tally response
		hStatus = parseTallyResponse(response)

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
		hStatus["statuscode"] = -202
		hStatus["statusmessage"] = str(error)

	return hStatus


def tally_createUpdateCustomer(customerList, sessionid):

	hStatus = {}

	try:

		hOutput = []

		for customer in customerList:

			hCustomer = {}

			hStatus = tally_isCustomerExists(customer["name"])

			if (hStatus["statuscode"] == 0):
				hCustomerStatus = tally_updateCustomer(customer, hStatus["name"], hStatus["guid"])
			else:
				hCustomerStatus = tally_createCustomer(customer)

			if (hCustomerStatus["statuscode"] == 0):
				hStatus = api_updateCustomerSyncStatus(customer["id"], 4101, hCustomerStatus["statusmessage"], sessionid)
				hCustomer["statuscode"] = hStatus["statuscode"]
				hCustomer["statusmessage"] = hCustomerStatus["statusmessage"]
			else:
				hCustomer["statuscode"] = hCustomerStatus["statuscode"]
				hCustomer["statusmessage"] = hCustomerStatus["statusmessage"]

			hCustomer["id"] = customer["id"]
			hCustomer["name"] = customer["name"]
			hCustomer["code"] = customer["code"]

			# add into output list
			hOutput.append(hCustomer)

		hStatus["statuscode"] = 0
		hStatus["response"] = hOutput

	except:

		hStatus["statuscode"] = 0
		hStatus["response"] = []

	return hStatus


def tally_isCustomerExists(name):

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
		                    <SYSTEM TYPE="Formulae" NAME="MYFILTER" ISMOIFY="NO" ISFIXED="NO" ISINTERNAL="NO">$NAME = \"""" + str(name) + """\"</SYSTEM>
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
		hStatus = isLedgerExists(response)

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


def isLedgerExists(response):

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


def parseTallyResponse (response):

	hStatus = {}

	try:

		root = ET.fromstring(response)
		status_node = root.find("HEADER/STATUS")

		if (status_node.text == "1"):
			hStatus["statuscode"] = 0
			hStatus["statusmessage"] = "Success"
		else:
			hStatus["statuscode"] = -204
			hStatus["statusmessage"] = root.find("BODY/DATA/LINEERROR").text

	except:
		hStatus["statuscode"] = -105
		hStatus["statusmessage"] = "Tally customer response parse error!"

	return hStatus


def api_getCustomers (sessionid):

	try:

		headers = {}
		headers["Authorization"] = "Bearer " + sessionid
		headers["Content-type"] = "application/x-www-form-urlencoded"
		headers["Accept"] = "text/json"

		conn = util.getHttpConnection(config.SIMPLY_URL)
		response = util.invokeHttpMethod("GET", '/api/customers/?sync_status_id=4100', "", headers, conn)
		util.closeHttpConnection(conn)

		# load the response
		hResponse = json.loads(response)

		# output 
		hStatus = {}

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


def api_updateCustomerSyncStatus(customerid, syncstatusid, message, sessionid):

	try:

		headers = {}
		headers["Authorization"] = "Bearer " + sessionid
		headers["Content-type"] = "application/json"
		headers["Accept"] = "text/json"

		data = {"sync_status_id":syncstatusid}
		conn = util.getHttpConnection(config.SIMPLY_URL)
		response = util.invokeHttpMethod("PATCH", "/api/customers/" + str(customerid), json.dumps(data), headers, conn)
		util.closeHttpConnection(conn)

		# load the response
		hResponse = json.loads(response)

		# output 
		hStatus = {}

		# parse the response
		if (hResponse["statuscode"] == 0):
			if "data" in hResponse:
				if "output" in hResponse["data"]:
					hCustomerList = hResponse["data"]["output"]
					hStatus["statuscode"] = 0
					hStatus["response"] = hCustomerList
			else:
				hStatus["statuscode"] = -107

		else:
			hStatus["statuscode"] = -105

		return hStatus

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
		hStatus["statuscode"] = -207
		hStatus["statusmessage"] = str(error)

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
		hCustomerOutput = api_getCustomers(hLogin["sessionid"])

		if (hCustomerOutput["statuscode"] == 0):
			hCustomerList = hCustomerOutput["response"]

			# create or update customers in Tally
			response = tally_createUpdateCustomer(hCustomerList, hLogin["sessionid"])

			# return the page level response
			hPageStatus["statuscode"] = 0
			hPageStatus["response"]   = response["response"]

		else:

			hPageStatus["statuscode"] = hCustomerOutput["statuscode"]
			hPageStatus["statusmessage"] =  hCustomerOutput["statusmessage"]

	else:

		# api login failed from remote url. Set the error at page level
		hPageStatus["statuscode"] =  hLogin["statuscode"]
		hPageStatus["statusmessage"] =  hLogin["statusmessage"]

	# writing to file
	f = open(config.LOG_FOLDER + "/" + strftime("%Y%m%d%H%M%S", gmtime()) + "_customer_create.txt", "w")
	f.write (json.dumps(hPageStatus, indent=4))
	f.close()

except Exception as error:

	# writing to file
	f = open(config.LOG_FOLDER + "/" + strftime("%Y%m%d%H%M%S", gmtime()) + "_customer_create.txt", "w")
	f.write (str(error))
	f.close()

print (json.dumps(hPageStatus, indent=4))