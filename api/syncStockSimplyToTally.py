import http.client
import json
import xml.etree.ElementTree as ET
import os
import html
import uuid
from socket import timeout
from time import gmtime, strftime
from datetime import datetime, timedelta
from xml.sax.saxutils import escape

import config
import util
import userManager

def tally_create_bulk_stock(stockbucket_list, sessionid):
	for stock in stockbucket_list:

		print("Processing stock " + stock["code"])
		status = tally_createstock(stock)
		hPageStatus[stock["id"]] = status
		print(status)
		if(status["statuscode"] == 0):
			api_updateStockJournal(stock["id"], 4101, sessionid)
			

def tally_createstock(stock):
	print("Creating stock")
	hStatus = {}
	cdate_conv = datetime.strptime(stock["created"], '%Y-%m-%dT%H:%M:%S.%fZ')
	cdate = cdate_conv.strftime("%Y%m%d")
	adate = cdate_conv.strftime("%d-%b-%Y")
	# cdate = "20220101"
	# adate = "01-Jan-2022"

	notes = ''
	if(stock["description"] != None):
		notes = stock["description"]

	stock_id = "S" + str(stock["id"])
	try:
		values = """<ENVELOPE><HEADER>
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
								 <VOUCHER VCHTYPE="Stock Journal" Date=\"""" + adate +"""\" ACTION="Alter" TAGNAME="Voucher Number" TAGVALUE=\"""" + stock_id +"""\"  OBJVIEW="Consumption Voucher View">
								  <DATE>""" + escape(cdate) + """</DATE>
								  <VOUCHERTYPENAME>Stock Journal</VOUCHERTYPENAME>
								  <VOUCHERNUMBER> """ + escape(stock_id) + """</VOUCHERNUMBER>
								  <DESTINATIONGODOWN>Aslali</DESTINATIONGODOWN>
								  <USEFORGODOWNTRANSFER>No</USEFORGODOWNTRANSFER>
								  <INVENTORYENTRIESIN.LIST>
								   <STOCKITEMNAME>""" + stock["product_name"] + """</STOCKITEMNAME>
								   <NARRATION>""" +  str(html.escape(notes)) + """</NARRATION>
								   <RATE>""" + str(stock["cost_price"]) +  """/""" + stock["uom_quote"]["short_name"] + """</RATE>
								   <AMOUNT>""" + str(stock["cost_price"] * float(stock["stock_quote"]) * -1) + """</AMOUNT>
								   <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
								   <ISLASTDEEMEDPOSITIVE>Yes</ISLASTDEEMEDPOSITIVE> """ 
		if(stock["uom_qty"]["name"] == stock["uom_quote"]["name"]):
			values += """ <ACTUALQTY>""" + str(stock["stock_quote"]) + """ """ + stock["uom_quote"]["short_name"] + """ </ACTUALQTY>"""
			values += """<BILLEDQTY>""" + str(stock["stock_quote"]) + """ """ + stock["uom_quote"]["short_name"] + """ </BILLEDQTY>"""
		else:
			values += """ <ACTUALQTY>""" + str(stock["stock_quote"]) + """ """ + stock["uom_quote"]["short_name"] + """ =  """ + str(stock["stock_qty"]) + """ """ + stock["uom_qty"]["short_name"] + """</ACTUALQTY>"""
			values += """ <BILLEDQTY>""" + str(stock["stock_quote"]) + """ """ + stock["uom_quote"]["short_name"] + """ =  """ + str(stock["stock_qty"]) + """ """ + stock["uom_qty"]["short_name"] + """</BILLEDQTY>"""
		values += 		"""<BATCHALLOCATIONS.LIST>
							<GODOWNNAME>Aslali</GODOWNNAME>
							<BATCHNAME>""" + stock["code"] +"""</BATCHNAME>
							<AMOUNT>""" + str(stock["cost_price"] * float(stock["stock_quote"]) * -1) + """</AMOUNT>"""
		if(stock["uom_qty"]["name"] == stock["uom_quote"]["name"]):
			values += """ <ACTUALQTY>""" + str(stock["stock_quote"]) + """ """ + stock["uom_quote"]["short_name"] + """ </ACTUALQTY>"""
			values += """<BILLEDQTY>""" + str(stock["stock_quote"]) + """ """ + stock["uom_quote"]["short_name"] + """ </BILLEDQTY>"""
		else:
			values += """ <ACTUALQTY>""" + str(stock["stock_quote"]) + """ """ + stock["uom_quote"]["short_name"] + """ =  """ + str(stock["stock_qty"]) + """ """ + stock["uom_qty"]["short_name"] + """</ACTUALQTY>"""
			values += """ <BILLEDQTY>""" + str(stock["stock_quote"]) + """ """ + stock["uom_quote"]["short_name"] + """ =  """ + str(stock["stock_qty"]) + """ """ + stock["uom_qty"]["short_name"] + """</BILLEDQTY>"""
		values +=	   """</BATCHALLOCATIONS.LIST>
						  </INVENTORYENTRIESIN.LIST>
						 </VOUCHER>
						</TALLYMESSAGE>
						</DATA>
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


# get all stock buckets
def api_getStockBuckets(sessionid):
	print("Get Stock Buckets")
	lStockBucketList = []
	try:
		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/json", "Authorization": "Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("GET", '/api/stock?active_only=1&sync_status_id=4100&enabled_only=1&sort_by=id&sort_direction=1', '', headers, conn)

		util.closeHttpConnection(conn)
		# deserialize json
		hResponse = json.loads(response)

		# iterate hash
		if (hResponse["statuscode"] == 0):
			for stock in hResponse["data"]["stockbucketlist"]:
				lStockBucketList.append(stock)				

		return lStockBucketList

	except (http.client.HTTPException, http.client.NotConnected) as error:
		return -105

	except timeout:
		return -106

	except Exception as error:
		return -200

# get all stock buckets
def api_getStockJournals(sessionid):
	print("Get Stock Journals")
	lStockBucketList = []
	try:
		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/json", "Authorization": "Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("GET", '/api/stockjournal?active_only=1&sync_status_id=4100&enabled_only=1&sort_by=id&sort_direction=1', '', headers, conn)

		util.closeHttpConnection(conn)
		# deserialize json
		hResponse = json.loads(response)

		# iterate hash
		if (hResponse["statuscode"] == 0):
			for stock in hResponse["data"]["stockjournal"]["stockjournallist"]:
				stock["code"] = stock["stock_bucket_code"]
				lStockBucketList.append(stock)

		return lStockBucketList

	except (http.client.HTTPException, http.client.NotConnected) as error:
		return -105

	except timeout:
		return -106

	except Exception as error:
		return -200		

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
	except Exception as error:
		hStatus["statuscode"] = -105
		hStatus["statusmessage"] = "Tally response parse error!" + str(error)

	return hStatus

def api_updateStockBucket(id, syncstatusid, sessionid):
	hStatus = {}

	try:

		headers = {"Content-type": "application/json", "Accept": "text/json", "Authorization":"Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("PUT", '/api/stockbucket/' + str(id) + '/syncstatus/' + str(syncstatusid), "", headers, conn)

		util.closeHttpConnection(conn)

		hResponse = json.loads(response)

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
		hStatus["statuscode"] = -200
		hStatus["statusmessage"] = str(error)

	return hStatus

def api_updateStockJournal(id, syncstatusid, sessionid):
	hStatus = {}

	try:

		headers = {"Content-type": "application/json", "Accept": "text/json", "Authorization":"Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("PUT", '/api/stockjournal/' + str(id) + '/syncstatus/' + str(syncstatusid), "", headers, conn)

		util.closeHttpConnection(conn)

		hResponse = json.loads(response)

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
		hStatus["statuscode"] = -200
		hStatus["statusmessage"] = str(error)

	return hStatus

#===============================
# main program
#===============================
hPageStatus = {}

hStockGroupOutput = {}

hStockBucketByProductList = {}
lCategory = []

hCategorySearch = {}
lCategory = []

lProduct = []

hHsnSearch = {}
lStockBucketList = []

try:

	# login to remote page to retrieve customers
	hLogin = userManager.login()

	if (hLogin["statuscode"] == 0):		
		# lStockBucketList = api_getStockBuckets(hLogin["sessionid"])
		# tally_create_bulk_stock(lStockBucketList, hLogin["sessionid"])

		lStockJournalList = api_getStockJournals(hLogin["sessionid"])
		tally_create_bulk_stock(lStockJournalList, hLogin["sessionid"])
	else:

		# api login failed from remote url. Set the error at page level
		hPageStatus["statuscode"] =  hLogin["statuscode"]
		hPageStatus["statusmessage"] =  hLogin["statusmessage"]

	# writing to file
	f = open(config.LOG_FOLDER + "/" + strftime("%Y%m%d%H%M%S", gmtime()) + "_stock_sync.txt", "w")
	f.write (json.dumps(hPageStatus, indent=4))
	f.close()

except Exception as error:

	hPageStatus["statuscode"] = -200
	hPageStatus["statusmessage"] = str(error)

	# writing to file
	f = open(config.LOG_FOLDER + "/" + strftime("%Y%m%d%H%M%S", gmtime()) + "_stock_sync.txt", "w")
	f.write (str(error))
	f.close()

print (json.dumps(hPageStatus, indent=4))
