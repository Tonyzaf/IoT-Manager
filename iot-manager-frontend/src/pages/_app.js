import { Auth0Provider } from "@auth0/auth0-react";

function MyApp({ Component, pageProps }) {
  return (
    <Auth0Provider
      domain="dev-ji3mz06clez8ing1.us.auth0.com"
      clientId="bYMFMMF2dResMEFvOSJh8EVeg3nHayc7"
      redirectUri={typeof window !== "undefined" && window.location.origin}
    >
      <Component {...pageProps} />
    </Auth0Provider>
  );
}

export default MyApp;
