import "../styles/globals.css"
import type { AppProps } from "next/app"
import { ThirdwebProvider } from "@thirdweb-dev/react"
import network from "../utils/network"
import Head from "next/head"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider desiredChainId={network}>
      <Head>
        <title>EBAY Marketplace</title>
      </Head>
      <Component {...pageProps} />
    </ThirdwebProvider>
  )
}

export default MyApp
