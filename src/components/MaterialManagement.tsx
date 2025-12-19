import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, Edit2, Package, Filter, Download, Barcode, Camera, X, Upload, Eye, Calendar, FileText, ClipboardList, ChevronLeft, ChevronRight, CheckSquare, Square, Check } from 'lucide-react';
import { Material, Category, Supplier, StockCount, StockCountSession, MaterialStatus } from '../types';
import { dataService } from '../utils/dataService';

// Barkod tarama modal component'i
function BarcodeScannerModal({ onScan, onClose }: { onScan: (barcode: string) => void; onClose: () => void }) {
  const [scanning, setScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      onClose();
    }
  };

  const startCameraScan = async () => {
    try {
      setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setVideoStream(stream);
    } catch (error) {
      console.error('Kamera erişim hatası:', error);
      alert('Kameraya erişim sağlanamadı!');
      setScanning(false);
    }
  };

  const stopCameraScan = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopCameraScan();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-md rounded-lg p-6 w-full max-w-md mx-4 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Barkod/QR Tara</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="bg-gray-100 rounded-lg p-8 mb-4">
            <div className="relative inline-block">
              <div className="w-64 h-48 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-400">
                {scanning && videoStream ? (
                  <video 
                    ref={video => {
                      if (video) video.srcObject = videoStream;
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : scanning ? (
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Kamera başlatılıyor...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Kamera görüntüsü burada görünecek</p>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 border-2 border-green-500 rounded-lg pointer-events-none">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-2 py-1 text-xs rounded">
                  Barkodu bu alana getirin
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Barkod veya QR kodu kamera görüş alanının vurgulanan yerine tam olarak yerleştirin.
          </p>
        </div>

        <div className="border-t pt-4">
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Veya barkodu manuel girin:
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Barkod numarasını girin"
                autoFocus
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={scanning ? stopCameraScan : startCameraScan}
                className="flex-1 bg-blue-600/80 hover:bg-blue-700/80 text-white py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 backdrop-blur-sm border border-white/20"
              >
                <Camera className="h-4 w-4" />
                <span>{scanning ? 'Kamerayı Kapat' : 'Kamerayı Aç'}</span>
              </button>
              <button
                type="submit"
                disabled={!manualBarcode.trim()}
                className="flex-1 bg-green-600/80 hover:bg-green-700/80 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-all backdrop-blur-sm border border-white/20"
              >
                Tamam
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Hızlı Düzenleme Modal Component - GÜNCELLENMİŞ (Yatay layout)
function QuickEditModal({ material, onSave, onClose }: { material: Material; onSave: (updates: Partial<Material>) => void; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: material.name,
    barcode: material.barcode,
    gtin: material.gtin || '',
    sn: material.sn || '',
    udiCode: material.udiCode || '',
    allBarcode: material.allBarcode || '',
    intuitiveCode: material.intuitiveCode || '',
    currentStock: material.currentStock,
    minStock: material.minStock,
    unitPrice: material.unitPrice,
    unit: material.unit,
    category: material.category,
    subCategory: material.subCategory || '',
    supplier: material.supplier || '',
    expirationDate: material.expirationDate || '',
    serialNoStatus: material.serialNoStatus || '',
    materialDescription: material.materialDescription || '',
    status: material.status || 'normal'
  });

  const units = ['adet', 'kutu', 'şişe', 'tüp', 'paket', 'ampul', 'kg', 'lt', 'metre'];
  const statusOptions: MaterialStatus[] = ['normal', 'konsinye', 'iade', 'faturalı'];
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newSupplier, setNewSupplier] = useState('');

  useEffect(() => {
    setCategories(dataService.getCategories());
    setSuppliers(dataService.getSuppliers());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      const newCat: Omit<Category, 'id'> = {
        name: newCategory.trim(),
        description: '',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      dataService.saveCategory(newCat);
      setCategories(dataService.getCategories());
      setFormData({ ...formData, category: newCategory.trim() });
      setNewCategory('');
    }
  };

  const handleAddSupplier = () => {
    if (newSupplier.trim()) {
      const newSup: Omit<Supplier, 'id'> = {
        name: newSupplier.trim(),
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      dataService.saveSupplier(newSup);
      setSuppliers(dataService.getSuppliers());
      setFormData({ ...formData, supplier: newSupplier.trim() });
      setNewSupplier('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-md rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Hızlı Düzenle - {material.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* İlk Satır */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Malzeme Adı *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barkod *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GTIN
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.gtin}
                onChange={(e) => setFormData({ ...formData, gtin: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SN
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.sn}
                onChange={(e) => setFormData({ ...formData, sn: e.target.value })}
              />
            </div>
          </div>

          {/* İkinci Satır */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UDI Code
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.udiCode}
                onChange={(e) => setFormData({ ...formData, udiCode: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                All Barcode
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.allBarcode}
                onChange={(e) => setFormData({ ...formData, allBarcode: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sezgisel Kod
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.intuitiveCode}
                onChange={(e) => setFormData({ ...formData, intuitiveCode: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statü
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as MaterialStatus })}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Üçüncü Satır */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
                <button
                  type="button"
                  onClick={() => setNewCategory('')}
                  className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  + Yeni Ekle
                </button>
              </label>
              <div className="flex space-x-2">
                <select
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Kategori seçin</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              {newCategory === '' && (
                <button
                  type="button"
                  onClick={() => setNewCategory('Yeni kategori...')}
                  className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  + Yeni Kategori Ekle
                </button>
              )}
              {newCategory !== '' && (
                <div className="mt-2 flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Yeni kategori adı"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Ekle
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCategory('')}
                    className="px-2 py-1 bg-gray-300 rounded text-sm hover:bg-gray-400"
                  >
                    İptal
                  </button>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt Kategori
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tedarikçi
                <button
                  type="button"
                  onClick={() => setNewSupplier('')}
                  className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  + Yeni Ekle
                </button>
              </label>
              <div className="flex space-x-2">
                <select
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                >
                  <option value="">Tedarikçi seçin</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.name}>{sup.name}</option>
                  ))}
                </select>
              </div>
              {newSupplier === '' && (
                <button
                  type="button"
                  onClick={() => setNewSupplier('Yeni tedarikçi...')}
                  className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  + Yeni Tedarikçi Ekle
                </button>
              )}
              {newSupplier !== '' && (
                <div className="mt-2 flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                    value={newSupplier}
                    onChange={(e) => setNewSupplier(e.target.value)}
                    placeholder="Yeni tedarikçi adı"
                  />
                  <button
                    type="button"
                    onClick={handleAddSupplier}
                    className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Ekle
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSupplier('')}
                    className="px-2 py-1 bg-gray-300 rounded text-sm hover:bg-gray-400"
                  >
                    İptal
                  </button>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birim
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dördüncü Satır */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mevcut Stok
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kritik Stok
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birim Fiyat (₺)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKT
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
              />
            </div>
          </div>

          {/* Beşinci Satır */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seri No Durumu
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.serialNoStatus}
                onChange={(e) => setFormData({ ...formData, serialNoStatus: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Malzeme Açıklama
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.materialDescription}
                onChange={(e) => setFormData({ ...formData, materialDescription: e.target.value })}
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600/90 to-blue-700/90 hover:from-blue-700/90 hover:to-blue-800/90 text-white py-2 px-4 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl"
            >
              Kaydet
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300/80 hover:bg-gray-400/80 text-gray-700 py-2 px-4 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/20"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Malzeme Detay Modal Component - GÜNCELLENMİŞ (İstatistikler kaldırıldı)
function MaterialDetailsModal({ material, onClose }: { material: Material; onClose: () => void }) {
  const [stockCounts, setStockCounts] = useState<StockCount[]>([]);
  const [sessions, setSessions] = useState<StockCountSession[]>([]);

  useEffect(() => {
    if (material) {
      const allCounts = dataService.getStockCounts();
      const allSessions = dataService.getStockCountSessions();
      
      // Bu malzemeye ait tüm sayımları bul
      const materialCounts = allCounts.filter(count => 
        count.barcode === material.barcode ||
        count.materialId === material.id
      );
      
      // En son sayımları tarihe göre sırala
      const sortedCounts = materialCounts.sort((a, b) => 
        new Date(b.countDate).getTime() - new Date(a.countDate).getTime()
      );
      
      setStockCounts(sortedCounts);
      setSessions(allSessions);
    }
  }, [material]);

  const getStockStatusBadge = (material: Material) => {
    if (material.currentStock === 0) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Stok Yok</span>;
    } else if (material.currentStock <= material.minStock) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Kritik Stok</span>;
    } else {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Yeterli Stok</span>;
    }
  };

  const getStatusBadge = (status: MaterialStatus) => {
    const colors = {
      normal: 'bg-green-100 text-green-800',
      konsinye: 'bg-blue-100 text-blue-800',
      iade: 'bg-red-100 text-red-800',
      faturalı: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getSessionByCountId = (countId: string) => {
    const count = stockCounts.find(c => c.id === countId);
    return sessions.find(s => s.id === count?.sessionId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-md rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold">Malzeme Detayları</h3>
            <p className="text-gray-600">Barkod: {material.barcode} | Statü: {getStatusBadge(material.status || 'normal')}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Malzeme Bilgileri */}
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Temel Bilgiler
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Malzeme Adı:</span>
                  <div className="mt-1 font-semibold">{material.name}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Barkod:</span>
                  <div className="mt-1 font-mono">{material.barcode}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">GTIN:</span>
                  <div className="mt-1 font-mono">{material.gtin || '-'}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">SN:</span>
                  <div className="mt-1 font-mono">{material.sn || '-'}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">UDI Code:</span>
                  <div className="mt-1 font-mono">{material.udiCode || '-'}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">All Barcode:</span>
                  <div className="mt-1 font-mono">{material.allBarcode || '-'}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Kategori:</span>
                  <div className="mt-1">{material.category}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Alt Kategori:</span>
                  <div className="mt-1">{material.subCategory || '-'}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Birim:</span>
                  <div className="mt-1">{material.unit}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Birim Fiyat:</span>
                  <div className="mt-1">₺{material.unitPrice.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                <ClipboardList className="h-5 w-5 mr-2" />
                Stok Bilgileri
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Mevcut Stok:</span>
                  <div className={`mt-1 font-semibold ${
                    material.currentStock === 0 ? 'text-red-600' :
                    material.currentStock <= material.minStock ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {material.currentStock} {material.unit}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Kritik Stok:</span>
                  <div className="mt-1">{material.minStock} {material.unit}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Stok Durumu:</span>
                  <div className="mt-1">{getStockStatusBadge(material)}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Tedarikçi:</span>
                  <div className="mt-1">{material.supplier || '-'}</div>
                </div>
              </div>
            </div>

            {/* Ek Bilgiler */}
            {(material.expirationDate || material.serialNoStatus || material.materialDescription) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-3">Ek Bilgiler</h4>
                <div className="space-y-2 text-sm">
                  {material.expirationDate && (
                    <div>
                      <span className="font-medium text-gray-700">SKT:</span>
                      <div className="mt-1">{material.expirationDate}</div>
                    </div>
                  )}
                  {material.serialNoStatus && (
                    <div>
                      <span className="font-medium text-gray-700">Seri No Durumu:</span>
                      <div className="mt-1">{material.serialNoStatus}</div>
                    </div>
                  )}
                  {material.materialDescription && (
                    <div>
                      <span className="font-medium text-gray-700">Açıklama:</span>
                      <div className="mt-1">{material.materialDescription}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sayım Geçmişi - GÜNCELLENMİŞ (Son 5 kayıt gösteriliyor) */}
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Son Sayım Geçmişi ({stockCounts.length} kayıt)
              </h4>
              
              {stockCounts.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {stockCounts.slice(0, 5).map((count) => {
                    const session = getSessionByCountId(count.id);
                    return (
                      <div key={count.id} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-blue-600">
                            {session?.invoiceNo || 'Fatura Yok'}
                          </div>
                          <div className="flex space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              count.status === 'tamamlandı' || count.status === 'onaylandı' ? 'bg-green-100 text-green-800' :
                              count.status === 'beklemede' ? 'bg-yellow-100 text-yellow-800' :
                              count.status === 'reddedildi' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {count.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(count.countDate).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Tarih: {new Date(count.countDate).toLocaleDateString('tr-TR')}</span>
                          </div>
                          <div>
                            <span className="font-medium">Miktar:</span> {count.countedQuantity} {material.unit}
                          </div>
                          <div>
                            <span className="font-medium">Sayım Yapan:</span> {count.countedBy}
                          </div>
                          <div>
                            <span className="font-medium">Toplam:</span> ₺{count.totalValue.toFixed(2)}
                          </div>
                        </div>

                        {session && (
                          <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                            <div>Oturum No: {session.sessionNo}</div>
                            <div>Periyot: {new Date(session.startDate).toLocaleDateString('tr-TR')} - {new Date(session.endDate).toLocaleDateString('tr-TR')}</div>
                          </div>
                        )}

                        {count.notes && (
                          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <span className="font-medium">Not:</span> {count.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {stockCounts.length > 5 && (
                    <div className="text-center pt-2 border-t">
                      <p className="text-sm text-gray-500">
                        {stockCounts.length - 5} kayıt daha var...
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p>Bu malzeme için henüz sayım kaydı bulunmuyor.</p>
                </div>
              )}
            </div>

            {/* Son Fatura Bilgileri */}
            {stockCounts.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Son Fatura Bilgileri</h4>
                {(() => {
                  const lastCount = stockCounts[0];
                  const session = getSessionByCountId(lastCount.id);
                  
                  if (session) {
                    return (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Fatura No:</span>
                          <span className="font-semibold text-blue-600">{session.invoiceNo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Son Sayım Tarihi:</span>
                          <span>{new Date(lastCount.countDate).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Sayım Yapan:</span>
                          <span>{lastCount.countedBy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Sayılan Miktar:</span>
                          <span className="font-semibold">{lastCount.countedQuantity} {material.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Toplam Değer:</span>
                          <span className="font-semibold text-green-600">₺{lastCount.totalValue.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <p className="text-gray-500 text-center py-4">
                      Bu malzeme için fatura bilgisi bulunmuyor.
                    </p>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="bg-gray-300/80 hover:bg-gray-400/80 text-gray-700 py-2 px-6 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/20"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

// Excel Import Modal Component
function ExcelImportModal({ onImport, onClose }: { onImport: (materials: any[]) => void; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Güncellenmiş CSV şablonu sütunları
  const templateColumns = [
    'Malzeme Adı',
    'Barkod',
    'GTIN',
    'SN',
    'UDI Code',
    'All Barcode',
    'Kategori',
    'Alt Kategori',
    'Birim',
    'Birim Fiyat',
    'Mevcut Stok',
    'Kritik Stok',
    'Tedarikçi',
    'SKT',
    'Seri No Durumu',
    'Malzeme Açıklama',
    'Statü'
  ];

  const handleDownloadTemplate = () => {
    // CSV formatında şablon oluşturma (Excel ile uyumlu)
    const templateData = [
      templateColumns,
      [
        'Örnek Malzeme Adı',
        '1234567890123',
        '12345678901234',
        'SN123456789',
        'UDI123456789',
        'ALL123456789',
        'İlaç',
        'Tablet',
        'adet',
        '25.50',
        '100',
        '10',
        'Örnek Tedarikçi',
        '2025-12-31',
        'Aktif',
        'Örnek malzeme açıklaması',
        'normal'
      ]
    ];

    const BOM = '\uFEFF';
    const csvContent = BOM + templateData
      .map(row => row.map(cell => `"${cell}"`).join(';'))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `malzeme_sablonu_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValidationErrors([]);
      validateFileStructure(selectedFile);
    }
  };

  const validateFileStructure = async (file: File) => {
    try {
      const text = await file.text();
      const cleanText = text.replace(/^\uFEFF/, '');
      const lines = cleanText.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        setValidationErrors(['Dosya boş veya geçersiz format']);
        return false;
      }

      const headers = lines[0].split(';').map(h => h.replace(/"/g, '').trim());
      
      const errors: string[] = [];

      if (headers.length !== templateColumns.length) {
        errors.push(`Sütun sayısı uyuşmuyor. Beklenen: ${templateColumns.length}, Mevcut: ${headers.length}`);
      }

      templateColumns.forEach((expectedColumn, index) => {
        if (headers[index] !== expectedColumn) {
          errors.push(`${index + 1}. sütun hatası: Beklenen "${expectedColumn}", Mevcut "${headers[index]}"`);
        }
      });

      setValidationErrors(errors);
      return errors.length === 0;
    } catch (error) {
      console.error('Dosya doğrulama hatası:', error);
      setValidationErrors(['Dosya okunurken hata oluştu. Lütfen dosya formatını kontrol edin.']);
      return false;
    }
  };

  const handleImport = async () => {
    if (!file) return;

    const isValid = await validateFileStructure(file);
    if (!isValid) {
      alert('CSV dosyasının yapısı uygun değil. Lütfen şablonu kullanın!');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      const text = await file.text();
      const cleanText = text.replace(/^\uFEFF/, '');
      const lines = cleanText.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(';').map(h => h.replace(/"/g, '').trim());
      
      const materials = [];
      const importErrors: string[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(';').map(v => v.replace(/"/g, '').trim());
        const material: any = {};
        
        headers.forEach((header, index) => {
          const value = values[index] || '';
          switch (header) {
            case 'Malzeme Adı':
              material.name = value;
              break;
            case 'Barkod':
              material.barcode = value;
              break;
            case 'GTIN':
              material.gtin = value;
              break;
            case 'SN':
              material.sn = value;
              break;
            case 'UDI Code':
              material.udiCode = value;
              break;
            case 'All Barcode':
              material.allBarcode = value;
              break;
            case 'Kategori':
              material.category = value;
              break;
            case 'Alt Kategori':
              material.subCategory = value;
              break;
            case 'Birim':
              material.unit = value;
              break;
            case 'Birim Fiyat':
              material.unitPrice = parseFloat(value.replace(',', '.')) || 0;
              break;
            case 'Mevcut Stok':
              material.currentStock = parseInt(value) || 0;
              break;
            case 'Kritik Stok':
              material.minStock = parseInt(value) || 0;
              break;
            case 'Tedarikçi':
              material.supplier = value;
              break;
            case 'SKT':
              material.expirationDate = value;
              break;
            case 'Seri No Durumu':
              material.serialNoStatus = value;
              break;
            case 'Malzeme Açıklama':
              material.materialDescription = value;
              break;
            case 'Statü':
              material.status = value || 'normal';
              break;
          }
        });

        if (!material.name) {
          importErrors.push(`${i}. satır: Malzeme adı zorunludur`);
          continue;
        }

        if (!material.barcode) {
          material.barcode = `AUTO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        if (!material.unit) material.unit = 'adet';
        if (!material.category) material.category = 'Diğer';
        if (!material.unitPrice) material.unitPrice = 0;
        if (!material.currentStock) material.currentStock = 0;
        if (!material.minStock) material.minStock = 0;
        if (!material.status) material.status = 'normal';

        materials.push(material);
        setImportProgress(Math.round((i / (lines.length - 1)) * 100));
      }

      if (importErrors.length > 0) {
        alert(`İçe aktarma tamamlandı ancak bazı hatalar oluştu:\n\n${importErrors.slice(0, 5).join('\n')}${importErrors.length > 5 ? `\n\n...ve ${importErrors.length - 5} hata daha` : ''}`);
      }

      onImport(materials);
      setImportProgress(100);
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('CSV import error:', error);
      alert('CSV dosyası okunurken hata oluştu!');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-md rounded-lg p-6 w-full max-w-2xl mx-4 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Excel/CSV'den Malzeme İçe Aktar</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Önemli: CSV Şablon Kullanın</h4>
            <p className="text-sm text-blue-700 mb-3">
              Lütfen önce aşağıdaki butondan CSV şablonunu indirin ve bu şablondaki sütunları doldurarak yükleme yapın.
              <br /><strong>Sadece "Malzeme Adı" alanı zorunludur.</strong>
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="bg-blue-600/80 hover:bg-blue-700/80 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all backdrop-blur-sm border border-white/20"
            >
              <Download className="h-4 w-4" />
              <span>CSV Şablonunu İndir (.csv)</span>
            </button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Şablon Sütunları:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {templateColumns.map((column, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className={`text-gray-700 ${column === 'Malzeme Adı' ? 'font-bold' : ''}`}>
                    {column} {column === 'Malzeme Adı' && '(Zorunlu)'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-3">
              Şablonu doldurduktan sonra buradan yükleyin:
            </p>
            
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                validationErrors.length > 0 
                  ? 'border-red-300 bg-red-50' 
                  : file 
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 bg-white/50 hover:border-blue-500'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {file ? file.name : 'Doldurulmuş CSV dosyasını seçin veya sürükleyin (.csv)'}
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".csv,.xlsx,.xls"
                className="hidden"
              />
            </div>

            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-3">
                <h4 className="font-semibold text-red-800 mb-2">Doğrulama Hataları:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {isImporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>İçe aktarılıyor...</span>
                <span>{importProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300/80 hover:bg-gray-400/80 text-gray-700 py-2 px-4 rounded-lg transition-all backdrop-blur-sm border border-white/20"
            >
              İptal
            </button>
            <button
              onClick={handleImport}
              disabled={!file || isImporting || validationErrors.length > 0}
              className="flex-1 bg-blue-600/80 hover:bg-blue-700/80 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-all backdrop-blur-sm border border-white/20"
            >
              {isImporting ? 'Aktarılıyor...' : 'İçe Aktar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Statü Değiştirme Modal Component
function StatusChangeModal({ 
  selectedMaterials, 
  onStatusChange, 
  onClose 
}: { 
  selectedMaterials: Material[];
  onStatusChange: (materialIds: string[], newStatus: MaterialStatus) => void;
  onClose: () => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState<MaterialStatus>('normal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStatusChange(selectedMaterials.map(m => m.id), selectedStatus);
    onClose();
  };

  const statusOptions: MaterialStatus[] = ['normal', 'konsinye', 'iade', 'faturalı'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-md rounded-lg p-6 w-full max-w-md mx-4 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Malzeme Statüsünü Değiştir</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              {selectedMaterials.length} malzemenin statüsünü değiştireceksiniz.
            </p>
            <div className="max-h-40 overflow-y-auto mb-4">
              {selectedMaterials.slice(0, 10).map((material, index) => (
                <div key={material.id} className="flex items-center justify-between py-1 border-b border-gray-100">
                  <span className="text-sm truncate">{material.name}</span>
                  <span className="text-xs text-gray-500">{material.barcode}</span>
                </div>
              ))}
              {selectedMaterials.length > 10 && (
                <div className="text-center text-sm text-gray-500 py-2">
                  ...ve {selectedMaterials.length - 10} malzeme daha
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yeni Statü *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as MaterialStatus)}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600/90 to-blue-700/90 hover:from-blue-700/90 hover:to-blue-800/90 text-white py-2 px-4 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl"
            >
              Değiştir
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300/80 hover:bg-gray-400/80 text-gray-700 py-2 px-4 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/20"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MaterialManagement() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [quickEditMaterial, setQuickEditMaterial] = useState<Material | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [showSelectAll, setShowSelectAll] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setMaterials(dataService.getMaterials());
    setCategories(dataService.getCategories());
    setSuppliers(dataService.getSuppliers());
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setLowStockOnly(false);
    setSelectedStatus('all');
    setSelectedMaterials([]);
    setShowSelectAll(false);
    setCurrentPage(1);
  };

  const filteredMaterials = materials.filter(material => {
    // Arama terimi kontrolü - Tüm alanlarda ara
    const matchesSearch = searchTerm ? 
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.gtin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.sn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.udiCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.allBarcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.intuitiveCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.materialDescription?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    const matchesLowStock = !lowStockOnly || material.currentStock <= material.minStock;
    const matchesStatus = selectedStatus === 'all' || material.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesLowStock && matchesStatus;
  });

  // Sayfalama hesaplamaları
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMaterials = filteredMaterials.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddMaterial = (materialData: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => {
    dataService.saveMaterial(materialData);
    
    dataService.logAction({
      action: 'YENİ_MALZEME',
      module: 'MALZEME_YÖNETİMİ',
      recordId: materialData.barcode,
      details: `${materialData.name} malzemesi eklendi - Barkod: ${materialData.barcode}`,
      performedBy: dataService.getCurrentUser().name,
    });

    loadData();
    setShowAddModal(false);
  };

  const handleUpdateMaterial = (id: string, updates: Partial<Material>) => {
    dataService.updateMaterial(id, updates);
    
    const material = materials.find(m => m.id === id);
    dataService.logAction({
      action: 'MALZEME_GÜNCELLENDİ',
      module: 'MALZEME_YÖNETİMİ',
      recordId: material?.barcode || id,
      details: `${material?.name} malzemesi güncellendi`,
      performedBy: dataService.getCurrentUser().name,
    });

    loadData();
    setEditingMaterial(null);
    setQuickEditMaterial(null);
  };

  const handleDeleteMaterial = (id: string) => {
    const material = materials.find(m => m.id === id);
    if (confirm(`"${material?.name}" malzemesini silmek istediğinizden emin misiniz?`)) {
      dataService.deleteMaterial(id);
      
      dataService.logAction({
        action: 'MALZEME_SİLİNDİ',
        module: 'MALZEME_YÖNETİMİ',
        recordId: material?.barcode || id,
        details: `${material?.name} malzemesi silindi - Barkod: ${material?.barcode}`,
        performedBy: dataService.getCurrentUser().name,
      });

      loadData();
    }
  };

  const handleBulkStatusChange = (materialIds: string[], newStatus: MaterialStatus) => {
    materialIds.forEach(materialId => {
      dataService.updateMaterial(materialId, { status: newStatus });
    });
    
    dataService.logAction({
      action: 'TOPLU_STATÜ_DEĞİŞİKLİĞİ',
      module: 'MALZEME_YÖNETİMİ',
      recordId: 'TOPLU_DEĞİŞİKLİK',
      details: `${materialIds.length} malzemenin statüsü ${newStatus} olarak değiştirildi`,
      performedBy: dataService.getCurrentUser().name,
    });
    
    loadData();
    setSelectedMaterials([]);
    setShowSelectAll(false);
    alert(`${materialIds.length} malzemenin statüsü ${newStatus} olarak güncellendi.`);
  };

  const handleBarcodeScan = (barcode: string) => {
    setSearchTerm(barcode);
    setShowBarcodeScanner(false);
    setCurrentPage(1);
    
    const foundMaterial = materials.find(m => 
      m.barcode === barcode ||
      m.gtin === barcode ||
      m.sn === barcode ||
      m.udiCode === barcode ||
      m.allBarcode === barcode
    );
    if (foundMaterial) {
      setSelectedMaterial(foundMaterial);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    if (searchTerm.trim()) {
      const foundMaterial = materials.find(m => m.barcode === searchTerm) || filteredMaterials[0];
      if (foundMaterial) {
        setSelectedMaterial(foundMaterial);
      }
    }
  };

  const handleMaterialClick = (material: Material) => {
    setSelectedMaterial(material);
  };

  const handleQuickEditClick = (material: Material, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickEditMaterial(material);
  };

  const handleMaterialSelect = (materialId: string, checked: boolean) => {
    if (checked) {
      setSelectedMaterials([...selectedMaterials, materialId]);
    } else {
      setSelectedMaterials(selectedMaterials.filter(id => id !== materialId));
    }
  };

  const handleSelectAll = () => {
    if (showSelectAll) {
      setSelectedMaterials([]);
      setShowSelectAll(false);
    } else {
      const allIds = currentMaterials.map(m => m.id);
      setSelectedMaterials(allIds);
      setShowSelectAll(true);
    }
  };

  const handleSelectAllFiltered = () => {
    const allFilteredIds = filteredMaterials.map(m => m.id);
    setSelectedMaterials(allFilteredIds);
    setShowSelectAll(true);
  };

  const truncateText = (text: string, maxLength: number = 35) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleExportExcel = () => {
    const headers = [
      'Barkod',
      'GTIN',
      'SN',
      'UDI Code',
      'All Barcode',
      'Malzeme',
      'Sezgisel Kod',
      'Statü',
      'SKT',
      'Seri No Durumu',
      'Malzeme Açıklama',
      'Kategori',
      'Alt Kategori',
      'Birim',
      'Birim Fiyat',
      'Mevcut Stok',
      'Kritik Stok',
      'Tedarikçi'
    ];
    
    const data = filteredMaterials.map(material => [
      material.barcode,
      material.gtin || '',
      material.sn || '',
      material.udiCode || '',
      material.allBarcode || '',
      material.name,
      material.intuitiveCode || '',
      material.status || 'normal',
      material.expirationDate || '',
      material.serialNoStatus || '',
      material.materialDescription || material.name,
      material.category,
      material.subCategory,
      material.unit,
      material.unitPrice.toFixed(2),
      material.currentStock.toString(),
      material.minStock.toString(),
      material.supplier
    ]);
    
    const BOM = '\uFEFF';
    const csvContent = BOM + [headers, ...data]
      .map(row => row.map(cell => `"${cell}"`).join(';'))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `malzemeler_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExcelImport = (importedMaterials: any[]) => {
    let successCount = 0;
    let errorCount = 0;

    importedMaterials.forEach(material => {
      try {
        dataService.saveMaterial(material);
        successCount++;
      } catch (error) {
        console.error('Malzeme kaydedilemedi:', material, error);
        errorCount++;
      }
    });

    dataService.logAction({
      action: 'TOPLU_MALZEME_AKTARIMI',
      module: 'MALZEME_YÖNETİMİ',
      recordId: 'TOPLU_AKTARIM',
      details: `${successCount} malzeme başarıyla içe aktarıldı, ${errorCount} hata`,
      performedBy: dataService.getCurrentUser().name,
    });

    loadData();
    alert(`${successCount} malzeme başarıyla içe aktarıldı${errorCount > 0 ? `, ${errorCount} malzeme aktarılamadı` : ''}`);
  };

  const getStockStatusBadge = (material: Material) => {
    if (material.currentStock === 0) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Stok Yok</span>;
    } else if (material.currentStock <= material.minStock) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Kritik Stok</span>;
    } else {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Yeterli Stok</span>;
    }
  };

  const getStatusBadge = (status: MaterialStatus) => {
    const colors = {
      normal: 'bg-green-100 text-green-800',
      konsinye: 'bg-blue-100 text-blue-800',
      iade: 'bg-red-100 text-red-800',
      faturalı: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-lg transition-all ${
            currentPage === i
              ? 'bg-blue-600/80 text-white'
              : 'bg-white/60 text-gray-700 hover:bg-white/80'
          } backdrop-blur-sm border border-white/20`}
        >
          {i}
        </button>
      );
    }
    
    return pages;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Malzeme Yönetimi</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowExcelImport(true)}
            className="bg-gradient-to-r from-purple-600/90 to-purple-700/90 hover:from-purple-700/90 hover:to-purple-800/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl"
          >
            <Upload className="h-5 w-5" />
            <span>Excel/CSV İçe Aktar</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-gradient-to-r from-green-600/90 to-green-700/90 hover:from-green-700/90 hover:to-green-800/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl"
          >
            <Download className="h-5 w-5" />
            <span>Excel İndir</span>
          </button>
          <button
            onClick={() => setShowBarcodeScanner(true)}
            className="bg-gradient-to-r from-blue-600/90 to-blue-700/90 hover:from-blue-700/90 hover:to-blue-800/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl"
          >
            <Camera className="h-5 w-5" />
            <span>Barkod Tara</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600/90 to-blue-700/90 hover:from-blue-700/90 hover:to-blue-800/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            <span>Yeni Malzeme</span>
          </button>
        </div>
      </div>

      {/* Toplu İşlemler Barı */}
      {selectedMaterials.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">
                  {selectedMaterials.length} malzeme seçildi
                </span>
              </div>
              <button
                onClick={() => setShowStatusChangeModal(true)}
                className="bg-gradient-to-r from-blue-600/90 to-blue-700/90 hover:from-blue-700/90 hover:to-blue-800/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl"
              >
                <Edit2 className="h-4 w-4" />
                <span>Statü Değiştir</span>
              </button>
              <button
                onClick={() => {
                  setSelectedMaterials([]);
                  setShowSelectAll(false);
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                Seçimi Temizle
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md p-6 border border-white/20">
        {/* Arama Formu */}
        <form onSubmit={handleSearch}>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Malzeme adı, barkod, GTIN, SN, kategori veya tedarikçi ara..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(e);
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <Filter className="h-5 w-5 text-gray-400 mt-2" />
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Tüm Kategoriler</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Tüm Statüler</option>
                <option value="normal">Normal</option>
                <option value="konsinye">Konsinye</option>
                <option value="iade">İade</option>
                <option value="faturalı">Faturalı</option>
              </select>
              <label className="flex items-center space-x-2 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                <input
                  type="checkbox"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                  className="rounded text-yellow-600 focus:ring-yellow-500"
                />
                <span className="text-sm text-yellow-800">Sadece Kritik Stok</span>
              </label>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600/90 to-blue-700/90 hover:from-blue-700/90 hover:to-blue-800/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl"
              >
                <Search className="h-4 w-4" />
                <span>Ara</span>
              </button>
            </div>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 w-12">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100"
                    title={showSelectAll ? "Tümünü Kaldır" : "Tümünü Seç"}
                  >
                    {showSelectAll ? (
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[120px]">
                  <span>Barkod</span>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[100px]">
                  <span>GTIN</span>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[100px]">
                  <span>SN</span>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[120px]">
                  <span>UDI Code</span>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[120px]">
                  <span>All Barcode</span>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[180px]">
                  <span>Malzeme</span>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[120px]">
                  <span>Sezgisel Kod</span>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[100px]">
                  <span>Statü</span>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[100px]">
                  <span>SKT</span>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[120px]">
                  <span>Seri No Durumu</span>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[180px]">
                  <span>Malzeme Açıklama</span>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[120px]">
                  <span>Kategori</span>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[120px]">
                  <span>Alt Kategori</span>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[80px]">
                  <span>Birim</span>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[100px]">
                  <span>Birim Fiyat</span>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[100px]">
                  <span>Mevcut Stok</span>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[100px]">
                  <span>Kritik Stok</span>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[100px]">
                  <span>Stok Durumu</span>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[120px]">
                  <span>Tedarikçi</span>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[100px]">
                  <span>İşlemler</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentMaterials.map((material) => (
                <tr key={material.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes(material.id)}
                      onChange={(e) => handleMaterialSelect(material.id, e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="group relative">
                      <button
                        onClick={(e) => handleQuickEditClick(material, e)}
                        className="flex items-center space-x-2 hover:text-blue-600 transition-colors text-left w-full"
                      >
                        <Barcode className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="font-mono text-sm truncate block min-w-0">
                          {material.barcode}
                        </span>
                      </button>
                      <div className="absolute z-10 left-0 top-full mt-1 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                        {material.barcode}
                        <div className="absolute left-2 -top-1 border-4 border-transparent border-b-gray-900"></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="group relative">
                      <span className="font-mono text-sm truncate block min-w-0">
                        {material.gtin || '-'}
                      </span>
                      {material.gtin && material.gtin.length > 15 && (
                        <div className="absolute z-10 left-0 top-full mt-1 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                          {material.gtin}
                          <div className="absolute left-2 -top-1 border-4 border-transparent border-b-gray-900"></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="group relative">
                      <button
                        onClick={(e) => handleQuickEditClick(material, e)}
                        className="flex items-center space-x-2 hover:text-blue-600 transition-colors text-left w-full"
                      >
                        <span className="font-mono text-sm truncate block min-w-0">
                          {material.sn || '-'}
                        </span>
                      </button>
                      {material.sn && material.sn.length > 15 && (
                        <div className="absolute z-10 left-0 top-full mt-1 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                          {material.sn}
                          <div className="absolute left-2 -top-1 border-4 border-transparent border-b-gray-900"></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="group relative">
                      <span className="font-mono text-sm truncate block min-w-0">
                        {material.udiCode || '-'}
                      </span>
                      {material.udiCode && material.udiCode.length > 15 && (
                        <div className="absolute z-10 left-0 top-full mt-1 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                          {material.udiCode}
                          <div className="absolute left-2 -top-1 border-4 border-transparent border-b-gray-900"></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="group relative">
                      <span className="font-mono text-sm truncate block min-w-0">
                        {material.allBarcode || '-'}
                      </span>
                      {material.allBarcode && material.allBarcode.length > 15 && (
                        <div className="absolute z-10 left-0 top-full mt-1 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                          {material.allBarcode}
                          <div className="absolute left-2 -top-1 border-4 border-transparent border-b-gray-900"></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="group relative">
                      <button
                        onClick={() => handleMaterialClick(material)}
                        className="flex items-center space-x-2 hover:text-blue-600 transition-colors text-left w-full"
                      >
                        <Package className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium truncate block min-w-0">
                          {material.name}
                        </span>
                      </button>
                      <div className="absolute z-10 left-0 top-full mt-1 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap max-w-xs">
                        {material.name}
                        <div className="absolute left-2 -top-1 border-4 border-transparent border-b-gray-900"></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="group relative">
                      <button
                        onClick={(e) => handleQuickEditClick(material, e)}
                        className="flex items-center space-x-2 hover:text-blue-600 transition-colors text-left w-full"
                      >
                        <span className="text-sm text-gray-600 truncate block min-w-0">
                          {material.intuitiveCode || '-'}
                        </span>
                      </button>
                      {material.intuitiveCode && material.intuitiveCode.length > 15 && (
                        <div className="absolute z-10 left-0 top-full mt-1 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                          {material.intuitiveCode}
                          <div className="absolute left-2 -top-1 border-4 border-transparent border-b-gray-900"></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(material.status || 'normal')}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {material.expirationDate ? (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>{material.expirationDate}</span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="group relative">
                      <span className="text-sm text-gray-600 truncate block min-w-0">
                        {material.serialNoStatus || '-'}
                      </span>
                      {material.serialNoStatus && material.serialNoStatus.length > 15 && (
                        <div className="absolute z-10 left-0 top-full mt-1 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                          {material.serialNoStatus}
                          <div className="absolute left-2 -top-1 border-4 border-transparent border-b-gray-900"></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="group relative">
                      <span className="text-sm text-gray-600 truncate block min-w-0">
                        {material.materialDescription || material.name}
                      </span>
                      {(material.materialDescription || material.name).length > 25 && (
                        <div className="absolute z-10 left-0 top-full mt-1 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap max-w-xs">
                          {material.materialDescription || material.name}
                          <div className="absolute left-2 -top-1 border-4 border-transparent border-b-gray-900"></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="group relative">
                      <span className="text-sm text-gray-600 truncate block min-w-0">
                        {material.category}
                      </span>
                      {material.category.length > 15 && (
                        <div className="absolute z-10 left-0 top-full mt-1 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                          {material.category}
                          <div className="absolute left-2 -top-1 border-4 border-transparent border-b-gray-900"></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="group relative">
                      <span className="text-sm text-gray-600 truncate block min-w-0">
                        {material.subCategory || '-'}
                      </span>
                      {material.subCategory && material.subCategory.length > 15 && (
                        <div className="absolute z-10 left-0 top-full mt-1 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                          {material.subCategory}
                          <div className="absolute left-2 -top-1 border-4 border-transparent border-b-gray-900"></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{material.unit}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">₺{material.unitPrice.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${
                      material.currentStock === 0 ? 'text-red-600' :
                      material.currentStock <= material.minStock ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {material.currentStock} {material.unit}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{material.minStock} {material.unit}</td>
                  <td className="py-3 px-4">
                    {getStockStatusBadge(material)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="group relative">
                      <span className="text-sm text-gray-600 truncate block min-w-0">
                        {material.supplier}
                      </span>
                      {material.supplier && material.supplier.length > 15 && (
                        <div className="absolute z-10 left-0 top-full mt-1 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                          {material.supplier}
                          <div className="absolute left-2 -top-1 border-4 border-transparent border-b-gray-900"></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleMaterialClick(material)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Detayları Görüntüle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingMaterial(material)}
                        className="text-yellow-600 hover:text-yellow-800 p-1"
                        title="Tam Düzenle"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(material.id)}
                        className="text-red-600 hover:text-red-800 p-1"
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

          {filteredMaterials.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Malzeme bulunamadı</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory !== 'all' || lowStockOnly || selectedStatus !== 'all'
                  ? 'Arama kriterlerinize uygun malzeme bulunamadı.'
                  : 'Henüz hiç malzeme eklenmemiş.'
                }
              </p>
              {(searchTerm || selectedCategory !== 'all' || lowStockOnly || selectedStatus !== 'all') && (
                <button
                  onClick={clearAllFilters}
                  className="bg-gradient-to-r from-blue-600/90 to-blue-700/90 hover:from-blue-700/90 hover:to-blue-800/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sayfalama Bileşeni */}
        {filteredMaterials.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-6 border-t border-gray-200 space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-600">
              Toplam <span className="font-semibold">{filteredMaterials.length}</span> malzeme
              {materials.length !== filteredMaterials.length && (
                <span> (filtrelenmiş)</span>
              )
              }
              {' - '}
              Gösterilen: <span className="font-semibold">
                {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredMaterials.length)}
              </span>
              {selectedMaterials.length > 0 && (
                <span className="ml-4 text-blue-600 font-semibold">
                  {selectedMaterials.length} malzeme seçili
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white/60 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 hover:bg-white/80 transition-all backdrop-blur-sm border border-white/20 disabled:border-gray-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {renderPageNumbers()}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white/60 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 hover:bg-white/80 transition-all backdrop-blur-sm border border-white/20 disabled:border-gray-200"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="text-sm text-gray-600">
              Kritik Stok: <span className="font-semibold text-red-600">
                {filteredMaterials.filter(m => m.currentStock <= m.minStock).length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modaller */}
      {(showAddModal || editingMaterial) && (
        <MaterialModal
          material={editingMaterial}
          categories={categories}
          suppliers={suppliers}
          onSave={editingMaterial ? 
            (updates) => handleUpdateMaterial(editingMaterial.id, updates) : 
            handleAddMaterial
          }
          onClose={() => {
            setShowAddModal(false);
            setEditingMaterial(null);
          }}
        />
      )}

      {showBarcodeScanner && (
        <BarcodeScannerModal
          onScan={handleBarcodeScan}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}

      {showExcelImport && (
        <ExcelImportModal
          onImport={handleExcelImport}
          onClose={() => setShowExcelImport(false)}
        />
      )}

      {selectedMaterial && (
        <MaterialDetailsModal
          material={selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
        />
      )}

      {quickEditMaterial && (
        <QuickEditModal
          material={quickEditMaterial}
          onSave={(updates) => handleUpdateMaterial(quickEditMaterial.id, updates)}
          onClose={() => setQuickEditMaterial(null)}
        />
      )}

      {showStatusChangeModal && (
        <StatusChangeModal
          selectedMaterials={materials.filter(m => selectedMaterials.includes(m.id))}
          onStatusChange={handleBulkStatusChange}
          onClose={() => setShowStatusChangeModal(false)}
        />
      )}
    </div>
  );
}

// Malzeme Modal Component - GÜNCELLENMİŞ (Manuel kategori/tedarikçi ekleme)
interface MaterialModalProps {
  material?: Material | null;
  categories: Category[];
  suppliers: Supplier[];
  onSave: (material: any) => void;
  onClose: () => void;
}

function MaterialModal({ material, categories, suppliers, onSave, onClose }: MaterialModalProps) {
  const [formData, setFormData] = useState({
    name: material?.name || '',
    barcode: material?.barcode || '',
    gtin: material?.gtin || '',
    sn: material?.sn || '',
    udiCode: material?.udiCode || '',
    allBarcode: material?.allBarcode || '',
    category: material?.category || '',
    subCategory: material?.subCategory || '',
    unit: material?.unit || 'adet',
    unitPrice: material?.unitPrice || 0,
    currentStock: material?.currentStock || 0,
    minStock: material?.minStock || 0,
    supplier: material?.supplier || '',
    expirationDate: material?.expirationDate || '',
    serialNoStatus: material?.serialNoStatus || '',
    materialDescription: material?.materialDescription || '',
    intuitiveCode: material?.intuitiveCode || '',
    serialNumber: material?.serialNumber || '',
    status: material?.status || 'normal',
  });

  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newSupplier, setNewSupplier] = useState('');

  const units = ['adet', 'kutu', 'şişe', 'tüp', 'paket', 'ampul', 'kg', 'lt', 'metre'];
  const statusOptions: MaterialStatus[] = ['normal', 'konsinye', 'iade', 'faturalı'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Lütfen malzeme adı giriniz!');
      return;
    }

    if (!formData.barcode.trim()) {
      formData.barcode = `AUTO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    onSave(formData);
  };

  const handleBarcodeScan = (barcode: string) => {
    setFormData({ ...formData, barcode });
    setShowBarcodeScanner(false);
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      const newCat: Omit<Category, 'id'> = {
        name: newCategory.trim(),
        description: '',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      dataService.saveCategory(newCat);
      setFormData({ ...formData, category: newCategory.trim() });
      setNewCategory('');
    }
  };

  const handleAddSupplier = () => {
    if (newSupplier.trim()) {
      const newSup: Omit<Supplier, 'id'> = {
        name: newSupplier.trim(),
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      dataService.saveSupplier(newSup);
      setFormData({ ...formData, supplier: newSupplier.trim() });
      setNewSupplier('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-md rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto border border-white/20">
        <h3 className="text-lg font-semibold mb-4">
          {material ? 'Malzeme Bilgilerini Düzenle' : 'Yeni Malzeme Ekle'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Malzeme Adı *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barkod
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="Boş bırakılırsa otomatik oluşturulur"
                />
                <button
                  type="button"
                  onClick={() => setShowBarcodeScanner(true)}
                  className="bg-gradient-to-r from-blue-600/90 to-blue-700/90 hover:from-blue-700/90 hover:to-blue-800/90 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-all backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl"
                >
                  <Camera className="h-4 w-4" />
                  <span>Tara</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GTIN
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.gtin}
                onChange={(e) => setFormData({ ...formData, gtin: e.target.value })}
                placeholder="GTIN numarası"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SN
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.sn}
                onChange={(e) => setFormData({ ...formData, sn: e.target.value })}
                placeholder="Seri numarası"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UDI Code
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.udiCode}
                onChange={(e) => setFormData({ ...formData, udiCode: e.target.value })}
                placeholder="UDI kodu"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                All Barcode
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.allBarcode}
                onChange={(e) => setFormData({ ...formData, allBarcode: e.target.value })}
                placeholder="Tüm barkodlar"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
                <button
                  type="button"
                  onClick={() => setNewCategory('')}
                  className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  + Yeni Ekle
                </button>
              </label>
              <div className="flex space-x-2">
                <select
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Kategori seçin</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
              {newCategory === '' && (
                <button
                  type="button"
                  onClick={() => setNewCategory('Yeni kategori...')}
                  className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  + Yeni Kategori Ekle
                </button>
              )}
              {newCategory !== '' && (
                <div className="mt-2 flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Yeni kategori adı"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Ekle
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCategory('')}
                    className="px-2 py-1 bg-gray-300 rounded text-sm hover:bg-gray-400"
                  >
                    İptal
                  </button>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt Kategori
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                placeholder="Alt kategori (isteğe bağlı)"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mevcut Stok
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birim Fiyat (₺)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birim
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kritik Stok
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tedarikçi
                <button
                  type="button"
                  onClick={() => setNewSupplier('')}
                  className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  + Yeni Ekle
                </button>
              </label>
              <div className="flex space-x-2">
                <select
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                >
                  <option value="">Tedarikçi seçin</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.name}>{supplier.name}</option>
                  ))}
                </select>
              </div>
              {newSupplier === '' && (
                <button
                  type="button"
                  onClick={() => setNewSupplier('Yeni tedarikçi...')}
                  className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  + Yeni Tedarikçi Ekle
                </button>
              )}
              {newSupplier !== '' && (
                <div className="mt-2 flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                    value={newSupplier}
                    onChange={(e) => setNewSupplier(e.target.value)}
                    placeholder="Yeni tedarikçi adı"
                  />
                  <button
                    type="button"
                    onClick={handleAddSupplier}
                    className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Ekle
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSupplier('')}
                    className="px-2 py-1 bg-gray-300 rounded text-sm hover:bg-gray-400"
                  >
                    İptal
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKT
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seri No Durumu
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.serialNoStatus}
                onChange={(e) => setFormData({ ...formData, serialNoStatus: e.target.value })}
              >
                <option value="">Seçiniz</option>
                <option value="Aktif">Aktif</option>
                <option value="Pasif">Pasif</option>
                <option value="İade">İade</option>
                <option value="Hurda">Hurda</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statü
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as MaterialStatus })}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sezgisel Kod
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.intuitiveCode}
                onChange={(e) => setFormData({ ...formData, intuitiveCode: e.target.value })}
                placeholder="Sezgisel kod"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seri Numarası
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="Seri numarası"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Malzeme Açıklama
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
              value={formData.materialDescription}
              onChange={(e) => setFormData({ ...formData, materialDescription: e.target.value })}
              placeholder="Malzeme açıklaması"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600/90 to-blue-700/90 hover:from-blue-700/90 hover:to-blue-800/90 text-white py-2 px-4 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl"
            >
              {material ? 'Güncelle' : 'Ekle'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300/80 hover:bg-gray-400/80 text-gray-700 py-2 px-4 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/20"
            >
              İptal
            </button>
          </div>
        </form>

        {showBarcodeScanner && (
          <BarcodeScannerModal
            onScan={handleBarcodeScan}
            onClose={() => setShowBarcodeScanner(false)}
          />
        )}
      </div>
    </div>
  );
}