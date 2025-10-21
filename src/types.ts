// types.ts - Güncellenmiş versiyon
export interface Material {
  id: string;
  name: string;
  barcode: string;
  category: string;
  unit: string;
  unitPrice: number;
  currentStock: number;
  minStock: number;
  supplier: string;
  createdAt: string;
  updatedAt: string;
  lastStockCountDate?: string;
  lastStockCountBy?: string;
  lastStockCountQuantity?: number;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  surname: string;
  tcNo: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface PatientMaterialUsage {
  id: string;
  patientId: string;
  materialId: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  usageDate: string;
  notes: string;
  barcode?: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  supplierName: string;
  invoiceDate: string;
  items: InvoiceItem[];
  totalAmount: number;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  materialId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface StockCount {
  id: string;
  sessionId: string;
  materialId: string;
  barcode: string;
  countedQuantity: number;
  unitPrice: number;
  totalValue: number;
  countDate: string;
  countedBy: string;
  status: 'beklemede' | 'onaylandı' | 'reddedildi' | 'düzeltildi';
  notes: string;
  verifiedBy: string;
  verifiedAt: string;
  correctionNotes: string;
  createdAt: string;
}

export interface StockCountSession {
  id: string;
  sessionNo: string;
  title: string;
  startDate: string;
  endDate: string;
  countDate: string;
  countedBy: string;
  createdBy: string;
  status: 'planlı' | 'devam-ediyor' | 'tamamlandı' | 'iptal';
  notes: string;
  totalProductsCounted: number;
  createdAt: string;
}

export interface SystemLog {
  id: string;
  action: string;
  module: string;
  description?: string;
  recordId: string;
  details: string;
  performedBy: string;
  performedAt: string;
}

// types.ts dosyasına ekleyin/güncelleyin

export interface MaterialUsageAnalysis {
  materialId: string;
  materialName: string;
  seasonalPattern: {
    season: string;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  usageTrend: Array<{
    period: string;
    totalUsage: number;
    totalCost: number;
  }>;
  usageData: {
    daily: any[];
    weekly: any[];
    monthly: any[];
    yearly: any[];
  };
}

export interface StockValueDataItem {
  date: string;
  totalValue: number;
  stockCount: number;
  criticalStockCount: number;
}

export interface StockValueAnalysis {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  data: StockValueDataItem[];
  // Eğer monthlyTrend kullanmak istiyorsanız:
  monthlyTrend?: Array<{
    period: string;
    value: number;
  }>;
}

export interface YearlySummary {
  year: number;
  totalMaterials: number;
  totalPatients: number;
  totalStockValue: number;
  criticalStockCount: number;
  totalUsageCost: number;
  totalInvoiceAmount: number;
}

export interface DashboardStats {
  totalMaterials: number;
  totalPatients: number;
  totalStockValue: number;
  criticalStockCount: number;
  totalUsageCost: number;
  lowStockMaterials: Material[];
  recentActivities: SystemLog[];
  topUsedMaterials: { name: string; quantity: number; cost: number }[];
}