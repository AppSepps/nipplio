/* Amplify Params - DO NOT EDIT
	API_GETIDENTITYID_APIID
	API_GETIDENTITYID_APINAME
	API_NIPPLIO_GRAPHQLAPIENDPOINTOUTPUT
	API_NIPPLIO_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */const AWS = require("aws-sdk");
const https = require("https");
const urlParse = require("url").URL;

exports.handler = async (event, context, callback) => {
  const policyName = "nipplioIOTPolicy";
  console.log(event);
  /*const principal = event.requestContext.identity.cognitoIdentityId;

  const iot = new AWS.Iot();
  await iot.attachPrincipalPolicy({ principal, policyName }).promise();
  callback(null, "success");
  */
  const apiGatewayUrl =
    "https://hb1c7aykgl.execute-api.eu-west-1.amazonaws.com/staging";
  const endpoint = new urlParse(apiGatewayUrl).hostname.toString();

  const req = new AWS.HttpRequest(apiGatewayUrl, "eu-west-1");

  req.method = "POST";
  req.path = "/policy/getIdentityId";
  req.headers.host = endpoint;
  req.headers["Content-Type"] = "application/json";
  req.body = "{}";

  const signer = new AWS.Signers.V4(req, "appsync", true);
  signer.addAuthorization(AWS.config.credentials, AWS.util.date.getDate());

  const data = await new Promise((resolve, reject) => {
    const httpRequest = https.request({ ...req, host: endpoint }, (result) => {
      let data = "";

      result.on("data", (chunk) => {
        data += chunk;
      });

      result.on("end", () => {
        resolve(JSON.parse(data.toString()));
      });
    });

    httpRequest.write(req.body);
    httpRequest.end();
  });

  console.log(JSON.stringify(data));
  callback(null, event);
  return {
    statusCode: 200,
    body: data,
  };
};
