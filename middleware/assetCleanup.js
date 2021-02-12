const fs = require('fs');
const path = require('path');

module.exports = (assetPath) => {
	if (!assetPath) return false;
	fs.unlink(path.join(__dirname, `../public${assetPath}`), (err) => {
		if (err) console.log(err.message);
		console.log(`DELETE - Asset - ${assetPath} - was removed.`);
	});
};