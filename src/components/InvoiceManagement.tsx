import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Trash2, Eye, Edit2, Filter, Download, Upload, X } from 'lucide-react';
import { Invoice, Material, InvoiceItem } from '../types';
import { dataService } from '../utils/dataService';

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

  useEffect(() => {
    loadInvoices();
    setMaterials(dataService.getMaterials());
  }, []);

  // Faturaları yükleme fonksiyonu
  const loadInvoices = () => {
    const allInvoices = dataService.getInvoices();
    setInvoices(allInvoices);
    
    // PDF dosyalarını yükle
    allInvoices.forEach(invoice => {
      if (invoice.pdfUrl) {
        // PDF önizleme için önceden yükleme yapılabilir
        console.log(`PDF yüklendi: ${invoice.pdfUrl}`);
      }
    });
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
        return material?.serialNumber?.toLowerCase().includes(snSearchTerm.toLowerCase());
      });
    });

    setSearchResults(results);
  };

  // Filtreleme fonksiyonu - sütun filtreleri ve arama terimini birleştirir
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

        loadInvoices();
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

  // Fatura ekleme fonksiyonu
  const handleAddInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt'>) => {
    dataService.saveInvoice(invoiceData);
    
    dataService.logAction({
      action: 'YENİ_FATURA',
      module: 'FATURA_YÖNETİMİ',
      recordId: invoiceData.invoiceNo,
      details: `${invoiceData.supplierName} tedarikçisine ait ${invoiceData.invoiceNo} faturası eklendi - Tutar: ₺${invoiceData.totalAmount.toFixed(2)}`,
      performedBy: dataService.getCurrentUser().name,
    });

    loadInvoices();
    setMaterials(dataService.getMaterials());
    setShowAddModal(false);
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

      loadInvoices();
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

      loadInvoices();
    }
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

      {/* Fatura Detayları Modal */}
      {selectedInvoice && (
        <InvoiceDetails
          invoice={selectedInvoice}
          materials={materials}
          onClose={() => setSelectedInvoice(null)}
          onPdfUpload={() => setSelectedPdfInvoice(selectedInvoice)}
          onPdfDownload={() => handlePdfDownload(selectedInvoice)}
        />
      )}

      {/* Fatura Ekleme Modal */}
      {showAddModal && (
        <InvoiceModal
          materials={materials}
          onSave={handleAddInvoice}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Fatura Düzenleme Modal */}
      {editingInvoice && (
        <InvoiceModal
          invoice={editingInvoice}
          materials={materials}
          onSave={(invoiceData) => handleUpdateInvoice(editingInvoice.id, invoiceData)}
          onClose={() => setEditingInvoice(null)}
        />
      )}

      {/* PDF Yükleme Modal */}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
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
  );
}

// Fatura Modal Component - Hem ekleme hem düzenleme için
interface InvoiceModalProps {
  invoice?: Invoice | null;
  materials: Material[];
  onSave: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

function InvoiceModal({ invoice, materials, onSave, onClose }: InvoiceModalProps) {
  const [formData, setFormData] = useState({
    invoiceNo: invoice?.invoiceNo || `FTR-${Date.now()}`,
    supplierName: invoice?.supplierName || '',
    invoiceDate: invoice?.invoiceDate || new Date().toISOString().split('T')[0],
  });

  const [items, setItems] = useState<Omit<InvoiceItem, 'id'>[]>(
    invoice?.items.map(item => ({
      materialId: item.materialId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })) || []
  );

  const [newItem, setNewItem] = useState({
    materialId: '',
    quantity: 1,
    unitPrice: 0,
  });

  // Yeni kalem ekleme fonksiyonu
  const addItem = () => {
    if (!newItem.materialId) {
      alert('Lütfen malzeme seçiniz!');
      return;
    }

    const material = materials.find(m => m.id === newItem.materialId);
    if (!material) return;

    const item = {
      materialId: newItem.materialId,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice || material.unitPrice,
      totalPrice: newItem.quantity * (newItem.unitPrice || material.unitPrice),
    };

    setItems([...items, item]);
    setNewItem({ materialId: '', quantity: 1, unitPrice: 0 });
  };

  // Kalem silme fonksiyonu
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Toplam tutar hesaplama
  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  // Form gönderme fonksiyonu
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('En az bir kalem eklemelisiniz!');
      return;
    }

