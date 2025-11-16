import type { Document } from '../App';

export interface DashboardStats {
  totalDocuments: number;
  expiringSoon: number;
  validCertificates: number;
  auditRequests: number;
  statusDistribution: {
    valid: number;
    expired: number;
    revoked: number;
    pending: number;
  };
  monthlyVerifications: Array<{ month: string; count: number }>;
  integrityScoreHistory: Array<{ date: string; score: number }>;
}

const mockDocuments: Document[] = [
  {
    id: 'DOC-001',
    name: 'Enterprise Security Audit 2024',
    hash: '0x7a9c8b3e5f2d1a4b6e8c9d0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    version: 'v2.1.0',
    uploadDate: '2024-11-01',
    expirationDate: '2025-11-01',
    status: 'Valid',
    ttlDays: 350,
    fileType: 'PDF',
    size: 2450000,
    issuer: 'CyberSec Corp',
    integrityScore: 98
  },
  {
    id: 'DOC-002',
    name: 'ISO 27001 Certification',
    hash: '0x3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
    version: 'v1.5.2',
    uploadDate: '2024-10-15',
    expirationDate: '2024-12-20',
    status: 'Valid',
    ttlDays: 35,
    fileType: 'PDF',
    size: 3200000,
    issuer: 'ISO Standards Authority',
    integrityScore: 100
  },
  {
    id: 'DOC-003',
    name: 'Financial Compliance Report Q3',
    hash: '0x9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8',
    version: 'v3.0.1',
    uploadDate: '2024-09-30',
    expirationDate: '2024-11-15',
    status: 'Expired',
    ttlDays: -1,
    fileType: 'DOCX',
    size: 1850000,
    issuer: 'FinTech Compliance Inc',
    integrityScore: 95
  },
  {
    id: 'DOC-004',
    name: 'Employee Training Certificate',
    hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
    version: 'v1.0.0',
    uploadDate: '2024-11-10',
    expirationDate: '2025-11-10',
    status: 'Pending',
    ttlDays: 365,
    fileType: 'PDF',
    size: 950000,
    issuer: 'HR Department',
    integrityScore: 92
  },
  {
    id: 'DOC-005',
    name: 'Data Privacy Assessment',
    hash: '0x8f7e6d5c4b3a2918f7e6d5c4b3a29180f1e2d3c4b5a69788f7e6d5c4b3a2918',
    version: 'v2.0.0',
    uploadDate: '2024-08-20',
    expirationDate: '2024-10-20',
    status: 'Revoked',
    ttlDays: -26,
    fileType: 'PDF',
    size: 4100000,
    issuer: 'Privacy Auditors Ltd',
    integrityScore: 88
  },
  {
    id: 'DOC-006',
    name: 'API Security Certificate',
    hash: '0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6',
    version: 'v1.8.3',
    uploadDate: '2024-11-08',
    expirationDate: '2024-12-08',
    status: 'Valid',
    ttlDays: 23,
    fileType: 'JSON',
    size: 125000,
    issuer: 'DevSec Tools',
    integrityScore: 96
  }
];

class ArkivAPI {
  async getDashboardStats(): Promise<DashboardStats> {
    await this.delay(500);
    
    const validDocs = mockDocuments.filter(d => d.status === 'Valid');
    const expiringSoon = mockDocuments.filter(d => d.ttlDays > 0 && d.ttlDays <= 30);
    const auditRequests = Math.floor(Math.random() * 25) + 15;

    return {
      totalDocuments: mockDocuments.length,
      expiringSoon: expiringSoon.length,
      validCertificates: validDocs.length,
      auditRequests,
      statusDistribution: {
        valid: mockDocuments.filter(d => d.status === 'Valid').length,
        expired: mockDocuments.filter(d => d.status === 'Expired').length,
        revoked: mockDocuments.filter(d => d.status === 'Revoked').length,
        pending: mockDocuments.filter(d => d.status === 'Pending').length
      },
      monthlyVerifications: [
        { month: 'Jun', count: 145 },
        { month: 'Jul', count: 182 },
        { month: 'Aug', count: 203 },
        { month: 'Sep', count: 178 },
        { month: 'Oct', count: 221 },
        { month: 'Nov', count: 245 }
      ],
      integrityScoreHistory: [
        { date: '2024-06', score: 94 },
        { date: '2024-07', score: 95 },
        { date: '2024-08', score: 93 },
        { date: '2024-09', score: 96 },
        { date: '2024-10', score: 97 },
        { date: '2024-11', score: 95 }
      ]
    };
  }

  async getDocuments(): Promise<Document[]> {
    await this.delay(400);
    return mockDocuments;
  }

  async getDocumentById(id: string): Promise<Document | null> {
    await this.delay(300);
    return mockDocuments.find(doc => doc.id === id) || null;
  }

  async uploadDocument(file: File): Promise<Document> {
    await this.delay(2000);
    const newDoc: Document = {
      id: `DOC-${String(mockDocuments.length + 1).padStart(3, '0')}`,
      name: file.name,
      hash: `0x${Math.random().toString(16).slice(2, 66)}`,
      version: 'v1.0.0',
      uploadDate: new Date().toISOString().split('T')[0],
      expirationDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      status: 'Pending',
      ttlDays: 365,
      fileType: file.type.split('/')[1]?.toUpperCase() || 'FILE',
      size: file.size,
      issuer: 'Current User',
      integrityScore: Math.floor(Math.random() * 10) + 90
    };
    mockDocuments.push(newDoc);
    return newDoc;
  }

  async verifyHash(hash: string): Promise<{ valid: boolean; document?: Document }> {
    await this.delay(1500);
    const doc = mockDocuments.find(d => d.hash === hash);
    return {
      valid: !!doc && doc.status === 'Valid',
      document: doc
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const arkivApi = new ArkivAPI();
