const { useAuth0 } = require("@auth0/auth0-react");
const { default: Router } = require("next/router");

export const checkAuthorization = () => {
  const { isAuthenticated } = useAuth0();
  if (!isAuthenticated) {
    Router.replace("/login");
  }
};
