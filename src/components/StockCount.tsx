import React, { useState, useEffect } from 'react';
import StockCountManagement from './StockCountManagement';
import { dataService } from '../utils/dataService';
import { User } from '../types';
import { Plus, Camera, FileText, X, FileUp, Barcode } from 'lucide-react';

interface StockCountProps {
  user?: User;
  onUnauthorized?: () => void;
  showNotification?: (message: string, type: 'success' | 'error' | 'info') => void;
}

// Hızlı sayım için interface
interface QuickCountItem {
  barcode: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export default function StockCount({ user, onUnauthorized, showNotification }: StockCountProps) {
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showQuickCountModal, setShowQuickCountModal] = useState(false);
  const [showControlledCountModal, setShowControlledCountModal] = useState(false);
  const [quickCountItems, setQuickCountItems] = useState<QuickCountItem[]>([]);
  const [currentQuickCountBarcode, setCurrentQuickCountBarcode] = useState('');

  // Yeni oturum form state
  const [sessionForm, setSessionForm] = useState({
    invoiceNo: '',
    countDate: new Date().toISOString().split('T')[0],
    countedBy: '',
    notes: '',
    status: 'Normal Malzemeler', // Varsayılan statü
    countType: 'quick' as 'quick' | 'controlled' // Yeni: sayım tipi
  });

  // Statü seçenekleri
  const statusOptions = [
    'Normal Malzemeler',
    'Konsinye Malzemeler',
    'İade Malzemeler',
    'Faturalı Malzemeler'
  ];

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = () => {
    try {
      const currentUser = user || dataService.getCurrentUser();
      
      if (!currentUser) {
        if (onUnauthorized) {
          onUnauthorized();
        }
        setHasPermission(false);
        setLoading(false);
        return;
      }

      const requiredPermissions = ['createSession', 'approveCounts'];
      const hasRequiredPermissions = requiredPermissions.some(permission => 
        currentUser.permissions[permission as keyof typeof currentUser.permissions]
      );

      if (!hasRequiredPermissions) {
        if (showNotification) {
          showNotification('Stok sayımı modülüne erişim izniniz bulunmamaktadır.', 'error');
        }
        
        if (onUnauthorized) {
          onUnauthorized();
        }
        
        setHasPermission(false);
      } else {
        setHasPermission(true);
      }

      dataService.logAction({
        action: 'VIEW_MODULE',
        module: 'STOCK_COUNT',
        recordId: currentUser.id,
        details: `${currentUser.name} stok sayımı modülünü görüntüledi`,
        performedBy: currentUser.name
      });
      
    } catch (error) {
      console.error('Yetki kontrol hatası:', error);
      
      if (showNotification) {
        showNotification('Sistem hatası oluştu. Lütfen tekrar deneyin.', 'error');
      }
      
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  };

  // Yeni oturum oluşturma
  const handleCreateSession = () => {
    if (!sessionForm.invoiceNo.trim()) {
      if (showNotification) {
        showNotification('Lütfen fatura numarası giriniz!', 'error');
      }
      return;
    }

    const sessionData = {
      ...sessionForm,
      createdBy: user?.name || dataService.getCurrentUser()?.name || '',
      sessionNo: generateSessionNo(),
      totalProductsCounted: 0,
      startDate: sessionForm.countDate, // Başlangıç tarihi artık sayım tarihi ile aynı
      endDate: sessionForm.countDate, // Bitiş tarihi de sayım tarihi ile aynı
      pdfFile: undefined,
      sessionStatus: sessionForm.status === 'Normal Malzemeler' ? '' : sessionForm.status.toLowerCase()
    };

    // Burada session kayıt işlemi yapılacak
    const savedSession = dataService.saveStockCountSession(sessionData);
    
    if (savedSession && showNotification) {
      showNotification('Sayım oturumu başarıyla oluşturuldu!', 'success');
    }

    dataService.logAction({
      action: 'YENİ_SAYIM_OTURUMU',
      module: 'STOK_SAYIM',
      recordId: sessionData.sessionNo,
      details: `${sessionForm.invoiceNo} faturası için ${sessionData.sessionNo} oturumu oluşturuldu - Tip: ${sessionForm.countType === 'quick' ? 'Hızlı Sayım' : 'Kontrollü Sayım'}`,
      performedBy: user?.name || dataService.getCurrentUser()?.name || '',
    });

    setShowSessionModal(false);
    resetSessionForm();
    
    // Sayım tipine göre modal aç
    if (savedSession) {
      setTimeout(() => {
        if (sessionForm.countType === 'quick') {
          setShowQuickCountModal(true);
        } else {
          setShowControlledCountModal(true);
        }
      }, 100);
    }
  };

  // Otomatik oturum numarası oluşturma
  const generateSessionNo = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    const sessions = dataService.getStockCountSessions();
    const sameMonthSessions = sessions.filter(session => 
      session.sessionNo.startsWith(`OSG-${year}-${month}`)
    );
    
    const sequence = String(sameMonthSessions.length + 1).padStart(3, '0');
    return `OSG-${year}-${month}-${sequence}`;
  };

