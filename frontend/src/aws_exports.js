function stripQuotes(value) {
  return value.replace(/^['"]+|['"]+$/g, "");
}

let config = {
  Auth: {
    Cognito: {
      region: "us-east-1",
      // userPoolId: stripQuotes(process.env.REACT_APP_COGNITO_USER_POOL_ID),
      // userPoolClientId: stripQuotes(process.env.REACT_APP_COGNITO_USER_POOL_ID),
    },
  },
};

export default config;
