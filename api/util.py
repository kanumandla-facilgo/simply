import http.client
import config
import random
import string

def getHttpConnection(url):
	if (url.lower().find("https://") > -1):
		return http.client.HTTPSConnection(url.lower().replace("https://", ""), timeout=config.TIMEOUT)
	else:
		return http.client.HTTPConnection(url.lower().replace("http://", ""), timeout=config.TIMEOUT)

def invokeHttpMethod(methodType, uri, params, headers, conn):
	conn.request(methodType, uri, params, headers)
	response = conn.getresponse()
	data = response.read()
	return data

def generateRandomString(N):
	# using random.choices() 
	# generating random strings  
	res = ''.join(random.choices(string.ascii_uppercase +
    		                        string.digits, k = N)) 
	return res

def closeHttpConnection(conn):
	if not conn is None: 
		conn.close()
