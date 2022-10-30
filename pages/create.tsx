import React, { FormEvent, useState } from "react"
import Header from "../components/Header"
import {
  useAddress,
  useContract,
  MediaRenderer,
  useNetwork,
  useNetworkMismatch,
  useOwnedNFTs,
  useCreateAuctionListing,
  useCreateDirectListing,
} from "@thirdweb-dev/react"
import { useRouter } from "next/router"
import { NFT, NATIVE_TOKENS, NATIVE_TOKEN_ADDRESS } from "@thirdweb-dev/sdk"
import network from "../utils/network"

type CreateProps = {}

const Create: React.FC<CreateProps> = () => {
  const address = useAddress()
  const router = useRouter()
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    "marketplace",
  )
  const { contract: collectionContract } = useContract(
    process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,
    "nft-collection",
  )
  const ownedNfts = useOwnedNFTs(collectionContract, address)
  const [selectedNft, setSelectedNft] = useState<NFT>()

  const networkMisMatch = useNetworkMismatch()
  const [, switchNetwork] = useNetwork()

  const {
    mutate: createDirectListing,
    isLoading: isDirectLoading,
    error: directError,
  } = useCreateDirectListing(contract)

  const {
    mutate: createAuctionListing,
    isLoading: isAuctionLoading,
    error: auctionError,
  } = useCreateAuctionListing(contract)

  const handleCreateListing = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (networkMisMatch) {
      switchNetwork && switchNetwork(network)
      return
    }

    if (!selectedNft) return

    const target = e.target as typeof e.target & {
      elements: { listingType: { value: string }; price: { value: string } }
    }

    const { listingType, price } = target.elements

    if (listingType.value === "directListing") {
      createDirectListing(
        {
          assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
          tokenId: selectedNft.metadata.id,
          currencyContractAddress: NATIVE_TOKEN_ADDRESS,
          listingDurationInSeconds: 60 * 60 * 24 * 7,
          quantity: 1,
          buyoutPricePerToken: price.value,
          startTimestamp: new Date(),
        },
        {
          onSuccess(data, variables, context) {
            console.log("SUCCESS: ", data, variables, context)
            router.push("/")
          },

          onError(error, variables, context) {
            console.log("Error: ", error, variables, context)
            router.push("/")
          },
        },
      )
    }

    if (listingType.value === "auctionListing") {
      createAuctionListing(
        {
          assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
          buyoutPricePerToken: price.value,
          tokenId: selectedNft.metadata.id,
          startTimestamp: new Date(),
          currencyContractAddress: NATIVE_TOKEN_ADDRESS,
          listingDurationInSeconds: 60 * 60 * 24 * 7,
          quantity: 1,
          reservePricePerToken: 0,
        },
        {
          onSuccess(data, variables, context) {
            console.log("SUCCESS: ", data, variables, context)
            router.push("/")
          },

          onError(error, variables, context) {
            console.log("Error: ", error, variables, context)
            router.push("/")
          },
        },
      )
    }
  }

  return (
    <div>
      <Header />

      <main className="max-w-6xl mx-auto p-10 pt-2">
        <h1 className="text-4xl font-bold">List an Item</h1>
        <h2 className="text-xl font-semibold pt-5">Select an Item</h2>

        <hr className="mb-5" />

        <p>Below you will find the NFT's you own in your wallet</p>

        <div className="flex overflow-x-scroll space-x-2 p-4">
          {ownedNfts.data?.map((nft) => (
            <div
              key={nft.metadata.id}
              onClick={() => setSelectedNft(nft)}
              className={`flex flex-col space-y-2 card min-w-fit border-2 bg-gray-100 ${
                nft.metadata.id === selectedNft?.metadata.id
                  ? "border-black"
                  : "border-transparent"
              }`}
            >
              <MediaRenderer
                className="h-48 rounded"
                src={nft.metadata.image}
              />
              <p className="text-lg truncate font-bold">{nft.metadata.name}</p>
              <p className="text-xs truncate">{nft.metadata.description}</p>
            </div>
          ))}
        </div>

        {selectedNft && (
          <form onSubmit={handleCreateListing}>
            <div className="flex flex-col p-10">
              <div className="grid grid-cols-2 gap-5">
                <label className="border-r font-light">
                  Direct Listing / Fixed Price
                </label>
                <input
                  title="direct"
                  type="radio"
                  name="listingType"
                  value="directListing"
                  className="ml-auto h-10 w-10"
                />

                <label className="border-r font-light">Auction</label>
                <input
                  title="auction"
                  type="radio"
                  name="listingType"
                  value="auctionListing"
                  className="ml-auto h-10 w-10"
                />

                <label className="border-r font-light">Price</label>
                <input
                  type="text"
                  name="price"
                  placeholder="0.05"
                  className="bg-gray-100 p-5 outline-none"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white rounded-tl p-4 mt-8"
              >
                Create Listing
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
export default Create
