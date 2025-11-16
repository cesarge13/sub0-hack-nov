# Flow 2: Document Registration - Complete Implementation Guide

## Overview

Flow 2 implements a complete document registration system that:
1. Uploads PDF documents
2. Computes SHA-256 hashes for integrity verification
3. Requests ECDSA signatures from user wallets
4. Encrypts documents client-side using AES-256-GCM
5. Uploads encrypted blobs to Arkiv Network
6. Stores metadata on Arkiv
7. Automatically publishes Merkle commitments to Mendoza Network

## Architecture

### Technology Stack

- **Frontend Framework**: Vite + React + TypeScript
- **Wallet Connection**: wagmi + viem (already configured)
- **Signing**: ethers.js (for ECDSA signatures)
- **Encryption**: Web Crypto API (AES-256-GCM)
- **Hashing**: Web Crypto API (SHA-256)
- **Storage**: Arkiv Network
- **Blockchain**: Mendoza Network (via Arkiv)

### File Structure

```
src/
├── components/
│   └── DocumentRegister.tsx      # Main component
├── utils/
│   ├── crypto/
│   │   ├── hashing.ts            # SHA-256 utilities
│   │   └── encryption.ts         # AES-256-GCM utilities
│   ├── wallet/
│   │   └── signer.ts              # ECDSA signing with ethers.js
│   └── arkiv/
│       └── client.ts              # Arkiv API client
└── config/
    └── wagmi.ts                   # Network configuration
```

## How It Works

### Step-by-Step Flow

#### 1. **Document Upload**
- User selects a PDF file
- File is validated (type and size)
- File is read as `ArrayBuffer` for processing

#### 2. **Hash Computation**
- SHA-256 hash is computed from the original PDF `ArrayBuffer`
- Hash is stored as a hex string
- This hash serves as the document's unique fingerprint

**Why SHA-256?**
- Cryptographically secure one-way hash function
- Produces a unique 256-bit (32-byte) hash for each document
- Any change to the document produces a completely different hash
- Used for integrity verification

#### 3. **ECDSA Signature**
- User's wallet is requested to sign the hash
- Uses ethers.js to interact with MetaMask/wallet provider
- Signature proves ownership and authenticity
- Signature is stored along with the signer's address

**Why ECDSA?**
- Standard for Ethereum wallet signatures
- Provides cryptographic proof that the document was signed by the wallet owner
- Can be verified later using the signer's public key (address)

#### 4. **AES-256-GCM Encryption**
- A random 256-bit AES key is generated
- A random 96-bit nonce is generated
- The original PDF is encrypted using AES-256-GCM
- Encryption happens entirely client-side (never leaves the browser)

**Why AES-256-GCM?**
- **AES-256**: Industry-standard encryption with 256-bit keys (extremely secure)
- **GCM Mode**: Provides authenticated encryption (detects tampering)
- **Client-side**: Ensures privacy - document is encrypted before upload
- **Nonce**: Ensures same document encrypted multiple times produces different ciphertexts

**Security Properties:**
- Confidentiality: Only someone with the key can decrypt
- Integrity: GCM authentication tag detects any tampering
- Authenticity: Signature proves who encrypted/signed

#### 5. **Blob Upload to Arkiv**
- Encrypted blob is uploaded to Arkiv Network
- Arkiv returns an `objectID` (content identifier)
- The encrypted blob is stored on decentralized storage

**How Arkiv Stores Blobs:**
- Arkiv uses IPFS (InterPlanetary File System) for storage
- Each blob gets a unique CID (Content Identifier)
- Blobs are distributed across multiple nodes
- Redundant and censorship-resistant storage

#### 6. **Metadata Upload**
- Metadata object is created containing:
  - `hash`: SHA-256 hash of original document
  - `signature`: ECDSA signature of the hash
  - `signer`: Wallet address that signed
  - `objectID`: Reference to encrypted blob
  - `timestamp`: When registration occurred
  - `fileName`, `fileSize`, `mimeType`: Document metadata
- Metadata is uploaded to Arkiv
- Arkiv returns a `metadataID`

**Why Separate Metadata?**
- Metadata is public and searchable
- Contains verification information (hash, signature)
- Links to encrypted blob via `objectID`
- Enables verification without exposing encrypted content

#### 7. **Merkle Commitment**
- Arkiv automatically creates a Merkle tree from metadata
- Merkle root is published to Mendoza Network blockchain
- This creates an immutable record on-chain
- Transaction hash is returned (if available)

**How Merkle Commitments Work:**
- Multiple metadata entries are grouped into a Merkle tree
- Root hash represents all entries
- Publishing root to blockchain creates immutable proof
- Individual entries can be verified against the root
- Efficient: One transaction can represent many documents

## Encryption Deep Dive

### AES-256-GCM Process

1. **Key Generation**
   ```typescript
   const key = await crypto.subtle.generateKey(
     { name: 'AES-GCM', length: 256 },
     true, // extractable
     ['encrypt', 'decrypt']
   );
   ```

2. **Nonce Generation**
   ```typescript
   const nonce = crypto.getRandomValues(new Uint8Array(12)); // 96 bits
   ```

3. **Encryption**
   ```typescript
   const encrypted = await crypto.subtle.encrypt(
     {
       name: 'AES-GCM',
       iv: nonce,
       tagLength: 128 // 128-bit authentication tag
     },
     key,
     data
   );
   ```

### Security Considerations

