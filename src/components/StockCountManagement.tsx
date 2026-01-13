import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, ClipboardList, Eye, Filter, Barcode, Package, Users, Camera, X, FileText, FileUp, ChevronLeft, ChevronRight, CheckSquare, Square, Download, Upload, Save, Edit2, Check, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { StockCount, Material, StockCountSession, MaterialStatus, SessionSummary, Supplier } from '../types';
import { dataService } from "../utils/dataService";

// Hızlı Sayım Modal Component'i
function QuickCountModal({ 
  session, 
  onAdd, 
  onClose 
}: { 
  session: StockCountSession;
  onAdd: (counts: Omit<StockCount, 'id' | 'createdAt'>[]) => void;
  onClose: () => void;
}) {
  const [barcode, setBarcode] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [countedItems, setCountedItems] = useState<{material: Material, quantity: number}[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchAttempts, setSearchAttempts] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    loadMaterials();
    loadSuppliers();
  }, []);

  const loadMaterials = () => {
    const allMaterials = dataService.getMaterials();
    setMaterials(allMaterials);
  };

  const loadSuppliers = () => {
    // dataService'e tedarikçi fonksiyonları eklemelisiniz
    const allSuppliers = dataService.getSuppliers ? dataService.getSuppliers() : [];
    setSuppliers(allSuppliers);
  };

  // All Barkod parse fonksiyonu - Sadece Barkod ve GTIN çözümle
  const parseAllBarcode = (allBarcode: string) => {
    let barcode = '';
    let gtin = '';
    
    try {
      // All Barcode formatı: 01...17...21...30...
      if (allBarcode.startsWith('01') && allBarcode.length >= 30) {
        // 01 (GTIN) kısmını bul - 14 haneli
        const gtinMatch = allBarcode.match(/01(\d{14})/);
        if (gtinMatch && gtinMatch[1]) {
          gtin = gtinMatch[1];
          barcode = gtinMatch[1].replace(/^0+/, ''); // Baştaki sıfırları kaldır
        }
        
        // 21 (SN) kısmını BUL ama kullanma - sadece debug için
        const snMatch = allBarcode.match(/21(\d+)/);
        if (snMatch) {
          console.log('DEBUG: All Barcode içinde SN bulundu:', snMatch[1], 'ama kullanılmıyor');
        }
      } else {
        barcode = allBarcode;
      }
    } catch (error) {
      console.error('Barkod parse hatası:', error);
      barcode = allBarcode;
    }
    
    return {
      barcode: barcode,
      gtin: gtin,
      sn: '' // SN BOŞ BIRAK - kullanıcı girecek
    };
  };

  // Barkod numarasına göre malzeme bulma
  const findMaterialByBarcode = (barcode: string) => {
    return materials.find(m => 
      m.barcode === barcode ||
      m.gtin === barcode ||
      m.udiCode === barcode ||
      m.allBarcode === barcode ||
      (m.allBarcode && m.allBarcode.split(',').map(b => b.trim()).includes(barcode))
    );
  };

  // SN numarasına göre malzeme bulma
  const findMaterialBySN = (sn: string) => {
    return materials.find(m => m.sn === sn);
  };

  // Yeni malzeme oluşturma fonksiyonu
  const createNewMaterial = (parsedData: { barcode: string, gtin: string, sn: string }, baseMaterial?: Material) => {
    const baseMaterialData = baseMaterial || {
      name: `YENİ ÜRÜN - ${parsedData.barcode}`,
      category: 'Diğer',
      subCategory: '',
      unit: 'adet',
      unitPrice: 0,
      currentStock: 0,
      minStock: 0,
      minStockLevel: 0,
      supplier: '',
      isActive: true,
      status: 'normal' as MaterialStatus,
      expirationDate: '',
      serialNoStatus: '',
      materialDescription: '',
      intuitiveCode: '',
      serialNumber: ''
    };

    const newMaterialData: Omit<Material, 'id' | 'createdAt' | 'updatedAt'> = {
      ...baseMaterialData,
      barcode: parsedData.barcode,
      gtin: parsedData.gtin || baseMaterialData.gtin || '',
      sn: '', // SN BOŞ BIRAKILDI - kullanıcı girecek
      name: baseMaterial ? `${baseMaterial.name}` : `YENİ ÜRÜN - ${parsedData.barcode}`,
      allBarcode: allBarcodeInput || ''
    };

    const newMaterial = dataService.saveMaterial(newMaterialData);
    
    loadMaterials();
    
    return newMaterial;
  };

  // SN girişi için modal
  const [showSNModal, setShowSNModal] = useState(false);
  const [currentParsedData, setCurrentParsedData] = useState<{barcode: string, gtin: string, sn: string} | null>(null);
  const [snInput, setSnInput] = useState('');
  const [allBarcodeInput, setAllBarcodeInput] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Diğer');
  const [expirationDate, setExpirationDate] = useState('');

  const handleBarcodeInput = async (value: string) => {
    setBarcode(value);
    setAllBarcodeInput(value);
    
    if (value.trim()) {
      loadMaterials();
      
      let parsedData = { barcode: value, gtin: '', sn: '' };
      
      // All Barkod formatı mı kontrol et
      if (value.startsWith('01') && value.length >= 30) {
        parsedData = parseAllBarcode(value);
        
        if (!parsedData.barcode && !parsedData.gtin) {
          parsedData.barcode = value;
        }
      }
      
      setCurrentParsedData(parsedData);
      
      // SN giriş modalını aç
      setShowSNModal(true);
    }
  };

  const handleSNSubmit = () => {
    if (!snInput.trim() || !currentParsedData) {
      alert('Lütfen SN numarası giriniz!');
      return;
    }

    // SN kontrolü - aynı SN var mı?
    const existingMaterialWithSN = findMaterialBySN(snInput.trim());
    
    if (existingMaterialWithSN) {
      // Aynı SN var, mevcut malzemeyi kullan
      if (session.sessionStatus && existingMaterialWithSN.status !== session.sessionStatus) {
        alert(`SN ${snInput} ile kayıtlı malzeme bu oturum statüsüne uygun değil!`);
        setSnInput('');
        setShowSNModal(false);
        return;
      }
      
      // Mevcut malzemenin bilgilerini güncelle
      const updatedMaterialData = {
        ...existingMaterialWithSN,
        barcode: currentParsedData.barcode || existingMaterialWithSN.barcode,
        gtin: currentParsedData.gtin || existingMaterialWithSN.gtin,
        supplier: selectedSupplier || existingMaterialWithSN.supplier,
        category: selectedCategory || existingMaterialWithSN.category,
        expirationDate: expirationDate || existingMaterialWithSN.expirationDate,
        allBarcode: allBarcodeInput || existingMaterialWithSN.allBarcode
      };
      
      // Malzemeyi güncelle
      dataService.updateMaterial(existingMaterialWithSN.id, updatedMaterialData);
      
      // Güncellenmiş malzemeyi al
      const updatedMaterial = dataService.getMaterials().find(m => m.id === existingMaterialWithSN.id);
      
      if (updatedMaterial) {
        // Malzemeyi sayım listesine ekle
        const existingIndex = countedItems.findIndex(item => item.material.id === updatedMaterial.id);
        
        if (existingIndex >= 0) {
          const newItems = [...countedItems];
          newItems[existingIndex].quantity += 1;
          newItems[existingIndex].material = updatedMaterial;
          setCountedItems(newItems);
        } else {
          setCountedItems([...countedItems, { material: updatedMaterial, quantity: 1 }]);
        }
        
        alert(`SN ${snInput} zaten sistemde kayıtlı. "${updatedMaterial.name}" malzemesinin stoğu güncellendi ve bilgileri güncellendi.`);
      }
    } else {
      // Yeni malzeme oluştur
      // Önce barkod/GTIN ile mevcut malzeme var mı kontrol et
      let baseMaterial: Material | undefined;
      
      if (currentParsedData.barcode) {
        baseMaterial = findMaterialByBarcode(currentParsedData.barcode);
      }
      
      if (!baseMaterial && currentParsedData.gtin) {
        baseMaterial = findMaterialByBarcode(currentParsedData.gtin);
      }
      
      // Yeni malzeme oluştur
      const newMaterialData: Omit<Material, 'id' | 'createdAt' | 'updatedAt'> = {
        name: baseMaterial ? baseMaterial.name : `Ürün - ${currentParsedData.barcode}`,
        barcode: currentParsedData.barcode,
        gtin: currentParsedData.gtin || '',
        sn: snInput.trim(),
        category: selectedCategory,
        subCategory: baseMaterial ? baseMaterial.subCategory : '',
        unit: baseMaterial ? baseMaterial.unit : 'adet',
        unitPrice: baseMaterial ? baseMaterial.unitPrice : 0,
        currentStock: 1,
        minStock: baseMaterial ? baseMaterial.minStock : 0,
        minStockLevel: baseMaterial ? baseMaterial.minStockLevel : 0,
        supplier: selectedSupplier,
        isActive: true,
        status: baseMaterial ? baseMaterial.status : 'normal',
        expirationDate: expirationDate,
        serialNoStatus: '',
        materialDescription: '',
        intuitiveCode: '',
        serialNumber: snInput.trim(),
        udiCode: baseMaterial ? baseMaterial.udiCode : '',
        allBarcode: allBarcodeInput
      };

      const newMaterial = dataService.saveMaterial(newMaterialData);
      loadMaterials();
      
      // Yeni malzemeyi sayım listesine ekle
      setCountedItems([...countedItems, { material: newMaterial, quantity: 1 }]);
      
      alert(`Yeni malzeme oluşturuldu: ${newMaterial.name}\nSN: ${newMaterial.sn}`);
    }
    
    setSnInput('');
    setSelectedSupplier('');
    setSelectedCategory('Diğer');
    setExpirationDate('');
    setShowSNModal(false);
    setBarcode('');
    setAllBarcodeInput('');
  };

  const handleManualAdd = () => {
    if (barcode.trim()) {
      handleBarcodeInput(barcode);
    }
  };

  const handleSave = async () => {
    if (countedItems.length === 0) {
      alert('Lütfen önce malzeme okutun!');
      return;
    }

    setIsSaving(true);
    
    const counts: Omit<StockCount, 'id' | 'createdAt'>[] = countedItems.map(item => ({
      sessionId: session.id,
      materialId: item.material.id,
      barcode: item.material.barcode,
      countedQuantity: item.quantity,
      unitPrice: item.material.unitPrice,
      totalValue: item.quantity * item.material.unitPrice,
      countDate: new Date().toISOString(),
      countedBy: session.countedBy,
      status: 'tamamlandı',
      notes: 'Hızlı sayım ile eklendi',
      verifiedBy: '',
      verifiedAt: '',
      correctionNotes: ''
    }));

    // MALZEMELERİN STOĞUNU GÜNCELLE
    countedItems.forEach(item => {
      const newStock = item.material.currentStock + item.quantity;
      dataService.updateMaterial(item.material.id, {
        currentStock: newStock
      });
      
      dataService.logAction({
        action: 'STOK_GÜNCELLENDİ',
        module: 'STOK_TAKİP',
        recordId: item.material.barcode,
        details: `${item.material.name} (SN: ${item.material.sn}) stoğu ${item.quantity} adet artırıldı. Yeni stok: ${newStock}`,
        performedBy: dataService.getCurrentUser().name,
      });
    });

    onAdd(counts);
    setIsSaving(false);
    alert(`${countedItems.length} malzeme başarıyla kaydedildi! Stoğu güncellendi.`);
    onClose();
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...countedItems];
    newItems.splice(index, 1);
    setCountedItems(newItems);
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const newItems = [...countedItems];
    newItems[index].quantity = newQuantity;
    setCountedItems(newItems);
  };

  const calculateTotalValue = () => {
    return countedItems.reduce((total, item) => 
      total + (item.quantity * item.material.unitPrice), 0
    );
  };

  const handleManualSearch = () => {
    const searchCode = prompt('Aramak istediğiniz Barkod/GTIN/All Barcode kodunu girin:');
    if (searchCode && searchCode.trim()) {
      handleBarcodeInput(searchCode.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold">Hızlı Sayım - {session.invoiceNo}</h3>
            <p className="text-gray-600">
              Oturum: {session.sessionNo} | Statü: {session.sessionStatus || 'Tüm Malzemeler'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Barkod Giriş Alanı */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3">Barkod Okuma</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Barkod/GTIN/All Barcode
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleManualAdd();
                        }
                      }}
                      placeholder="Barkod taratın veya girin"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowScanner(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <Camera className="h-5 w-5" />
                      <span>Tara</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Barkod, GTIN veya All Barcode girebilirsiniz
                  </p>
                </div>

                <button
                  onClick={handleManualAdd}
                  disabled={!barcode.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Manuel Ekle
                </button>
                
                <button
                  onClick={handleManualSearch}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Search className="h-4 w-4" />
                  <span>Manuel Arama Yap</span>
                </button>
              </div>
            </div>

            {/* İstatistikler */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">İstatistikler</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Malzeme:</span>
                  <span className="font-semibold">{countedItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Adet:</span>
                  <span className="font-semibold">
                    {countedItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Değer:</span>
                  <span className="font-semibold text-green-600">
                    ₺{calculateTotalValue().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Sistem Bilgileri */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-3">Sistem Bilgileri</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Malzeme:</span>
                  <span className="font-semibold">{materials.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Filtrelenmiş:</span>
                  <span className="font-semibold">
                    {materials.filter(m => !session.sessionStatus || m.status === session.sessionStatus).length}
                  </span>
                </div>
                {searchAttempts.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <div className="flex items-center space-x-1 text-yellow-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">{searchAttempts.length} başarısız arama</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sayılan Ürünler Listesi */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-800">
                    Sayılan Ürünler ({countedItems.length})
                  </h4>
                  {countedItems.length > 0 && (
                    <button
                      onClick={() => setCountedItems([])}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Listeyi Temizle
                    </button>
                  )}
                </div>
              </div>

              {countedItems.length > 0 ? (
                <div className="overflow-y-auto max-h-[400px]">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Ürün Adı</th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Barkod/GTIN</th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">SN</th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Birim Fiyat</th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Adet</th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Toplam</th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {countedItems.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-4">
                            <div className="font-medium text-sm">{item.material.name}</div>
                            <div className="text-xs text-gray-600">{item.material.category}</div>
                          </td>
                          <td className="py-2 px-4">
                            <div className="text-sm font-mono">{item.material.barcode}</div>
                            {item.material.gtin && (
                              <div className="text-xs text-gray-500">GTIN: {item.material.gtin}</div>
                            )}
                          </td>
                          <td className="py-2 px-4">
                            <div className="text-sm font-mono">{item.material.sn || 'Yok'}</div>
                          </td>
                          <td className="py-2 px-4 text-sm">
                            ₺{item.material.unitPrice.toFixed(2)}
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleUpdateQuantity(index, parseInt(e.target.value) || 1)}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                              />
                              <button
                                onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-2 px-4 text-sm font-semibold text-green-600">
                            ₺{(item.quantity * item.material.unitPrice).toFixed(2)}
                          </td>
                          <td className="py-2 px-4">
                            <button
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Sil"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={4} className="py-3 px-4 text-right font-medium">
                          Genel Toplam:
                        </td>
                        <td colSpan={3} className="py-3 px-4 text-lg font-bold text-green-600">
                          ₺{calculateTotalValue().toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz ürün eklenmedi</h3>
                  <p className="text-gray-500 mb-2">
                    Barkod taratarak veya manuel giriş yaparak ürün ekleyin
                  </p>
                  <div className="text-xs text-gray-400 mt-4">
                    <p>Desteklenen kod formatları:</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>Barkod</li>
                      <li>GTIN</li>
                      <li>All Barcode</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alt Butonlar */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {countedItems.length} ürün, {countedItems.reduce((sum, item) => sum + item.quantity, 0)} adet
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={countedItems.length === 0 || isSaving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Sayımı Kaydet ({countedItems.length} ürün)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Barkod Tarama Modal */}
        {showScanner && (
          <BarcodeScannerModal
            onScan={(scannedBarcode) => {
              handleBarcodeInput(scannedBarcode);
              setShowScanner(false);
            }}
            onClose={() => setShowScanner(false)}
          />
        )}

        {/* SN Giriş Modal */}
        {showSNModal && currentParsedData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Malzeme Bilgileri</h3>
                <button onClick={() => {
                  setShowSNModal(false);
                  setSnInput('');
                  setCurrentParsedData(null);
                }} className="text-gray-500 hover:text-gray-700">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">All Barkod Çözümlendi</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Barkod:</span>
                      <div className="font-mono">{currentParsedData.barcode}</div>
                    </div>
                    <div>
                      <span className="font-medium">GTIN:</span>
                      <div className="font-mono">{currentParsedData.gtin}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SN Numarası *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    value={snInput}
                    onChange={(e) => setSnInput(e.target.value)}
                    placeholder="Örnek: 6S250586007"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Her lensin benzersiz SN numarasını girin
                  </p>
                </div>

                {/* Malzeme Bilgileri Düzenleme */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Malzeme Bilgileri</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Kategori:</span>
                      <select
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="Diğer">Diğer</option>
                        <option value="Medikal">Medikal</option>
                        <option value="İlaç">İlaç</option>
                        <option value="Laboratuvar">Laboratuvar</option>
                        <option value="Sarj">Sarj</option>
                        <option value="Cerrah">Cerrah</option>
                        <option value="Ameliyathane">Ameliyathane</option>
                      </select>
                    </div>
                    <div>
                      <span className="font-medium">Tedarikçi:</span>
                      <select
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.target.value)}
                      >
                        <option value="">Seçiniz</option>
                        {suppliers.map(supplier => (
                          <option key={supplier.id} value={supplier.name}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="font-medium">SKT (Son Kullanma Tarihi):</span>
                      <input
                        type="date"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowSNModal(false);
                      setSnInput('');
                      setCurrentParsedData(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSNSubmit}
                    disabled={!snInput.trim()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                  >
                    Tamam
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
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
                Veya barkodu manuel girin (Barkod/GTIN/All Barcode):
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Barkod, GTIN veya All Barcode numarasını girin"
                autoFocus
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={scanning ? stopCameraScan : startCameraScan}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Camera className="h-4 w-4" />
                <span>{scanning ? 'Kamerayı Kapat' : 'Kamerayı Aç'}</span>
              </button>
              <button
                type="submit"
                disabled={!manualBarcode.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
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

// Sayım Arayüzü Modal Component
interface CountingInterfaceModalProps {
  session: StockCountSession;
  materials: Material[];
  onSave: (count: Omit<StockCount, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

function CountingInterfaceModal({ session, materials, onSave, onClose }: CountingInterfaceModalProps) {
  const [barcode, setBarcode] = useState('');
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null);
  const [countedQuantity, setCountedQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [parsedData, setParsedData] = useState({ barcode: '', gtin: '', sn: '' });
  const [editableSN, setEditableSN] = useState('');
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [editableExpiration, setEditableExpiration] = useState('');
  const [snCheckResult, setSnCheckResult] = useState<{exists: boolean, material?: Material} | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState('');
  const [baseMaterialInfo, setBaseMaterialInfo] = useState<Material | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Diğer');

  // Sayım arayüzü açıldığında malzemeleri yükle
  useEffect(() => {
    const loadedMaterials = dataService.getMaterials();
    setAllMaterials(loadedMaterials);
    
    // Tedarikçileri yükle
    const loadedSuppliers = dataService.getSuppliers ? dataService.getSuppliers() : [];
    setSuppliers(loadedSuppliers);
  }, []);

  // All Barkod'dan sadece barkod ve GTIN çıkarma fonksiyonu
  const parseAllBarcode = (allBarcode: string) => {
    let barcode = '';
    let gtin = '';
    
    try {
      // All Barcode formatı: 01...17...21...30...
      if (allBarcode.startsWith('01') && allBarcode.length >= 30) {
        // 01 (GTIN) kısmını bul - 14 haneli
        const gtinMatch = allBarcode.match(/01(\d{14})/);
        if (gtinMatch && gtinMatch[1]) {
          gtin = gtinMatch[1];
          barcode = gtinMatch[1].replace(/^0+/, ''); // Baştaki sıfırları kaldır
        }
      } else {
        barcode = allBarcode;
      }
    } catch (error) {
      console.error('Barkod parse hatası:', error);
      barcode = allBarcode;
    }
    
    return {
      barcode: barcode,
      gtin: gtin,
      sn: '' // SN BOŞ BIRAK - kullanıcı girecek
    };
  };

  // Barkod numarasına göre malzeme bulma
  const findMaterialByBarcode = (code: string, materialsToSearch: Material[]) => {
    return materialsToSearch.find(m => 
      m.barcode === code ||
      m.gtin === code ||
      m.udiCode === code ||
      m.allBarcode === code ||
      (m.allBarcode && m.allBarcode.split(',').map(b => b.trim()).includes(code))
    );
  };

  // SN kontrolü yap
  const checkSN = (sn: string) => {
    if (!sn.trim()) {
      setSnCheckResult(null);
      return;
    }
    
    const existingMaterialWithSN = allMaterials.find(m => m.sn === sn);
    if (existingMaterialWithSN) {
      setSnCheckResult({
        exists: true,
        material: existingMaterialWithSN
      });
    } else {
      setSnCheckResult({ exists: false });
    }
  };

  const handleBarcodeScan = (scannedBarcode: string) => {
    setBarcode(scannedBarcode);
    handleBarcodeChange(scannedBarcode);
    setShowBarcodeScanner(false);
  };

  const handleBarcodeChange = async (value: string) => {
    setBarcode(value);
    setLastScannedCode(value);
    
    if (value) {
      const refreshedMaterials = dataService.getMaterials();
      setAllMaterials(refreshedMaterials);
      
      let parsed = { barcode: '', gtin: '', sn: '' };
      
      // All Barkod formatı mı kontrol et
      if (value.startsWith('01') && value.length >= 30) {
        parsed = parseAllBarcode(value);
        setParsedData(parsed);
      } else {
        parsed = { barcode: value, gtin: value, sn: '' };
        setParsedData(parsed);
      }
      
      // Barkod/GTIN ile temel malzeme bilgilerini bul
      let baseMaterial: Material | undefined;
      
      if (parsed.barcode) {
        baseMaterial = findMaterialByBarcode(parsed.barcode, refreshedMaterials);
      }
      
      if (!baseMaterial && parsed.gtin) {
        baseMaterial = findMaterialByBarcode(parsed.gtin, refreshedMaterials);
      }
      
      // Temel malzeme bilgilerini set et (SN olmadan)
      if (baseMaterial) {
        setBaseMaterialInfo(baseMaterial);
        setSelectedCategory(baseMaterial.category);
        setSelectedSupplier(baseMaterial.supplier);
        setEditableExpiration(baseMaterial.expirationDate || '');
      } else {
        setBaseMaterialInfo(null);
        setSelectedCategory('Diğer');
        setSelectedSupplier('');
        setEditableExpiration('');
      }
      
      // Current material'ı temizle, kullanıcı SN girecek
      setCurrentMaterial(null);
      setEditableSN('');
      setSnCheckResult(null);
      
      // SN giriş alanına focus yap
      setTimeout(() => {
        const snInput = document.getElementById('sn-input') as HTMLInputElement;
        if (snInput) {
          snInput.focus();
        }
      }, 100);
    } else {
      setCurrentMaterial(null);
      setBaseMaterialInfo(null);
      setParsedData({ barcode: '', gtin: '', sn: '' });
      setEditableSN('');
      setEditableExpiration('');
      setSnCheckResult(null);
      setSelectedCategory('Diğer');
      setSelectedSupplier('');
    }
  };

  // SN değiştiğinde kontrol et
  const handleSNChange = (value: string) => {
    setEditableSN(value);
    
    if (value.trim()) {
      checkSN(value);
      
      // Eğer temel malzeme bilgileri varsa, current material'ı oluştur
      if (baseMaterialInfo || parsedData.barcode) {
        const newMaterial: Material = {
          id: 'temp-' + Date.now(),
          name: baseMaterialInfo ? baseMaterialInfo.name : `Ürün - ${parsedData.barcode}`,
          barcode: parsedData.barcode,
          gtin: parsedData.gtin,
          sn: value,
          category: selectedCategory,
          subCategory: baseMaterialInfo ? baseMaterialInfo.subCategory : '',
          unit: baseMaterialInfo ? baseMaterialInfo.unit : 'adet',
          unitPrice: baseMaterialInfo ? baseMaterialInfo.unitPrice : 0,
          currentStock: 0,
          minStock: baseMaterialInfo ? baseMaterialInfo.minStock : 0,
          minStockLevel: baseMaterialInfo ? baseMaterialInfo.minStockLevel : 0,
          supplier: selectedSupplier,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: baseMaterialInfo ? baseMaterialInfo.status : 'normal',
          expirationDate: editableExpiration,
          serialNoStatus: '',
          materialDescription: '',
          intuitiveCode: '',
          serialNumber: value,
          udiCode: baseMaterialInfo ? baseMaterialInfo.udiCode : '',
          allBarcode: barcode
        };
        
        setCurrentMaterial(newMaterial);
      }
    } else {
      setCurrentMaterial(null);
      setSnCheckResult(null);
    }
  };

  const handleSaveCount = () => {
    if (!editableSN.trim()) {
      alert('Lütfen SN numarası giriniz!');
      return;
    }

    // SN kontrolü - eğer SN zaten varsa
    if (snCheckResult && snCheckResult.exists && snCheckResult.material) {
      // Mevcut malzemenin BİLGİLERİNİ GÜNCELLE
      const updatedMaterialData = {
        ...snCheckResult.material,
        barcode: parsedData.barcode || snCheckResult.material.barcode,
        gtin: parsedData.gtin || snCheckResult.material.gtin,
        supplier: selectedSupplier || snCheckResult.material.supplier,
        category: selectedCategory || snCheckResult.material.category,
        expirationDate: editableExpiration || snCheckResult.material.expirationDate,
        allBarcode: barcode || snCheckResult.material.allBarcode
      };
      
      // Malzemeyi güncelle
      dataService.updateMaterial(snCheckResult.material.id, updatedMaterialData);
      
      // Stoğunu güncelle
      const newStock = snCheckResult.material.currentStock + countedQuantity;
      dataService.updateMaterial(snCheckResult.material.id, {
        currentStock: newStock
      });
      
      // Sayım kaydını oluştur
      const countData: Omit<StockCount, 'id' | 'createdAt'> = {
        sessionId: session.id,
        materialId: snCheckResult.material.id,
        barcode: barcode,
        countedQuantity: countedQuantity,
        unitPrice: snCheckResult.material.unitPrice,
        totalValue: countedQuantity * snCheckResult.material.unitPrice,
        countDate: session.countDate,
        countedBy: session.countedBy,
        status: 'tamamlandı',
        notes: notes,
        verifiedBy: '',
        verifiedAt: '',
        correctionNotes: ''
      };
      
      onSave(countData);
      
      alert(`SN ${editableSN} zaten sistemde kayıtlı. "${snCheckResult.material.name}" malzemesinin stoğu ve bilgileri güncellendi.`);
    } else {
      // Yeni malzeme oluştur
      const materialData: Omit<Material, 'id' | 'createdAt' | 'updatedAt'> = {
        name: baseMaterialInfo ? baseMaterialInfo.name : `Ürün - ${parsedData.barcode}`,
        barcode: parsedData.barcode,
        gtin: parsedData.gtin,
        sn: editableSN,
        category: selectedCategory,
        subCategory: baseMaterialInfo ? baseMaterialInfo.subCategory : '',
        unit: baseMaterialInfo ? baseMaterialInfo.unit : 'adet',
        unitPrice: baseMaterialInfo ? baseMaterialInfo.unitPrice : 0,
        currentStock: countedQuantity,
        minStock: baseMaterialInfo ? baseMaterialInfo.minStock : 0,
        minStockLevel: baseMaterialInfo ? baseMaterialInfo.minStockLevel : 0,
        supplier: selectedSupplier,
        isActive: true,
        status: baseMaterialInfo ? baseMaterialInfo.status : 'normal',
        expirationDate: editableExpiration,
        serialNoStatus: '',
        materialDescription: '',
        intuitiveCode: '',
        serialNumber: editableSN,
        udiCode: baseMaterialInfo ? baseMaterialInfo.udiCode : '',
        allBarcode: barcode
      };
      
      const newMaterial = dataService.saveMaterial(materialData);
      
      // Sayım kaydını oluştur
      const countData: Omit<StockCount, 'id' | 'createdAt'> = {
        sessionId: session.id,
        materialId: newMaterial.id,
        barcode: barcode,
        countedQuantity: countedQuantity,
        unitPrice: newMaterial.unitPrice,
        totalValue: countedQuantity * newMaterial.unitPrice,
        countDate: session.countDate,
        countedBy: session.countedBy,
        status: 'tamamlandı',
        notes: notes,
        verifiedBy: '',
        verifiedAt: '',
        correctionNotes: ''
      };
      
      onSave(countData);
      
      alert(`Yeni malzeme oluşturuldu: ${newMaterial.name}\nSN: ${newMaterial.sn}`);
    }

    // Formu temizle ve sonraki ürüne geç
    setBarcode('');
    setCurrentMaterial(null);
    setBaseMaterialInfo(null);
    setCountedQuantity(1);
    setNotes('');
    setParsedData({ barcode: '', gtin: '', sn: '' });
    setEditableSN('');
    setEditableExpiration('');
    setSnCheckResult(null);
    setSelectedCategory('Diğer');
    setSelectedSupplier('');
    
    // Barkod input'una focus yap
    setTimeout(() => {
      const barcodeInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (barcodeInput) {
        barcodeInput.focus();
      }
    }, 100);
  };

  const handleSaveAndNext = () => {
    handleSaveCount();
  };

  // Mevcut malzeme bilgilerini güncelle
  const updateMaterialField = (field: keyof Material, value: any) => {
    if (!currentMaterial) return;
    
    const updatedMaterial = {...currentMaterial, [field]: value};
    setCurrentMaterial(updatedMaterial);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold">Sayım Arayüzü - {session.invoiceNo}</h3>
            <p className="text-gray-600">Oturum: {session.sessionNo} | Sayım Yapan: {session.countedBy}</p>
            {session.sessionStatus && (
              <p className="text-sm text-blue-600">
                Statü: {session.sessionStatus.toUpperCase()} malzemeleri
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Barkod Giriş ve Malzeme Bilgileri */}
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Sayım Bilgileri</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Sayım Yapan:</span>
                  <div>{session.countedBy}</div>
                </div>
                <div>
                  <span className="font-medium">Tarih:</span>
                  <div>{new Date(session.countDate).toLocaleDateString('tr-TR')}</div>
                </div>
                <div>
                  <span className="font-medium">Oturum No:</span>
                  <div>{session.sessionNo}</div>
                </div>
                <div>
                  <span className="font-medium">Fatura No:</span>
                  <div className="font-semibold text-blue-600">{session.invoiceNo}</div>
                </div>
                {session.sessionStatus && (
                  <div className="col-span-2">
                    <span className="font-medium">Oturum Statüsü:</span>
                    <div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        session.sessionStatus === 'normal' ? 'bg-green-100 text-green-800' :
                        session.sessionStatus === 'konsinye' ? 'bg-blue-100 text-blue-800' :
                        session.sessionStatus === 'iade' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {session.sessionStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barkod/GTIN/All Barcode *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  required
                  className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  value={barcode}
                  onChange={(e) => handleBarcodeChange(e.target.value)}
                  placeholder="Barkod, GTIN veya All Barcode girin"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowBarcodeScanner(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Camera className="h-5 w-5" />
                  <span>Tara</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Barkod, GTIN veya All Barcode girebilirsiniz
              </p>
              
              {/* All Barkod parse edilmişse bilgileri göster */}
              {parsedData.barcode && (
                <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs text-blue-700 mb-1">
                    <strong>All Barkod Çözümlendi:</strong>
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-medium">Barkod:</span>
                      <div className="font-mono">{parsedData.barcode}</div>
                    </div>
                    <div>
                      <span className="font-medium">GTIN:</span>
                      <div className="font-mono">{parsedData.gtin}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Temel Malzeme Bilgileri (Eğer varsa) */}
            {baseMaterialInfo && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">Temel Malzeme Bilgileri</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Malzeme Adı:</span>
                    <div className="font-medium">{baseMaterialInfo.name}</div>
                  </div>
                  <div>
                    <span className="font-medium">Kategori:</span>
                    <div>{baseMaterialInfo.category}</div>
                  </div>
                  <div>
                    <span className="font-medium">Barkod:</span>
                    <div className="font-mono">{baseMaterialInfo.barcode}</div>
                  </div>
                  <div>
                    <span className="font-medium">GTIN:</span>
                    <div className="font-mono">{baseMaterialInfo.gtin || '-'}</div>
                  </div>
                  <div>
                    <span className="font-medium">Birim Fiyat:</span>
                    <div>₺{baseMaterialInfo.unitPrice.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="font-medium">Tedarikçi:</span>
                    <div>{baseMaterialInfo.supplier}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  Bu malzemenin farklı SN'li versiyonunu sayıyorsunuz. Lütfen SN numarasını girin.
                </p>
              </div>
            )}

            {/* SN Giriş */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SN Numarası *
              </label>
              <input
                id="sn-input"
                type="text"
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                value={editableSN}
                onChange={(e) => handleSNChange(e.target.value)}
                placeholder="Örnek: 6S250586007"
              />
              <p className="text-xs text-gray-500 mt-1">
                Her lensin benzersiz SN numarasını girin
              </p>
            </div>

            {/* SN Kontrol Mesajı */}
            {snCheckResult && (
              <div className={`p-3 rounded-lg border ${
                snCheckResult.exists 
                  ? 'bg-yellow-50 border-yellow-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-start space-x-2">
                  <AlertCircle className={`h-5 w-5 mt-0.5 ${
                    snCheckResult.exists ? 'text-yellow-600' : 'text-green-600'
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${
                      snCheckResult.exists ? 'text-yellow-800' : 'text-green-800'
                    }`}>
                      {snCheckResult.exists 
                        ? `SN ${editableSN} zaten sistemde kayıtlı!`
                        : `SN ${editableSN} sistemde kayıtlı değil.`
                      }
                    </p>
                    {snCheckResult.exists && snCheckResult.material && (
                      <div className="text-xs text-gray-600 mt-1">
                        <p>Mevcut malzeme: {snCheckResult.material.name}</p>
                        <p>Barkod: {snCheckResult.material.barcode}</p>
                        <p className="mt-1">Bu malzemenin stoğu ve bilgileri güncellenecek.</p>
                      </div>
                    )}
                    {!snCheckResult.exists && baseMaterialInfo && (
                      <div className="text-xs text-gray-600 mt-1">
                        <p>Yeni malzeme oluşturulacak: {baseMaterialInfo.name}</p>
                        <p>Barkod: {baseMaterialInfo.barcode}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Malzeme Bilgileri Düzenleme (SN girildikten sonra) */}
            {currentMaterial && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Malzeme Bilgileri</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Malzeme Adı:</span>
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                      value={currentMaterial.name}
                      onChange={(e) => updateMaterialField('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <span className="font-medium">Kategori:</span>
                    <select
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        if (currentMaterial) {
                          updateMaterialField('category', e.target.value);
                        }
                      }}
                    >
                      <option value="Diğer">Diğer</option>
                      <option value="Medikal">Medikal</option>
                      <option value="İlaç">İlaç</option>
                      <option value="Laboratuvar">Laboratuvar</option>
                      <option value="Sarj">Sarj</option>
                      <option value="Cerrah">Cerrah</option>
                      <option value="Ameliyathane">Ameliyathane</option>
                    </select>
                  </div>
                  <div>
                    <span className="font-medium">Barkod:</span>
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                      value={currentMaterial.barcode}
                      onChange={(e) => updateMaterialField('barcode', e.target.value)}
                    />
                  </div>
                  <div>
                    <span className="font-medium">GTIN:</span>
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                      value={currentMaterial.gtin || ''}
                      onChange={(e) => updateMaterialField('gtin', e.target.value)}
                    />
                  </div>
                  <div>
                    <span className="font-medium">SN:</span>
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                      value={currentMaterial.sn}
                      onChange={(e) => {
                        updateMaterialField('sn', e.target.value);
                        handleSNChange(e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <span className="font-medium">Birim Fiyat:</span>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                      value={currentMaterial.unitPrice}
                      onChange={(e) => updateMaterialField('unitPrice', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <span className="font-medium">Tedarikçi:</span>
                    <select
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                      value={selectedSupplier}
                      onChange={(e) => {
                        setSelectedSupplier(e.target.value);
                        if (currentMaterial) {
                          updateMaterialField('supplier', e.target.value);
                        }
                      }}
                    >
                      <option value="">Seçiniz</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.name}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="font-medium">SKT (Son Kullanma Tarihi):</span>
                    <input
                      type="date"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                      value={editableExpiration}
                      onChange={(e) => {
                        setEditableExpiration(e.target.value);
                        if (currentMaterial) {
                          updateMaterialField('expirationDate', e.target.value);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sayılan Miktar *
              </label>
              <input
                type="number"
                required
                min="1"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                value={countedQuantity}
                onChange={(e) => setCountedQuantity(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notlar
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Sayım ile ilgili notlar..."
              />
            </div>
          </div>

          {/* Oturum İstatistikleri */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-800 mb-4">Oturum İstatistikleri</h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {dataService.getStockCounts().filter(c => c.sessionId === session.id).length}
                  </div>
                  <div className="text-sm text-gray-600">Toplam Sayılan</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {dataService.getStockCounts().filter(c => c.sessionId === session.id && c.status === 'tamamlandı').length}
                  </div>
                  <div className="text-sm text-gray-600">Tamamlanan</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-medium mb-3">Sistem Bilgileri</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam Malzeme:</span>
                    <span className="font-semibold">{allMaterials.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Oturum için Uygun:</span>
                    <span className="font-semibold">
                      {allMaterials.filter(m => !session.sessionStatus || m.status === session.sessionStatus).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bu Oturumda Sayılan:</span>
                    <span className="font-semibold">
                      {dataService.getStockCounts().filter(c => c.sessionId === session.id).length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-medium mb-3">Son Sayılan Malzemeler</h5>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {dataService.getStockCounts()
                    .filter(c => c.sessionId === session.id)
                    .slice(-5)
                    .reverse()
                    .map((count, index) => {
                      const material = allMaterials.find(m => m.id === count.materialId);
                      return (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium text-sm">{material?.name}</div>
                            <div className="text-xs text-gray-600">
                              {material?.sn ? `SN: ${material.sn}` : `Barkod: ${count.barcode}`}
                            </div>
                            {lastScannedCode && index === 0 && (
                              <div className="text-xs text-blue-600 mt-1">
                                <div>Okunan: {lastScannedCode.substring(0, 20)}...</div>
                                <div>Çözümlenen Barkod: {material?.barcode}</div>
                                {material?.sn && <div>Girilen SN: {material.sn}</div>}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{count.countedQuantity} {material?.unit}</div>
                            <div className="text-xs text-gray-600">{count.countedBy}</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {currentMaterial && (
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
            >
              Kapat
            </button>
            <button
              onClick={handleSaveAndNext}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Kaydet ve Sonraki Ürüne Geç</span>
            </button>
          </div>
        )}

        {/* Barkod Tarama Modal */}
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

// Oturum Detayları Modal Component
interface SessionDetailsModalProps {
  sessionDetails: any[];
  session: StockCountSession | undefined;
  onClose: () => void;
  onViewPdf: () => void;
  onDeleteCount: (countId: string) => void;
}

function SessionDetailsModal({ sessionDetails, session, onClose, onViewPdf, onDeleteCount }: SessionDetailsModalProps) {
  const currentUser = dataService.getCurrentUser();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold">Oturum Detayları - {session?.invoiceNo}</h3>
            <p className="text-gray-600">Oturum No: {session?.sessionNo} | Sayım Yapan: {session?.countedBy}</p>
            {session?.sessionStatus && (
              <p className="text-sm text-blue-600">
                Statü: {session.sessionStatus.toUpperCase()}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onViewPdf}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm"
            >
              <FileText className="h-4 w-4" />
              <span>PDF Göster</span>
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ürün Adı</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Barkod/GTIN</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">SN</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Kategori</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Statü</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Sayılan Miktar</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Birim Fiyatı</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Toplam Değer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Sayım Tarihi</th>
                {currentUser.permissions.manageMaterials && (
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">İşlem</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sessionDetails.map((detail, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{detail.materialName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <div>
                      <div className="font-mono">{detail.barcode}</div>
                      {detail.materialGtin && detail.materialGtin !== '-' && (
                        <div className="text-xs text-gray-500">GTIN: {detail.materialGtin}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm font-mono">
                    {detail.materialSn && detail.materialSn !== '-' ? detail.materialSn : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{detail.materialCategory}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      detail.materialStatus === 'normal' ? 'bg-green-100 text-green-800' :
                      detail.materialStatus === 'konsinye' ? 'bg-blue-100 text-blue-800' :
                      detail.materialStatus === 'iade' ? 'bg-red-100 text-red-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {detail.materialStatus?.toUpperCase() || 'NORMAL'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-blue-600">
                      {detail.countedQuantity} {detail.materialUnit}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    ₺{detail.unitPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    ₺{detail.totalValue.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(detail.countDate).toLocaleDateString('tr-TR')}
                  </td>
                  {currentUser.permissions.manageMaterials && (
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onDeleteCount(detail.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Toplam {sessionDetails.length} kayıt
          </div>
          <div className="flex space-x-2">
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

// Oturum Modal Component
interface SessionModalProps {
  onSave: (session: Omit<StockCountSession, 'id' | 'createdAt' | 'totalProductsCounted' | 'sessionNo'> & { 
    invoiceNo: string;
    pdfFile?: File;
    sessionStatus?: MaterialStatus;
  }) => void;
  onClose: () => void;
}

function SessionModal({ onSave, onClose }: SessionModalProps) {
  const [formData, setFormData] = useState({
    invoiceNo: '',
    startDate: new Date().toISOString().split('T')[0],
    countDate: new Date().toISOString().split('T')[0],
    countedBy: '',
    notes: '',
    sessionStatus: '' as MaterialStatus | ''
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [showQuickCountOption, setShowQuickCountOption] = useState(false);
  const [selectedQuickCountSession, setSelectedQuickCountSession] = useState<StockCountSession | null>(null);

  const currentUser = dataService.getCurrentUser();

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      countedBy: currentUser.name
    }));
  }, [currentUser.name]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else if (file) {
      alert('Lütfen sadece PDF dosyası yükleyin.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.invoiceNo.trim()) {
      alert('Lütfen fatura numarası giriniz!');
      return;
    }

    onSave({
      ...formData,
      pdfFile: pdfFile || undefined,
      sessionStatus: formData.sessionStatus || undefined,
      createdBy: currentUser.name,
      status: 'devam-ediyor'
    });
    
    // Hızlı sayım seçeneği göster
    setShowQuickCountOption(true);
  };

  const handleQuickCount = () => {
    const sessions = dataService.getStockCountSessions();
    const newSession = sessions.find(s => 
      s.invoiceNo === formData.invoiceNo && 
      s.countedBy === formData.countedBy
    );
    
    if (newSession) {
      setSelectedQuickCountSession(newSession);
      setShowQuickCountOption(false);
      onClose();
      
      setTimeout(() => {
        const event = new CustomEvent('startQuickCount', { detail: newSession });
        window.dispatchEvent(event);
      }, 100);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
          <h3 className="text-lg font-semibold mb-4">Yeni Sayım Oturumu</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sayım Yapan *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.countedBy}
                  onChange={(e) => setFormData({ ...formData, countedBy: e.target.value })}
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
                  value={formData.invoiceNo}
                  onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
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
                  value={formData.countDate}
                  onChange={(e) => setFormData({ ...formData, countDate: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlangıç Tarihi *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statü *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.sessionStatus}
                onChange={(e) => setFormData({ ...formData, sessionStatus: e.target.value as MaterialStatus | '' })}
              >
                <option value="">Tüm Malzemeler</option>
                <option value="normal">Normal Malzemeler</option>
                <option value="konsinye">Konsinye Malzemeler</option>
                <option value="iade">İade Malzemeler</option>
                <option value="faturalı">Faturalı Malzemeler</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Sadece seçilen statüdeki malzemeler bu oturumda sayılabilir
              </p>
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
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {pdfFile && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {pdfFile.name} yüklendi
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notlar
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Sayım oturumu ile ilgili notlar..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
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

      {/* Hızlı Sayım Seçeneği Modal */}
      {showQuickCountOption && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Oturum Oluşturuldu!</h3>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckSquare className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">
                    Oturum başarıyla oluşturuldu
                  </span>
                </div>
                <div className="text-sm text-gray-700">
                  <p><span className="font-medium">Fatura No:</span> {formData.invoiceNo}</p>
                  <p><span className="font-medium">Statü:</span> {formData.sessionStatus || 'Tüm Malzemeler'}</p>
                  <p><span className="font-medium">Sayım Yapan:</span> {formData.countedBy}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">Sayıma başlamak için:</h4>
                <div className="space-y-3">
                  <button
                    onClick={handleQuickCount}
                    className="w-full bg-gradient-to-r from-green-600/90 to-green-700/90 hover:from-green-700/90 hover:to-green-800/90 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl"
                  >
                    <Barcode className="h-5 w-5" />
                    <span>Hızlı Sayıma Başla</span>
                  </button>
                  <p className="text-sm text-blue-700 text-center">
                    Barkod taratarak hızlıca sayım yapabilirsiniz
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 text-center">
                  Detaylı sayım için ana sayfadaki "Detaylı Sayım" butonunu kullanabilirsiniz
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowQuickCountOption(false);
                    onClose();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Ana Sayfaya Dön
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hızlı Sayım Modal'ı için event listener */}
      {selectedQuickCountSession && (
        <QuickCountModal
          session={selectedQuickCountSession}
          onAdd={(counts) => {
            setSelectedQuickCountSession(null);
          }}
          onClose={() => setSelectedQuickCountSession(null)}
        />
      )}
    </>
  );
}

export default function StockCountManagement() {
  const [stockCounts, setStockCounts] = useState<StockCount[]>([]);
  const [sessions, setSessions] = useState<StockCountSession[]>([]);
  const [sessionSummaries, setSessionSummaries] = useState<SessionSummary[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<StockCountSession | null>(null);
  const [showCountingInterface, setShowCountingInterface] = useState(false);
  const [selectedSessionDetails, setSelectedSessionDetails] = useState<any[]>([]);
  const [showQuickCountModal, setShowQuickCountModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const currentUser = dataService.getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allMaterials = dataService.getMaterials();
    const allStockCounts = dataService.getStockCounts();
    const allSessions = dataService.getStockCountSessions();
    const summaries = dataService.getSessionSummaries();
    
    if (allSessions.length === 0) {
      const testSession = dataService.saveStockCountSession({
        invoiceNo: 'TEST-001',
        countDate: new Date().toISOString(),
        countedBy: 'Test Kullanıcı',
        createdBy: 'Sistem',
        status: 'tamamlandı',
        notes: 'Test oturumu',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        sessionStatus: 'normal' as MaterialStatus
      });
    }

    setStockCounts(allStockCounts);
    setSessions(dataService.getStockCountSessions());
    setSessionSummaries(dataService.getSessionSummaries());
    setMaterials(allMaterials);
  };

  const refreshMaterials = () => {
    const allMaterials = dataService.getMaterials();
    setMaterials(allMaterials);
    return allMaterials;
  };

  // Sayfalama hesaplamaları
  const filteredSummaries = sessionSummaries.filter(summary => {
    const matchesSearch = searchTerm ? 
      summary.sessionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.countedBy.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    const matchesStatus = filterStatus === 'all' || summary.sessionStatus === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSummaries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSummaries = filteredSummaries.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Yeni oturum oluşturma
  const handleCreateSession = (sessionData: Omit<StockCountSession, 'id' | 'createdAt' | 'totalProductsCounted' | 'sessionNo'> & { 
    invoiceNo: string;
    pdfFile?: File;
    sessionStatus?: MaterialStatus;
  }) => {
    const savedSession = dataService.saveStockCountSession(sessionData);
    
    // PDF dosyasını kaydet
    if (sessionData.pdfFile && savedSession) {
      dataService.saveSessionPdf(savedSession.id, sessionData.pdfFile);
    }
    
    loadData();
    setShowSessionModal(false);
  };

  // Sayım başlatma
  const handleStartCounting = (session: StockCountSession) => {
    refreshMaterials();
    setSelectedSession(session);
    setShowCountingInterface(true);
  };

  // Hızlı sayım başlatma
  const handleQuickCount = (session: StockCountSession) => {
    refreshMaterials();
    setSelectedSession(session);
    setShowQuickCountModal(true);
  };

  // Yeni sayım oluşturma
  const handleCreateCount = (countData: Omit<StockCount, 'id' | 'createdAt'>) => {
    dataService.saveStockCount(countData);
    
    const material = materials.find(m => m.id === countData.materialId);
    if (material) {
      const newStock = material.currentStock + countData.countedQuantity;
      dataService.updateMaterial(material.id, {
        currentStock: newStock
      });
      
      dataService.logAction({
        action: 'STOK_GÜNCELLENDİ',
        module: 'STOK_TAKİP',
        recordId: material.barcode,
        details: `${material.name} (SN: ${material.sn}) stoğu ${countData.countedQuantity} adet artırıldı. Yeni stok: ${newStock}`,
        performedBy: dataService.getCurrentUser().name,
      });
    }
    
    loadData();
  };

  // Toplu sayım oluşturma
  const handleCreateMultipleCounts = (counts: Omit<StockCount, 'id' | 'createdAt'>[]) => {
    counts.forEach(count => {
      dataService.saveStockCount(count);
      
      const material = materials.find(m => m.id === count.materialId);
      if (material) {
        const newStock = material.currentStock + count.countedQuantity;
        dataService.updateMaterial(material.id, {
          currentStock: newStock
        });
      }
    });
    
    dataService.logAction({
      action: 'TOPLU_STOK_GÜNCELLEME',
      module: 'STOK_TAKİP',
      recordId: 'TOPLU_SAYIM',
      details: `${counts.length} malzemenin stoğu güncellendi`,
      performedBy: dataService.getCurrentUser().name,
    });
    
    loadData();
  };

  // Oturum silme
  const handleDeleteSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (confirm(`"${session?.sessionNo}" oturumunu silmek istediğinizden emin misiniz?`)) {
      dataService.deleteStockCountSession(sessionId);
      loadData();
    }
  };

  // Oturum detaylarını görüntüleme
  const handleViewSessionDetails = (sessionId: string) => {
    const details = dataService.getStockCountsBySessionDetailed(sessionId);
    setSelectedSessionDetails(details);
  };

  // Sayım kaydını silme
  const handleDeleteCount = (countId: string) => {
    if (confirm('Bu sayım kaydını silmek istediğinizden emin misiniz? Stok düşürülecektir.')) {
      const count = stockCounts.find(c => c.id === countId);
      if (count) {
        const material = materials.find(m => m.id === count.materialId);
        if (material) {
          const newStock = Math.max(0, material.currentStock - count.countedQuantity);
          dataService.updateMaterial(material.id, {
            currentStock: newStock
          });
        }
        
        dataService.deleteStockCount(countId);
        loadData();
        
        // Oturum detaylarını yenile
        if (selectedSessionDetails.length > 0) {
          const details = dataService.getStockCountsBySessionDetailed(selectedSessionDetails[0].sessionId);
          setSelectedSessionDetails(details);
        }
      }
    }
  };

  // PDF görüntüleme
  const handleViewPdf = (sessionId: string) => {
    const pdfUrl = dataService.getSessionPdfUrl(sessionId);
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      alert('Bu oturuma ait PDF bulunamadı.');
    }
  };

  // Filtreleri temizle
  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setCurrentPage(1);
  };

  // Malzeme test fonksiyonu
  const testMaterialLookup = () => {
    const testCode = prompt('Test etmek istediğiniz kodu girin (Barkod/GTIN):');
    if (testCode && testCode.trim()) {
      const allMaterials = refreshMaterials();
      const material = allMaterials.find(m => 
        m.barcode === testCode ||
        m.gtin === testCode ||
        m.udiCode === testCode ||
        m.allBarcode === testCode ||
        (m.allBarcode && m.allBarcode.split(',').map(b => b.trim()).includes(testCode))
      );
      
      if (material) {
        alert(`Malzeme bulundu!\n\n` +
              `Adı: ${material.name}\n` +
              `Barkod: ${material.barcode}\n` +
              `GTIN: ${material.gtin || '-'}\n` +
              `SN: ${material.sn || '-'}\n` +
              `UDI: ${material.udiCode || '-'}\n` +
              `All Barcode: ${material.allBarcode || '-'}\n` +
              `SKT: ${material.expirationDate ? new Date(material.expirationDate).toLocaleDateString('tr-TR') : '-'}`);
      } else {
        alert(`"${testCode}" kodu ile eşleşen malzeme bulunamadı.`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Başlık ve Yeni Oturum Butonu */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Stok Takip</h2>
          <div className="flex items-center space-x-4 mt-1">
            <div className="text-sm text-gray-600 flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Toplam Malzeme: <span className="font-semibold">{materials.length}</span></span>
            </div>
            <button
              onClick={testMaterialLookup}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              title="Malzeme arama testi"
            >
              <Search className="h-3 w-3" />
              <span>Test</span>
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowSessionModal(true)}
          className="bg-gradient-to-r from-blue-600/90 to-blue-700/90 hover:from-blue-700/90 hover:to-blue-800/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl"
        >
          <Plus className="h-5 w-5" />
          <span>Yeni Sayım Oturumu</span>
        </button>
      </div>

      {/* Ana İçerik */}
      <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md p-6 border border-white/20">
        {/* Arama ve Filtre Çubuğu */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Oturum no, fatura no veya sayım yapan ara..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Filter className="h-5 w-5 text-gray-400 mt-2" />
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tüm Statüler</option>
              <option value="">Tüm Malzemeler</option>
              <option value="normal">Normal Malzemeler</option>
              <option value="konsinye">Konsinye Malzemeler</option>
              <option value="iade">İade Malzemeler</option>
              <option value="faturalı">Faturalı Malzemeler</option>
            </select>
            
            {(searchTerm || filterStatus !== 'all') && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
              >
                Temizle
              </button>
            )}
          </div>
        </div>

        {/* Oturumlar Tablosu */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Oturum No</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Fatura No</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Statü</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Sayım Tarihi</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Sayım Yapan</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Toplam Sayılan Ürün</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Toplam Değer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {currentSummaries.map((summary) => (
                <tr key={summary.sessionId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{summary.sessionNo}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-blue-600 cursor-pointer hover:underline"
                        onClick={() => handleViewSessionDetails(summary.sessionId)}
                      >
                        {summary.invoiceNo}
                      </span>
                      {summary.pdfFile === 'var' && (
                        <button
                          onClick={() => handleViewPdf(summary.sessionId)}
                          className="text-green-600 hover:text-green-800"
                          title="PDF Görüntüle"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {summary.sessionStatus ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        summary.sessionStatus === 'normal' ? 'bg-green-100 text-green-800' :
                        summary.sessionStatus === 'konsinye' ? 'bg-blue-100 text-blue-800' :
                        summary.sessionStatus === 'iade' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {summary.sessionStatus.toUpperCase()}
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
                        TÜM
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(summary.countDate).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{summary.countedBy}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-blue-600 text-lg">
                      {summary.totalProductsCounted}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    ₺{summary.totalValue.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewSessionDetails(summary.sessionId)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Detayları Görüntüle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleQuickCount(sessions.find(s => s.id === summary.sessionId)!)}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Hızlı Sayım"
                      >
                        <Barcode className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          const session = sessions.find(s => s.id === summary.sessionId);
                          if (session) handleStartCounting(session);
                        }}
                        className="text-purple-600 hover:text-purple-800 p-1"
                        title="Detaylı Sayım"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      {currentUser.permissions.manageMaterials && (
                        <button
                          onClick={() => handleDeleteSession(summary.sessionId)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sayfalama Bileşeni */}
        {filteredSummaries.length > 0 ? (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-6 border-t border-gray-200 space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-600">
              Toplam <span className="font-semibold">{filteredSummaries.length}</span> oturum
              {sessionSummaries.length !== filteredSummaries.length && (
                <span> (filtrelenmiş)</span>
              )}
              {' - '}
              Gösterilen: <span className="font-semibold">
                {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSummaries.length)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white/60 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 hover:bg-white/80 transition-all backdrop-blur-sm border border-white/20 disabled:border-gray-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <span className="px-3 py-1 text-sm text-gray-600">
                Sayfa {currentPage} / {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white/60 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 hover:bg-white/80 transition-all backdrop-blur-sm border border-white/20 disabled:border-gray-200"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="text-sm text-gray-600">
              Toplam Sayılan: <span className="font-semibold text-green-600">
                {filteredSummaries.reduce((sum, s) => sum + s.totalProductsCounted, 0)}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Oturum bulunamadı</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all'
                ? 'Arama kriterlerinize uygun oturum bulunamadı.'
                : 'Henüz hiç oturum oluşturulmamış.'
              }
            </p>
            {(searchTerm || filterStatus !== 'all') && (
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-blue-600/90 to-blue-700/90 hover:from-blue-700/90 hover:to-blue-800/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modaller */}
      {showSessionModal && (
        <SessionModal
          onSave={handleCreateSession}
          onClose={() => setShowSessionModal(false)}
        />
      )}

      {showCountingInterface && selectedSession && (
        <CountingInterfaceModal
          session={selectedSession}
          materials={materials.filter(m => 
            selectedSession.sessionStatus ? m.status === selectedSession.sessionStatus : true
          )}
          onSave={handleCreateCount}
          onClose={() => {
            setShowCountingInterface(false);
            setSelectedSession(null);
          }}
        />
      )}

      {showQuickCountModal && selectedSession && (
        <QuickCountModal
          session={selectedSession}
          onAdd={handleCreateMultipleCounts}
          onClose={() => {
            setShowQuickCountModal(false);
            setSelectedSession(null);
          }}
        />
      )}

      {/* Oturum Detayları Modal */}
      {selectedSessionDetails.length > 0 && (
        <SessionDetailsModal
          sessionDetails={selectedSessionDetails}
          session={sessions.find(s => s.id === selectedSessionDetails[0]?.sessionId)}
          onClose={() => setSelectedSessionDetails([])}
          onViewPdf={() => handleViewPdf(selectedSessionDetails[0]?.sessionId)}
          onDeleteCount={handleDeleteCount}
        />
      )}
    </div>
  );
}