const fs    = require('fs');
const mysql = require("./mysql");
const path  = require("path");

async function processCleanup(folder, connection) {

	const fileList = await fs.readdirSync(folder);
	for (const file of fileList) {
		try {

		    let cmd = "SELECT id AS cnt, 'images' as table_name FROM images WHERE url like '%" + file + "' OR url_large like '%" + file + "'";
		    cmd = cmd + " UNION SELECT id AS cnt, 'products' as table_name FROM products WHERE image_url1 like '%" + file + "' OR image_url2 like '%" + file + "' OR image_url3 like '%" + file + "' OR image_url4 like '%" + file + "' OR image_url5 like '" + file + "'";
		    cmd = cmd + " UNION SELECT id AS cnt, 'categories' as table_name FROM categories WHERE image_url like '%" + file + "' OR image_url_large like '%" + file + "'";

		    let rows = await mysql.executeSqlSync(cmd, [], connection);
		    if (rows.length == 0) {
		    	await fs.unlinkSync(folder + "/" + file);
		    	//console.log(file + " deleted.");
		    }

		} catch (ex) {
			console.error(" ERROR: " + ex);
		}
	}

}

function processCleanupOriginalFolder(folder, folderNameToValidate) {
	fs.readdirSync(folder).forEach(async file => {
		try {
			let fileObj  = path.parse(folder + "/" + file);
			let fileName = fileObj.name;
			if (!fs.existsSync(folderNameToValidate + "/" + fileName + ".jpg")) {
		    	fs.unlinkSync(folder + "/" + file);
			}
		}catch (ex) {
			console.log(" ERROR: " + ex);
		}

	});
}

async function openConnection() {
	return await mysql.openConnectionSync();
}

async function closeConnection(connection) {
	mysql.closeConnection(connection);
}

(
	async () => {

		let args = process.argv.slice(2);

		// check if folder name is passed in command line arguments
		if (args.length == 0) {
			console.error("Please pass the argument base path. Usage: node deleteUnassociatedImages /Users/rupeshshah/Documents/images");
			return;
		}

		let folderName = args[0];

		// check if folder exists!
		if (!fs.existsSync(folderName + '/large') || !fs.existsSync(folderName + '/orig') || !fs.existsSync(folderName + '/small') || !fs.existsSync(folderName + '/original')) {
			console.error("Invalid folder!");
			return;
		}

		// open connection and process
		let connection = await openConnection();

		Promise.all([
		    processCleanup(folderName + '/large', connection),
		    processCleanup(folderName + '/orig',  connection),
		    processCleanup(folderName + '/small', connection)
		]).then(async () => {
			await processCleanupOriginalFolder(folderName + '/original', folderName + '/small');
		}).catch( (ex) => {
			console.error(ex);
		}).finally ( () => {
			mysql.closeConnection(connection);
			//console.log("All done! Please use Ctrl-C to exit.");
		}); ;

	}
)();

