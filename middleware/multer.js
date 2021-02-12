/**
 * multer - multipart/formdata middleware
 */
const multer = require('multer');
const path = require('path');

module.exports = (destinationFolder) => {
	const storage = multer.diskStorage({
		destination: `./public/${destinationFolder}`,
		filename: (req, file, callback) => {
			callback(null, `${file.originalname.replace(/([.])\w+/, '_')}${Date.now()}${path.extname(file.originalname)}`);
		}
	});

	return multer({ storage });
}