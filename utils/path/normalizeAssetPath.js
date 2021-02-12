const fs = require('fs');
const path = require('path');

module.exports = (string, permanentPath) => {
	// Bail if it's not a string or don't have path
	if (typeof string !== 'string' || !permanentPath) return null;

	// Update the file path with the permanent one
	const updatedPath = `'${string.replace('public/temp', `/${permanentPath}`)}'`;

	// Create write path and remove single quotes
	const writePath = `${__dirname}/../../public${updatedPath.replace(/\'/g, '')}`;

	// Write perm file
	fs.writeFile(writePath, fs.readFileSync(`./${string}`), (err) => {
		if (err) console.log(err);
		console.log(`COPIED FILE ${string} => ${updatedPath}`);
	});

	// Delete temp file
	fs.unlink(`./${string}`, (err) => {
		if (err) console.log(err);
		console.log(`DELETED TEMP FILE FROM => ${string}`);
	});

	return updatedPath.replace(/'/g, '');
}
