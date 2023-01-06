import config
import util
import json
import base64
import http.client

def login():

	hStatus = {}

	try:

		# data = ("login_name=" + config.SIMPLY_LOGIN_NAME + "&password=" + config.SIMPLY_PASSWORD).encode("ascii")
		data = (config.SIMPLY_LOGIN_NAME + ":" + config.SIMPLY_PASSWORD).encode("ascii")

		base64_bytes = base64.b64encode(data)
		base64_message = base64_bytes.decode('ascii')

		headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/json", "Authorization": "Basic " + base64_message}
		conn = util.getHttpConnection(config.SIMPLY_URL)
		response = util.invokeHttpMethod("POST", '/api/tokens', data, headers, conn)
		util.closeHttpConnection(conn)

		# deserialize json
		hSession = json.loads(response)

		# assign status code and message
		hStatus["statuscode"] = hSession["statuscode"]
		hStatus["statusmessage"] = hSession["message"]

		if (hSession["statuscode"] == 0):
			sessionid = (hSession["data"]["session"]["id"])
		else:
			sessionid = ""

		# assign sessionid
		hStatus["sessionid"] = sessionid

	except (OSError) as error:
		hStatus["statuscode"] = -104
		hStatus["statusmessage"] = str("Unable to connect to simply.")

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

