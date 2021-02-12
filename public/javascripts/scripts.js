async function buildAssetHeaders(fileInput) {
	return new Promise((resolve, reject) => {
		const headers = {
			upload_width: [],
			upload_height: [],
			upload_mimetype: [],
		};
		const { name, files } = fileInput;
		const img = new Image();
		img.src = URL.createObjectURL(files[0], { type: files[0].type });
		img.onload = () => {
			headers.upload_width.push(`${name}=${img.width}`);
			headers.upload_height.push(`${name}=${img.height}`);
			headers.upload_mimetype.push(`${name}=${files[0].type}`);
			resolve(headers);
		}
	});
}

function concatHeaders(headers) {
	if (!headers.length) return {};
	const finalHeaders = {}
	headers.forEach(header => {
		Object.keys(header).forEach(key => {
			if (!finalHeaders[key]) finalHeaders[key] = [];
			finalHeaders[key] = finalHeaders[key].concat(header[key]);
		});
	});

	return {
		upload_width: finalHeaders.upload_width.join(','),
		upload_height: finalHeaders.upload_height.join(','),
		upload_mimetype: finalHeaders.upload_mimetype.join(','),
	};
}

function sendMultipartData(formData, headers) {
	fetch('/api/media', {
		method: 'POST',
		headers,
		mode: 'cors',
		body: formData
	}).then(res => res.json().then(data => {
		console.log(data);
		demoDisplayResponse(data);
		createDemoImageButtons(data.uploads);
	}));
}

function handleFormSubmit() {
	document.querySelector('.multipart').addEventListener('submit', async (e) => {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		const fileInputs = Array.from(e.currentTarget.elements).map(el => el.type === 'file' && el.files.length && el).filter(val => !!val && val);
		const promises = fileInputs.map(input => buildAssetHeaders(input));
		const headers = await Promise.all(promises);
		const finalHeaders = concatHeaders(headers);
		demoDisplayHeaders(finalHeaders);
		sendMultipartData(fd, finalHeaders);
	});
}

/**************************************
DEMO UI FUNCTIONS
*************************************/
function demoDisplayHeaders(headers) {
	document.querySelector('.headers-display').innerHTML = JSON.stringify(headers, null, 2);
}

function demoDisplayResponse(response) {
	document.querySelector('.response-display').innerHTML = JSON.stringify(response, null, 2);
}

function createDemoImageButtons(uploadObj) {
	const div = document.querySelector('.image-buttons');
	Object.keys(uploadObj).forEach(key => {
		if (uploadObj[key].charAt(0) === '/') {
			const anchor = document.createElement('a');
			anchor.href = uploadObj[key];
			anchor.textContent = key;
			anchor.target = '_blank';
			div.appendChild(anchor);
		}
	});
}

// kick off
window.addEventListener('load', () => {
	handleFormSubmit();
});
