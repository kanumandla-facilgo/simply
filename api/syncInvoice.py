import http.client
import html
import json
import xml.etree.ElementTree as ET
import os
import uuid
import time
from datetime import datetime, timedelta
from socket import timeout
from time import gmtime, strftime
from xml.sax.saxutils import escape

import config
import util
import userManager

def tally_get_voucher_number(master_id, material_out_invoice_flag):
	hStatus = {}

	try: 
		values = """<ENVELOPE>
					<HEADER>
						<VERSION>1</VERSION>
					    <TALLYREQUEST>EXPORT</TALLYREQUEST>
					    <TYPE>COLLECTION</TYPE>
					    <ID>FindParticularVoucher</ID>
				  </HEADER>
				  <BODY>
				  	<DESC>
				    	<STATICVARIABLES>
					        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
							<SVCURRENTCOMPANY>""" + escape(config.TALLY_COMPANY_NAME) + """</SVCURRENTCOMPANY>
						</STATICVARIABLES>
						<TDL>
					        <TDLMESSAGE>
					          <COLLECTION NAME="FindParticularVoucher" ISINITIALIZE="YES">
					            <TYPE>Voucher</TYPE>
					            <FILTER>GetInvoiceVoucher</FILTER>
					          </COLLECTION>
					          <SYSTEM TYPE="FORMULAE" NAME="GetInvoiceVoucher">$MasterID = """ + str(master_id) + """ and $VoucherTypeName = 'Sales'</SYSTEM>
					        </TDLMESSAGE>
						      </TDL>
					</DESC>
					</BODY>
					</ENVELOPE>"""

		if(material_out_invoice_flag != None and material_out_invoice_flag == 1):
			values = values.replace("Sales", "Material Out")

		data = values.encode('utf-8') # data should be bytes
		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/xml"}
		conn = util.getHttpConnection(config.TALLY_URL)
		response = util.invokeHttpMethod("POST", '/', data, headers, conn)

		util.closeHttpConnection(conn)

		hStatus = parseTallyVoucherResponse(response)

	except (OSError) as error:
		hStatus["statuscode"] = -106
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

