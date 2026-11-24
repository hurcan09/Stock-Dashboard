import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, FileText, Trash2, Eye, Edit2, Filter, Download, 
  Upload, X, Camera, Package, Tag, Calendar, DollarSign, 
  ChevronLeft, ChevronRight, AlertTriangle, CheckSquare, Square,
  Check, ExternalLink, Barcode, Truck, Shield
} from 'lucide-react';
import { Invoice, Material, InvoiceItem, MaterialStatus } from '../types';
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

// PDF Yükleme Modal Component
interface PdfUploadModalProps {
  invoice: Invoice;
  onUpload: (invoiceId: string, file: File) => Promise<void>;
  onClose: () => void;
  uploading: boolean;
}

function PdfUploadModal({ invoice, onUpload, onClose, uploading }: PdfUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        alert('Lütfen sadece PDF dosyası yükleyiniz!');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Lütfen bir PDF dosyası seçiniz!');
      return;
    }

    await onUpload(invoice.id, file);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">PDF Yükle</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Fatura: <span className="font-semibold">{invoice.invoiceNo}</span></p>
            <p className="text-sm text-gray-600">Tedarikçi: <span className="font-semibold">{invoice.supplierName}</span></p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF Dosyası Seç
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="mb-1 text-sm text-gray-500">
                    <span className="font-semibold">Dosya seçmek için tıklayın</span>
                  </p>
                  <p className="text-xs text-gray-500">PDF dosyası</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            {file && (
              <div className="mt-2 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {uploading ? 'Yükleniyor...' : 'PDF Yükle'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fatura Modal Component - YENİ: MaterialManagement'taki Temel Bilgiler ile
interface InvoiceModalProps {
  invoice?: Invoice | null;
  onSave: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

function InvoiceModal({ invoice, onSave, onClose }: InvoiceModalProps) {
  const [formData, setFormData] = useState({
    invoiceNo: invoice?.invoiceNo || `FTR-${Date.now()}`,
    supplierName: invoice?.supplierName || '',
    invoiceDate: invoice?.invoiceDate || new Date().toISOString().split('T')[0],
    stockCountId: invoice?.stockCountId || '',
    items: invoice?.items || []
  });

  const [materials, setMaterials] = useState<Material[]>([]);
  const [stockCounts, setStockCounts] = useState<any[]>([]);
  
  // Malzeme formu için state
  const [materialForm, setMaterialForm] = useState({
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

  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [autoFilled, setAutoFilled] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setMaterials(dataService.getMaterials());
    setStockCounts(dataService.getStockCounts());
    setCategories(dataService.getCategories());
    setSuppliers(dataService.getSuppliers());
  };

  // Barkod/GTIN/All Barcode ile malzeme ara ve otomatik doldur
  const searchMaterial = (field: string, value: string) => {
    if (!value.trim()) return;

    const foundMaterial = materials.find(material => 
      material.barcode === value ||
      material.gtin === value ||
      material.allBarcode === value
    );

    if (foundMaterial) {
      setMaterialForm({
        ...materialForm,
        name: foundMaterial.name,
        category: foundMaterial.category,
        subCategory: foundMaterial.subCategory || '',
        unit: foundMaterial.unit,
        unitPrice: foundMaterial.unitPrice,
        currentStock: foundMaterial.currentStock,
        minStock: foundMaterial.minStock,
        supplier: foundMaterial.supplier || '',
        barcode: foundMaterial.barcode,
        gtin: foundMaterial.gtin || '',
        udiCode: foundMaterial.udiCode || '',
        allBarcode: foundMaterial.allBarcode || '',
        intuitiveCode: foundMaterial.intuitiveCode || '',
        expirationDate: foundMaterial.expirationDate || '',
        serialNoStatus: foundMaterial.serialNoStatus || '',
        materialDescription: foundMaterial.materialDescription || '',
        status: foundMaterial.status || 'normal'
      });
      setAutoFilled(true);
      
      // SN alanını temizle (manuel giriş için)
      setTimeout(() => {
        setMaterialForm(prev => ({ ...prev, sn: '' }));
      }, 100);
    } else {
      setAutoFilled(false);
    }
  };

  const handleBarcodeScan = (barcode: string) => {
    setMaterialForm({ ...materialForm, barcode });
    setShowBarcodeScanner(false);
    searchMaterial('barcode', barcode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!materialForm.name.trim()) {
      alert('Lütfen malzeme adı giriniz!');
      return;
    }

    if (!materialForm.sn.trim()) {
      alert('Lütfen SN numarası giriniz!');
      return;
    }

    // Malzeme kaydet (mevcut değilse)
    let material = materials.find(m => 
      m.barcode === materialForm.barcode || 
      m.gtin === materialForm.gtin || 
      m.allBarcode === materialForm.allBarcode
    );

    if (!material) {
      const newMaterial: Omit<Material, 'id' | 'createdAt' | 'updatedAt'> = {
        name: materialForm.name,
        barcode: materialForm.barcode || `AUTO_${Date.now()}`,
        gtin: materialForm.gtin,
        sn: materialForm.sn,
        udiCode: materialForm.udiCode,
        allBarcode: materialForm.allBarcode,
        intuitiveCode: materialForm.intuitiveCode,
        category: materialForm.category,
        subCategory: materialForm.subCategory,
        unit: materialForm.unit || 'adet',
        unitPrice: materialForm.unitPrice,
        currentStock: materialForm.currentStock,
        minStock: materialForm.minStock,
        supplier: materialForm.supplier,
        expirationDate: materialForm.expirationDate,
        serialNoStatus: materialForm.serialNoStatus,
        materialDescription: materialForm.materialDescription,
        status: materialForm.status
      };
      
      dataService.saveMaterial(newMaterial);
      material = dataService.getMaterials().find(m => m.barcode === newMaterial.barcode);
    } else {
      // SN'yi güncelle
      dataService.updateMaterial(material.id, { sn: materialForm.sn });
    }

    if (!material) {
      alert('Malzeme kaydedilemedi!');
      return;
    }

    // Fatura ve stockCount kontrolü
    const matchingStockCount = stockCounts.find(count => 
      count.invoiceNo === formData.invoiceNo
    );

    const item: InvoiceItem = {
      id: `item-${Date.now()}`,
      materialId: material.id,
      quantity: 1,
      unitPrice: materialForm.unitPrice,
      totalPrice: materialForm.unitPrice
    };

    const items = [...formData.items, item];
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    const invoiceData: Omit<Invoice, 'id' | 'createdAt'> = {
      ...formData,
      items,
      totalAmount,
      stockCountId: matchingStockCount?.id || formData.stockCountId
    };

    onSave(invoiceData);
  };

  // Input değişiklikleri için handler
  const handleMaterialFormChange = (field: string, value: any) => {
    setMaterialForm({ ...materialForm, [field]: value });
    
    // Barkod alanları değiştiğinde malzeme ara
    if (['barcode', 'gtin', 'allBarcode'].includes(field) && value.trim()) {
      searchMaterial(field, value);
    }
  };

  const units = ['adet', 'kutu', 'şişe', 'tüp', 'paket', 'ampul', 'kg', 'lt', 'metre'];
  const statusOptions: MaterialStatus[] = ['normal', 'konsinye', 'iade', 'faturalı'];

  return (
    <div className="modal-overlay">
      <div className="modal-container w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">
              {invoice ? 'Fatura Düzenle' : 'Yeni Fatura Ekle'}
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Fatura Bilgileri */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Fatura Bilgileri
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fatura No *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.invoiceNo}
                    onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                    placeholder="FTR-2024-001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tedarikçi *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    placeholder="Tedarikçi adı"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fatura Tarihi *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Malzeme Bilgileri - MaterialManagement'taki Temel Bilgiler */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Malzeme Bilgileri
              </h4>
              
              {autoFilled && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-green-700 font-medium">Malzeme bilgileri otomatik olarak dolduruldu</span>
                  </div>
                </div>
              )}

              {/* İlk Satır */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Malzeme Adı *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={materialForm.name}
                    onChange={(e) => handleMaterialFormChange('name', e.target.value)}
                    placeholder="Malzeme adı"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barkod *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      required
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={materialForm.barcode}
                      onChange={(e) => handleMaterialFormChange('barcode', e.target.value)}
                      placeholder="Barkod"
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
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GTIN
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={materialForm.gtin}
                    onChange={(e) => handleMaterialFormChange('gtin', e.target.value)}
                    placeholder="GTIN"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SN *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={materialForm.sn}
                    onChange={(e) => handleMaterialFormChange('sn', e.target.value)}
                    placeholder="SN numarası"
                  />
                </div>
              </div>

              {/* İkinci Satır */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UDI Code
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={materialForm.udiCode}
                    onChange={(e) => handleMaterialFormChange('udiCode', e.target.value)}
                    placeholder="UDI Code"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    All Barcode
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={materialForm.allBarcode}
                    onChange={(e) => handleMaterialFormChange('allBarcode', e.target.value)}
                    placeholder="All Barcode"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sezgisel Kod
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={materialForm.intuitiveCode}
                    onChange={(e) => handleMaterialFormChange('intuitiveCode', e.target.value)}
                    placeholder="Sezgisel Kod"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statü
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={materialForm.status}
                    onChange={(e) => handleMaterialFormChange('status', e.target.value as MaterialStatus)}
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Üçüncü Satır */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={materialForm.category}
                    onChange={(e) => handleMaterialFormChange('category', e.target.value)}
                    required
                  >
                    <option value="">Kategori seçin *</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alt Kategori
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={materialForm.subCategory}
                    onChange={(e) => handleMaterialFormChange('subCategory', e.target.value)}
                    placeholder="Alt kategori"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tedarikçi *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={materialForm.supplier}
                    onChange={(e) => handleMaterialFormChange('supplier', e.target.value)}
                    required
                  >
                    <option value="">Tedarikçi seçin *</option>
                    {suppliers.map(sup => (
                      <option key={sup.id} value={sup.name}>{sup.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birim *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={materialForm.unit}
                    onChange={(e) => handleMaterialFormChange('unit', e.target.value)}
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
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mevcut Stok *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={materialForm.currentStock}
                    onChange={(e) => handleMaterialFormChange('currentStock', Number(e.target.value))}
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
                    value={materialForm.minStock}
                    onChange={(e) => handleMaterialFormChange('minStock', Number(e.target.value))}
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
                    value={materialForm.unitPrice}
                    onChange={(e) => handleMaterialFormChange('unitPrice', Number(e.target.value))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKT
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={materialForm.expirationDate}
                    onChange={(e) => handleMaterialFormChange('expirationDate', e.target.value)}
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
                    value={materialForm.serialNoStatus}
                    onChange={(e) => handleMaterialFormChange('serialNoStatus', e.target.value)}
                    placeholder="Seri No Durumu"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Malzeme Açıklama
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={materialForm.materialDescription}
                    onChange={(e) => handleMaterialFormChange('materialDescription', e.target.value)}
                    placeholder="Malzeme açıklaması"
                  />
                </div>
              </div>
            </div>

            {/* Eklenmiş Malzemeler */}
            {formData.items.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                  <CheckSquare className="h-5 w-5 mr-2" />
                  Eklenmiş Malzemeler ({formData.items.length})
                </h4>
                <div className="space-y-2">
                  {formData.items.map((item, index) => {
                    const material = materials.find(m => m.id === item.materialId);
                    return (
                      <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <div className="font-medium">{material?.name || 'Bilinmeyen'}</div>
                          <div className="text-sm text-gray-600">
                            Barkod: {material?.barcode} | SN: {material?.sn} | Fiyat: ₺{item.unitPrice.toFixed(2)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              items: formData.items.filter((_, i) => i !== index)
                            });
                          }}
                          className="text-red-600 hover:text-red-800 ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Butonlar */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              >
                Malzeme Ekle ve Fatura Oluştur
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg font-medium transition-all"
              >
                İptal
              </button>
            </div>
          </form>
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

// Fatura Detayları Component
interface InvoiceDetailsProps {
  invoice: Invoice;
  materials: Material[];
  onClose: () => void;
  onPdfUpload: () => void;
  onPdfDownload: () => void;
}

function InvoiceDetails({ invoice, materials, onClose, onPdfUpload, onPdfDownload }: InvoiceDetailsProps) {
  const [stockCounts, setStockCounts] = useState<any[]>([]);
  const [invoiceStocks, setInvoiceStocks] = useState<{materialId: string, addedStock: number}[]>([]);

  useEffect(() => {
    loadStockData();
  }, [invoice]);

  const loadStockData = () => {
    const allStockCounts = dataService.getStockCounts();
    setStockCounts(allStockCounts);

    // Faturaya ait stok eklemelerini al
    const stocks = invoice.items.map(item => {
      const material = materials.find(m => m.id === item.materialId);
      return {
        materialId: item.materialId,
        addedStock: item.quantity,
        materialName: material?.name || 'Bilinmeyen'
      };
    });
    setInvoiceStocks(stocks);
  };

  const getMaterialName = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    return material ? material.name : 'Bilinmeyen Malzeme';
  };

  const getMaterialCategory = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    return material ? material.category : '-';
  };

  const getMaterialSerialNumber = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    return material?.sn || '-';
  };

  // Stok Takip'te aynı Fatura No var mı kontrol et
  const hasMatchingStockCount = stockCounts.some(count => count.invoiceNo === invoice.invoiceNo);

  return (
    <div className="modal-overlay">
      <div className="modal-container w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Fatura Detayları</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Fatura Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Fatura No</p>
              <p className="font-semibold text-lg">{invoice.invoiceNo}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Tedarikçi</p>
              <p className="font-semibold text-lg">{invoice.supplierName}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Tarih</p>
              <p className="font-semibold text-lg">{new Date(invoice.invoiceDate).toLocaleDateString('tr-TR')}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">PDF Durumu</p>
              <div className="flex items-center space-x-2">
                {invoice.pdfUrl ? (
                  <>
                    <FileText className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-600">Yüklü</span>
                    <button
                      onClick={onPdfDownload}
                      className="text-green-600 hover:text-green-800 ml-2"
                      title="PDF İndir"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5 text-gray-400" />
                    <span className="font-semibold text-gray-600">Yok</span>
                    <button
                      onClick={onPdfUpload}
                      className="text-blue-600 hover:text-blue-800 ml-2"
                      title="PDF Yükle"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stok Durumu Bilgisi */}
          <div className={`${hasMatchingStockCount ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-4 mb-6`}>
            <div className="flex items-start space-x-3">
              {hasMatchingStockCount ? (
                <>
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800 mb-1">Stok Takip ile Eşleşme Var</h4>
                    <p className="text-sm text-green-700">
                      Bu faturanın Fatura No'su Stok Takip'te mevcut. Fatura Yönetimi'ndeki stok adeti doğrudan malzeme stoklarına eklenecektir.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">Stok Takip'te Eşleşme Yok</h4>
                    <p className="text-sm text-yellow-700">
                      Bu faturanın Fatura No'su Stok Takip'te bulunmuyor. Hem Stok Takip hem de Fatura Yönetimi stokları ayrı ayrı eklenecek ve Son Fatura Bilgileri kaydedilecektir.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Toplam Tutar */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-2xl font-bold text-green-800">Toplam Tutar:</span>
                <p className="text-sm text-green-600 mt-1">{invoice.items.length} kalem</p>
              </div>
              <span className="text-4xl font-bold text-green-600">₺{invoice.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Stok Eklemeleri */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Stok Eklemeleri
            </h4>
            <div className="space-y-3">
              {invoiceStocks.map((stock, index) => {
                const material = materials.find(m => m.id === stock.materialId);
                return (
                  <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-medium">{stock.materialName}</div>
                        <div className="text-sm text-gray-600">
                          Mevcut Stok: {material?.currentStock || 0} {material?.unit} | Eklenecek: {stock.addedStock} {material?.unit}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">
                          +{stock.addedStock} {material?.unit}
                        </div>
                        <div className="text-sm text-gray-500">
                          Yeni Stok: {(material?.currentStock || 0) + stock.addedStock}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fatura Kalemleri */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4">Fatura Kalemleri ({invoice.items.length} adet)</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Malzeme</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Kategori</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">SN No</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Miktar</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Birim Fiyat</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3 text-sm font-medium">{getMaterialName(item.materialId)}</td>
                      <td className="py-3 px-3 text-sm text-gray-600">{getMaterialCategory(item.materialId)}</td>
                      <td className="py-3 px-3 text-sm text-gray-600 font-mono">{getMaterialSerialNumber(item.materialId)}</td>
                      <td className="py-3 px-3 text-sm">{item.quantity}</td>
                      <td className="py-3 px-3 text-sm">₺{item.unitPrice.toFixed(2)}</td>
                      <td className="py-3 px-3 text-sm font-semibold">₺{item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan={5} className="py-3 px-3 text-right font-semibold text-lg">Genel Toplam:</td>
                    <td className="py-3 px-3 font-bold text-2xl text-green-600">₺{invoice.totalAmount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* PDF Görüntüleme Alanı */}
          {invoice.pdfUrl && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4">PDF Önizleme</h4>
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">Fatura PDF'i</span>
                  <button
                    onClick={onPdfDownload}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>PDF İndir</span>
                  </button>
                </div>
                <div className="border border-gray-300 rounded h-64 flex items-center justify-center">
                  <a
                    href={invoice.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline flex flex-col items-center"
                  >
                    <FileText className="h-16 w-16 text-gray-400 mb-2" />
                    <span>PDF'i Görüntülemek İçin Tıklayın</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Kapat Butonu */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onPdfUpload}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>{invoice.pdfUrl ? 'PDF Değiştir' : 'PDF Yükle'}</span>
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-6 rounded-lg font-medium transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [columnFilters, setColumnFilters] = useState<{ [key: string]: string }>({});
  const [snSearchTerm, setSnSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Invoice[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPdfInvoice, setSelectedPdfInvoice] = useState<Invoice | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [stockCounts, setStockCounts] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  // Tüm verileri yükle
  const loadData = () => {
    const allInvoices = dataService.getInvoices();
    const allMaterials = dataService.getMaterials();
    const allStockCounts = dataService.getStockCounts();
    
    setInvoices(allInvoices);
    setMaterials(allMaterials);
    setStockCounts(allStockCounts);
  };

  // SN numarası ile ürün arama
  const handleSnSearch = () => {
    if (!snSearchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const results = invoices.filter(invoice => {
      return invoice.items.some(item => {
        const material = materials.find(m => m.id === item.materialId);
        return material?.sn?.toLowerCase().includes(snSearchTerm.toLowerCase());
      });
    });

    setSearchResults(results);
  };

  // Fatura ekleme fonksiyonu - YENİ: Stok mantığı ile
  const handleAddInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt'>) => {
    // StockCount'larda aynı Fatura No var mı kontrol et
    const matchingStockCount = stockCounts.find(count => count.invoiceNo === invoiceData.invoiceNo);
    
    if (matchingStockCount) {
      // Fatura No eşleşiyor: Sadece Stok Takip'teki stoğu malzeme stoğuna ekle
      handleMatchingStockCount(invoiceData, matchingStockCount);
    } else {
      // Fatura No farklı: Her iki stok da ekle, Son Fatura Bilgileri kaydet
      handleNonMatchingStockCount(invoiceData);
    }
  };

  // Eşleşen StockCount işlemi
  const handleMatchingStockCount = (invoiceData: Omit<Invoice, 'id' | 'createdAt'>, stockCount: any) => {
    // Malzeme stoklarını güncelle
    invoiceData.items.forEach(item => {
      const material = materials.find(m => m.id === item.materialId);
      if (material) {
        const newStock = material.currentStock + stockCount.countedQuantity;
        dataService.updateMaterial(material.id, { currentStock: newStock });
      }
    });

    // Faturayı kaydet
    const savedInvoice = dataService.saveInvoice(invoiceData);
    
    dataService.logAction({
      action: 'YENİ_FATURA_STOK_ESLESME',
      module: 'FATURA_YÖNETİMİ',
      recordId: invoiceData.invoiceNo,
      details: `${invoiceData.supplierName} tedarikçisine ait ${invoiceData.invoiceNo} faturası eklendi - Stok Takip ile eşleşti, stoklar güncellendi`,
      performedBy: dataService.getCurrentUser().name,
    });

    loadData();
    setShowAddModal(false);
    alert('Fatura başarıyla eklendi! Stok Takip ile eşleşti, malzeme stokları güncellendi.');
  };

  // Eşleşmeyen StockCount işlemi
  const handleNonMatchingStockCount = (invoiceData: Omit<Invoice, 'id' | 'createdAt'>) => {
    // Hem StockCount hem de Invoice stoklarını ekle
    invoiceData.items.forEach(item => {
      const material = materials.find(m => m.id === item.materialId);
      if (material) {
        // StockCount'tan stok ekle (varsa)
        const materialStockCount = stockCounts.find(sc => 
          sc.materialId === material.id || sc.barcode === material.barcode
        );
        
        let newStock = material.currentStock + item.quantity;
        if (materialStockCount) {
          newStock += materialStockCount.countedQuantity;
        }
        
        dataService.updateMaterial(material.id, { currentStock: newStock });
        
        // Son Fatura Bilgileri kaydet
        const lastInvoiceInfo = {
          invoiceNo: invoiceData.invoiceNo,
          invoiceDate: invoiceData.invoiceDate,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          addedDate: new Date().toISOString()
        };
        
        dataService.updateMaterial(material.id, { lastInvoiceInfo });
      }
    });

    // Faturayı kaydet
    const savedInvoice = dataService.saveInvoice(invoiceData);
    
    dataService.logAction({
      action: 'YENİ_FATURA_STOK_EKLEME',
      module: 'FATURA_YÖNETİMİ',
      recordId: invoiceData.invoiceNo,
      details: `${invoiceData.supplierName} tedarikçisine ait ${invoiceData.invoiceNo} faturası eklendi - Stoklar eklendi, son fatura bilgileri kaydedildi`,
      performedBy: dataService.getCurrentUser().name,
    });

    loadData();
    setShowAddModal(false);
    alert('Fatura başarıyla eklendi! Stoklar eklendi ve son fatura bilgileri kaydedildi.');
  };

  // Fatura düzenleme fonksiyonu
  const handleUpdateInvoice = (id: string, updates: Partial<Invoice>) => {
    const updatedInvoice = dataService.updateInvoice(id, updates);
    
    if (updatedInvoice) {
      dataService.logAction({
        action: 'FATURA_GÜNCELLENDİ',
        module: 'FATURA_YÖNETİMİ',
        recordId: updatedInvoice.invoiceNo,
        details: `${updatedInvoice.supplierName} tedarikçisine ait ${updatedInvoice.invoiceNo} faturası güncellendi - Yeni Tutar: ₺${updatedInvoice.totalAmount.toFixed(2)}`,
        performedBy: dataService.getCurrentUser().name,
      });

      loadData();
      setEditingInvoice(null);
    }
  };

  // Fatura silme fonksiyonu
  const handleDeleteInvoice = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id);
    if (confirm(`"${invoice?.invoiceNo}" faturasını silmek istediğinizden emin misiniz?`)) {
      dataService.deleteInvoice(id);
      
      dataService.logAction({
        action: 'FATURA_SİLİNDİ',
        module: 'FATURA_YÖNETİMİ',
        recordId: invoice?.invoiceNo || id,
        details: `${invoice?.supplierName} tedarikçisine ait ${invoice?.invoiceNo} faturası silindi`,
        performedBy: dataService.getCurrentUser().name,
      });

      loadData();
    }
  };

  // PDF yükleme fonksiyonu
  const handlePdfUpload = async (invoiceId: string, file: File) => {
    setUploadingPdf(true);
    try {
      // PDF yükleme işlemi - dataService üzerinden yapılabilir
      const pdfUrl = await dataService.uploadInvoicePdf(invoiceId, file);
      
      // Faturayı güncelle
      const updatedInvoice = dataService.updateInvoice(invoiceId, { pdfUrl });
      
      if (updatedInvoice) {
        dataService.logAction({
          action: 'PDF_YUKLENDI',
          module: 'FATURA_YÖNETİMİ',
          recordId: updatedInvoice.invoiceNo,
          details: `${updatedInvoice.invoiceNo} faturasına PDF eklendi`,
          performedBy: dataService.getCurrentUser().name,
        });

        loadData();
        setSelectedPdfInvoice(null);
      }
    } catch (error) {
      console.error('PDF yükleme hatası:', error);
      alert('PDF yüklenirken bir hata oluştu!');
    } finally {
      setUploadingPdf(false);
    }
  };

  // PDF indirme fonksiyonu
  const handlePdfDownload = (invoice: Invoice) => {
    if (!invoice.pdfUrl) {
      alert('Bu faturanın PDF dosyası bulunmamaktadır!');
      return;
    }

    // PDF indirme işlemi
    const link = document.createElement('a');
    link.href = invoice.pdfUrl;
    link.download = `Fatura_${invoice.invoiceNo}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtreleme fonksiyonu
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesColumnFilters = Object.entries(columnFilters).every(([column, filter]) => {
      if (!filter) return true;
      const value = invoice[column as keyof Invoice];
      
      if (column === 'totalAmount') {
        return value?.toString().includes(filter);
      }
      
      if (column === 'invoiceDate') {
        const date = new Date(value as string).toLocaleDateString('tr-TR');
        return date.includes(filter);
      }
      
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

  return (
    <div className="space-y-6">
      {/* Başlık ve Yeni Fatura Butonu */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Fatura Yönetimi</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Yeni Fatura</span>
        </button>
      </div>

      {/* SN Numarası ile Arama */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">SN Numarası ile Ürün Arama</h3>
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="SN numarası giriniz..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={snSearchTerm}
              onChange={(e) => {
                setSnSearchTerm(e.target.value);
                if (!e.target.value.trim()) {
                  setSearchResults([]);
                  setIsSearching(false);
                }
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSnSearch()}
            />
          </div>
          <button
            onClick={handleSnSearch}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Search className="h-5 w-5" />
            <span>Ara</span>
          </button>
        </div>

        {/* Arama Sonuçları */}
        {isSearching && searchResults.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-700 mb-2">
              "{snSearchTerm}" SN numaralı ürün bulunduğu faturalar:
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              {searchResults.map((invoice) => (
                <div key={invoice.id} className="mb-3 last:mb-0 p-3 border border-gray-200 rounded-lg hover:bg-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-left"
                      >
                        {invoice.invoiceNo}
                      </button>
                      <p className="text-sm text-gray-600">{invoice.supplierName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(invoice.invoiceDate).toLocaleDateString('tr-TR')} - 
                        ₺{invoice.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Detayları Görüntüle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {invoice.pdfUrl && (
                        <button
                          onClick={() => handlePdfDownload(invoice)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="PDF İndir"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isSearching && searchResults.length === 0 && snSearchTerm.trim() && (
          <div className="mt-4 text-center py-4 text-gray-500">
            "{snSearchTerm}" SN numaralı ürün bulunamadı.
          </div>
        )}
      </div>

      {/* Ana İçerik */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Arama Çubuğu */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Fatura no veya tedarikçi ara..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Sütun Filtreleri */}
        <div className="grid grid-cols-7 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="relative">
            <input
              type="text"
              placeholder="Fatura no ara..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={columnFilters.invoiceNo || ''}
              onChange={(e) => handleColumnFilter('invoiceNo', e.target.value)}
            />
            {columnFilters.invoiceNo && (
              <button
                onClick={() => clearColumnFilter('invoiceNo')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Tedarikçi ara..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={columnFilters.supplierName || ''}
              onChange={(e) => handleColumnFilter('supplierName', e.target.value)}
            />
            {columnFilters.supplierName && (
              <button
                onClick={() => clearColumnFilter('supplierName')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Tarih ara..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={columnFilters.invoiceDate || ''}
              onChange={(e) => handleColumnFilter('invoiceDate', e.target.value)}
            />
            {columnFilters.invoiceDate && (
              <button
                onClick={() => clearColumnFilter('invoiceDate')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Tutar ara..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={columnFilters.totalAmount || ''}
              onChange={(e) => handleColumnFilter('totalAmount', e.target.value)}
            />
            {columnFilters.totalAmount && (
              <button
                onClick={() => clearColumnFilter('totalAmount')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Kalem sayısı ara..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={columnFilters.items || ''}
              onChange={(e) => handleColumnFilter('items', e.target.value)}
            />
            {columnFilters.items && (
              <button
                onClick={() => clearColumnFilter('items')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

        {/* Fatura Tablosu */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Fatura No</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tedarikçi</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tarih</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Toplam Tutar</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Kalem Sayısı</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">PDF</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                      >
                        {invoice.invoiceNo}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{invoice.supplierName}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(invoice.invoiceDate).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-green-600">
                      ₺{invoice.totalAmount.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {invoice.items.length}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      {invoice.pdfUrl ? (
                        <>
                          <button
                            onClick={() => handlePdfDownload(invoice)}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="PDF İndir"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setSelectedPdfInvoice(invoice)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="PDF Değiştir"
                          >
                            <Upload className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setSelectedPdfInvoice(invoice)}
                          className="text-gray-600 hover:text-gray-800 p-1"
                          title="PDF Yükle"
                        >
                          <Upload className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      {/* Detay Görüntüle Butonu */}
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Detayları Görüntüle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {/* Düzenle Butonu */}
                      <button
                        onClick={() => setEditingInvoice(invoice)}
                        className="text-yellow-600 hover:text-yellow-800 p-1"
                        title="Düzenle"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      
                      {/* Sil Butonu */}
                      <button
                        onClick={() => handleDeleteInvoice(invoice.id)}
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
          
          {/* Fatura bulunamadı mesajı */}
          {filteredInvoices.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p>Fatura bulunamadı</p>
            </div>
          )}
        </div>
      </div>

      {/* Modaller */}
      {selectedInvoice && (
        <InvoiceDetails
          invoice={selectedInvoice}
          materials={materials}
          onClose={() => setSelectedInvoice(null)}
          onPdfUpload={() => setSelectedPdfInvoice(selectedInvoice)}
          onPdfDownload={() => handlePdfDownload(selectedInvoice)}
        />
      )}

      {showAddModal && (
        <InvoiceModal
          onSave={handleAddInvoice}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingInvoice && (
        <InvoiceModal
          invoice={editingInvoice}
          onSave={(invoiceData) => handleUpdateInvoice(editingInvoice.id, invoiceData)}
          onClose={() => setEditingInvoice(null)}
        />
      )}

      {selectedPdfInvoice && (
        <PdfUploadModal
          invoice={selectedPdfInvoice}
          onUpload={handlePdfUpload}
          onClose={() => setSelectedPdfInvoice(null)}
          uploading={uploadingPdf}
        />
      )}
    </div>
  );
}