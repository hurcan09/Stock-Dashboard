import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, ClipboardList, Eye, Filter, Barcode, Package, Users, Camera, X, FileText, FileUp, ChevronLeft, ChevronRight, CheckSquare, Square, Download, Upload, Save, Edit2, Check, XCircle, AlertCircle } from 'lucide-react';
import { StockCount, Material, StockCountSession, MaterialStatus, SessionSummary } from '../types';
import { dataService } from "../utils/dataService";

// All Barkod parse fonksiyonu - GÜNCELLENMİŞ VERSİYON
const parseAllBarcodeEnhanced = (allBarcode: string) => {
  console.log('All Barcode parse ediliyor:', allBarcode);
  
  // Format: 01{GTIN}17{Tarih}21{SN}30{SN uzunluğu}
  // Örnek: "0100380652555579172810132125734029151301"
  
  let barcode = '';
  let gtin = '';
  let sn = '';
  
  try {
    if (allBarcode.startsWith('01') && allBarcode.length >= 30) {
      // GTIN'i bul (01'den sonraki 14 karakter)
      const gtinMatch = allBarcode.match(/^01(\d{14})/);
      if (gtinMatch && gtinMatch[1]) {
        gtin = gtinMatch[1];
        // GTIN'den barkodu çıkar (ilk 0'ı atla)
        barcode = gtin.startsWith('0') ? gtin.substring(1) : gtin;
      }
      
      // SN'yi bul (21'den sonraki kısım)
      const snStart = allBarcode.indexOf('21');
      if (snStart !== -1) {
        const snPart = allBarcode.substring(snStart + 2);
        const snEnd = snPart.indexOf('30'); // SN'nin sonunu 30 ile belirle
        if (snEnd !== -1) {
          sn = snPart.substring(0, snEnd);
        } else {
          // Eğer 30 yoksa, kalan kısmın tamamını SN olarak al
          sn = snPart;
        }
      }
      
      // SN kontrolü - sadece sayısal ve harf içermeli
      if (sn) {
        sn = sn.replace(/[^a-zA-Z0-9]/g, '');
      }
      
      console.log('Parse sonucu:', { barcode, gtin, sn });
      return { barcode, gtin, sn };
    }
  } catch (error) {
    console.error('Barkod parse hatası:', error);
  }
  
  return { barcode: allBarcode, gtin: '', sn: '' };
};