def tally_post_invoice(deliverynote):
	hStatus = {}
	inv_xml, order_xml = mapToOrdersInventories(deliverynote)

	ndate_conv = datetime.strptime(deliverynote["note_date"], '%Y-%m-%dT%H:%M:%S.%fZ')
	ndate = ndate_conv.strftime("%Y%m%d")
	#ndate = "20210701"
	ndate_format1 = ndate_conv.strftime("%d-%b-%Y at %H:%M")
	#ndate_format1 = "01-07-2021 at 08:30"
	
	adate = ndate_conv.strftime("%d-%b-%Y")
	if(deliverynote["accounting_voucher_date"]):
		adate_conv = datetime.strptime(deliverynote["accounting_voucher_date"], '%Y-%m-%dT%H:%M:%S.%fZ')
		adate = adate_conv.strftime("%d-%b-%Y")
		#adate = "01-07-2021"

	if(deliverynote["lr_date"]):
		lrdate_conv = datetime.strptime(deliverynote["lr_date"], '%Y-%m-%dT%H:%M:%S.%fZ')
		lr_date = lrdate_conv.strftime("%Y%m%d")
		#lr_date = "20210701"

	amount = round(deliverynote["sub_total"] + deliverynote["tax_total"] + deliverynote["ship_total"] - deliverynote["discount_total"] + deliverynote["rounding_total"], 2)
	pterm_days = str(deliverynote["customer"]["payment_term"]["days"]) + " Days"
	pterm_number = round(excel_date(ndate_conv))
	bill_ref_id = str(deliverynote["id"])

	if(deliverynote["invoice_number"] == None or deliverynote["invoice_number"] == ''):
		voucher = """<VOUCHER"""
	elif(deliverynote["status_id"] == 5503):
		voucher = """<VOUCHER Date=\"""" + adate +"""\" TAGNAME="Voucher Number" TAGVALUE=\"""" + invoice["invoice_number"] +"""\" Action="Cancel" """
	else:
		voucher = """<VOUCHER Date=\"""" + adate +"""\" TAGNAME="Voucher Number" TAGVALUE=\"""" + invoice["invoice_number"] +"""\" Action="Alter" """
		bill_ref_id = deliverynote["invoice_number"]

	if(deliverynote["material_out_invoice_flag"] != None and deliverynote["material_out_invoice_flag"] == 1):
		voucher += """ VCHTYPE = "Material Out" OBJVIEW="Multi Consumption Voucher View">"""
	else:
		voucher += """ VCHTYPE = "Sales">"""

	ship_address_name = deliverynote["ship_address"]["name"]
	if(ship_address_name == None or ship_address_name == ''):
		ship_address_name = deliverynote["customer"]["name"]

	notes = ''
	if(deliverynote["notes"] != None):
		notes = deliverynote["notes"]

	lr_number = ''
	if(deliverynote["lr_number"] != None):
		lr_number = deliverynote["lr_number"]

	vehicle_number = ''
	if(deliverynote["eway_bill"] != None):
		vehicle_number = deliverynote["eway_bill"]["vehicle_number"]

	deliverynote["tax_gst"] = [n for n in deliverynote["customer"]["company"]["configuration"] 
											if n["name"] == 'tax_gst_number'][0]['value']

	if(deliverynote["destination_distance"] == None):
		deliverynote["destination_distance"] = 0

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
					<TALLYMESSAGE>"""
		values += voucher + """<ADDRESS.LIST TYPE="String">
								<ADDRESS>""" +  escape(deliverynote["customer"]["bill_address"]["address1"]) + """</ADDRESS>
								<ADDRESS>""" +  escape(deliverynote["customer"]["bill_address"]["address2"]) + """</ADDRESS>
								<ADDRESS>""" +  escape(deliverynote["customer"]["bill_address"]["address3"]) + """</ADDRESS>
								<ADDRESS>""" +  escape(deliverynote["customer"]["bill_address"]["city"]) + """</ADDRESS>
							</ADDRESS.LIST>

							<BASICBUYERADDRESS.LIST TYPE="String">
								<BASICBUYERADDRESS>""" +  escape(deliverynote["ship_address"]["address1"]) + """</BASICBUYERADDRESS>
								<BASICBUYERADDRESS>""" +  escape(deliverynote["ship_address"]["address2"]) + """</BASICBUYERADDRESS>
								<BASICBUYERADDRESS>""" +  escape(deliverynote["ship_address"]["address3"]) + """</BASICBUYERADDRESS>
								<BASICBUYERADDRESS>""" +  escape(deliverynote["ship_address"]["city"]) + """</BASICBUYERADDRESS>
							</BASICBUYERADDRESS.LIST>

							<NARRATION>""" +  str(html.escape(notes)) + """</NARRATION>
						      <OLDAUDITENTRYIDS.LIST TYPE="Number">
						       <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
						      </OLDAUDITENTRYIDS.LIST>

							<DATE>""" +  escape(ndate) + """</DATE>"""

		if(deliverynote["lr_date"]):
			values += """<BILLOFLADINGDATE>""" +  escape(lr_date) + """</BILLOFLADINGDATE>"""

		if(deliverynote["lr_number"]):
			values += """<BILLOFLADINGNO>""" +  str(lr_number) + """</BILLOFLADINGNO>
						 <BASICSHIPDOCUMENTNO>""" +  str(lr_number) + """</BASICSHIPDOCUMENTNO>"""

		values = values + "<STATENAME>""" +  escape(deliverynote["ship_address"]["state"]) + """</STATENAME>

							<PARTYGSTIN>""" +  escape(deliverynote["customer"]["gst_number"]) + """</PARTYGSTIN>
      						<PLACEOFSUPPLY>""" +  escape(deliverynote["ship_address"]["state"]) + """</PLACEOFSUPPLY>

      						<PARTYNAME>""" +  escape(deliverynote["customer"]["name"]) + """</PARTYNAME>
      						<PARTYLEDGERNAME>""" +  escape(deliverynote["customer"]["name"]) + """</PARTYLEDGERNAME>
      						<PARTYPINCODE>""" +  escape(deliverynote["customer"]["bill_address"]["zip"]) + """</PARTYPINCODE>
      						
      						<BASICBASEPARTYNAME>""" +  escape(deliverynote["customer"]["name"]) + """</BASICBASEPARTYNAME>
							<BASICSHIPPEDBY>""" +  str(deliverynote["transporter"]["name"]) + """</BASICSHIPPEDBY>
							<BASICBUYERNAME>""" +  escape(deliverynote["customer"]["name"]) + """</BASICBUYERNAME>
      						<BASICFINALDESTINATION>""" +  escape(deliverynote["ship_address"]["city"]) + """</BASICFINALDESTINATION>
      						<BASICORDERREF>""" +  escape(deliverynote["customer"]["agent"]["name"]) + """</BASICORDERREF>
      						<BASICDUEDATEOFPYMT>""" + str(deliverynote["customer"]["payment_term"]["days"]) + """</BASICDUEDATEOFPYMT>
      						<BASICDATETIMEOFINVOICE>""" + ndate_format1 + """</BASICDATETIMEOFINVOICE>
      						<BASICDATETIMEOFREMOVAL>""" + ndate_format1 + """</BASICDATETIMEOFREMOVAL>
      						
      						<VOUCHERNUMBER>""" +  str(deliverynote["id"]) + """</VOUCHERNUMBER>
			      			<ENTEREDBY>""" +  escape(deliverynote["user"]["login_name"]) + """</ENTEREDBY>   

      						<CONSIGNEEPINCODE>""" +  escape(deliverynote["ship_address"]["zip"]) + """</CONSIGNEEPINCODE>
      						<CONSIGNEEGSTIN>""" +  escape(deliverynote["customer"]["gst_number"]) + """</CONSIGNEEGSTIN>
      						<CONSIGNEESTATENAME>""" +  escape(deliverynote["ship_address"]["state"]) + """</CONSIGNEESTATENAME>"""

		if(deliverynote["material_out_invoice_flag"] != None and deliverynote["material_out_invoice_flag"] == 1):
			values += """<VOUCHERTYPENAME>Material Out</VOUCHERTYPENAME>
      					<ISINVOICE>No</ISINVOICE>"""
		else:					  
			values += """<VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
      						<ISINVOICE>Yes</ISINVOICE>					
      						<EWAYBILLDETAILS.LIST>
						       <CONSIGNORADDRESS.LIST TYPE="String">
						        <CONSIGNORADDRESS>""" +  escape(deliverynote["customer"]["company"]["ship_address"]["address1"]) + """</CONSIGNORADDRESS>
						        <CONSIGNORADDRESS>""" +  escape(deliverynote["customer"]["company"]["ship_address"]["address2"]) + """</CONSIGNORADDRESS>
						        <CONSIGNORADDRESS>""" +  escape(deliverynote["customer"]["company"]["ship_address"]["address3"]) + """</CONSIGNORADDRESS>
						       </CONSIGNORADDRESS.LIST>
						       <CONSIGNEEADDRESS.LIST TYPE="String">
						        <CONSIGNEEADDRESS>""" +  escape(deliverynote["ship_address"]["address1"])  + """</CONSIGNEEADDRESS>
						        <CONSIGNEEADDRESS>""" +  escape(deliverynote["ship_address"]["address2"]) + """</CONSIGNEEADDRESS>
						        <CONSIGNEEADDRESS>""" +  escape(deliverynote["ship_address"]["address3"])  + """</CONSIGNEEADDRESS>
						       </CONSIGNEEADDRESS.LIST>
						       <DOCUMENTTYPE>Tax Invoice</DOCUMENTTYPE>
						       <CONSIGNEEGSTIN>""" +  escape(deliverynote["customer"]["gst_number"]) + """</CONSIGNEEGSTIN>
						       <CONSIGNEESTATENAME>""" +  escape(deliverynote["ship_address"]["state"]) + """</CONSIGNEESTATENAME>
						       <CONSIGNEEPLACE>""" +  escape(deliverynote["ship_address"]["city"]) + """</CONSIGNEEPLACE>
						       <CONSIGNEEPINCODE>""" +  escape(deliverynote["ship_address"]["zip"]) + """</CONSIGNEEPINCODE>
						       <SUBTYPE>Supply</SUBTYPE>
						       <CONSIGNORNAME>""" +  escape(deliverynote["customer"]["company"]["name"]) + """</CONSIGNORNAME>
						       <CONSIGNORPINCODE>""" +  escape(deliverynote["customer"]["company"]["ship_address"]["zip"]) + """</CONSIGNORPINCODE>
						       <CONSIGNORGSTIN>""" +  str(deliverynote["tax_gst"]) + """</CONSIGNORGSTIN>
						       <CONSIGNORSTATENAME>""" +  escape(deliverynote["customer"]["company"]["ship_address"]["state"]) + """</CONSIGNORSTATENAME>
						       <CONSIGNEENAME>""" +  escape(ship_address_name) + """</CONSIGNEENAME>
						       <SHIPPEDFROMSTATE>""" +  str(deliverynote["customer"]["company"]["ship_address"]["state"]) + """</SHIPPEDFROMSTATE>
						       <SHIPPEDTOSTATE>""" +  escape(deliverynote["ship_address"]["state"]) + """</SHIPPEDTOSTATE>
						       <IGNOREGSTINVALIDATION>No</IGNOREGSTINVALIDATION>
						       <TRANSPORTDETAILS.LIST>
						        <DOCUMENTDATE>""" +  escape(ndate) + """</DOCUMENTDATE>
						        <DOCUMENTNUMBER>""" +  str(lr_number) + """</DOCUMENTNUMBER>
						        <VEHICLENUMBER>""" +  str(vehicle_number) + """</VEHICLENUMBER>
						        <TRANSPORTERID>""" +  str(deliverynote["customer"]["transporter"]["external_code"]) + """</TRANSPORTERID>
						        <TRANSPORTERNAME>""" +  str(deliverynote["customer"]["transporter"]["name"]) + """</TRANSPORTERNAME>
						        <TRANSPORTMODE>Road</TRANSPORTMODE>
						        <VEHICLETYPE>Regular</VEHICLETYPE>
						        <IGNOREVEHICLENOVALIDATION>No</IGNOREVEHICLENOVALIDATION>
						        <DISTANCE>""" +  str(deliverynote["destination_distance"]) + """</DISTANCE>
						       </TRANSPORTDETAILS.LIST>
						      </EWAYBILLDETAILS.LIST>

						    <LEDGERENTRIES.LIST>
						       <OLDAUDITENTRYIDS.LIST TYPE="Number">
						        <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
						       </OLDAUDITENTRYIDS.LIST>
						       <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
       						   <ISLASTDEEMEDPOSITIVE>Yes</ISLASTDEEMEDPOSITIVE>
						       <LEDGERNAME>""" + escape(deliverynote["customer"]["name"]) + """</LEDGERNAME>						       
						       <AMOUNT>""" + str(amount * -1) + """</AMOUNT>
							   
						       <BILLALLOCATIONS.LIST>
						        <NAME>""" +  str(bill_ref_id) + """</NAME>
						        <BILLCREDITPERIOD JD=\"""" + str(pterm_number) + """\" P=\"""" + escape(pterm_days) + """\">""" + escape(pterm_days) + """</BILLCREDITPERIOD>
						        <BILLTYPE>New Ref</BILLTYPE>
						        <TDSDEDUCTEEISSPECIALRATE>No</TDSDEDUCTEEISSPECIALRATE>
						        <AMOUNT>""" + str(amount * -1) + """</AMOUNT>
						       </BILLALLOCATIONS.LIST>
						      </LEDGERENTRIES.LIST>"""

			if(deliverynote["tax_total_igst"] == 0):					  
				values += """<LEDGERENTRIES.LIST>
							       <OLDAUDITENTRYIDS.LIST TYPE="Number">
							        <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
							       </OLDAUDITENTRYIDS.LIST>
							       <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
	       						   <ISLASTDEEMEDPOSITIVE>No</ISLASTDEEMEDPOSITIVE>
							       <ROUNDTYPE/>
							       <LEDGERNAME>Output CGST</LEDGERNAME>
							       <METHODTYPE>GST</METHODTYPE>
							       <GSTCLASS/>
							       <AMOUNT>""" + str(deliverynote["tax_total_cgst"]) + """</AMOUNT>
							       <VATEXPAMOUNT>""" + str(deliverynote["tax_total_cgst"]) + """</VATEXPAMOUNT>
							      </LEDGERENTRIES.LIST>

							      <LEDGERENTRIES.LIST>
							       <OLDAUDITENTRYIDS.LIST TYPE="Number">
							        <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
							       </OLDAUDITENTRYIDS.LIST>
							       <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
	       						   <ISLASTDEEMEDPOSITIVE>No</ISLASTDEEMEDPOSITIVE>
							       <ROUNDTYPE/>
							       <LEDGERNAME>Output SGST</LEDGERNAME>
							       <METHODTYPE>GST</METHODTYPE>
							       <GSTCLASS/>
							       <AMOUNT>""" + str(deliverynote["tax_total_sgst"]) + """</AMOUNT>
							       <VATEXPAMOUNT>""" + str(deliverynote["tax_total_sgst"]) + """</VATEXPAMOUNT>
							      </LEDGERENTRIES.LIST>"""
			else:
				values += """<LEDGERENTRIES.LIST>
						       <OLDAUDITENTRYIDS.LIST TYPE="Number">
						        <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
						       </OLDAUDITENTRYIDS.LIST>
						       <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
       						   <ISLASTDEEMEDPOSITIVE>No</ISLASTDEEMEDPOSITIVE>
						       <ROUNDTYPE/>
						       <LEDGERNAME>Output IGST</LEDGERNAME>
						       <METHODTYPE>GST</METHODTYPE>
						       <GSTCLASS/>
						       <AMOUNT>""" + str(deliverynote["tax_total_igst"]) + """</AMOUNT>
						       <VATEXPAMOUNT>""" + str(deliverynote["tax_total_igst"]) + """</VATEXPAMOUNT>
						      </LEDGERENTRIES.LIST>"""
							      
			values += """<LEDGERENTRIES.LIST>
							       <OLDAUDITENTRYIDS.LIST TYPE="Number">
							        <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
							       </OLDAUDITENTRYIDS.LIST>
							       <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
	       						   <ISLASTDEEMEDPOSITIVE>No</ISLASTDEEMEDPOSITIVE>
							       <ROUNDTYPE>Normal Rounding</ROUNDTYPE>
							       <LEDGERNAME>Rounding Off</LEDGERNAME>
							       <METHODTYPE>As Total Amount Rounding</METHODTYPE>
							      
							       <ROUNDLIMIT> 1</ROUNDLIMIT>
							       <AMOUNT>""" + str(deliverynote["rounding_total"]) + """</AMOUNT>
							       <VATEXPAMOUNT>""" + str(deliverynote["rounding_total"]) + """</VATEXPAMOUNT>
							      </LEDGERENTRIES.LIST>"""
		

		values +=	inv_xml + order_xml + """</VOUCHER>
					</TALLYMESSAGE>
				</DATA>
			</BODY>
			</ENVELOPE>"""

		if(deliverynote["material_out_invoice_flag"] != None and deliverynote["material_out_invoice_flag"] == 1):
			values = values.replace("INVENTORYENTRIES.LIST", "INVENTORYENTRIESOUT.LIST")

		data = values.encode('utf-8') # data should be bytes

		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/xml"}
		conn = util.getHttpConnection(config.TALLY_URL)
		response = util.invokeHttpMethod("POST", '/', data, headers, conn)

		util.closeHttpConnection(conn)

		hStatus = parseTallyInvoiceResponse(response)

		return hStatus

	except (OSError) as error:
		hStatus["statuscode"] = -106
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

