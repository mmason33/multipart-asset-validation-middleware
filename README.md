# Multipart Middleware Asset Validation

### Get Started
```
git clone https://github.com/mmason33/multipart-asset-validation-middleware.git

cd multipart-asset-validation-middleware

npm install

npm run start

http://localhost:3000
```

### Demo Images
Demo images have been provided to use in the respective file inputs. You can mix and match these assets to trigger different validation states.
```
./demo-images
```

### Highlighted Files

Asset Validation Configs
- [Asset Sizes](https://github.com/mmason33/multipart-asset-validation-middleware/blob/master/utils/assets/acceptedAssetSizes.js)
- [Asset Mimes](https://github.com/mmason33/multipart-asset-validation-middleware/blob/master/utils/assets/acceptedAssetSizes.js)

Asset Validation
- [Validator](https://github.com/mmason33/multipart-asset-validation-middleware/blob/master/middleware/assetValidation.js)
- [Example Business Requirements Implementation](https://github.com/mmason33/multipart-asset-validation-middleware/blob/master/middleware/assetValidation.js#L168)
- [Asset Cleanup](https://github.com/mmason33/multipart-asset-validation-middleware/blob/master/middleware/assetCleanup.js)
- [Temporary Asset Cleanup Implementation](https://github.com/mmason33/multipart-asset-validation-middleware/blob/master/middleware/assetValidation.js#L191)

Route Implementation
- [Route](https://github.com/mmason33/multipart-asset-validation-middleware/blob/master/routes/multipart.js)
- [Asset Handling Implementation](https://github.com/mmason33/multipart-asset-validation-middleware/blob/master/routes/multipart.js#L8)
- [Asset Handling](https://github.com/mmason33/multipart-asset-validation-middleware/blob/master/utils/path/normalizeAssetPath.js)
