// Mock data and API service for OrigenMX

export interface Lot {
  id: string;
  cropType: string;
  area: number;
  weight?: number;
  location: string;
  cooperative: string;
  plantingDate: string;
  harvestDate: string;
  status: 'Active' | 'Harvested' | 'Certified';
  agroScore: number;
  creditStatus: 'No credit' | 'Eligible' | 'Active' | 'Delinquent' | 'Repaid';
  evidenceFiles: EvidenceFile[];
  creditId?: string;
}

export interface EvidenceFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  filecoinCID: string;
}

export interface Credit {
  id: string;
  lotId: string;
  amount: number;
  apr: number;
  termMonths: number;
  status: 'Eligible' | 'Active' | 'Delinquent' | 'Repaid';
  disbursementDate?: string;
  paidAmount: number;
  remainingAmount: number;
  installments: Installment[];
}

export interface Installment {
  number: number;
  dueDate: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  paidDate?: string;
  transactionHash?: string;
}

export interface ActivityEvent {
  id: string;
  type: 'lot' | 'credit' | 'payment' | 'system';
  title: string;
  description: string;
  timestamp: string;
  lotId?: string;
  creditId?: string;
}

// Mock data
const mockLots: Lot[] = [
  {
    id: 'LOT-001',
    cropType: 'Corn',
    area: 5.5,
    weight: 12000,
    location: 'Jalisco, Mexico',
    cooperative: 'Cooperativa Agrícola del Valle',
    plantingDate: '2024-03-15',
    harvestDate: '2024-09-20',
    status: 'Active',
    agroScore: 86,
    creditStatus: 'Active',
    creditId: 'CR-001',
    evidenceFiles: [
      {
        id: 'EV-001',
        name: 'soil_analysis.pdf',
        type: 'application/pdf',
        size: 245000,
        uploadDate: '2024-03-16',
        filecoinCID: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'
      },
      {
        id: 'EV-002',
        name: 'planting_photo.jpg',
        type: 'image/jpeg',
        size: 1024000,
        uploadDate: '2024-03-17',
        filecoinCID: 'bafybeihkoviema7g3gxyt6la7vd5ho32ictqbilu3wnlo3rs7ewhnp7lly'
      }
    ]
  },
  {
    id: 'LOT-002',
    cropType: 'Beans',
    area: 3.2,
    weight: 6500,
    location: 'Michoacán, Mexico',
    cooperative: 'Cooperativa Agrícola del Valle',
    plantingDate: '2024-04-01',
    harvestDate: '2024-10-15',
    status: 'Active',
    agroScore: 92,
    creditStatus: 'Eligible',
    evidenceFiles: [
      {
        id: 'EV-003',
        name: 'certification.pdf',
        type: 'application/pdf',
        size: 180000,
        uploadDate: '2024-04-02',
        filecoinCID: 'bafybeiew2kfzzxy6xxg3kl3oqnogzixm5nslmpg7wmvj7v6g7jyfll3maq'
      }
    ]
  },
  {
    id: 'LOT-003',
    cropType: 'Wheat',
    area: 8.0,
    location: 'Guanajuato, Mexico',
    cooperative: 'Productores Unidos',
    plantingDate: '2024-02-10',
    harvestDate: '2024-08-05',
    status: 'Harvested',
    agroScore: 78,
    creditStatus: 'Repaid',
    creditId: 'CR-003',
    evidenceFiles: []
  },
  {
    id: 'LOT-004',
    cropType: 'Tomatoes',
    area: 2.5,
    weight: 8000,
    location: 'Sinaloa, Mexico',
    cooperative: 'Cooperativa del Norte',
    plantingDate: '2024-05-01',
    harvestDate: '2024-11-30',
    status: 'Active',
    agroScore: 65,
    creditStatus: 'No credit',
    evidenceFiles: [
      {
        id: 'EV-004',
        name: 'field_inspection.pdf',
        type: 'application/pdf',
        size: 320000,
        uploadDate: '2024-05-02',
        filecoinCID: 'bafybeic7qz2kyolnipf2cwvqb6hqsohsrjfl4t5efnpmjvlpgskwrrzuai'
      }
    ]
  }
];

