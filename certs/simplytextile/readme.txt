openssl req -new -newkey rsa:2048 -nodes -keyout www.simplytextile.com.key -out www.simplytextile.com.csr

Enter common name as www.simplytextile.com. Rest of prompts are not that imp.

Then in SSLs.com, upload CSR.

Then do dns validation.

Once certificate generates, merge .crt file and .ca-bundle to www.simplytextile.com.chained.crt file.

Upload all these to server.


