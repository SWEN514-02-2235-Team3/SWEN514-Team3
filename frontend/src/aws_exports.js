const config = {
  Auth: {
    Cognito: {
      region: "us-east-1",
      userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    },
  },
};

export default config;
