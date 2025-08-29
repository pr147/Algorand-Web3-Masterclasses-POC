import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import Transact from './components/Transact'
import NFTmint from './components/NFTmint'

interface HomeProps {}

const mcqueenImages = [
  'https://upload.wikimedia.org/wikipedia/en/e/e0/Lightning_McQueen.png',
  'https://pngimg.com/uploads/cars/cars_PNG46.png',
  'https://freepngimg.com/thumb/cars_movie/2-2-cars-movie-transparent.png',
  'https://www.kindpng.com/picc/m/149-1494541_lightning-mcqueen-transparent-png-pixar-lightning-mcqueen-png.png',
  'https://www.nicepng.com/png/full/363-3636689_lightning-mcqueen-png-image-pixar-lightning-mcqueen-transparent.png',
  'https://www.pngplay.com/wp-content/uploads/12/Lightning-McQueen-PNG-Clipart-Background.png',
  'https://static.wikia.nocookie.net/pixar/images/7/7e/Lightning_McQueenCars_3.png',
  'https://pngimg.com/uploads/cars/cars_PNG11.png',
  'https://pngimg.com/uploads/cars/cars_PNG42.png',
  'https://pngimg.com/uploads/cars/cars_PNG49.png',
  'https://pngimg.com/uploads/cars/cars_PNG31.png',
  'https://pngimg.com/uploads/cars/cars_PNG33.png',
]

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openDemoModal, setOpenDemoModal] = useState<boolean>(false)
  const [openNFTModal, setOpenNFTModal] = useState<boolean>(false)

  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false)
  const [nftMinted, setNftMinted] = useState<boolean>(false)
  const [claimed, setClaimed] = useState<boolean>(false)
  const [claimedImg, setClaimedImg] = useState<string | null>(null)

  const { activeAddress } = useWallet()

  const toggleWalletModal = () => setOpenWalletModal(!openWalletModal)
  const toggleDemoModal = () => setOpenDemoModal(!openDemoModal)
  const toggleNFTModal = () => setOpenNFTModal(!openNFTModal)

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true)
    setOpenDemoModal(false)
  }

  const handleNFTSuccess = () => {
    setNftMinted(true)
    setOpenNFTModal(false)
  }

  const handleClaimTicket = () => {
    const url = mcqueenImages[Math.floor(Math.random() * mcqueenImages.length)]
    setClaimedImg(url)
    setClaimed(true)
    setTimeout(() => setClaimed(false), 2500)
  }

  return (
    <div className="relative hero min-h-screen bg-black overflow-hidden">
      {/* Futuristic bg */}
      <div className="absolute inset-0">
        <div className="animate-pulse opacity-10 bg-gradient-to-r from-red-700 via-black to-red-900 w-[200%] h-[200%] -rotate-12 blur-3xl"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 hero-content text-center rounded-2xl p-10 max-w-lg bg-black/90 border border-gray-800 shadow-[0_0_35px_rgba(255,0,0,0.25)] backdrop-blur-md">
        <div className="max-w-md">
          <h1 className="text-5xl font-extrabold text-gray-100 mb-4 tracking-wide drop-shadow-lg">
            Welcome to <span className="text-red-600">Lightning McQueen&apos;s Era 🏎️</span>
          </h1>

          <p className="py-4 text-lg text-gray-400 leading-relaxed">
            Claim your <span className="text-red-500 font-semibold">exclusive McQueen Ticket</span> and unlock the new era of <span className="text-white font-bold">futuristic racing</span>.
          </p>

          {/* Buttons Flow */}
          <div className="flex flex-col gap-4 mt-6">
            {/* Always show Connect */}
            <button
              data-test-id="connect-wallet"
              className="btn bg-black text-red-500 border border-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 shadow-lg"
              onClick={toggleWalletModal}
            >
              {activeAddress ? 'Wallet Connected ✅' : 'Connect Wallet'}
            </button>

            {/* After wallet connected, before payment */}
            {activeAddress && !paymentSuccess && (
              <button
                data-test-id="transactions-demo"
                className="btn bg-neutral-900 text-gray-300 border border-gray-600 hover:bg-gray-700 hover:text-white transition-all duration-300 shadow-lg"
                onClick={toggleDemoModal}
              >
                Send Payment
              </button>
            )}

            {/* After successful payment → show Mint button */}
            {activeAddress && paymentSuccess && !nftMinted && (
              <button
                data-test-id="mint-nft"
                className="btn bg-gradient-to-r from-red-500 to-red-700 text-white border-none hover:from-red-600 hover:to-red-800 transition-all duration-300 shadow-xl"
                onClick={toggleNFTModal}
              >
                Mint MasterPass NFT
              </button>
            )}

            {/* After NFT minted → show Claim button */}
            {activeAddress && paymentSuccess && nftMinted && !claimedImg && (
              <button
                className="btn bg-gradient-to-r from-gray-100 to-gray-300 text-black border-none hover:from-red-500 hover:to-red-600 hover:text-white transition-all duration-300 shadow-xl"
                onClick={handleClaimTicket}
              >
                Get Your McQueen Now
              </button>
            )}
          </div>

          {/* Success pulse */}
          {claimed && (
            <div className="mt-6 p-4 bg-black/80 border border-green-600 text-green-400 rounded-lg shadow-[0_0_20px_rgba(0,255,0,0.4)] animate-pulse">
              🎉 You&apos;ve claimed your ticket!
            </div>
          )}

          {/* Revealed image */}
          {claimedImg && (
            <div className="mt-6">
              <p className="text-gray-300 mb-3 font-medium">Here’s your McQueen:</p>
              <img
                src="https://wallpapercat.com/w/full/e/c/e/949509-1946x1366-desktop-hd-mcqueen-cars-wallpaper-image.jpg"
                alt="Lightning McQueen"
                className="w-72 h-auto mx-auto rounded-xl shadow-[0_10px_30px_rgba(255,0,0,0.25)] border border-red-800"
              />
            </div>
          )}

          {/* Modals */}
          <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
          <Transact openModal={openDemoModal} setModalState={setOpenDemoModal} onSuccess={handlePaymentSuccess} />
          <NFTmint openModal={openNFTModal} setModalState={setOpenNFTModal} onSuccess={handleNFTSuccess} />
        </div>
      </div>
    </div>
  )
}

export default Home
