/* Amplify Params - DO NOT EDIT
	API_NIPPLIO_GRAPHQLAPIENDPOINTOUTPUT
	API_NIPPLIO_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const https = require('https');
const AWS = require("aws-sdk");
const urlParse = require("url").URL;
const appsyncUrl = process.env.API_NIPPLIO_GRAPHQLAPIENDPOINTOUTPUT;
const region = process.env.REGION;
const endpoint = new urlParse(appsyncUrl).hostname.toString();
const gql = require("graphql-tag");
const graphql = require("graphql");
const { print } = graphql;

const createUser = gql`
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
      id
      username
      email
      authUsername
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      boards {
        nextToken
        startedAt
      }
    }
  }
`;

exports.handler = async (event, context, callback) => {
  console.log("--- function starts");
  const authUsername = event.userName;
  event.response.autoConfirmUser = true;
  console.log(event);

  const req = new AWS.HttpRequest(appsyncUrl, region);

    const item = {
        input: {
          username: event.request.userAttributes.email,
          email: event.request.userAttributes.email,
          authUsername: authUsername,
        }
    };

    req.method = "POST";
    req.path = "/graphql";
    req.headers.host = endpoint;
    req.headers["Content-Type"] = "application/json";
    req.body = JSON.stringify({
        query: print(createUser),
        variables: item
    });

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
        body: data
    };
};

