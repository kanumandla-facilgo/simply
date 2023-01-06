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

def tally_create_update_category(category):

	hStatus = {}

	category["parent_name"] = hCategorySearch[category["parent_id"]]["name"] if (category["lineagename"] != "~Root~") else ''
		
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
						<StockGroup Action="Alter" Name=\"""" + escape(category["accounting_key"]) + """\">
							<NAME>""" +  escape(category["name"]) + """</NAME>
							<PARENT>""" + escape(category["parent_name"]) + """</PARENT>
							<ISADDABLE>Yes</ISADDABLE>
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

		hStatus = parseTallyResponse(response, category["name"])

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

def tally_create_update_product(product, updateOpeningBalance, isFirstTimeFlag):

	hStatus = {}
	product["accounting_key"] = "" if product["accounting_key"] == None else product["accounting_key"].replace('"','\\"')
	product["parent_name"] = hCategorySearch[product["category_id"]]["name"]
	product["is_batchwise_on"] = "Yes" if product["is_batched_inventory"] == 1 else "No"
	product["additional_uom_name"] = ""
	product["conversion"] = ""
	product["denominator"] = "";

	if ((product["uom_id"] != product["default_qty_uom"]["id"]) and bool(product["uom_conversion_detail"])):
		product["additional_uom_name"] = [n for n in product["uomlist"] if n["id"] == product["default_qty_uom"]["id"]][0]["short_name"]
		product["conversion"] = "1"
		product["denominator"] = product["uom_conversion_detail"]["to_qty"]
		if updateOpeningBalance and isFirstTimeFlag:
			product["opening_balance"] = ""
			product["opening_value"] = ""
			product["opening_rate"] = ""
		elif updateOpeningBalance:
			
			if product["stock_uom_quote"]["id"] != product["stock_uom_qty"]["id"]:
				product["opening_balance"] = str(product["quantity"]["stock_qty"]) + product["stock_uom_qty"]["short_name"] + "=" + str(product["quantity"]["stock_quote"]) + " " + product["uom_short_name"]
				if product["cost"] != None:			
					product["opening_rate"] = str(product["cost"]) + "/" + product["uom_short_name"]
					product["opening_value"] = product["cost"] * product["quantity"]["stock_quote"]
			else:
				product["opening_balance"] = str(product["quantity"]["stock_quote"]) + " " + product["uom_short_name"]
				if product["cost"] != None:		
					product["opening_rate"] = str(product["cost"]) + "/" + product["uom_short_name"]
					product["opening_value"] = product["cost"] * product["quantity"]["stock_quote"]
	else:
		if ((product["stock_uom_qty"]["id"] != product["stock_uom_quote"]["id"])):
			product["uom_conversion_detail"] = api_getUOMConversion(product["stock_uom_qty"]["id"], product["stock_uom_quote"]["id"], sessionid)
			product["additional_uom_name"] = product["stock_uom_quote"]["short_name"] if(product["uom_id"] == product["stock_uom_qty"]["id"]) else  product["stock_uom_qty"]["short_name"]
			product["conversion"] = str(product["uom_conversion_detail"]["to_qty"])
			product["denominator"] = "1"
		if updateOpeningBalance and isFirstTimeFlag:
			product["opening_balance"] = ""
			product["opening_value"] = ""
			product["opening_rate"] = ""
		elif updateOpeningBalance:
			product["opening_balance"] = str(product["quantity"]["stock_quote"]) + " " + product["uom_short_name"]
			if product["cost"] != None:		
				product["opening_rate"] = str(product["cost"]) + "/" + product["uom_short_name"]
				product["opening_value"] = product["cost"] * product["quantity"]["stock_quote"]
	
	hsn_xml = mapToHsnXml(product["hsn"])

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
						<StockItem Action="Alter" Name=\"""" + escape(product["accounting_key"]) + """\">
							<NAME>""" +  escape(product["name"]) + """</NAME>
							<PARENT>""" + escape(product["parent_name"]) + """</PARENT>
							<BASEUNITS>""" + escape(product["uom_short_name"]) + """</BASEUNITS>
							<ADDITIONALUNITS>""" + escape(product["additional_uom_name"]) + """</ADDITIONALUNITS>
							<GSTREPUOM>""" + escape(product["uom_description"]) + """</GSTREPUOM>
							<ISBATCHWISEON>""" + escape(product["is_batchwise_on"]) + """</ISBATCHWISEON>
							<DENOMINATOR>""" + str(product["denominator"]) + """</DENOMINATOR>
					  		<CONVERSION>""" + escape(product["conversion"]) + """</CONVERSION>"""
		if updateOpeningBalance:
			values += """<OPENINGBALANCE>""" + str(product["opening_balance"]) + """</OPENINGBALANCE>"""
			values += """<OPENINGRATE>""" + str(product["opening_rate"]) + """</OPENINGRATE>"""
			values += """<OPENINGVALUE>""" + str(product["opening_value"] * -1) + """</OPENINGVALUE>"""

		#<GSTDETAILS.LIST>""" + hsn_xml + """</GSTDETAILS.LIST>
		
		values +=  		"""<GSTAPPLICABLE>&#4; Applicable</GSTAPPLICABLE>					  		
						</StockItem>
					</TALLYMESSAGE>
				</DATA>
			</BODY>
			</ENVELOPE>"""
		
		data = values.encode('utf-8') # data should be bytes

		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/xml"}
		conn = util.getHttpConnection(config.TALLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("POST", '/', data, headers, conn)

		util.closeHttpConnection(conn)

		hStatus = parseTallyResponse(response, product["name"])

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
		response = util.invokeHttpMethod("GET", '/api/categories?sync_status_id=4100&sortby=id&sortorder=asc', '', headers, conn)
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
def api_getUOMConversion(from_uom_id, to_uom_id, sessionid):

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
def api_getProducts(sessionid):

	try:
		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/json", "Authorization": "Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)		
		response = util.invokeHttpMethod("GET", '/api/products?sync_status_id=4100', '', headers, conn)
		util.closeHttpConnection(conn)

		# deserialize json
		hResponse = json.loads(response)
		# iterate hash
		if (hResponse["statuscode"] == 0):
			for product in hResponse["data"]["productlist"]:
				if (product["uom_id"] != product["default_qty_uom"]["id"]):
					product_uom_conversion_detail =  api_getUOMConversion(product["default_qty_uom"]["id"], product["uom_id"], sessionid)
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
hPageStatus = []
hCategorySearch = {}
lCategory = []
lProduct = []
hHsnSearch = {}

try:

	# login to remote page to retrieve customers
	hLogin = userManager.login()
	sessionid = hLogin["sessionid"]
	updateOpeningBalance = config.ITEM_OPENING_BALANCE_SYNC

	if (hLogin["statuscode"] == 0):

		# get categories
		api_getCategories(sessionid)
		for category in lCategory:
			if(category["name"] != category["accounting_key"]):
				hResponse = tally_create_update_category(category)
				if (hResponse["statuscode"] == 0):
					hResponse["id"] = category["id"]
					hResponse["parent_name"] = category["parent_name"]
					hResponse["name"] = category["name"]

					category["accounting_key"] = category["name"]
					api_updateCategory(category, sessionid)
					hPageStatus.append(hResponse)

		lProduct = []
		p = api_getProducts(sessionid)
		for product in lProduct:
			print("Syncing Product " + product["name"])
			hsn_id = product["hsn"]["id"]
			if(hsn_id in hHsnSearch.keys()):
				product["hsn"] = hHsnSearch[hsn_id]
			else:
				product["hsn"] = api_getHsn(hsn_id, sessionid)

			if updateOpeningBalance:
				hPResponse = tally_create_update_product(product, 1, 1)
				hPResponse = tally_create_update_product(product, 1, 0)
			else:
				hPResponse = tally_create_update_product(product, 0, 0)
			print(hPResponse)
			if (hPResponse["statuscode"] == 0) or ("already exists" in hPResponse["statusmessage"]):
				hPResponse["id"] = product["id"]
				hPResponse["parent_name"] = product["parent_name"]
				hPResponse["name"] = product["name"]
				product["accounting_key"] = product["name"]
				product["sync_status_id"] = 4101
				hStatus = api_updateProduct(product, sessionid)

			hPageStatus.append(hPResponse)


	# writing to file
	f = open(config.LOG_FOLDER + "/" + strftime("%Y%m%d%H%M%S", gmtime()) + "_product_category_sync.txt", "w")
	f.write (json.dumps(hPageStatus, indent=4))
	f.close()
	
except Exception as error:
	hPageStatus["statuscode"] = -200
	hPageStatus["statusmessage"] = str(error)

	# writing to file
	f = open(config.LOG_FOLDER + "/" + strftime("%Y%m%d%H%M%S", gmtime()) + "_product_category_sync.txt", "w")
	f.write (str(error))
	f.close()