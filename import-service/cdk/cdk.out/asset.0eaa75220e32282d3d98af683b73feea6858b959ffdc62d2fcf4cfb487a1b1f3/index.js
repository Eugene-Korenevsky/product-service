var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../src/functions/importProductsFile/index.ts
var importProductsFile_exports = {};
__export(importProductsFile_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(importProductsFile_exports);

// ../constants/constants.ts
var CORS_ENABLE_HEADERS = {
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
};
var bucketName = "import-bucket-be";

// ../src/Response.ts
var formatJSONResponse = (response) => {
  return {
    statusCode: 200,
    body: JSON.stringify(response),
    headers: CORS_ENABLE_HEADERS
  };
};
var serverErrorJSONResponse = () => {
  return {
    statusCode: 500,
    body: "Internal Server Error",
    headers: CORS_ENABLE_HEADERS
  };
};
var badRequestJSONResponse = (response) => {
  return {
    statusCode: 400,
    body: JSON.stringify(response),
    headers: CORS_ENABLE_HEADERS
  };
};

// ../src/functions/importProductsFile/index.ts
var import_client_s3 = require("@aws-sdk/client-s3");
var import_s3_request_presigner = require("@aws-sdk/s3-request-presigner");
var handler = async (event) => {
  try {
    const fileName = event.queryStringParameters?.name;
    if (fileName) {
      const s3Client = new import_client_s3.S3Client();
      const putCommand = new import_client_s3.PutObjectCommand({
        Bucket: bucketName,
        Key: `uploaded/${fileName}`
      });
      const url = await (0, import_s3_request_presigner.getSignedUrl)(s3Client, putCommand, {
        expiresIn: 60
      });
      return formatJSONResponse({
        data: url
      });
    }
    return badRequestJSONResponse({
      message: "file name should be provided"
    });
  } catch (error) {
    console.log(error);
    return serverErrorJSONResponse();
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