- **Key Storage**: The encryption key is NOT stored. Users must keep it secure if they want to decrypt later.
- **Nonce**: Must be unique for each encryption with the same key
- **Authentication Tag**: GCM automatically includes a tag that verifies integrity
- **Client-Side Only**: Encryption happens in the browser, never sent to servers

## Arkiv Storage Architecture

### Blob Storage
- Encrypted blobs are stored on IPFS
- Each blob has a unique CID (Content Identifier)
- CIDs are deterministic: same content = same CID
- Distributed across multiple nodes

### Metadata Storage
- Metadata is stored separately from blobs
- Contains verification information
- Links to blob via `objectID`
- Searchable and queryable

### Merkle Tree Commitments
- Arkiv groups metadata into Merkle trees
- Root hash is published to Mendoza Network
- Creates immutable on-chain record
- Enables efficient batch verification

## Verification Process

### How Users Can Verify Documents Later

1. **Retrieve Metadata**
   - Use `metadataID` to fetch metadata from Arkiv
   - Contains hash, signature, signer address, and objectID

2. **Verify Signature**
   - Extract hash from metadata
   - Extract signature from metadata
   - Use signer's public key (address) to verify signature
   - Confirms document was signed by claimed wallet

3. **Verify Hash**
   - Download encrypted blob using `objectID`
   - Decrypt blob (requires encryption key)
   - Compute SHA-256 hash of decrypted document
   - Compare with hash in metadata
   - Confirms document integrity

4. **Verify On-Chain Commitment**
   - Check Merkle root on Mendoza Network
   - Verify metadata entry is included in the tree
   - Confirms registration timestamp and immutability

### Example Verification Code

```typescript
// 1. Get metadata
const metadata = await arkivClient.getMetadata(metadataID);

// 2. Verify signature (using ethers.js)
import { verifyMessage } from 'ethers';
const recoveredAddress = verifyMessage(metadata.hash, metadata.signature);
const isValid = recoveredAddress.toLowerCase() === metadata.signer.toLowerCase();

// 3. Get and decrypt blob
const encryptedBlob = await arkivClient.getBlob(metadata.objectID);
const decryptedData = await decryptAES256GCM(
  encryptedBlob,
  encryptionKey, // User must provide
  nonce // User must provide
);

// 4. Verify hash
const computedHash = await computeSHA256(decryptedData);
const hashMatches = computedHash === metadata.hash;
```

## Usage

### Basic Usage

```tsx
import { DocumentRegister } from './components/DocumentRegister';

function App() {
  return (
    <DocumentRegister
      onComplete={(result) => {
        console.log('Registration complete:', result);
        console.log('Object ID:', result.objectID);
        console.log('Metadata ID:', result.metadataID);
      }}
    />
  );
}
```

### Integration with Existing App

The component can be integrated into your existing app:

```tsx
// In App.tsx or Dashboard.tsx
import { DocumentRegister } from './components/DocumentRegister';

// Add to your screen routing
case 'documents':
  return (
    <DocumentRegister
      onClose={() => setShowDocumentRegister(false)}
      onComplete={(result) => {
        // Handle completion
        console.log('Document registered:', result);
      }}
    />
  );
```

## API Configuration

### Arkiv API Endpoint

The Arkiv client is configured in `src/utils/arkiv/client.ts`:

```typescript
const ARKIV_API_BASE = 'https://api.arkiv.network';
```

**Note**: Update this URL based on the actual Arkiv API endpoint. Check the [Arkiv documentation](https://arkiv.network/dev) for the correct endpoint.

### Mendoza Network

The network is already configured in `src/config/wagmi.ts`:
- Chain ID: `60138453056`
- RPC: `https://mendoza.hoodi.arkiv.network/rpc`

## Error Handling

The component includes comprehensive error handling:

- **File Validation**: Checks file type and size
- **Wallet Connection**: Validates wallet is connected before signing
- **Network Errors**: Handles API failures gracefully
- **User Feedback**: Clear error messages at each step

## Security Best Practices

1. **Never Store Encryption Keys**: Keys are generated client-side and should be kept by the user
2. **Validate All Inputs**: File type, size, and format validation
3. **Use HTTPS**: Always use secure connections for API calls
4. **Verify Signatures**: Always verify signatures before trusting data
5. **Protect Private Keys**: Never expose wallet private keys

## Troubleshooting

### Common Issues

1. **"No Ethereum provider found"**
   - Install MetaMask or another wallet extension
   - Ensure wallet is unlocked

2. **"Failed to sign hash"**
   - Check wallet is connected
   - Ensure user approves signature request

3. **"Arkiv API error"**
   - Verify API endpoint is correct
   - Check network connectivity
   - Verify API is accessible

4. **"Encryption failed"**
   - Ensure browser supports Web Crypto API
   - Check file is not corrupted

## Future Enhancements

Potential improvements:

1. **Key Management**: Add secure key storage/export functionality
2. **Batch Upload**: Support multiple documents at once
3. **Progress Tracking**: Show detailed progress for large files
4. **Verification UI**: Add document verification interface
5. **Key Recovery**: Implement key recovery mechanisms
6. **Metadata Search**: Add search functionality for registered documents

## Resources

- [Arkiv Network Documentation](https://arkiv.network/getting-started/typescript)
- [Arkiv Dev Portal](https://arkiv.network/dev)
- [Mendoza Network RPC](https://mendoza.hoodi.arkiv.network/rpc)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [ethers.js Documentation](https://docs.ethers.org/)

## License

This implementation is part of the Certik project.