// Hızlı Sayım Modal Component'i - GÜNCELLENMİŞ
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
  const [lastProcessedSN, setLastProcessedSN] = useState<string>('');

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = () => {
    const allMaterials = dataService.getMaterials();
    setMaterials(allMaterials);
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

  // Barkod numarasına göre benzer malzeme bulma (temel bilgiler için)
  const findSimilarMaterialByBarcode = (barcode: string) => {
    return materials.find(m => 
      m.barcode === barcode ||
      m.gtin === barcode
    );
  };

  // Yeni malzeme oluşturma fonksiyonu - GÜNCELLENMİŞ
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
      status: session.sessionStatus || 'normal' as MaterialStatus,
      expirationDate: '',
      serialNoStatus: '',
      materialDescription: '',
      intuitiveCode: '',
      serialNumber: parsedData.sn
    };

    const newMaterialData: Omit<Material, 'id' | 'createdAt' | 'updatedAt'> = {
      ...baseMaterialData,
      barcode: parsedData.barcode,
      gtin: parsedData.gtin || baseMaterialData.gtin || '',
      sn: parsedData.sn,
      name: baseMaterial ? `${baseMaterial.name} (SN: ${parsedData.sn})` : `YENİ ÜRÜN - ${parsedData.barcode}`,
      allBarcode: parsedData.barcode ? `01${parsedData.gtin || parsedData.barcode}17${new Date().toISOString().slice(2,10)}21${parsedData.sn}30${parsedData.sn.length}` : ''
    };

    const newMaterial = dataService.saveMaterial(newMaterialData);
    
    // Malzemeleri yenile
    loadMaterials();
    
    return newMaterial;
  };

  // Konsinye kontrol fonksiyonu - YENİ
  const checkConsignmentStatus = (material: Material, sessionStatus: MaterialStatus | undefined): boolean => {
    // Eğer malzeme konsinye ise ve oturum faturalı sayım ise hata ver
    if (material.status === 'konsinye' && sessionStatus === 'faturalı') {
      return false;
    }
    return true;
  };

  const handleBarcodeInput = async (value: string) => {
    setBarcode(value);
    
    if (value.trim()) {
      loadMaterials();
      
      let parsedData = { barcode: value, gtin: '', sn: '' };
      
      // All Barkod formatı mı kontrol et
      if (value.startsWith('01') && value.length >= 30) {
        parsedData = parseAllBarcodeEnhanced(value);
        
        console.log('Parsed Data:', parsedData);
        
        // Eğer parse edilemediyse orijinal değeri kullan
        if (!parsedData.barcode && !parsedData.gtin && !parsedData.sn) {
          parsedData.barcode = value;
        }
      }
      
      // Session'a göre filtrele
      const filteredMaterials = materials.filter(m => 
        !session.sessionStatus || m.status === session.sessionStatus
      );
      
      // 1. ÖNCE SN KONTROLÜ - GÜNCELLENDİ
      if (parsedData.sn && parsedData.sn.trim() !== '') {
        const existingMaterialWithSN = findMaterialBySN(parsedData.sn);
        
        if (existingMaterialWithSN) {
          // Konsinye kontrolü
          if (!checkConsignmentStatus(existingMaterialWithSN, session.sessionStatus)) {
            alert(`SN ${parsedData.sn} numaralı ürün Konsinye'dir. Faturalı Sayıma eklenemez!\nLütfen Malzeme Yönetimine girip SN kodlu ürünün statüsünü Faturalı yapın.`);
            setBarcode('');
            return;
          }
          
          // Oturum statüsü kontrolü
          if (session.sessionStatus && existingMaterialWithSN.status !== session.sessionStatus) {
            alert(`SN ${parsedData.sn} zaten sistemde kayıtlı ancak bu oturum statüsüne uygun değil!\nMalzeme statüsü: ${existingMaterialWithSN.status}`);
            setBarcode('');
            return;
          }
          
          // Uygun malzeme bulundu, stoğu güncelle
          const existingIndex = countedItems.findIndex(item => item.material.id === existingMaterialWithSN.id);
          
          if (existingIndex >= 0) {
            const newItems = [...countedItems];
            newItems[existingIndex].quantity += 1;
            setCountedItems(newItems);
          } else {
            setCountedItems([...countedItems, { material: existingMaterialWithSN, quantity: 1 }]);
          }
          
          setLastProcessedSN(parsedData.sn);
          setBarcode('');
          
          // Otomatik bilgi getir
          alert(`SN ${parsedData.sn} bulundu:\nMalzeme: ${existingMaterialWithSN.name}\nStok: ${existingMaterialWithSN.currentStock}`);
          return;
        }
      }
      
      // 2. BARKOD/GTIN İLE ARA
      let material: Material | undefined;
      
      if (parsedData.barcode && parsedData.barcode.trim() !== '') {
        material = findMaterialByBarcode(parsedData.barcode);
      }
      
      if (!material && parsedData.gtin && parsedData.gtin.trim() !== '') {
        material = findMaterialByBarcode(parsedData.gtin);
      }
      
      // 3. BARKOD VAR AMA SN YOKSA KONTROL ET
      if (material) {
        // Konsinye kontrolü
        if (!checkConsignmentStatus(material, session.sessionStatus)) {
          alert(`Barkod ${parsedData.barcode} Konsinye üründür. Bu Sayıma eklenemez!`);
          setBarcode('');
          return;
        }
        
        // Barkod bulundu, ancak SN farklı ise YENİ malzeme oluştur
        if (parsedData.sn && parsedData.sn.trim() !== '' && parsedData.sn !== material.sn) {
          // Bu barkod için benzer malzeme ara (temel bilgiler için)
          const similarMaterial = findSimilarMaterialByBarcode(parsedData.barcode || parsedData.gtin);
          
          // SN ile malzeme var mı kontrol et
          const existingMaterialWithSN = findMaterialBySN(parsedData.sn);
          if (existingMaterialWithSN) {
            // Aynı SN var, onu kullan
            if (!checkConsignmentStatus(existingMaterialWithSN, session.sessionStatus)) {
              alert(`SN ${parsedData.sn} numaralı ürün Konsinye'dir. Faturalı Sayıma eklenemez!`);
              setBarcode('');
              return;
            }
            
            const existingIndex = countedItems.findIndex(item => item.material.id === existingMaterialWithSN.id);
            if (existingIndex >= 0) {
              const newItems = [...countedItems];
              newItems[existingIndex].quantity += 1;
              setCountedItems(newItems);
            } else {
              setCountedItems([...countedItems, { material: existingMaterialWithSN, quantity: 1 }]);
            }
            setLastProcessedSN(parsedData.sn);
            setBarcode('');
            return;
          }
          
          const newMaterial = createNewMaterial(parsedData, similarMaterial || material);
          material = newMaterial;
        }
        
        // Oturum statüsü kontrolü
        if (session.sessionStatus && material.status !== session.sessionStatus) {
          alert(`"${material.name}" malzemesi bu oturum statüsüne uygun değil! Malzeme statüsü: ${material.status}`);
          setBarcode('');
          return;
        }
        
        // Malzemeyi sayım listesine ekle
        const existingIndex = countedItems.findIndex(item => item.material.id === material!.id);
        
        if (existingIndex >= 0) {
          const newItems = [...countedItems];
          newItems[existingIndex].quantity += 1;
          setCountedItems(newItems);
        } else {
          setCountedItems([...countedItems, { material, quantity: 1 }]);
        }
        
        setLastProcessedSN(material.sn || parsedData.sn);
        setBarcode('');
        
        // Otomatik bilgi getir
        alert(`Barkod ${parsedData.barcode} bulundu:\nMalzeme: ${material.name}\nStok: ${material.currentStock}`);
      } else {
        // 4. MALZEME BULUNAMADI, YENİ MALZEME OLUŞTUR
        if (parsedData.barcode || parsedData.gtin || parsedData.sn) {
          // Benzer barkodlu malzeme ara (temel bilgiler için)
          const similarMaterial = findSimilarMaterialByBarcode(parsedData.barcode || parsedData.gtin || '');
          
          // SN kontrolü - eğer SN varsa ve sistemde yoksa
          if (parsedData.sn && parsedData.sn.trim() !== '') {
            const existingMaterialWithSN = findMaterialBySN(parsedData.sn);
            if (existingMaterialWithSN) {
              // SN zaten varsa, onu kullan
              if (!checkConsignmentStatus(existingMaterialWithSN, session.sessionStatus)) {
                alert(`SN ${parsedData.sn} numaralı ürün Konsinye'dir. Faturalı Sayıma eklenemez!`);
                setBarcode('');
                return;
              }
              
              const existingIndex = countedItems.findIndex(item => item.material.id === existingMaterialWithSN.id);
              if (existingIndex >= 0) {
                const newItems = [...countedItems];
                newItems[existingIndex].quantity += 1;
                setCountedItems(newItems);
              } else {
                setCountedItems([...countedItems, { material: existingMaterialWithSN, quantity: 1 }]);
              }
              setLastProcessedSN(parsedData.sn);
              setBarcode('');
              return;
            }
          }
          
          const newMaterial = createNewMaterial(parsedData, similarMaterial);
          
          // Yeni malzemeyi sayım listesine ekle
          setCountedItems([...countedItems, { material: newMaterial, quantity: 1 }]);
          setLastProcessedSN(newMaterial.sn);
          setBarcode('');
          
          alert(`Yeni malzeme oluşturuldu:\nAdı: ${newMaterial.name}\nBarkod: ${newMaterial.barcode}\nSN: ${newMaterial.sn}\nStok: ${newMaterial.currentStock}`);
        } else {
          console.log('Malzeme bulunamadı. Arama girişimi kaydedildi:', value);
          setSearchAttempts(prev => [...prev, value]);
          
          alert(`"${value}" kodu ile eşleşen malzeme bulunamadı veya bu malzeme statüsü bu oturum için uygun değil.\n\n` +
                `Lütfen kontrol edin:\n` +
                `1. Malzeme Yönetimi'nde bu koda sahip malzeme var mı?\n` +
                `2. Malzeme statüsü oturum statüsü ile uyumlu mu?\n` +
                `3. Kod doğru girildi mi?`);
          setBarcode('');
        }
      }
    }
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

    // MALZEMELERİN STOĞUNU GÜNCELLE - GÜNCELLENMİŞ
    countedItems.forEach(item => {
      const newStock = item.material.currentStock + item.quantity;
      dataService.updateMaterial(item.material.id, {
        currentStock: newStock
      });
      
      // Loglama
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
    const searchCode = prompt('Aramak istediğiniz Barkod/GTIN/SN/UDI/All Barcode kodunu girin:');
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
                    Barkod/GTIN/SN/UDI Code/All Barcode
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
                    Barkod, GTIN, SN, UDI Code veya All Barcode girebilirsiniz
                  </p>
                  {lastProcessedSN && (
                    <p className="text-xs text-green-600 mt-1">
                      Son işlenen SN: {lastProcessedSN}
                    </p>
                  )}
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
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Barkod/SN</th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Malzeme</th>
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
                            <div className="text-sm font-mono">{item.material.sn || item.material.barcode}</div>
                            {item.material.gtin && (
                              <div className="text-xs text-gray-500">GTIN: {item.material.gtin}</div>
                            )}
                          </td>
                          <td className="py-2 px-4">
                            <div className="font-medium text-sm">{item.material.name}</div>
                            <div className="text-xs text-gray-600">{item.material.category}</div>
                            {item.material.sn && (
                              <div className="text-xs text-blue-600">SN: {item.material.sn}</div>
                            )}
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
                        <td colSpan={2} className="py-3 px-4 text-lg font-bold text-green-600">
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
                      <li>Seri Numarası (SN)</li>
                      <li>UDI Code</li>
                      <li>All Barcode</li>
                      <li>Sezgisel Kod</li>
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
                Veya barkodu manuel girin (Barkod/GTIN/SN/UDI/All Barcode):
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Barkod, GTIN, SN, UDI veya All Barcode numarasını girin"
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
    
    // Eğer oturum yoksa test oturumu oluştur
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

    // State'leri güncelle
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
          const details = dataService.getStockCountsBySessionDetailed(selectedSessionDetails[0]?.sessionId);
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
    const testCode = prompt('Test etmek istediğiniz kodu girin (Barkod/GTIN/SN):');
    if (testCode && testCode.trim()) {
      const allMaterials = refreshMaterials();
      const material = allMaterials.find(m => 
        m.barcode === testCode ||
        m.gtin === testCode ||
        m.sn === testCode ||
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
              `Statü: ${material.status}\n` +
              `Stok: ${material.currentStock}`);
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

// Sayım Arayüzü Modal Component - GÜNCELLENMİŞ
interface CountingInterfaceModalProps {
  session: StockCountSession;
  materials: Material[];
  onSave: (count: Omit<StockCount, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

function CountingInterfaceModal({ session, materials, onSave, onClose }: CountingInterfaceModalProps) {
  const [barcode, setBarcode] = useState('');
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [countedQuantity, setCountedQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [parsedData, setParsedData] = useState({ barcode: '', gtin: '', sn: '' });
  const [isEditingSN, setIsEditingSN] = useState(false);
  const [editableSN, setEditableSN] = useState('');
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [lastProcessedSN, setLastProcessedSN] = useState<string>('');

  // Sayım arayüzü açıldığında malzemeleri yükle
  useEffect(() => {
    const loadedMaterials = dataService.getMaterials();
    setAllMaterials(loadedMaterials);
  }, []);

  // Barkod numarasına göre malzeme bulma (SN hariç)
  const findMaterialByBarcode = (code: string, materialsToSearch: Material[]) => {
    return materialsToSearch.find(m => 
      m.barcode === code ||
      m.gtin === code ||
      m.udiCode === code ||
      m.allBarcode === code ||
      (m.allBarcode && m.allBarcode.split(',').map(b => b.trim()).includes(code))
    );
  };

  // SN numarasına göre malzeme bulma
  const findMaterialBySN = (sn: string) => {
    return allMaterials.find(m => m.sn === sn);
  };

  // Barkod numarasına göre benzer malzeme bulma (temel bilgiler için)
  const findSimilarMaterialByBarcode = (barcode: string) => {
    return allMaterials.find(m => 
      m.barcode === barcode ||
      m.gtin === barcode
    );
  };

  // Konsinye kontrol fonksiyonu - YENİ
  const checkConsignmentStatus = (material: Material, sessionStatus: MaterialStatus | undefined): boolean => {
    // Eğer malzeme konsinye ise ve oturum faturalı sayım ise hata ver
    if (material.status === 'konsinye' && sessionStatus === 'faturalı') {
      return false;
    }
    return true;
  };

  // Yeni malzeme oluşturma fonksiyonu - GÜNCELLENMİŞ
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
      status: session.sessionStatus || 'normal' as MaterialStatus,
      expirationDate: '',
      serialNoStatus: '',
      materialDescription: '',
      intuitiveCode: '',
      serialNumber: parsedData.sn
    };

    const newMaterialData: Omit<Material, 'id' | 'createdAt' | 'updatedAt'> = {
      ...baseMaterialData,
      barcode: parsedData.barcode,
      gtin: parsedData.gtin || baseMaterialData.gtin || '',
      sn: parsedData.sn,
      name: baseMaterial ? `${baseMaterial.name} (SN: ${parsedData.sn})` : `YENİ ÜRÜN - ${parsedData.barcode}`,
      allBarcode: parsedData.barcode ? `01${parsedData.gtin || parsedData.barcode}17${new Date().toISOString().slice(2,10)}21${parsedData.sn}30${parsedData.sn.length}` : ''
    };

    const newMaterial = dataService.saveMaterial(newMaterialData);
    
    // Malzemeleri yenile
    const updatedMaterials = dataService.getMaterials();
    setAllMaterials(updatedMaterials);
    
    return newMaterial;
  };

  const handleBarcodeScan = (scannedBarcode: string) => {
    setBarcode(scannedBarcode);
    handleBarcodeChange(scannedBarcode);
    setShowBarcodeScanner(false);
  };

  const handleBarcodeChange = async (value: string) => {
    setBarcode(value);
    
    if (value) {
      // Malzemeleri yenile
      const refreshedMaterials = dataService.getMaterials();
      setAllMaterials(refreshedMaterials);
      
      let parsed = { barcode: value, gtin: '', sn: '' };
      
      // All Barkod formatı mı kontrol et
      if (value.startsWith('01') && value.length >= 30) {
        parsed = parseAllBarcodeEnhanced(value);
        setParsedData(parsed);
      }
      
      // Session'a göre filtrele
      const filteredMaterials = allMaterials.filter(m => 
        !session.sessionStatus || m.status === session.sessionStatus
      );
      
      // 1. ÖNCE SN İLE ARA - GÜNCELLENDİ
      if (parsed.sn && parsed.sn.trim() !== '') {
        const existingMaterialWithSN = findMaterialBySN(parsed.sn);
        if (existingMaterialWithSN) {
          // Konsinye kontrolü
          if (!checkConsignmentStatus(existingMaterialWithSN, session.sessionStatus)) {
            alert(`SN ${parsed.sn} numaralı ürün Konsinye'dir. Faturalı Sayıma eklenemez!\nLütfen Malzeme Yönetimine girip SN kodlu ürünün statüsünü Faturalı yapın.`);
            setBarcode('');
            setParsedData({ barcode: '', gtin: '', sn: '' });
            setCurrentMaterial(null);
            return;
          }
          
          if (session.sessionStatus && existingMaterialWithSN.status !== session.sessionStatus) {
            alert(`SN ${parsed.sn} zaten sistemde kayıtlı ancak bu oturum statüsüne uygun değil!\nMalzeme statüsü: ${existingMaterialWithSN.status}`);
            setBarcode('');
            setParsedData({ barcode: '', gtin: '', sn: '' });
            setCurrentMaterial(null);
            return;
          }
          
          setCurrentMaterial(existingMaterialWithSN);
          setEditableSN(existingMaterialWithSN.sn || parsed.sn);
          setShowManualEntry(false);
          setLastProcessedSN(parsed.sn);
          
          // Otomatik bilgi getir
          alert(`SN ${parsed.sn} bulundu:\nMalzeme: ${existingMaterialWithSN.name}\nStok: ${existingMaterialWithSN.currentStock}`);
          return;
        }
      }
      
      // 2. BARKOD/GTIN İLE ARA
      let material: Material | undefined;
      
      if (parsed.barcode && parsed.barcode.trim() !== '') {
        material = findMaterialByBarcode(parsed.barcode, filteredMaterials);
      }
      
      if (!material && parsed.gtin && parsed.gtin.trim() !== '') {
        material = findMaterialByBarcode(parsed.gtin, filteredMaterials);
      }
      
      // 3. BARKOD VAR AMA SN YOKSA KONTROL ET
      if (material) {
        // Konsinye kontrolü
        if (!checkConsignmentStatus(material, session.sessionStatus)) {
          alert(`Barkod ${parsed.barcode} Konsinye üründür. Bu Sayıma eklenemez!`);
          setBarcode('');
          setParsedData({ barcode: '', gtin: '', sn: '' });
          setCurrentMaterial(null);
          return;
        }
        
        // Barkod bulundu, ancak SN farklı ise YENİ malzeme oluştur
        if (parsed.sn && parsed.sn.trim() !== '' && parsed.sn !== material.sn) {
          // Bu barkod için benzer malzeme ara (temel bilgiler için)
          const similarMaterial = findSimilarMaterialByBarcode(parsed.barcode || parsed.gtin);
          
          // SN ile malzeme var mı kontrol et
          const existingMaterialWithSN = findMaterialBySN(parsed.sn);
          if (existingMaterialWithSN) {
            // Aynı SN var, onu kullan
            if (!checkConsignmentStatus(existingMaterialWithSN, session.sessionStatus)) {
              alert(`SN ${parsed.sn} numaralı ürün Konsinye'dir. Faturalı Sayıma eklenemez!`);
              setBarcode('');
              setParsedData({ barcode: '', gtin: '', sn: '' });
              setCurrentMaterial(null);
              return;
            }
            
            setCurrentMaterial(existingMaterialWithSN);
            setEditableSN(existingMaterialWithSN.sn || '');
            setShowManualEntry(false);
            setLastProcessedSN(existingMaterialWithSN.sn);
            alert(`SN ${parsed.sn} başka bir malzemede kayıtlı. O malzeme kullanılıyor: ${existingMaterialWithSN.name}`);
            return;
          }
          
          const newMaterial = createNewMaterial(parsed, similarMaterial || material);
          material = newMaterial;
        }
        
        if (session.sessionStatus && material.status !== session.sessionStatus) {
          alert(`"${material.name}" malzemesi bu oturum statüsüne uygun değil! Malzeme statüsü: ${material.status}`);
          setBarcode('');
          setParsedData({ barcode: '', gtin: '', sn: '' });
          setCurrentMaterial(null);
          return;
        }
        
        setCurrentMaterial(material);
        setEditableSN(material.sn || parsed.sn);
        setShowManualEntry(false);
        setLastProcessedSN(material.sn || parsed.sn);
        
        // Otomatik bilgi getir
        alert(`Barkod ${parsed.barcode} bulundu:\nMalzeme: ${material.name}\nStok: ${material.currentStock}`);
      } else {
        // 4. MALZEME BULUNAMADI, YENİ MALZEME OLUŞTUR
        if (parsed.barcode || parsed.gtin || parsed.sn) {
          // Benzer barkodlu malzeme ara (temel bilgiler için)
          const similarMaterial = findSimilarMaterialByBarcode(parsed.barcode || parsed.gtin || '');
          
          // SN kontrolü - eğer SN varsa ve sistemde yoksa
          if (parsed.sn && parsed.sn.trim() !== '') {
            const existingMaterialWithSN = findMaterialBySN(parsed.sn);
            if (existingMaterialWithSN) {
              // SN zaten varsa, onu kullan
              if (!checkConsignmentStatus(existingMaterialWithSN, session.sessionStatus)) {
                alert(`SN ${parsed.sn} numaralı ürün Konsinye'dir. Faturalı Sayıma eklenemez!`);
                setBarcode('');
                setParsedData({ barcode: '', gtin: '', sn: '' });
                setCurrentMaterial(null);
                return;
              }
              
              setCurrentMaterial(existingMaterialWithSN);
              setEditableSN(existingMaterialWithSN.sn || '');
              setShowManualEntry(false);
              setLastProcessedSN(existingMaterialWithSN.sn);
              alert(`SN ${parsed.sn} zaten sistemde kayıtlı. Mevcut malzeme kullanılıyor: ${existingMaterialWithSN.name}`);
              return;
            }
          }
          
          setCurrentMaterial(null);
          setEditableSN(parsed.sn);
          setShowManualEntry(true);
          setLastProcessedSN(parsed.sn);
        } else {
          setCurrentMaterial(null);
          setShowManualEntry(false);
          setParsedData({ barcode: '', gtin: '', sn: '' });
          setEditableSN('');
          setLastProcessedSN('');
        }
      }
    } else {
      setCurrentMaterial(null);
      setShowManualEntry(false);
      setParsedData({ barcode: '', gtin: '', sn: '' });
      setEditableSN('');
      setLastProcessedSN('');
    }
  };

  const handleSaveCount = () => {
    if (!currentMaterial) {
      alert('Lütfen önce malzeme bilgilerini giriniz!');
      return;
    }

    // SN kontrolü
    if (editableSN && editableSN !== currentMaterial.sn) {
      const existingMaterialWithSN = allMaterials.find(m => m.sn === editableSN);
      if (existingMaterialWithSN && existingMaterialWithSN.id !== currentMaterial.id) {
        // Aynı SN başka malzemede varsa, o malzemenin stoğunu güncelle
        const updatedMaterial = { ...existingMaterialWithSN };
        dataService.updateMaterial(updatedMaterial.id, updatedMaterial);
        setCurrentMaterial(updatedMaterial);
      } else {
        // SN'yi güncelle
        const updatedMaterial = { ...currentMaterial, sn: editableSN };
        dataService.updateMaterial(updatedMaterial.id, updatedMaterial);
        setCurrentMaterial(updatedMaterial);
      }
    }

    const countData: Omit<StockCount, 'id' | 'createdAt'> = {
      sessionId: session.id,
      materialId: currentMaterial.id,
      barcode: barcode,
      countedQuantity: countedQuantity,
      unitPrice: currentMaterial.unitPrice,
      totalValue: countedQuantity * currentMaterial.unitPrice,
      countDate: session.countDate,
      countedBy: session.countedBy,
      status: 'tamamlandı',
      notes: notes,
      verifiedBy: '',
      verifiedAt: '',
      correctionNotes: ''
    };

    // MALZEMENİN STOĞUNU GÜNCELLE
    const newStock = currentMaterial.currentStock + countedQuantity;
    dataService.updateMaterial(currentMaterial.id, {
      currentStock: newStock
    });

    onSave(countData);

    setBarcode('');
    setCurrentMaterial(null);
    setCountedQuantity(1);
    setNotes('');
    setShowManualEntry(false);
    setParsedData({ barcode: '', gtin: '', sn: '' });
    setEditableSN('');
    setIsEditingSN(false);
    setLastProcessedSN('');
  };

  const handleManualMaterialSave = (materialData: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Malzemeleri yenile
    const refreshedMaterials = dataService.getMaterials();
    setAllMaterials(refreshedMaterials);
    
    // SN kontrolü
    if (materialData.sn) {
      const existingMaterialWithSN = refreshedMaterials.find(m => m.sn === materialData.sn);
      if (existingMaterialWithSN) {
        // Aynı SN varsa, mevcut malzemeyi kullan
        setCurrentMaterial(existingMaterialWithSN);
        setEditableSN(existingMaterialWithSN.sn || '');
        setShowManualEntry(false);
        setLastProcessedSN(existingMaterialWithSN.sn);
        alert(`SN ${materialData.sn} zaten sistemde kayıtlı. Mevcut malzeme kullanılıyor: ${existingMaterialWithSN.name}`);
        return;
      }
    }
    
    const newMaterial = dataService.saveMaterial(materialData);
    
    // Malzemeleri tekrar yenile
    const updatedMaterials = dataService.getMaterials();
    setAllMaterials(updatedMaterials);
    
    setCurrentMaterial(newMaterial);
    setEditableSN(newMaterial.sn || '');
    setShowManualEntry(false);
    setLastProcessedSN(newMaterial.sn);
  };

  const handleUpdateSN = () => {
    if (!editableSN.trim()) {
      alert('Lütfen SN numarası giriniz!');
      return;
    }
    
    // Malzemeleri yenile
    const refreshedMaterials = dataService.getMaterials();
    setAllMaterials(refreshedMaterials);
    
    // SN kontrolü
    if (editableSN !== currentMaterial?.sn) {
      const existingMaterialWithSN = refreshedMaterials.find(m => m.sn === editableSN);
      if (existingMaterialWithSN && existingMaterialWithSN.id !== currentMaterial?.id) {
        // Aynı SN başka malzemede varsa, o malzemeyi kullan
        setCurrentMaterial(existingMaterialWithSN);
        setEditableSN(existingMaterialWithSN.sn || '');
        setIsEditingSN(false);
        alert(`SN ${editableSN} başka bir malzemede kayıtlı. O malzeme kullanılıyor: ${existingMaterialWithSN.name}`);
        return;
      }
      
      // SN'yi geçici olarak güncelle
      if (currentMaterial) {
        const updatedMaterial = { ...currentMaterial, sn: editableSN };
        setCurrentMaterial(updatedMaterial);
      }
    }
    
    setIsEditingSN(false);
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
                Barkod/GTIN/SN/UDI Code/All Barcode *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  required
                  className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  value={barcode}
                  onChange={(e) => handleBarcodeChange(e.target.value)}
                  placeholder="Barkod, GTIN, SN, UDI Code veya All Barcode girin"
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
                Barkod, GTIN, Seri Numarası, UDI Code veya All Barcode girebilirsiniz
              </p>
              
              {lastProcessedSN && (
                <p className="text-xs text-green-600 mt-1">
                  Son işlenen SN: {lastProcessedSN}
                </p>
              )}
              
              {/* All Barkod parse edilmişse bilgileri göster */}
              {parsedData.barcode && (
                <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs text-blue-700 mb-1">
                    <strong>All Barkod Çözümlendi:</strong>
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="font-medium">Barkod:</span>
                      <div className="font-mono">{parsedData.barcode}</div>
                    </div>
                    <div>
                      <span className="font-medium">GTIN:</span>
                      <div className="font-mono">{parsedData.gtin}</div>
                    </div>
                    <div>
                      <span className="font-medium">SN:</span>
                      <div className="font-mono">{parsedData.sn}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {currentMaterial && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">Mevcut Malzeme Bilgileri</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Malzeme Adı:</span>
                    <div>{currentMaterial.name}</div>
                  </div>
                  <div>
                    <span className="font-medium">Kategori:</span>
                    <div>{currentMaterial.category}</div>
                  </div>
                  <div>
                    <span className="font-medium">Barkod:</span>
                    <div className="font-mono">{currentMaterial.barcode}</div>
                  </div>
                  <div>
                    <span className="font-medium">SN:</span>
                    <div className="flex items-center space-x-2">
                      {isEditingSN ? (
                        <>
                          <input
                            type="text"
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            value={editableSN}
                            onChange={(e) => setEditableSN(e.target.value)}
                            placeholder="SN numarası"
                          />
                          <button
                            onClick={handleUpdateSN}
                            className="text-green-600 hover:text-green-800"
                            title="Kaydet"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingSN(false);
                              setEditableSN(currentMaterial.sn || '');
                            }}
                            className="text-red-600 hover:text-red-800"
                            title="İptal"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="font-mono">{currentMaterial.sn || '-'}</div>
                          <button
                            onClick={() => setIsEditingSN(true)}
                            className="text-blue-600 hover:text-blue-800"
                            title="SN'yi Düzenle"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">GTIN:</span>
                    <div className="font-mono">{currentMaterial.gtin || '-'}</div>
                  </div>
                  <div>
                    <span className="font-medium">UDI Code:</span>
                    <div className="font-mono">{currentMaterial.udiCode || '-'}</div>
                  </div>
                  <div>
                    <span className="font-medium">All Barcode:</span>
                    <div className="font-mono">{currentMaterial.allBarcode || '-'}</div>
                  </div>
                  <div>
                    <span className="font-medium">Mevcut Stok:</span>
                    <div>{currentMaterial.currentStock} {currentMaterial.unit}</div>
                  </div>
                  <div>
                    <span className="font-medium">Birim Fiyat:</span>
                    <div>₺{currentMaterial.unitPrice.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="font-medium">Tedarikçi:</span>
                    <div>{currentMaterial.supplier}</div>
                  </div>
                  <div>
                    <span className="font-medium">Kritik Stok:</span>
                    <div>{currentMaterial.minStock} {currentMaterial.unit}</div>
                  </div>
                  <div>
                    <span className="font-medium">Statü:</span>
                    <div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        currentMaterial.status === 'normal' ? 'bg-green-100 text-green-800' :
                        currentMaterial.status === 'konsinye' ? 'bg-blue-100 text-blue-800' :
                        currentMaterial.status === 'iade' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {currentMaterial.status?.toUpperCase() || 'NORMAL'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showManualEntry && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-3">Yeni Malzeme Bilgilerini Girin</h4>
                <ManualMaterialEntry
                  barcode={barcode}
                  parsedData={parsedData}
                  categories={dataService.getCategories().map(c => c.name)}
                  onSave={handleManualMaterialSave}
                  onCancel={() => {
                    setShowManualEntry(false);
                    setBarcode('');
                    setParsedData({ barcode: '', gtin: '', sn: '' });
                    setEditableSN('');
                    setLastProcessedSN('');
                  }}
                  sessionStatus={session.sessionStatus}
                />
              </div>
            )}

            {!showManualEntry && currentMaterial && (
              <>
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
              </>
            )}
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

        {!showManualEntry && currentMaterial && (
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
            >
              Kapat
            </button>
            <button
              onClick={handleSaveCount}
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

// Manuel Malzeme Giriş Component - GÜNCELLENMİŞ
interface ManualMaterialEntryProps {
  barcode: string;
  parsedData: { barcode: string; gtin: string; sn: string };
  categories: string[];
  onSave: (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  sessionStatus?: MaterialStatus;
}

function ManualMaterialEntry({ barcode, parsedData, categories, onSave, onCancel, sessionStatus }: ManualMaterialEntryProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subCategory: '',
    currentStock: 1,
    unitPrice: 0,
    supplier: '',
    unit: 'adet',
    minStock: 0,
    gtin: parsedData.gtin || '',
    sn: parsedData.sn || barcode,
    udiCode: '',
    allBarcode: barcode,
    status: (sessionStatus || 'normal') as MaterialStatus
  });

  const units = ['adet', 'kutu', 'şişe', 'tüp', 'paket', 'ampul', 'kg', 'lt', 'metre'];
  const statusOptions: MaterialStatus[] = ['normal', 'konsinye', 'iade', 'faturalı'];

  useEffect(() => {
    if (parsedData.barcode && !formData.gtin) {
      setFormData(prev => ({
        ...prev,
        gtin: parsedData.gtin || '',
        sn: parsedData.sn || barcode
      }));
    }
  }, [parsedData, barcode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Lütfen malzeme adı giriniz!');
      return;
    }

    const materialData: Omit<Material, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      barcode: parsedData.barcode || barcode,
      category: formData.category,
      subCategory: formData.subCategory,
      unit: formData.unit,
      unitPrice: formData.unitPrice,
      currentStock: formData.currentStock,
      minStock: formData.minStock,
      minStockLevel: formData.minStock,
      supplier: formData.supplier,
      isActive: true,
      gtin: formData.gtin,
      sn: formData.sn,
      udiCode: formData.udiCode,
      allBarcode: formData.allBarcode,
      expirationDate: '',
      serialNoStatus: '',
      materialDescription: '',
      intuitiveCode: '',
      serialNumber: formData.sn,
      status: formData.status
    };

    onSave(materialData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Parsed Data Gösterimi */}
      {parsedData.barcode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <h5 className="font-semibold text-blue-800 mb-2">All Barkod Çözümlendi:</h5>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <span className="font-medium block mb-1">Barkod:</span>
              <div className="font-mono bg-white p-1 rounded">{parsedData.barcode}</div>
            </div>
            <div>
              <span className="font-medium block mb-1">GTIN:</span>
              <div className="font-mono bg-white p-1 rounded">{parsedData.gtin}</div>
            </div>
            <div>
              <span className="font-medium block mb-1">SN:</span>
              <div className="font-mono bg-white p-1 rounded">{parsedData.sn}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Malzeme Adı *
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Örnek: CNWTTO.225 CLAREON PANOPTIX"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategori *
          </label>
          <select
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="">Kategori seçin</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GTIN
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.gtin}
            onChange={(e) => setFormData({ ...formData, gtin: e.target.value })}
            placeholder="GTIN kodu"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SN *
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.sn}
            onChange={(e) => setFormData({ ...formData, sn: e.target.value })}
            placeholder="Seri numarası"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Barkod *
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={parsedData.barcode || barcode}
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            All Barcode
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.allBarcode}
            onChange={(e) => setFormData({ ...formData, allBarcode: e.target.value })}
            placeholder="All Barcode"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alt Kategori
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.subCategory}
          onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
          placeholder="Alt kategori (isteğe bağlı)"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mevcut Stok
          </label>
          <input
            type="number"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Birim
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            Tedarikçi
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            placeholder="Tedarikçi adı"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kritik Stok
          </label>
          <input
            type="number"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.minStock}
            onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Statü
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as MaterialStatus })}
        >
          {statusOptions.map(status => (
            <option key={status} value={status}>{status.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
        >
          İptal
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Malzemeyi Kaydet ve Sayıma Başla
        </button>
      </div>
    </form>
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
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Barkod/SN/GTIN/UDI</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Malzeme Adı</th>
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
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <div>
                      <div className="font-mono">{detail.barcode}</div>
                      {detail.materialSn && detail.materialSn !== '-' && (
                        <div className="text-xs text-gray-500">SN: {detail.materialSn}</div>
                      )}
                      {detail.materialGtin && detail.materialGtin !== '-' && (
                        <div className="text-xs text-gray-500">GTIN: {detail.materialGtin}</div>
                      )}
                      {detail.materialUdiCode && detail.materialUdiCode !== '-' && (
                        <div className="text-xs text-gray-500">UDI: {detail.materialUdiCode}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{detail.materialName}</span>
                    </div>
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