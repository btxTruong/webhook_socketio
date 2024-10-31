import {createRemoteJWKSet, jwtVerify} from 'jose';

// https://github.com/scristobal/auth0-socketio
export const socketIOAuth0 = (domain, audience) => {
  if (!domain) {
    throw new Error('domain is required');
  }
  // https://auth0.com/docs/secure/tokens/json-web-tokens/validate-json-web-tokens#verify-rs256-signed-tokens
  const JWKS = createRemoteJWKSet(
    new URL(`https://${domain}/.well-known/jwks.json`));

  const config = {issuer: `https://${domain}/`};

  if (audience !== undefined) {
    config.audience = audience;
  }

  return async function(socket, next) {
    const jwt = socket.handshake.auth.token;

    if (typeof jwt !== 'string') {
      return next(
        new Error(
          'No Token provided, please provide a Bearer token in the Authorization header',
        ),
      );
    }

    try {
      const {payload, protectedHeader} = await jwtVerify(jwt, JWKS, config);
      socket.auth = {sub: payload.sub};
    } catch (err) {
      return next(new Error('Failed to verify jwt, user not authorized'));
    }

    return next();
  };
};
