const express = require('express');
const fs = require('fs');
const router = express.Router();
const upload = require('../middleware/multer')('temp');
const assetValidation = require('../middleware/assetValidation');
const normalizeAssetPath = require('../utils/path/normalizeAssetPath');

router.post('/media', upload.any(), assetValidation('media'), async (req, res) => {
	const header_image_path = normalizeAssetPath(req.header_image ? req.header_image.path : null, 'media');
	const body_image_path = normalizeAssetPath(req.body_image ? req.body_image.path : null, 'media');
	const footer_image_path = normalizeAssetPath(req.footer_image ? req.footer_image.path : null, 'media');

	res.json({
		message: 'Assets passed!',
		uploads: {
			header_image: header_image_path || 'Asset wasn/\'t uploaded',
			body_image: body_image_path || 'Asset wasn/\'t uploaded',
			footer_image: footer_image_path || 'Asset wasn/\'t uploaded',
		}
	});
});

router.get('/demo-images/:image_name', (req, res) => {
	let file;

	try {
		file = fs.readFileSync(`./demo-images/${req.params.image_name}`);
	} catch (err) {
		res.status(400);
		res.setHeader('Content-Type', 'application/json');
		res.json({
			error: 'File does not exist.'
		});

		return false;
	}

	res.setHeader('Content-Disposition', `attachment; filename=${req.params.image_name}`);
	res.send(file);
});

module.exports = router;
