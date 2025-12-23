// src/types.ts - TAM GÜNCELLENMİŞ VERSİYON
export type MaterialStatus = 'normal' | 'konsinye' | 'iade' | 'faturalı';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  name: string;
  department: string;
  role: 'admin' | 'manager' | 'staff' | 'viewer' | 'doctor' | 'nurse';
  permissions: {
    createSession: boolean;
    approveCounts: boolean;
    manageMaterials: boolean;
    managePatients: boolean;
    manageInvoices: boolean;
    bulkStatusChange: boolean;
    quickCount: boolean;
    exportData: boolean;
    manageUsers: boolean;
    manageSettings: boolean;
    viewDashboard: boolean;
    importExcel: boolean;
    manageDailyPlan: boolean;
    viewReports: boolean;
  };
  isActive: boolean;
  lastLogin?: string;
  lastLoginIp?: string;
  createdAt: string;
  updatedAt: string;
  avatarColor?: string;
  phone?: string;
  canViewPages?: string[];
  canEditPages?: string[];
  sessionTimeout?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  name: string;
  department: string;
  role?: 'admin' | 'manager' | 'staff' | 'viewer' | 'doctor' | 'nurse';
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
  refreshToken?: string;
}

// GÜNLÜK PLANLAMA
export interface DailyPlan {
  id: string;
  date: string;
  meals: Meal[];
  surgeries: Surgery[];
  appointments: Appointment[];
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'cancelled';
  totalSurgeries: number;
  totalAppointments: number;
  emergencyCount: number;
}

export interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  items: string[];
  calories: number;
  dietType: 'normal' | 'diabetic' | 'low_salt' | 'low_fat' | 'vegetarian' | 'other';
  mealTime: string;
  patientCount: number;
  specialNotes?: string;
  chef?: string;
  preparedAt?: string;
  servedAt?: string;
}

export interface Surgery {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  surgeryType: string;
  surgeryCode?: string;
  duration: number;
  startTime: string;
  endTime: string;
  room: string;
  roomType: 'operating' | 'examination' | 'treatment';
  status: 'scheduled' | 'in-preparation' | 'in-progress' | 'completed' | 'cancelled' | 'postponed';
  priority: 'normal' | 'urgent' | 'emergency';
  requiredMaterials: SurgeryMaterial[];
  notes?: string;
  anesthesiaType?: string;
  estimatedCost?: number;
  actualCost?: number;
  completedAt?: string;
  complications?: string[];
}

export interface SurgeryMaterial {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalCost: number;
  status: 'available' | 'low_stock' | 'not_available';
  barcode?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentTime: string;
  duration: number;
  type: 'checkup' | 'followup' | 'emergency' | 'routine' | 'consultation' | 'control';
  status: 'scheduled' | 'waiting' | 'in-progress' | 'completed' | 'cancelled' | 'no_show';
  reason?: string;
  notes?: string;
  room?: string;
  insurance?: string;
  fee?: number;
  paid?: boolean;
  checkedInAt?: string;
  checkedOutAt?: string;
  followUpDate?: string;
}

export interface ExcelImportRequest {
  file: File;
  importType: 'meals' | 'surgeries' | 'appointments' | 'all';
  options?: {
    overwriteExisting: boolean;
    skipDuplicates: boolean;
    validateData: boolean;
  };
}

export interface ExcelImportResult {
  success: boolean;
  importedCount: number;
  failedCount: number;
  errors: string[];
  warnings: string[];
  fileName: string;
  importDate: string;
  summary?: {
    meals: number;
    surgeries: number;
    appointments: number;
  };
}

// EXCEL TEMPLATE
export interface ExcelTemplate {
  id: string;
  name: string;
  type: 'meals' | 'surgeries' | 'appointments' | 'materials' | 'patients';
  description: string;
  fileUrl: string;
  fields: ExcelField[];
  createdAt: string;
  updatedAt: string;
}

export interface ExcelField {
  name: string;
  header: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'list';
  required: boolean;
  description?: string;
  validationRules?: string[];
  example?: string;
}

