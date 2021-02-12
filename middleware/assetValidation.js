const assetUtil = require('../utils/assets');
const fs = require('fs');
const path = require('path');

/**
 * @function validateHeaders - Validate that required headers are present
 * @param {object} headers - request headers
 * @param {array} files - request parsed multipart files
 */
function validateHeaders(headers, files) {
    const {
        upload_width,
        upload_height,
        upload_mimetype
    } = headers;

    // Bail if missing a required header
    if (files.length && (!upload_width || !upload_height || !upload_mimetype)) return false;

    return true;
}

/**
 * @function getMultipartFieldNames - Return array of file input field names
 * @param {array} files - request parsed multipart files
 */
function getMultipartFieldNames(files) {
    if (!files) return [];
    return files.map(obj => obj.fieldname);
}

/**
 * @function determineAssetType - Determine what type of asset so that we can properly get the config values
 * @param {string} requestFileIdentifier - The file input name
 */
function determineAssetType(requestFileIdentifier) {
	const key = Object.keys(assetUtil.sizes).filter(str => str.includes(requestFileIdentifier));
	return key[0];
}

/**
 * @function stringHeaderToMap - Organize header strings to maps
 * @param {string} upload_width - header
 * @param {string} upload_height - header
 * @param {string} upload_mimetype - header
 * @param {array} configKeys - Keys from the size/mime config object
 * @returns {object}
 */
function stringHeaderToMap({ upload_width, upload_height, upload_mimetype }, configKeys) {
	// needed keys to determine headers
	// at face value string headers are not able to be differentiated
    // headers come through a comma separated key/value pairs - upload_width: asset_name=1920,asset_2_name=1920
	const args = {
		width: upload_width,
		height: upload_height,
		mimetype: upload_mimetype,
	};

    // response object
	const res = {};


	Object.keys(args).forEach(key => {
        // If somehow a header is missing bail
		if (!args[key]) return false;
		const data = args[key].split(',').map(pair => pair.split('='));
		data.forEach(param => {
			const updatedKey = configKeys.filter(key => key && key.includes(param[0]));
			if (!res.hasOwnProperty(updatedKey)) res[updatedKey] = {};
			res[updatedKey][key] = param[1];
		});
	});

	return res;
}

/**
 * @function validate - Validate assets against configs
 * @param {object} assetObject - key file input fields name => value width height mime of field
 * @param {*} numberOfFields - Number of files
 */
function validate(assetObject, numberOfFields) {
	return new Promise((res, rej) => {
		// Set iterator
		let count = 0;
		// Get keys => file input names
		const keys = Object.keys(assetObject);

		// Bail if assets are passed but do not have key/value headers
		if (keys.length !== numberOfFields) rej(false);

		const result = keys.map(key => {
			const sizes = assetUtil.sizes[key];
			const mimes = assetUtil.mimes[key];
			count += 1;

			// Key/value headers are missing
			if (!sizes || !mimes) {
				return 0;
			}

			// Doesn't pass the config check
			if (!sizes.includes(`${assetObject[key].width}x${assetObject[key].height}`) || !mimes.includes(assetObject[key].mimetype)) {
				return 0;
			}

			// Pass
			return 1;
		});

		// Reduce test values to a single value
		const check = result.reduce((acc, cur) => +acc + +cur);

		// Compare the number of assets(count) against the reduced test values
		if (check !== count) {
			rej(false);
		} else {
			res(true);
			console.log('ASSET VALIDATION PASSED!');
		}
	});
}

/**
 * @function cleanupUnsupportedUploads - Multipart assets need to be parsed in order to validate - cleanup assets that fail validation
 * @param {array} filesArray - Original request files array
 */
function cleanupUnsupportedUploads(filesArray) {
	if (!filesArray.length) return false;
	const paths = filesArray.map(fileObj => fileObj.path);

	paths.forEach(pathname => {
		fs.unlink(path.join(__dirname, `/../${pathname}`), (err) => {
			if (err) console.log(err.message);
			console.log(`DELETE - Asset - ${pathname} - was removed.`);
		});
	});
}

module.exports = (dataType) => {
	return async (req, res, next) => {
        // Validate that multipart data was received and the proper request headers were sent
        if (!validateHeaders(req.headers, req.files)) {
            res.status(400);
            return res.json({
                error: 'Missing required headers.',
            });
        }

        // Get and store form field name(s) from multipart file objects in array
		const fields = getMultipartFieldNames(req.files);

        // Based on the field/form multipart names
        // Check the config object for a matching config key
		const configKeys = fields.map(str => determineAssetType(str));
		const obj = stringHeaderToMap(req.headers, configKeys);

		/**
		 * Switch block can be used for specific business requirements
		 * dataType is passed in the middleware invocation in the express router route declaration
		 * For multipart forms you can provide server-side validation for business requirements
		 * Example
		 * - Submitting a new Blog post
		 * - Blog post can have a single image
		 * - Blog post can have a video but if a video is passed an image must also be passed
		 * - Blog post can also have no media
		 */
		switch(dataType) {
			case 'blog':
				// No media
				if (!fields.length) return next();

				// input type file fields would be named - blog_image & blog_video
				if (fields.includes('blog_video') && !fields.includes('blog_image')) {
					res.status(400);
					res.json({
						error: 'When passing a blog video you must also include a blog image',
					});

					return false;
				}
            default:
                break;
		}

		// Test the header parameters against defined sizes/mimes after passing business logic switch cases
		const validation = await validate(obj, fields.length).catch(err => {
			// Multipart data is parsed before validation
			// Assets already exist
			// If validation fails cleanup the files
			cleanupUnsupportedUploads(req.files);

			res.status(400);

			if (!req.files.length) {
				res.json({
					error: 'No multipart data was sent :('
				});

				return false;
			}

			res.json({
				error: 'Assets do not meet the necessary requirements for upload. Please verify you have the correct asset properties in your form data payload and are passing the corresponding header key/value pairs for each property.',
			});

			return false;
		});

		req.files.forEach(file => req[file.fieldname] = file);
		validation && next();
	}
}