def parseTallyVoucherResponse (response):

	hStatus = {}

	try:
		res = response.decode('UTF-8')
		res = res.replace("UDF:VATREGISTRATIONDATE", "UDFVATREGISTRATIONDATE")
		res = res.replace("UDF:CSTREGISTRATIONDATE", "UDFCSTREGISTRATIONDATE")
		res = res.replace("UDF:TRADERCONSVATTINNO", "TRADERCONSVATTINNO")
		
		parser = ET.XMLParser(encoding="utf-8")
		root = ET.fromstring(res, parser=parser)
		status_node = root.find("HEADER/STATUS")

		if (status_node.text == "1"):

			voucherNode = root.find("BODY/DATA/COLLECTION/VOUCHER")
			voucher_number = voucherNode.find("VOUCHERNUMBER").text

			hStatus["statuscode"] = 0
			hStatus["statusmessage"] = "Success"
			hStatus["voucher_number"] = voucher_number

		else:
			hStatus["statuscode"] = -200
			hStatus["statusmessage"] = root.find("BODY/DATA/LINEERROR").text

	except Exception as error:
		hStatus["statuscode"] = -105
		hStatus["statusmessage"] = "Tally voucher response parse error!" + str(error)

	return hStatus


def parseTallyInvoiceResponse (response):

	hStatus = {}

	try:

		root = ET.fromstring(response)
		status_node = root.find("HEADER/STATUS")

		if (status_node.text == "1"):
			hStatus["statuscode"] = 0
			hStatus["statusmessage"] = "Success"
			hStatus["master_id"] = root.find("BODY/DATA/IMPORTRESULT/LASTVCHID").text
		else:
			hStatus["statuscode"] = -206
			hStatus["statusmessage"] = root.find("BODY/DATA/LINEERROR").text

	except:
		hStatus["statuscode"] = -105
		hStatus["statusmessage"] = "Tally customer response parse error!"

	return hStatus

