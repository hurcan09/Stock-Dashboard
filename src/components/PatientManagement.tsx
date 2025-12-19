import React, { useState, useEffect } from 'react';
import { Plus, Search, User, Edit2, ShoppingCart, Eye, Trash2, Barcode, FileText, Download, Filter } from 'lucide-react';
import { Patient, PatientMaterialUsage, Material } from '../types';
import { dataService } from '../utils/dataService';

export default function PatientManagement() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showMaterialUsage, setShowMaterialUsage] = useState(false);
  const [showQuickUsage, setShowQuickUsage] = useState(false);
  const [columnFilters, setColumnFilters] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadPatients();
    setMaterials(dataService.getMaterials());
  }, []);

  const loadPatients = () => {
    setPatients(dataService.getPatients());
  };

  // Filtreleme fonksiyonu - sütun filtreleri ve arama terimini birleştirir
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.tcNo.includes(searchTerm) ||
      patient.phone.includes(searchTerm);

    const matchesColumnFilters = Object.entries(columnFilters).every(([column, filter]) => {
      if (!filter) return true;
      const value = patient[column as keyof Patient];
      return value?.toString().toLowerCase().includes(filter.toLowerCase());
    });

    return matchesSearch && matchesColumnFilters;
  });

  // Sütun filtreleme fonksiyonu
  const handleColumnFilter = (column: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  // Sütun filtresini temizle
  const clearColumnFilter = (column: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[column];
      return newFilters;
    });
  };

  // Hasta ekleme fonksiyonu
  const handleAddPatient = (patientData: Omit<Patient, 'id' | 'createdAt'>) => {
    dataService.savePatient(patientData);
    
    dataService.logAction({
      action: 'YENİ_HASTA',
      module: 'HASTA_YÖNETİMİ',
      recordId: patientData.tcNo,
      details: `${patientData.name} ${patientData.surname} hastası eklendi`,
      performedBy: 'System',
    });

    loadPatients();
    setShowAddModal(false);
  };

  // Hasta güncelleme fonksiyonu
  const handleUpdatePatient = (id: string, updates: Partial<Patient>) => {
    dataService.updatePatient(id, updates);
    
    const patient = patients.find(p => p.id === id);
    dataService.logAction({
      action: 'HASTA_GÜNCELLENDİ',
      module: 'HASTA_YÖNETİMİ',
      recordId: patient?.tcNo || id,
      details: `${patient?.name} ${patient?.surname} hastası güncellendi`,
      performedBy: 'System',
    });

    loadPatients();
    setEditingPatient(null);
  };

  // Hasta silme fonksiyonu
  const handleDeletePatient = (id: string) => {
    const patient = patients.find(p => p.id === id);
    if (confirm(`"${patient?.name} ${patient?.surname}" hastasını silmek istediğinizden emin misiniz?`)) {
      // Önce hastaya ait malzeme kullanım kayıtlarını sil
      const patientUsages = dataService.getPatientMaterialUsage().filter(usage => usage.patientId === id);
      patientUsages.forEach(usage => {
        dataService.deletePatientMaterialUsage(usage.id);
      });
      
      // Sonra hastayı sil
      dataService.deletePatient(id);
      
      dataService.logAction({
        action: 'HASTA_SİLİNDİ',
        module: 'HASTA_YÖNETİMİ',
        recordId: patient?.tcNo || id,
        details: `${patient?.name} ${patient?.surname} hastası ve ${patientUsages.length} malzeme kullanım kaydı silindi`,
        performedBy: 'System',
      });

      loadPatients();
    }
  };

  // Hızlı malzeme kullanımı fonksiyonu
  const handleQuickMaterialUsage = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowQuickUsage(true);
  };

  // Barkod ile malzeme kullanımı fonksiyonu
  const handleAddMaterialUsageWithBarcode = (usageData: {
    barcode: string;
    quantity: number;
    notes: string;
    procedureFee?: number;
  }) => {
    if (!selectedPatient) return;

    try {
      // Barkod ile malzeme bul
      const material = materials.find(m => m.barcode === usageData.barcode);
      if (!material) {
        throw new Error('Bu barkoda ait malzeme bulunamadı!');
      }

      // Stok kontrolü
      if (usageData.quantity > material.currentStock) {
        throw new Error(`Yetersiz stok! Mevcut stok: ${material.currentStock}`);
      }

      // Malzeme kullanımını kaydet
      const patientUsage: Omit<PatientMaterialUsage, 'id'> = {
        patientId: selectedPatient.id,
        materialId: material.id,
        quantity: usageData.quantity,
        unitPrice: material.unitPrice,
        totalCost: usageData.quantity * material.unitPrice,
        usageDate: new Date().toISOString(),
        notes: usageData.notes,
        procedureFee: usageData.procedureFee || 0,
      };

      dataService.savePatientMaterialUsage(patientUsage);

      // Stok güncelle
      dataService.updateMaterial(material.id, {
        currentStock: material.currentStock - usageData.quantity
      });

      dataService.logAction({
        action: 'MALZEME_KULLANIMI',
        module: 'HASTA_YÖNETİMİ',
        recordId: usageData.barcode,
        details: `${selectedPatient.name} ${selectedPatient.surname} hastası için ${material.name} (${usageData.barcode}) kullanıldı - Miktar: ${usageData.quantity} - İşlem Ücreti: ₺${usageData.procedureFee || 0}`,
        performedBy: 'System',
      });

      loadPatients();
      setMaterials(dataService.getMaterials()); // Malzeme listesini güncelle
      setShowQuickUsage(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bir hata oluştu!';
      alert(errorMessage);
    }
  };

  // Klasik malzeme kullanımı fonksiyonu
  const handleAddMaterialUsage = (usage: Omit<PatientMaterialUsage, 'id'>) => {
    dataService.savePatientMaterialUsage(usage);
    
    const material = materials.find(m => m.id === usage.materialId);
    const patient = patients.find(p => p.id === usage.patientId);
    
    // Stok güncelle
    if (material) {
      dataService.updateMaterial(material.id, {
        currentStock: material.currentStock - usage.quantity
      });
    }
    
    dataService.logAction({
      action: 'MALZEME_KULLANIMI',
      module: 'HASTA_YÖNETİMİ',
      recordId: usage.materialId,
      details: `${patient?.name} ${patient?.surname} hastası için ${material?.name} kullanıldı - Miktar: ${usage.quantity} - İşlem Ücreti: ₺${usage.procedureFee || 0}`,
      performedBy: 'System',
    });

    setMaterials(dataService.getMaterials());
    setShowMaterialUsage(false);
  };

  // Hasta başına toplam maliyet hesaplama (malzeme + işlem ücreti)
  const getTotalCostForPatient = (patientId: string) => {
    const usages = dataService.getPatientMaterialUsage().filter(usage => usage.patientId === patientId);
    return usages.reduce((total, usage) => total + usage.totalCost + (usage.procedureFee || 0), 0);
  };

  // Hasta malzeme kullanımlarını getirme
  const getPatientUsages = (patientId: string) => {
    return dataService.getPatientMaterialUsage().filter(usage => usage.patientId === patientId);
  };

  // Excel export fonksiyonu
  const handleExportExcel = () => {
    const headers = ['Ad', 'Soyad', 'TC Kimlik No', 'Telefon', 'Adres', 'Kayıt Tarihi', 'Toplam Maliyet'];
    const data = filteredPatients.map(patient => [
      patient.name,
      patient.surname,
      patient.tcNo,
      patient.phone,
      patient.address,
      new Date(patient.createdAt).toLocaleDateString('tr-TR'),
      getTotalCostForPatient(patient.id).toFixed(2)
    ]);
    
    const csvContent = [headers, ...data]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hastalar_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Hasta detaylarını PDF olarak indirme
  const handleExportPatientDetails = (patient: Patient) => {
    const usages = getPatientUsages(patient.id);
    const totalCost = getTotalCostForPatient(patient.id);
    
    // Basit bir PDF içeriği oluştur (gerçek uygulamada PDF kütüphanesi kullanılır)
    const content = `
      HASTA DETAY RAPORU
      ==================
      
      Hasta Bilgileri:
      ----------------
      Ad Soyad: ${patient.name} ${patient.surname}
      TC Kimlik No: ${patient.tcNo}
      Telefon: ${patient.phone}
      Adres: ${patient.address}
      Kayıt Tarihi: ${new Date(patient.createdAt).toLocaleDateString('tr-TR')}
      
      Malzeme Kullanım Geçmişi:
      -------------------------
      ${usages.length > 0 ? usages.map((usage, index) => {
        const material = materials.find(m => m.id === usage.materialId);
        return `
        ${index + 1}. ${material?.name || 'Bilinmeyen Malzeme'}
           Tarih: ${new Date(usage.usageDate).toLocaleDateString('tr-TR')}
           Miktar: ${usage.quantity} ${material?.unit || 'adet'}
           Birim Fiyat: ₺${usage.unitPrice.toFixed(2)}
           Malzeme Toplam: ₺${usage.totalCost.toFixed(2)}
           İşlem Ücreti: ₺${(usage.procedureFee || 0).toFixed(2)}
           Toplam: ₺${(usage.totalCost + (usage.procedureFee || 0)).toFixed(2)}
           Notlar: ${usage.notes || 'Yok'}
        `;
      }).join('') : 'Henüz malzeme kullanımı bulunmuyor.'}
      
      Toplam Maliyet: ₺${totalCost.toFixed(2)}
      
      Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}
    `;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hasta_${patient.tcNo}_${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Başlık ve Yeni Hasta Butonu */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Hasta Yönetimi</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleExportExcel}
            className="bg-green-600/90 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Download className="h-5 w-5" />
            <span>Excel Export</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600/90 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Yeni Hasta</span>
          </button>
        </div>
      </div>

      {/* Ana İçerik */}
      <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-gray-200/40">
        {/* Arama Çubuğu */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Hasta adı, soyadı, TC kimlik no veya telefon ara..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Sütun Filtreleri */}
        <div className="grid grid-cols-5 gap-2 mb-4 p-3 bg-gray-50/60 rounded-lg">
          <div className="relative">
            <input
              type="text"
              placeholder="Ad ara..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white/80"
              value={columnFilters.name || ''}
              onChange={(e) => handleColumnFilter('name', e.target.value)}
            />
            {columnFilters.name && (
              <button
                onClick={() => clearColumnFilter('name')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Soyad ara..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white/80"
              value={columnFilters.surname || ''}
              onChange={(e) => handleColumnFilter('surname', e.target.value)}
            />
            {columnFilters.surname && (
              <button
                onClick={() => clearColumnFilter('surname')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="TC No ara..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white/80"
              value={columnFilters.tcNo || ''}
              onChange={(e) => handleColumnFilter('tcNo', e.target.value)}
            />
            {columnFilters.tcNo && (
              <button
                onClick={() => clearColumnFilter('tcNo')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Telefon ara..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white/80"
              value={columnFilters.phone || ''}
              onChange={(e) => handleColumnFilter('phone', e.target.value)}
            />
            {columnFilters.phone && (
              <button
                onClick={() => clearColumnFilter('phone')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            )}
          </div>
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Filter className="h-4 w-4 mr-1" />
            Sütun Filtreleri
          </div>
        </div>

        {/* Hasta Tablosu */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Hasta Bilgileri</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">TC Kimlik No</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Telefon</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Toplam Maliyet</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50/60">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="font-medium">{patient.name} {patient.surname}</span>
                        <div className="text-xs text-gray-500">
                          {new Date(patient.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{patient.tcNo}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{patient.phone}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-green-600">
                      ₺{getTotalCostForPatient(patient.id).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      {/* Detay Görüntüle Butonu */}
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1 transition-colors"
                        title="Detayları Görüntüle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* PDF İndirme Butonu */}
                      <button
                        onClick={() => handleExportPatientDetails(patient)}
                        className="text-red-600 hover:text-red-800 p-1 transition-colors"
                        title="Detayları İndir"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      
                      {/* Düzenle Butonu */}
                      <button
                        onClick={() => setEditingPatient(patient)}
                        className="text-yellow-600 hover:text-yellow-800 p-1 transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      
                      {/* Hızlı Malzeme Kullanım Butonu */}
                      <button
                        onClick={() => handleQuickMaterialUsage(patient)}
                        className="text-green-600 hover:text-green-800 p-1 transition-colors"
                        title="Hızlı Malzeme Kullanımı (Barkod)"
                      >
                        <Barcode className="h-4 w-4" />
                      </button>
                      
                      {/* Klasik Malzeme Kullanım Butonu */}
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowMaterialUsage(true);
                        }}
                        className="text-orange-600 hover:text-orange-800 p-1 transition-colors"
                        title="Malzeme Kullanımı"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                      
                      {/* Sil Butonu */}
                      <button
                        onClick={() => handleDeletePatient(patient.id)}
                        className="text-red-600 hover:text-red-800 p-1 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Boş durum */}
          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Hasta bulunamadı</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || Object.keys(columnFilters).length > 0 
                  ? 'Arama kriterlerinize uygun hasta bulunamadı.'
                  : 'Henüz hiç hasta eklenmemiş.'
                }
              </p>
              {(searchTerm || Object.keys(columnFilters).length > 0) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setColumnFilters({});
                  }}
                  className="bg-blue-600/90 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sayfa Bilgisi */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Toplam <span className="font-semibold">{filteredPatients.length}</span> hasta
            {patients.length !== filteredPatients.length && (
              <span> (filtrelenmiş)</span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            Toplam Maliyet: <span className="font-semibold text-green-600">
              ₺{filteredPatients.reduce((total, patient) => total + getTotalCostForPatient(patient.id), 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Hasta Detayları Modal */}
      {selectedPatient && !showMaterialUsage && !showQuickUsage && (
        <PatientDetails
          patient={selectedPatient}
          usages={getPatientUsages(selectedPatient.id)}
          materials={materials}
          onClose={() => setSelectedPatient(null)}
          onExport={() => handleExportPatientDetails(selectedPatient)}
        />
      )}

      {/* Hasta Ekleme/Düzenleme Modal */}
      {(showAddModal || editingPatient) && (
        <PatientModal
          patient={editingPatient}
          onSave={editingPatient ? 
            (updates) => handleUpdatePatient(editingPatient.id, updates) : 
            handleAddPatient
          }
          onClose={() => {
            setShowAddModal(false);
            setEditingPatient(null);
          }}
        />
      )}

      {/* Klasik Malzeme Kullanım Modal */}
      {showMaterialUsage && selectedPatient && (
        <MaterialUsageModal
          patient={selectedPatient}
          materials={materials}
          onSave={handleAddMaterialUsage}
          onClose={() => {
            setShowMaterialUsage(false);
            setSelectedPatient(null);
          }}
        />
      )}

      {/* Hızlı Malzeme Kullanım Modal */}
      {showQuickUsage && selectedPatient && (
        <QuickMaterialUsageModal
          patient={selectedPatient}
          materials={materials}
          onSave={handleAddMaterialUsageWithBarcode}
          onClose={() => {
            setShowQuickUsage(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </div>
  );
}

// Hasta Modal Component
interface PatientModalProps {
  patient?: Patient | null;
  onSave: (patient: any) => void;
  onClose: () => void;
}

function PatientModal({ patient, onSave, onClose }: PatientModalProps) {
  const [formData, setFormData] = useState({
    name: patient?.name || '',
    surname: patient?.surname || '',
    tcNo: patient?.tcNo || '',
    phone: patient?.phone || '',
    address: patient?.address || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // TC Kimlik No validasyonu
    if (formData.tcNo.length !== 11 || !/^\d+$/.test(formData.tcNo)) {
      alert('TC Kimlik No 11 haneli ve sadece rakamlardan oluşmalıdır!');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-200/60">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          {patient ? 'Hasta Bilgilerini Düzenle' : 'Yeni Hasta Ekle'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ad *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Soyad *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TC Kimlik No *
            </label>
            <input
              type="text"
              required
              maxLength={11}
              pattern="[0-9]{11}"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
              value={formData.tcNo}
              onChange={(e) => setFormData({ ...formData, tcNo: e.target.value.replace(/\D/g, '') })}
              placeholder="11 haneli TC Kimlik No"
            />
            <p className="text-xs text-gray-500 mt-1">11 haneli ve sadece rakamlardan oluşmalıdır</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon
            </label>
            <input
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="5XX XXX XX XX"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adres
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Hasta adres bilgileri..."
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600/90 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {patient ? 'Güncelle' : 'Ekle'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Hızlı Malzeme Kullanım Modal Component
interface QuickMaterialUsageModalProps {
  patient: Patient;
  materials: Material[];
  onSave: (usage: { barcode: string; quantity: number; notes: string; procedureFee?: number }) => void;
  onClose: () => void;
}

function QuickMaterialUsageModal({ patient, materials, onSave, onClose }: QuickMaterialUsageModalProps) {
  const [barcode, setBarcode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [procedureFee, setProcedureFee] = useState<number>(0);

  const currentMaterial = materials.find(m => m.barcode === barcode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode) {
      alert('Lütfen barkod giriniz!');
      return;
    }

    if (!currentMaterial) {
      alert('Bu barkoda ait malzeme bulunamadı!');
      return;
    }

    if (quantity > currentMaterial.currentStock) {
      alert(`Yetersiz stok! Mevcut stok: ${currentMaterial.currentStock}`);
      return;
    }

    onSave({ barcode, quantity, notes, procedureFee });
    setBarcode('');
    setQuantity(1);
    setNotes('');
    setProcedureFee(0);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-200/60">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Hızlı Malzeme Kullanımı - {patient.name} {patient.surname}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Barkod *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Barkodu taratın veya girin"
              autoFocus
            />
          </div>

          {currentMaterial && (
            <div className="bg-green-50/80 border border-green-200 rounded-lg p-3">
              <h4 className="font-semibold text-green-800 mb-2">Malzeme Bilgileri</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Ad:</span> {currentMaterial.name}</div>
                <div><span className="font-medium">Kategori:</span> {currentMaterial.category}</div>
                <div><span className="font-medium">Mevcut Stok:</span> {currentMaterial.currentStock} {currentMaterial.unit}</div>
                <div><span className="font-medium">Birim Fiyat:</span> ₺{currentMaterial.unitPrice.toFixed(2)}</div>
                <div><span className="font-medium">Tedarikçi:</span> {currentMaterial.supplier}</div>
                <div><span className="font-medium">Toplam:</span> ₺{(currentMaterial.unitPrice * quantity).toFixed(2)}</div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Miktar *
            </label>
            <input
              type="number"
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
            {currentMaterial && quantity > currentMaterial.currentStock && (
              <p className="text-red-600 text-sm mt-1">
                Yetersiz stok! Mevcut: {currentMaterial.currentStock} {currentMaterial.unit}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              İşlem Ücreti (₺)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
              value={procedureFee}
              onChange={(e) => setProcedureFee(parseFloat(e.target.value) || 0)}
              placeholder="İşlem ücretini girin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notlar
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Kullanım nedeni, prosedür vb."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={!barcode || !currentMaterial || quantity > (currentMaterial?.currentStock || 0)}
              className="flex-1 bg-green-600/90 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Kullanımı Kaydet
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Klasik Malzeme Kullanım Modal Component
interface MaterialUsageModalProps {
  patient: Patient;
  materials: Material[];
  onSave: (usage: Omit<PatientMaterialUsage, 'id'>) => void;
  onClose: () => void;
}

function MaterialUsageModal({ patient, materials, onSave, onClose }: MaterialUsageModalProps) {
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [procedureFee, setProcedureFee] = useState<number>(0);

  const selectedMaterial = materials.find(m => m.id === selectedMaterialId);
  const totalCost = selectedMaterial ? selectedMaterial.unitPrice * quantity : 0;
  const totalWithFee = totalCost + procedureFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    if (selectedMaterial.currentStock < quantity) {
      alert('Yetersiz stok! Mevcut stok: ' + selectedMaterial.currentStock);
      return;
    }


    setSelectedMaterialId('');
    setQuantity(1);
    setNotes('');
    setProcedureFee(0);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-200/60">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Malzeme Kullanımı - {patient.name} {patient.surname}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Malzeme *
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
            >
              <option value="">Malzeme seçiniz</option>
              {materials
                .filter(m => m.currentStock > 0)
                .map(material => (
                  <option key={material.id} value={material.id}>
                    {material.name} - Stok: {material.currentStock} {material.unit} - ₺{material.unitPrice}
                  </option>
                ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Miktar *
            </label>
            <input
              type="number"
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
            {selectedMaterial && quantity > selectedMaterial.currentStock && (
              <p className="text-red-600 text-sm mt-1">
                Yetersiz stok! Mevcut: {selectedMaterial.currentStock} {selectedMaterial.unit}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              İşlem Ücreti (₺)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
              value={procedureFee}
              onChange={(e) => setProcedureFee(parseFloat(e.target.value) || 0)}
              placeholder="İşlem ücretini girin"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notlar
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Kullanım nedeni, prosedür vb."
            />
          </div>
          
          {(totalCost > 0 || procedureFee > 0) && (
            <div className="bg-blue-50/80 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                Malzeme Maliyeti: <span className="font-semibold">₺{totalCost.toFixed(2)}</span>
              </p>
              <p className="text-sm text-blue-800">
                İşlem Ücreti: <span className="font-semibold">₺{procedureFee.toFixed(2)}</span>
              </p>
              <p className="text-sm text-blue-800 font-bold">
                Toplam: <span className="font-semibold">₺{totalWithFee.toFixed(2)}</span>
              </p>
            </div>
          )}
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={!selectedMaterial || quantity > (selectedMaterial?.currentStock || 0)}
              className="flex-1 bg-green-600/90 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Kullanımı Kaydet
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Hasta Detayları Component
interface PatientDetailsProps {
  patient: Patient;
  usages: PatientMaterialUsage[];
  materials: Material[];
  onClose: () => void;
  onExport: () => void;
}

function PatientDetails({ patient, usages, materials, onClose, onExport }: PatientDetailsProps) {
  const getMaterialName = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    return material ? material.name : 'Bilinmeyen Malzeme';
  };

  const getMaterialBarcode = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    return material ? material.barcode : '-';
  };

  const totalMaterialCost = usages.reduce((sum, usage) => sum + usage.totalCost, 0);
  const totalProcedureFee = usages.reduce((sum, usage) => sum + (usage.procedureFee || 0), 0);
  const totalCost = totalMaterialCost + totalProcedureFee;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto border border-gray-200/60">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            {patient.name} {patient.surname} - Detaylı Bilgiler
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={onExport}
              className="bg-red-600/90 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FileText className="h-5 w-5" />
              <span>Detayları İndir</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Hasta Bilgileri */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50/60 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 text-gray-800">Kişisel Bilgiler</h4>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">TC Kimlik No:</span> {patient.tcNo}</div>
              <div><span className="font-medium">Telefon:</span> {patient.phone}</div>
              <div><span className="font-medium">Adres:</span> {patient.address || 'Belirtilmemiş'}</div>
              <div><span className="font-medium">Kayıt Tarihi:</span> {new Date(patient.createdAt).toLocaleDateString('tr-TR')}</div>
            </div>
          </div>
          
          <div className="bg-gray-50/60 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 text-gray-800">Toplam Maliyet Özeti</h4>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Malzeme Toplamı:</span> ₺{totalMaterialCost.toFixed(2)}</div>
              <div><span className="font-medium">İşlem Ücretleri:</span> ₺{totalProcedureFee.toFixed(2)}</div>
              <div className="border-t border-gray-300 pt-2">
                <span className="font-bold">Genel Toplam:</span> ₺{totalCost.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Malzeme Kullanım Geçmişi */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-800">Malzeme Kullanım Geçmişi</h4>
            <span className="text-sm text-gray-600">{usages.length} kayıt</span>
          </div>
          {usages.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Henüz malzeme kullanımı bulunmuyor.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-4 font-semibold text-gray-700">Tarih</th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-700">Malzeme</th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-700">Barkod</th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-700">Miktar</th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-700">Birim Fiyat</th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-700">Malzeme Toplam</th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-700">İşlem Ücreti</th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-700">Toplam</th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-700">Notlar</th>
                  </tr>
                </thead>
                <tbody>
                  {usages.map((usage) => {
                    const material = materials.find(m => m.id === usage.materialId);
                    const usageTotal = usage.totalCost + (usage.procedureFee || 0);
                    
                    return (
                      <tr key={usage.id} className="border-b border-gray-100 hover:bg-gray-50/60">
                        <td className="py-2 px-4 text-sm">
                          {new Date(usage.usageDate).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="py-2 px-4 text-sm">
                          {getMaterialName(usage.materialId)}
                          {material && (
                            <div className="text-xs text-gray-500">
                              {material.category} • {material.supplier}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-4 text-sm text-gray-600">
                          {getMaterialBarcode(usage.materialId)}
                        </td>
                        <td className="py-2 px-4 text-sm">
                          {usage.quantity} {material?.unit || 'adet'}
                        </td>
                        <td className="py-2 px-4 text-sm">₺{usage.unitPrice.toFixed(2)}</td>
                        <td className="py-2 px-4 text-sm">₺{usage.totalCost.toFixed(2)}</td>
                        <td className="py-2 px-4 text-sm">
                          {usage.procedureFee ? `₺${usage.procedureFee.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-2 px-4 text-sm font-semibold">
                          ₺{usageTotal.toFixed(2)}
                        </td>
                        <td className="py-2 px-4 text-sm text-gray-600 max-w-xs">
                          {usage.notes || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50/60">
                    <td colSpan={5} className="py-3 px-4 text-right font-semibold">Genel Toplam:</td>
                    <td className="py-3 px-4 font-semibold">₺{totalMaterialCost.toFixed(2)}</td>
                    <td className="py-3 px-4 font-semibold">₺{totalProcedureFee.toFixed(2)}</td>
                    <td className="py-3 px-4 font-bold text-green-600">₺{totalCost.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Kapat Butonu */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-6 rounded-lg font-medium transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}