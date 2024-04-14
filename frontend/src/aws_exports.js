const config = {
  Auth: {
    Cognito: {
      region: "us-east-1",
      userPoolId: "us-east-1_8l8WnxQrI", // Update to grab from environement variables
      userPoolClientId: "7p08d9oc6pppclk2m9kprr0vvl", // replace with Terraform output
      authenticationFlowType: "USER_PASSWORD_AUTH",
    },
  },
};

export default config;