def mapToOrdersInventories(delivery_note):
	dn_xml, order_xml = "", ""
	dn_details = delivery_note["packingsliplist"]	
	order_hash = {}
	for dn_detail in dn_details:
		for lineitem in dn_detail["lineitems"]:
			amount = round((lineitem["sub_total"] - lineitem["discount_total"]), 2)
			extension = lineitem["order_detail"]["order_price"] * float(lineitem["packed_qty_quote"])
			disc_perc = round((lineitem["discount_total"] / extension) * 100, 2)
			if(lineitem["uom_short_name"] == lineitem["entered_uom_short_name"]):
				qty = lineitem["packed_qty_quote"] + " " + lineitem["uom_short_name"] 
			else:
				qty = lineitem["packed_qty_quote"] + " " + lineitem["uom_short_name"] + " = " + lineitem["packed_qty_qty"] + " " + lineitem["entered_uom_short_name"]
			#qty = lineitem["packed_qty_qty"] + " " + lineitem["entered_uom_short_name"]
			dn_xml += """<INVENTORYENTRIES.LIST>
							<ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
       						<ISLASTDEEMEDPOSITIVE>No</ISLASTDEEMEDPOSITIVE>	
						 	<STOCKITEMNAME>""" + escape(lineitem["name"]) + """</STOCKITEMNAME>
						 	<RATE>""" + str(round(lineitem["order_detail"]["order_price"], 2)) + "/" + lineitem["uom_short_name"] + """</RATE>
						 	<DISCOUNT>""" + str(disc_perc) + """</DISCOUNT>
						 	<AMOUNT>""" + str(amount) + """</AMOUNT>
						 	<ACTUALQTY>""" + qty + """</ACTUALQTY>
						 	<BILLEDQTY>""" + qty + """</BILLEDQTY>
						 	<BATCHALLOCATIONS.LIST>
						 		<AMOUNT>""" + str(amount) + """</AMOUNT>
						 		<ACTUALQTY>""" + qty + """</ACTUALQTY>
						 		<BILLEDQTY>""" + qty + """</BILLEDQTY>
						 		<BATCHNAME>""" + lineitem["stock_bucket_code"] + """</BATCHNAME>
						 		<GODOWNNAME>Aslali</GODOWNNAME>
						 	</BATCHALLOCATIONS.LIST>
						 	<ACCOUNTINGALLOCATIONS.LIST>
						 			<ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
       								<ISLASTDEEMEDPOSITIVE>No</ISLASTDEEMEDPOSITIVE>
				                    <OLDAUDITENTRYIDS.LIST TYPE="Number">
				                    <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
				                    </OLDAUDITENTRYIDS.LIST>
				                    <LEDGERNAME>Sales</LEDGERNAME>
				                    <AMOUNT>""" + str(amount) + """</AMOUNT>
				            </ACCOUNTINGALLOCATIONS.LIST>
						</INVENTORYENTRIES.LIST>"""

		if dn_detail["order"]["id"] not in order_hash:
			odate_conv = datetime.strptime(dn_detail["order"]["order_date"], '%Y-%m-%dT%H:%M:%S.%fZ')
			odate = odate_conv.strftime("%Y%m%d")
			#<BASICORDERDATE>20210701</BASICORDERDATE>
			order_xml += """<INVOICEORDERLIST.LIST>
								<BASICORDERDATE>""" + escape(odate) + """</BASICORDERDATE>
						       	<BASICPURCHASEORDERNO>""" + str(dn_detail["order"]["order_number"]) + """</BASICPURCHASEORDERNO>
						    </INVOICEORDERLIST.LIST>"""			
			order_hash[dn_detail["order"]["id"]] = "Y"
	return dn_xml, order_xml

