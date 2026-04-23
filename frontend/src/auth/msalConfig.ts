import {
  PublicClientApplication,
  type Configuration,
  type RedirectRequest,
} from '@azure/msal-browser';

const tenantId = import.meta.env.VITE_AZURE_TENANT_ID ?? '9b87658d-8187-4a9e-b0ad-563953b308a6';
const clientId = import.meta.env.VITE_AZURE_CLIENT_ID ?? 'e7ee6bd4-a7aa-452a-8827-bc1270c6c6ba';

/** Scope exposed by the backend API app registration. */
export const apiScope = `api://${clientId}/access_as_user`;

const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest: RedirectRequest = {
  scopes: [apiScope, 'openid', 'profile', 'email'],
};

export const tokenRequest = {
  scopes: [apiScope],
};
