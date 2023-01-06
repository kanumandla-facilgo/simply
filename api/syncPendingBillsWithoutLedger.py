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

def tally_getPendingBills():

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
				                        <NATIVEMETHOD>LEDGERNAME</NATIVEMETHOD>
				                        <NATIVEMETHOD>BILLDATE</NATIVEMETHOD>
				                        <NATIVEMETHOD>BILLCREDITPERIOD</NATIVEMETHOD>
				                        <NATIVEMETHOD>OPENINGBALANCE</NATIVEMETHOD>
				                        <NATIVEMETHOD>FINALBALANCE</NATIVEMETHOD>
				                        <NATIVEMETHOD>CLOSINGBALANCE</NATIVEMETHOD>
				 					</COLLECTION>
				                </TDLMESSAGE>
				            </TDL>
				        </DESC>
				    </BODY>
				</ENVELOPE>"""

		data = values.encode('utf-8') # data should be bytes

		# req = urllib.request.Request(url, data)
		# with urllib.request.urlopen(req, timeout=config.TIMEOUT) as response:
		#    response = response.read()

		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/xml"}
		conn = util.getHttpConnection(config.TALLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("POST", "/", data, headers, conn)
		util.closeHttpConnection(conn)

		# replace the response
		response = response.decode("utf-8").replace("`", "").replace("UDF:", "")

		# parse tally response
		hStatus = parseTallyBillResponse(response)

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

# check if customer exist in remote system
def api_isCustomerExists(code, sessionid):

	hStatus = {}

	try:

		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/json", "Auhtorization": "Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("GET", '/api/customers/?code=' + str(code), '', headers, conn)
		util.closeHttpConnection(conn)

		# deserialize json
		hResponse = json.loads(response)

		# assign status code and message
		hStatus["statuscode"] = hResponse["statuscode"]
		hStatus["statusmessage"] = hResponse["message"]

		if (hStatus["statuscode"] == 0):
			if (len(hResponse["data"]["customerlist"]) > 0):
				hStatus["customer"] = hResponse["data"]["customerlist"][0]
				hStatus["result"] = 1
				hStatus["response"] = hResponse["data"]["customerlist"][0] 
			else:
				hStatus["result"] = 0

		else:
			hStatus["result"] = -1

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

	hStatus = {}

	try:

		parser = ET.XMLParser(encoding="utf-8")
		root = ET.fromstring(response, parser=parser)
		status_node = root.find("HEADER/STATUS")

		if (status_node.text == "1"):

			lCustomerList = []
			for ledger in root.findall("BODY/DATA/COLLECTION/LEDGER"):
				lCustomerList.append(ledger)

			hStatus["statuscode"] = 0
			hStatus["statusmessage"] = "Success"
			hStatus["response"] = lCustomerList

		else:
			hStatus["statuscode"] = -200
			hStatus["statusmessage"] = root.find("BODY/DATA/LINEERROR").text

	except Exception as error:
		hStatus["statuscode"] = -105
		hStatus["statusmessage"] = "Tally customer response parse error!" + str(error)

	return hStatus

def parseTallyBillResponse (response):

	hStatus = {}
	hCustomer = {}

	try:

		parser = ET.XMLParser(encoding="utf-8")
		root = ET.fromstring(response, parser=parser)
		status_node = root.find("HEADER/STATUS")

		if (status_node.text == "1"):

			for billNode in root.findall("BODY/DATA/COLLECTION/BILL"):

				try:
	
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

					bill = {}
					bill["bill_number"] = billid
					bill["bill_ref_number"] = billref
					bill["bill_date"] = billdate
					bill["bill_amount"] = round(float(bill_amount), 2) * -1
					bill["balance_amount"] = round(float(balance), 2) * -1
					bill["due_date"] = duedate

					if not ledgername in hCustomer:
						hCustomer[ledgername] = []

					hCustomer[ledgername].append(bill)

				except Exception as error:
					print (ledgername + " has a problem: " + str(error))

			hStatus["statuscode"] = 0
			hStatus["statusmessage"] = "Success"
			hStatus["response"] = hCustomer

		else:
			hStatus["statuscode"] = -200
			hStatus["statusmessage"] = root.find("BODY/DATA/LINEERROR").text

	except Exception as error:
		hStatus["statuscode"] = -105
		hStatus["statusmessage"] = "Tally customer response parse error!" + str(error)

	return hStatus

def tally_getLedgerByName(name):

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
		                    	<NATIVEMETHOD>LEDGERPHONE</NATIVEMETHOD>
		                        <NATIVEMETHOD>EMAIL</NATIVEMETHOD>
		                        <NATIVEMETHOD>LEDGERMOBILE</NATIVEMETHOD>
		                        <NATIVEMETHOD>Address</NATIVEMETHOD>
		                        <NATIVEMETHOD>City</NATIVEMETHOD>
		                        <NATIVEMETHOD>PRIORSTATENAME</NATIVEMETHOD>		                        
		                        <NATIVEMETHOD>PINCODE</NATIVEMETHOD>
		                        <NATIVEMETHOD>UDFSIMPLYTEXTILECUSTOMERCODE</NATIVEMETHOD>
		                        <NATIVEMETHOD>UDFSIMPLYPAYMENTREMINDERMOBILE</NATIVEMETHOD>
		                        <NATIVEMETHOD>UDFSIMPLYPAYMENTREMINDEREMAIL</NATIVEMETHOD>
                                <NATIVEMETHOD>PARENT</NATIVEMETHOD>
                                <NATIVEMETHOD>GROUP</NATIVEMETHOD>
                                <NATIVEMETHOD>CREDITLIMIT</NATIVEMETHOD>
                                <NATIVEMETHOD>BILLCREDITPERIOD</NATIVEMETHOD>
		                    	<NATIVEMETHOD>OPENINGBALANCE</NATIVEMETHOD>
		                    	<NATIVEMETHOD>CLOSINGBALANCE</NATIVEMETHOD>
		                    	<FILTERS>MYFILTER</FILTERS>
		 					</COLLECTION>
		                    <SYSTEM TYPE="Formulae" NAME="MYFILTER" ISMOIFY="NO" ISFIXED="NO" ISINTERNAL="NO">$_PrimaryGroup  = "Sundry Debtors" AND $Name = \"""" + escape(str(name)) + """\"</SYSTEM>
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

		parser = ET.XMLParser(encoding="utf-8")
		root = ET.fromstring(response, parser=parser)
		status_node = root.find("HEADER/STATUS")

		if (status_node.text == "1"):

			hCustomerObject = {}
			ledger_list = root.findall("BODY/DATA/COLLECTION/LEDGER")

			if len(ledger_list) > 0:

				ledger = ledger_list[0]
				hStatus["statuscode"] = 0
				hStatus["guid"] = root.find("BODY/DATA/COLLECTION/LEDGER/GUID").text
				
				hCustomerObject["name"] = ledger.attrib["NAME"]
				hCustomerObject["code"] = ledger.find("UDFSIMPLYTEXTILECUSTOMERCODE").text if ledger.find("UDFSIMPLYTEXTILECUSTOMERCODE") != None else ""
				hStatus["response"] = hCustomerObject

			else:
				hStatus["statuscode"] = 1
				hStatus["statusmessage"] = "No ledger found"
		else:
			hStatus["statuscode"] = -200
			hStatus["statusmessage"] = root.find("BODY/DATA/LINEERROR").text

	except Exception as error:
		hStatus["statuscode"] = -105
		hStatus["statusmessage"] = "Tally customer response parse error!" + str(error)

	return hStatus

	
def api_updateCustomer(customer, sessionid):

	hStatus = {}
	hCustomer = {}
	try:
		hCustomer["customer"] = customer
		headers = {"Content-type": "application/json", "Accept": "text/json", "Authorization":"Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("PUT", '/api/customers/' + str(hCustomer["customer"]["id"]), json.dumps(hCustomer), headers, conn)
		util.closeHttpConnection(conn)

		hResponse = json.loads(response)

		hStatus["statuscode"] = hResponse["statuscode"]
		hStatus["statusmessage"] = hResponse["message"]

		hStatus["id"] = hResponse["data"]["customer"]["id"]
		hStatus["code"] = hResponse["data"]["customer"]["code"]
		hStatus["name"] = hResponse["data"]["customer"]["name"]


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

def tally_updateCustomerCode(customer, guid):

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
						<LEDGER Action="Alter" Name=\"""" + escape(customer["name"]) + """\">
							<GUID>""" + escape(guid) + """</GUID>
							<UDFSIMPLYTEXTILECUSTOMERCODE>""" + escape(str(customer["code"])) + """</UDFSIMPLYTEXTILECUSTOMERCODE>
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

def api_createCustomer(customer, sessionid):

	hStatus = {}

	try:
		hCustomer["customer"] = customer
		headers = {"Content-type": "application/json", "Accept": "text/json", "Authorization":"Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("POST", '/api/customers/', json.dumps(hCustomer), headers, conn)
		util.closeHttpConnection(conn)

		hResponse = json.loads(response)

		hStatus["statuscode"] = hResponse["statuscode"]
		hStatus["statusmessage"] = hResponse["message"]		

		if (hResponse["statuscode"] == 0):
			hStatus["id"] = hResponse["data"]["customer"]["id"]
			hStatus["code"] = hResponse["data"]["customer"]["code"]
			hStatus["name"] = hResponse["data"]["customer"]["name"]

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
		hStatus["statuscode"] = hResponse

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

def api_UpdatePaidCustomerBills (guid, sessionid):

	hStatus = {}

	try:

		headers = {}
		headers["Authorization"] = "Bearer " + sessionid
		headers["Content-type"] = "application/json"

		conn = util.getHttpConnection(config.SIMPLY_URL)
		response = util.invokeHttpMethod("PUT", "/api/customerbills/" + guid, '', headers, conn)

		util.closeHttpConnection(conn)

		# loading response
		hResponse = json.loads(response)

		# setting return status
		hStatus["statuscode"] = hResponse

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

# check if customer exist in remote system
def api_isCustomerExists(code, sessionid):

	hStatus = {}

	try:

		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/json", "Authorization": "Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("GET", '/api/customers/?code=' + str(code), '', headers, conn)
		util.closeHttpConnection(conn)

		# deserialize json
		hResponse = json.loads(response)

		# assign status code and message
		hStatus["statuscode"] = hResponse["statuscode"]
		hStatus["statusmessage"] = hResponse["message"]

		if (hStatus["statuscode"] == 0):
			if (len(hResponse["data"]["customerlist"]) > 0):
				hStatus["id"] = hResponse["data"]["customerlist"][0]["id"]
				hStatus["result"] = 1
				hStatus["response"] = hResponse["data"]["customerlist"][0] 
			else:
				hStatus["result"] = 0

		else:
			hStatus["result"] = -1

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


#===============================
# main program
#===============================
hPageStatus = {}
lBillStatus = []

try:

	# login to remote page to retrieve customers
	hLogin = userManager.login()

	if (hLogin["statuscode"] == 0):

		guid = util.generateRandomString(32)
		hCustomerHash = {}

		# get pending bills
		hPendingBillOutput = tally_getPendingBills()
		lRequest = []
		
		if (hPendingBillOutput["statuscode"] == 0):
			for customerBill in hPendingBillOutput["response"]:

				print("Processing for customer " + customerBill)

				try:
					customer = hCustomerHash[customerBill]
				except Exception as error:
					customer = -1

				if(customer == -1):

					hCustomerStatus = tally_getLedgerByName(customerBill)

					hCustomerHash[customerBill] = {}

					if(hCustomerStatus["statuscode"] != 0):
						hCustomerHash[customerBill]['code'] = -1
					elif(hCustomerStatus["response"]["code"] == ''):
						hCustomerHash[customerBill]['code'] = ''
					else:
						customer = hCustomerStatus["response"]

						# hCustomer = api_isCustomerExists(customer['code'], hLogin["sessionid"])
						# customer = hCustomer["response"]
						hCustomerHash[customerBill] = customer
					
				customer = hCustomerHash[customerBill]

				if(customer['code'] == -1):
					print(customerBill + " : " + "No Ledger Found in Tally")
				elif(customer['code'] == ''):
					print("Customer " + customerBill + " not found in Simply")
				else:		
					#creatependingbills
					hRequest = {}
					hRequest["guid"] = guid
					hRequest["code"] = customer["code"]
					hRequest["name"] = customer["name"]
					hRequest["billlist"] = hPendingBillOutput["response"][customerBill]

					# we want to send only one customer request at a time so initalizig Request list								
					# print("Total Bills to be posted: " + str(len(lRequest)))
					hStatus = api_createPendingBills(hRequest, hLogin["sessionid"])
					hPageStatus[customerBill] = hStatus				

			print("Processing Completed")
			hPaidStatus = api_UpdatePaidCustomerBills(guid, hLogin["sessionid"])
			hPageStatus["paid_bills_status"] = hPaidStatus["statuscode"]

	else:

		# api login failed from remote url. Set the error at page level
		hPageStatus["statuscode"] =  hLogin["statuscode"]
		hPageStatus["statusmessage"] =  hLogin["statusmessage"]

	# writing to file
	f = open(config.LOG_FOLDER + "/" + strftime("%Y%m%d%H%M%S", gmtime()) + "_pending_bill_sync.txt", "w")
	f.write (json.dumps(hPageStatus, indent=4))
	f.close()

except Exception as error:

	hPageStatus["statuscode"] = -200
	hPageStatus["statusmessage"] = str(error)

	# writing to file
	f = open(config.LOG_FOLDER + "/" + strftime("%Y%m%d%H%M%S", gmtime()) + "_pending_bill_sync.txt", "w")
	f.write (str(error))
	f.close()

#print (json.dumps(hPageStatus, indent=4))
