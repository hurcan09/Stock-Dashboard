import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Trash2, Edit2, Package, Filter, Download, 
  Barcode, Camera, X, Upload, Eye, Calendar, FileText, 
  ClipboardList, ChevronLeft, ChevronRight, CheckSquare, 
  Square, Check, MoveHorizontal, ArrowRight, ExternalLink,
  MoreVertical, Copy, Printer, QrCode, AlertTriangle,
  RefreshCw, Save, Star, Shield, Lock, Unlock,
  BarChart3, TrendingUp, TrendingDown, PackageOpen,
  Layers, Grid3X3, List, Grid, Menu, MoreHorizontal,
  ArrowUp, ArrowDown, Tag, Truck
} from 'lucide-react';
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
    <div className="modal-overlay">
      <div className="modal-container w-full max-w-md mx-4">
        <div className="p-6">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Camera className="h-4 w-4" />
                  <span>{scanning ? 'Kamerayı Kapat' : 'Kamerayı Aç'}</span>
                </button>
                <button
                  type="submit"
                  disabled={!manualBarcode.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-all"
                >
                  Tamam
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Kategori Ekleme Modalı
function AddCategoryModal({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      alert('Lütfen kategori adı giriniz!');
      return;
    }

    const newCategory: Omit<Category, 'id'> = {
      name: categoryName.trim(),
      description: description.trim(),
      isActive: true,
      createdAt: new Date().toISOString()
    };

    dataService.saveCategory(newCategory);
    onSave();
    onClose();
    alert('Kategori başarıyla eklendi!');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Yeni Kategori Ekle</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori Adı *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Kategori adını girin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Kategori açıklaması (isteğe bağlı)"
                rows={3}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 px-4 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              >
                Kategori Ekle
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-all"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Tedarikçi Ekleme Modalı
function AddSupplierModal({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  const [supplierName, setSupplierName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      alert('Lütfen tedarikçi adı giriniz!');
      return;
    }

    const newSupplier: Omit<Supplier, 'id'> = {
      name: supplierName.trim(),
      contactPerson: contactPerson.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      isActive: true,
      createdAt: new Date().toISOString()
    };

    dataService.saveSupplier(newSupplier);
    onSave();
    onClose();
    alert('Tedarikçi başarıyla eklendi!');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Yeni Tedarikçi Ekle</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tedarikçi Adı *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Tedarikçi adını girin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yetkili Kişi
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Yetkili kişi adı"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Telefon numarası"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-posta
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adres
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Adres"
                rows={3}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 px-4 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              >
                Tedarikçi Ekle
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-all"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Toplu Düzenleme Modal Component - Sistem Yöneticisi için
function BulkEditModal({ 
  selectedMaterials, 
  onSave, 
  onClose 
}: { 
  selectedMaterials: Material[];
  onSave: (materialIds: string[], updates: { field: string; value: any }[]) => void;
  onClose: () => void;
}) {
  const [edits, setEdits] = useState<{ field: string; value: any }[]>([]);
  const [field, setField] = useState('unitPrice');
  const [value, setValue] = useState('');

  const currentUser = dataService.getCurrentUser();
  const isSystemAdmin = currentUser.role === 'admin' || currentUser.permissions.manageMaterials;

  if (!isSystemAdmin) {
    return (
      <div className="modal-overlay">
        <div className="modal-container w-full max-w-md mx-4">
          <div className="p-6">
            <div className="text-center py-8">
              <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">Yetki Gerekli</h3>
              <p className="text-gray-600">Bu işlemi yapmak için sistem yöneticisi yetkisine sahip olmalısınız.</p>
              <button
                onClick={onClose}
                className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-6 rounded-lg font-medium transition-all"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAddEdit = () => {
    if (!field.trim() || value === '') return;
    
    const newEdit = { field, value: parseValue(field, value) };
    setEdits([...edits, newEdit]);
    setField('unitPrice');
    setValue('');
  };

  const parseValue = (field: string, value: string) => {
    switch (field) {
      case 'unitPrice':
        return parseFloat(value);
      case 'currentStock':
      case 'minStock':
        return parseInt(value);
      default:
        return value;
    }
  };

  const handleRemoveEdit = (index: number) => {
    const newEdits = [...edits];
    newEdits.splice(index, 1);
    setEdits(newEdits);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (edits.length === 0) {
      alert('Lütfen en az bir düzenleme ekleyin!');
      return;
    }

    const materialIds = selectedMaterials.map(m => m.id);
    onSave(materialIds, edits);
    onClose();
  };

  const fieldOptions = [
    { value: 'unitPrice', label: 'Birim Fiyat (₺)', type: 'number' },
    { value: 'currentStock', label: 'Mevcut Stok', type: 'number' },
    { value: 'minStock', label: 'Kritik Stok', type: 'number' }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-container w-full max-w-2xl mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold">Toplu Düzenleme</h3>
              <p className="text-gray-600">{selectedMaterials.length} malzeme seçildi</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Seçili Malzemeler Listesi */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Seçili Malzemeler
              </h4>
              <div className="max-h-40 overflow-y-auto">
                {selectedMaterials.slice(0, 10).map((material, index) => (
                  <div key={material.id} className="flex items-center justify-between py-2 border-b border-blue-100 last:border-0">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{material.name}</div>
                      <div className="text-xs text-gray-600">{material.barcode}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div>Stok: {material.currentStock}</div>
                      <div>Fiyat: ₺{material.unitPrice.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
                {selectedMaterials.length > 10 && (
                  <div className="text-center text-sm text-blue-600 pt-2">
                    ...ve {selectedMaterials.length - 10} malzeme daha
                  </div>
                )}
              </div>
            </div>

            {/* Düzenleme Alanı */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-4">Düzenlemeleri Ekleyin</h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alan
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={field}
                      onChange={(e) => setField(e.target.value)}
                    >
                      {fieldOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Değer
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type={fieldOptions.find(f => f.value === field)?.type || 'text'}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={
                          field === 'unitPrice' ? 'Örn: 25.50' :
                          field === 'currentStock' ? 'Örn: 100' :
                          'Örn: 10'
                        }
                      />
                      <button
                        type="button"
                        onClick={handleAddEdit}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Ekle</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Eklenen Düzenlemeler */}
                {edits.length > 0 && (
                  <div className="border-t pt-4">
                    <h5 className="font-semibold text-gray-700 mb-2">Eklenen Düzenlemeler:</h5>
                    <div className="space-y-2">
                      {edits.map((edit, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div>
                            <span className="font-medium">
                              {fieldOptions.find(f => f.value === edit.field)?.label}
                            </span>
                            <span className="ml-2">→</span>
                            <span className="ml-2 font-semibold text-blue-600">
                              {typeof edit.value === 'number' && edit.field === 'unitPrice' ? '₺' : ''}
                              {edit.value}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveEdit(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Uyarı */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Önemli!</h4>
                  <p className="text-sm text-yellow-700">
                    Bu işlem {selectedMaterials.length} malzemenin seçili alanlarını güncelleyecektir.
                    Değişiklikler geri alınamaz. Lütfen emin olun.
                  </p>
                </div>
              </div>
            </div>

            {/* Butonlar */}
            <div className="flex space-x-3">
              <button
                onClick={handleSubmit}
                disabled={edits.length === 0}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              >
                Toplu Güncelleme Yap
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg font-medium transition-all"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hızlı Düzenleme Modal Component
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
    <div className="modal-overlay">
      <div className="modal-container w-full max-w-6xl mx-4">
        <div className="p-6">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={formData.intuitiveCode}
                  onChange={(e) => setFormData({ ...formData, intuitiveCode: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statü
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                  Kategori *
                </label>
                <div className="flex space-x-2">
                  <select
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Kategori seçin *</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setNewCategory('Yeni kategori...')}
                  className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  + Yeni Kategori Ekle
                </button>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={formData.subCategory}
                  onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tedarikçi *
                </label>
                <div className="flex space-x-2">
                  <select
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    required
                  >
                    <option value="">Tedarikçi seçin *</option>
                    {suppliers.map(sup => (
                      <option key={sup.id} value={sup.name}>{sup.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setNewSupplier('Yeni tedarikçi...')}
                  className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  + Yeni Tedarikçi Ekle
                </button>
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
                  Birim *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                >
                  <option value="">Birim seçin *</option>
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
                  Mevcut Stok *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kritik Stok *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Birim Fiyat (₺) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={formData.materialDescription}
                  onChange={(e) => setFormData({ ...formData, materialDescription: e.target.value })}
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 px-4 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              >
                Kaydet
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-all"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Malzeme Detay Modal Component
function MaterialDetailsModal({ material, onClose }: { material: Material; onClose: () => void }) {
  const [stockCounts, setStockCounts] = useState<StockCount[]>([]);
  const [sessions, setSessions] = useState<StockCountSession[]>([]);

  useEffect(() => {
    if (material) {
      const allCounts = dataService.getStockCounts();
      const allSessions = dataService.getStockCountSessions();
      
      const materialCounts = allCounts.filter(count => 
        count.barcode === material.barcode ||
        count.materialId === material.id
      );
      
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
    <div className="modal-overlay">
      <div className="modal-container w-full max-w-4xl mx-4">
        <div className="p-6">
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
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-6 rounded-lg font-medium transition-all"
            >
              Kapat
            </button>
          </div>
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
    <div className="modal-overlay">
      <div className="modal-container w-full max-w-2xl mx-4">
        <div className="p-6">
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
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
                    : 'border-gray-300 bg-white hover:border-blue-500'
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
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-all"
              >
                İptal
              </button>
              <button
                onClick={handleImport}
                disabled={!file || isImporting || validationErrors.length > 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-all"
              >
                {isImporting ? 'Aktarılıyor...' : 'İçe Aktar'}
              </button>
            </div>
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
    <div className="modal-overlay">
      <div className="modal-container w-full max-w-md mx-4">
        <div className="p-6">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 px-4 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              >
                Değiştir
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-all"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Yeni Malzeme Ekleme Modalı - Güncellenmiş (Kaydırma Çubuğu Sağda)
function NewMaterialModal({ onSave, onClose }: { onSave: (material: any) => void; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    gtin: '',
    sn: '',
    udiCode: '',
    allBarcode: '',
    category: '',
    subCategory: '',
    unit: '',
    unitPrice: 0,
    currentStock: 0,
    minStock: 0,
    supplier: '',
    expirationDate: '',
    serialNoStatus: '',
    materialDescription: '',
    intuitiveCode: '',
    status: 'normal' as MaterialStatus
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newSupplier, setNewSupplier] = useState('');

  const units = ['adet', 'kutu', 'şişe', 'tüp', 'paket', 'ampul', 'kg', 'lt', 'metre'];
  const statusOptions: MaterialStatus[] = ['normal', 'konsinye', 'iade', 'faturalı'];

  useEffect(() => {
    setCategories(dataService.getCategories());
    setSuppliers(dataService.getSuppliers());
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Malzeme adı zorunludur';
    if (!formData.barcode.trim()) newErrors.barcode = 'Barkod zorunludur';
    if (!formData.category) newErrors.category = 'Kategori zorunludur';
    if (!formData.supplier) newErrors.supplier = 'Tedarikçi zorunludur';
    if (!formData.unit) newErrors.unit = 'Birim zorunludur';
    if (formData.unitPrice <= 0) newErrors.unitPrice = 'Geçerli bir fiyat giriniz';
    if (formData.currentStock < 0) newErrors.currentStock = 'Stok 0\'dan küçük olamaz';
    if (formData.minStock < 0) newErrors.minStock = 'Kritik stok 0\'dan küçük olamaz';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
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

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden flex">
        {/* Sol Alan: Form İçeriği - Kaydırılabilir */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Yeni Malzeme Ekle</h3>
              <button 
                onClick={onClose} 
                className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Zorunlu Alanlar - Grid */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Zorunlu Alanlar
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Malzeme Adı */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Malzeme Adı *
                    </label>
                    <input
                      type="text"
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  {/* Barkod */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barkod *
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        required
                        className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                          errors.barcode ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={formData.barcode}
                        onChange={(e) => handleInputChange('barcode', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowBarcodeScanner(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
                        title="Barkod Tara"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    {errors.barcode && <p className="text-red-500 text-xs mt-1">{errors.barcode}</p>}
                  </div>

                  {/* Kategori */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori *
                    </label>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <select
                          className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                            errors.category ? 'border-red-300' : 'border-gray-300'
                          }`}
                          value={formData.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          required
                        >
                          <option value="">Kategori seçin *</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.name}>{category.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
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
                          className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Ekle
                        </button>
                      </div>
                    </div>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                  </div>

                  {/* Tedarikçi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tedarikçi *
                    </label>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <select
                          className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                            errors.supplier ? 'border-red-300' : 'border-gray-300'
                          }`}
                          value={formData.supplier}
                          onChange={(e) => handleInputChange('supplier', e.target.value)}
                          required
                        >
                          <option value="">Tedarikçi seçin *</option>
                          {suppliers.map(supplier => (
                            <option key={supplier.id} value={supplier.name}>{supplier.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
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
                          className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Ekle
                        </button>
                      </div>
                    </div>
                    {errors.supplier && <p className="text-red-500 text-xs mt-1">{errors.supplier}</p>}
                  </div>

                  {/* Birim */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Birim *
                    </label>
                    <select
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                        errors.unit ? 'border-red-300' : 'border-gray-300'
                      }`}
                      value={formData.unit}
                      onChange={(e) => handleInputChange('unit', e.target.value)}
                      required
                    >
                      <option value="">Birim seçin *</option>
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                    {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit}</p>}
                  </div>

                  {/* Birim Fiyat */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Birim Fiyat (₺) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                        errors.unitPrice ? 'border-red-300' : 'border-gray-300'
                      }`}
                      value={formData.unitPrice}
                      onChange={(e) => handleInputChange('unitPrice', Number(e.target.value))}
                    />
                    {errors.unitPrice && <p className="text-red-500 text-xs mt-1">{errors.unitPrice}</p>}
                  </div>
                </div>
              </div>

              {/* Stok Bilgileri */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Stok Bilgileri
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mevcut Stok *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                        errors.currentStock ? 'border-red-300' : 'border-gray-300'
                      }`}
                      value={formData.currentStock}
                      onChange={(e) => handleInputChange('currentStock', Number(e.target.value))}
                    />
                    {errors.currentStock && <p className="text-red-500 text-xs mt-1">{errors.currentStock}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kritik Stok *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                        errors.minStock ? 'border-red-300' : 'border-gray-300'
                      }`}
                      value={formData.minStock}
                      onChange={(e) => handleInputChange('minStock', Number(e.target.value))}
                    />
                    {errors.minStock && <p className="text-red-500 text-xs mt-1">{errors.minStock}</p>}
                  </div>
                </div>
              </div>

              {/* İsteğe Bağlı Alanlar */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  İsteğe Bağlı Alanlar
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* GTIN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GTIN
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={formData.gtin}
                      onChange={(e) => handleInputChange('gtin', e.target.value)}
                    />
                  </div>

                  {/* SN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SN
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={formData.sn}
                      onChange={(e) => handleInputChange('sn', e.target.value)}
                    />
                  </div>

                  {/* UDI Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UDI Code
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={formData.udiCode}
                      onChange={(e) => handleInputChange('udiCode', e.target.value)}
                    />
                  </div>

                  {/* All Barcode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      All Barcode
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={formData.allBarcode}
                      onChange={(e) => handleInputChange('allBarcode', e.target.value)}
                    />
                  </div>

                  {/* Alt Kategori */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alt Kategori
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={formData.subCategory}
                      onChange={(e) => handleInputChange('subCategory', e.target.value)}
                    />
                  </div>

                  {/* SKT */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKT
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={formData.expirationDate}
                      onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                    />
                  </div>

                  {/* Seri No Durumu */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seri No Durumu
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={formData.serialNoStatus}
                      onChange={(e) => handleInputChange('serialNoStatus', e.target.value)}
                    />
                  </div>

                  {/* Sezgisel Kod */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sezgisel Kod
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={formData.intuitiveCode}
                      onChange={(e) => handleInputChange('intuitiveCode', e.target.value)}
                    />
                  </div>

                  {/* Statü */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statü
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  {/* Malzeme Açıklama */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Malzeme Açıklama
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={formData.materialDescription}
                      onChange={(e) => handleInputChange('materialDescription', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Sağ Alan: Kaydırma Çubuğu ve Butonlar */}
        <div className="w-6 bg-gray-100 border-l border-gray-200">
          {/* Kaydırma Çubuğu - Dikey */}
          <div className="h-full flex items-center justify-center">
            <div className="w-1.5 h-32 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        {/* Alt Butonlar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center space-x-2">
                <Save className="h-5 w-5" />
                <span>Malzeme Ekle</span>
              </div>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg font-medium transition-all"
            >
              İptal
            </button>
          </div>
        </div>
      </div>

      {showBarcodeScanner && (
        <BarcodeScannerModal
          onScan={handleBarcodeScan}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}
    </div>
  );
}

// Malzeme Modal Component
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
    <div className="modal-overlay">
      <div className="modal-container w-full max-w-4xl mx-4">
        <div className="p-6">
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
                  className="input-modern"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Barkod *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="input-modern flex-1"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="Barkod giriniz"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowBarcodeScanner(true)}
                    className="btn-modern"
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
                  Kategori *
                </label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <select
                      className="input-modern flex-1"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      <option value="">Kategori seçin *</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.name}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
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
                      className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tedarikçi *
                </label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <select
                      className="input-modern flex-1"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      required
                    >
                      <option value="">Tedarikçi seçin *</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.name}>{supplier.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
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
                      className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Birim *
                </label>
                <select
                  className="input-modern"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                >
                  <option value="">Birim seçin *</option>
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mevcut Stok *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  className="input-modern"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Birim Fiyat (₺) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="input-modern"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kritik Stok *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  className="input-modern"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statü
                </label>
                <select
                  className="input-modern"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as MaterialStatus })}
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="btn-modern flex-1"
              >
                {material ? 'Güncelle' : 'Ekle'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-modern-secondary flex-1"
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
    </div>
  );
}

export default function MaterialManagement() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNewMaterialModal, setShowNewMaterialModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [quickEditMaterial, setQuickEditMaterial] = useState<Material | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [showSelectAll, setShowSelectAll] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const currentUser = dataService.getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedMaterials = dataService.getMaterials();
    const loadedCategories = dataService.getCategories();
    const loadedSuppliers = dataService.getSuppliers();
    
    console.log('Yüklenen malzemeler:', loadedMaterials.length);
    console.log('Yüklenen kategoriler:', loadedCategories.length);
    console.log('Yüklenen tedarikçiler:', loadedSuppliers.length);
    
    setMaterials(loadedMaterials);
    setCategories(loadedCategories);
    setSuppliers(loadedSuppliers);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setLowStockOnly(false);
    setSelectedStatus('all');
    setSelectedMaterials([]);
    setShowSelectAll(false);
    setCurrentPage(1);
    setSortConfig(null);
  };

  // Sıralama fonksiyonu
  const sortMaterials = (materialsToSort: Material[]) => {
    if (!sortConfig) return materialsToSort;
    
    return [...materialsToSort].sort((a, b) => {
      let aValue: any = a;
      let bValue: any = b;
      
      const keyPath = sortConfig.key.split('.');
      keyPath.forEach(key => {
        aValue = aValue[key];
        bValue = bValue[key];
      });
      
      // Eğer değerler undefined ise null olarak değerlendir
      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';
      
      // Sayısal değerler için kontrol
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Tarih için kontrol
      if (sortConfig.key.includes('Date') || sortConfig.key.includes('date')) {
        const dateA = new Date(aValue).getTime();
        const dateB = new Date(bValue).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // String değerler için
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredMaterials = sortMaterials(materials.filter(material => {
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
  }));

  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMaterials = filteredMaterials.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  };

  const handleAddMaterial = (materialData: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('Malzeme ekleniyor:', materialData);
    
    try {
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
      setShowNewMaterialModal(false);
      alert('Malzeme başarıyla eklendi!');
    } catch (error) {
      console.error('Malzeme ekleme hatası:', error);
      alert('Malzeme eklenirken bir hata oluştu!');
    }
  };

  const handleUpdateMaterial = (id: string, updates: Partial<Material>) => {
    console.log('Malzeme güncelleniyor:', id, updates);
    
    try {
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
      alert('Malzeme başarıyla güncellendi!');
    } catch (error) {
      console.error('Malzeme güncelleme hatası:', error);
      alert('Malzeme güncellenirken bir hata oluştu!');
    }
  };

  const handleBulkUpdate = (materialIds: string[], updates: { field: string; value: any }[]) => {
    materialIds.forEach(materialId => {
      const updateData: any = {};
      updates.forEach(edit => {
        updateData[edit.field] = edit.value;
      });
      dataService.updateMaterial(materialId, updateData);
    });
    
    dataService.logAction({
      action: 'TOPLU_MALZEME_GÜNCELLEME',
      module: 'MALZEME_YÖNETİMİ',
      recordId: 'TOPLU_GÜNCELLEME',
      details: `${materialIds.length} malzeme toplu güncellendi`,
      performedBy: dataService.getCurrentUser().name,
    });
    
    loadData();
    setSelectedMaterials([]);
    setShowSelectAll(false);
    alert(`${materialIds.length} malzeme başarıyla güncellendi.`);
  };

  const handleDeleteMaterial = (id: string) => {
    const material = materials.find(m => m.id === id);
    if (confirm(`"${material?.name}" malzemesini silmek istediğinizden emin misiniz?`)) {
      try {
        dataService.deleteMaterial(id);
        
        dataService.logAction({
          action: 'MALZEME_SİLİNDİ',
          module: 'MALZEME_YÖNETİMİ',
          recordId: material?.barcode || id,
          details: `${material?.name} malzemesi silindi - Barkod: ${material?.barcode}`,
          performedBy: dataService.getCurrentUser().name,
        });

        loadData();
        alert('Malzeme başarıyla silindi!');
      } catch (error) {
        console.error('Malzeme silme hatası:', error);
        alert('Malzeme silinirken bir hata oluştu!');
      }
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
      return <span className="material-status-badge bg-red-100 text-red-800">Stok Yok</span>;
    } else if (material.currentStock <= material.minStock) {
      return <span className="material-status-badge bg-yellow-100 text-yellow-800">Kritik Stok</span>;
    } else {
      return <span className="material-status-badge bg-green-100 text-green-800">Yeterli Stok</span>;
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
      <span className={`material-status-badge ${colors[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUp className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-3 w-3 text-blue-600" />
      : <ArrowDown className="h-3 w-3 text-blue-600" />;
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
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }
    
    return pages;
  };

  return (
    <div className="material-grid-layout">
      {/* Üst Bar - Kompakt */}
      <div className="material-toolbar">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-bold text-gray-800">Malzeme Yönetimi</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Package className="h-4 w-4" />
            <span>Toplam: <span className="font-semibold">{filteredMaterials.length}</span></span>
            {filteredMaterials.length !== materials.length && (
              <>
                <span className="text-gray-400">|</span>
                <span className="text-blue-600">Filtrelenmiş</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Kategori Ekle Butonu */}
          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="btn-modern-secondary text-sm"
          >
            <Tag className="h-4 w-4" />
            <span>Kategori Ekle</span>
          </button>
          
          {/* Tedarikçi Ekle Butonu */}
          <button
            onClick={() => setShowAddSupplierModal(true)}
            className="btn-modern-secondary text-sm"
          >
            <Truck className="h-4 w-4" />
            <span>Tedarikçi Ekle</span>
          </button>
          
          <button
            onClick={() => setShowExcelImport(true)}
            className="btn-modern-secondary text-sm"
          >
            <Upload className="h-4 w-4" />
            <span>Excel İçe Aktar</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="btn-modern-secondary text-sm"
          >
            <Download className="h-4 w-4" />
            <span>Excel İndir</span>
          </button>
          <button
            onClick={() => setShowBarcodeScanner(true)}
            className="btn-modern-secondary text-sm"
          >
            <Camera className="h-4 w-4" />
            <span>Barkod Tara</span>
          </button>
          <button
            onClick={() => setShowNewMaterialModal(true)}
            className="btn-modern text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Yeni Malzeme</span>
          </button>
        </div>
      </div>

      {/* Arama ve Filtreler */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="material-search-bar">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Malzeme adı, barkod, GTIN, SN, kategori veya tedarikçi ara..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Tüm Statüler</option>
              <option value="normal">Normal</option>
              <option value="konsinye">Konsinye</option>
              <option value="iade">İade</option>
              <option value="faturalı">Faturalı</option>
            </select>
            
            <label className="flex items-center space-x-2 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200 text-sm cursor-pointer hover:bg-yellow-100 transition-colors">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
                className="rounded text-yellow-600 focus:ring-yellow-500 h-4 w-4"
              />
              <span className="text-yellow-800 font-medium">Kritik Stok</span>
            </label>
            
            <button
              type="submit"
              className="btn-modern text-sm"
            >
              <Search className="h-4 w-4" />
              <span>Ara</span>
            </button>
            
            {(searchTerm || selectedCategory !== 'all' || lowStockOnly || selectedStatus !== 'all') && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
              >
                <X className="h-4 w-4" />
                <span>Filtreleri Temizle</span>
              </button>
            )}
          </div>
          
          {selectedMaterials.length > 0 && (
            <div className="material-bulk-actions">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-800 text-sm">
                    {selectedMaterials.length} malzeme seçildi
                  </span>
                </div>
                
                {/* Sistem Yöneticisi için Toplu Düzenleme Butonu */}
                {(currentUser.role === 'admin' || currentUser.permissions.manageMaterials) && (
                  <button
                    onClick={() => setShowBulkEditModal(true)}
                    className="btn-modern text-sm"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Toplu Düzenle (Fiyat/Stok)</span>
                  </button>
                )}
                
                <button
                  onClick={() => setShowStatusChangeModal(true)}
                  className="btn-modern text-sm"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Statü Değiştir</span>
                </button>
                
                <button
                  onClick={() => {
                    setSelectedMaterials([]);
                    setShowSelectAll(false);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Seçimi Temizle
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Tablo Container - Yatay ve dikey kaydırma */}
      <div className="material-table-container">
        {/* Kaydırma yönlendirmesi */}
        <div className="material-table-scroll-hint">
          <div className="flex items-center justify-center space-x-2 text-blue-800 text-sm">
            <MoveHorizontal className="h-4 w-4 animate-pulse" />
            <span className="font-medium">Sağa kaydırarak tüm sütunları görebilirsiniz</span>
            <ArrowRight className="h-4 w-4 animate-pulse" />
          </div>
        </div>

        {/* Tablo wrapper */}
        <div className="material-table-wrapper" ref={tableContainerRef}>
          <table className="material-table">
            <thead>
              <tr>
                {/* Checkbox Sütunu - Sabit */}
                <th className="sticky-left" style={{ width: '50px' }}>
                  <div className="column-header">
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 transition-colors"
                      title={showSelectAll ? "Tümünü Kaldır" : "Tümünü Seç"}
                    >
                      {showSelectAll ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </th>
                
                {/* Barkod - Sıralanabilir */}
                <th style={{ width: '150px' }}>
                  <div className="column-header">
                    <button 
                      className="column-header-button group"
                      onClick={() => handleSort('barcode')}
                    >
                      <span className="column-header-text">Barkod</span>
                      {getSortIcon('barcode')}
                    </button>
                  </div>
                </th>
                
                {/* GTIN */}
                <th style={{ width: '120px' }}>
                  <div className="column-header">
                    <button 
                      className="column-header-button group"
                      onClick={() => handleSort('gtin')}
                    >
                      <span className="column-header-text">GTIN</span>
                      {getSortIcon('gtin')}
                    </button>
                  </div>
                </th>
                
                {/* SN */}
                <th style={{ width: '120px' }}>
                  <div className="column-header">
                    <button 
                      className="column-header-button group"
                      onClick={() => handleSort('sn')}
                    >
                      <span className="column-header-text">SN</span>
                      {getSortIcon('sn')}
                    </button>
                  </div>
                </th>
                
                {/* UDI Code */}
                <th style={{ width: '120px' }}>
                  <div className="column-header">
                    <button 
                      className="column-header-button group"
                      onClick={() => handleSort('udiCode')}
                    >
                      <span className="column-header-text">UDI Code</span>
                      {getSortIcon('udiCode')}
                    </button>
                  </div>
                </th>
                
                {/* All Barcode */}
                <th style={{ width: '140px' }}>
                  <div className="column-header">
                    <button 
                      className="column-header-button group"
                      onClick={() => handleSort('allBarcode')}
                    >
                      <span className="column-header-text">All Barcode</span>
                      {getSortIcon('allBarcode')}
                    </button>
                  </div>
                </th>
                
                {/* Malzeme Adı - Sıralanabilir */}
                <th style={{ width: '200px' }}>
                  <div className="column-header">
                    <button 
                      className="column-header-button group"
                      onClick={() => handleSort('name')}
                    >
                      <span className="column-header-text">Malzeme</span>
                      {getSortIcon('name')}
                    </button>
                  </div>
                </th>
                
                {/* Sezgisel Kod */}
                <th style={{ width: '120px' }}>
                  <div className="column-header">
                    <button 
                      className="column-header-button group"
                      onClick={() => handleSort('intuitiveCode')}
                    >
                      <span className="column-header-text">Sezgisel Kod</span>
                      {getSortIcon('intuitiveCode')}
                    </button>
                  </div>
                </th>
                
                {/* Statü - Sıralanabilir */}
                <th style={{ width: '100px' }}>
                  <div className="column-header">
                    <button 
                      className="column-header-button group"
                      onClick={() => handleSort('status')}
                    >
                      <span className="column-header-text">Statü</span>
                      {getSortIcon('status')}
                    </button>
                  </div>
                </th>
                
                {/* Kategori - Sıralanabilir */}
                <th style={{ width: '120px' }}>
                  <div className="column-header">
                    <button 
                      className="column-header-button group"
                      onClick={() => handleSort('category')}
                    >
                      <span className="column-header-text">Kategori</span>
                      {getSortIcon('category')}
                    </button>
                  </div>
                </th>
                
                {/* Alt Kategori */}
                <th style={{ width: '120px' }}>
                  <div className="column-header">
                    <button 
                      className="column-header-button group"
                      onClick={() => handleSort('subCategory')}
                    >
                      <span className="column-header-text">Alt Kategori</span>
                      {getSortIcon('subCategory')}
                    </button>
                  </div>
                </th>
                
                {/* Birim - Sıralanabilir */}
                <th style={{ width: '80px' }}>
                  <div className="column-header">
                    <button 
                      className="column-header-button group"
                      onClick={() => handleSort('unit')}
                    >
                      <span className="column-header-text">Birim</span>
                      {getSortIcon('unit')}
                    </button>
                  </div>
                </th>
                
                {/* Birim Fiyat - Sıralanabilir */}
                <th style={{ width: '100px' }}>
                  <div className="column-header">
                    <button 
                      className="column-header-button group"
                      onClick={() => handleSort('unitPrice')}
                    >
                      <span className="column-header-text">Birim Fiyat</span>
                      {getSortIcon('unitPrice')}
                    </button>
                  </div>
                </th>
                
                {/* Mevcut Stok - Sıralanabilir */}
                <th style={{ width: '100px' }}>
                  <div className="column-header">
                    <button 
                      className="column-header-button group"
                      onClick={() => handleSort('currentStock')}
                    >
                      <span className="column-header-text">Mevcut Stok</span>
                      {getSortIcon('currentStock')}
                    </button>
                  </div>
                </th>
                
                {/* Kritik Stok - Sıralanabilir */}
                <th style={{ width: '100px' }}>
                  <div className="column-header">
                    <button 
                      className="column-header-button group"
                      onClick={() => handleSort('minStock')}
                    >
                      <span className="column-header-text">Kritik Stok</span>
                      {getSortIcon('minStock')}
                    </button>
                  </div>
                </th>
                
                {/* Stok Durumu */}
                <th style={{ width: '120px' }}>
                  <div className="column-header">
                    <span className="column-header-text">Stok Durumu</span>
                  </div>
                </th>
                
                {/* Tedarikçi - Sıralanabilir */}
                <th style={{ width: '150px' }}>
                  <div className="column-header">
                    <button 
                      className="column-header-button group"
                      onClick={() => handleSort('supplier')}
                    >
                      <span className="column-header-text">Tedarikçi</span>
                      {getSortIcon('supplier')}
                    </button>
                  </div>
                </th>
                
                {/* SKT - Sıralanabilir */}
                <th style={{ width: '100px' }}>
                  <div className="column-header">
                    <button 
                      className="column-header-button group"
                      onClick={() => handleSort('expirationDate')}
                    >
                      <span className="column-header-text">SKT</span>
                      {getSortIcon('expirationDate')}
                    </button>
                  </div>
                </th>
                
                {/* Seri No Durumu */}
                <th style={{ width: '140px' }}>
                  <div className="column-header">
                    <button 
                      className="column-header-button group"
                      onClick={() => handleSort('serialNoStatus')}
                    >
                      <span className="column-header-text">Seri No Durumu</span>
                      {getSortIcon('serialNoStatus')}
                    </button>
                  </div>
                </th>
                
                {/* Malzeme Açıklama */}
                <th style={{ width: '200px' }}>
                  <div className="column-header">
                    <button 
                      className="column-header-button group"
                      onClick={() => handleSort('materialDescription')}
                    >
                      <span className="column-header-text">Açıklama</span>
                      {getSortIcon('materialDescription')}
                    </button>
                  </div>
                </th>
                
                {/* İşlemler - Sabit */}
                <th className="sticky-right" style={{ width: '120px' }}>
                  <div className="column-header">
                    <span className="column-header-text">İşlemler</span>
                  </div>
                </th>
              </tr>
            </thead>
            
            <tbody>
              {currentMaterials.map((material, index) => (
                <tr key={material.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  {/* Checkbox - Sabit */}
                  <td className="sticky-left">
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes(material.id)}
                      onChange={(e) => handleMaterialSelect(material.id, e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                  </td>
                  
                  {/* Barkod */}
                  <td>
                    <div className="group relative">
                      <button
                        onClick={(e) => handleQuickEditClick(material, e)}
                        className="flex items-center space-x-2 hover:text-blue-600 transition-colors text-left w-full"
                      >
                        <Barcode className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="font-mono text-sm column-cell">
                          {material.barcode}
                        </span>
                      </button>
                    </div>
                  </td>
                  
                  {/* GTIN */}
                  <td>
                    <span className="font-mono text-sm column-cell">
                      {material.gtin || '-'}
                    </span>
                  </td>
                  
                  {/* SN */}
                  <td>
                    <div className="group relative">
                      <span className="font-mono text-sm column-cell">
                        {material.sn || '-'}
                      </span>
                    </div>
                  </td>
                  
                  {/* UDI Code */}
                  <td>
                    <span className="font-mono text-sm column-cell">
                      {material.udiCode || '-'}
                    </span>
                  </td>
                  
                  {/* All Barcode */}
                  <td>
                    <span className="font-mono text-sm column-cell">
                      {material.allBarcode || '-'}
                    </span>
                  </td>
                  
                  {/* Malzeme Adı */}
                  <td>
                    <div className="group relative">
                      <button
                        onClick={() => handleMaterialClick(material)}
                        className="flex items-center space-x-2 hover:text-blue-600 transition-colors text-left w-full"
                      >
                        <Package className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-sm column-cell">
                          {material.name}
                        </span>
                      </button>
                    </div>
                  </td>
                  
                  {/* Sezgisel Kod */}
                  <td>
                    <div className="group relative">
                      <span className="text-gray-600 text-sm column-cell">
                        {material.intuitiveCode || '-'}
                      </span>
                    </div>
                  </td>
                  
                  {/* Statü */}
                  <td>
                    {getStatusBadge(material.status || 'normal')}
                  </td>
                  
                  {/* Kategori */}
                  <td>
                    <span className="text-sm text-gray-600 column-cell">
                      {material.category}
                    </span>
                  </td>
                  
                  {/* Alt Kategori */}
                  <td>
                    <span className="text-sm text-gray-600 column-cell">
                      {material.subCategory || '-'}
                    </span>
                  </td>
                  
                  {/* Birim */}
                  <td>
                    <span className="text-sm text-gray-600 column-cell">
                      {material.unit}
                    </span>
                  </td>
                  
                  {/* Birim Fiyat */}
                  <td>
                    <span className="text-sm font-medium text-gray-700 column-cell">
                      ₺{material.unitPrice.toFixed(2)}
                    </span>
                  </td>
                  
                  {/* Mevcut Stok */}
                  <td>
                    <span className={`text-sm font-medium column-cell ${
                      material.currentStock === 0 ? 'text-red-600' :
                      material.currentStock <= material.minStock ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {material.currentStock}
                    </span>
                  </td>
                  
                  {/* Kritik Stok */}
                  <td>
                    <span className="text-sm text-gray-600 column-cell">
                      {material.minStock}
                    </span>
                  </td>
                  
                  {/* Stok Durumu */}
                  <td>
                    {getStockStatusBadge(material)}
                  </td>
                  
                  {/* Tedarikçi */}
                  <td>
                    <span className="text-sm text-gray-600 column-cell">
                      {material.supplier || '-'}
                    </span>
                  </td>
                  
                  {/* SKT */}
                  <td>
                    {material.expirationDate ? (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{material.expirationDate}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  
                  {/* Seri No Durumu */}
                  <td>
                    <span className="text-sm text-gray-600 column-cell">
                      {material.serialNoStatus || '-'}
                    </span>
                  </td>
                  
                  {/* Malzeme Açıklama */}
                  <td>
                    <span className="text-sm text-gray-600 column-cell truncate" title={material.materialDescription || ''}>
                      {material.materialDescription || '-'}
                    </span>
                  </td>
                  
                  {/* İşlemler - Sabit */}
                  <td className="sticky-right">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleMaterialClick(material)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="Detayları Görüntüle"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingMaterial(material)}
                        className="p-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded transition-colors"
                        title="Tam Düzenle"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(material.id)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {currentMaterials.length === 0 && (
                <tr>
                  <td colSpan={21} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="h-16 w-16 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Malzeme bulunamadı</h3>
                      <p className="text-gray-500 text-sm mb-4 max-w-md">
                        {searchTerm || selectedCategory !== 'all' || lowStockOnly || selectedStatus !== 'all'
                          ? 'Arama kriterlerinize uygun malzeme bulunamadı.'
                          : 'Henüz hiç malzeme eklenmemiş.'
                        }
                      </p>
                      {(searchTerm || selectedCategory !== 'all' || lowStockOnly || selectedStatus !== 'all') && (
                        <button
                          onClick={clearAllFilters}
                          className="btn-modern"
                        >
                          Filtreleri Temizle
                        </button>
                      )}
                      {!searchTerm && selectedCategory === 'all' && !lowStockOnly && selectedStatus === 'all' && (
                        <button
                          onClick={() => setShowNewMaterialModal(true)}
                          className="btn-modern"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          İlk Malzemeyi Ekle
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alt Bar - Sayfalama */}
      <div className="pagination-container">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Gösterilen: <span className="font-semibold">
              {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredMaterials.length)}
            </span> / <span className="font-semibold">{filteredMaterials.length}</span>
            {selectedMaterials.length > 0 && (
              <span className="ml-3 text-blue-600 font-semibold">
                {selectedMaterials.length} seçili
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="pagination-button"
              title="İlk Sayfa"
            >
              «
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
              title="Önceki Sayfa"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {renderPageNumbers()}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button"
              title="Sonraki Sayfa"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="pagination-button"
              title="Son Sayfa"
            >
              »
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Kritik Stok: <span className="font-semibold text-red-600">
              {filteredMaterials.filter(m => m.currentStock <= m.minStock).length}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sayfa başı:</span>
            <select
              className="page-size-selector"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
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

      {/* Yeni Malzeme Modalı */}
      {showNewMaterialModal && (
        <NewMaterialModal
          onSave={handleAddMaterial}
          onClose={() => setShowNewMaterialModal(false)}
        />
      )}

      {/* Kategori Ekleme Modalı */}
      {showAddCategoryModal && (
        <AddCategoryModal
          onSave={loadData}
          onClose={() => setShowAddCategoryModal(false)}
        />
      )}

      {/* Tedarikçi Ekleme Modalı */}
      {showAddSupplierModal && (
        <AddSupplierModal
          onSave={loadData}
          onClose={() => setShowAddSupplierModal(false)}
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

      {showBulkEditModal && (
        <BulkEditModal
          selectedMaterials={materials.filter(m => selectedMaterials.includes(m.id))}
          onSave={handleBulkUpdate}
          onClose={() => setShowBulkEditModal(false)}
        />
      )}
    </div>
  );
}