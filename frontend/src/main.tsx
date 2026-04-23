import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MsalProvider } from '@azure/msal-react'
import { EventType, type AuthenticationResult } from '@azure/msal-browser'
import App from './App.tsx'
import { msalInstance } from './auth/msalConfig'

await msalInstance.initialize()

// Set the first signed-in account as active so silent token acquisition works.
const accounts = msalInstance.getAllAccounts()
if (accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0])
}

msalInstance.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    const payload = event.payload as AuthenticationResult
    msalInstance.setActiveAccount(payload.account)
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </StrictMode>,
)
