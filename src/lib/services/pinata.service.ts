// Pinata API configuration
const PINATA_API_URL = 'https://api.pinata.cloud'
const PINATA_GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs'

// Types for Pinata responses
interface PinataUploadResponse {
  IpfsHash: string
  PinSize: number
  Timestamp: string
  isDuplicate?: boolean
}

interface PinataPinListResponse {
  rows: {
    ipfs_pin_hash: string
    size: number
    date_pinned: string
    metadata: {
      name: string
      keyvalues: Record<string, string>
    }
  }[]
}

// Get Pinata headers from environment
function getPinataHeaders(): HeadersInit {
  const jwt = process.env.NEXT_PUBLIC_PINATA_JWT || process.env.PINATA_JWT

  if (jwt) {
    return {
      Authorization: `Bearer ${jwt}`,
    }
  }

  // Fallback to API key + secret
  const apiKey = process.env.PINATA_API_KEY
  const apiSecret = process.env.PINATA_API_SECRET

  if (!apiKey || !apiSecret) {
    throw new Error('Pinata credentials not configured')
  }

  return {
    pinata_api_key: apiKey,
    pinata_secret_api_key: apiSecret,
  }
}

// Upload file to IPFS
export async function uploadFileToIpfs(
  file: File,
  metadata?: Record<string, string>
): Promise<{ ipfsHash: string; gatewayUrl: string }> {
  const formData = new FormData()
  formData.append('file', file)

  // Add metadata as Pinata pinning metadata
  if (metadata) {
    const pinataMetadata = JSON.stringify({
      name: file.name,
      keyvalues: metadata,
    })
    formData.append('pinataMetadata', pinataMetadata)
  }

  const pinataOptions = JSON.stringify({
    cidVersion: 1,
  })
  formData.append('pinataOptions', pinataOptions)

  const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
    method: 'POST',
    headers: getPinataHeaders(),
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Pinata upload failed: ${error.error || response.statusText}`)
  }

  const data: PinataUploadResponse = await response.json()

  return {
    ipfsHash: data.IpfsHash,
    gatewayUrl: `${PINATA_GATEWAY_URL}/${data.IpfsHash}`,
  }
}

// Upload JSON to IPFS
export async function uploadJsonToIpfs(
  json: Record<string, unknown>,
  name?: string
): Promise<{ ipfsHash: string; gatewayUrl: string }> {
  const body = JSON.stringify({
    pinataContent: json,
    pinataMetadata: {
      name: name || 'json-upload',
    },
  })

  const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
    method: 'POST',
    headers: {
      ...getPinataHeaders(),
      'Content-Type': 'application/json',
    },
    body,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Pinata JSON upload failed: ${error.error || response.statusText}`)
  }

  const data: PinataUploadResponse = await response.json()

  return {
    ipfsHash: data.IpfsHash,
    gatewayUrl: `${PINATA_GATEWAY_URL}/${data.IpfsHash}`,
  }
}

// Get file from IPFS by hash
export async function getFileFromIpfs(ipfsHash: string): Promise<Blob> {
  const response = await fetch(`${PINATA_GATEWAY_URL}/${ipfsHash}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch from IPFS: ${response.statusText}`)
  }

  return response.blob()
}

// Get JSON from IPFS by hash
export async function getJsonFromIpfs<T = Record<string, unknown>>(
  ipfsHash: string
): Promise<T> {
  const response = await fetch(`${PINATA_GATEWAY_URL}/${ipfsHash}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch JSON from IPFS: ${response.statusText}`)
  }

  return response.json()
}

// List pinned files
export async function listPinnedFiles(): Promise<
  { ipfsHash: string; name: string; size: number; pinnedAt: string }[]
> {
  const response = await fetch(
    `${PINATA_API_URL}/data/pinList?status=pinned&pageLimit=10`,
    {
      headers: getPinataHeaders(),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Pinata list failed: ${error.error || response.statusText}`)
  }

  const data: PinataPinListResponse = await response.json()

  return data.rows.map((row) => ({
    ipfsHash: row.ipfs_pin_hash,
    name: row.metadata.name || 'Unnamed',
    size: row.size,
    pinnedAt: row.date_pinned,
  }))
}

// Unpin file from IPFS
export async function unpinFile(ipfsHash: string): Promise<void> {
  const response = await fetch(`${PINATA_API_URL}/pinning/unpin/${ipfsHash}`, {
    method: 'DELETE',
    headers: getPinataHeaders(),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Pinata unpin failed: ${error.error || response.statusText}`)
  }
}

// Upload KYC document with metadata
export async function uploadKycDocument(
  file: File,
  userId: string,
  documentType: 'passport' | 'driver_license' | 'id_card' | 'selfie'
): Promise<{ ipfsHash: string; gatewayUrl: string }> {
  const metadata = {
    userId,
    documentType,
    uploadedAt: new Date().toISOString(),
    type: 'kyc',
  }

  return uploadFileToIpfs(file, metadata)
}

// Get gateway URL from IPFS hash
export function getGatewayUrl(ipfsHash: string): string {
  return `${PINATA_GATEWAY_URL}/${ipfsHash}`
}

// Check if IPFS hash is valid
export function isValidIpfsHash(hash: string): boolean {
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash) || /^baf[1-9A-HJ-NP-Za-km-z]{50,}$/.test(hash)
}