# get all invoices
def api_getInvoices(sessionid):

	try:
		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/json", "Authorization": "Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("GET", '/api/deliverynotes?sync_status_id=4100&sort_by=id&sort_direction=1', '', headers, conn)
		#response = util.invokeHttpMethod("GET", '/api/deliverynotes?invoice_number=20479', '', headers, conn)
		util.closeHttpConnection(conn)

		# deserialize json
		hResponse = json.loads(response)

		# iterate hash

		if (hResponse["statuscode"] == 0):
			for deliverynote in hResponse["data"]["deliverynotelist"]:
				deliverynote = api_deliverynote(deliverynote["id"], sessionid)
				lInvoice.append(deliverynote)
				
		return lInvoice

	except (OSError) as error:
		hStatus["statuscode"] = -104
		hStatus["statusmessage"] = str("Unable to connect to simply")

	except (http.client.HTTPException, http.client.NotConnected) as error:
		hStatus["statuscode"] = -105
		hStatus["statusmessage"] = str(error)

	except timeout as error:
		hStatus["statuscode"] = -106
		hStatus["statusmessage"] = str(error)

	except Exception as error:
		hStatus["statuscode"] = -200
		hStatus["statusmessage"] = str(error)

def api_deliverynote(id, sessionid):

	try:
		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/json", "Authorization": "Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("GET", '/api/deliverynotes/'+ str(id), '', headers, conn)
		util.closeHttpConnection(conn)

		# deserialize json
		hResponse = json.loads(response)

		# iterate hash
		if (hResponse["statuscode"] == 0):
			return hResponse["data"]["deliverynote"]

	except (OSError) as error:
		hStatus["statuscode"] = -104
		hStatus["statusmessage"] = str("Unable to connect to simply")

	except (http.client.HTTPException, http.client.NotConnected) as error:
		hStatus["statuscode"] = -105
		hStatus["statusmessage"] = str(error)

	except timeout as error:
		hStatus["statuscode"] = -106
		hStatus["statusmessage"] = str(error)

	except Exception as error:
		hStatus["statuscode"] = -200
		hStatus["statusmessage"] = str(error)

