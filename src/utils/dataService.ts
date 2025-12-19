// src/utils/dataService.ts
import { 
  Material, Category, Supplier, Patient, PatientMaterialUsage, 
  Invoice, StockCount, StockCountSession, SystemLog, 
  MaterialUsageAnalysis, StockValueAnalysis, YearlySummary, DashboardStats,
  MaterialStatus, InvoiceItem, User,
  // Yeni import'lar
  DailyPlan, Meal, Surgery, Appointment, ExcelImportResult, ExcelTemplate,
  Doctor, HospitalUnit, UserSession, PermissionGroup, ActivityLog,
  DailyStatistics, HospitalStatistics
} from '../types';

// Varsayılan veri oluşturma fonksiyonları
const createDefaultCategories = (): Category[] => [
  { 
    id: 'cat-1', 
    name: 'İlaç', 
    description: 'İlaç kategorisi',
    isActive: true,
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'cat-2', 
    name: 'Tıbbi Malzeme', 
    description: 'Tıbbi malzeme kategorisi',
    isActive: true,
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'cat-3', 
    name: 'Cerrahi Malzeme', 
    description: 'Cerrahi malzeme kategorisi',
    isActive: true,
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'cat-4', 
    name: 'Koruyucu Ekipman', 
    description: 'Koruyucu ekipman kategorisi',
    isActive: true,
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'cat-5', 
    name: 'Lens', 
    description: 'Lens kategorisi',
    isActive: true,
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'cat-6', 
    name: 'Diğer', 
    description: 'Diğer kategoriler',
    isActive: true,
    createdAt: new Date().toISOString() 
  }
];

const createDefaultSubCategories = (): Category[] => [
  { 
    id: 'subcat-1', 
    name: 'Ağrı Kesici', 
    parentId: 'cat-1',
    description: 'Ağrı kesici ilaçlar',
    isActive: true,
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'subcat-2', 
    name: 'Antibiyotik', 
    parentId: 'cat-1',
    description: 'Antibiyotik ilaçlar',
    isActive: true,
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'subcat-3', 
    name: 'Enjeksiyon', 
    parentId: 'cat-2',
    description: 'Enjeksiyon malzemeleri',
    isActive: true,
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'subcat-4', 
    name: 'Bandaj', 
    parentId: 'cat-2',
    description: 'Bandaj malzemeleri',
    isActive: true,
    createdAt: new Date().toISOString() 
  }
];

const createDefaultSuppliers = (): Supplier[] => [
  { 
    id: 'sup-1', 
    name: 'ABC İlaç',
    contactPerson: 'Ahmet Yılmaz',
    email: 'ahmet@abcilac.com',
    phone: '05321234567',
    address: 'İstanbul, Türkiye',
    isActive: true,
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'sup-2', 
    name: 'Sağlık Ürünleri A.Ş.',
    contactPerson: 'Mehmet Demir',
    email: 'mehmet@saglikurunleri.com',
    phone: '05329876543',
    address: 'Ankara, Türkiye',
    isActive: true,
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'sup-3', 
    name: 'Medikal Tedarik',
    contactPerson: 'Ayşe Kaya',
    email: 'ayse@medikaltedarik.com',
    phone: '05321112233',
    address: 'İzmir, Türkiye',
    isActive: true,
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'sup-4', 
    name: 'Eczane',
    contactPerson: 'Fatma Şahin',
    email: 'fatma@eczane.com',
    phone: '05324445566',
    address: 'Bursa, Türkiye',
    isActive: true,
    createdAt: new Date().toISOString() 
  }
];

const createDefaultMaterials = (): Material[] => [
  {
    id: 'mat-1',
    name: 'Parol 500 mg',
    barcode: '8691234567890',
    category: 'İlaç',
    subCategory: 'Ağrı Kesici',
    currentStock: 100,
    minStock: 20,
    unit: 'kutu',
    unitPrice: 25.50,
    supplier: 'ABC İlaç',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    gtin: '8691234567890',
    sn: 'SN001',
    udiCode: 'UDI001',
    allBarcode: 'ALL001',
    intuitiveCode: 'PAROL500',
    serialNumber: 'SN001',
    expirationDate: '2025-12-31',
    serialNoStatus: 'Aktif',
    materialDescription: 'Ağrı kesici ilaç',
    status: 'normal' as MaterialStatus,
    minStockLevel: 20
  } as Material,
  {
    id: 'mat-2',
    name: 'Cerrahi Maske',
    barcode: '8691234567891',
    category: 'Koruyucu Ekipman',
    subCategory: '',
    currentStock: 500,
    minStock: 100,
    unit: 'adet',
    unitPrice: 2.50,
    supplier: 'Sağlık Ürünleri A.Ş.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    gtin: '8691234567891',
    sn: 'SN002',
    udiCode: 'UDI002',
    allBarcode: 'ALL002',
    intuitiveCode: 'MASK01',
    serialNumber: 'SN002',
    expirationDate: '2026-06-30',
    serialNoStatus: 'Aktif',
    materialDescription: 'Cerrahi maske',
    status: 'normal' as MaterialStatus,
    minStockLevel: 100
  } as Material,
  {
    id: 'mat-3',
    name: 'İnce Latex Eldiven',
    barcode: '8691234567892',
    category: 'Koruyucu Ekipman',
    subCategory: '',
    currentStock: 200,
    minStock: 50,
    unit: 'çift',
    unitPrice: 5.75,
    supplier: 'Medikal Tedarik',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    gtin: '8691234567892',
    sn: 'SN003',
    udiCode: 'UDI003',
    allBarcode: 'ALL003',
    intuitiveCode: 'ELDIVEN01',
    serialNumber: 'SN003',
    expirationDate: '2025-09-30',
    serialNoStatus: 'Aktif',
    materialDescription: 'İnce latex eldiven',
    status: 'normal' as MaterialStatus,
    minStockLevel: 50
  } as Material,
  {
    id: 'mat-4',
    name: 'Antibiyotik Krem',
    barcode: '8691234567893',
    category: 'İlaç',
    subCategory: 'Antibiyotik',
    currentStock: 75,
    minStock: 15,
    unit: 'tüp',
    unitPrice: 18.90,
    supplier: 'Eczane',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    gtin: '8691234567893',
    sn: 'SN004',
    udiCode: 'UDI004',
    allBarcode: 'ALL004',
    intuitiveCode: 'ANTIBIYOTIK01',
    serialNumber: 'SN004',
    expirationDate: '2025-11-30',
    serialNoStatus: 'Aktif',
    materialDescription: 'Antibiyotik krem',
    status: 'normal' as MaterialStatus,
    minStockLevel: 15
  } as Material
];

const createDefaultStockCounts = (): StockCount[] => [
  {
    id: 'count-1',
    sessionId: 'session-1',
    materialId: 'mat-1',
    barcode: '8691234567890',
    countedQuantity: 100,
    unitPrice: 25.50,
    totalValue: 2550.00,
    countDate: '2024-01-20',
    countedBy: 'Admin User',
    status: 'tamamlandı',
    notes: 'İlk sayım',
    verifiedBy: '',
    verifiedAt: '',
    correctionNotes: '',
    createdAt: new Date().toISOString()
  }
];

