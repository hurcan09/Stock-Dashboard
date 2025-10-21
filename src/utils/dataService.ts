import { 
  Material, Category, Supplier, Patient, PatientMaterialUsage, 
  Invoice, StockCount, StockCountSession, SystemLog, 
  MaterialUsageAnalysis, StockValueAnalysis, YearlySummary, DashboardStats 
} from '../types';

class DataService {
  private materials: Material[] = [];
  private categories: Category[] = [];
  private suppliers: Supplier[] = [];
  private patients: Patient[] = [];
  private patientMaterialUsage: PatientMaterialUsage[] = [];
  private invoices: Invoice[] = [];
  private stockCounts: StockCount[] = [];
  private stockCountSessions: StockCountSession[] = [];
  private logs: SystemLog[] = [];

  constructor() {
    this.initializeDefaultData();
    this.loadFromLocalStorage();
  }

  // Varsayılan verileri oluştur
  private initializeDefaultData() {
    if (this.categories.length === 0) {
      this.categories = [
        { id: 'cat-1', name: 'İlaç', createdAt: new Date().toISOString() },
        { id: 'cat-2', name: 'Tıbbi Malzeme', createdAt: new Date().toISOString() },
        { id: 'cat-3', name: 'Cerrahi Malzeme', createdAt: new Date().toISOString() },
        { id: 'cat-4', name: 'Koruyucu Ekipman', createdAt: new Date().toISOString() },
        { id: 'cat-5', name: 'Lens', createdAt: new Date().toISOString() },
        { id: 'cat-6', name: 'Diğer', createdAt: new Date().toISOString() }
      ];
    }

    if (this.suppliers.length === 0) {
      this.suppliers = [
        { id: 'sup-1', name: 'ABC İlaç', createdAt: new Date().toISOString() },
        { id: 'sup-2', name: 'Sağlık Ürünleri A.Ş.', createdAt: new Date().toISOString() },
        { id: 'sup-3', name: 'Medikal Tedarik', createdAt: new Date().toISOString() },
        { id: 'sup-4', name: 'Eczane', createdAt: new Date().toISOString() }
      ];
    }

    // Örnek malzeme verileri ekleyelim
    if (this.materials.length === 0) {
      this.materials = [
        {
          id: 'mat-1',
          name: 'Parol 500 mg',
          barcode: '8691234567890',
          category: 'İlaç',
          currentStock: 100,
          minStock: 20,
          unit: 'kutu',
          unitPrice: 25.50,
          supplier: 'ABC İlaç',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'mat-2',
          name: 'Cerrahi Maske',
          barcode: '8691234567891',
          category: 'Koruyucu Ekipman',
          currentStock: 500,
          minStock: 100,
          unit: 'adet',
          unitPrice: 2.50,
          supplier: 'Sağlık Ürünleri A.Ş.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
  }

  // Kategori Yönetimi
  getCategories(): Category[] {
    return this.categories;
  }

  addCategory(name: string): Category {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      createdAt: new Date().toISOString()
    };
    this.categories.push(newCategory);
    this.saveToLocalStorage();
    this.logAction({
      action: 'CREATE',
      module: 'CATEGORY',
      recordId: newCategory.id,
      details: `Yeni kategori eklendi: ${name}`,
      performedBy: 'system'
    });
    return newCategory;
  }

  deleteCategory(id: string): boolean {
    const index = this.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      const categoryName = this.categories[index].name;
      this.categories.splice(index, 1);
      this.saveToLocalStorage();
      this.logAction({
        action: 'DELETE',
        module: 'CATEGORY',
        recordId: id,
        details: `Kategori silindi: ${categoryName}`,
        performedBy: 'system'
      });
      return true;
    }
    return false;
  }

  // Tedarikçi Yönetimi
  getSuppliers(): Supplier[] {
    return this.suppliers;
  }

  addSupplier(supplierData: Omit<Supplier, 'id' | 'createdAt'>): Supplier {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.suppliers.push(newSupplier);
    this.saveToLocalStorage();
    this.logAction({
      action: 'CREATE',
      module: 'SUPPLIER',
      recordId: newSupplier.id,
      details: `Yeni tedarikçi eklendi: ${supplierData.name}`,
      performedBy: 'system'
    });
    return newSupplier;
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
        performedBy: 'system'
      });
      return true;
    }
    return false;
  }

  // Malzeme Yönetimi
  getMaterials(): Material[] {
    return this.materials;
  }

  getMaterialById(id: string): Material | undefined {
    return this.materials.find(m => m.id === id);
  }

  getMaterialByBarcode(barcode: string): Material | undefined {
    return this.materials.find(m => m.barcode === barcode);
  }

  saveMaterial(materialData: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Material {
    const newMaterial: Material = {
      ...materialData,
      id: `mat-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.materials.push(newMaterial);
    this.saveToLocalStorage();
    this.logAction({
      action: 'CREATE',
      module: 'MATERIAL',
      recordId: newMaterial.id,
      details: `Yeni malzeme eklendi: ${materialData.name}`,
      performedBy: 'system'
    });
    return newMaterial;
  }

  updateMaterial(id: string, updates: Partial<Material>): Material | null {
    const index = this.materials.findIndex(m => m.id === id);
    if (index !== -1) {
      const oldMaterial = this.materials[index];
      this.materials[index] = {
        ...this.materials[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveToLocalStorage();
      this.logAction({
        action: 'UPDATE',
        module: 'MATERIAL',
        recordId: id,
        details: `Malzeme güncellendi: ${oldMaterial.name}`,
        performedBy: 'system'
      });
      return this.materials[index];
    }
    return null;
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
        performedBy: 'system'
      });
      return true;
    }
    return false;
  }

  // Hasta Yönetimi
  getPatients(): Patient[] {
    return this.patients;
  }

  getPatientById(id: string): Patient | undefined {
    return this.patients.find(p => p.id === id);
  }

  savePatient(patientData: Omit<Patient, 'id' | 'createdAt'>): Patient {
    const newPatient: Patient = {
      ...patientData,
      id: `pat-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.patients.push(newPatient);
    this.saveToLocalStorage();
    this.logAction({
      action: 'CREATE',
      module: 'PATIENT',
      recordId: newPatient.id,
      details: `Yeni hasta eklendi: ${patientData.name} ${patientData.surname}`,
      performedBy: 'system'
    });
    return newPatient;
  }

  updatePatient(id: string, updates: Partial<Patient>): Patient | null {
    const index = this.patients.findIndex(p => p.id === id);
    if (index !== -1) {
      const oldPatient = this.patients[index];
      this.patients[index] = { ...this.patients[index], ...updates };
      this.saveToLocalStorage();
      this.logAction({
        action: 'UPDATE',
        module: 'PATIENT',
        recordId: id,
        details: `Hasta güncellendi: ${oldPatient.name} ${oldPatient.surname}`,
        performedBy: 'system'
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
        performedBy: 'system'
      });
      return true;
    }
    return false;
  }

  // Hasta Malzeme Kullanımı
  getPatientMaterialUsage(): PatientMaterialUsage[] {
    return this.patientMaterialUsage;
  }

  getPatientMaterialUsageByPatientId(patientId: string): PatientMaterialUsage[] {
    return this.patientMaterialUsage.filter(u => u.patientId === patientId);
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
      id: `usage-${Date.now()}`,
      unitPrice: material.unitPrice,
      totalCost: totalCost
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
      performedBy: 'system'
    });

    return newUsage;
  }

  // Hasta malzeme kullanımı silme metodu
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
        performedBy: 'system'
      });
      
      return true;
    }
    return false;
  }

  // Barkod ile malzeme kullanımı
  savePatientMaterialUsageWithBarcode(usageData: Omit<PatientMaterialUsage, 'id' | 'materialId'> & { barcode: string }): PatientMaterialUsage {
    const material = this.materials.find(m => m.barcode === usageData.barcode);
    if (!material) {
      throw new Error('Barkod ile eşleşen malzeme bulunamadı');
    }

    if (material.currentStock < usageData.quantity) {
      throw new Error('Yetersiz stok');
    }

    const totalCost = material.unitPrice * usageData.quantity;

    const newUsage: PatientMaterialUsage = {
      ...usageData,
      id: `usage-${Date.now()}`,
      materialId: material.id,
      unitPrice: material.unitPrice,
      totalCost: totalCost
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
      performedBy: 'system'
    });

    return newUsage;
  }

  // Fatura Yönetimi
  getInvoices(): Invoice[] {
    return this.invoices;
  }

  getInvoiceById(id: string): Invoice | undefined {
    return this.invoices.find(inv => inv.id === id);
  }

  saveInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt'>): Invoice {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
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
      details: `Yeni fatura eklendi: ${invoiceData.invoiceNo} - ${invoiceData.supplierName}`,
      performedBy: 'system'
    });

    return newInvoice;
  }

  updateInvoice(id: string, updates: Partial<Invoice>): Invoice | null {
    const index = this.invoices.findIndex(inv => inv.id === id);
    if (index !== -1) {
      const oldInvoice = this.invoices[index];
      this.invoices[index] = { ...this.invoices[index], ...updates };
      this.saveToLocalStorage();
      this.logAction({
        action: 'UPDATE',
        module: 'INVOICE',
        recordId: id,
        details: `Fatura güncellendi: ${oldInvoice.invoiceNo}`,
        performedBy: 'system'
      });
      return this.invoices[index];
    }
    return null;
  }

  deleteInvoice(id: string): boolean {
    const index = this.invoices.findIndex(inv => inv.id === id);
    if (index !== -1) {
      const invoiceNo = this.invoices[index].invoiceNo;
      this.invoices.splice(index, 1);
      this.saveToLocalStorage();
      this.logAction({
        action: 'DELETE',
        module: 'INVOICE',
        recordId: id,
        details: `Fatura silindi: ${invoiceNo}`,
        performedBy: 'system'
      });
      return true;
    }
    return false;
  }

  // Stok Sayım Yönetimi
  getStockCounts(): StockCount[] {
    return this.stockCounts;
  }

  saveStockCount(countData: Omit<StockCount, 'id' | 'createdAt'>): StockCount {
    const material = this.materials.find(m => m.id === countData.materialId);
    if (!material) {
      throw new Error('Malzeme bulunamadı');
    }

    const totalValue = countData.countedQuantity * material.unitPrice;

    const newCount: StockCount = {
      ...countData,
      id: `count-${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalValue: totalValue
    };
    
    this.stockCounts.push(newCount);
    
    // Stok miktarını güncelle
    this.updateMaterial(material.id, {
      currentStock: countData.countedQuantity
    });

    this.saveToLocalStorage();
    this.logAction({
      action: 'CREATE',
      module: 'STOCK_COUNT',
      recordId: newCount.id,
      details: `Stok sayımı yapıldı: ${material.name} (${countData.countedQuantity} ${material.unit})`,
      performedBy: 'system'
    });

    return newCount;
  }

  updateStockCount(id: string, updates: Partial<StockCount>): StockCount | null {
    const index = this.stockCounts.findIndex(c => c.id === id);
    if (index !== -1) {
      this.stockCounts[index] = { ...this.stockCounts[index], ...updates };
      this.saveToLocalStorage();
      return this.stockCounts[index];
    }
    return null;
  }

  deleteStockCount(id: string): boolean {
    const index = this.stockCounts.findIndex(c => c.id === id);
    if (index !== -1) {
      this.stockCounts.splice(index, 1);
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  getStockCountSessions(): StockCountSession[] {
    return this.stockCountSessions;
  }

  saveStockCountSession(sessionData: Omit<StockCountSession, 'id' | 'createdAt' | 'totalProductsCounted'>): StockCountSession {
    const newSession: StockCountSession = {
      ...sessionData,
      id: `session-${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalProductsCounted: 0
    };
    this.stockCountSessions.push(newSession);
    this.saveToLocalStorage();
    this.logAction({
      action: 'CREATE',
      module: 'STOCK_SESSION',
      recordId: newSession.id,
      details: `Yeni stok sayım oturumu: ${sessionData.title}`,
      performedBy: 'system'
    });
    return newSession;
  }

  updateStockCountSession(id: string, updates: Partial<StockCountSession>): StockCountSession | null {
    const index = this.stockCountSessions.findIndex(s => s.id === id);
    if (index !== -1) {
      this.stockCountSessions[index] = { ...this.stockCountSessions[index], ...updates };
      this.saveToLocalStorage();
      return this.stockCountSessions[index];
    }
    return null;
  }

  deleteStockCountSession(id: string): boolean {
    const index = this.stockCountSessions.findIndex(s => s.id === id);
    if (index !== -1) {
      this.stockCountSessions.splice(index, 1);
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  // Sistem Logları
  getLogs(): SystemLog[] {
    return this.logs.sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
  }

  logAction(log: Omit<SystemLog, 'id' | 'performedAt'>): SystemLog {
    const newLog: SystemLog = {
      ...log,
      id: `log-${Date.now()}`,
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

  // Dashboard İstatistikleri
  getDashboardStats(): DashboardStats {
    const totalMaterials = this.materials.length;
    const totalPatients = this.patients.length;
    const totalStockValue = this.materials.reduce((sum, m) => sum + (m.currentStock * m.unitPrice), 0);
    const criticalStockCount = this.materials.filter(m => m.currentStock <= m.minStock).length;
    const totalUsageCost = this.patientMaterialUsage.reduce((sum, u) => sum + u.totalCost, 0);
    
    const lowStockMaterials = this.materials
      .filter(m => m.currentStock <= m.minStock)
      .slice(0, 5);

    const recentActivities = this.getLogs().slice(0, 10);

    const materialUsageMap = new Map<string, { name: string; quantity: number; cost: number }>();
    this.patientMaterialUsage.forEach(usage => {
      const material = this.materials.find(m => m.id === usage.materialId);
      if (material) {
        const existing = materialUsageMap.get(usage.materialId) || { name: material.name, quantity: 0, cost: 0 };
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

    return {
      totalMaterials,
      totalPatients,
      totalStockValue,
      criticalStockCount,
      totalUsageCost,
      lowStockMaterials,
      recentActivities,
      topUsedMaterials
    };
  }

  // Raporlama ve Analiz
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
        totalCost: monthUsages.reduce((sum, u) => sum + u.totalCost, 0)
      };
    });

    // En çok kullanılan malzemeler
    const materialUsageMap = new Map<string, { name: string; quantity: number; cost: number }>();
    materialUsages.forEach(usage => {
      const material = this.materials.find(m => m.id === usage.materialId);
      if (material) {
        const existing = materialUsageMap.get(usage.materialId) || { name: material.name, quantity: 0, cost: 0 };
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

    return {
      materialId: materialId || '',
      materialName: material?.name || 'Tüm Malzemeler',
      seasonalPattern: {
        season,
        trend: 'stable' as const
      },
      usageTrend: monthlyUsage.map((usage, index) => ({
        period: `${index + 1}. Ay`,
        totalUsage: usage.totalUsage,
        totalCost: usage.totalCost
      })),
      usageData: {
        daily: [],
        weekly: [],
        monthly: monthlyUsage,
        yearly: []
      },
      // topMaterials property'sini kaldırdık çünkü MaterialUsageAnalysis interface'inde yok
      totalUsage: materialUsages.reduce((sum, u) => sum + u.quantity, 0),
      totalCost: materialUsages.reduce((sum, u) => sum + u.totalCost, 0)
    } as MaterialUsageAnalysis & { totalUsage: number; totalCost: number; topMaterials?: any };
  }

  getStockValueAnalysis(period: 'daily' | 'weekly' | 'monthly' | 'yearly', year: number = new Date().getFullYear()): StockValueAnalysis {
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthStart = new Date(year, i, 1);
      const monthEnd = new Date(year, i + 1, 0);
      
      // Bu aya ait malzemelerin toplam değeri
      const monthMaterials = this.materials.filter(m => {
        const updateDate = new Date(m.updatedAt);
        return updateDate >= monthStart && updateDate <= monthEnd;
      });

      const totalValue = monthMaterials.reduce((sum, m) => sum + (m.currentStock * m.unitPrice), 0);
      
      // Tüm malzemelerin bu ayki durumu
      const allMaterialsValue = this.materials.reduce((sum, m) => sum + (m.currentStock * m.unitPrice), 0);
      const criticalCount = this.materials.filter(m => m.currentStock <= m.minStock).length;

      return {
        date: `${i + 1}/${year}`,
        totalValue: totalValue > 0 ? totalValue : allMaterialsValue,
        stockCount: this.materials.length,
        criticalStockCount: criticalCount
      };
    });

    return {
      period,
      data: monthlyData,
      monthlyTrend: monthlyData.map(item => ({
        period: item.date,
        value: item.totalValue
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

    return {
      year,
      totalMaterials: this.materials.length,
      totalPatients: this.patients.length,
      totalStockValue: this.materials.reduce((sum, m) => sum + (m.currentStock * m.unitPrice), 0),
      criticalStockCount: this.materials.filter(m => m.currentStock <= m.minStock).length,
      totalUsageCost: yearlyUsages.reduce((sum, u) => sum + u.totalCost, 0),
      totalInvoiceAmount: yearlyInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      // totalUsageItems property'sini kaldırdık çünkü YearlySummary interface'inde yok
    };
  }

  // Yardımcı metodlar
  getStockCountsByMaterial(materialId: string): StockCount[] {
    return this.stockCounts.filter(count => count.materialId === materialId)
      .sort((a, b) => new Date(b.countDate).getTime() - new Date(a.countDate).getTime());
  }

  getStockCountsBySession(sessionId: string): StockCount[] {
    return this.stockCounts.filter(count => count.sessionId === sessionId);
  }

  getStockCountsBySessionDetailed(sessionId: string): any[] {
    return this.stockCounts
      .filter(count => count.sessionId === sessionId)
      .map(count => {
        const material = this.materials.find(m => m.id === count.materialId);
        return {
          ...count,
          materialName: material?.name,
          materialCategory: material?.category,
          materialUnit: material?.unit,
          materialBarcode: material?.barcode
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
        title: session.title,
        countDate: session.countDate,
        countedBy: session.countedBy,
        status: session.status,
        totalProductsCounted: sessionCounts.length,
        totalValue: totalValue
      };
    });
  }

  getCurrentUser() {
    return { 
      name: 'Admin User', 
      role: 'admin',
      permissions: ['admin', 'sayim_onayla', 'malzeme_ekle', 'fatura_duzenle'] 
    };
  }

  // LocalStorage işlemleri
  private loadFromLocalStorage() {
    try {
      const savedMaterials = localStorage.getItem('materials');
      const savedCategories = localStorage.getItem('categories');
      const savedSuppliers = localStorage.getItem('suppliers');
      const savedPatients = localStorage.getItem('patients');
      const savedUsage = localStorage.getItem('patientMaterialUsage');
      const savedInvoices = localStorage.getItem('invoices');
      const savedStockCounts = localStorage.getItem('stockCounts');
      const savedSessions = localStorage.getItem('stockCountSessions');
      const savedLogs = localStorage.getItem('logs');

      if (savedMaterials) this.materials = JSON.parse(savedMaterials);
      if (savedCategories && JSON.parse(savedCategories).length > 0) this.categories = JSON.parse(savedCategories);
      if (savedSuppliers && JSON.parse(savedSuppliers).length > 0) this.suppliers = JSON.parse(savedSuppliers);
      if (savedPatients) this.patients = JSON.parse(savedPatients);
      if (savedUsage) this.patientMaterialUsage = JSON.parse(savedUsage);
      if (savedInvoices) this.invoices = JSON.parse(savedInvoices);
      if (savedStockCounts) this.stockCounts = JSON.parse(savedStockCounts);
      if (savedSessions) this.stockCountSessions = JSON.parse(savedSessions);
      if (savedLogs) this.logs = JSON.parse(savedLogs);
    } catch (error) {
      console.error('LocalStorage yükleme hatası:', error);
    }
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem('materials', JSON.stringify(this.materials));
      localStorage.setItem('categories', JSON.stringify(this.categories));
      localStorage.setItem('suppliers', JSON.stringify(this.suppliers));
      localStorage.setItem('patients', JSON.stringify(this.patients));
      localStorage.setItem('patientMaterialUsage', JSON.stringify(this.patientMaterialUsage));
      localStorage.setItem('invoices', JSON.stringify(this.invoices));
      localStorage.setItem('stockCounts', JSON.stringify(this.stockCounts));
      localStorage.setItem('stockCountSessions', JSON.stringify(this.stockCountSessions));
      localStorage.setItem('logs', JSON.stringify(this.logs));
    } catch (error) {
      console.error('LocalStorage kaydetme hatası:', error);
    }
  }

  // Sistem temizleme (geliştirme için)
  clearAllData() {
    this.materials = [];
    this.categories = [];
    this.suppliers = [];
    this.patients = [];
    this.patientMaterialUsage = [];
    this.invoices = [];
    this.stockCounts = [];
    this.stockCountSessions = [];
    this.logs = [];
    localStorage.clear();
    this.initializeDefaultData();
  }

  // Veri yedekleme ve geri yükleme
  exportData(): string {
    const data = {
      materials: this.materials,
      categories: this.categories,
      suppliers: this.suppliers,
      patients: this.patients,
      patientMaterialUsage: this.patientMaterialUsage,
      invoices: this.invoices,
      stockCounts: this.stockCounts,
      stockCountSessions: this.stockCountSessions,
      logs: this.logs,
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.materials) this.materials = data.materials;
      if (data.categories) this.categories = data.categories;
      if (data.suppliers) this.suppliers = data.suppliers;
      if (data.patients) this.patients = data.patients;
      if (data.patientMaterialUsage) this.patientMaterialUsage = data.patientMaterialUsage;
      if (data.invoices) this.invoices = data.invoices;
      if (data.stockCounts) this.stockCounts = data.stockCounts;
      if (data.stockCountSessions) this.stockCountSessions = data.stockCountSessions;
      if (data.logs) this.logs = data.logs;
      
      this.saveToLocalStorage();
      return true;
    } catch (error) {
      console.error('Veri içe aktarma hatası:', error);
      return false;
    }
  }
}

export const dataService = new DataService();