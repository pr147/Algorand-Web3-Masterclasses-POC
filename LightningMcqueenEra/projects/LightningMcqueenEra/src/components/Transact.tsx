import { algo, AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface TransactInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
  onSuccess: () => void   // ✅ added to notify Home.tsx
}

const Transact = ({ openModal, setModalState, onSuccess }: TransactInterface) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [receiverAddress, setReceiverAddress] = useState<string>('')

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({ algodConfig })

  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const handleSubmitAlgo = async (e: React.MouseEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect wallet first', { variant: 'warning' })
      setLoading(false)
      return
    }

    try {
      enqueueSnackbar('Sending transaction...', { variant: 'info' })
      const result = await algorand.send.payment({
        signer: transactionSigner,
        sender: activeAddress,
        receiver: receiverAddress,
        amount: algo(1), // 1 Algo
      })

      enqueueSnackbar(`✅ Transaction sent: ${result.txIds[0]}`, { variant: 'success' })
      setReceiverAddress('')

      // 🔑 Notify Home.tsx to show "Get Your McQueen"
      onSuccess()
    } catch (e) {
      enqueueSnackbar('❌ Failed to send transaction', { variant: 'error' })
    }

    setLoading(false)
  }

  return (
    <dialog id="transact_modal" className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}>
      <form method="dialog" className="modal-box">
        <h3 className="font-bold text-lg">Send payment transaction</h3>
        <br />
        <input
          type="text"
          data-test-id="receiver-address"
          placeholder="Provide wallet address"
          className="input input-bordered w-full"
          value={receiverAddress}
          onChange={(e) => setReceiverAddress(e.target.value)}
        />
        <div className="modal-action">
          <button className="btn" onClick={() => setModalState(!openModal)}>
            Close
          </button>
          <button
            data-test-id="send-algo"
            className={`btn ${receiverAddress.length === 58 ? '' : 'btn-disabled'}`}
            onClick={handleSubmitAlgo}
            disabled={loading || receiverAddress.length !== 58}
          >
            {loading ? <span className="loading loading-spinner" /> : 'Send 1 Algo'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default Transact