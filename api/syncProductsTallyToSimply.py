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

def tally_getAllProducts():

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
							<COLLECTION NAME="Collection of StockItem" ISMODIFY="No" ISFIXED="No" ISINITIALIZE="No" ISOPTION="No" ISINTERNAL="No">
		 						<TYPE>StockItem</TYPE>
		 						<NATIVEMETHOD>GUID</NATIVEMETHOD>
		                    	<NATIVEMETHOD>NAME</NATIVEMETHOD>
                                <NATIVEMETHOD>PARENT</NATIVEMETHOD>
		                    	<NATIVEMETHOD>BASEUNITS</NATIVEMETHOD>
                                <NATIVEMETHOD>ADDITIONALUNITS</NATIVEMETHOD>
		                    	<NATIVEMETHOD>GSTREPUOM</NATIVEMETHOD>
                                <NATIVEMETHOD>ISBATCHWISEON</NATIVEMETHOD>
		                    	<NATIVEMETHOD>DENOMINATOR</NATIVEMETHOD>
                                <NATIVEMETHOD>CONVERSION</NATIVEMETHOD>
		                    	<NATIVEMETHOD>OPENINGBALANCE</NATIVEMETHOD>
                                <NATIVEMETHOD>GSTAPPLICABLE</NATIVEMETHOD>
		                    	<NATIVEMETHOD>GSTDETAILS.LIST</NATIVEMETHOD>
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
		response = response.decode("utf-8").replace("`", "").replace("UDF:", "")

		# parse tally response
		hStatus = parseTallyStockItemResponse(response)

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

def parseTallyStockItemResponse (response):

	hStatus = {}

	try:
		response = html.unescape(response)
		parser = ET.XMLParser(encoding="utf-8")
		root = ET.fromstring(response, parser=parser)

		status_node = root.find("HEADER/STATUS")

		if (status_node.text == "1"):

			lProductList = []
			for product in root.findall("BODY/DATA/COLLECTION/STOCKITEM"):
				lProductList.append(product)

			hStatus["statuscode"] = 0
			hStatus["statusmessage"] = "Success"
			hStatus["response"] = lProductList

		else:
			hStatus["statuscode"] = -200
			hStatus["statusmessage"] = root.find("BODY/DATA/LINEERROR").text

	except Exception as error:
		hStatus["statuscode"] = -105
		hStatus["statusmessage"] = "Tally product response parse error!" + str(error)

	return hStatus


def api_createUpdateCustomer(productList, sessionid):

	hStatus = {}

	try:
		lOutput = []

		for stockitem in productList:

			try:
				if (hCustomerStatus["statuscode"] == 0):
					product = mapTallyStockItemToProductHash(stockitem, None, sessionid)
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

def mapToHsnXml(product_hsn):
	hsn_xml = ""
	hsn_details = {}
	hsn_details = product_hsn["details"]

	if(len(hsn_details) > 1):
		calculation_type = 1
		hsn_xml = "<CALCULATIONTYPE>On Item Rate</CALCULATIONTYPE>"
	else:
		calculation_type = 2
		hsn_xml = "<CALCULATIONTYPE>On Value</CALCULATIONTYPE>"

	hsn_xml = hsn_xml + "<APPLICABLEFROM>20170701</APPLICABLEFROM>" 
	hsn_xml = hsn_xml + "<HSNCODE>" + str(product_hsn["code"]) + "</HSNCODE>" 
	hsn_xml = hsn_xml + "<HSN>" + product_hsn["name"] + "</HSN>" 
	hsn_xml = hsn_xml + "<TAXABILITY>Taxable</TAXABILITY>"
	hsn_xml	= hsn_xml + "<STATEWISEDETAILS.LIST>"
	hsn_xml	= hsn_xml + "<STATENAME>&#4; Any</STATENAME>"

	for hsn_detail in hsn_details:
		if(calculation_type == 1):
			hsn_xml	= hsn_xml + "<GSTSLABRATES.LIST>"
			hsn_xml = hsn_xml + "<TAXABILITY>Taxable</TAXABILITY>"
			if(hsn_detail["amount_max"] != None):
				hsn_xml = hsn_xml + "<TOITEMRATE>" + str(round(hsn_detail["amount_max"])) + "</TOITEMRATE>"
		hsn_xml = hsn_xml + "<RATEDETAILS.LIST><GSTRATEDUTYHEAD>Cess</GSTRATEDUTYHEAD><GSTRATEVALUATIONTYPE>Based on Value</GSTRATEVALUATIONTYPE></RATEDETAILS.LIST>"

		hsn_xml = hsn_xml + getGSTRateDetalList("Central Tax", hsn_detail["percent_cgst"])
		hsn_xml = hsn_xml + getGSTRateDetalList("State Tax", hsn_detail["percent_sgst"])
		hsn_xml = hsn_xml + getGSTRateDetalList("Integrated Tax", hsn_detail["percent_igst"])
		 
		if(calculation_type == 1):
			hsn_xml = hsn_xml + "</GSTSLABRATES.LIST>"

	hsn_xml = hsn_xml + "</STATEWISEDETAILS.LIST>"

	return hsn_xml

def getGSTRateDetalList(rate_detail_name, value):
	xml = "<RATEDETAILS.LIST>" 
	xml = xml +	"<GSTRATEDUTYHEAD>" + rate_detail_name + "</GSTRATEDUTYHEAD>" 
	xml = xml +	"<GSTRATEVALUATIONTYPE>Based On Value</GSTRATEVALUATIONTYPE>" 
	xml = xml +	"<GSTRATE>" + str(value) + "</GSTRATE>" 
	xml = xml +	"</RATEDETAILS.LIST>"
	return xml

