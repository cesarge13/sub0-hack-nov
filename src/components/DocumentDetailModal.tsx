import { X, FileText, Hash, Clock, CheckCircle, Download, ExternalLink, Shield, Activity } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Document } from '../App';

interface DocumentDetailModalProps {
  document: Document;
  onClose: () => void;
}

export function DocumentDetailModal({ document, onClose }: DocumentDetailModalProps) {
  const statusColors = {
    Valid: { bg: '#00FF9A', text: '#00FF9A', badge: '#00FF9A20' },
    Expired: { bg: '#FF7A3D', text: '#FF7A3D', badge: '#FF7A3D20' },
    Revoked: { bg: '#FF4D4D', text: '#FF4D4D', badge: '#FF4D4D20' },
    Pending: { bg: '#FFD93D', text: '#FFD93D', badge: '#FFD93D20' }
  };

  const color = statusColors[document.status];

  const versionHistory = [
    { version: document.version, date: document.uploadDate, author: document.issuer, status: 'Current' },
    { version: 'v2.0.0', date: '2024-10-15', author: document.issuer, status: 'Previous' },
    { version: 'v1.5.0', date: '2024-09-01', author: document.issuer, status: 'Archived' }
  ];

  const verificationUrl = `https://arkivcert.io/verify/${document.hash}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl"
        style={{
          background: 'linear-gradient(180deg, rgba(10, 15, 28, 0.98) 0%, rgba(0, 0, 0, 0.95) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="p-8 border-b border-white/10 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${color.badge} 0%, transparent 100%)`
          }}
        >
          <div 
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: color.bg }}
          />
          
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  backgroundColor: color.badge,
                  border: `1px solid ${color.bg}40`
                }}
              >
                <FileText className="w-8 h-8" style={{ color: color.text }} />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">{document.name}</h2>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400">ID: {document.id}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">Issuer: {document.issuer}</span>
                  <span className="text-gray-400">•</span>
                  <span 
                    className="px-3 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: color.badge,
                      color: color.text
                    }}
                  >
                    {document.status}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* File Preview */}
              <div 
                className="rounded-2xl p-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  File Preview
                </h3>
                <div 
                  className="h-64 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 255, 154, 0.05) 0%, rgba(75, 163, 255, 0.05) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-gray-400">{document.fileType} Document</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {(document.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Hash Metadata */}
              <div 
                className="rounded-2xl p-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  Arkiv Hash Fingerprint
                </h3>
                <div 
                  className="p-4 rounded-xl mb-4"
                  style={{
                    background: 'rgba(0, 255, 154, 0.05)',
                    border: '1px solid rgba(0, 255, 154, 0.2)'
                  }}
                >
                  <code className="text-[#00FF9A] text-sm break-all font-mono">
                    {document.hash}
                  </code>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Algorithm</span>
                    <p className="text-white mt-1">SHA-256</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Blockchain</span>
                    <p className="text-white mt-1">Arkiv Network</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Upload Date</span>
                    <p className="text-white mt-1">{document.uploadDate}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">File Type</span>
                    <p className="text-white mt-1">{document.fileType}</p>
                  </div>
                </div>
              </div>

              {/* Version History */}
              <div 
                className="rounded-2xl p-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Version History
                </h3>
                <div className="space-y-4">
                  {versionHistory.map((v, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="relative">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: idx === 0 ? '#00FF9A20' : 'rgba(255, 255, 255, 0.05)',
                            border: idx === 0 ? '2px solid #00FF9A' : '1px solid rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          {idx === 0 ? (
                            <CheckCircle className="w-5 h-5 text-[#00FF9A]" />
                          ) : (
                            <div className="w-2 h-2 bg-gray-500 rounded-full" />
                          )}
                        </div>
                        {idx < versionHistory.length - 1 && (
                          <div className="absolute top-10 left-5 w-px h-8 bg-white/10" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">{v.version}</span>
                          {idx === 0 && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-[#00FF9A]/20 text-[#00FF9A]">
                              {v.status}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          {v.date} • {v.author}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* TTL Countdown */}
              <div 
                className="rounded-2xl p-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  TTL Status
                </h3>
                <div className="text-center">
                  <div 
                    className="text-5xl font-bold mb-2"
                    style={{ 
                      color: document.ttlDays <= 7 ? '#FF7A3D' : document.ttlDays <= 30 ? '#FFD93D' : '#00FF9A'
                    }}
                  >
                    {document.ttlDays > 0 ? document.ttlDays : 0}
                  </div>
                  <p className="text-gray-400 mb-4">
                    {document.ttlDays > 0 ? 'days remaining' : 'Expired'}
                  </p>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(0, Math.min(100, (document.ttlDays / 365) * 100))}%`,
                        background: document.ttlDays <= 30 
                          ? 'linear-gradient(90deg, #FF7A3D 0%, #FFD93D 100%)'
                          : 'linear-gradient(90deg, #00FF9A 0%, #22C3C3 100%)'
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Expires: {document.expirationDate}
                  </p>
                </div>
              </div>

              {/* QR Code */}
              <div 
                className="rounded-2xl p-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <h3 className="text-lg font-bold text-white mb-4">QR Verification</h3>
                <div className="bg-white p-4 rounded-xl">
                  <QRCodeSVG
                    value={verificationUrl}
                    size={180}
                    level="H"
                    includeMargin
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
                <p className="text-xs text-gray-400 text-center mt-3">
                  Scan to verify document authenticity
                </p>
              </div>

              {/* Integrity Score */}
              <div 
                className="rounded-2xl p-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Integrity Score
                </h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#00FF9A] mb-2">
                    {document.integrityScore}%
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{
                        width: `${document.integrityScore}%`,
                        background: 'linear-gradient(90deg, #00FF9A 0%, #22C3C3 100%)'
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Document has passed all integrity checks
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  className="w-full px-4 py-3 rounded-xl font-medium text-black transition-all flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #00FF9A 0%, #22C3C3 100%)',
                    boxShadow: '0 4px 20px rgba(0, 255, 154, 0.3)'
                  }}
                >
                  <CheckCircle className="w-5 h-5" />
                  Verify Document
                </button>
                <button className="w-full px-4 py-3 rounded-xl font-medium text-white bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download
                </button>
                <button className="w-full px-4 py-3 rounded-xl font-medium text-white bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  View on Arkiv
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