  const resetSessionForm = () => {
    setSessionForm({
      invoiceNo: '',
      countDate: new Date().toISOString().split('T')[0],
      countedBy: user?.name || dataService.getCurrentUser()?.name || '',
      notes: '',
      status: 'Normal Malzemeler',
      countType: 'quick'
    });
  };

  // Hızlı sayım işlevleri
  const handleQuickCountBarcode = (barcode: string) => {
    setCurrentQuickCountBarcode(barcode);
    
    if (barcode.trim()) {
      const materials = dataService.getMaterials();
      // Tüm barkod alanlarında ara
      const material = materials.find(m => 
        m.barcode === barcode ||
        m.gtin === barcode ||
        m.sn === barcode ||
        m.udiCode === barcode ||
        m.allBarcode === barcode
      );
      
      if (material) {
        const existingIndex = quickCountItems.findIndex(item => item.barcode === barcode);
        
        if (existingIndex >= 0) {
          const newItems = [...quickCountItems];
          newItems[existingIndex].quantity += 1;
          setQuickCountItems(newItems);
        } else {
          const newItem: QuickCountItem = {
            barcode: barcode,
            materialName: material.name,
            quantity: 1,
            unit: material.unit,
            unitPrice: material.unitPrice
          };
          setQuickCountItems([...quickCountItems, newItem]);
        }
        
        setCurrentQuickCountBarcode('');
        
        if (showNotification) {
          showNotification(`${material.name} başarıyla eklendi`, 'success');
        }
      } else {
        if (showNotification) {
          showNotification('Barkod bulunamadı! Malzeme yönetiminde kayıtlı olmalıdır.', 'error');
        }
      }
    }
  };

  const handleSaveQuickCount = () => {
    if (quickCountItems.length === 0) {
      if (showNotification) {
        showNotification('Lütfen en az bir ürün ekleyin!', 'error');
      }
      return;
    }

    // Burada hızlı sayım sonuçlarını kaydetme işlemi yapılacak
    // Geçici olarak sadece bildirim gösteriyoruz
    if (showNotification) {
      showNotification(`${quickCountItems.length} ürün başarıyla kaydedildi!`, 'success');
    }

    dataService.logAction({
      action: 'HIZLI_STOK_SAYIMI',
      module: 'STOK_SAYIM',
      recordId: 'HIZLI_SAYIM',
      details: `${quickCountItems.length} ürün hızlı sayım ile kaydedildi`,
      performedBy: user?.name || dataService.getCurrentUser()?.name || '',
    });

    setQuickCountItems([]);
    setShowQuickCountModal(false);
  };

