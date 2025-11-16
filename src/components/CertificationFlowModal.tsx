import { useState } from 'react';
import { X, Upload, Hash, FileKey, Lock, Cloud, Database, CheckCircle, Loader, AlertCircle } from 'lucide-react';

interface CertificationFlowModalProps {
  onClose: () => void;
  walletAddress: string | null;
}

type Step = 'upload' | 'hashing' | 'signing' | 'encrypting' | 'blob-upload' | 'metadata' | 'commitment' | 'complete';

export function CertificationFlowModal({ onClose, walletAddress }: CertificationFlowModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [encryptionKey, setEncryptionKey] = useState<string>('');
  const [blobCID, setBlobCID] = useState<string>('');
  const [metadataCID, setMetadataCID] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  const steps = [
    { id: 'upload', label: 'Upload PDF', icon: Upload, desc: 'Select document', color: 'teal' },
    { id: 'hashing', label: 'Hash Document', icon: Hash, desc: 'SHA-256', color: 'blue' },
    { id: 'signing', label: 'Wallet Signature', icon: FileKey, desc: 'ECDSA', color: 'purple' },
    { id: 'encrypting', label: 'Encrypt File', icon: Lock, desc: 'AES-256-GCM', color: 'amber' },
    { id: 'blob-upload', label: 'Upload to Arkiv', icon: Cloud, desc: 'arkiv.putBlob', color: 'emerald' },
    { id: 'metadata', label: 'Store Metadata', icon: Database, desc: 'arkiv.putMetadata', color: 'cyan' },
    { id: 'commitment', label: 'Blockchain Commit', icon: CheckCircle, desc: 'Mendoza Network', color: 'green' }
  ];

  const stepIndex = steps.findIndex(s => s.id === currentStep);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const simulateStep = async (nextStep: Step, delay: number = 2000) => {
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, delay));
    setProcessing(false);
    setCurrentStep(nextStep);
  };

  const handleStartCertification = async () => {
    if (!selectedFile || !walletAddress) return;

    // Step 1: Hashing
    await simulateStep('hashing', 1500);
    setFileHash('0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''));
    
    // Step 2: Signing
    await simulateStep('signing', 2000);
    setSignature('0x' + Array(130).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''));
    
    // Step 3: Encrypting
    await simulateStep('encrypting', 1500);
    setEncryptionKey(Array(32).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''));
    
    // Step 4: Blob Upload
    await simulateStep('blob-upload', 2500);
    setBlobCID('bafy' + Array(55).fill(0).map(() => '0123456789abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 36)]).join(''));
    
    // Step 5: Metadata
    await simulateStep('metadata', 2000);
    setMetadataCID('bafy' + Array(55).fill(0).map(() => '0123456789abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 36)]).join(''));
    
    // Step 6: Commitment
    await simulateStep('commitment', 2500);
    
    // Complete
    setCurrentStep('complete');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Document Certification Workflow</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Cryptographic certification using Arkiv Protocol</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Stepper */}
        <div className="p-6 bg-gray-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isComplete = index < stepIndex;
              const isPending = index > stepIndex;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div 
                      className={`
                        w-14 h-14 rounded-xl flex items-center justify-center transition-all
                        ${isComplete 
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30' 
                          : isActive
                          ? `bg-gradient-to-br from-${step.color}-500 to-${step.color}-600 text-white shadow-lg animate-pulse`
                          : 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-gray-500'
                        }
                      `}
                    >
                      {isComplete ? (
                        <CheckCircle className="w-7 h-7" />
                      ) : (
                        <Icon className="w-7 h-7" />
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <p className={`text-sm font-medium ${isActive || isComplete ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{step.desc}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 rounded-full ${isComplete ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gray-200 dark:bg-slate-700'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {currentStep === 'upload' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Upload PDF Document</h3>
                <p className="text-gray-600 dark:text-gray-400">Select a PDF file to begin the certification process</p>
              </div>

              {!walletAddress && (
                <div className="flex items-center gap-3 p-4 bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">Please connect your wallet to continue</p>
                </div>
              )}

              <label className="block">
                <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-12 text-center hover:border-teal-500 dark:hover:border-teal-500 transition-colors cursor-pointer">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">PDF files only (Max 10MB)</p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={!walletAddress}
                  />
                </div>
              </label>

              {selectedFile && (
                <div className="flex items-center justify-between p-4 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <button
                    onClick={handleStartCertification}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium shadow-lg shadow-teal-500/30 transition-all"
                  >
                    Start Certification
                  </button>
                </div>
              )}
            </div>
          )}

          {currentStep === 'hashing' && (
            <ProcessingStep
              title="Generating Document Hash"
              description="Computing SHA-256 hash of the document..."
              icon={Hash}
              color="blue"
              processing={processing}
              result={fileHash}
              resultLabel="Document Hash"
            />
          )}

          {currentStep === 'signing' && (
            <ProcessingStep
              title="Requesting Wallet Signature"
              description="Signing document hash with your private key (ECDSA)..."
              icon={FileKey}
              color="purple"
              processing={processing}
              result={signature}
              resultLabel="Signature"
              code={`// ethers.js signature\nconst signature = await signer.signMessage(documentHash);\n// Signature: ${signature.slice(0, 30)}...`}
            />
          )}

          {currentStep === 'encrypting' && (
            <ProcessingStep
              title="Encrypting Document"
              description="Encrypting file with AES-256-GCM..."
              icon={Lock}
              color="amber"
              processing={processing}
              result={encryptionKey}
              resultLabel="Encryption Key"
              code={`// AES-256-GCM encryption\nconst encryptedBlob = await encryptFile(file, key);\n// Key: ${encryptionKey.slice(0, 30)}...`}
            />
          )}

          {currentStep === 'blob-upload' && (
            <ProcessingStep
              title="Uploading to Arkiv"
              description="Uploading encrypted document via arkiv.putBlob..."
              icon={Cloud}
              color="emerald"
              processing={processing}
              result={blobCID}
              resultLabel="Blob CID"
              code={`// Arkiv SDK upload\nconst blobCID = await arkiv.putBlob(encryptedFile);\n// CID: ${blobCID}`}
            />
          )}

          {currentStep === 'metadata' && (
            <ProcessingStep
              title="Storing Metadata"
              description="Publishing metadata via arkiv.putMetadata..."
              icon={Database}
              color="cyan"
              processing={processing}
              result={metadataCID}
              resultLabel="Metadata CID"
              code={`// Arkiv metadata\nconst metadata = {\n  hash: "${fileHash.slice(0, 20)}...",\n  signature: "${signature.slice(0, 20)}...",\n  blobCID: "${blobCID}"\n};\nconst metadataCID = await arkiv.putMetadata(metadata);`}
            />
          )}

          {currentStep === 'commitment' && (
            <ProcessingStep
              title="Publishing Blockchain Commitment"
              description="Verifying Merkle commitment on Mendoza Network..."
              icon={CheckCircle}
              color="green"
              processing={processing}
              result="Transaction confirmed"
              resultLabel="Status"
              code={`// Blockchain verification\nRPC: https://mendoza.hoodi.arkiv.network/rpc\nMerkle Root: Verified ✓\nBlock: #${Math.floor(Math.random() * 1000000)}`}
            />
          )}

          {currentStep === 'complete' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Certification Complete!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Your document has been successfully certified and committed to the blockchain
              </p>

              <div className="max-w-2xl mx-auto space-y-3 mb-8">
                <InfoRow label="Document Hash" value={fileHash} />
                <InfoRow label="Blob CID" value={blobCID} />
                <InfoRow label="Metadata CID" value={metadataCID} />
              </div>

              <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium shadow-lg shadow-teal-500/30 transition-all"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProcessingStep({ title, description, icon: Icon, color, processing, result, resultLabel, code }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className={`w-20 h-20 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${processing ? 'animate-pulse' : ''}`}>
          {processing ? (
            <Loader className="w-12 h-12 text-white animate-spin" />
          ) : (
            <Icon className="w-12 h-12 text-white" />
          )}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>

      {!processing && result && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{resultLabel}</p>
            <code className="text-sm text-teal-600 dark:text-teal-400 break-all font-mono">
              {result}
            </code>
          </div>

          {code && (
            <div className="p-4 bg-slate-900 rounded-xl">
              <pre className="text-xs text-emerald-400 font-mono overflow-x-auto">
                {code}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <code className="text-xs font-mono text-teal-600 dark:text-teal-400">{value.slice(0, 20)}...</code>
    </div>
  );
}
