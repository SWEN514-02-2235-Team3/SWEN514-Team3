const config = {
  Auth: {
    Cognito: {
      region: "us-east-1",
      userPoolId: "us-east-1_NCPqp34iL", // Update to grab from environement variables
      userPoolClientId: "62g091lrc4pj2hmm0a7se1erfo", // replace with Terraform output
      //   authenticationFlowType: "USER_PASSWORD_AUTH",
    },
  },
};

export default config;