const mockCredits: Credit[] = [
  {
    id: 'CR-001',
    lotId: 'LOT-001',
    amount: 5000,
    apr: 12.5,
    termMonths: 12,
    status: 'Active',
    disbursementDate: '2024-04-01',
    paidAmount: 2500,
    remainingAmount: 2500,
    installments: Array.from({ length: 12 }, (_, i) => ({
      number: i + 1,
      dueDate: new Date(2024, 4 + i, 1).toISOString().split('T')[0],
      amount: 416.67,
      status: i < 6 ? 'Paid' : 'Pending',
      paidDate: i < 6 ? new Date(2024, 4 + i, 1).toISOString().split('T')[0] : undefined,
      transactionHash: i < 6 ? `0x${Math.random().toString(16).slice(2, 66)}` : undefined
    }))
  },
  {
    id: 'CR-002',
    lotId: 'LOT-002',
    amount: 3500,
    apr: 11.0,
    termMonths: 10,
    status: 'Eligible',
    paidAmount: 0,
    remainingAmount: 3500,
    installments: []
  },
  {
    id: 'CR-003',
    lotId: 'LOT-003',
    amount: 7000,
    apr: 13.0,
    termMonths: 12,
    status: 'Repaid',
    disbursementDate: '2024-02-15',
    paidAmount: 7000,
    remainingAmount: 0,
    installments: Array.from({ length: 12 }, (_, i) => ({
      number: i + 1,
      dueDate: new Date(2024, 2 + i, 15).toISOString().split('T')[0],
      amount: 583.33,
      status: 'Paid',
      paidDate: new Date(2024, 2 + i, 15).toISOString().split('T')[0],
      transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`
    }))
  }
];

const mockActivities: ActivityEvent[] = [
  {
    id: 'ACT-001',
    type: 'lot',
    title: 'New lot registered',
    description: 'LOT-004 (Tomatoes, 2.5 ha) registered successfully',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    lotId: 'LOT-004'
  },
  {
    id: 'ACT-002',
    type: 'system',
    title: 'AgroScore computed',
    description: 'LOT-002 received score: 92/100',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    lotId: 'LOT-002'
  },
  {
    id: 'ACT-003',
    type: 'credit',
    title: 'Credit approved',
    description: 'CR-001 approved for 5,000 USDC (LOT-001)',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    creditId: 'CR-001'
  },
  {
    id: 'ACT-004',
    type: 'payment',
    title: 'Installment paid',
    description: 'Payment #6 of CR-001 completed (416.67 USDC)',
    timestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
    creditId: 'CR-001'
  },
  {
    id: 'ACT-005',
    type: 'system',
    title: 'Evidence uploaded',
    description: 'Certification document uploaded to Filecoin for LOT-002',
    timestamp: new Date(Date.now() - 86400000 * 10).toISOString(),
    lotId: 'LOT-002'
  }
];

class OrigenAPI {
  // Lots
  async getLots(): Promise<Lot[]> {
    await this.delay(500);
    return mockLots;
  }

  async getLotById(id: string): Promise<Lot | null> {
    await this.delay(300);
    return mockLots.find(lot => lot.id === id) || null;
  }

  async registerLot(lotData: Partial<Lot>): Promise<Lot> {
    await this.delay(1000);
    const newLot: Lot = {
      id: `LOT-${String(mockLots.length + 1).padStart(3, '0')}`,
      cropType: lotData.cropType || '',
      area: lotData.area || 0,
      weight: lotData.weight,
      location: lotData.location || '',
      cooperative: lotData.cooperative || '',
      plantingDate: lotData.plantingDate || new Date().toISOString().split('T')[0],
      harvestDate: lotData.harvestDate || new Date().toISOString().split('T')[0],
      status: 'Active',
      agroScore: 0,
      creditStatus: 'No credit',
      evidenceFiles: []
    };
    mockLots.push(newLot);
    return newLot;
  }

  async uploadEvidence(lotId: string, file: File): Promise<EvidenceFile> {
    await this.delay(2000);
    const evidence: EvidenceFile = {
      id: `EV-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadDate: new Date().toISOString().split('T')[0],
      filecoinCID: `bafy${Math.random().toString(36).substr(2, 50)}`
    };
    
    const lot = mockLots.find(l => l.id === lotId);
    if (lot) {
      lot.evidenceFiles.push(evidence);
    }
    
    return evidence;
  }

  async refreshAgroScore(lotId: string): Promise<number> {
    await this.delay(1500);
    const score = Math.floor(Math.random() * 40) + 60; // 60-100
    const lot = mockLots.find(l => l.id === lotId);
    if (lot) {
      lot.agroScore = score;
    }
    return score;
  }

  // Credits
  async getCredits(): Promise<Credit[]> {
    await this.delay(500);
    return mockCredits;
  }

  async getCreditById(id: string): Promise<Credit | null> {
    await this.delay(300);
    return mockCredits.find(credit => credit.id === id) || null;
  }

  async requestCredit(lotId: string, amount: number, termMonths: number): Promise<Credit> {
    await this.delay(1500);
    const newCredit: Credit = {
      id: `CR-${String(mockCredits.length + 1).padStart(3, '0')}`,
      lotId,
      amount,
      apr: 12.0,
      termMonths,
      status: 'Active',
      disbursementDate: new Date().toISOString().split('T')[0],
      paidAmount: 0,
      remainingAmount: amount,
      installments: Array.from({ length: termMonths }, (_, i) => ({
        number: i + 1,
        dueDate: new Date(Date.now() + (i + 1) * 30 * 86400000).toISOString().split('T')[0],
        amount: amount / termMonths,
        status: 'Pending'
      }))
    };
    mockCredits.push(newCredit);
    
    // Update lot
    const lot = mockLots.find(l => l.id === lotId);
    if (lot) {
      lot.creditStatus = 'Active';
      lot.creditId = newCredit.id;
    }
    
    return newCredit;
  }

  async payInstallment(creditId: string, installmentNumber: number): Promise<boolean> {
    await this.delay(2000);
    const credit = mockCredits.find(c => c.id === creditId);
    if (!credit) return false;
    
    const installment = credit.installments.find(i => i.number === installmentNumber);
    if (!installment) return false;
    
    installment.status = 'Paid';
    installment.paidDate = new Date().toISOString().split('T')[0];
    installment.transactionHash = `0x${Math.random().toString(16).slice(2, 66)}`;
    
    credit.paidAmount += installment.amount;
    credit.remainingAmount -= installment.amount;
    
    if (credit.remainingAmount <= 0) {
      credit.status = 'Repaid';
      const lot = mockLots.find(l => l.id === credit.lotId);
      if (lot) {
        lot.creditStatus = 'Repaid';
      }
    }
    
    return true;
  }

  // Activity
  async getActivities(filter?: 'lot' | 'credit' | 'payment' | 'system'): Promise<ActivityEvent[]> {
    await this.delay(500);
    if (filter) {
      return mockActivities.filter(a => a.type === filter);
    }
    return mockActivities;
  }

  // Stats
  async getDashboardStats() {
    await this.delay(500);
    const lots = mockLots;
    const credits = mockCredits;
    
    const totalLots = lots.length;
    const avgScore = Math.round(lots.reduce((sum, lot) => sum + lot.agroScore, 0) / lots.length);
    const eligibleCredit = lots
      .filter(l => l.creditStatus === 'Eligible' || l.creditStatus === 'No credit')
      .reduce((sum, l) => sum + (l.agroScore > 70 ? l.area * 1000 : 0), 0);
    const activeCredits = credits.filter(c => c.status === 'Active');
    const activeCreditAmount = activeCredits.reduce((sum, c) => sum + c.amount, 0);

    return {
      totalLots,
      avgScore,
      eligibleCredit,
      activeCreditsCount: activeCredits.length,
      activeCreditAmount,
      scoreDistribution: {
        high: lots.filter(l => l.agroScore >= 80).length,
        medium: lots.filter(l => l.agroScore >= 60 && l.agroScore < 80).length,
        low: lots.filter(l => l.agroScore < 60).length
      },
      monthlyDisbursements: this.generateMonthlyData(),
      repaymentRate: 95
    };
  }

  private generateMonthlyData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.slice(0, 6).map(month => ({
      month,
      amount: Math.floor(Math.random() * 15000) + 5000
    }));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const origenApi = new OrigenAPI();