def api_update_deliverynote(deliverynote, sessionid):

	hStatus = {}
	print("About to update invoice")
	try:
		headers = {"Content-type": "application/json", "Accept": "text/json", "Authorization":"Bearer " + sessionid}
		conn = util.getHttpConnection(config.SIMPLY_URL) #http.client.HTTPConnection(url, timeout=config.TIMEOUT)
		response = util.invokeHttpMethod("PUT", '/api/deliverynotes/', json.dumps(deliverynote), headers, conn)
		util.closeHttpConnection(conn)
		
		print("Invoice synced updated ")

		hResponse = json.loads(response)

		hStatus["statuscode"] = hResponse["statuscode"]
		hStatus["statusmessage"] = hResponse["message"]
		
		if (hStatus["statuscode"] == 0):
			hStatus["id"] = hResponse["data"]["deliverynote"]["id"]

	except (OSError) as error:
		hStatus["statuscode"] = -106
		hStatus["statusmessage"] = "Error occurred while updating invoice " + str(deliverynote["id"]) + " to simply."

	except (http.client.HTTPException, http.client.NotConnected) as error:
		hStatus["statuscode"] = -105
		hStatus["statusmessage"] = str(error)

	except timeout as error:
		hStatus["statuscode"] = -107
		hStatus["statusmessage"] = str(error)

	except Exception as error:
		hStatus["statuscode"] = -200
		hStatus["statusmessage"] = str(error)

	return hStatus

