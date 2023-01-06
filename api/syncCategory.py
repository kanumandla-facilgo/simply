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



def getDefaultUser(customer):
	user = {"first_name":"Admin","last_name":"Account","email":"","password":"Password0!","gender":"","id":-1,"login_name":str(uuid.uuid4()).replace("-","")[:16]}
	return user

def api_createCategory(category, sessionid):

	hStatus = {}

	try:

		headers = {"Content-type": "application/json", "Accept": "text/json", "Authorization":"Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("POST", '/api/categories/', json.dumps(category), headers, conn)
		util.closeHttpConnection(conn)

		hResponse = json.loads(response)

		hStatus["statuscode"] = hResponse["statuscode"]
		hStatus["statusmessage"] = hResponse["message"]

		hStatus["code"] = category["category"]["code"]
		hStatus["name"] = category["category"]["name"]

		if (hResponse["statuscode"] == 0):
			hStatus["id"] = hResponse["data"]["category"]["id"]

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


def api_updateCategory(category, sessionid):

	hStatus = {}

	try:

		headers = {"Content-type": "application/json", "Accept": "text/json", "Authorization":"Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("PUT", '/api/categories/' + str(category["category"]["id"]), json.dumps(category), headers, conn)
		util.closeHttpConnection(conn)

		hResponse = json.loads(response)

		hStatus["statuscode"] = hResponse["statuscode"]
		hStatus["statusmessage"] = hResponse["message"]

		hStatus["id"]   = hResponse["data"]["category"]["id"]
		hStatus["code"] = hResponse["data"]["category"]["code"]
		hStatus["name"] = hResponse["data"]["category"]["name"]

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

def tally_getAllStockGroups():

	hStatus = {}

	try:

		values = """<ENVELOPE>
			<HEADER>
				<VERSION>1</VERSION>
				<TALLYREQUEST>EXPORT</TALLYREQUEST>
				<TYPE>COLLECTION</TYPE>
				<ID>Collection of StockGroups</ID>
			</HEADER>
			<BODY>
				<DESC>
					<STATICVARIABLES>
						<SVCURRENTCOMPANY>""" + escape(config.TALLY_COMPANY_NAME) + """</SVCURRENTCOMPANY>
					</STATICVARIABLES>
					<TDL>
						<TDLMESSAGE>
							<COLLECTION NAME="Collection of StockGroups" ISMODIFY="No" ISFIXED="No" ISINITIALIZE="No" ISOPTION="No" ISINTERNAL="No">
		 						<TYPE>Stock Group</TYPE>
		 						<NATIVEMETHOD>Parent</NATIVEMETHOD>
		 					</COLLECTION>
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
		response = response.decode("utf-8").replace("`", "").replace("UDF:", "").replace("&#4; Primary", "")

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


def mapTallyStockGroupToCategoryHash(stockGroup, category):

	name = category.attrib["NAME"]
	parentName = ""
	if (category.find("PARENT") != None and category.find("PARENT").text != ""):
		parentName = category.find("PARENT").text

	hCategory = {}
	hCategory["warnings"] = []
	hCategory["category"] = {} if category is None else category

	hCategory["category"]["name"] = name

	if (parentName in hCategorySearch):
		hCategory["category"]["parent_id"] = hCategorySearch[parentName]["id"]
	else:
		hCategory["category"]["parent_id"] = 0 if parentName = "" else 


	return hCategory

# get all customer types
def api_getCategories(sessionid):

	try:

		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/json", "Authorization": "Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("GET", '/api/categories', '', headers, conn)
		util.closeHttpConnection(conn)

		# deserialize json
		hResponse = json.loads(response)

		# iterate hash
		if (hResponse["statuscode"] == 0):
			for category in hResponse["data"]["categorylist"]:
				hCategorySearch[str(category["name"])] = category
				lCategory.append(category)

		return 0

	except (http.client.HTTPException, http.client.NotConnected) as error:
		return -105

	except timeout:
		return -106

	except Exception as error:
		return -200


def api_createUpdateCategory(categoryList, sessionid):

	hStatus = {}

	try:

		lOutput = []

		for category in categoryList:

			try:

				hCategoryStatus = api_isCategoryExists(category.find("NAME").text, sessionid)

				if (hCategoryStatus["statuscode"] == 0):
					if (hCategoryStatus["result"] == 1):
						category       = mapTallyStockGroupToCategoryHash(category, hCategoryStatus["response"])
						hCategoryStatus = api_updateCategory(category, sessionid)
					else:
						category       = mapTallyStockGroupToCategoryHash(category, None)
						category["user"] = getDefaultUser(category)
						hCategoryStatus = api_createCategory(category, sessionid)

					hCategoryStatus["warnings"] = category["warnings"]

			except Exception as error:
				hCategoryStatus["statuscode"] = -201
				hCategoryStatus["statusmessage"] = str(error)
				hCategoryStatus["code"] = category.find("NAME").text

			# add into output list
			lOutput.append(hCategoryStatus)

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

		root = ET.fromstring(response)
		status_node = root.find("HEADER/STATUS")

		if (status_node.text == "1"):

			lCategoryList = []
			for category in root.findall("BODY/DATA/COLLECTION/STOCKGROUP"):
				lCategoryList.append(category)

			hStatus["statuscode"] = 0
			hStatus["statusmessage"] = "Success"
			hStatus["response"] = lCategoryList


		else:
			hStatus["statuscode"] = -200
			hStatus["statusmessage"] = root.find("BODY/DATA/LINEERROR").text

	except Exception as error:
		hStatus["statuscode"] = -105
		hStatus["statusmessage"] = "Tally category response parse error!" + str(error)

	return hStatus


def buildCategoryTree (response):

	# get customer list from output
	lCategoryList = hStockGroupOutput["response"]

#===============================
# main program
#===============================
hPageStatus = {}

hStockGroupOutput = {}

hCategorySearch = {}
lCategory = []

try:

	# login to remote page to retrieve customers
	hLogin = userManager.login()

	if (hLogin["statuscode"] == 0):

		# get categories
		api_getCategories(hLogin["sessionid"])

		# get customer list from remote page
		hStockGroupOutput = tally_getAllStockGroups()

		if (hStockGroupOutput["statuscode"] == 0):

			hCategoryTree = buildCategoryTree(hStockGroupOutput["response"])

			# get customer list from output
			lCategoryList = hStockGroupOutput["response"]

			if (len(lCategoryList) > 0):

				# create or update customers in Tally
				# response = api_createUpdateCategory(lCategoryList, hLogin["sessionid"])

				# return the page level response
				hPageStatus["statuscode"] = 0
				hPageStatus["statusmessage"] = "Success"
				hPageStatus["response"]  = response["response"]

			else:
				hPageStatus["statuscode"] = 0
				hPageStatus["statusmessage"] = "Success"
				hPageStatus["response"] = []

		else:

			hPageStatus["statuscode"] = hStockGroupOutput["statuscode"]
			hPageStatus["statusmessage"] = hStockGroupOutput["statusmessage"]
			hPageStatus["response"] = []

	else:

		# api login failed from remote url. Set the error at page level
		hPageStatus["statuscode"] =  hLogin["statuscode"]
		hPageStatus["statusmessage"] =  hLogin["statusmessage"]

	# writing to file
	f = open(config.LOG_FOLDER + "/" + strftime("%Y%m%d%H%M%S", gmtime()) + "_category_sync.txt", "w")
	f.write (json.dumps(hPageStatus, indent=4))
	f.close()

except Exception as error:

	hPageStatus["statuscode"] = -200
	hPageStatus["statusmessage"] = str(error)

	# writing to file
	f = open(config.LOG_FOLDER + "/" + strftime("%Y%m%d%H%M%S", gmtime()) + "_category_sync.txt", "w")
	f.write (str(error))
	f.close()

print (json.dumps(hPageStatus, indent=4))
