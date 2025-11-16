import { useState } from 'react';
import { Search, Filter, Upload, Download, Eye, RefreshCw } from 'lucide-react';
import { DocumentRegister } from './DocumentRegister';

interface DocumentsProps {
  onUploadDocument: () => void;
}

export function Documents({ onUploadDocument }: DocumentsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDocumentRegister, setShowDocumentRegister] = useState(false);

  const documents = [
    { id: 'DOC-001', name: 'ISO 27001 Certification.pdf', issuer: 'CyberSec Corp', version: 'v2.1.0', ttl: 45, integrity: 98, status: 'Valid', hash: '0x7a9c8b3e...' },
    { id: 'DOC-002', name: 'SOC 2 Type II Report.pdf', issuer: 'Audit Partners LLC', version: 'v1.3.0', ttl: 12, integrity: 100, status: 'Valid', hash: '0x3f4a5b6c...' },
    { id: 'DOC-003', name: 'GDPR Compliance Certificate.pdf', issuer: 'Privacy Authority', version: 'v3.0.1', ttl: -5, integrity: 95, status: 'Expired', hash: '0x9b8c7d6e...' },
    { id: 'DOC-004', name: 'PCI DSS Attestation.pdf', issuer: 'Payment Security Ltd', version: 'v1.0.0', ttl: 89, integrity: 96, status: 'Valid', hash: '0x1a2b3c4d...' },
    { id: 'DOC-005', name: 'HIPAA Compliance Report.pdf', issuer: 'Healthcare Auditors', version: 'v2.0.0', ttl: 0, integrity: 92, status: 'Pending', hash: '0x8f7e6d5c...' },
    { id: 'DOC-006', name: 'Financial Audit Q3 2024.pdf', issuer: 'Ernst & Partners', version: 'v1.5.2', ttl: 67, integrity: 94, status: 'Valid', hash: '0x5c6d7e8f...' },
  ];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.issuer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Valid': return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
      case 'Pending': return 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
      case 'Expired': return 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20';
      case 'Revoked': return 'bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/20';
      default: return 'bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documents</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and verify your certified documents</p>
        </div>
        <button
          onClick={() => setShowDocumentRegister(true)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium shadow-lg shadow-teal-500/30 transition-all flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Register New Document
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Status</option>
            <option value="Valid">Valid</option>
            <option value="Pending">Pending</option>
            <option value="Expired">Expired</option>
            <option value="Revoked">Revoked</option>
          </select>

          <div className="flex items-center gap-2 px-4 py-3 text-gray-600 dark:text-gray-400">
            <Filter className="w-5 h-5" />
            <span className="text-sm">Showing {filteredDocs.length} documents</span>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                {doc.status}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{doc.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{doc.issuer}</p>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Version</span>
                <code className="text-xs font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-2 py-1 rounded">
                  {doc.version}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">TTL Days</span>
                <span className={doc.ttl <= 30 && doc.ttl > 0 ? 'text-amber-600 dark:text-amber-400' : doc.ttl <= 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}>
                  {doc.ttl > 0 ? `${doc.ttl} days` : 'Expired'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Integrity</span>
                <div className="flex items-center gap-2 flex-1 ml-4">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                      style={{ width: `${doc.integrity}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{doc.integrity}%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex-1 px-3 py-2 rounded-lg bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-500/20 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                View
              </button>
              <button className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                <Download className="w-4 h-4" />
              </button>
              <button className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Document Register Modal */}
      {showDocumentRegister && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <DocumentRegister
              onClose={() => setShowDocumentRegister(false)}
              onComplete={(result) => {
                console.log('Document registered:', result);
                // TODO: Refresh documents list
                setShowDocumentRegister(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
