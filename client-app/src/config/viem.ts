import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

export const viemConfig = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})