def parseTallyResponse (response, name):

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

	except Exception as error:
		hStatus["statuscode"] = -105
		hStatus["statusmessage"] = "Error occurred for " + name + " " + str(error)

	return hStatus

def api_updateProduct(product, sessionid):

	hStatus = {}
	hProduct = {}
	product["linkwith"] = None
	hProduct["product"] = product

	try:

		headers = {"Content-type": "application/json", "Accept": "text/json", "Authorization":"Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("PUT", '/api/products/' + str(hProduct["product"]["id"]), json.dumps(hProduct), headers, conn)
		util.closeHttpConnection(conn)

		hResponse = json.loads(response)

		hStatus["statuscode"] = hResponse["statuscode"]
		hStatus["statusmessage"] = hResponse["message"]
		
		if (hStatus["statuscode"] == 0):
			hStatus["id"] = hResponse["data"]["product"]["id"]
			hStatus["name"] = hResponse["data"]["product"]["name"]

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
		response = util.invokeHttpMethod("PUT", '/api/categories/' + str(category["id"]), json.dumps(category), headers, conn)
		util.closeHttpConnection(conn)

		hResponse = json.loads(response)

		hStatus["statuscode"] = hResponse["statuscode"]
		hStatus["statusmessage"] = hResponse["message"]
		
		if (hStatus["statuscode"] == 0):
			hStatus["id"] = hResponse["data"]["category"]["id"]
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

# get all customer types
def api_getHsn(id, sessionid):

	try:
		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/json", "Authorization": "Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("GET", '/api/hsn/' + str(id), '', headers, conn)
		util.closeHttpConnection(conn)
		# deserialize json
		hResponse = json.loads(response)
		
		# iterate hash
		if (hResponse["statuscode"] == 0):
			hHsnSearch[hResponse["data"]["hsn"]["id"]] = hResponse["data"]["hsn"]

		return hHsnSearch[hResponse["data"]["hsn"]["id"]]

	except (http.client.HTTPException, http.client.NotConnected) as error:
		return -105

	except timeout:
		return -106

	except Exception as error:
		return -200

# get all customer types
def api_getCategories(sessionid):

	try:
		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/json", "Authorization": "Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("GET", '/api/categories?sortby=id&sortorder=asc', '', headers, conn)
		util.closeHttpConnection(conn)

		# deserialize json
		hResponse = json.loads(response)

		# iterate hash
		if (hResponse["statuscode"] == 0):
			for category in hResponse["data"]["categorylist"]:
				hCategorySearch[category["id"]] = category
				lCategory.append(category)

		return lCategory

	except (http.client.HTTPException, http.client.NotConnected) as error:
		return -105

	except timeout:
		return -106

	except Exception as error:
		return -200

# get all products
def api_getUOMConversion(product, sessionid):

	from_uom_id = product["default_qty_uom"]["id"]
	to_uom_id = product["uom_id"]
	try:
		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/json", "Authorization": "Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("GET", '/api/unitconversions/' + str(from_uom_id) + '?from=' + str(from_uom_id) + '&to=' + str(to_uom_id), '', headers, conn)
		util.closeHttpConnection(conn)
		# deserialize json
		hResponse = json.loads(response)

		# iterate hash
		if (hResponse["statuscode"] == 0):
			return hResponse["data"]["uomconversion"]
		else:
			return {}

	except (http.client.HTTPException, http.client.NotConnected) as error:
		return -105

	except timeout:
		return -106

	except Exception as error:
		return -200


# get all products
def api_getProducts(categoryid, sessionid):

	try:
		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/json", "Authorization": "Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)		
		response = util.invokeHttpMethod("GET", '/api/products/category/' + str(categoryid) + '?sync_status_id=4100', '', headers, conn)
		util.closeHttpConnection(conn)
		# deserialize json
		hResponse = json.loads(response)
		
		# iterate hash
		if (hResponse["statuscode"] == 0):
			for product in hResponse["data"]["productlist"]:
				if (product["uom_id"] != product["default_qty_uom"]["id"]):
					product_uom_conversion_detail = api_getUOMConversion(product, sessionid)
					product["uom_conversion_detail"] = product_uom_conversion_detail
				lProduct.append(product)

		return lProduct

	except (http.client.HTTPException, http.client.NotConnected) as error:
		return -105

	except timeout:
		return -106

	except Exception as error:
		return -200


#===============================
# main program
#===============================
hPageStatus = {}

try:

	# login to remote page to retrieve customers
	hLogin = userManager.login()
	sessionid = hLogin["sessionid"]

	if (hLogin["statuscode"] == 0):

		# get product list from remote page
		hStockItemOutput = tally_getAllProducts()

		if (hStockItemOutput["statuscode"] == 0):

			# get product list from output
			lStockItemList = hStockItemOutput["response"]

			if (len(lStockItemList) > 0):

				# create or update products in Tally
				response = api_createUpdateProduct(lStockItemList, hLogin["sessionid"])

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

	# writing to file
	f = open(config.LOG_FOLDER + "/" + strftime("%Y%m%d%H%M%S", gmtime()) + "_product_sync.txt", "w")
	f.write (json.dumps(hPageStatus, indent=4))
	f.close()
	
except Exception as error:
	hPageStatus["statuscode"] = -200
	hPageStatus["statusmessage"] = str(error)

	# writing to file
	f = open(config.LOG_FOLDER + "/" + strftime("%Y%m%d%H%M%S", gmtime()) + "_product_sync.txt", "w")
	f.write (str(error))
	f.close()