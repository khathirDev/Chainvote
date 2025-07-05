import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@mysten/dapp-kit/dist/index.css';
import App from './App.tsx'
import { ThemeProvider } from './providers/theme/ThemeProvider.tsx'
import NavigationProvider from './providers/navigation/NavigationProvider.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { networkConfig } from './config/networkConfig.ts'


const queryClient = new QueryClient();



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider defaultNetwork={getNetwork()} networks={networkConfig}>
          <WalletProvider autoConnect>
            <NavigationProvider>
              <App />
            </NavigationProvider>
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)

function getNetwork() {
  const networks = ["mainnet", "devnet", "testnet"]
  const network = import.meta.env.VITE_NETWORK;

  console.log("selecting: " + network);

  if(!networks.includes(network)) return "testnet";

  return network;
}