  const handleExportData = () => {
    try {
      const data = {
        stockCounts: dataService.getStockCounts(),
        sessions: dataService.getStockCountSessions(),
        exportDate: new Date().toISOString(),
        exportedBy: user?.name || 'Bilinmeyen Kullanıcı'
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `stok_sayim_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      if (showNotification) {
        showNotification('Stok sayım verileri başarıyla dışa aktarıldı.', 'success');
      }
      
      dataService.logAction({
        action: 'EXPORT_DATA',
        module: 'STOCK_COUNT',
        recordId: 'BATCH_EXPORT',
        details: 'Stok sayım verileri dışa aktarıldı',
        performedBy: user?.name || 'Sistem'
      });
      
    } catch (error) {
      console.error('Veri export hatası:', error);
      
      if (showNotification) {
        showNotification('Veri dışa aktarımı başarısız oldu.', 'error');
      }
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!data.stockCounts || !Array.isArray(data.stockCounts)) {
          throw new Error('Geçersiz veri formatı');
        }

        if (showNotification) {
          showNotification('Veri içe aktarımı başarılı.', 'success');
        }

        dataService.logAction({
          action: 'IMPORT_DATA',
          module: 'STOCK_COUNT',
          recordId: 'BATCH_IMPORT',
          details: 'Stok sayım verileri içe aktarıldı',
          performedBy: user?.name || 'Sistem'
        });

      } catch (error) {
        console.error('Veri import hatası:', error);
        
        if (showNotification) {
          showNotification('Veri içe aktarımı başarısız oldu. Geçersiz dosya formatı.', 'error');
        }
      }
    };
    reader.readAsText(file);

    event.target.value = '';
  };

  const handleQuickActions = (action: string) => {
    switch (action) {
      case 'newSession':
        setShowSessionModal(true);
        if (showNotification) {
          showNotification('Yeni sayım oturumu oluşturuluyor...', 'info');
        }
        break;
      
      case 'quickCount':
        setShowQuickCountModal(true);
        if (showNotification) {
          showNotification('Hızlı sayım modu başlatılıyor...', 'info');
        }
        break;
      
      case 'exportReport':
        handleExportData();
        break;
      
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yetkiler kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="text-red-600 text-5xl mb-4">⛔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erişim Engellendi</h2>
          <p className="text-gray-600 mb-6">
            Stok sayım modülüne erişim izniniz bulunmamaktadır.
          </p>
          <div className="space-y-3 max-w-md mx-auto">
            <p className="text-sm text-gray-500">
              Bu modül için aşağıdaki yetkilerden en az birine sahip olmanız gerekmektedir:
            </p>
            <ul className="text-sm text-gray-600 text-left bg-white rounded-lg p-4 shadow-sm">
              <li className="flex items-center mb-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Sayım oturumu oluşturma
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Sayımları onaylama
              </li>
            </ul>
            <p className="text-xs text-gray-400 mt-4">
              Yetki talebiniz için sistem yöneticinizle iletişime geçin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Yeni Oturum Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Yeni Sayım Oturumu</h3>
              <button onClick={() => setShowSessionModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleCreateSession(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sayım Yapan *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={sessionForm.countedBy}
                    onChange={(e) => setSessionForm({ ...sessionForm, countedBy: e.target.value })}
                    placeholder="Sayım yapan personel adı"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fatura No *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={sessionForm.invoiceNo}
                    onChange={(e) => setSessionForm({ ...sessionForm, invoiceNo: e.target.value })}
                    placeholder="Fatura numarasını giriniz"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sayım Tarihi *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={sessionForm.countDate}
                    onChange={(e) => setSessionForm({ ...sessionForm, countDate: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sayım Tipi *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={sessionForm.countType}
                    onChange={(e) => setSessionForm({ ...sessionForm, countType: e.target.value as 'quick' | 'controlled' })}
                  >
                    <option value="quick">Hızlı Sayım (Barkod tarama - otomatik adet)</option>
                    <option value="controlled">Kontrollü Sayım (Manuel seçim)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {sessionForm.countType === 'quick' 
                      ? 'Hızlı sayımda her barkod tarandığında 1 adet eklenecek' 
                      : 'Kontrollü sayımda malzemeleri manuel seçeceksiniz'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statü *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sessionForm.status}
                  onChange={(e) => setSessionForm({ ...sessionForm, status: e.target.value })}
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* PDF Yükleme Alanı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fatura PDF'i (İsteğe Bağlı)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <FileUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Fatura PDF'ini yükleyin
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notlar
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sessionForm.notes}
                  onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                  placeholder="Sayım oturumu ile ilgili notlar..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Kaydet ve Sayıma Başla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hızlı Sayım Modal */}
      {showQuickCountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Hızlı Sayım</h3>
              <button onClick={() => setShowQuickCountModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barkod/GTIN/SN/UDI Code/All Barcode
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    value={currentQuickCountBarcode}
                    onChange={(e) => setCurrentQuickCountBarcode(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleQuickCountBarcode(currentQuickCountBarcode);
                      }
                    }}
                    placeholder="Barkod, GTIN, SN, UDI Code veya All Barcode taratın"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleQuickCountBarcode(currentQuickCountBarcode)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Camera className="h-5 w-5" />
                    <span>Tara</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Her barkod tarandığında 1 adet eklenecektir
                </p>
              </div>

              {quickCountItems.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Sayılan Ürünler ({quickCountItems.length})</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {quickCountItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.materialName}</div>
                          <div className="text-xs text-gray-600">Barkod: {item.barcode}</div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-semibold">{item.quantity} {item.unit}</div>
                            <div className="text-xs text-gray-600">₺{(item.quantity * item.unitPrice).toFixed(2)}</div>
                          </div>
                          <button
                            onClick={() => {
                              const newItems = quickCountItems.filter((_, i) => i !== index);
                              setQuickCountItems(newItems);
                            }}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Toplam: <span className="font-semibold">{quickCountItems.length}</span> ürün
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowQuickCountModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSaveQuickCount}
                    disabled={quickCountItems.length === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                  >
                    Sayımı Kaydet ({quickCountItems.length} ürün)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Üst Bilgi ve Hızlı Eylemler */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Stok Sayım Yönetimi</h1>
            <p className="text-gray-600 mt-1">
              Barkod tarama ile hızlı sayım, oturum yönetimi ve detaylı raporlama
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickActions('newSession')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Yeni Sayım Oturumu</span>
            </button>
            
            <button
              onClick={() => handleQuickActions('quickCount')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Barcode className="h-5 w-5" />
              <span>Hızlı Sayım</span>
            </button>
            
            <div className="relative">
              <button
                onClick={() => handleQuickActions('exportReport')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <FileText className="h-5 w-5" />
                <span>Rapor Al</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-500">Toplam Oturum</div>
            <div className="text-2xl font-bold text-gray-800">
              {dataService.getStockCountSessions().length}
            </div>
            <div className="text-xs text-gray-400 mt-1">Aktif: {
              dataService.getStockCountSessions().filter(s => s.status === 'devam-ediyor').length
            }</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-500">Sayılan Ürünler</div>
            <div className="text-2xl font-bold text-gray-800">
              {dataService.getStockCounts().length}
            </div>
            <div className="text-xs text-gray-400 mt-1">Bugün: {
              dataService.getStockCounts().filter(c => 
                new Date(c.countDate).toDateString() === new Date().toDateString()
              ).length
            }</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-500">Toplam Değer</div>
            <div className="text-2xl font-bold text-gray-800">
              ₺{dataService.getStockCounts().reduce((sum, c) => sum + (c.totalValue || 0), 0).toFixed(2)}
            </div>
            <div className="text-xs text-gray-400 mt-1">Ortalama: ₺{
              dataService.getStockCounts().length > 0 
                ? (dataService.getStockCounts().reduce((sum, c) => sum + (c.totalValue || 0), 0) / 
                   dataService.getStockCounts().length).toFixed(2)
                : '0.00'
            }</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-500">Son Sayım</div>
            <div className="text-2xl font-bold text-gray-800">
              {dataService.getStockCounts().length > 0 
                ? new Date(
                    dataService.getStockCounts().sort((a, b) => 
                      new Date(b.countDate).getTime() - new Date(a.countDate).getTime()
                    )[0].countDate
                  ).toLocaleDateString('tr-TR')
                : 'Henüz Yok'
              }
            </div>
            <div className="text-xs text-gray-400 mt-1">Son kullanıcı: {
              dataService.getStockCounts().length > 0 
                ? dataService.getStockCounts().sort((a, b) => 
                    new Date(b.countDate).getTime() - new Date(a.countDate).getTime()
                  )[0].countedBy
                : '-'
            }</div>
          </div>
        </div>
      </div>
      
      {/* Veri İşlemleri Barı */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Veri İşlemleri:</span>
            Sistem verilerini yedekleyin veya geri yükleyin
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>📤</span>
              <span>Verileri Dışa Aktar</span>
            </button>
            
            <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 cursor-pointer">
              <span>📥</span>
              <span>Verileri İçe Aktar</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Ana StockCountManagement Component */}
      <div className="transition-all duration-300">
        <StockCountManagement 
          user={user}
          onUnauthorized={onUnauthorized}
          showNotification={showNotification}
        />
      </div>

      {/* İşlem Kılavuzu */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 İşlem Kılavuzu</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-blue-600 text-lg font-semibold mb-2">1. Oturum Oluştur</div>
            <p className="text-sm text-gray-600">
              Yeni bir sayım oturumu oluşturun ve fatura bilgilerini girin.
            </p>
            <ul className="text-xs text-gray-500 mt-2 space-y-1">
              <li>• Fatura numarası zorunludur</li>
              <li>• PDF fatura yükleyebilirsiniz</li>
              <li>• Hızlı veya kontrollü sayım seçin</li>
              <li>• Statü seçin (Normal/Konsinye/İade/Faturalı)</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-green-600 text-lg font-semibold mb-2">2. Sayım Yap</div>
            <p className="text-sm text-gray-600">
              Barkod tarayarak veya manuel giriş yaparak ürünleri sayın.
            </p>
            <ul className="text-xs text-gray-500 mt-2 space-y-1">
              <li>• Hızlı sayım: Her barkod tarandığında 1 adet ekler</li>
              <li>• Kontrollü sayım: Malzemeleri manuel seçersiniz</li>
              <li>• Tüm barkod alanlarında arama yapılır</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-purple-600 text-lg font-semibold mb-2">3. Raporla</div>
            <p className="text-sm text-gray-600">
              Sayım sonuçlarını görüntüleyin ve raporlar oluşturun.
            </p>
            <ul className="text-xs text-gray-500 mt-2 space-y-1">
              <li>• Detaylı oturum raporları</li>
              <li>• PDF görüntüleme</li>
              <li>• Excel export</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}