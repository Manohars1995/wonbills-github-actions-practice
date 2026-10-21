import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'sonner';
import WonBillsContextProvider from './store/WonBillsContext.jsx';
import BillingCalculator from './components/UI-Components/Calculator/BillingCalculator.jsx';
import { HelmetProvider } from "react-helmet-async";


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <WonBillsContextProvider>
        <App />
        <BillingCalculator />
        <Toaster position="bottom-left" richColors />
      </WonBillsContextProvider>
    </HelmetProvider>
  </StrictMode>,
)
