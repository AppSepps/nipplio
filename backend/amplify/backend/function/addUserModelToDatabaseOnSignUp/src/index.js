/* Amplify Params - DO NOT EDIT
	API_NIPPLIO_BOARDTABLE_ARN
	API_NIPPLIO_BOARDTABLE_NAME
	API_NIPPLIO_GRAPHQLAPIENDPOINTOUTPUT
	API_NIPPLIO_GRAPHQLAPIIDOUTPUT
	API_NIPPLIO_SOUNDTABLE_ARN
	API_NIPPLIO_SOUNDTABLE_NAME
	API_NIPPLIO_USERBOARDTABLE_ARN
	API_NIPPLIO_USERBOARDTABLE_NAME
	API_NIPPLIO_USERTABLE_ARN
	API_NIPPLIO_USERTABLE_NAME
	AUTH_NIPPLIO_USERPOOLID
	ENV
	REGION
Amplify Params - DO NOT EDIT */
const axios = require("axios");
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
  console.log(event);
  const authUsername = event.userName;

  try {
    const graphqlData = await axios({
      url: process.env.API_URL,
      method: "post",
      headers: {
        "x-api-key": process.env.API_NIPPLIO_GRAPHQLAPIKEYOUTPUT,
      },
      data: {
        query: print(createUser),
        variables: {
          input: {
            username: event.request.userAttributes.email,
            email: event.request.userAttributes.email,
            authUsername: authUsername,
          },
        },
      },
    });
    const body = {
      message: "successfully created user!",
    };
    return {
      statusCode: 200,
      body: JSON.stringify(body),
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (err) {
    console.log("error creating todo: ", err);
  }

  callback(null, event);
};
