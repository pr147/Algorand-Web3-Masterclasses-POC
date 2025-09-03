import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState, useEffect } from 'react'
import { sha512_256 } from 'js-sha512'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface NFTmintInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
  onSuccess: (assetId: number, name: string, imageUrl: string) => void
}

const NFTmint = ({ openModal, setModalState, onSuccess }: NFTmintInterface) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [metadataUrl, setMetadataUrl] = useState<string>('')
  const [ticketNumber, setTicketNumber] = useState<number>(1)
  const [previewImage, setPreviewImage] = useState<string>('')
  const [previewLoading, setPreviewLoading] = useState<boolean>(false)

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({ algodConfig })

  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  // Debounced metadata fetch
  useEffect(() => {
    const DEBOUNCE_DELAY = 500

    if (!metadataUrl || !/^https?:\/\/.+/.test(metadataUrl)) {
      setPreviewImage('')
      setPreviewLoading(false)
      return
    }

    const handler = setTimeout(async () => {
      setPreviewLoading(true)
      try {
        const res = await fetch(metadataUrl)
        if (!res.ok) throw new Error('Failed to fetch metadata')
        const metadata = await res.json()
        if (metadata.image) {
          setPreviewImage(metadata.image)
        } else {
          setPreviewImage('')
        }
      } catch {
        setPreviewImage('')
      } finally {
        setPreviewLoading(false)
      }
    }, DEBOUNCE_DELAY)

    return () => clearTimeout(handler)
  }, [metadataUrl])

  const handleMintNFT = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setLoading(true)

    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect wallet first', { variant: 'warning' })
      setLoading(false)
      return
    }

    if (!metadataUrl) {
      enqueueSnackbar('Please provide metadata URL', { variant: 'warning' })
      setLoading(false)
      return
    }

    try {
      enqueueSnackbar('Minting NFT...', { variant: 'info' })

      const hashArray = sha512_256.array(metadataUrl) as number[]
      const metadataHash = new Uint8Array(hashArray)

      const currentTicket = ticketNumber
      const nextTicket = currentTicket + 1

      const createNFTResult = await algorand.send.assetCreate({
        sender: activeAddress,
        signer: transactionSigner,
        total: 1n,
        decimals: 0,
        assetName: `MasterPass Ticket #${currentTicket}`,
        unitName: `MTK${currentTicket}`,
        url: metadataUrl,
        metadataHash,
        defaultFrozen: false,
      })

      const assetId: number | undefined =
        createNFTResult.assetId !== undefined
          ? Number(createNFTResult.assetId)
          : undefined

      if (!assetId) {
        enqueueSnackbar(
          'Could not retrieve Asset ID. Check the transaction in Pera Explorer.',
          { variant: 'warning' }
        )
      }

      enqueueSnackbar(`NFT minted! Asset ID: ${assetId ?? 'unknown'}`, { variant: 'success' })
      setMetadataUrl('')
      setTicketNumber(nextTicket)

      if (assetId) {
        onSuccess(assetId, `MasterPass Ticket #${currentTicket}`, previewImage)
      }
    } catch (e) {
      console.error(e)
      enqueueSnackbar('Failed to mint NFT', { variant: 'error' })
    }

    setLoading(false)
  }

  return (
    <dialog
      id="nftmint_modal"
      className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}
    >
      <form method="dialog" className="modal-box">
        <h3 className="font-bold text-lg">Mint your MasterPass NFT 🚀</h3>
        <p className="text-sm mb-2">
          Paste your metadata URL from Pinata/IPFS below:
        </p>

        <input
          type="text"
          data-test-id="metadata-url"
          placeholder="https://gateway.pinata.cloud/ipfs/YOUR_METADATA_CID"
          className="input input-bordered w-full mb-4"
          value={metadataUrl}
          onChange={(e) => setMetadataUrl(e.target.value)}
        />

        {metadataUrl && (
          <div className="mb-4">
            <p className="text-sm mb-1">Preview:</p>
            <div className="w-48 h-48 flex items-center justify-center border border-gray-300 rounded-md overflow-hidden">
              {previewLoading ? (
                <span className="loading loading-spinner" />
              ) : previewImage ? (
                <img
                  src={previewImage}
                  alt="NFT Preview"
                  className="object-contain w-full h-full"
                />
              ) : (
                <span className="text-gray-400 text-sm">No image found</span>
              )}
            </div>
          </div>
        )}

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
            data-test-id="mint-nft"
            className={`btn ${metadataUrl.length > 0 ? '' : 'btn-disabled'}`}
            onClick={handleMintNFT}
            disabled={loading || metadataUrl.length === 0}
          >
            {loading ? <span className="loading loading-spinner" /> : 'Mint NFT'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default NFTmint
