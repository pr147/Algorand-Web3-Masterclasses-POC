// src/components/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import Transact from './components/Transact'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState(false)
  const [openDemoModal, setOpenDemoModal] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [claimed, setClaimed] = useState(false)

  const { activeAddress } = useWallet()

  const toggleWalletModal = () => setOpenWalletModal(!openWalletModal)
  const toggleDemoModal = () => setOpenDemoModal(!openDemoModal)

  // called after successful payment
  const handlePaymentSuccess = () => {
    setPaymentSuccess(true)
    setOpenDemoModal(false)
  }

  const handleClaimTicket = () => {
    setClaimed(true)
    setTimeout(() => setClaimed(false), 3000)
  }

  return (
    <div className="relative hero min-h-screen bg-black overflow-hidden">
      {/* Futuristic racing streaks background */}
      <div className="absolute inset-0">
        <div className="animate-pulse opacity-10 bg-gradient-to-r from-red-700 via-black to-red-900 w-[200%] h-[200%] -rotate-12 blur-3xl"></div>
      </div>

      {/* Content Card */}
      <div className="relative z-10 hero-content text-center rounded-2xl p-10 max-w-lg bg-black/90 border border-gray-800 shadow-[0_0_35px_rgba(255,0,0,0.25)] backdrop-blur-md">
        <div className="max-w-md">
          {/* Title */}
          <h1 className="text-5xl font-extrabold text-gray-100 mb-4 tracking-wide drop-shadow-lg">
            Welcome to <span className="text-red-600">Lightning McQueen&apos;s Era 🏎️</span>
          </h1>

          {/* Description */}
          <p className="py-4 text-lg text-gray-400 leading-relaxed">
            Claim your <span className="text-red-500 font-semibold">exclusive McQueen Ticket </span>  
            and unlock the new era of <span className="text-white font-bold">futuristic racing</span>.
          </p>

          {/* Buttons Flow */}
          <div className="flex flex-col gap-4 mt-6">
            {/* Always show Connect Wallet */}
            <button
              data-test-id="connect-wallet"
              className="btn bg-black text-red-500 border border-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 shadow-lg"
              onClick={toggleWalletModal}
            >
              {activeAddress ? 'Wallet Connected ✅' : 'Connect Wallet'}
            </button>

            {/* Show Send Payment once wallet connected */}
            {activeAddress && !paymentSuccess && (
              <button
                data-test-id="transactions-demo"
                className="btn bg-neutral-900 text-gray-300 border border-gray-600 hover:bg-gray-700 hover:text-white transition-all duration-300 shadow-lg"
                onClick={toggleDemoModal}
              >
                Send Payment
              </button>
            )}

            {/* Show McQueen button only after payment */}
            {activeAddress && paymentSuccess && (
              <button
                className="btn bg-gradient-to-r from-gray-100 to-gray-300 text-black border-none hover:from-red-500 hover:to-red-600 hover:text-white transition-all duration-300 shadow-xl"
                onClick={handleClaimTicket}
              >
                Get Your McQueen Now
              </button>
            )}
          </div>

          {/* Success Message */}
          {claimed && (
            <div className="mt-6 p-4 bg-black/80 border border-green-600 text-green-400 rounded-lg shadow-[0_0_20px_rgba(0,255,0,0.4)] animate-pulse">
              🎉 You&apos;ve claimed your ticket!
            </div>
          )}

          {/* Modals */}
          <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
          {/* pass onSuccess so Transact can notify when done */}
          <Transact openModal={openDemoModal} setModalState={setOpenDemoModal} onSuccess={handlePaymentSuccess} />
        </div>
      </div>
    </div>
  )
}

export default Home