    const invoiceItems: InvoiceItem[] = items.map((item, index) => ({
      ...item,
      id: `item-${index}-${Date.now()}`,
    }));

    onSave({
      ...formData,
      items: invoiceItems,
      totalAmount,
    });
  };

  // Malzeme adı getirme fonksiyonu
  const getMaterialName = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    return material ? material.name : 'Bilinmeyen Malzeme';
  };

  // Malzeme seçildiğinde birim fiyatı otomatik doldur
  const handleMaterialChange = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    if (material) {
      setNewItem({
        ...newItem,
        materialId,
        unitPrice: material.unitPrice
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            {invoice ? 'Fatura Düzenle' : 'Yeni Fatura Ekle'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fatura Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fatura No *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.invoiceNo}
                onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tedarikçi *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fatura Tarihi *
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
              />
            </div>
          </div>

          {/* Fatura Kalemleri */}
          <div className="border-t pt-6">
            <h4 className="text-md font-semibold mb-4">Fatura Kalemleri</h4>
            
            {/* Yeni Kalem Ekleme Formu */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Malzeme *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newItem.materialId}
                  onChange={(e) => handleMaterialChange(e.target.value)}
                >
                  <option value="">Malzeme seçiniz</option>
                  {materials.map(material => (
                    <option key={material.id} value={material.id}>
                      {material.name} - SN: {material.serialNumber || 'Yok'} - Stok: {material.currentStock}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newItem.unitPrice}
                  onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addItem}
                  disabled={!newItem.materialId}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Kalem Ekle
                </button>
              </div>
            </div>

            {/* Kalem Listesi */}
            {items.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Malzeme</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">SN No</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Miktar</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Birim Fiyat</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Toplam</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const material = materials.find(m => m.id === item.materialId);
                      return (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 px-3 text-sm font-medium">{material?.name || 'Bilinmeyen'}</td>
                          <td className="py-2 px-3 text-sm text-gray-600">{material?.serialNumber || '-'}</td>
                          <td className="py-2 px-3 text-sm">{item.quantity}</td>
                          <td className="py-2 px-3 text-sm">₺{item.unitPrice.toFixed(2)}</td>
                          <td className="py-2 px-3 text-sm font-semibold">₺{item.totalPrice.toFixed(2)}</td>
                          <td className="py-2 px-3">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800"
                              title="Sil"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300">
                      <td colSpan={4} className="py-3 px-3 text-right font-semibold">Genel Toplam:</td>
                      <td className="py-3 px-3 font-bold text-lg text-green-600">₺{totalAmount.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
          
          {/* Butonlar */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="submit"
              disabled={items.length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {invoice ? 'Faturayı Güncelle' : 'Faturayı Kaydet'}
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

// Fatura Detayları Component
interface InvoiceDetailsProps {
  invoice: Invoice;
  materials: Material[];
  onClose: () => void;
  onPdfUpload: () => void;
  onPdfDownload: () => void;
}

function InvoiceDetails({ invoice, materials, onClose, onPdfUpload, onPdfDownload }: InvoiceDetailsProps) {
  // Malzeme adı getirme fonksiyonu
  const getMaterialName = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    return material ? material.name : 'Bilinmeyen Malzeme';
  };

  // Malzeme kategorisi getirme fonksiyonu
  const getMaterialCategory = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    return material ? material.category : '-';
  };

  // Malzeme SN numarası getirme fonksiyonu
  const getMaterialSerialNumber = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    return material?.serialNumber || '-';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
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
  );
}