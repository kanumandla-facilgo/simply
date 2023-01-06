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
				rem_mobile = ledger.find("UDFSIMPLYPAYMENTREMINDERMOBILE").text if ledger.find("UDFSIMPLYPAYMENTREMINDERMOBILE") != None else ""
				rem_email = ledger.find("UDFSIMPLYPAYMENTREMINDEREMAIL").text if ledger.find("UDFSIMPLYPAYMENTREMINDEREMAIL") != None else ""
				hCustomerObject["invoicing_name"] = ledger.find("MAILINGNAME.LIST/MAILINGNAME").text if ledger.find("MAILINGNAME.LIST/MAILINGNAME") != None else hCustomerObject["name"]
				hCustomerObject["gst_number"] = ledger.find("PARTYGSTIN").text if ledger.find("PARTYGSTIN") != None else ""
				hCustomerObject["gst_registration_type"] = ledger.find("GSTREGISTRATIONTYPE").text if ledger.find("GSTREGISTRATIONTYPE") != None else ""
				hCustomerObject["cst_number"] = ledger.find("INTERSTATESTNUMBER").text if ledger.find("INTERSTATESTNUMBER") != None else ""
				hCustomerObject["vat_number"] = ledger.find("VATTINNUMBER").text if ledger.find("VATTINNUMBER") != None else ""
				hCustomerObject["pan_number"] = ledger.find("INCOMETAXNUMBER").text if ledger.find("INCOMETAXNUMBER") != None else ""

				# allowed balance
				hCustomerObject["allowed_balance"] = int(float(ledger.find("CREDITLIMIT").text)) if ledger.find("CREDITLIMIT") != None and ledger.find("CREDITLIMIT").text != None else 0
				balance = int(float(ledger.find("CLOSINGBALANCE").text)) if ledger.find("CLOSINGBALANCE") != None and ledger.find("CLOSINGBALANCE").text != None else 0 

				# handling address
				i = 0
				hCustomerObject["address"] = {}

				for address in ledger.findall("ADDRESS.LIST/ADDRESS"):

					i = i + 1
					if i == 3:
						hCustomerObject["address"]["city"] = address.text
					else:
						hCustomerObject["address"]["address" + str(i)] = address.text

				if ledger.find("LEDSTATENAME") != None and ledger.find("LEDSTATENAME").text != None:
					hCustomerObject["address"]["state"] = ledger.find("LEDSTATENAME").text

				if ledger.find("PINCODE") != None and ledger.find("PINCODE").text != None:
					hCustomerObject["address"]["zip"] = ledger.find("PINCODE").text

				if ledger.find("LEDGERCONTACT") != None and ledger.find("LEDGERCONTACT").text != None:
					pos = ledger.find("LEDGERCONTACT").text.find(" ")
					if (pos > -1):
						hCustomerObject["address"]["first_name"] = ledger.find("LEDGERCONTACT").text[0:pos]
						hCustomerObject["address"]["last_name"] = ledger.find("LEDGERCONTACT").text[pos+1:]
					else:
						hCustomerObject["address"]["first_name"] = ledger.find("LEDGERCONTACT").text

				hCustomerObject["address"]["phone1"] = ledger.find("LEDGERMOBILE").text if ledger.find("LEDGERMOBILE") != None and ledger.find("LEDGERMOBILE").text != None else ""
				hCustomerObject["address"]["email1"] = ledger.find("EMAIL").text if ledger.find("EMAIL") != None and ledger.find("EMAIL").text != None else ""
				hCustomerObject["address"]["phone2"] = ledger.find("LEDGERPHONE").text if ledger.find("LEDGERPHONE") != None and ledger.find("LEDGERPHONE").text != None else ""

				hCustomerObject["notifications"] = []

				pr = {}
				pr["notification_type_id"] = 5803
				if rem_mobile != '' or rem_email != '':
					pr["active"] = 1					
					pr["phone_number"] = rem_mobile
					pr["emails"] = rem_email
				else:
					pr["active"] = 0

				orn = {}
				orn["notification_type_id"] = 5801
				orn["active"] = 0

				hCustomerObject["notifications"].append(pr)
				hCustomerObject["notifications"].append(orn)

				# default values
				hCustomerObject["description"] = "Synced from accounting system"
				hCustomerObject["taxform_flag"] = 0
				hCustomerObject["statusid"] = 4600
				hCustomerObject["current_balance"] = int(float(balance)) * -1
				hCustomerObject["current_overdue"] = 0

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
		# get pending bills
		hPendingBillOutput = tally_getPendingBills()
		print("Pending Bills retrieved : " + str(len(hPendingBillOutput["response"])))
		lRequest = []

		if (hPendingBillOutput["statuscode"] == 0):
			for customerBill in hPendingBillOutput["response"]:
				
				print("Processing for customer: " + customerBill)
				hCustomerStatus = tally_getLedgerByName(customerBill)

				if(hCustomerStatus["statuscode"] == 0):
					customer = hCustomerStatus["response"]

					hCustomer = api_isCustomerExists(customer['code'], hLogin["sessionid"])
				
					if(hCustomer["result"] == 1):
						hExistingCustomer = hCustomer["response"]
						customer["id"] = hExistingCustomer["id"]
						customer["address"]["id"] = hExistingCustomer["address"]["id"]
						customer["bill_address"] = {}
						customer["bill_address"]["id"] = hExistingCustomer["bill_address"]["id"]
						customer["ship_address"] = {}
						customer["ship_address"]["id"] = hExistingCustomer["ship_address"]["id"]
						customer["sales_person"] = hExistingCustomer["sales_person"]
						customer["transporter"] = hExistingCustomer["transporter"]
						customer["agent"] = {}
						customer["agent"]["id"] = hExistingCustomer["agent"]["id"]
						customer["payment_term"] = hExistingCustomer["payment_term"]
						customer["custom_type_id"] = hExistingCustomer["custom_type_id"]
						customer["status_id"] = hExistingCustomer["status_id"]
						customer["sync_status_id"] = hExistingCustomer["sync_status_id"]
						customer["user"] = hExistingCustomer["user"]

						pr_ex = [n for n in hExistingCustomer["notifications"] if n["notification_type_id"] == 5803][0]
						pr = [n for n in customer["notifications"] if n["notification_type_id"] == 5803][0]
						pr["id"] = pr_ex["id"]

						or_ex = [n for n in hExistingCustomer["notifications"] if n["notification_type_id"] == 5801][0]
						orn = [n for n in customer["notifications"] if n["notification_type_id"] == 5801][0]
						orn["id"] = or_ex["id"]

						response = api_updateCustomer(customer, hLogin["sessionid"])
						hPageStatus[customerBill] = response
					else:
						response = api_createCustomer(customer, hLogin["sessionid"])
						if(response["statuscode"] == 0):
							customer["code"] = response["code"]
							customer["id"] = response["id"]
							customer["name"] = response["name"]
							tallyResponse = tally_updateCustomerCode(customer, hCustomerStatus["guid"])
						hPageStatus[customerBill] = response

					if((hPageStatus[customerBill]["statuscode"] == 0) and (customer["id"] > 0)):
						#creatependingbills
						hRequest = {}
						hRequest["guid"] = guid
						hRequest["code"] = customer["code"]
						hRequest["id"]   = customer["id"]
						hRequest["name"] = customer["name"]
						hRequest["billlist"] = hPendingBillOutput["response"][customerBill]

						# we want to send only one customer request at a time so initalizig Request list
						hStatus = api_createPendingBills(hRequest, hLogin["sessionid"])
						hPageStatus[customerBill] = hStatus
				else:
					hPageStatus[customerBill] = hCustomerStatus

			hPaidStatus = api_UpdatePaidCustomerBills(guid, hLogin["sessionid"])
			hPageStatus["paid_bills_status"] = hPaidStatus["statuscode"]

			print("Processing Completed")

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
a