import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface TokenmintInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
  onSuccess: () => void
}

const Tokenmint = ({ openModal, setModalState, onSuccess }: TokenmintInterface) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [assetName, setAssetName] = useState<string>('')
  const [unitName, setUnitName] = useState<string>('')
  const [totalSupply, setTotalSupply] = useState<string>('') // store as string, convert later
  const [decimals, setDecimals] = useState<string>('0')

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({ algodConfig })

  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const handleMintToken = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setLoading(true)

    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect wallet first', { variant: 'warning' })
      setLoading(false)
      return
    }

    if (!assetName || !unitName || !totalSupply) {
      enqueueSnackbar('Please fill in all fields', { variant: 'warning' })
      setLoading(false)
      return
    }

    const onChainTotal = BigInt(totalSupply)
    const decimalsBig = decimals || '0'

    try {
      enqueueSnackbar('Minting token...', { variant: 'info' })

      const createResult = await algorand.send.assetCreate({
        sender: activeAddress,
        signer: transactionSigner,
        total: onChainTotal,
        decimals: Number(decimalsBig),
        assetName,
        unitName,
        defaultFrozen: false,
      })

      enqueueSnackbar(`Token minted! TxID: ${createResult.txIds[0]}`, { variant: 'success' })

      // reset form
      setAssetName('')
      setUnitName('')
      setTotalSupply('')
      setDecimals('0')

      onSuccess()
    } catch (e) {
      console.error(e)
      enqueueSnackbar('Failed to mint token', { variant: 'error' })
    }

    setLoading(false)
  }

  return (
    <dialog id="tokenmint_modal" className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}>
      <form method="dialog" className="modal-box">
        <h3 className="font-bold text-lg">Mint your Algorand Token 💰</h3>
        <br />

        <input
          type="text"
          placeholder="Asset Name (e.g., McQueen Token)"
          className="input input-bordered w-full mb-2"
          value={assetName}
          onChange={(e) => setAssetName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Unit Name (e.g., MPT)"
          className="input input-bordered w-full mb-2"
          value={unitName}
          onChange={(e) => setUnitName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Total Supply (whole number)"
          className="input input-bordered w-full mb-2"
          value={totalSupply}
          onChange={(e) => setTotalSupply(e.target.value)}
          min={1}
        />
        <input
          type="number"
          placeholder="Decimals (0 for whole tokens)"
          className="input input-bordered w-full mb-4"
          value={decimals}
          onChange={(e) => setDecimals(e.target.value)}
          min={0}
        />

        <div className="modal-action">
          <button
            type="button"
            className="btn"
            onClick={() => setModalState(!openModal)}
          >
            Close
          </button>

          <button
            type="button"
            className={`btn ${assetName && unitName && totalSupply ? '' : 'btn-disabled'}`}
            onClick={handleMintToken}
            disabled={loading || !assetName || !unitName || !totalSupply}
          >
            {loading ? <span className="loading loading-spinner" /> : 'Mint Token'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default Tokenmint
