import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Package, 
  AlertTriangle, 
  Barcode, 
  History, 
  Filter, 
  Download  // ← Buraya Download eklendi
} from 'lucide-react';
import { Material, Category, Supplier } from '../types';
import { dataService } from '../utils/dataService.ts';

export default function MaterialManagement() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [showStockHistory, setShowStockHistory] = useState(false);
  const [stockCounts, setStockCounts] = useState<any[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newSupplier, setNewSupplier] = useState({ name: '', contactPerson: '', phone: '', email: '' });
  const [columnFilters, setColumnFilters] = useState<{ [key: string]: string }>({});
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [_showBulkActions, _setShowBulkActions] = useState(false);

  useEffect(() => {
    loadMaterials();
    loadCategoriesAndSuppliers();
  }, []);

  const loadMaterials = () => {
    setMaterials(dataService.getMaterials());
  };

  const loadCategoriesAndSuppliers = () => {
    setCategories(dataService.getCategories());
    setSuppliers(dataService.getSuppliers());
  };

  // Gelişmiş filtreleme fonksiyonu
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = 
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.barcode.includes(searchTerm) ||
      material.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesColumnFilters = Object.entries(columnFilters).every(([column, filter]) => {
      if (!filter) return true;
      
      const value = material[column as keyof Material];
      if (value === undefined || value === null) return false;
      
      // Özel filtreleme kuralları
      if (column === 'currentStock' || column === 'minStock') {
        return value.toString().includes(filter);
      }
      
      if (column === 'unitPrice') {
        return value.toString().includes(filter);
      }
      
      return value.toString().toLowerCase().includes(filter.toLowerCase());
    });

    return matchesSearch && matchesColumnFilters;
  });

  // Toplu işlemler için malzeme seçimi
  const handleMaterialSelect = (materialId: string) => {
    setSelectedMaterials(prev =>
      prev.includes(materialId)
        ? prev.filter(id => id !== materialId)
        : [...prev, materialId]
    );
  };

  // Tümünü seç/seçimi kaldır
  const handleSelectAll = () => {
    if (selectedMaterials.length === filteredMaterials.length) {
      setSelectedMaterials([]);
    } else {
      setSelectedMaterials(filteredMaterials.map(m => m.id));
    }
  };

  // Kategori ekleme
  const handleAddCategory = () => {
    if (newCategory.trim()) {
      dataService.addCategory(newCategory.trim());
      setNewCategory('');
      setShowCategoryModal(false);
      loadCategoriesAndSuppliers();
    }
  };

  // Tedarikçi ekleme
  const handleAddSupplier = () => {
    if (newSupplier.name.trim()) {
      dataService.addSupplier({
        name: newSupplier.name.trim(),
        contactPerson: newSupplier.contactPerson,
        phone: newSupplier.phone,
        email: newSupplier.email
      });
      setNewSupplier({ name: '', contactPerson: '', phone: '', email: '' });
      setShowSupplierModal(false);
      loadCategoriesAndSuppliers();
    }
  };

  // Sütun filtreleme
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

  // Tüm filtreleri temizle
  const clearAllFilters = () => {
    setColumnFilters({});
    setSearchTerm('');
  };

  // Barkod arama
  const handleBarcodeSearch = () => {
    if (barcodeInput) {
      setSearchTerm(barcodeInput);
      setBarcodeInput('');
    }
  };

  // Malzeme ekleme
  const handleAddMaterial = (materialData: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => {
    dataService.saveMaterial(materialData);
    dataService.logAction({
      action: 'YENİ_MALZEME',
      module: 'MALZEME_YÖNETİMİ',
      recordId: materialData.barcode,
      details: `${materialData.name} malzemesi eklendi - Stok: ${materialData.currentStock}`,
      performedBy: dataService.getCurrentUser().name,
    });
    loadMaterials();
    setShowAddModal(false);
  };

  // Malzeme güncelleme
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
    loadMaterials();
    setEditingMaterial(null);
  };

  // Malzeme silme
  const handleDeleteMaterial = (id: string) => {
    const material = materials.find(m => m.id === id);
    if (confirm(`"${material?.name}" malzemesini silmek istediğinizden emin misiniz?`)) {
      dataService.deleteMaterial(id);
      dataService.logAction({
        action: 'MALZEME_SİLİNDİ',
        module: 'MALZEME_YÖNETİMİ',
        recordId: material?.barcode || id,
        details: `${material?.name} malzemesi silindi`,
        performedBy: dataService.getCurrentUser().name,
      });
      loadMaterials();
    }
  };

  // Toplu silme
  const handleBulkDelete = () => {
    if (selectedMaterials.length === 0) return;
    
    if (confirm(`${selectedMaterials.length} malzemeyi silmek istediğinizden emin misiniz?`)) {
      selectedMaterials.forEach(id => {
        dataService.deleteMaterial(id);
      });
      
      dataService.logAction({
        action: 'TOPLU_MALZEME_SİLME',
        module: 'MALZEME_YÖNETİMİ',
        recordId: 'BATCH_DELETE',
        details: `${selectedMaterials.length} malzeme toplu olarak silindi`,
        performedBy: dataService.getCurrentUser().name,
      });
      
      loadMaterials();
      setSelectedMaterials([]);
    }
  };

  // Stok geçmişini görüntüleme
  const handleShowStockHistory = (material: Material) => {
    setSelectedMaterial(material);
    setStockCounts(dataService.getStockCountsByMaterial(material.id));
    setShowStockHistory(true);
  };

  // Excel export (basit implementasyon)
  const handleExportExcel = () => {
    const headers = ['Malzeme Adı', 'Barkod', 'Kategori', 'Mevcut Stok', 'Kritik Stok', 'Birim Fiyat', 'Tedarikçi'];
    const data = filteredMaterials.map(material => [
      material.name,
      material.barcode,
      material.category,
      material.currentStock,
      material.minStock,
      material.unitPrice,
      material.supplier
    ]);
    
    const csvContent = [headers, ...data]
      .map(row => row.map(cell => `"${cell}"`).join(','))
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

  // Düşük stoklu malzemeler
  const lowStockMaterials = materials.filter(m => m.currentStock <= m.minStock);

  return (
    <div className="space-y-6">
      {/* Başlık ve Butonlar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Malzeme Yönetimi</h2>
          <p className="text-gray-600">Stoktaki tüm malzemelerin yönetimi ve takibi</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Download className="h-5 w-5" />
            <span>Excel Export</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Yeni Malzeme</span>
          </button>
        </div>
      </div>

      {/* Kritik Stok Uyarısı */}
      {lowStockMaterials.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-800 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Kritik Stok Uyarısı</span>
          </div>
          <p className="text-red-700 mb-2">Aşağıdaki malzemeler minimum stok seviyesinde veya altında:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStockMaterials.slice(0, 6).map(material => (
              <div key={material.id} className="text-sm text-red-800 bg-red-100 px-3 py-2 rounded">
                <span className="font-medium">{material.name}</span> - 
                Mevcut: {material.currentStock} {material.unit}, 
                Minimum: {material.minStock} {material.unit}
              </div>
            ))}
          </div>
          {lowStockMaterials.length > 6 && (
            <div className="mt-2 text-red-600 text-sm">
              +{lowStockMaterials.length - 6} malzeme daha...
            </div>
          )}
        </div>
      )}

      {/* Toplu İşlemler Toolbar */}
      {selectedMaterials.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="font-medium text-blue-800">
                {selectedMaterials.length} malzeme seçildi
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              >
                <Trash2 className="h-4 w-4" />
                <span>Toplu Sil</span>
              </button>
              <button
                onClick={() => setSelectedMaterials([])}
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1 rounded text-sm"
              >
                Seçimi Temizle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Arama ve Filtreler */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Malzeme adı, barkod, kategori veya tedarikçi ara..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Barkod tara/gir"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSearch()}
            />
            <button
              onClick={handleBarcodeSearch}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Barcode className="h-5 w-5" />
              <span>Ara</span>
            </button>
          </div>
        </div>

        {/* Sütun Filtreleri */}
        <div className="grid grid-cols-8 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="relative">
            <input
              type="text"
              placeholder="Malzeme ara..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={columnFilters.name || ''}
              onChange={(e) => handleColumnFilter('name', e.target.value)}
            />
            {columnFilters.name && (
              <button
                onClick={() => clearColumnFilter('name')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Barkod ara..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={columnFilters.barcode || ''}
              onChange={(e) => handleColumnFilter('barcode', e.target.value)}
            />
            {columnFilters.barcode && (
              <button
                onClick={() => clearColumnFilter('barcode')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Kategori ara..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={columnFilters.category || ''}
              onChange={(e) => handleColumnFilter('category', e.target.value)}
            />
            {columnFilters.category && (
              <button
                onClick={() => clearColumnFilter('category')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Stok ara..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={columnFilters.currentStock || ''}
              onChange={(e) => handleColumnFilter('currentStock', e.target.value)}
            />
            {columnFilters.currentStock && (
              <button
                onClick={() => clearColumnFilter('currentStock')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Min. stok ara..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={columnFilters.minStock || ''}
              onChange={(e) => handleColumnFilter('minStock', e.target.value)}
            />
            {columnFilters.minStock && (
              <button
                onClick={() => clearColumnFilter('minStock')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Fiyat ara..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={columnFilters.unitPrice || ''}
              onChange={(e) => handleColumnFilter('unitPrice', e.target.value)}
            />
            {columnFilters.unitPrice && (
              <button
                onClick={() => clearColumnFilter('unitPrice')}
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
              value={columnFilters.supplier || ''}
              onChange={(e) => handleColumnFilter('supplier', e.target.value)}
            />
            {columnFilters.supplier && (
              <button
                onClick={() => clearColumnFilter('supplier')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <Filter className="h-4 w-4 mr-1" />
              <span>Filtreler</span>
            </div>
            {Object.keys(columnFilters).length > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-blue-600 hover:text-blue-800 ml-2"
              >
                Temizle
              </button>
            )}
          </div>
        </div>

        {/* Malzeme Tablosu */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 w-8">
                  <input
                    type="checkbox"
                    checked={selectedMaterials.length === filteredMaterials.length && filteredMaterials.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Malzeme Adı</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Barkod</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Kategori</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Mevcut Stok</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Kritik Stok</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Birim Fiyatı</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tedarikçi</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Son Sayım</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map((material) => {
                const isLowStock = material.currentStock <= material.minStock;
                const isSelected = selectedMaterials.includes(material.id);
                
                return (
                  <tr 
                    key={material.id} 
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      isLowStock ? 'bg-red-50 hover:bg-red-100' : ''
                    } ${isSelected ? 'bg-blue-50 hover:bg-blue-100' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleMaterialSelect(material.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{material.name}</span>
                        {isLowStock && (
                          <AlertTriangle className="h-4 w-4 text-red-500" data-tooltip="Kritik Stok" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{material.barcode}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{material.category}</td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${
                        material.currentStock <= material.minStock 
                          ? 'text-red-600' 
                          : material.currentStock <= material.minStock * 2 
                          ? 'text-yellow-600' 
                          : 'text-green-600'
                      }`}>
                        {material.currentStock} {material.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {material.minStock} {material.unit}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      ₺{material.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{material.supplier}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {material.lastStockCountDate ? (
                        <div className="space-y-1">
                          <div>{new Date(material.lastStockCountDate).toLocaleDateString('tr-TR')}</div>
                          <div className="text-xs text-gray-500">
                            {material.lastStockCountBy} - {material.lastStockCountQuantity} {material.unit}
                          </div>
                        </div>
                      ) : (
                        'Henüz sayım yapılmadı'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingMaterial(material)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Düzenle"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleShowStockHistory(material)}
                          className="text-purple-600 hover:text-purple-800 p-1"
                          title="Stok Geçmişi"
                        >
                          <History className="h-4 w-4" />
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
                );
              })}
            </tbody>
          </table>

          {/* Boş durum */}
          {filteredMaterials.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Malzeme bulunamadı</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || Object.keys(columnFilters).length > 0 
                  ? 'Arama kriterlerinize uygun malzeme bulunamadı.'
                  : 'Henüz hiç malzeme eklenmemiş.'
                }
              </p>
              {(searchTerm || Object.keys(columnFilters).length > 0) && (
                <button
                  onClick={clearAllFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
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
            Toplam <span className="font-semibold">{filteredMaterials.length}</span> malzeme
            {materials.length !== filteredMaterials.length && (
              <span> (filtrelenmiş)</span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {lowStockMaterials.length > 0 && (
              <span className="text-red-600 font-semibold">
                {lowStockMaterials.length} kritik stok
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Modal ve Diğer Bileşenler */}
      {(showAddModal || editingMaterial) && (
        <MaterialModal
          material={editingMaterial}
          categories={categories}
          suppliers={suppliers}
          onAddCategory={() => setShowCategoryModal(true)}
          onAddSupplier={() => setShowSupplierModal(true)}
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

      {/* Kategori Ekleme Modal */}
      {showCategoryModal && (
        <CategoryModal
          newCategory={newCategory}
          setNewCategory={setNewCategory}
          onSave={handleAddCategory}
          onClose={() => setShowCategoryModal(false)}
        />
      )}

      {/* Tedarikçi Ekleme Modal */}
      {showSupplierModal && (
        <SupplierModal
          newSupplier={newSupplier}
          setNewSupplier={setNewSupplier}
          onSave={handleAddSupplier}
          onClose={() => setShowSupplierModal(false)}
        />
      )}

      {/* Stok Geçmişi Modal */}
      {showStockHistory && selectedMaterial && (
        <StockHistoryModal
          material={selectedMaterial}
          stockCounts={stockCounts}
          onClose={() => {
            setShowStockHistory(false);
            setSelectedMaterial(null);
          }}
        />
      )}
    </div>
  );
}

// Yardımcı Modal Bileşenleri
interface MaterialModalProps {
  material?: Material | null;
  categories: Category[];
  suppliers: Supplier[];
  onAddCategory: () => void;
  onAddSupplier: () => void;
  onSave: (material: any) => void;
  onClose: () => void;
}

function MaterialModal({ material, categories, suppliers, onAddCategory, onAddSupplier, onSave, onClose }: MaterialModalProps) {
  const [formData, setFormData] = useState({
    name: material?.name || '',
    barcode: material?.barcode || '',
    unit: material?.unit || 'adet',
    unitPrice: material?.unitPrice || 0,
    currentStock: material?.currentStock || 0,
    minStock: material?.minStock || 0,
    supplier: material?.supplier || '',
    category: material?.category || '',
  });

  const units = ['adet', 'kutu', 'şişe', 'tüp', 'paket', 'ampul', 'kg', 'lt', 'metre'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {material ? 'Malzeme Düzenle' : 'Yeni Malzeme Ekle'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Malzeme Adı *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Barkod *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
              <div className="flex space-x-2">
                <select
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Seçiniz</option>
                  {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
                <button
                  type="button"
                  onClick={onAddCategory}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Birim *</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Birim Fiyat (₺) *</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kritik Stok *</label>
              <input
                type="number"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mevcut Stok *</label>
            <input
              type="number"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.currentStock}
              onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tedarikçi *</label>
            <div className="flex space-x-2">
              <select
                required
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              >
                <option value="">Seçiniz</option>
                {suppliers.map(sup => <option key={sup.id} value={sup.name}>{sup.name}</option>)}
              </select>
              <button
                type="button"
                onClick={onAddSupplier}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                +
              </button>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {material ? 'Güncelle' : 'Ekle'}
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

// Kategori Modal
interface CategoryModalProps {
  newCategory: string;
  setNewCategory: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

function CategoryModal({ newCategory, setNewCategory, onSave, onClose }: CategoryModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Yeni Kategori Ekle</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori Adı *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Kategori adını girin"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Ekle
            </button>
            <button
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

// Tedarikçi Modal
interface SupplierModalProps {
  newSupplier: any;
  setNewSupplier: (value: any) => void;
  onSave: () => void;
  onClose: () => void;
}

function SupplierModal({ newSupplier, setNewSupplier, onSave, onClose }: SupplierModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Yeni Tedarikçi Ekle</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tedarikçi Adı *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newSupplier.name}
              onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
              placeholder="Tedarikçi adını girin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              İlgili Kişi
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newSupplier.contactPerson}
              onChange={(e) => setNewSupplier({...newSupplier, contactPerson: e.target.value})}
              placeholder="İlgili kişi adı"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newSupplier.phone}
                onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                placeholder="Telefon numarası"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-posta
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                placeholder="E-posta adresi"
              />
            </div>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Ekle
            </button>
            <button
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

// Stok Geçmişi Modal
function StockHistoryModal({ material, stockCounts, onClose }: { material: Material; stockCounts: any[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Stok Geçmişi - {material.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Mevcut Stok</p>
            <p className="text-2xl font-bold text-blue-800">{material.currentStock} {material.unit}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-600">Kritik Stok</p>
            <p className="text-2xl font-bold text-yellow-800">{material.minStock} {material.unit}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Son Sayım</p>
            <p className="text-lg font-bold text-green-800">
              {material.lastStockCountDate 
                ? new Date(material.lastStockCountDate).toLocaleDateString('tr-TR')
                : 'Yok'
              }
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Sayım Geçmişi</h4>
          {stockCounts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Tarih</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Sayım Yapan</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Sayılan Miktar</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Durum</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Onaylayan</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Notlar</th>
                  </tr>
                </thead>
                <tbody>
                  {stockCounts.map((count) => (
                    <tr key={count.id} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-sm">
                        {new Date(count.countDate).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-2 px-3 text-sm">{count.countedBy}</td>
                      <td className="py-2 px-3 text-sm font-semibold">
                        {count.countedQuantity} {material.unit}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          count.status === 'onaylandı' ? 'bg-green-100 text-green-800' :
                          count.status === 'beklemede' ? 'bg-yellow-100 text-yellow-800' :
                          count.status === 'reddedildi' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {count.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-600">
                        {count.verifiedBy || '-'}
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-600">
                        {count.notes || count.correctionNotes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Henüz sayım kaydı bulunmamaktadır.</p>
          )}
        </div>

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