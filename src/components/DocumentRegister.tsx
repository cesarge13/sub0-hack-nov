/**
 * DocumentRegister Component - Flow 2: Document Registration
 * 
 * Complete implementation of document registration flow:
 * 1. User uploads PDF
 * 2. Compute SHA-256 hash
 * 3. Request ECDSA signature from wallet
 * 4. Generate AES-256-GCM key + nonce
 * 5. Encrypt PDF client-side
 * 6. Display results (hash, signature, encryption info)
 * 8. Display results (objectID, metadataID, transaction info)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { logger } from '../utils/logger';
import { 
  Upload, 
  FileText, 
  Hash, 
  Lock, 
  CloudUpload, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  X,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { computeFileHash } from '../utils/crypto/hashing';
import { encryptFile, EncryptionResult } from '../utils/crypto/encryption';
import { signHash, getWalletAddress } from '../utils/wallet/signer';

type FlowStep = 'upload' | 'hashing' | 'signing' | 'encrypting' | 'blob-upload' | 'metadata-upload' | 'complete';

interface DocumentRegisterProps {
  onClose?: () => void;
  onComplete?: (result: RegistrationResult) => void;
}

export interface RegistrationResult {
  objectID: string;
  metadataID: string;
  hash: string;
  signature: string;
  signer: string;
  fileName: string;
  fileSize: number;
  merkleRoot?: string;
  transactionHash?: string;
}

export function DocumentRegister({ onClose, onComplete }: DocumentRegisterProps) {
  const { address: walletAddress, isConnected } = useAccount();
  
  // Flow state
  const [currentStep, setCurrentStep] = useState<FlowStep>('upload');
  const [error, setError] = useState<string | null>(null);
  
  // Document state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  // Processing state
  const [hash, setHash] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [signerAddress, setSignerAddress] = useState<string | null>(null);
  const [encryptionResult, setEncryptionResult] = useState<EncryptionResult | null>(null);
  const [objectID, setObjectID] = useState<string | null>(null);
  const [metadataID, setMetadataID] = useState<string | null>(null);
  
  // Result state
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Refs to avoid circular dependencies in useCallback
  const handleSignHashRef = useRef<() => Promise<void>>();
  const handleEncryptRef = useRef<() => Promise<void>>();
  const handleUploadBlobRef = useRef<() => Promise<void>>();
  const handleUploadMetadataRef = useRef<() => Promise<void>>();
  
  /**
   * Step 1: Handle file upload
   */
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    logger.flow('File selected', { 
      fileCount: event.target.files?.length || 0 
    });
    
    const file = event.target.files?.[0];
    if (!file) {
      logger.warn('No file selected', null, 'FLOW');
      return;
    }
    
    logger.flow('Validating file', {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      fileType: file.type
    });
    
    // Validate file type (PDF only)
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      logger.error('Invalid file type', { fileType: file.type, fileName: file.name }, 'FLOW');
      setError('Please upload a PDF file');
      return;
    }
    
    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      logger.error('File too large', { 
        fileSize: file.size, 
        maxSize 
      }, 'FLOW');
      setError('File size must be less than 50MB');
      return;
    }
    
    logger.flow('File validated successfully', {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`
    });
    
    setError(null);
    setSelectedFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setFilePreview(previewUrl);
  }, []);

  /**
   * Step 2: Compute SHA-256 hash of the PDF
   */
  const handleComputeHash = useCallback(async () => {
    logger.flow('Starting hash computation', {
      fileName: selectedFile?.name
    });
    
    if (!selectedFile) {
      logger.error('No file selected for hashing', null, 'FLOW');
      setError('Please select a file first');
      return;
    }
    
    setCurrentStep('hashing');
    setError(null);
    logger.flow('Step changed to: hashing');
    
    try {
      logger.flow('Computing SHA-256 hash...');
      const hashStartTime = performance.now();
      
      const computedHash = await computeFileHash(selectedFile);
      
      const hashDuration = performance.now() - hashStartTime;
      logger.flow('Hash computed successfully', {
        hash: computedHash.substring(0, 20) + '...',
        duration: `${hashDuration.toFixed(2)}ms`
      });
      
      setHash(computedHash);
      logger.flow('Moving to signing step');
      setCurrentStep('signing');
      
      // Automatically trigger signing after hash computation
      logger.flow('Auto-triggering signing...');
      setTimeout(() => {
        if (isConnected && walletAddress) {
          if (handleSignHashRef.current) {
            handleSignHashRef.current();
          } else {
            logger.warn('handleSignHash not available in ref yet', null, 'FLOW');
          }
        } else {
          logger.warn('Wallet not connected, waiting for user to connect', null, 'FLOW');
        }
      }, 100);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Hash computation failed', { error: errorMsg }, 'FLOW');
      setError(`Failed to compute hash: ${errorMsg}`);
      setCurrentStep('upload');
    }
  }, [selectedFile, isConnected, walletAddress]); // Added dependencies for auto-trigger

  /**
   * Step 3: Request ECDSA signature from wallet
   */
  const handleSignHash = useCallback(async () => {
    logger.flow('Starting hash signing process', { hash: hash?.substring(0, 20) + '...' });
    
    if (!hash) {
      logger.error('Hash not computed yet', null, 'FLOW');
      setError('Hash not computed yet');
      return;
    }
    
    if (!isConnected || !walletAddress) {
      logger.warn('Wallet not connected', { isConnected, walletAddress }, 'FLOW');
      setError('Please connect your wallet first');
      return;
    }
    
    setCurrentStep('signing');
    setError(null);
    logger.flow('Step changed to: signing');
    
    try {
      logger.wallet('Getting wallet address...');
      const startTime = performance.now();
      
      // Get signer address
      const address = await getWalletAddress();
      setSignerAddress(address);
      
      const addressDuration = performance.now() - startTime;
      logger.wallet('Wallet address obtained', { 
        address, 
        duration: `${addressDuration.toFixed(2)}ms` 
      });
      
      // Sign the hash
      logger.wallet('Requesting signature from wallet...', { hash: hash.substring(0, 20) + '...' });
      const signStartTime = performance.now();
      
      const sig = await signHash(hash);
      setSignature(sig);
      
      const signDuration = performance.now() - signStartTime;
      logger.wallet('Hash signed successfully', { 
        signature: sig.substring(0, 30) + '...',
        duration: `${signDuration.toFixed(2)}ms`
      });
      
      logger.flow('Signature complete, moving to encryption step');
      setCurrentStep('encrypting');
      
      // Automatically trigger encryption after signing
      logger.flow('Auto-triggering encryption...');
      setTimeout(() => {
        if (handleEncryptRef.current) {
          handleEncryptRef.current();
        } else {
          logger.error('handleEncrypt not available in ref', null, 'FLOW');
        }
      }, 100);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Failed to sign hash', { error: errorMsg, hash: hash?.substring(0, 20) + '...' }, 'FLOW');
      setError(`Failed to sign hash: ${errorMsg}`);
      setCurrentStep('hashing');
    }
  }, [hash, isConnected, walletAddress]); // handleEncrypt will be called via setTimeout

  /**
   * Step 4: Generate AES-256-GCM key and encrypt PDF
   */
  const handleEncrypt = useCallback(async () => {
    logger.flow('Starting encryption process', { 
      fileName: selectedFile?.name,
      fileSize: selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB` : 'unknown'
    });
    
    if (!selectedFile) {
      logger.error('File not selected for encryption', null, 'FLOW');
      setError('File not selected');
      return;
    }
    
    // Don't change step if already encrypting (to avoid UI flicker)
    if (currentStep !== 'encrypting') {
      setCurrentStep('encrypting');
      logger.flow('Step changed to: encrypting');
    }
    setError(null);
    
    try {
      logger.flow('Calling encryptFile...');
      const encryptStartTime = performance.now();
      
      const result = await encryptFile(selectedFile);
      
      const encryptDuration = performance.now() - encryptStartTime;
      logger.flow('Encryption completed', {
        encryptedSize: `${(result.encryptedData.byteLength / 1024).toFixed(2)} KB`,
        duration: `${encryptDuration.toFixed(2)}ms`
      });
      
      setEncryptionResult(result);
      logger.flow('Moving to blob upload step');
      setCurrentStep('blob-upload');
      
      // Automatically trigger blob upload after encryption
      logger.flow('Auto-triggering blob upload...');
      setTimeout(() => {
        if (handleUploadBlobRef.current) {
          handleUploadBlobRef.current();
        } else {
          logger.error('handleUploadBlob not available in ref', null, 'FLOW');
        }
      }, 100);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Encryption failed', { 
        error: errorMsg,
        fileName: selectedFile.name 
      }, 'FLOW');
      setError(`Encryption failed: ${errorMsg}`);
      setCurrentStep('signing');
    }
  }, [selectedFile, currentStep]);
  
  // Update ref when handleEncrypt changes
  useEffect(() => {
    handleEncryptRef.current = handleEncrypt;
  }, [handleEncrypt]);

  // Update refs when callbacks change
  useEffect(() => {
    handleSignHashRef.current = handleSignHash;
  }, [handleSignHash]);
  
  /**
   * Copy to clipboard helper
   */
  const copyToClipboard = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  /**
   * Reset flow
   */
  const handleReset = useCallback(() => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setFilePreview(null);
    setHash(null);
    setSignature(null);
    setSignerAddress(null);
    setEncryptionResult(null);
    setObjectID(null);
    setMetadataID(null);
    setRegistrationResult(null);
    setError(null);
  }, []);

  const isStepComplete = (step: FlowStep): boolean => {
    const stepOrder: FlowStep[] = ['upload', 'hashing', 'signing', 'encrypting', 'complete'];
    return stepOrder.indexOf(currentStep) > stepOrder.indexOf(step);
  };

  const isStepActive = (step: FlowStep): boolean => {
    return currentStep === step;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Document Registration</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Upload, Sign & Encrypt Document
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Flow Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          {[
            { step: 'upload', label: 'Upload' },
            { step: 'hashing', label: 'Hash' },
            { step: 'signing', label: 'Sign' },
            { step: 'encrypting', label: 'Encrypt' },
          ].map(({ step, label }, index) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isStepComplete(step as FlowStep)
                      ? 'bg-green-500 border-green-500 text-white'
                      : isStepActive(step as FlowStep)
                      ? 'bg-teal-500 border-teal-500 text-white'
                      : 'bg-gray-100 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-500'
                  }`}
                >
                  {isStepComplete(step as FlowStep) ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : isStepActive(step as FlowStep) ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">{label}</span>
              </div>
              {index < 3 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    isStepComplete(step as FlowStep) ? 'bg-green-500' : 'bg-gray-200 dark:bg-slate-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {/* Step 1: Upload */}
        {currentStep === 'upload' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upload PDF Document</h3>
            
            {!selectedFile ? (
              <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-12 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Select a PDF file to register
                </p>
                <label className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose PDF File
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <FileText className="w-10 h-10 text-teal-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      if (filePreview) URL.revokeObjectURL(filePreview);
                      setFilePreview(null);
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            {selectedFile && (
              <button
                onClick={handleComputeHash}
                className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
              >
                Compute Hash
              </button>
            )}
          </div>
        )}

        {/* Step 2: Hashing */}
        {currentStep === 'hashing' && hash && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hash Computed</h3>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SHA-256 Hash</span>
              </div>
              <code className="text-xs font-mono text-gray-900 dark:text-white break-all block">
                {hash}
              </code>
            </div>
            <button
              onClick={handleSignHash}
              disabled={!isConnected}
              className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {!isConnected ? 'Connect Wallet to Sign' : 'Sign Hash'}
            </button>
          </div>
        )}

        {/* Step 3: Signing */}
        {currentStep === 'signing' && (
          <div className="space-y-4">
            {signature ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hash Signed</h3>
                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="w-5 h-5 text-teal-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Signature</span>
                    </div>
                    <code className="text-xs font-mono text-gray-900 dark:text-white break-all block">
                      {signature}
                    </code>
                  </div>
                  {signerAddress && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Signer:</span>
                      <code className="text-xs font-mono text-gray-900 dark:text-white ml-2">
                        {signerAddress}
                      </code>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleEncrypt}
                  className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                >
                  Encrypt Document
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Signing Hash</h3>
                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Requesting signature from wallet...
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {!isConnected 
                          ? 'Please connect your wallet first' 
                          : 'Approve the signature request in MetaMask. Check console for progress.'}
                      </p>
                    </div>
                  </div>
                  {hash && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hash to sign:</p>
                      <code className="text-xs font-mono text-gray-900 dark:text-white break-all block">
                        {hash.substring(0, 40)}...
                      </code>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4: Encrypting */}
        {currentStep === 'encrypting' && (
          <div className="space-y-4">
            {encryptionResult ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Document Encrypted</h3>
                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-5 h-5 text-teal-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      AES-256-GCM Encryption Complete
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Encrypted size: {(encryptionResult.encryptedData.byteLength / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Document encrypted successfully. Registration complete.
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Encrypting Document</h3>
                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Encrypting with AES-256-GCM...
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        This may take a moment for large files. Check console for progress.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 5: Complete */}
        {currentStep === 'complete' && registrationResult && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
                Registration Complete!
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                Your document has been successfully processed and encrypted
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white">Registration Details</h4>
              
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">File:</span>
                <p className="text-sm text-gray-900 dark:text-white">{registrationResult.fileName}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hash:</span>
                <code className="text-xs font-mono text-gray-900 dark:text-white break-all block mt-1">
                  {registrationResult.hash}
                </code>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Signer:</span>
                <code className="text-xs font-mono text-gray-900 dark:text-white break-all block mt-1">
                  {registrationResult.signer}
                </code>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                Register Another Document
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