def excel_date(date1):
    temp = datetime(1899, 12, 30)    # Note, not 31st Dec but 30th!
    delta = date1 - temp
    return float(delta.days) + (-1.0 if delta.days < 0 else 1.0)*(delta.seconds) / 86400

#===============================
# main program
#===============================
hPageStatus = {}
lInvoice = []

try:

	# login to remote page to retrieve customers
	hLogin = userManager.login()
	
	if (hLogin["statuscode"] == 0):
		sessionid = hLogin["sessionid"]
		# get invoices
		api_getInvoices(sessionid)

		for invoice in lInvoice:
			is_sync_to_tally = 0
			invoice["id"] = str(invoice["id"])
			print("Processing for invoice " + str(invoice["id"]))
			hStatus = tally_post_invoice(invoice)
			print("Invoice Processing Status")
			print(hStatus)
			if (hStatus["statuscode"] == 0):			 	
			 	if(invoice["invoice_number"] == None or invoice["invoice_number"] == ''):
			 		is_sync_to_tally = 1

		 		voucher_details = tally_get_voucher_number(hStatus["master_id"], invoice["material_out_invoice_flag"])
		 		invoice["invoice_number"] = voucher_details["voucher_number"]		 		
		 		print(voucher_details)
		 		invoice["accounting_voucher_date"] = invoice["note_date"]
		 		
		 		if(is_sync_to_tally == 1):
		 			hStatus = tally_post_invoice(invoice)

		 		
			 	invoice["sync_status_id"] = 4101
			 	invoice["sync_failure_reason"] = ""
			 	hStatus = api_update_deliverynote(invoice, sessionid)
			 	if(hStatus["statuscode"] == 0):
			 		hPageStatus[invoice["id"]] = "Processed successfully for " + invoice["id"]
			 	else:
			 		hPageStatus[invoice["id"]] = hStatus
			 		invoice["sync_status_id"] = 4100
			 		invoice["sync_failure_reason"] = hStatus["statusmessage"]
			 		print(invoice["sync_failure_reason"])
			 		#hStatus = api_update_deliverynote(invoice, sessionid)
			else:
			 	hPageStatus[invoice["id"]] = hStatus


	print(hPageStatus)
	# writing to file
	f = open(config.LOG_FOLDER + "/" + strftime("%Y%m%d%H%M%S", gmtime()) + "_invoice_sync.txt", "w")
	f.write (json.dumps(hPageStatus, indent=4))
	f.close()
	
except Exception as error:
	print(error)
	hPageStatus["statuscode"] = -200
	hPageStatus["statusmessage"] = str(error)

	# writing to file
	f = open(config.LOG_FOLDER + "/" + strftime("%Y%m%d%H%M%S", gmtime()) + "_invoice_sync.txt", "w")
	f.write (str(error))
	f.close()