// HASTANE İSTATİSTİKLERİ
export interface HospitalStatistics {
  date: string;
  totalPatients: number;
  totalDoctors: number;
  totalNurses: number;
  totalSurgeries: number;
  totalAppointments: number;
  emergencyCases: number;
  averageStayDuration: number;
  bedOccupancyRate: number;
  surgerySuccessRate: number;
  patientSatisfaction: number;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface DailyStatistics {
  date: string;
  surgeries: {
    total: number;
    completed: number;
    inProgress: number;
    cancelled: number;
    byType: Record<string, number>;
  };
  appointments: {
    total: number;
    completed: number;
    waiting: number;
    cancelled: number;
    byType: Record<string, number>;
  };
  meals: {
    totalPatients: number;
    byDietType: Record<string, number>;
  };
  emergency: {
    cases: number;
    responseTime: number;
  };
}

// DOKTOR
export interface Doctor {
  id: string;
  name: string;
  surname: string;
  specialty: string;
  licenseNumber: string;
  phone: string;
  email: string;
  department: string;
  title?: string;
  isActive: boolean;
  schedule: DoctorSchedule[];
  weeklyHours: number;
  maxPatientsPerDay: number;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export interface DoctorSchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  maxAppointments: number;
}

// HASTANE BİRİMLERİ
export interface HospitalUnit {
  id: string;
  name: string;
  type: 'clinic' | 'ward' | 'laboratory' | 'radiology' | 'pharmacy' | 'other';
  floor: number;
  roomCount: number;
  bedCount: number;
  phone: string;
  email?: string;
  headDoctorId?: string;
  headNurseId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// KULLANICI OTURUM YÖNETİMİ
export interface UserSession {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  loginTime: string;
  lastActivity: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  deviceInfo?: {
    browser: string;
    os: string;
    device: string;
  };
  location?: {
    city?: string;
    country?: string;
    isp?: string;
  };
}

export interface SessionManagementRequest {
  sessionId: string;
  action: 'terminate' | 'extend' | 'lock' | 'unlock';
  reason?: string;
  performedBy: string;
}

// YETKİ YÖNETİMİ
export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  permissions: {
    [key: string]: boolean;
  };
  userCount: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPermissionUpdate {
  userId: string;
  permissions: Partial<User['permissions']>;
  canViewPages?: string[];
  canEditPages?: string[];
  reason?: string;
  performedBy: string;
}

// AKTİVİTE LOG
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  entityId?: string;
  entityType?: string;
  details: string;
  ipAddress: string;
  timestamp: string;
  changes?: {
    before?: any;
    after?: any;
  };
  severity: 'info' | 'warning' | 'error' | 'critical';
}

// DEVAM EDEN ESKİ INTERFACE'LER
export interface Material {
  id: string;
  name: string;
  barcode: string;
  gtin?: string;
  sn?: string;
  udiCode?: string;
  allBarcode?: string;
  intuitiveCode?: string;
  serialNumber?: string;
  category: string;
  subCategory?: string;
  unit: string;
  unitPrice: number;
  currentStock: number;
  minStockLevel: number;
  minStock: number;
  supplier?: string;
  expirationDate?: string;
  serialNoStatus?: string;
  materialDescription?: string;
  location?: string;
  isActive: boolean;
  status: MaterialStatus;
  createdAt: string;
  updatedAt: string;
  lastStockCountDate?: string;
  lastStockCountBy?: string;
  lastStockCountQuantity?: number;
  lastInvoiceNo?: string;
  lastCountedQuantity?: number;
  lastCountDate?: string;
  lastCountedBy?: string;
  lastPurchaseDate?: string;
  lastPurchasePrice?: number;
  averagePurchasePrice?: number;
  totalPurchasedQuantity?: number;
  isCritical: boolean;
  dailyUsage?: number;
  surgeryUsageCount?: number;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  materialCount?: number;
  color?: string;
  icon?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  materialCount?: number;
  lastInvoiceDate?: string;
  totalInvoiceAmount?: number;
}

export interface Patient {
  id: string;
  name: string;
  surname: string;
  tcNo: string;
  phone: string;
  address: string;
  createdAt: string;
  procedureFee?: number;
  procedureFeeCurrency?: string;
  isActive: boolean;
  updatedAt?: string;
  totalMaterialCost?: number;
  lastVisitDate?: string;
  visitCount?: number;
  bloodType?: string;
  allergies?: string[];
  chronicDiseases?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  insuranceProvider?: string;
  doctorId?: string;
}

export interface SessionSummary {
  id: string;
  sessionName: string;
  date: string;
  totalCounted: number;
  totalItems: number;
  status: string;
  sessionNo?: string;
  invoiceNo?: string;
  countedBy?: string;
  pdfFile?: string;
  totalValue?: number;
  sessionStatus?: MaterialStatus | '';
  countedQuantity?: number;
  correctionCount?: number;
}

// Types.ts dosyasında DashboardStats interface'ini şöyle güncelleyin:

export interface DashboardStats {
  totalMaterials: number;
  totalPatients: number;
  totalStockValue: number;
  criticalStockCount: number;
  totalUsageCost: number;
  lowStockMaterials: Material[];
  recentActivities: SystemLog[];
  topUsedMaterials: { name: string; quantity: number; cost: number }[];
  totalInvoices: number;
  totalInvoiceAmount: number;
  todayUsageCost: number;
  weeklySales: number;
  monthlySales: number;
  todayUsagesCount: number;
  activeSessions: number;
  statusSummary: {
    normal: number;
    konsinye: number;
    iade: number;
    faturalı: number;
  };
  totalSessions: number;
  recentSessions: StockCountSession[];
  quickCountSessions: number;
  todayCounts: number;
  pendingApprovals: number;
  dailyPlan?: {
    surgeries: number;
    appointments: number;
    emergencyCases: number;
    mealsServed: number;
  };
  hospitalStats?: {
    totalDoctors: number;
    totalNurses: number;
    bedOccupancy: number;
    todayRevenue: number;
  };
  userStats?: {
    activeUsers: number;
    activeSessions: number;
    recentLogins: number;
  };
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
  procedureFee?: number;
  procedureFeeCurrency?: string;
  materialName?: string;
  patientName?: string;
  createdAt: string;
  sessionId?: string;
  sessionNo?: string;
  materialStatus?: MaterialStatus;
  surgeryId?: string;
  appointmentId?: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  supplierName: string;
  supplier?: string;
  invoiceDate: string;
  items: InvoiceItem[];
  totalAmount: number;
  pdfUrl?: string;
  pdfFile?: string;
  pdfFileName?: string;
  fileSize?: number;
  additionalInfo?: {
    irsaliyeNo?: string;
    irsaliyeDate?: string;
    dosyaNo?: string;
    pdfUrl?: string;
  };
  currency: string;
  exchangeRate?: number;
  convertedAmount?: number;
  createdAt: string;
  status?: 'active' | 'cancelled' | 'pending';
  updatedAt?: string;
  sessionId?: string;
  sessionNo?: string;
  countedBy?: string;
}

export interface InvoiceItem {
  id: string;
  materialId: string;
  barcode?: string;
  sn?: string;
  intuitiveCode?: string;
  allBarcode?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  materialName?: string;
  materialUnit?: string;
  serialNo?: string;
  gtin?: string;
  createdAt?: string;
  materialStatus?: MaterialStatus;
  countedQuantity?: number;
  difference?: number;
}

export interface MaterialStockRecord {
  id: string;
  materialId: string;
  quantity: number;
  unitPrice: number;
  invoiceId: string;
  purchaseDate: string;
  currentStock: number;
  previousStock: number;
  barcode?: string;
  invoiceNo?: string;
  supplier?: string;
  createdAt: string;
  materialStatus?: MaterialStatus;
  sessionId?: string;
  countedBy?: string;
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
  status: 'tamamlandı' | 'beklemede' | 'onaylandı' | 'reddedildi' | 'iptal' | 'düzeltildi';
  notes: string;
  verifiedBy?: string;
  verifiedAt?: string;
  correctionNotes?: string;
  createdAt: string;
  invoiceNo?: string;
  materialName?: string;
  materialCategory?: string;
  materialUnit?: string;
  sessionNo?: string;
  materialStatus?: MaterialStatus;
  expectedQuantity?: number;
  difference?: number;
  correctionApplied?: boolean;
  correctionDate?: string;
}

export interface StockCountSession {
  id: string;
  sessionNo: string;
  invoiceNo: string;
  startDate: string;
  endDate: string;
  countDate: string;
  countedBy: string;
  createdBy: string;
  status: 'planlı' | 'devam-ediyor' | 'tamamlandı' | 'iptal' | 'onaylandı';
  notes: string;
  totalProductsCounted: number;
  pdfFile?: string;
  pdfFileName?: string;
  fileSize?: number;
  totalValue?: number;
  createdAt: string;
  updatedAt?: string;
  sessionStatus?: MaterialStatus | '';
  quickCount?: boolean;
  estimatedDuration?: string;
  completedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  correctionCount?: number;
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
  ipAddress?: string;
  userAgent?: string;
  actionType?: 'create' | 'update' | 'delete' | 'read' | 'approve' | 'reject';
  affectedRecords?: number;
  previousData?: any;
  newData?: any;
}

export interface MaterialUsageAnalysis {
  materialId: string;
  materialName: string;
  seasonalPattern: {
    season: string;
    trend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
  };
  usageTrend: Array<{
    period: string;
    totalUsage: number;
    totalCost: number;
    sessionCount?: number;
  }>;
  usageData: {
    daily: any[];
    weekly: any[];
    monthly: any[];
    yearly: any[];
  };
  totalUsage?: number;
  totalCost?: number;
  materialStatus?: MaterialStatus;
  lastInvoiceDate?: string;
  lastStockCountDate?: string;
  averageMonthlyUsage?: number;
  peakUsageMonth?: string;
  sessionParticipation?: number;
}

export interface StockValueDataItem {
  date: string;
  totalValue: number;
  stockCount: number;
  criticalStockCount: number;
  statusSummary?: {
    normal: number;
    konsinye: number;
    iade: number;
    faturalı: number;
  };
  sessionCount?: number;
  countedValue?: number;
  variance?: number;
}

export interface StockValueAnalysis {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  data: StockValueDataItem[];
  monthlyTrend?: Array<{
    period: string;
    value: number;
    sessionCount: number;
  }>;
  statusDistribution?: {
    normal: number;
    konsinye: number;
    iade: number;
    faturalı: number;
  };
  averageValue?: number;
  growthRate?: number;
  varianceAnalysis?: {
    highest: number;
    lowest: number;
    average: number;
  };
}

export interface YearlySummary {
  year: number;
  totalMaterials: number;
  totalPatients: number;
  totalStockValue: number;
  criticalStockCount: number;
  totalUsageCost: number;
  totalInvoiceAmount: number;
  statusSummary?: {
    normal: number;
    konsinye: number;
    iade: number;
    faturalı: number;
  };
  invoiceCount?: number;
  sessionCount?: number;
  quickCountSessions?: number;
  totalCountedItems?: number;
  averageSessionDuration?: string;
}

// Yeni Interface'ler
export interface BulkStatusChangeRequest {
  materialIds: string[];
  newStatus: MaterialStatus;
  reason?: string;
  performedBy: string;
  notifyUsers?: boolean;
  effectiveDate?: string;
  referenceNo?: string;
}

export interface BarcodeScanResult {
  barcode: string;
  material: Material | null;
  found: boolean;
  timestamp: string;
  sessionId?: string;
  sessionNo?: string;
  matchedFields?: string[];
  suggestedAction?: 'add' | 'update' | 'ignore';
}

export interface QuickCountSession {
  id: string;
  sessionId: string;
  items: QuickCountItem[];
  totalItems: number;
  totalValue: number;
  createdAt: string;
  completedAt?: string;
  scannedBy?: string;
  deviceInfo?: string;
  sessionStatus?: MaterialStatus | '';
}

export interface QuickCountItem {
  materialId: string;
  barcode: string;
  quantity: number;
  scannedAt: string;
  materialName?: string;
  unitPrice?: number;
  totalValue?: number;
  materialStatus?: MaterialStatus;
}

export interface CategoryWithStats extends Category {
  materialCount: number;
  totalStockValue: number;
  lowStockCount: number;
  statusDistribution?: {
    normal: number;
    konsinye: number;
    iade: number;
    faturalı: number;
  };
  averageUnitPrice?: number;
}

export interface SupplierWithStats extends Supplier {
  materialCount: number;
  totalStockValue: number;
  lastInvoiceDate?: string;
  totalInvoices?: number;
  statusDistribution?: {
    normal: number;
    konsinye: number;
    iade: number;
    faturalı: number;
  };
  averageDeliveryTime?: number;
  rating?: number;
}

export interface MaterialSearchFilters {
  searchTerm?: string;
  category?: string;
  supplier?: string;
  status?: MaterialStatus | 'all';
  lowStockOnly?: boolean;
  barcode?: string;
  gtin?: string;
  sn?: string;
  udiCode?: string;
  allBarcode?: string;
  page?: number;
  pageSize?: number;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
  expirationDateFrom?: string;
  expirationDateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  forSurgery?: boolean;
}

export interface MaterialExportData {
  headers: string[];
  data: any[][];
  format: 'csv' | 'excel' | 'pdf';
  includeAllFields?: boolean;
  fileName?: string;
  includeStatus?: boolean;
  includeHistory?: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface SessionPdfInfo {
  sessionId: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  uploadedBy: string;
  url?: string;
  pages?: number;
  version?: string;
  digitalSignature?: boolean;
}

export interface InvoicePdfInfo {
  invoiceId: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  uploadedBy: string;
  url?: string;
  verified?: boolean;
  verificationDate?: string;
  ocrData?: any;
}

export interface MaterialHistoryEntry {
  id: string;
  materialId: string;
  action: string;
  details: string;
  performedBy: string;
  performedAt: string;
  previousValues?: Partial<Material>;
  newValues?: Partial<Material>;
  sessionId?: string;
  invoiceNo?: string;
  changeType?: 'stock' | 'price' | 'status' | 'info';
}

export interface QuickCountRequest {
  sessionId: string;
  barcode: string;
  quantity?: number;
  scannedBy: string;
  deviceInfo?: string;
}

export interface QuickCountResponse {
  success: boolean;
  item: QuickCountItem;
  session: QuickCountSession;
  material?: Material;
  message?: string;
}

export interface SessionStatusFilter {
  status: MaterialStatus | 'all' | '';
  label: string;
  color: string;
  icon?: string;
}

export interface CountProgress {
  sessionId: string;
  totalItems: number;
  countedItems: number;
  progress: number;
  estimatedTimeRemaining?: string;
  currentOperator?: string;
  lastUpdate?: string;
}

export interface MaterialSessionStats {
  materialId: string;
  sessionCount: number;
  totalCounted: number;
  averageQuantity: number;
  lastSessionDate: string;
  sessionStatuses: {
    [key in MaterialStatus]?: number;
  };
}

// SABİTLER
export const USER_ROLES = [
  { value: 'admin', label: 'Yönetici', color: 'red', icon: 'shield' },
  { value: 'manager', label: 'Müdür', color: 'orange', icon: 'user-check' },
  { value: 'doctor', label: 'Doktor', color: 'blue', icon: 'stethoscope' },
  { value: 'nurse', label: 'Hemşire', color: 'green', icon: 'thermometer' },
  { value: 'staff', label: 'Personel', color: 'purple', icon: 'user' },
  { value: 'viewer', label: 'Görüntüleyici', color: 'gray', icon: 'eye' }
] as const;

export const DEPARTMENT_OPTIONS = [
  { value: 'ophthalmology', label: 'Göz Hastalıkları' },
  { value: 'surgery', label: 'Cerrahi' },
  { value: 'emergency', label: 'Acil' },
  { value: 'radiology', label: 'Radyoloji' },
  { value: 'laboratory', label: 'Laboratuvar' },
  { value: 'pharmacy', label: 'Eczane' },
  { value: 'nursing', label: 'Hemşirelik' },
  { value: 'administration', label: 'Yönetim' },
  { value: 'it', label: 'Bilişim Teknolojileri' },
  { value: 'finance', label: 'Finans' },
  { value: 'procurement', label: 'Tedarik' }
] as const;

export const MEAL_TYPE_OPTIONS = [
  { value: 'breakfast', label: 'Kahvaltı', icon: 'coffee', color: 'yellow' },
  { value: 'lunch', label: 'Öğle Yemeği', icon: 'utensils-crossed', color: 'orange' },
  { value: 'dinner', label: 'Akşam Yemeği', icon: 'moon', color: 'blue' },
  { value: 'snack', label: 'Ara Öğün', icon: 'cookie', color: 'purple' }
] as const;

export const DIET_TYPE_OPTIONS = [
  { value: 'normal', label: 'Normal', color: 'green' },
  { value: 'diabetic', label: 'Diyabetik', color: 'blue' },
  { value: 'low_salt', label: 'Az Tuzlu', color: 'purple' },
  { value: 'low_fat', label: 'Az Yağlı', color: 'yellow' },
  { value: 'vegetarian', label: 'Vejetaryen', color: 'green' },
  { value: 'other', label: 'Diğer', color: 'gray' }
] as const;

export const SURGERY_PRIORITY_OPTIONS = [
  { value: 'normal', label: 'Normal', color: 'green' },
  { value: 'urgent', label: 'Acil', color: 'orange' },
  { value: 'emergency', label: 'Acil Müdahale', color: 'red' }
] as const;

export const APPOINTMENT_TYPE_OPTIONS = [
  { value: 'checkup', label: 'Kontrol', color: 'blue' },
  { value: 'followup', label: 'Takip', color: 'green' },
  { value: 'emergency', label: 'Acil', color: 'red' },
  { value: 'routine', label: 'Rutin', color: 'purple' },
  { value: 'consultation', label: 'Konsültasyon', color: 'orange' },
  { value: 'control', label: 'Kontrol', color: 'cyan' }
] as const;

export const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Pazartesi' },
  { value: 'tuesday', label: 'Salı' },
  { value: 'wednesday', label: 'Çarşamba' },
  { value: 'thursday', label: 'Perşembe' },
  { value: 'friday', label: 'Cuma' },
  { value: 'saturday', label: 'Cumartesi' },
  { value: 'sunday', label: 'Pazar' }
] as const;

export const CURRENCY_OPTIONS = [
  { value: 'TRY', label: '₺ - Türk Lirası' },
  { value: 'USD', label: '$ - Amerikan Doları' },
  { value: 'EUR', label: '€ - Euro' },
  { value: 'GBP', label: '£ - İngiliz Sterlini' }
] as const;

export const MATERIAL_STATUS_OPTIONS = [
  { value: 'normal', label: 'Normal', color: 'green', icon: 'check-circle' },
  { value: 'konsinye', label: 'Konsinye', color: 'blue', icon: 'package' },
  { value: 'iade', label: 'İade', color: 'red', icon: 'refresh-ccw' },
  { value: 'faturalı', label: 'Faturalı', color: 'purple', icon: 'file-text' }
] as const;

export const SESSION_STATUS_FILTERS: SessionStatusFilter[] = [
  { status: 'all', label: 'Tümü', color: 'gray' },
  { status: '', label: 'Tüm Malzemeler', color: 'blue' },
  { status: 'normal', label: 'Normal Malzemeler', color: 'green', icon: 'check-circle' },
  { status: 'konsinye', label: 'Konsinye Malzemeler', color: 'blue', icon: 'package' },
  { status: 'iade', label: 'İade Malzemeler', color: 'red', icon: 'refresh-ccw' },
  { status: 'faturalı', label: 'Faturalı Malzemeler', color: 'purple', icon: 'file-text' }
] as const;

export const UNIT_OPTIONS = [
  { value: 'adet', label: 'Adet' },
  { value: 'kutu', label: 'Kutu' },
  { value: 'şişe', label: 'Şişe' },
  { value: 'tüp', label: 'Tüp' },
  { value: 'paket', label: 'Paket' },
  { value: 'ampul', label: 'Ampul' },
  { value: 'kg', label: 'Kilogram' },
  { value: 'lt', label: 'Litre' },
  { value: 'metre', label: 'Metre' },
  { value: 'ml', label: 'Mililitre' },
  { value: 'mg', label: 'Miligram' }
] as const;

export const SERIAL_NO_STATUS_OPTIONS = [
  { value: 'Aktif', label: 'Aktif' },
  { value: 'Pasif', label: 'Pasif' },
  { value: 'İade', label: 'İade' },
  { value: 'Hurda', label: 'Hurda' },
  { value: 'Garantili', label: 'Garantili' },
  { value: 'Garantisi Bitmiş', label: 'Garantisi Bitmiş' }
] as const;

export const STOCK_COUNT_STATUS_OPTIONS = [
  { value: 'planlı', label: 'Planlı', color: 'blue' },
  { value: 'devam-ediyor', label: 'Devam Ediyor', color: 'yellow' },
  { value: 'tamamlandı', label: 'Tamamlandı', color: 'green' },
  { value: 'iptal', label: 'İptal', color: 'red' },
  { value: 'onaylandı', label: 'Onaylandı', color: 'purple' }
] as const;

export const COUNT_STATUS_OPTIONS = [
  { value: 'tamamlandı', label: 'Tamamlandı', color: 'green' },
  { value: 'beklemede', label: 'Beklemede', color: 'yellow' },
  { value: 'onaylandı', label: 'Onaylandı', color: 'purple' },
  { value: 'reddedildi', label: 'Reddedildi', color: 'red' },
  { value: 'iptal', label: 'İptal', color: 'gray' },
  { value: 'düzeltildi', label: 'Düzeltildi', color: 'blue' }
] as const;

export const QUICK_COUNT_ACTIONS = [
  { value: 'scan', label: 'Tara', icon: 'camera' },
  { value: 'add', label: 'Ekle', icon: 'plus' },
  { value: 'remove', label: 'Çıkar', icon: 'minus' },
  { value: 'clear', label: 'Temizle', icon: 'trash' },
  { value: 'save', label: 'Kaydet', icon: 'save' }
] as const;

// Type Guards
export function isMaterialStatus(status: any): status is MaterialStatus {
  return ['normal', 'konsinye', 'iade', 'faturalı'].includes(status);
}

export function isStockCountStatus(status: any): status is StockCount['status'] {
  return ['tamamlandı', 'beklemede', 'onaylandı', 'reddedildi', 'iptal', 'düzeltildi'].includes(status);
}

export function isSessionStatus(status: any): status is StockCountSession['status'] {
  return ['planlı', 'devam-ediyor', 'tamamlandı', 'iptal', 'onaylandı'].includes(status);
}

export function isQuickCountAction(action: any): action is 'scan' | 'add' | 'remove' | 'clear' | 'save' {
  return ['scan', 'add', 'remove', 'clear', 'save'].includes(action);
}

// YENİ TYPE GUARDS
export function isMealType(type: any): type is Meal['type'] {
  return ['breakfast', 'lunch', 'dinner', 'snack'].includes(type);
}

export function isDietType(type: any): type is Meal['dietType'] {
  return ['normal', 'diabetic', 'low_salt', 'low_fat', 'vegetarian', 'other'].includes(type);
}

export function isSurgeryPriority(priority: any): priority is Surgery['priority'] {
  return ['normal', 'urgent', 'emergency'].includes(priority);
}

export function isAppointmentType(type: any): type is Appointment['type'] {
  return ['checkup', 'followup', 'emergency', 'routine', 'consultation', 'control'].includes(type);
}

export function isUserRole(role: any): role is User['role'] {
  return ['admin', 'manager', 'staff', 'viewer', 'doctor', 'nurse'].includes(role);
}

// Yardımcı Tipler
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

// SABİTLER
export const MATERIAL_FIELDS = {
  REQUIRED: ['name', 'barcode', 'category', 'unit', 'unitPrice', 'currentStock', 'minStock'] as const,
  OPTIONAL: ['gtin', 'sn', 'udiCode', 'allBarcode', 'intuitiveCode', 'serialNumber', 'subCategory', 'supplier', 'expirationDate', 'serialNoStatus', 'materialDescription', 'location', 'status'] as const,
  STATUS_DEPENDENT: ['expirationDate', 'serialNoStatus'] as const
} as const;

export const SESSION_FIELDS = {
  REQUIRED: ['invoiceNo', 'countDate', 'countedBy', 'sessionStatus'] as const,
  OPTIONAL: ['startDate', 'endDate', 'notes', 'pdfFile', 'quickCount'] as const
} as const;

export const COUNT_FIELDS = {
  REQUIRED: ['sessionId', 'materialId', 'barcode', 'countedQuantity', 'countDate', 'countedBy'] as const,
  OPTIONAL: ['unitPrice', 'totalValue', 'notes', 'verifiedBy', 'verifiedAt', 'correctionNotes', 'expectedQuantity', 'difference'] as const
} as const;

// YENİ SABİTLER
export const DAILY_PLAN_FIELDS = {
  REQUIRED: ['date', 'meals', 'surgeries', 'appointments'] as const,
  OPTIONAL: ['notes', 'status'] as const
} as const;

export const USER_FIELDS = {
  REQUIRED: ['username', 'email', 'password', 'name', 'department', 'role'] as const,
  OPTIONAL: ['phone', 'avatarColor', 'sessionTimeout', 'canViewPages', 'canEditPages'] as const
} as const;