// YENİ: Varsayılan doktorlar
const createDefaultDoctors = (): Doctor[] => [
  {
    id: 'doc-1',
    name: 'Ahmet',
    surname: 'Yılmaz',
    specialty: 'Katarakt Cerrahisi',
    licenseNumber: 'DOC123456',
    phone: '05321234567',
    email: 'ahmet.yilmaz@osmangazigoz.com',
    department: 'Göz Hastalıkları',
    title: 'Prof. Dr.',
    isActive: true,
    schedule: [
      { day: 'monday', startTime: '09:00', endTime: '17:00', maxAppointments: 20 },
      { day: 'wednesday', startTime: '09:00', endTime: '17:00', maxAppointments: 20 },
      { day: 'friday', startTime: '09:00', endTime: '17:00', maxAppointments: 15 }
    ],
    weeklyHours: 24,
    maxPatientsPerDay: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'doc-2',
    name: 'Ayşe',
    surname: 'Kaya',
    specialty: 'Glokom',
    licenseNumber: 'DOC654321',
    phone: '05329876543',
    email: 'ayse.kaya@osmangazigoz.com',
    department: 'Göz Hastalıkları',
    title: 'Doç. Dr.',
    isActive: true,
    schedule: [
      { day: 'tuesday', startTime: '10:00', endTime: '18:00', maxAppointments: 25 },
      { day: 'thursday', startTime: '10:00', endTime: '18:00', maxAppointments: 25 },
      { day: 'saturday', startTime: '09:00', endTime: '14:00', maxAppointments: 15 }
    ],
    weeklyHours: 27,
    maxPatientsPerDay: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// YENİ: Varsayılan hastane birimleri
const createDefaultHospitalUnits = (): HospitalUnit[] => [
  {
    id: 'unit-1',
    name: 'Göz Kliniği',
    type: 'clinic',
    floor: 3,
    roomCount: 12,
    bedCount: 24,
    phone: '02221234567',
    email: 'gozkliniği@osmangazigoz.com',
    headDoctorId: 'doc-1',
    headNurseId: 'nurse-1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'unit-2',
    name: 'Ameliyathane',
    type: 'clinic',
    floor: 4,
    roomCount: 6,
    bedCount: 12,
    phone: '02221234568',
    headDoctorId: 'doc-2',
    headNurseId: 'nurse-2',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// YENİ: Varsayılan günlük planlar
const createDefaultDailyPlans = (): DailyPlan[] => {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'plan-1',
      date: today,
      meals: [
        {
          id: 'meal-1',
          type: 'breakfast',
          name: 'Sabah Kahvaltısı',
          items: ['Peynir, Zeytin, Domates, Salatalık', 'Bal/Tahin-Pekmez', 'Süt', 'Haşlanmış Yumurta'],
          calories: 450,
          dietType: 'normal',
          mealTime: '08:00',
          patientCount: 120,
          specialNotes: 'Diyabetik hastalar için şeker ilavesiz',
          chef: 'Mehmet Usta'
        },
        {
          id: 'meal-2',
          type: 'lunch',
          name: 'Öğle Yemeği',
          items: ['Mercimek Çorbası', 'Izgara Tavuk', 'Bulgur Pilavı', 'Yoğurt', 'Mevsim Salata'],
          calories: 650,
          dietType: 'normal',
          mealTime: '12:30',
          patientCount: 150,
          specialNotes: 'Tuzsuz diyet için ayrı hazırlanacak'
        },
        {
          id: 'meal-3',
          type: 'dinner',
          name: 'Akşam Yemeği',
          items: ['Sebze Çorbası', 'Fırın Balık', 'Zeytinyağlı Taze Fasulye', 'Cacık', 'Meyve'],
          calories: 550,
          dietType: 'normal',
          mealTime: '18:00',
          patientCount: 100
        }
      ],
      surgeries: [
        {
          id: 'surg-1',
          doctorId: 'doc-1',
          doctorName: 'Dr. Ahmet Yılmaz',
          doctorSpecialty: 'Katarakt Cerrahisi',
          patientId: 'pat-1',
          patientName: 'Mehmet Demir',
          patientAge: 65,
          patientGender: 'male',
          surgeryType: 'Katarakt Ameliyatı',
          surgeryCode: 'CAT-001',
          duration: 45,
          startTime: '09:00',
          endTime: '09:45',
          room: 'A-1',
          roomType: 'operating',
          status: 'scheduled',
          priority: 'normal',
          requiredMaterials: [
            {
              materialId: 'mat-1',
              materialName: 'Parol 500 mg',
              quantity: 2,
              unit: 'kutu',
              unitPrice: 25.50,
              totalCost: 51.00,
              status: 'available'
            }
          ],
          anesthesiaType: 'Lokal Anestezi',
          estimatedCost: 5000
        }
      ],
      appointments: [
        {
          id: 'app-1',
          patientId: 'pat-2',
          patientName: 'Fatma Çelik',
          patientPhone: '05321112233',
          doctorId: 'doc-2',
          doctorName: 'Dr. Ayşe Kaya',
          doctorSpecialty: 'Glokom',
          appointmentTime: '10:30',
          duration: 30,
          type: 'checkup',
          status: 'scheduled',
          reason: 'Rutin kontrol',
          room: 'K-3',
          insurance: 'SGK',
          fee: 150
        }
      ],
      totalSurgeries: 1,
      totalAppointments: 5,
      emergencyCount: 2,
      notes: 'Normal günlük plan',
      createdBy: 'Admin User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'published'
    }
  ];
};

class DataService {
  private materials: Material[] = [];
  private categories: Category[] = [];
  private subCategories: Category[] = [];
  private suppliers: Supplier[] = [];
  private patients: Patient[] = [];
  private patientMaterialUsage: PatientMaterialUsage[] = [];
  private invoices: Invoice[] = [];
  private stockCounts: StockCount[] = [];
  private stockCountSessions: StockCountSession[] = [];
  private logs: SystemLog[] = [];
  // YENİ: Günlük planlama verileri
  private dailyPlans: DailyPlan[] = [];
  private doctors: Doctor[] = [];
  private hospitalUnits: HospitalUnit[] = [];
  private userSessions: UserSession[] = [];
  private activityLogs: ActivityLog[] = [];
  private permissionGroups: PermissionGroup[] = [];

  constructor() {
    this.loadFromLocalStorage(); // ÖNCE localStorage'dan yükle
    this.initializeDefaultData(); // SONRA varsayılan verileri oluştur
    this.ensureDefaultSessions(); // Varsayılan session'ları kontrol et
  }

  // Varsayılan verileri oluştur
  private initializeDefaultData() {
    if (this.categories.length === 0) {
      this.categories = createDefaultCategories();
    }

    if (this.subCategories.length === 0) {
      this.subCategories = createDefaultSubCategories();
    }

    if (this.suppliers.length === 0) {
      this.suppliers = createDefaultSuppliers();
    }

    if (this.materials.length === 0) {
      this.materials = createDefaultMaterials();
    }

    if (this.stockCounts.length === 0) {
      this.stockCounts = createDefaultStockCounts();
    }

    // YENİ: Günlük planlama varsayılan verileri
    if (this.doctors.length === 0) {
      this.doctors = createDefaultDoctors();
    }

    if (this.hospitalUnits.length === 0) {
      this.hospitalUnits = createDefaultHospitalUnits();
    }

    if (this.dailyPlans.length === 0) {
      this.dailyPlans = createDefaultDailyPlans();
    }
  }

  // Yeni ekle: Varsayılan session'ları oluştur
  private ensureDefaultSessions() {
    if (this.stockCountSessions.length === 0) {
      const defaultSession: StockCountSession = {
        id: 'session-1',
        sessionNo: this.generateSessionNo(),
        invoiceNo: 'FTR-2024-001',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        countDate: new Date().toISOString(),
        countedBy: 'Admin User',
        createdBy: 'Sistem',
        status: 'tamamlandı',
        notes: 'Varsayılan oturum',
        totalProductsCounted: 1,
        createdAt: new Date().toISOString(),
        sessionStatus: 'normal'
      };
      this.stockCountSessions.push(defaultSession);
      this.saveToLocalStorage();
    }
  }

  // === LOCALSTORAGE İŞLEMLERİ ===
  private loadFromLocalStorage() {
    try {
      const loadData = <T>(key: string, defaultValue: T[] = []): T[] => {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Eğer boş array ise default değeri döndür
          return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultValue;
        }
        return defaultValue;
      };

      // DEBUG: localStorage'dan gelen verileri kontrol et
      console.log('LocalStorage yükleniyor...');
      
      // ÖNEMLİ: Tüm anahtar değerlerini kontrol et
      const localStorageKeys = [
        'materials', 'categories', 'subCategories', 'suppliers',
        'patients', 'patientMaterialUsage', 'invoices', 
        'stockCounts', 'stockCountSessions', 'logs'
      ];
      
      localStorageKeys.forEach(key => {
        const value = localStorage.getItem(key);
        console.log(`${key}:`, value ? JSON.parse(value).length : 'BOŞ');
      });

      this.materials = loadData('materials', createDefaultMaterials());
      this.categories = loadData('categories', createDefaultCategories());
      this.subCategories = loadData('subCategories', createDefaultSubCategories());
      this.suppliers = loadData('suppliers', createDefaultSuppliers());
      this.patients = loadData('patients', []);
      this.patientMaterialUsage = loadData('patientMaterialUsage', []);
      this.invoices = loadData('invoices', []);
      this.stockCounts = loadData('stockCounts', createDefaultStockCounts());
      this.stockCountSessions = loadData('stockCountSessions', []);
      this.logs = loadData('logs', []);
      
      // Günlük planlama verileri
      this.dailyPlans = loadData('dailyPlans', createDefaultDailyPlans());
      this.doctors = loadData('doctors', createDefaultDoctors());
      this.hospitalUnits = loadData('hospitalUnits', createDefaultHospitalUnits());
      this.userSessions = loadData('userSessions', []);
      this.activityLogs = loadData('activityLogs', []);
      this.permissionGroups = loadData('permissionGroups', []);

    } catch (error) {
      console.error('LocalStorage yükleme hatası:', error);
      this.initializeDefaultData();
      this.ensureDefaultSessions();
    }
  }

  private saveToLocalStorage() {
    try {
      const saveData = (key: string, data: any) => {
        localStorage.setItem(key, JSON.stringify(data));
      };

      saveData('materials', this.materials);
      saveData('categories', this.categories);
      saveData('subCategories', this.subCategories);
      saveData('suppliers', this.suppliers);
      saveData('patients', this.patients);
      saveData('patientMaterialUsage', this.patientMaterialUsage);
      saveData('invoices', this.invoices);
      saveData('stockCounts', this.stockCounts);
      saveData('stockCountSessions', this.stockCountSessions);
      saveData('logs', this.logs);
      
      // YENİ: Günlük planlama verileri
      saveData('dailyPlans', this.dailyPlans);
      saveData('doctors', this.doctors);
      saveData('hospitalUnits', this.hospitalUnits);
      saveData('userSessions', this.userSessions);
      saveData('activityLogs', this.activityLogs);
      saveData('permissionGroups', this.permissionGroups);
    } catch (error) {
      console.error('LocalStorage kaydetme hatası:', error);
    }
  }

  // === SİSTEM LOGLARI ===
  logAction(log: Omit<SystemLog, 'id' | 'performedAt'>): SystemLog {
    const newLog: SystemLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      performedAt: new Date().toISOString()
    };
    
    this.logs.push(newLog);
    
    // Log sayısını sınırla (son 1000 kayıt)
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
    
    this.saveToLocalStorage();
    return newLog;
  }

  getLogs(): SystemLog[] {
    return [...this.logs].sort((a, b) => 
      new Date(b.performedAt || '').getTime() - new Date(a.performedAt || '').getTime()
    );
  }

  // === GÜNLÜK PLANLAMA YÖNETİMİ ===
  getDailyPlans(): DailyPlan[] {
    return [...this.dailyPlans].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  getDailyPlanByDate(date: string): DailyPlan | undefined {
    return this.dailyPlans.find(plan => plan.date === date);
  }

  getDailyPlanById(id: string): DailyPlan | undefined {
    return this.dailyPlans.find(plan => plan.id === id);
  }

  getTodayPlan(): DailyPlan | undefined {
    const today = new Date().toISOString().split('T')[0];
    return this.getDailyPlanByDate(today);
  }

  saveDailyPlan(planData: Omit<DailyPlan, 'id' | 'createdAt' | 'updatedAt'>): DailyPlan {
    const existingPlanIndex = this.dailyPlans.findIndex(p => p.date === planData.date);
    
    if (existingPlanIndex !== -1) {
      // Mevcut planı güncelle
      const updatedPlan: DailyPlan = {
        ...this.dailyPlans[existingPlanIndex],
        ...planData,
        updatedAt: new Date().toISOString()
      };
      
      this.dailyPlans[existingPlanIndex] = updatedPlan;
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'UPDATE',
        module: 'DAILY_PLAN',
        recordId: updatedPlan.id,
        details: `Günlük plan güncellendi: ${planData.date}`,
        performedBy: this.getCurrentUser().name
      });
      
      return updatedPlan;
    } else {
      // Yeni plan oluştur
      const newPlan: DailyPlan = {
        ...planData,
        id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: planData.status || 'draft',
        totalSurgeries: planData.surgeries?.length || 0,
        totalAppointments: planData.appointments?.length || 0,
        emergencyCount: planData.appointments?.filter(a => a.type === 'emergency').length || 0
      };
      
      this.dailyPlans.push(newPlan);
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'CREATE',
        module: 'DAILY_PLAN',
        recordId: newPlan.id,
        details: `Yeni günlük plan oluşturuldu: ${planData.date}`,
        performedBy: this.getCurrentUser().name
      });
      
      return newPlan;
    }
  }

  addMealToPlan(planId: string, mealData: Omit<Meal, 'id'>): DailyPlan | null {
    const planIndex = this.dailyPlans.findIndex(p => p.id === planId);
    if (planIndex === -1) return null;

    const newMeal: Meal = {
      ...mealData,
      id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    this.dailyPlans[planIndex].meals.push(newMeal);
    this.saveToLocalStorage();
    
    this.logAction({
      action: 'ADD_MEAL',
      module: 'DAILY_PLAN',
      recordId: planId,
      details: `Yemek eklendi: ${mealData.name} - ${mealData.type}`,
      performedBy: this.getCurrentUser().name
    });
    
    return this.dailyPlans[planIndex];
  }

  addSurgeryToPlan(planId: string, surgeryData: Omit<Surgery, 'id'>): DailyPlan | null {
    const planIndex = this.dailyPlans.findIndex(p => p.id === planId);
    if (planIndex === -1) return null;

    const newSurgery: Surgery = {
      ...surgeryData,
      id: `surg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    this.dailyPlans[planIndex].surgeries.push(newSurgery);
    this.dailyPlans[planIndex].totalSurgeries = this.dailyPlans[planIndex].surgeries.length;
    this.saveToLocalStorage();
    
    this.logAction({
      action: 'ADD_SURGERY',
      module: 'DAILY_PLAN',
      recordId: planId,
      details: `Ameliyat eklendi: ${surgeryData.patientName} - ${surgeryData.surgeryType}`,
      performedBy: this.getCurrentUser().name
    });
    
    return this.dailyPlans[planIndex];
  }

  addAppointmentToPlan(planId: string, appointmentData: Omit<Appointment, 'id'>): DailyPlan | null {
    const planIndex = this.dailyPlans.findIndex(p => p.id === planId);
    if (planIndex === -1) return null;

    const newAppointment: Appointment = {
      ...appointmentData,
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    this.dailyPlans[planIndex].appointments.push(newAppointment);
    this.dailyPlans[planIndex].totalAppointments = this.dailyPlans[planIndex].appointments.length;
    this.dailyPlans[planIndex].emergencyCount = this.dailyPlans[planIndex].appointments
      .filter(a => a.type === 'emergency').length;
    this.saveToLocalStorage();
    
    this.logAction({
      action: 'ADD_APPOINTMENT',
      module: 'DAILY_PLAN',
      recordId: planId,
      details: `Randevu eklendi: ${appointmentData.patientName} - Dr. ${appointmentData.doctorName}`,
      performedBy: this.getCurrentUser().name
    });
    
    return this.dailyPlans[planIndex];
  }

  updateDailyPlan(id: string, updates: Partial<DailyPlan>): DailyPlan | null {
    const index = this.dailyPlans.findIndex(p => p.id === id);
    if (index !== -1) {
      const oldPlan = this.dailyPlans[index];
      this.dailyPlans[index] = { 
        ...oldPlan, 
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'UPDATE',
        module: 'DAILY_PLAN',
        recordId: id,
        details: `Günlük plan güncellendi: ${oldPlan.date}`,
        performedBy: this.getCurrentUser().name
      });
      
      return this.dailyPlans[index];
    }
    return null;
  }

  deleteDailyPlan(id: string): boolean {
    const index = this.dailyPlans.findIndex(p => p.id === id);
    if (index !== -1) {
      const planDate = this.dailyPlans[index].date;
      this.dailyPlans.splice(index, 1);
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'DELETE',
        module: 'DAILY_PLAN',
        recordId: id,
        details: `Günlük plan silindi: ${planDate}`,
        performedBy: this.getCurrentUser().name
      });
      
      return true;
    }
    return false;
  }

  // === EXCEL IMPORT İŞLEMLERİ ===
  importFromExcel(file: File, importType: 'meals' | 'surgeries' | 'appointments' | 'all'): ExcelImportResult {
    const result: ExcelImportResult = {
      success: false,
      importedCount: 0,
      failedCount: 0,
      errors: [],
      warnings: [],
      fileName: file.name,
      importDate: new Date().toISOString()
    };

    // Burada gerçek Excel okuma işlemi yapılacak
    // Şimdilik simülasyon yapıyoruz
    setTimeout(() => {
      // Simüle edilmiş başarılı import
      result.success = true;
      result.importedCount = 10;
      result.summary = {
        meals: 3,
        surgeries: 4,
        appointments: 3
      };
      
      // Log kaydı
      this.logAction({
        action: 'EXCEL_IMPORT',
        module: 'DAILY_PLAN',
        recordId: 'EXCEL_IMPORT',
        details: `Excel dosyası içe aktarıldı: ${file.name} - Tip: ${importType}`,
        performedBy: this.getCurrentUser().name
      });
    }, 1000);

    return result;
  }

  getExcelTemplates(): ExcelTemplate[] {
    return [
      {
        id: 'template-1',
        name: 'Günlük Yemek Listesi Şablonu',
        type: 'meals',
        description: 'Yemek listesi için Excel şablonu',
        fileUrl: '/templates/meals-template.xlsx',
        fields: [
          { name: 'mealType', header: 'Öğün Tipi', type: 'list', required: true, description: 'Kahvaltı, Öğle, Akşam' },
          { name: 'mealName', header: 'Yemek Adı', type: 'string', required: true },
          { name: 'items', header: 'Malzemeler', type: 'string', required: true },
          { name: 'calories', header: 'Kalori', type: 'number', required: true },
          { name: 'dietType', header: 'Diyet Tipi', type: 'list', required: true },
          { name: 'patientCount', header: 'Hasta Sayısı', type: 'number', required: true }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'template-2',
        name: 'Ameliyat Planı Şablonu',
        type: 'surgeries',
        description: 'Ameliyat planı için Excel şablonu',
        fileUrl: '/templates/surgeries-template.xlsx',
        fields: [
          { name: 'patientName', header: 'Hasta Adı', type: 'string', required: true },
          { name: 'doctorName', header: 'Doktor Adı', type: 'string', required: true },
          { name: 'surgeryType', header: 'Ameliyat Tipi', type: 'string', required: true },
          { name: 'startTime', header: 'Başlangıç Saati', type: 'date', required: true },
          { name: 'duration', header: 'Süre (dk)', type: 'number', required: true },
          { name: 'room', header: 'Ameliyathane', type: 'string', required: true },
          { name: 'priority', header: 'Öncelik', type: 'list', required: true }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  // === DOKTOR YÖNETİMİ ===
  getDoctors(): Doctor[] {
    return [...this.doctors];
  }

  getDoctorById(id: string): Doctor | undefined {
    return this.doctors.find(d => d.id === id);
  }

  saveDoctor(doctorData: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Doctor {
    const newDoctor: Doctor = {
      ...doctorData,
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.doctors.push(newDoctor);
    this.saveToLocalStorage();
    
    this.logAction({
      action: 'CREATE',
      module: 'DOCTOR',
      recordId: newDoctor.id,
      details: `Yeni doktor eklendi: ${doctorData.name} ${doctorData.surname}`,
      performedBy: this.getCurrentUser().name
    });
    
    return newDoctor;
  }

  updateDoctor(id: string, updates: Partial<Doctor>): Doctor | null {
    const index = this.doctors.findIndex(d => d.id === id);
    if (index !== -1) {
      const oldDoctor = this.doctors[index];
      this.doctors[index] = { 
        ...oldDoctor, 
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'UPDATE',
        module: 'DOCTOR',
        recordId: id,
        details: `Doktor güncellendi: ${oldDoctor.name} ${oldDoctor.surname}`,
        performedBy: this.getCurrentUser().name
      });
      
      return this.doctors[index];
    }
    return null;
  }

  deleteDoctor(id: string): boolean {
    const index = this.doctors.findIndex(d => d.id === id);
    if (index !== -1) {
      const doctorName = `${this.doctors[index].name} ${this.doctors[index].surname}`;
      this.doctors.splice(index, 1);
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'DELETE',
        module: 'DOCTOR',
        recordId: id,
        details: `Doktor silindi: ${doctorName}`,
        performedBy: this.getCurrentUser().name
      });
      
      return true;
    }
    return false;
  }

  // === HASTANE BİRİM YÖNETİMİ ===
  getHospitalUnits(): HospitalUnit[] {
    return [...this.hospitalUnits];
  }

  getHospitalUnitById(id: string): HospitalUnit | undefined {
    return this.hospitalUnits.find(u => u.id === id);
  }

  saveHospitalUnit(unitData: Omit<HospitalUnit, 'id' | 'createdAt' | 'updatedAt'>): HospitalUnit {
    const newUnit: HospitalUnit = {
      ...unitData,
      id: `unit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.hospitalUnits.push(newUnit);
    this.saveToLocalStorage();
    
    this.logAction({
      action: 'CREATE',
      module: 'HOSPITAL_UNIT',
      recordId: newUnit.id,
      details: `Yeni hastane birimi eklendi: ${unitData.name}`,
      performedBy: this.getCurrentUser().name
    });
    
    return newUnit;
  }

  // === KULLANICI OTURUM YÖNETİMİ ===
  getUserSessions(): UserSession[] {
    return [...this.userSessions].filter(s => s.isActive);
  }

  getAllUserSessions(): UserSession[] {
    return [...this.userSessions].sort((a, b) => 
      new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime()
    );
  }

  createUserSession(user: User, ipAddress: string, userAgent: string): UserSession {
    const newSession: UserSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      ipAddress,
      userAgent,
      isActive: true,
      deviceInfo: {
        browser: this.extractBrowserInfo(userAgent),
        os: this.extractOSInfo(userAgent),
        device: this.extractDeviceInfo(userAgent)
      }
    };
    
    this.userSessions.push(newSession);
    this.saveToLocalStorage();
    
    return newSession;
  }

  updateUserSessionActivity(sessionId: string): void {
    const sessionIndex = this.userSessions.findIndex(s => s.id === sessionId);
    if (sessionIndex !== -1) {
      this.userSessions[sessionIndex].lastActivity = new Date().toISOString();
      this.saveToLocalStorage();
    }
  }

  terminateUserSession(sessionId: string, reason?: string): boolean {
    const sessionIndex = this.userSessions.findIndex(s => s.id === sessionId);
    if (sessionIndex !== -1) {
      this.userSessions[sessionIndex].isActive = false;
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'TERMINATE_SESSION',
        module: 'USER_SESSION',
        recordId: sessionId,
        details: `Kullanıcı oturumu sonlandırıldı: ${this.userSessions[sessionIndex].userName} - Sebep: ${reason || 'Manuel sonlandırma'}`,
        performedBy: this.getCurrentUser().name
      });
      
      return true;
    }
    return false;
  }

  terminateAllUserSessions(): number {
    let terminatedCount = 0;
    this.userSessions.forEach(session => {
      if (session.isActive) {
        session.isActive = false;
        terminatedCount++;
      }
    });
    
    this.saveToLocalStorage();
    
    if (terminatedCount > 0) {
      this.logAction({
        action: 'TERMINATE_ALL_SESSIONS',
        module: 'USER_SESSION',
        recordId: 'ALL',
        details: `${terminatedCount} aktif oturum sonlandırıldı`,
        performedBy: this.getCurrentUser().name
      });
    }
    
    return terminatedCount;
  }

  private extractBrowserInfo(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private extractOSInfo(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private extractDeviceInfo(userAgent: string): string {
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  }

  // === AKTİVİTE LOG YÖNETİMİ ===
  logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): ActivityLog {
    const newActivity: ActivityLog = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    
    this.activityLogs.push(newActivity);
    
    // Aktivite log sayısını sınırla (son 5000 kayıt)
    if (this.activityLogs.length > 5000) {
      this.activityLogs = this.activityLogs.slice(-5000);
    }
    
    this.saveToLocalStorage();
    return newActivity;
  }

  getActivityLogs(filters?: {
    userId?: string;
    module?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
  }): ActivityLog[] {
    let filteredLogs = [...this.activityLogs];
    
    if (filters) {
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }
      if (filters.module) {
        filteredLogs = filteredLogs.filter(log => log.module === filters.module);
      }
      if (filters.severity) {
        filteredLogs = filteredLogs.filter(log => log.severity === filters.severity);
      }
      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
      }
    }
    
    return filteredLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // === KULLANICI YÖNETİMİ ===
  getUsers(): User[] {
    // Varsayılan kullanıcılar
    const defaultUsers: User[] = [
      {
        id: 'user-1',
        username: 'admin',
        email: 'admin@osmangazigoz.com',
        password: 'admin123', // Gerçek uygulamada hash'lenmiş olmalı
        name: 'Sistem Admin',
        department: 'Yönetim',
        role: 'admin',
        permissions: {
          createSession: true,
          approveCounts: true,
          manageMaterials: true,
          managePatients: true,
          manageInvoices: true,
          bulkStatusChange: true,
          quickCount: true,
          exportData: true,
          manageUsers: true,
          manageSettings: true,
          viewDashboard: true,
          importExcel: true,
          manageDailyPlan: true
        } as any, // Type assertion kullanıldı
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatarColor: '#4F46E5',
        phone: '05320000001'
      },
      {
        id: 'user-2',
        username: 'doktor1',
        email: 'doktor@osmangazigoz.com',
        password: 'doktor123',
        name: 'Dr. Ahmet Yılmaz',
        department: 'Göz Hastalıkları',
        role: 'doctor',
        permissions: {
          createSession: false,
          approveCounts: false,
          manageMaterials: false,
          managePatients: true,
          manageInvoices: false,
          bulkStatusChange: false,
          quickCount: false,
          exportData: false,
          manageUsers: false,
          manageSettings: false,
          viewDashboard: true,
          importExcel: false,
          manageDailyPlan: true
        } as any, // Type assertion kullanıldı
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatarColor: '#10B981',
        phone: '05320000002'
      },
      {
        id: 'user-3',
        username: 'stok_sorumlusu',
        email: 'stok@osmangazigoz.com',
        password: 'stok123',
        name: 'Stok Sorumlusu',
        department: 'Tedarik',
        role: 'manager',
        permissions: {
          createSession: true,
          approveCounts: true,
          manageMaterials: true,
          managePatients: false,
          manageInvoices: true,
          bulkStatusChange: true,
          quickCount: true,
          exportData: true,
          manageUsers: false,
          manageSettings: false,
          viewDashboard: true,
          importExcel: true,
          manageDailyPlan: false
        } as any, // Type assertion kullanıldı
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatarColor: '#F59E0B',
        phone: '05320000003'
      }
    ];
    
    // LocalStorage'dan kullanıcıları yükle
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      try {
        return JSON.parse(storedUsers);
      } catch (error) {
        console.error('Kullanıcı verisi parse edilemedi:', error);
      }
    }
    
    // Varsayılan kullanıcıları kaydet
    localStorage.setItem('users', JSON.stringify(defaultUsers));
    return defaultUsers;
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find(user => user.id === id);
  }

  saveUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      avatarColor: userData.avatarColor || this.generateAvatarColor(),
      isActive: userData.isActive !== undefined ? userData.isActive : true
    } as User;
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    this.logAction({
      action: 'CREATE',
      module: 'USER',
      recordId: newUser.id,
      details: `Yeni kullanıcı eklendi: ${userData.name} (${userData.role})`,
      performedBy: this.getCurrentUser().name
    });
    
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    
    if (index !== -1) {
      const oldUser = users[index];
      users[index] = { 
        ...oldUser, 
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('users', JSON.stringify(users));
      
      this.logAction({
        action: 'UPDATE',
        module: 'USER',
        recordId: id,
        details: `Kullanıcı güncellendi: ${oldUser.name}`,
        performedBy: this.getCurrentUser().name
      });
      
      return users[index];
    }
    return null;
  }

  updateUserPermissions(id: string, permissions: Partial<User['permissions']>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    
    if (index !== -1) {
      const oldUser = users[index];
      users[index] = {
        ...oldUser,
        permissions: { ...oldUser.permissions, ...permissions } as any,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('users', JSON.stringify(users));
      
      this.logAction({
        action: 'UPDATE_PERMISSIONS',
        module: 'USER',
        recordId: id,
        details: `Kullanıcı yetkileri güncellendi: ${oldUser.name}`,
        performedBy: this.getCurrentUser().name
      });
      
      return users[index];
    }
    return null;
  }

  deleteUser(id: string): boolean {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    
    if (index !== -1) {
      const userName = users[index].name;
      users.splice(index, 1);
      localStorage.setItem('users', JSON.stringify(users));
      
      this.logAction({
        action: 'DELETE',
        module: 'USER',
        recordId: id,
        details: `Kullanıcı silindi: ${userName}`,
        performedBy: this.getCurrentUser().name
      });
      
      return true;
    }
    return false;
  }

  private generateAvatarColor(): string {
    const colors = [
      '#4F46E5', '#7C3AED', '#EC4899', '#EF4444', 
      '#F59E0B', '#10B981', '#06B6D4', '#3B82F6'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // === DASHBOARD İSTATİSTİKLERİ - GÜNCELLENMİŞ ===
  getDashboardStats(): DashboardStats {
    const totalMaterials = this.materials.length;
    const totalPatients = this.patients.length;
    const totalStockValue = this.materials.reduce((sum, m) => sum + (m.currentStock * m.unitPrice), 0);
    const criticalStockCount = this.materials.filter(m => m.currentStock <= m.minStock).length;
    const totalUsageCost = this.patientMaterialUsage.reduce((sum, u) => sum + u.totalCost, 0);
    const totalInvoices = this.invoices.length;
    const totalInvoiceAmount = this.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    const lowStockMaterials = this.materials
      .filter(m => m.currentStock <= m.minStock)
      .slice(0, 5);

    const recentActivities = this.getLogs().slice(0, 10);

    const materialUsageMap = new Map<string, { name: string; quantity: number; cost: number }>();
    this.patientMaterialUsage.forEach(usage => {
      const material = this.materials.find(m => m.id === usage.materialId);
      if (material) {
        const existing = materialUsageMap.get(usage.materialId) || { 
          name: material.name, 
          quantity: 0, 
          cost: 0 
        };
        materialUsageMap.set(usage.materialId, {
          name: material.name,
          quantity: existing.quantity + usage.quantity,
          cost: existing.cost + usage.totalCost,
        });
      }
    });

    const topUsedMaterials = Array.from(materialUsageMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const today = new Date().toISOString().split('T')[0];
    const todayUsages = this.patientMaterialUsage.filter(u => 
      u.usageDate.startsWith(today)
    );
    const todayUsageCost = todayUsages.reduce((sum, u) => sum + u.totalCost, 0);
    
    const weeklySales = this.patientMaterialUsage
      .filter(u => {
        const usageDate = new Date(u.usageDate);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return usageDate >= weekAgo;
      })
      .reduce((sum, u) => sum + u.totalCost, 0);

    const monthlySales = this.patientMaterialUsage
      .filter(u => {
        const usageDate = new Date(u.usageDate);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return usageDate >= monthAgo;
      })
      .reduce((sum, u) => sum + u.totalCost, 0);

    // Statü özeti
    const statusSummary = {
      normal: this.materials.filter(m => m.status === 'normal').length,
      konsinye: this.materials.filter(m => m.status === 'konsinye').length,
      iade: this.materials.filter(m => m.status === 'iade').length,
      faturalı: this.materials.filter(m => m.status === 'faturalı').length
    };

    // YENİ: Günlük plan istatistikleri
    const todayPlan = this.getDailyPlanByDate(today);
    const dailyPlanStats = {
      surgeries: todayPlan?.surgeries.length || 0,
      appointments: todayPlan?.appointments.length || 0,
      emergencyCases: todayPlan?.emergencyCount || 0,
      mealsServed: todayPlan?.meals.reduce((sum, meal) => sum + meal.patientCount, 0) || 0
    };

    // YENİ: Hastane istatistikleri
    const hospitalStats = {
      totalDoctors: this.doctors.filter(d => d.isActive).length,
      totalNurses: 15, // Sabit değer, veritabanından çekilebilir
      bedOccupancy: 75, // Yüzde olarak
      todayRevenue: 0 // Hesaplanacak
    };

    // YENİ: Kullanıcı istatistikleri
    const userStats = {
      activeUsers: this.getUsers().filter(u => u.isActive).length,
      activeSessions: this.getUserSessions().length,
      recentLogins: this.userSessions
        .filter(s => new Date(s.loginTime).getDate() === new Date().getDate())
        .length
    };

    return {
      totalMaterials,
      totalPatients,
      totalStockValue,
      criticalStockCount,
      totalUsageCost,
      lowStockMaterials,
      recentActivities,
      topUsedMaterials,
      totalInvoices,
      totalInvoiceAmount,
      todayUsageCost,
      weeklySales,
      monthlySales,
      todayUsagesCount: todayUsages.length,
      activeSessions: this.stockCountSessions.filter(s => s.status === 'devam-ediyor').length,
      statusSummary,
      // YENİ ALANLAR
      dailyPlan: dailyPlanStats,
      hospitalStats,
      userStats
    } as DashboardStats;
  }

  // === HASTANE İSTATİSTİKLERİ ===
  getHospitalStatistics(date?: string): HospitalStatistics {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const dailyPlan = this.getDailyPlanByDate(targetDate);
    const todayAppointments = dailyPlan?.appointments || [];
    const todaySurgeries = dailyPlan?.surgeries || [];
    
    return {
      date: targetDate,
      totalPatients: this.patients.length,
      totalDoctors: this.doctors.filter(d => d.isActive).length,
      totalNurses: 15, // Veritabanından çekilecek
      totalSurgeries: todaySurgeries.length,
      totalAppointments: todayAppointments.length,
      emergencyCases: todayAppointments.filter(a => a.type === 'emergency').length,
      averageStayDuration: 2.5, // Ortalama kalış süresi (gün)
      bedOccupancyRate: 75, // Yatak doluluk oranı (%)
      surgerySuccessRate: 98, // Ameliyat başarı oranı (%)
      patientSatisfaction: 92, // Hasta memnuniyeti (%)
      revenue: 150000, // Günlük gelir
      expenses: 75000, // Günlük gider
      profit: 75000 // Günlük kar
    };
  }

  getDailyStatistics(date?: string): DailyStatistics {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const dailyPlan = this.getDailyPlanByDate(targetDate);
    
    const surgeries = dailyPlan?.surgeries || [];
    const appointments = dailyPlan?.appointments || [];
    const meals = dailyPlan?.meals || [];
    
    // Ameliyat istatistikleri
    const surgeryStats = {
      total: surgeries.length,
      completed: surgeries.filter(s => s.status === 'completed').length,
      inProgress: surgeries.filter(s => s.status === 'in-progress').length,
      cancelled: surgeries.filter(s => s.status === 'cancelled').length,
      byType: surgeries.reduce((acc, surgery) => {
        acc[surgery.surgeryType] = (acc[surgery.surgeryType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
    
    // Randevu istatistikleri
    const appointmentStats = {
      total: appointments.length,
      completed: appointments.filter(a => a.status === 'completed').length,
      waiting: appointments.filter(a => a.status === 'waiting').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
      byType: appointments.reduce((acc, appointment) => {
        acc[appointment.type] = (acc[appointment.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
    
    // Yemek istatistikleri
    const mealStats = {
      totalPatients: meals.reduce((sum, meal) => sum + meal.patientCount, 0),
      byDietType: meals.reduce((acc, meal) => {
        acc[meal.dietType] = (acc[meal.dietType] || 0) + meal.patientCount;
        return acc;
      }, {} as Record<string, number>)
    };
    
    // Acil durum istatistikleri
    const emergencyStats = {
      cases: appointments.filter(a => a.type === 'emergency').length,
      responseTime: 15 // Ortalama yanıt süresi (dakika)
    };
    
    return {
      date: targetDate,
      surgeries: surgeryStats,
      appointments: appointmentStats,
      meals: mealStats,
      emergency: emergencyStats
    };
  }

  // === KATEGORİ YÖNETİMİ ===
  getCategories(): Category[] {
    return [...this.categories];
  }

  getSubCategories(parentId?: string): Category[] {
    if (parentId) {
      return this.subCategories.filter(sub => sub.parentId === parentId);
    }
    return [...this.subCategories];
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories.find(c => c.id === id);
  }

  saveCategory(categoryData: Omit<Category, 'id' | 'createdAt'>): Category {
    const newCategory: Category = {
      ...categoryData,
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    this.categories.push(newCategory);
    this.saveToLocalStorage();
    
    this.logAction({
      action: 'CREATE',
      module: 'CATEGORY',
      recordId: newCategory.id,
      details: `Yeni kategori eklendi: ${categoryData.name}`,
      performedBy: this.getCurrentUser().name
    });
    
    return newCategory;
  }

  addCategory(name: string): Category {
    return this.saveCategory({
      name: name.trim(),
      description: '',
      isActive: true
    });
  }

  addSubCategory(name: string, parentId: string): Category {
    const parentCategory = this.categories.find(cat => cat.id === parentId);
    if (!parentCategory) {
      throw new Error('Ana kategori bulunamadı');
    }

    const newSubCategory: Category = {
      id: `subcat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      parentId: parentId,
      description: '',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    this.subCategories.push(newSubCategory);
    this.saveToLocalStorage();
    
    this.logAction({
      action: 'CREATE',
      module: 'CATEGORY',
      recordId: newSubCategory.id,
      details: `Yeni alt kategori eklendi: ${name} (${parentCategory.name})`,
      performedBy: this.getCurrentUser().name
    });
    
    return newSubCategory;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const index = this.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      const oldCategory = this.categories[index];
      this.categories[index] = {
        ...oldCategory,
        ...updates
      };
      
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'UPDATE',
        module: 'CATEGORY',
        recordId: id,
        details: `Kategori güncellendi: ${oldCategory.name}`,
        performedBy: this.getCurrentUser().name
      });
      
      return this.categories[index];
    }
    return null;
  }

  deleteCategory(id: string): boolean {
    const index = this.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      const categoryName = this.categories[index].name;
      
      // İlgili alt kategorileri de sil
      this.subCategories = this.subCategories.filter(sub => sub.parentId !== id);
      
      this.categories.splice(index, 1);
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'DELETE',
        module: 'CATEGORY',
        recordId: id,
        details: `Ana kategori ve alt kategorileri silindi: ${categoryName}`,
        performedBy: this.getCurrentUser().name
      });
      
      return true;
    }
    return false;
  }

  deleteSubCategory(id: string): boolean {
    const index = this.subCategories.findIndex(c => c.id === id);
    if (index !== -1) {
      const subCategoryName = this.subCategories[index].name;
      this.subCategories.splice(index, 1);
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'DELETE',
        module: 'CATEGORY',
        recordId: id,
        details: `Alt kategori silindi: ${subCategoryName}`,
        performedBy: this.getCurrentUser().name
      });
      
      return true;
    }
    return false;
  }

  // === TEDARİKÇİ YÖNETİMİ ===
  getSuppliers(): Supplier[] {
    return [...this.suppliers];
  }

  getSupplierById(id: string): Supplier | undefined {
    return this.suppliers.find(s => s.id === id);
  }

  saveSupplier(supplierData: Omit<Supplier, 'id' | 'createdAt'>): Supplier {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    this.suppliers.push(newSupplier);
    this.saveToLocalStorage();
    
    this.logAction({
      action: 'CREATE',
      module: 'SUPPLIER',
      recordId: newSupplier.id,
      details: `Yeni tedarikçi eklendi: ${supplierData.name}`,
      performedBy: this.getCurrentUser().name
    });
    
    return newSupplier;
  }

  updateSupplier(id: string, updates: Partial<Supplier>): Supplier | null {
    const index = this.suppliers.findIndex(s => s.id === id);
    if (index !== -1) {
      const oldSupplier = this.suppliers[index];
      this.suppliers[index] = {
        ...oldSupplier,
        ...updates
      };
      
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'UPDATE',
        module: 'SUPPLIER',
        recordId: id,
        details: `Tedarikçi güncellendi: ${oldSupplier.name}`,
        performedBy: this.getCurrentUser().name
      });
      
      return this.suppliers[index];
    }
    return null;
  }

  deleteSupplier(id: string): boolean {
    const index = this.suppliers.findIndex(s => s.id === id);
    if (index !== -1) {
      const supplierName = this.suppliers[index].name;
      this.suppliers.splice(index, 1);
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'DELETE',
        module: 'SUPPLIER',
        recordId: id,
        details: `Tedarikçi silindi: ${supplierName}`,
        performedBy: this.getCurrentUser().name
      });
      
      return true;
    }
    return false;
  }

  // === MALZEME YÖNETİMİ ===
  getMaterials(): Material[] {
    return [...this.materials];
  }

  getMaterialById(id: string): Material | undefined {
    return this.materials.find(m => m.id === id);
  }

  getMaterialByBarcode(barcode: string): Material | undefined {
    return this.materials.find(m => 
      m.barcode === barcode ||
      m.gtin === barcode ||
      m.sn === barcode ||
      m.udiCode === barcode ||
      m.allBarcode === barcode ||
      (m.allBarcode && m.allBarcode.split(',').map(b => b.trim()).includes(barcode))
    );
  }

  getMaterialsByCategory(category: string): Material[] {
    return this.materials.filter(m => m.category === category);
  }

  getLowStockMaterials(): Material[] {
    return this.materials.filter(m => m.currentStock <= m.minStock);
  }

  getMaterialsByIds(materialIds: string[]): Material[] {
    return this.materials.filter(material => materialIds.includes(material.id));
  }

  searchMaterialsWithFilters(filters: {
    searchTerm?: string;
    category?: string;
    status?: string;
    lowStockOnly?: boolean;
  }): Material[] {
    let filteredMaterials = this.materials;

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filteredMaterials = filteredMaterials.filter(material =>
        material.name.toLowerCase().includes(term) ||
        material.barcode.toLowerCase().includes(term) ||
        material.gtin?.toLowerCase().includes(term) ||
        material.sn?.toLowerCase().includes(term) ||
        material.udiCode?.toLowerCase().includes(term) ||
        material.allBarcode?.toLowerCase().includes(term) ||
        material.category.toLowerCase().includes(term) ||
        material.supplier?.toLowerCase().includes(term) ||
        material.intuitiveCode?.toLowerCase().includes(term) ||
        material.materialDescription?.toLowerCase().includes(term)
      );
    }

    if (filters.category && filters.category !== 'all') {
      filteredMaterials = filteredMaterials.filter(m => m.category === filters.category);
    }

    if (filters.status && filters.status !== 'all') {
      filteredMaterials = filteredMaterials.filter(m => m.status === filters.status);
    }

    if (filters.lowStockOnly) {
      filteredMaterials = filteredMaterials.filter(m => m.currentStock <= m.minStock);
    }

    return filteredMaterials;
  }

  saveMaterial(materialData: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Material {
    // SN kontrolü
    if (materialData.sn) {
      const existingMaterialWithSN = this.materials.find(m => m.sn === materialData.sn);
      if (existingMaterialWithSN) {
        throw new Error(`SN ${materialData.sn} zaten sistemde kayıtlı! Malzeme: ${existingMaterialWithSN.name}`);
      }
    }

    // Eksik alanları varsayılan değerlerle doldur
    const completeMaterialData: any = {
      ...materialData,
      gtin: materialData.gtin || '',
      sn: materialData.sn || '',
      udiCode: materialData.udiCode || '',
      allBarcode: materialData.allBarcode || '',
      intuitiveCode: materialData.intuitiveCode || '',
      serialNumber: materialData.serialNumber || materialData.sn || '',
      expirationDate: materialData.expirationDate || '',
      serialNoStatus: materialData.serialNoStatus || '',
      materialDescription: materialData.materialDescription || materialData.name,
      status: materialData.status || 'normal',
      isActive: materialData.isActive !== undefined ? materialData.isActive : true,
      minStockLevel: (materialData as any).minStockLevel || materialData.minStock || 0,
      subCategory: materialData.subCategory || ''
    };

    const newMaterial: Material = {
      ...completeMaterialData,
      id: `mat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.materials.push(newMaterial);
    this.saveToLocalStorage();
    
    this.logAction({
      action: 'CREATE',
      module: 'MATERIAL',
      recordId: newMaterial.id,
      details: `Yeni malzeme eklendi: ${materialData.name} - Barkod: ${materialData.barcode}`,
      performedBy: this.getCurrentUser().name
    });
    
    return newMaterial;
  }

  // Excel/CSV Import için toplu malzeme kaydetme
  saveMultipleMaterials(materialsData: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>[]): Material[] {
    const savedMaterials: Material[] = [];
    
    materialsData.forEach(materialData => {
      try {
        // Benzersiz barkod kontrolü
        let barcode = materialData.barcode;
        if (barcode) {
          const existingMaterial = this.materials.find(m => 
            m.barcode === barcode ||
            (materialData.sn && m.sn === materialData.sn) ||
            (materialData.gtin && m.gtin === materialData.gtin)
          );
          
          if (existingMaterial) {
            console.warn(`Barkod zaten mevcut: ${barcode} - ${materialData.name}`);
            barcode = `IMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          }
        } else {
          barcode = `AUTO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        const newMaterial: Material = {
          ...materialData,
          barcode,
          gtin: materialData.gtin || '',
          sn: materialData.sn || '',
          udiCode: materialData.udiCode || '',
          allBarcode: materialData.allBarcode || '',
          intuitiveCode: materialData.intuitiveCode || '',
          serialNumber: materialData.serialNumber || materialData.sn || '',
          expirationDate: materialData.expirationDate || '',
          serialNoStatus: materialData.serialNoStatus || '',
          materialDescription: materialData.materialDescription || materialData.name,
          status: materialData.status || 'normal' as MaterialStatus,
          isActive: materialData.isActive !== undefined ? materialData.isActive : true,
          minStockLevel: (materialData as any).minStockLevel || materialData.minStock || 0,
          subCategory: materialData.subCategory || '',
          id: `mat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        this.materials.push(newMaterial);
        savedMaterials.push(newMaterial);
      } catch (error) {
        console.error('Malzeme kaydedilemedi:', materialData, error);
      }
    });

    this.saveToLocalStorage();
    
    this.logAction({
      action: 'BULK_IMPORT',
      module: 'MATERIAL',
      recordId: 'BULK_IMPORT',
      details: `${savedMaterials.length} malzeme toplu olarak içe aktarıldı`,
      performedBy: this.getCurrentUser().name
    });

    return savedMaterials;
  }

  updateMaterial(id: string, updates: Partial<Material>): Material | null {
    const index = this.materials.findIndex(m => m.id === id);
    if (index !== -1) {
      const oldMaterial = this.materials[index];
      
      // SN değişikliği kontrolü
      if (updates.sn && updates.sn !== oldMaterial.sn) {
        const existingMaterialWithSN = this.materials.find(m => m.sn === updates.sn && m.id !== id);
        if (existingMaterialWithSN) {
          throw new Error(`SN ${updates.sn} zaten başka bir malzemede kullanılıyor: ${existingMaterialWithSN.name}`);
        }
      }
      
      this.materials[index] = {
        ...oldMaterial,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'UPDATE',
        module: 'MATERIAL',
        recordId: id,
        details: `Malzeme güncellendi: ${oldMaterial.name}`,
        performedBy: this.getCurrentUser().name
      });
      
      return this.materials[index];
    }
    return null;
  }

  // Statü değiştirme için batch update
  updateMaterialsStatus(materialIds: string[], newStatus: MaterialStatus): number {
    let updatedCount = 0;
    
    materialIds.forEach(materialId => {
      const index = this.materials.findIndex(m => m.id === materialId);
      if (index !== -1) {
        this.materials[index] = {
          ...this.materials[index],
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
        updatedCount++;
      }
    });
    
    if (updatedCount > 0) {
      this.saveToLocalStorage();
      this.logAction({
        action: 'BATCH_STATUS_UPDATE',
        module: 'MATERIAL',
        recordId: 'BATCH_STATUS',
        details: `${updatedCount} malzemenin statüsü ${newStatus} olarak güncellendi`,
        performedBy: this.getCurrentUser().name
      });
    }
    
    return updatedCount;
  }

  deleteMaterial(id: string): boolean {
    const index = this.materials.findIndex(m => m.id === id);
    if (index !== -1) {
      const materialName = this.materials[index].name;
      this.materials.splice(index, 1);
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'DELETE',
        module: 'MATERIAL',
        recordId: id,
        details: `Malzeme silindi: ${materialName}`,
        performedBy: this.getCurrentUser().name
      });
      
      return true;
    }
    return false;
  }

  // === HASTA YÖNETİMİ ===
  getPatients(): Patient[] {
    return [...this.patients];
  }

  getPatientById(id: string): Patient | undefined {
    return this.patients.find(p => p.id === id);
  }

  getPatientByTcNo(tcNo: string): Patient | undefined {
    return this.patients.find(p => p.tcNo === tcNo);
  }

  savePatient(patientData: Omit<Patient, 'id' | 'createdAt'>): Patient {
    const newPatient: Patient = {
      ...patientData,
      id: `pat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    this.patients.push(newPatient);
    this.saveToLocalStorage();
    
    this.logAction({
      action: 'CREATE',
      module: 'PATIENT',
      recordId: newPatient.id,
      details: `Yeni hasta eklendi: ${patientData.name} ${patientData.surname}`,
      performedBy: this.getCurrentUser().name
    });
    
    return newPatient;
  }

  updatePatient(id: string, updates: Partial<Patient>): Patient | null {
    const index = this.patients.findIndex(p => p.id === id);
    if (index !== -1) {
      const oldPatient = this.patients[index];
      this.patients[index] = { ...oldPatient, ...updates };
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'UPDATE',
        module: 'PATIENT',
        recordId: id,
        details: `Hasta güncellendi: ${oldPatient.name} ${oldPatient.surname}`,
        performedBy: this.getCurrentUser().name
      });
      
      return this.patients[index];
    }
    return null;
  }

  deletePatient(id: string): boolean {
    const index = this.patients.findIndex(p => p.id === id);
    if (index !== -1) {
      const patientName = `${this.patients[index].name} ${this.patients[index].surname}`;
      this.patients.splice(index, 1);
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'DELETE',
        module: 'PATIENT',
        recordId: id,
        details: `Hasta silindi: ${patientName}`,
        performedBy: this.getCurrentUser().name
      });
      
      return true;
    }
    return false;
  }

  // === HASTA MALZEME KULLANIMI ===
  getPatientMaterialUsage(): PatientMaterialUsage[] {
    return [...this.patientMaterialUsage];
  }

  getPatientMaterialUsageById(id: string): PatientMaterialUsage | undefined {
    return this.patientMaterialUsage.find(u => u.id === id);
  }

  getPatientMaterialUsageByPatientId(patientId: string): PatientMaterialUsage[] {
    return this.patientMaterialUsage.filter(u => u.patientId === patientId);
  }

  getPatientMaterialUsageByMaterialId(materialId: string): PatientMaterialUsage[] {
    return this.patientMaterialUsage.filter(u => u.materialId === materialId);
  }

  savePatientMaterialUsage(usageData: Omit<PatientMaterialUsage, 'id'>): PatientMaterialUsage {
    const material = this.materials.find(m => m.id === usageData.materialId);
    if (!material) {
      throw new Error('Malzeme bulunamadı');
    }

    if (material.currentStock < usageData.quantity) {
      throw new Error('Yetersiz stok');
    }

    const totalCost = material.unitPrice * usageData.quantity;

    const newUsage: PatientMaterialUsage = {
      ...usageData,
      id: `usage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      unitPrice: material.unitPrice,
      totalCost: totalCost,
      usageDate: usageData.usageDate || new Date().toISOString()
    };

    this.patientMaterialUsage.push(newUsage);
    
    // Stok güncellemesi yap
    this.updateMaterial(material.id, {
      currentStock: material.currentStock - usageData.quantity
    });

    this.saveToLocalStorage();
    
    const patient = this.patients.find(p => p.id === usageData.patientId);
    
    this.logAction({
      action: 'CREATE',
      module: 'USAGE',
      recordId: newUsage.id,
      details: `Hasta malzeme kullanımı: ${patient?.name} ${patient?.surname} - ${material.name} (${usageData.quantity} ${material.unit})`,
      performedBy: this.getCurrentUser().name
    });

    return newUsage;
  }

  savePatientMaterialUsageWithBarcode(usageData: Omit<PatientMaterialUsage, 'id' | 'materialId'> & { barcode: string }): PatientMaterialUsage {
    const material = this.materials.find(m => 
      m.barcode === usageData.barcode ||
      m.gtin === usageData.barcode ||
      m.sn === usageData.barcode ||
      m.udiCode === usageData.barcode ||
      m.allBarcode === usageData.barcode ||
      (m.allBarcode && m.allBarcode.split(',').map(b => b.trim()).includes(usageData.barcode))
    );
    
    if (!material) {
      throw new Error('Barkod ile eşleşen malzeme bulunamadı');
    }

    if (material.currentStock < usageData.quantity) {
      throw new Error('Yetersiz stok');
    }

    const totalCost = material.unitPrice * usageData.quantity;

    const newUsage: PatientMaterialUsage = {
      ...usageData,
      id: `usage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      materialId: material.id,
      unitPrice: material.unitPrice,
      totalCost: totalCost,
      usageDate: usageData.usageDate || new Date().toISOString()
    };

    this.patientMaterialUsage.push(newUsage);
    
    // Stok güncellemesi
    this.updateMaterial(material.id, {
      currentStock: material.currentStock - usageData.quantity
    });

    this.saveToLocalStorage();
    
    const patient = this.patients.find(p => p.id === usageData.patientId);
    
    this.logAction({
      action: 'CREATE',
      module: 'USAGE',
      recordId: newUsage.id,
      details: `Barkod ile malzeme kullanımı: ${patient?.name} ${patient?.surname} - ${material.name} (${usageData.quantity} ${material.unit})`,
      performedBy: this.getCurrentUser().name
    });

    return newUsage;
  }

  updatePatientMaterialUsage(id: string, updates: Partial<PatientMaterialUsage>): PatientMaterialUsage | null {
    const index = this.patientMaterialUsage.findIndex(u => u.id === id);
    if (index !== -1) {
      const oldUsage = this.patientMaterialUsage[index];
      const oldQuantity = oldUsage.quantity;
      const newQuantity = updates.quantity || oldQuantity;
      
      this.patientMaterialUsage[index] = { 
        ...oldUsage, 
        ...updates 
      };

      // Miktar değiştiyse stok güncelle
      if (updates.quantity && updates.quantity !== oldQuantity) {
        const material = this.materials.find(m => m.id === oldUsage.materialId);
        if (material) {
          const quantityDiff = oldQuantity - newQuantity;
          this.updateMaterial(material.id, {
            currentStock: material.currentStock + quantityDiff
          });
        }
      }

      this.saveToLocalStorage();
      return this.patientMaterialUsage[index];
    }
    return null;
  }

  deletePatientMaterialUsage(id: string): boolean {
    const index = this.patientMaterialUsage.findIndex(u => u.id === id);
    if (index !== -1) {
      const usage = this.patientMaterialUsage[index];
      const material = this.materials.find(m => m.id === usage.materialId);
      
      // Stoku geri ekle
      if (material) {
        this.updateMaterial(material.id, {
          currentStock: material.currentStock + usage.quantity
        });
      }
      
      this.patientMaterialUsage.splice(index, 1);
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'DELETE',
        module: 'USAGE',
        recordId: id,
        details: `Malzeme kullanım kaydı silindi: ${material?.name} - ${usage.quantity} adet`,
        performedBy: this.getCurrentUser().name
      });
      
      return true;
    }
    return false;
  }

  // === FATURA YÖNETİMİ ===
  getInvoices(): Invoice[] {
    return [...this.invoices];
  }

  getInvoiceById(id: string): Invoice | undefined {
    return this.invoices.find(inv => inv.id === id);
  }

  getInvoiceByInvoiceNo(invoiceNo: string): Invoice | undefined {
    return this.invoices.find(inv => inv.invoiceNo === invoiceNo);
  }

  saveInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt'>): Invoice {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    this.invoices.push(newInvoice);
    
    // Stok güncellemesi yap
    invoiceData.items.forEach(item => {
      const material = this.materials.find(m => m.id === item.materialId);
      if (material) {
        this.updateMaterial(material.id, {
          currentStock: material.currentStock + item.quantity
        });
      }
    });

    this.saveToLocalStorage();
    
    this.logAction({
      action: 'CREATE',
      module: 'INVOICE',
      recordId: newInvoice.id,
      details: `Yeni fatura eklendi: ${invoiceData.invoiceNo} - ${invoiceData.supplierName} - Tutar: ₺${invoiceData.totalAmount.toFixed(2)}`,
      performedBy: this.getCurrentUser().name
    });

    return newInvoice;
  }

  addInvoiceItem(invoiceId: string, item: Omit<InvoiceItem, 'id'>): Invoice | null {
    const invoiceIndex = this.invoices.findIndex(inv => inv.id === invoiceId);
    if (invoiceIndex === -1) return null;

    const newItem: InvoiceItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    this.invoices[invoiceIndex].items.push(newItem);
    
    // Toplam tutarı güncelle
    this.invoices[invoiceIndex].totalAmount = this.invoices[invoiceIndex].items.reduce(
      (sum, item) => sum + item.totalPrice, 0
    );

    // Stok güncellemesi
    const material = this.materials.find(m => m.id === item.materialId);
    if (material) {
      this.updateMaterial(material.id, {
        currentStock: material.currentStock + item.quantity
      });
    }

    this.saveToLocalStorage();
    
    this.logAction({
      action: 'ADD_ITEM',
      module: 'INVOICE',
      recordId: invoiceId,
      details: `Faturaya yeni kalem eklendi: ${material?.name || 'Bilinmiyor'} - ${item.quantity} adet`,
      performedBy: this.getCurrentUser().name
    });
    
    return this.invoices[invoiceIndex];
  }

  updateInvoice(id: string, updates: Partial<Invoice>): Invoice | null {
    const index = this.invoices.findIndex(inv => inv.id === id);
    if (index !== -1) {
      const oldInvoice = this.invoices[index];
      this.invoices[index] = { ...oldInvoice, ...updates };
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'UPDATE',
        module: 'INVOICE',
        recordId: id,
        details: `Fatura güncellendi: ${oldInvoice.invoiceNo}`,
        performedBy: this.getCurrentUser().name
      });
      
      return this.invoices[index];
    }
    return null;
  }

  deleteInvoice(id: string): boolean {
    const index = this.invoices.findIndex(inv => inv.id === id);
    if (index !== -1) {
      const invoiceNo = this.invoices[index].invoiceNo;
      
      // İlgili PDF dosyasını da sil
      this.deleteInvoicePdf(id);
      
      this.invoices.splice(index, 1);
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'DELETE',
        module: 'INVOICE',
        recordId: id,
        details: `Fatura silindi: ${invoiceNo}`,
        performedBy: this.getCurrentUser().name
      });
      
      return true;
    }
    return false;
  }

  // === STOK SAYIM YÖNETİMİ ===
  getStockCounts(): StockCount[] {
    return [...this.stockCounts];
  }

  getStockCountById(id: string): StockCount | undefined {
    return this.stockCounts.find(c => c.id === id);
  }

  saveStockCount(countData: Omit<StockCount, 'id' | 'createdAt'>): StockCount {
    const material = this.materials.find(m => m.id === countData.materialId);
    if (!material) {
      throw new Error('Malzeme bulunamadı');
    }

    const totalValue = countData.countedQuantity * material.unitPrice;

    const newCount: StockCount = {
      ...countData,
      id: `count-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      totalValue: totalValue,
      status: countData.status || 'tamamlandı',
      countDate: countData.countDate || new Date().toISOString(),
      countedBy: countData.countedBy || 'Sistem'
    };
    
    this.stockCounts.push(newCount);
    
    // Session'ın totalProductsCounted değerini güncelle
    const sessionIndex = this.stockCountSessions.findIndex(s => s.id === countData.sessionId);
    if (sessionIndex !== -1) {
      const sessionCounts = this.stockCounts.filter(count => count.sessionId === countData.sessionId);
      this.stockCountSessions[sessionIndex].totalProductsCounted = sessionCounts.length;
    }

    this.saveToLocalStorage();
    
    this.logAction({
      action: 'CREATE',
      module: 'STOCK_COUNT',
      recordId: newCount.id,
      details: `Stok sayımı yapıldı: ${material.name} (${countData.countedQuantity} ${material.unit}) - Fatura: ${this.stockCountSessions.find(s => s.id === countData.sessionId)?.invoiceNo || 'N/A'}`,
      performedBy: this.getCurrentUser().name
    });

    return newCount;
  }

  // Hızlı sayım için batch stock count kaydetme
  saveMultipleStockCounts(countsData: Omit<StockCount, 'id' | 'createdAt'>[]): StockCount[] {
    const savedCounts: StockCount[] = [];
    
    countsData.forEach(countData => {
      try {
        const material = this.materials.find(m => m.id === countData.materialId);
        if (!material) {
          console.warn(`Malzeme bulunamadı: ${countData.materialId}`);
          return;
        }

        const totalValue = countData.countedQuantity * material.unitPrice;

        const newCount: StockCount = {
          ...countData,
          id: `count-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          totalValue: totalValue,
          status: 'tamamlandı',
          countDate: countData.countDate || new Date().toISOString(),
          countedBy: countData.countedBy || 'Sistem'
        };
        
        this.stockCounts.push(newCount);
        savedCounts.push(newCount);

        // Stok miktarını güncelle
        this.updateMaterial(material.id, {
          currentStock: material.currentStock + countData.countedQuantity,
          lastStockCountDate: new Date().toISOString(),
          lastStockCountBy: countData.countedBy,
          lastStockCountQuantity: countData.countedQuantity
        });
      } catch (error) {
        console.error('Sayım kaydedilemedi:', countData, error);
      }
    });

    // Session'ın totalProductsCounted değerini güncelle
    if (countsData.length > 0 && countsData[0].sessionId) {
      const sessionId = countsData[0].sessionId;
      const sessionCounts = this.stockCounts.filter(count => count.sessionId === sessionId);
      const sessionIndex = this.stockCountSessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex !== -1) {
        this.stockCountSessions[sessionIndex].totalProductsCounted = sessionCounts.length;
      }
    }

    this.saveToLocalStorage();
    
    this.logAction({
      action: 'BULK_STOCK_COUNT',
      module: 'STOCK_COUNT',
      recordId: 'BULK_COUNT',
      details: `${savedCounts.length} sayım kaydı toplu olarak eklendi`,
      performedBy: this.getCurrentUser().name
    });

    return savedCounts;
  }

  updateStockCount(id: string, updates: Partial<StockCount>): StockCount | null {
    const index = this.stockCounts.findIndex(c => c.id === id);
    if (index !== -1) {
      const oldCount = this.stockCounts[index];
      this.stockCounts[index] = { ...oldCount, ...updates };
      
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'UPDATE',
        module: 'STOCK_COUNT',
        recordId: id,
        details: `Stok sayımı güncellendi: ${oldCount.barcode}`,
        performedBy: this.getCurrentUser().name
      });
      
      return this.stockCounts[index];
    }
    return null;
  }

  deleteStockCount(id: string): boolean {
    const index = this.stockCounts.findIndex(c => c.id === id);
    if (index !== -1) {
      const count = this.stockCounts[index];
      this.stockCounts.splice(index, 1);
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'DELETE',
        module: 'STOCK_COUNT',
        recordId: id,
        details: `Stok sayımı silindi: ${count.barcode}`,
        performedBy: this.getCurrentUser().name
      });
      
      return true;
    }
    return false;
  }

  getStockCountSessions(): StockCountSession[] {
    return [...this.stockCountSessions];
  }

  getStockCountSessionById(id: string): StockCountSession | undefined {
    return this.stockCountSessions.find(s => s.id === id);
  }

  // Otomatik oturum numarası oluşturma (OSG-YYYY-MM-XXX formatında)
  generateSessionNo(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Aynı yıl ve ay için son numarayı bul
    const sessionsThisMonth = this.stockCountSessions.filter(session => {
      const sessionDate = new Date(session.createdAt);
      return sessionDate.getFullYear() === year && 
             (sessionDate.getMonth() + 1) === parseInt(month);
    });
    
    const nextNumber = (sessionsThisMonth.length + 1).toString().padStart(3, '0');
    return `OSG-${year}-${month}-${nextNumber}`;
  }

  saveStockCountSession(sessionData: Omit<StockCountSession, 'id' | 'createdAt' | 'totalProductsCounted' | 'sessionNo'> & { 
    invoiceNo: string;
    sessionStatus?: MaterialStatus;
  }): StockCountSession {
    const newSession: StockCountSession = {
      ...sessionData,
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionNo: this.generateSessionNo(),
      createdAt: new Date().toISOString(),
      totalProductsCounted: 0,
      countDate: sessionData.countDate || new Date().toISOString(),
      countedBy: sessionData.countedBy || 'Sistem',
      status: sessionData.status || 'devam-ediyor',
      sessionStatus: sessionData.sessionStatus || undefined,
      endDate: sessionData.endDate || sessionData.countDate || new Date().toISOString()
    };
    
    this.stockCountSessions.push(newSession);
    this.saveToLocalStorage();
    
    this.logAction({
      action: 'CREATE',
      module: 'STOCK_SESSION',
      recordId: newSession.id,
      details: `Yeni stok sayım oturumu: ${newSession.sessionNo} - Fatura: ${sessionData.invoiceNo} - Statü: ${sessionData.sessionStatus || 'Tüm'}`,
      performedBy: this.getCurrentUser().name
    });
    
    return newSession;
  }

  updateStockCountSession(id: string, updates: Partial<StockCountSession>): StockCountSession | null {
    const index = this.stockCountSessions.findIndex(s => s.id === id);
    if (index !== -1) {
      const oldSession = this.stockCountSessions[index];
      this.stockCountSessions[index] = { ...oldSession, ...updates };
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'UPDATE',
        module: 'STOCK_SESSION',
        recordId: id,
        details: `Sayım oturumu güncellendi: ${oldSession.sessionNo}`,
        performedBy: this.getCurrentUser().name
      });
      
      return this.stockCountSessions[index];
    }
    return null;
  }

  deleteStockCountSession(id: string): boolean {
    const index = this.stockCountSessions.findIndex(s => s.id === id);
    if (index !== -1) {
      const session = this.stockCountSessions[index];
      
      // Oturuma ait tüm sayımları da sil
      const sessionCounts = this.stockCounts.filter(count => count.sessionId === id);
      sessionCounts.forEach(count => {
        this.deleteStockCount(count.id);
      });
      
      // PDF dosyasını da sil
      this.deleteSessionPdf(id);
      
      this.stockCountSessions.splice(index, 1);
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'DELETE',
        module: 'STOCK_SESSION',
        recordId: id,
        details: `Sayım oturumu silindi: ${session.sessionNo} - ${sessionCounts.length} sayım kaydı silindi`,
        performedBy: this.getCurrentUser().name
      });
      
      return true;
    }
    return false;
  }

  getStockCountsByMaterial(materialId: string): StockCount[] {
    return this.stockCounts
      .filter(count => count.materialId === materialId)
      .sort((a, b) => new Date(b.countDate).getTime() - new Date(a.countDate).getTime());
  }

  getStockCountsBySession(sessionId: string): StockCount[] {
    return this.stockCounts.filter(count => count.sessionId === sessionId);
  }

  getStockCountsBySessionDetailed(sessionId: string): any[] {
    const session = this.stockCountSessions.find(s => s.id === sessionId);
    
    return this.stockCounts
      .filter(count => count.sessionId === sessionId)
      .map(count => {
        const material = this.materials.find(m => m.id === count.materialId);
        return {
          ...count,
          materialName: material?.name || 'Bilinmiyor',
          materialCategory: material?.category || '',
          materialSubCategory: material?.subCategory || '',
          materialUnit: material?.unit || '',
          materialBarcode: material?.barcode || '',
          materialGtin: material?.gtin || '',
          materialSn: material?.sn || '',
          materialUdiCode: material?.udiCode || '',
          materialStatus: material?.status || 'normal',
          materialSupplier: material?.supplier || '',
          invoiceNo: session?.invoiceNo || 'Belirtilmemiş',
          sessionNo: session?.sessionNo || 'Belirtilmemiş',
          sessionStatus: session?.sessionStatus || '',
          countedBy: count.countedBy || session?.countedBy || 'Bilinmiyor'
        };
      });
  }

  getSessionSummaries(): any[] {
    return this.stockCountSessions.map(session => {
      const sessionCounts = this.stockCounts.filter(count => count.sessionId === session.id);
      const totalValue = sessionCounts.reduce((sum, count) => sum + (count.totalValue || 0), 0);
      
      return {
        sessionId: session.id,
        sessionNo: session.sessionNo,
        invoiceNo: session.invoiceNo,
        countDate: session.countDate,
        countedBy: session.countedBy,
        status: session.status,
        sessionStatus: session.sessionStatus,
        totalProductsCounted: sessionCounts.length,
        totalValue: totalValue,
        pdfFile: this.hasSessionPdf(session.id) ? 'var' : 'yok',
        startDate: session.startDate,
        endDate: session.endDate,
        createdBy: session.createdBy
      };
    }).sort((a, b) => new Date(b.countDate).getTime() - new Date(a.countDate).getTime());
  }

  // === PDF YÖNETİMİ ===
  saveInvoicePdf(invoiceId: string, file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const pdfData = e.target?.result;
      if (pdfData) {
        localStorage.setItem(`invoice-pdf-${invoiceId}`, pdfData as string);
        
        this.logAction({
          action: 'UPLOAD',
          module: 'INVOICE',
          recordId: invoiceId,
          details: `Fatura PDF'i yüklendi: ${file.name}`,
          performedBy: this.getCurrentUser().name
        });
      }
    };
    reader.readAsDataURL(file);
  }

  saveSessionPdf(sessionId: string, file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const pdfData = e.target?.result;
      if (pdfData) {
        localStorage.setItem(`session-pdf-${sessionId}`, pdfData as string);
        
        this.logAction({
          action: 'UPLOAD',
          module: 'STOCK_SESSION',
          recordId: sessionId,
          details: `Sayım oturumu PDF'i yüklendi: ${file.name}`,
          performedBy: this.getCurrentUser().name
        });
      }
    };
    reader.readAsDataURL(file);
  }

  getInvoicePdfUrl(invoiceId: string): string | null {
    return localStorage.getItem(`invoice-pdf-${invoiceId}`);
  }

  getSessionPdfUrl(sessionId: string): string | null {
    return localStorage.getItem(`session-pdf-${sessionId}`);
  }

  deleteInvoicePdf(invoiceId: string): boolean {
    const pdfKey = `invoice-pdf-${invoiceId}`;
    if (localStorage.getItem(pdfKey)) {
      localStorage.removeItem(pdfKey);
      
      this.logAction({
        action: 'DELETE',
        module: 'INVOICE',
        recordId: invoiceId,
        details: 'Fatura PDF\'i silindi',
        performedBy: this.getCurrentUser().name
      });
      
      return true;
    }
    return false;
  }

  deleteSessionPdf(sessionId: string): boolean {
    const pdfKey = `session-pdf-${sessionId}`;
    if (localStorage.getItem(pdfKey)) {
      localStorage.removeItem(pdfKey);
      return true;
    }
    return false;
  }

  hasInvoicePdf(invoiceId: string): boolean {
    return localStorage.getItem(`invoice-pdf-${invoiceId}`) !== null;
  }

  hasSessionPdf(sessionId: string): boolean {
    return localStorage.getItem(`session-pdf-${sessionId}`) !== null;
  }

  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64 = base64String.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  getFileSizeFromBase64(base64String: string): number {
    return Math.floor((base64String.length * 3) / 4);
  }

  getCurrentUser(): User {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Kullanıcı verisi parse edilemedi:', error);
      }
    }
    
    // Varsayılan admin kullanıcı
    const adminUser = this.getUsers().find(user => user.role === 'admin');
    if (adminUser) {
      this.setCurrentUser(adminUser);
      return adminUser;
    }
    
    // Eğer admin yoksa ilk kullanıcıyı al
    const users = this.getUsers();
    if (users.length > 0) {
      this.setCurrentUser(users[0]);
      return users[0];
    }
    
    // Kullanıcı yoksa varsayılan oluştur
    const defaultUser: User = {
      id: 'guest-1',
      username: 'guest',
      email: 'guest@hospital.com',
      password: '',
      name: 'Misafir Kullanıcı',
      department: 'Ziyaretçi',
      role: 'viewer',
      permissions: {
        createSession: false,
        approveCounts: false,
        manageMaterials: false,
        managePatients: false,
        manageInvoices: false,
        bulkStatusChange: false,
        quickCount: false,
        exportData: false,
        manageUsers: false,
        manageSettings: false,
        viewDashboard: true,
        importExcel: false,
        manageDailyPlan: false
      } as any,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.setCurrentUser(defaultUser);
    return defaultUser;
  }

  setCurrentUser(user: User) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Oturum kaydı oluştur
    this.createUserSession(
      user,
      '127.0.0.1', // Gerçek IP için backend gerekecek
      navigator.userAgent
    );
  }

  logout() {
    const currentUser = this.getCurrentUser();
    
    // Aktif oturumu sonlandır
    const activeSession = this.userSessions.find(s => 
      s.userId === currentUser.id && s.isActive
    );
    
    if (activeSession) {
      this.terminateUserSession(activeSession.id, 'Logout');
    }
    
    localStorage.removeItem('currentUser');
    
    this.logAction({
      action: 'LOGOUT',
      module: 'AUTH',
      recordId: currentUser.id,
      details: `Kullanıcı çıkış yaptı: ${currentUser.name}`,
      performedBy: currentUser.name
    });
  }

  // === YARDIMCI METODLAR ===
  parseAllBarcode(allBarcode: string): { barcode: string; gtin: string; sn: string } {
    const parsed = {
      barcode: '',
      gtin: '',
      sn: ''
    };

    try {
      if (allBarcode.startsWith('01') && allBarcode.length >= 30) {
        // GTIN kısmını al (14 haneli)
        const gtinStart = 2;
        const gtinEnd = 16;
        parsed.gtin = allBarcode.substring(gtinStart, gtinEnd);
        
        // Barkod kısmı - GTIN'in ilk 2 sıfırını çıkar
        parsed.barcode = parsed.gtin.substring(2);
        
        // SN kısmını ara (21'den sonra başlar)
        const snMarker = allBarcode.indexOf('21');
        if (snMarker !== -1) {
          const snStart = snMarker + 2;
          let snEnd = allBarcode.length;
          for (let i = snStart + 2; i < allBarcode.length - 1; i += 2) {
            if (allBarcode.substring(i, i + 2) === '10' || 
                allBarcode.substring(i, i + 2) === '17' || 
                allBarcode.substring(i, i + 2) === '91') {
              snEnd = i;
              break;
            }
          }
          parsed.sn = allBarcode.substring(snStart, snEnd);
        }
      } else {
        // Standart barkod
        parsed.barcode = allBarcode;
      }
    } catch (error) {
      console.error('All Barkod parse error:', error);
      parsed.barcode = allBarcode;
    }

    return parsed;
  }

  // === VERİ YEDEKLEME VE GERİ YÜKLEME ===
  exportData(): string {
    const data = {
      materials: this.materials,
      categories: this.categories,
      subCategories: this.subCategories,
      suppliers: this.suppliers,
      patients: this.patients,
      patientMaterialUsage: this.patientMaterialUsage,
      invoices: this.invoices,
      stockCounts: this.stockCounts,
      stockCountSessions: this.stockCountSessions,
      logs: this.logs,
      // YENİ: Günlük planlama verileri
      dailyPlans: this.dailyPlans,
      doctors: this.doctors,
      hospitalUnits: this.hospitalUnits,
      userSessions: this.userSessions,
      activityLogs: this.activityLogs,
      permissionGroups: this.permissionGroups,
      exportDate: new Date().toISOString(),
      version: '3.0.0',
      systemName: 'Osmangazi Göz Stok Takip Sistemi'
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      // Veri doğrulama
      if (!data.materials || !Array.isArray(data.materials)) {
        throw new Error('Geçersiz veri formatı');
      }
      
      // Mevcut verileri temizle
      this.materials = data.materials || [];
      this.categories = data.categories || [];
      this.subCategories = data.subCategories || [];
      this.suppliers = data.suppliers || [];
      this.patients = data.patients || [];
      this.patientMaterialUsage = data.patientMaterialUsage || [];
      this.invoices = data.invoices || [];
      this.stockCounts = data.stockCounts || [];
      this.stockCountSessions = data.stockCountSessions || [];
      this.logs = data.logs || [];
      
      // YENİ: Günlük planlama verileri
      this.dailyPlans = data.dailyPlans || [];
      this.doctors = data.doctors || [];
      this.hospitalUnits = data.hospitalUnits || [];
      this.userSessions = data.userSessions || [];
      this.activityLogs = data.activityLogs || [];
      this.permissionGroups = data.permissionGroups || [];
      
      this.saveToLocalStorage();
      
      this.logAction({
        action: 'IMPORT',
        module: 'SYSTEM',
        recordId: 'SYSTEM',
        details: `Veri içe aktarıldı: ${data.materials?.length || 0} malzeme, ${data.patients?.length || 0} hasta`,
        performedBy: this.getCurrentUser().name
      });
      
      return true;
    } catch (error: any) {
      console.error('Veri içe aktarma hatası:', error);
      this.logAction({
        action: 'IMPORT_ERROR',
        module: 'SYSTEM',
        recordId: 'SYSTEM',
        details: `Veri içe aktarma başarısız: ${error.message}`,
        performedBy: this.getCurrentUser().name
      });
      return false;
    }
  }

  // === EK YARDIMCI METODLAR ===
  getExpiredMaterials(): Material[] {
    const today = new Date();
    return this.materials.filter(material => {
      if (!material.expirationDate) return false;
      const expDate = new Date(material.expirationDate);
      return expDate < today;
    });
  }

  getExpiringSoonMaterials(days: number = 30): Material[] {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    return this.materials.filter(material => {
      if (!material.expirationDate) return false;
      const expDate = new Date(material.expirationDate);
      return expDate >= today && expDate <= futureDate;
    });
  }

  searchMaterials(query: string): Material[] {
    const lowerQuery = query.toLowerCase();
    return this.materials.filter(material =>
      material.name.toLowerCase().includes(lowerQuery) ||
      material.barcode.toLowerCase().includes(lowerQuery) ||
      material.gtin?.toLowerCase().includes(lowerQuery) ||
      material.sn?.toLowerCase().includes(lowerQuery) ||
      material.category.toLowerCase().includes(lowerQuery) ||
      material.supplier?.toLowerCase().includes(lowerQuery)
    );
  }

  getMaterialStatistics() {
    const totalValue = this.materials.reduce((sum, m) => sum + (m.currentStock * m.unitPrice), 0);
    const averageStock = this.materials.length > 0 
      ? this.materials.reduce((sum, m) => sum + m.currentStock, 0) / this.materials.length 
      : 0;
    
    const categories = new Set(this.materials.map(m => m.category));
    const suppliers = new Set(this.materials.map(m => m.supplier).filter(Boolean));
    
    return {
      totalValue,
      averageStock,
      categoryCount: categories.size,
      supplierCount: suppliers.size,
      activeMaterials: this.materials.filter(m => m.isActive).length,
      inactiveMaterials: this.materials.filter(m => !m.isActive).length
    };
  }

  updateMultipleMaterials(materialIds: string[], updates: Partial<Material>): number {
    let updatedCount = 0;
    materialIds.forEach(id => {
      const result = this.updateMaterial(id, updates);
      if (result) updatedCount++;
    });
    
    if (updatedCount > 0) {
      this.logAction({
        action: 'BATCH_UPDATE',
        module: 'MATERIAL',
        recordId: 'BATCH',
        details: `${updatedCount} malzeme toplu güncellendi`,
        performedBy: this.getCurrentUser().name
      });
    }
    
    return updatedCount;
  }

  deleteMultipleMaterials(materialIds: string[]): number {
    let deletedCount = 0;
    materialIds.forEach(id => {
      const result = this.deleteMaterial(id);
      if (result) deletedCount++;
    });
    
    if (deletedCount > 0) {
      this.logAction({
        action: 'BATCH_DELETE',
        module: 'MATERIAL',
        recordId: 'BATCH',
        details: `${deletedCount} malzeme toplu silindi`,
        performedBy: this.getCurrentUser().name
      });
    }
    
    return deletedCount;
  }

  validateMaterialData(materialData: Partial<Material>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (materialData.name && materialData.name.trim().length === 0) {
      errors.push('Malzeme adı boş olamaz');
    }

    if (materialData.currentStock !== undefined && materialData.currentStock < 0) {
      errors.push('Stok miktarı negatif olamaz');
    }

    if (materialData.unitPrice !== undefined && materialData.unitPrice < 0) {
      errors.push('Birim fiyat negatif olamaz');
    }

    if (materialData.minStock !== undefined && materialData.minStock < 0) {
      errors.push('Kritik stok negatif olamaz');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validatePatientData(patientData: Partial<Patient>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (patientData.name && patientData.name.trim().length === 0) {
      errors.push('Hasta adı boş olamaz');
    }

    if (patientData.surname && patientData.surname.trim().length === 0) {
      errors.push('Hasta soyadı boş olamaz');
    }

    if (patientData.tcNo && patientData.tcNo.length !== 11) {
      errors.push('TC Kimlik No 11 haneli olmalıdır');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // === RAPORLAMA VE ANALİZ ===
  getMaterialUsageAnalysis(materialId?: string, year: number = new Date().getFullYear()): MaterialUsageAnalysis {
    let materialUsages = this.patientMaterialUsage.filter(u => 
      new Date(u.usageDate).getFullYear() === year
    );

    if (materialId) {
      materialUsages = materialUsages.filter(u => u.materialId === materialId);
    }

    const material = materialId ? this.materials.find(m => m.id === materialId) : undefined;

    // Aylık kullanım analizi
    const monthlyUsage = Array.from({ length: 12 }, (_, i) => {
      const monthUsages = materialUsages.filter(u => new Date(u.usageDate).getMonth() === i);
      return {
        totalUsage: monthUsages.reduce((sum, u) => sum + u.quantity, 0),
        totalCost: monthUsages.reduce((sum, u) => sum + u.totalCost, 0),
        usageCount: monthUsages.length
      };
    });

    // En çok kullanılan malzemeler
    const materialUsageMap = new Map<string, { name: string; quantity: number; cost: number }>();
    materialUsages.forEach(usage => {
      const material = this.materials.find(m => m.id === usage.materialId);
      if (material) {
        const existing = materialUsageMap.get(usage.materialId) || { 
          name: material.name, 
          quantity: 0, 
          cost: 0 
        };
        materialUsageMap.set(usage.materialId, {
          name: material.name,
          quantity: existing.quantity + usage.quantity,
          cost: existing.cost + usage.totalCost,
        });
      }
    });

    const mostUsedMaterials = Array.from(materialUsageMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const maxUsageMonth = monthlyUsage.reduce((max, usage, index) => 
      usage.totalUsage > monthlyUsage[max].totalUsage ? index : max, 0
    );

    const seasons = ['Kış', 'İlkbahar', 'Yaz', 'Sonbahar'];
    const season = seasons[Math.floor(maxUsageMonth / 3)];

    // Trend analizi
    const usageTrend = monthlyUsage.map(usage => usage.totalUsage);
    const trend = this.analyzeTrend(usageTrend);

    return {
      materialId: materialId || '',
      materialName: material?.name || 'Tüm Malzemeler',
      seasonalPattern: {
        season,
        trend: trend
      },
      usageTrend: monthlyUsage.map((usage, index) => ({
        period: `${index + 1}. Ay`,
        totalUsage: usage.totalUsage,
        totalCost: usage.totalCost,
        usageCount: usage.usageCount
      })),
      usageData: {
        daily: [],
        weekly: [],
        monthly: monthlyUsage,
        yearly: []
      },
      totalUsage: materialUsages.reduce((sum, u) => sum + u.quantity, 0),
      totalCost: materialUsages.reduce((sum, u) => sum + u.totalCost, 0),
      averageUsage: materialUsages.length > 0 ? 
        materialUsages.reduce((sum, u) => sum + u.quantity, 0) / materialUsages.length : 0,
      mostUsedMaterials: mostUsedMaterials
    } as any;
  }

  private analyzeTrend(data: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (data.length < 2) return 'stable';
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    if (avgSecond > avgFirst * 1.1) return 'increasing';
    if (avgSecond < avgFirst * 0.9) return 'decreasing';
    return 'stable';
  }

  getStockValueAnalysis(period: 'daily' | 'weekly' | 'monthly' | 'yearly', year: number = new Date().getFullYear()): StockValueAnalysis {
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthStart = new Date(year, i, 1);
      const monthEnd = new Date(year, i + 1, 0);
      
      const monthMaterials = this.materials.filter(m => {
        const updateDate = new Date(m.updatedAt);
        return updateDate >= monthStart && updateDate <= monthEnd;
      });

      const totalValue = monthMaterials.reduce((sum, m) => sum + (m.currentStock * m.unitPrice), 0);
      
      const allMaterialsValue = this.materials.reduce((sum, m) => sum + (m.currentStock * m.unitPrice), 0);
      const criticalCount = this.materials.filter(m => m.currentStock <= m.minStock).length;

      return {
        date: `${i + 1}/${year}`,
        totalValue: totalValue > 0 ? totalValue : allMaterialsValue,
        stockCount: this.materials.length,
        criticalStockCount: criticalCount,
        month: i + 1,
        year: year
      };
    });

    return {
      period,
      data: monthlyData,
      monthlyTrend: monthlyData.map(item => ({
        period: item.date,
        value: item.totalValue,
        stockCount: item.stockCount,
        criticalStockCount: item.criticalStockCount
      }))
    };
  }

  getYearlySummary(year: number = new Date().getFullYear()): YearlySummary {
    const yearlyUsages = this.patientMaterialUsage.filter(u => 
      new Date(u.usageDate).getFullYear() === year
    );
    const yearlyInvoices = this.invoices.filter(inv => 
      new Date(inv.invoiceDate).getFullYear() === year
    );
    const yearlySessions = this.stockCountSessions.filter(session => 
      new Date(session.countDate).getFullYear() === year
    );

    // Aylık veriler
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthUsages = yearlyUsages.filter(u => new Date(u.usageDate).getMonth() === i);
      const monthInvoices = yearlyInvoices.filter(inv => new Date(inv.invoiceDate).getMonth() === i);
      
      return {
        month: i + 1,
        usageCost: monthUsages.reduce((sum, u) => sum + u.totalCost, 0),
        invoiceAmount: monthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        usageCount: monthUsages.length,
        invoiceCount: monthInvoices.length
      };
    });

    return {
      year,
      totalMaterials: this.materials.length,
      totalPatients: this.patients.length,
      totalStockValue: this.materials.reduce((sum, m) => sum + (m.currentStock * m.unitPrice), 0),
      criticalStockCount: this.materials.filter(m => m.currentStock <= m.minStock).length,
      totalUsageCost: yearlyUsages.reduce((sum, u) => sum + u.totalCost, 0),
      totalInvoiceAmount: yearlyInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      totalSessions: yearlySessions.length,
      monthlyData,
      topUsedMaterials: this.getTopUsedMaterialsByYear(year),
      topSuppliers: this.getTopSuppliersByYear(year)
    } as YearlySummary;
  }

  getTopUsedMaterialsByYear(year: number): Array<{name: string, quantity: number, cost: number}> {
    const yearlyUsages = this.patientMaterialUsage.filter(u => 
      new Date(u.usageDate).getFullYear() === year
    );

    const materialUsageMap = new Map<string, { name: string; quantity: number; cost: number }>();
    yearlyUsages.forEach(usage => {
      const material = this.materials.find(m => m.id === usage.materialId);
      if (material) {
        const existing = materialUsageMap.get(usage.materialId) || { 
          name: material.name, 
          quantity: 0, 
          cost: 0 
        };
        materialUsageMap.set(usage.materialId, {
          name: material.name,
          quantity: existing.quantity + usage.quantity,
          cost: existing.cost + usage.totalCost,
        });
      }
    });

    return Array.from(materialUsageMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }

  getTopSuppliersByYear(year: number): Array<{name: string, invoiceCount: number, totalAmount: number}> {
    const yearlyInvoices = this.invoices.filter(inv => 
      new Date(inv.invoiceDate).getFullYear() === year
    );

    const supplierMap = new Map<string, { name: string; invoiceCount: number; totalAmount: number }>();
    yearlyInvoices.forEach(invoice => {
      const existing = supplierMap.get(invoice.supplierName) || { 
        name: invoice.supplierName, 
        invoiceCount: 0, 
        totalAmount: 0 
      };
      supplierMap.set(invoice.supplierName, {
        name: invoice.supplierName,
        invoiceCount: existing.invoiceCount + 1,
        totalAmount: existing.totalAmount + invoice.totalAmount,
      });
    });

    return Array.from(supplierMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);
  }

  // === SİSTEM TEMİZLEME ===
  clearAllData() {
    this.materials = [];
    this.categories = [];
    this.subCategories = [];
    this.suppliers = [];
    this.patients = [];
    this.patientMaterialUsage = [];
    this.invoices = [];
    this.stockCounts = [];
    this.stockCountSessions = [];
    this.logs = [];
    // YENİ: Günlük planlama verileri
    this.dailyPlans = [];
    this.doctors = [];
    this.hospitalUnits = [];
    this.userSessions = [];
    this.activityLogs = [];
    this.permissionGroups = [];
    
    localStorage.clear();
    this.initializeDefaultData();
  }
}

export const dataService = new DataService();