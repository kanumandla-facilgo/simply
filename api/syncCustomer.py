import http.client
import html
import json
import xml.etree.ElementTree as ET
import os
import uuid
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

def getDefaultUser(customer):
	user = {"first_name":"Admin","last_name":"Account","email":"","password":"Password0!","gender":"","id":-1,"login_name":str(uuid.uuid4()).replace("-","")[:16]}
	return user

def api_createAgent(agent_name, sessionid):

	hStatus = {}
	hAgent1 = {};
	hAgent1["agent"] = {};
	hAgent1["agent"]["name"] = agent_name
	hAgent1["agent"]["accounting_name"] = agent_name
	hAgent1["agent"]["sales_person"] = {}
	hAgent1["agent"]["sales_person"]["id"] = 0

	try:

		headers = {"Content-type": "application/json", "Accept": "text/json", "Authorization":"Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("POST", '/api/agents/', json.dumps(hAgent1), headers, conn)
		util.closeHttpConnection(conn)

		hResponse = json.loads(response)
		hStatus["statuscode"] = hResponse["statuscode"]
		hStatus["statusmessage"] = hResponse["message"]

		if (hResponse["statuscode"] == 0):
			hStatus["id"] = hResponse["data"]["agent"]["id"]

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


def api_createCustomer(customer, sessionid):

	hStatus = {}

	try:

		headers = {"Content-type": "application/json", "Accept": "text/json", "Authorization":"Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("POST", '/api/customers/', json.dumps(customer), headers, conn)
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


def api_updateCustomer(customer, sessionid):

	hStatus = {}

	try:

		headers = {"Content-type": "application/json", "Accept": "text/json", "Authorization":"Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("PUT", '/api/customers/' + str(customer["customer"]["id"]), json.dumps(customer), headers, conn)
		util.closeHttpConnection(conn)

		hResponse = json.loads(response)

		hStatus["statuscode"] = hResponse["statuscode"]
		hStatus["statusmessage"] = hResponse["message"]
		
		if (hStatus["statuscode"] == 0):
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

def tally_getAllCustomers():

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
		 						<NATIVEMETHOD>GUID</NATIVEMETHOD>
		                    	<NATIVEMETHOD>NAME</NATIVEMETHOD>
		                        <NATIVEMETHOD>Address</NATIVEMETHOD>
		                        <NATIVEMETHOD>LEDSTATENAME</NATIVEMETHOD>
		                        <NATIVEMETHOD>PARENT</NATIVEMETHOD>
		                        <NATIVEMETHOD>MAILINGNAME</NATIVEMETHOD>
		                        <NATIVEMETHOD>PINCODE</NATIVEMETHOD>
		                        <NATIVEMETHOD>LEDGERCONTACT</NATIVEMETHOD>
		                        <NATIVEMETHOD>LEDGERMOBILE</NATIVEMETHOD>
		                        <NATIVEMETHOD>LEDGERPHONE</NATIVEMETHOD>
		                        <NATIVEMETHOD>EMAIL</NATIVEMETHOD>
		                    	<NATIVEMETHOD>OpeningBalance</NATIVEMETHOD>
		                    	<NATIVEMETHOD>ClosingBalance</NATIVEMETHOD>
								<NATIVEMETHOD>BILLCREDITPERIOD</NATIVEMETHOD>
								<NATIVEMETHOD>CREDITLIMIT</NATIVEMETHOD>
								<NATIVEMETHOD>INCOMETAXNUMBER</NATIVEMETHOD>
								<NATIVEMETHOD>VATTINNUMBER</NATIVEMETHOD>
								<NATIVEMETHOD>INTERSTATESTNUMBER</NATIVEMETHOD>
								<NATIVEMETHOD>PARTYGSTIN</NATIVEMETHOD>
								<NATIVEMETHOD>GSTREGISTRATIONTYPE</NATIVEMETHOD>
								<NATIVEMETHOD>UDFSIMPLYTEXTILECUSTOMERCODE</NATIVEMETHOD>
								<NATIVEMETHOD>UDFSIMPLYTEXTILETRANSPORTERCODE</NATIVEMETHOD>
								<NATIVEMETHOD>UDFSIMPLYTEXTILECUSTOMERTYPECODE</NATIVEMETHOD>
		                    	<FILTERS>MYFILTER</FILTERS>
		 					</COLLECTION>
		                    <SYSTEM TYPE="Formulae" NAME="MYFILTER" ISMOIFY="NO" ISFIXED="NO" ISINTERNAL="NO">$_PrimaryGroup  = "Sundry Debtors"</SYSTEM>
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
		hStatus["statuscode"] = -200
		hStatus["statusmessage"] = str(error)

	return hStatus


def mapTallyLedgerToCustomerHash(ledger, customer, sessionid):

	hCustomer = {}
	hCustomer["warnings"] = []
	hCustomer["customer"] = {} if customer is None else customer

	hCustomerObject = hCustomer["customer"]

	hCustomerObject["name"] = ledger.attrib["NAME"]
	hCustomerObject["code"] = ledger.find("UDFSIMPLYTEXTILECUSTOMERCODE").text if ledger.find("UDFSIMPLYTEXTILECUSTOMERCODE") != None else ""
	hCustomerObject["invoicing_name"] = ledger.find("MAILINGNAME.LIST/MAILINGNAME").text if ledger.find("MAILINGNAME.LIST/MAILINGNAME") != None else hCustomerObject["name"]

	if (ledger.find("BILLCREDITPERIOD") != None and ledger.find("BILLCREDITPERIOD").text != ""):
		if ledger.find("BILLCREDITPERIOD").text.replace(" Days", "") in hPaymentTermSearch and str(hPaymentTermSearch[ledger.find("BILLCREDITPERIOD").text.replace(" Days", "")]) in hPaymentTerm:
			hCustomerObject["payment_term"] = hPaymentTerm[str(hPaymentTermSearch[ledger.find("BILLCREDITPERIOD").text.replace(" Days", "")])]
		else:
			hCustomer["warnings"].append("Matching Payment term not found in SimplyTextile.")
	else:
		hCustomer["warnings"].append("Payment term (Credit period) not found in accounting.")

	#if not "payment_term" in hCustomerObject:
		#raise Exception("Payment term for " + hCustomerObject["name"] + " not found.")
		# hCustomerObject["payment_term"] = lPaymentTerm[0]
	
	if (ledger.find("PARENT") != None and ledger.find("PARENT").text != ""):
		if ledger.find("PARENT").text in hAgentSearch and str(hAgentSearch[ledger.find("PARENT").text]["id"]) in hAgent:
			hCustomerObject["agent"] = hAgent[str(hAgentSearch[ledger.find("PARENT").text]["id"])]

	if not "agent" in hCustomerObject or ("agent" in hCustomerObject and hCustomerObject["agent"]["name"] != ledger.find("PARENT").text):
		hAgentResponse = api_createAgent(ledger.find("PARENT").text, sessionid)
		if (hAgentResponse["statuscode"] == 0):
			hCustomerObject["agent"] = api_getAgent(hAgentResponse["id"], sessionid)
		else:
			raise Exception ("Agent not found.")

	hCustomerObject["sales_person"] = hCustomerObject["agent"]["sales_person"]

	hCustomerObject["gst_number"] = ledger.find("PARTYGSTIN").text if ledger.find("PARTYGSTIN") != None else ""
	hCustomerObject["gst_registration_type"] = ledger.find("GSTREGISTRATIONTYPE").text if ledger.find("GSTREGISTRATIONTYPE") != None else ""
	hCustomerObject["cst_number"] = ledger.find("INTERSTATESTNUMBER").text if ledger.find("INTERSTATESTNUMBER") != None else ""
	hCustomerObject["vat_number"] = ledger.find("VATTINNUMBER").text if ledger.find("VATTINNUMBER") != None else ""
	hCustomerObject["pan_number"] = ledger.find("INCOMETAXNUMBER").text if ledger.find("INCOMETAXNUMBER") != None else ""

	# allowed balance
	hCustomerObject["allowed_balance"] = int(float(ledger.find("CREDITLIMIT").text)) if ledger.find("CREDITLIMIT") != None and ledger.find("CREDITLIMIT").text != None else 0

	# handling address
	i = 0
	if customer is None:
		hCustomerObject["address"] = {}

	for address in ledger.findall("ADDRESS.LIST/ADDRESS"):

		i = i + 1
		if i == 3:
			hCustomerObject["address"]["city"] = address.text
		else:
			hCustomerObject["address"]["address" + str(i)] = address.text

	if ledger.find("LEDSTATENAME") != None and ledger.find("LEDSTATENAME").text != None:
		hCustomerObject["address"]["state"] = ledger.find("LEDSTATENAME").text
	else:

		if not "state" in hCustomerObject["address"]:
			raise Exception("State not found for " + hCustomerObject["name"])


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

	if customer is None:

		hCustomerObject["ship_address"] = hCustomerObject["address"]
		hCustomerObject["bill_address"] = hCustomerObject["address"]

		# default values
		hCustomerObject["description"] = "Synced from accounting system"
		hCustomerObject["taxform_flag"] = 0
		hCustomerObject["statusid"] = 4600
		hCustomerObject["current_balance"] = 0
		hCustomerObject["current_overdue"] = 0

	else:

		hCustomerObject["ship_address"]["address1"] = hCustomerObject["address"]["address1"]
		hCustomerObject["ship_address"]["address2"] = hCustomerObject["address"]["address2"]
		hCustomerObject["bill_address"]["address1"] = hCustomerObject["address"]["address1"]
		hCustomerObject["bill_address"]["address2"] = hCustomerObject["address"]["address2"]

	customertypecode = ""
	if ledger.find("UDFSIMPLYTEXTILECUSTOMERTYPECODE") != None:
		customertypecode = ledger.find("UDFSIMPLYTEXTILECUSTOMERTYPECODE").text

		if (customertypecode != ""):
			hCustomerObject["custom_type_id"] = int(customertypecode)

	if (customertypecode == ""):
		hCustomer["warnings"].append("Customer type not found in accounting.")

	if (customer is None and not "custom_type_id" in hCustomerObject) :
		hCustomerObject["custom_type_id"] = lCustomerType[0]["id"]
		hCustomer["warnings"].append("Customer type not found in accounting. So first customer type used.")

	if ledger.find("UDFSIMPLYTEXTILETRANSPORTERCODE") != None:
		transportercode = ledger.find("UDFSIMPLYTEXTILETRANSPORTERCODE").text
		if (transportercode != ""):
			hCustomerObject["transporter"] = hTransporterSearch[str(ledger.find("UDFSIMPLYTEXTILETRANSPORTERCODE").text)]

	if (customer is None and not "transporter" in hCustomerObject) :
		hCustomerObject["transporter"] = lTransporter[0]
		hCustomer["warnings"].append("Transporter not found in accounting. So first transporter used.")

	return hCustomer

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

# get all payment terms
def api_getPaymentTerms(sessionid):

	try:

		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/json", "Authorization": "Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("GET", '/api/paymentterms/?activeonly=1', '', headers, conn)
		util.closeHttpConnection(conn)

		# deserialize json
		hResponse = json.loads(response)

		# iterate hash
		if (hResponse["statuscode"] == 0):
			for paymentterm in hResponse["data"]["paymenttermlist"]:
				hPaymentTermSearch[str(paymentterm["days"])] = paymentterm["id"]
				hPaymentTerm[str(paymentterm["id"])] = paymentterm
				lPaymentTerm.append(paymentterm)

		return 0

	# except (urllib.error.HTTPError, urllib.error.URLError) as error:
	except (http.client.HTTPException, http.client.NotConnected) as error:
		return -105

	except timeout:
		return -106

	except Exception as error:
		return -200


# get all agents
def api_getAgents(sessionid):

	try:

		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/json", "Authorization": "Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("GET", '/api/agents', '', headers, conn)
		util.closeHttpConnection(conn)

		# deserialize json
		hResponse = json.loads(response)

		# iterate hash
		if (hResponse["statuscode"] == 0):
			for agent in hResponse["data"]["agentlist"]:
				hAgentSearch[agent["accounting_name"]] = {"id": agent["id"], "sales_person_id": agent["sales_person"]["id"]}
				hAgent[str(agent["id"])] = agent
				lAgent.append(agent)

		return 0

	except (http.client.HTTPException, http.client.NotConnected) as error:
		return -105

	except timeout:
		return -106

	except Exception as error:
		return -200

# get all agents
def api_getAgent(id, sessionid):
	agent = {}
	try:

		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/json", "Authorization": "Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("GET", '/api/agents/' + str(id), '', headers, conn)
		util.closeHttpConnection(conn)

		# deserialize json
		hResponse = json.loads(response)

		# iterate hash
		if (hResponse["statuscode"] == 0):
			agent = hResponse["data"]["agent"]
			hAgentSearch[agent["accounting_name"]] = {"id": agent["id"], "sales_person_id": agent["sales_person"]["id"]}
			hAgent[str(agent["id"])] = agent
			lAgent.append(agent)

		return agent

	except (http.client.HTTPException, http.client.NotConnected) as error:
		return -105

	except timeout:
		return -106

	except Exception as error:
		return -200


# get all transporters
def api_getTransporters(sessionid):

	try:

		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/json", "Authorization": "Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("GET", '/api/transporters/?activeonly=1', '', headers, conn)
		util.closeHttpConnection(conn)

		# deserialize json
		hResponse = json.loads(response)

		# iterate hash
		if (hResponse["statuscode"] == 0):
			for transporter in hResponse["data"]["transporterlist"]:
				hTransporterSearch[str(transporter["code"])] = transporter
				lTransporter.append(transporter)

		return 0

	# except (urllib.error.HTTPError, urllib.error.URLError) as error:
	except (http.client.HTTPException, http.client.NotConnected) as error:
		return -105

	except timeout:
		return -106

	except Exception as error:
		return -200


# get all customer types
def api_getCustomerTypes(sessionid):

	try:

		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/json", "Authorization": "Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("GET", '/api/companytypes', '', headers, conn)
		util.closeHttpConnection(conn)

		# deserialize json
		hResponse = json.loads(response)

		# iterate hash
		if (hResponse["statuscode"] == 0):
			for customertype in hResponse["data"]["companytypelist"]:
				hCustomerTypeSearch[str(customertype["id"])] = customertype
				lCustomerType.append(customertype)

		return 0

	except (http.client.HTTPException, http.client.NotConnected) as error:
		return -105

	except timeout:
		return -106

	except Exception as error:
		return -200


def api_createUpdateCustomer(ledgerList, sessionid):

	hStatus = {}

	try:
		lOutput = []

		for ledger in ledgerList:

			try:
				code = ledger.find("UDFSIMPLYTEXTILECUSTOMERCODE").text if ledger.find("UDFSIMPLYTEXTILECUSTOMERCODE") != None else ""
				guid = ledger.find("GUID").text

				if(code != ''):			
					hCustomerStatus = api_isCustomerExists(ledger.find("UDFSIMPLYTEXTILECUSTOMERCODE").text, sessionid)
				else:
					hCustomerStatus = {}
					hCustomerStatus["statuscode"] = 0
					hCustomerStatus["result"] = 0

				if (hCustomerStatus["statuscode"] == 0):
					if (hCustomerStatus["result"] == 1):
						customer       = mapTallyLedgerToCustomerHash(ledger, hCustomerStatus["response"], sessionid)
						hCustomerStatus = api_updateCustomer(customer, sessionid)
					else:
						customer       = mapTallyLedgerToCustomerHash(ledger, None, sessionid)
						customer["user"] = getDefaultUser(customer)
						hCustomerStatus = api_createCustomer(customer, sessionid)
					hCustomerStatus["warnings"] = customer["warnings"]
				
			except Exception as error:
				hCustomerStatus["statuscode"] = -201
				hCustomerStatus["statusmessage"] = str(error)
				hCustomerStatus["code"] = ledger.find("UDFSIMPLYTEXTILECUSTOMERCODE").text if ledger.find("UDFSIMPLYTEXTILECUSTOMERCODE") != None else ""

			# add into output list
			lOutput.append(hCustomerStatus)

		hStatus["statuscode"] = 0
		hStatus["response"] = lOutput

	except Exception as error:
		hStatus["statuscode"] = -105
		hStatus["statusmessage"] = str(error)
		hStatus["response"] = []

	return hStatus


def parseTallyResponse (response):

	hStatus = {}

	try:
		response = html.unescape(response)
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


#===============================
# main program
#===============================
hPageStatus = {}

hAgent = {}
hAgentSearch = {}
hPaymentTerm = {}
hPaymentTermSearch = {}
hTransporterSearch = {}
hCustomerTypeSearch = {}

lTransporter = []
lCustomerType = []
lPaymentTerm = []
lAgent = []


try:

	# login to remote page to retrieve customers
	hLogin         = userManager.login()

	if (hLogin["statuscode"] == 0):

		# get payment terms
		api_getPaymentTerms(hLogin["sessionid"])

		# get agents
		api_getAgents(hLogin["sessionid"])

		# get transporters
		api_getTransporters(hLogin["sessionid"])

		if (len(lTransporter) == 0):
			raise Exception("No transporter found. You must create on transporter to sync data.")

		# get customer types
		api_getCustomerTypes(hLogin["sessionid"])

		# get customer list from remote page
		hCustomerOutput = tally_getAllCustomers()

		if (hCustomerOutput["statuscode"] == 0):

			# get customer list from output
			lCustomerList = hCustomerOutput["response"]

			if (len(lCustomerList) > 0):

				# create or update customers in Tally
				response = api_createUpdateCustomer(lCustomerList, hLogin["sessionid"])

				# return the page level response
				hPageStatus["statuscode"] = 0
				hPageStatus["statusmessage"] = "Success"
				hPageStatus["response"]  = response["response"]

			else:
				hPageStatus["statuscode"] = 0
				hPageStatus["statusmessage"] = "Success"
				hPageStatus["response"] = []

		else:

			hPageStatus["statuscode"] = hCustomerOutput["statuscode"]
			hPageStatus["statusmessage"] = hCustomerOutput["statusmessage"]
			hPageStatus["response"] = []

	else:

		# api login failed from remote url. Set the error at page level
		hPageStatus["statuscode"] =  hLogin["statuscode"]
		hPageStatus["statusmessage"] =  hLogin["statusmessage"]

	# writing to file
	f = open(config.LOG_FOLDER + "/" + strftime("%Y%m%d%H%M%S", gmtime()) + "_customer_sync.txt", "w")
	f.write (json.dumps(hPageStatus, indent=4))
	f.close()

except Exception as error:

	hPageStatus["statuscode"] = -200
	hPageStatus["statusmessage"] = str(error)

	# writing to file
	f = open(config.LOG_FOLDER + "/" + strftime("%Y%m%d%H%M%S", gmtime()) + "_customer_sync.txt", "w")
	f.write (str(error))
	f.close()

print (json.dumps(hPageStatus, indent=4))
