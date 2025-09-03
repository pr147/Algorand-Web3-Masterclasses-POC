import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState, useEffect } from 'react'
import ConnectWallet from './components/ConnectWallet'
import Transact from './components/Transact'
import NFTmint from './components/NFTmint'
import Tokenmint from './components/Tokenmint'
import { getAlgodConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'
import { useSnackbar } from 'notistack'

interface NFTData {
  assetId: number
  name: string
  imageUrl: string
}

const Home: React.FC = () => {
  const [openWalletModal, setOpenWalletModal] = useState(false)
  const [openDemoModal, setOpenDemoModal] = useState(false)
  const [openNFTModal, setOpenNFTModal] = useState(false)
  const [openTokenModal, setOpenTokenModal] = useState(false)

  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [mintedNFTs, setMintedNFTs] = useState<NFTData[]>([])

  const [asaAssetId, setAsaAssetId] = useState<number | null>(null)
  const [asaBalance, setAsaBalance] = useState<number>(0)
  const [recipientAddress, setRecipientAddress] = useState('')
  const [sendAmount, setSendAmount] = useState('')

  const { activeAddress, transactionSigner } = useWallet()
  const { enqueueSnackbar } = useSnackbar()

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({ algodConfig })

  const toggleWalletModal = () => setOpenWalletModal(!openWalletModal)
  const toggleDemoModal = () => setOpenDemoModal(!openDemoModal)
  const toggleNFTModal = () => setOpenNFTModal(!openNFTModal)
  const toggleTokenModal = () => setOpenTokenModal(!openTokenModal)

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true)
    setOpenDemoModal(false)
  }

  const handleNFTSuccess = (assetId: number, name: string, imageUrl: string) => {
    setMintedNFTs(prev => [...prev, { assetId, name, imageUrl }])
    setOpenNFTModal(false)
  }

  // Fetch ASA balance
  const fetchAsaBalance = async (assetId: number) => {
    if (!activeAddress) return
    try {
      const info = await algorand.algodClient.accountInformation(activeAddress).do()
      const asset = info.assets?.find(a => a['asset-id'] === assetId)
      setAsaBalance(asset ? Number(asset.amount) : 0)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (asaAssetId) fetchAsaBalance(asaAssetId)
  }, [asaAssetId])

  // Send ASA tokens
  const handleSendAsa = async () => {
    if (!asaAssetId || !recipientAddress || !sendAmount || !transactionSigner || !activeAddress) return
    try {
      await algorand.send.assetTransfer({
        sender: activeAddress,
        signer: transactionSigner,
        recipient: recipientAddress,
        assetIndex: asaAssetId,
        amount: BigInt(sendAmount),
      })
      enqueueSnackbar(`Sent ${sendAmount} tokens to ${recipientAddress}`, { variant: 'success' })
      fetchAsaBalance(asaAssetId)
      setRecipientAddress('')
      setSendAmount('')
    } catch (e) {
      console.error(e)
      enqueueSnackbar('Failed to send tokens', { variant: 'error' })
    }
  }

  return (
    <div className="relative hero min-h-screen bg-black overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="animate-pulse opacity-10 bg-gradient-to-r from-red-700 via-black to-red-900 w-[200%] h-[200%] -rotate-12 blur-3xl"></div>
      </div>

      <div className="relative z-10 hero-content text-center rounded-2xl p-10 max-w-lg bg-black/90 border border-gray-800 shadow-[0_0_35px_rgba(255,0,0,0.25)] backdrop-blur-md">
        <div className="max-w-md">
          <h1 className="text-5xl font-extrabold text-gray-100 mb-4 tracking-wide drop-shadow-lg">
            Welcome to <span className="text-red-600">Lightning McQueen&apos;s Era 🏎️</span>
          </h1>
          <p className="py-4 text-lg text-gray-400 leading-relaxed">
            Claim your <span className="text-red-500 font-semibold">exclusive McQueen Ticket</span> and unlock the new era of <span className="text-white font-bold">futuristic racing</span>.
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-4 mt-6">
            {/* Connect Wallet */}
            <button
              className="btn bg-black text-red-500 border border-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 shadow-lg"
              onClick={toggleWalletModal}
            >
              {activeAddress ? 'Wallet Connected ✅' : 'Connect Wallet'}
            </button>

            {/* Payment */}
            {activeAddress && !paymentSuccess && (
              <button
                className="btn bg-neutral-900 text-gray-300 border border-gray-600 hover:bg-gray-700 hover:text-white transition-all duration-300 shadow-lg"
                onClick={toggleDemoModal}
              >
                Send Payment
              </button>
            )}

            {/* NFT Mint */}
            {activeAddress && paymentSuccess && (
              <button
                className="btn bg-gradient-to-r from-red-500 to-red-700 text-white border-none hover:from-red-600 hover:to-red-800 transition-all duration-300 shadow-xl"
                onClick={toggleNFTModal}
              >
                Mint MasterPass NFT
              </button>
            )}

            {/* ASA Token */}
            {activeAddress && (paymentSuccess || mintedNFTs.length > 0) && !asaAssetId && (
              <button
                className="btn bg-gradient-to-r from-yellow-400 to-yellow-600 text-black border-none hover:from-yellow-500 hover:to-yellow-700 hover:text-white transition-all duration-300 shadow-lg"
                onClick={toggleTokenModal}
              >
                Claim Reward Token (ASA)
              </button>
            )}
          </div>

          {/* ASA Balance & Send Form */}
          {asaAssetId && (
            <div className="mt-6 p-4 bg-black/80 border border-yellow-600 rounded-lg text-yellow-400">
              <p className="mb-2">💰 Your Token Balance: {asaBalance}</p>
              <input
                type="text"
                placeholder="Recipient Address"
                className="input input-bordered w-full mb-2"
                value={recipientAddress}
                onChange={e => setRecipientAddress(e.target.value)}
              />
              <input
                type="number"
                placeholder="Amount"
                className="input input-bordered w-full mb-2"
                value={sendAmount}
                onChange={e => setSendAmount(e.target.value)}
                min={1}
              />
              <button className="btn btn-yellow w-full" onClick={handleSendAsa}>
                Send Tokens
              </button>
            </div>
          )}

          {/* Display minted NFTs */}
          {mintedNFTs.length > 0 && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {mintedNFTs.map((nft, index) => (
                <div key={index} className="bg-black/70 border border-red-700 rounded-xl p-4 shadow-lg">
                  <p className="text-gray-300 font-medium mb-2">{nft.name}</p>
                  <img
                    src={nft.imageUrl}
                    alt={nft.name}
                    className="w-full h-auto rounded-lg shadow-md border border-red-800"
                  />
                  <p className="text-sm text-gray-400 mt-2">Asset ID: {nft.assetId}</p>
                </div>
              ))}
            </div>
          )}

          {/* Modals */}
          <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
          <Transact openModal={openDemoModal} setModalState={setOpenDemoModal} onSuccess={handlePaymentSuccess} />
          <NFTmint
            openModal={openNFTModal}
            setModalState={setOpenNFTModal}
            onSuccess={(assetId: number, name: string, imageUrl: string) =>
              handleNFTSuccess(assetId, name, imageUrl)
            }
          />
          <Tokenmint
            openModal={openTokenModal}
            setModalState={setOpenTokenModal}
            onSuccess={(assetId?: number) => {
              if (assetId) {
                setAsaAssetId(assetId)
                fetchAsaBalance(assetId)
              }
              setOpenTokenModal(false)
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Home
