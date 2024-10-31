import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './App.jsx';
import {Auth0Provider} from '@auth0/auth0-react';
import {getConfig} from '../../config.js';
import {NavBar} from './Navbar.jsx';
import './index.css';
import {ThemeProvider} from '@mui/material';
import {theme} from './theme';


// Please see https://auth0.github.io/auth0-react/interfaces/Auth0ProviderOptions.html
// for a full list of the available properties on the provider
const config = getConfig();

const providerConfig = {
  domain: config.domain,
  clientId: config.clientId,
  authorizationParams: {
    redirect_uri: window.location.origin,
    ...(config.audience ? {audience: config.audience} : null),
  },
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      {...providerConfig}
    >
      <ThemeProvider theme={theme}>
        <NavBar />
        <App />
      </ThemeProvider>
    </Auth0Provider>
  </StrictMode>,
);
