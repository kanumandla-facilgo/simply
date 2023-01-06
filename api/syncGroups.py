import http.client
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

def tally_create_update_group(key, name, parent_name):

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
						<Group Action="Alter" Name=\"""" + escape(key) + """\">
							<NAME>""" +  escape(name) + """</NAME>
							<PARENT>""" + escape(parent_name) + """</PARENT>
						</StockGroup>
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
		hStatus["statuscode"] = -201
		hStatus["statusmessage"] = str(error)

	return hStatus

	return

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
		hStatus["statusmessage"] = "Tally category group response parse error!"

	return hStatus

# get all customer types
def api_getAgents(sessionid):

	try:

		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/json", "Authorization": "Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("GET", '/api/agents?sortby=id&sortorder=asc&page_size=99999999', '', headers, conn)
		util.closeHttpConnection(conn)

		# deserialize json
		hResponse = json.loads(response)
		# iterate hash
		if (hResponse["statuscode"] == 0):
			for agent in hResponse["data"]["agentlist"]:
				agent["parent_name"] = agent["sales_person"]["name"]
				lAgent.append(agent)
				lSalesPerson.append(agent["sales_person"])

		return lAgent

	except (http.client.HTTPException, http.client.NotConnected) as error:
		return -105

	except timeout:
		return -106

	except Exception as error:
		return -200


#===============================
# main program
#===============================
hPageStatus = []

lSalesPerson = []
lAgent = []

try:

	# login to remote page to retrieve customers
	hLogin = userManager.login()

	if (hLogin["statuscode"] == 0):

		# get categories
		api_getAgents(hLogin["sessionid"])
		
		for sp in lSalesPerson:
			hResponse = tally_create_update_group(sp["accounting_key"], sp["name"], 'Sundry Debtors')
			hResponse["id"] = sp["id"]
			hResponse["type"] = "sales_person"
			hResponse["name"] = sp["name"]
			hPageStatus.append(hResponse)

		for agent in lAgent:
			hResponse = tally_create_update_group(agent["accounting_key"], agent["parent_name"], '')
			hResponse["id"] = agent["id"]
			hResponse["type"] = "agent"
			hResponse["parent_name"] = agent["parent_name"]
			hResponse["name"] = agent["name"]
			hPageStatus.append(hResponse)

	# writing to file
	f = open(config.LOG_FOLDER + "/" + strftime("%Y%m%d%H%M%S", gmtime()) + "_agent_sync.txt", "w")
	f.write (json.dumps(hPageStatus, indent=4))
	f.close()
	
except Exception as error:
	hPageStatus["statuscode"] = -200
	hPageStatus["statusmessage"] = str(error)

	# writing to file
	f = open(config.LOG_FOLDER + "/" + strftime("%Y%m%d%H%M%S", gmtime()) + "_agent_sync.txt", "w")
	f.write (str(error))
	f.close()