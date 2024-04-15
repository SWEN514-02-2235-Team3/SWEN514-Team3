const config = {
  Auth: {
    Cognito: {
      region: "us-east-1",
      userPoolId: "us-east-1_9v0HJfZ2u", // Update to grab from environement variables
      userPoolClientId: "6e2gp15484nnem872su487i7e0", // replace with Terraform output
      //   authenticationFlowType: "USER_PASSWORD_AUTH",
    },
  },
};

export default config;
