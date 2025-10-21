import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, ClipboardList, CheckCircle, Eye, Filter, Barcode, Package, Users } from 'lucide-react';
import { StockCount, Material, StockCountSession } from '../types';
import { dataService } from "../utils/dataService";

// SessionSummary interface'ini burada tanımlıyoruz
interface SessionSummary {
  sessionId: string;
  sessionNo: string;
  title: string;
  countDate: string;
  countedBy: string;
  status: string;
  totalProductsCounted: number;
  totalValue: number;
}

export default function StockCountManagement() {
  const [stockCounts, setStockCounts] = useState<StockCount[]>([]);
  const [sessions, setSessions] = useState<StockCountSession[]>([]);
  const [sessionSummaries, setSessionSummaries] = useState<SessionSummary[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'sessions' | 'counts'>('sessions');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<StockCountSession | null>(null);
  const [selectedCount, setSelectedCount] = useState<StockCount | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sessionStatusFilter, setSessionStatusFilter] = useState<string>('all');
  const [showCountingInterface, setShowCountingInterface] = useState(false);
  const [selectedSessionDetails, setSelectedSessionDetails] = useState<any[]>([]);
  const [columnFilters, setColumnFilters] = useState<{ [key: string]: string }>({});

  const currentUser = dataService.getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setStockCounts(dataService.getStockCounts());
    setSessions(dataService.getStockCountSessions());
    setSessionSummaries(dataService.getSessionSummaries());
    setMaterials(dataService.getMaterials());
  };

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

  // Oturum filtreleme
  const filteredSummaries = sessionSummaries.filter(summary => {
    const matchesSearch = 
      summary.sessionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.countedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = sessionStatusFilter === 'all' || summary.status === sessionStatusFilter;

    const matchesColumnFilters = Object.entries(columnFilters).every(([column, filter]) => {
      if (!filter) return true;
      const value = summary[column as keyof SessionSummary];
      return value?.toString().toLowerCase().includes(filter.toLowerCase());
    });

    return matchesSearch && matchesStatus && matchesColumnFilters;
  });

  // Sayım filtreleme
  const filteredCounts = stockCounts.filter(count => {
    const material = materials.find(m => m.id === count.materialId);
    const session = sessions.find(s => s.id === count.sessionId);
    
    const matchesSearch = 
      count.barcode.includes(searchTerm) ||
      material?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      count.countedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session?.sessionNo.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || count.status === statusFilter;

    const matchesColumnFilters = Object.entries(columnFilters).every(([column, filter]) => {
      if (!filter) return true;
      
      if (column === 'materialName') {
        const material = materials.find(m => m.id === count.materialId);
        return material?.name.toLowerCase().includes(filter.toLowerCase());
      }
      
      if (column === 'sessionNo') {
        const session = sessions.find(s => s.id === count.sessionId);
        return session?.sessionNo.toLowerCase().includes(filter.toLowerCase());
      }
      
      const value = count[column as keyof StockCount];
      return value?.toString().toLowerCase().includes(filter.toLowerCase());
    });

    return matchesSearch && matchesStatus && matchesColumnFilters;
  });

  // Yeni oturum oluşturma
  const handleCreateSession = (sessionData: Omit<StockCountSession, 'id' | 'createdAt' | 'totalProductsCounted'>) => {
    dataService.saveStockCountSession(sessionData);
    
    dataService.logAction({
      action: 'YENİ_SAYIM_OTURUMU',
      module: 'STOK_SAYIM',
      recordId: sessionData.sessionNo,
      details: `${sessionData.title} - ${sessionData.sessionNo} oturumu oluşturuldu`,
      performedBy: currentUser.name,
    });

    loadData();
    setShowSessionModal(false);
  };

  // Sayım başlatma
  const handleStartCounting = (session: StockCountSession) => {
    setSelectedSession(session);
    setShowCountingInterface(true);
  };

  // Yeni sayım oluşturma
  const handleCreateCount = (countData: Omit<StockCount, 'id' | 'createdAt'>) => {
    dataService.saveStockCount(countData);
    
    // Oturumun toplam sayılan ürün sayısını güncelle
    const sessionCounts = dataService.getStockCounts().filter(count => count.sessionId === countData.sessionId);
    dataService.updateStockCountSession(countData.sessionId, {
      totalProductsCounted: sessionCounts.length
    });

    const material = materials.find(m => m.id === countData.materialId);
    dataService.logAction({
      action: 'YENİ_STOK_SAYIMI',
      module: 'STOK_SAYIM',
      recordId: countData.barcode,
      details: `${material?.name} malzemesi için ${countData.countedQuantity} adet sayım kaydedildi`,
      performedBy: currentUser.name,
    });

    loadData();
  };

  // Sayım onaylama
  const handleApproveCount = (countId: string) => {
    const count = stockCounts.find(c => c.id === countId);
    const material = materials.find(m => m.id === count?.materialId);
    
    dataService.updateStockCount(countId, {
      status: 'onaylandı',
      verifiedBy: currentUser.name,
      verifiedAt: new Date().toISOString()
    });

    if (count && material) {
      dataService.updateMaterial(material.id, {
        currentStock: count.countedQuantity,
        lastStockCountDate: new Date().toISOString(),
        lastStockCountBy: count.countedBy,
        lastStockCountQuantity: count.countedQuantity
      });
    }

    dataService.logAction({
      action: 'SAYIM_ONAYLANDI',
      module: 'STOK_SAYIM',
      recordId: countId,
      details: `${material?.name} sayımı onaylandı - Sayılan: ${count?.countedQuantity}`,
      performedBy: currentUser.name,
    });

    loadData();
    setShowApprovalModal(false);
  };

  // Sayım reddetme
  const handleRejectCount = (countId: string, correctionNotes: string) => {
    const count = stockCounts.find(c => c.id === countId);
    const material = materials.find(m => m.id === count?.materialId);
    
    dataService.updateStockCount(countId, {
      status: 'reddedildi',
      verifiedBy: currentUser.name,
      verifiedAt: new Date().toISOString(),
      correctionNotes
    });

    dataService.logAction({
      action: 'SAYIM_REDDEDİLDİ',
      module: 'STOK_SAYIM',
      recordId: countId,
      details: `${material?.name} sayımı reddedildi - Not: ${correctionNotes}`,
      performedBy: currentUser.name,
    });

    loadData();
    setShowApprovalModal(false);
  };

  // Sayım düzeltme
  const handleCorrectCount = (countId: string, correctedQuantity: number, notes: string) => {
    const count = stockCounts.find(c => c.id === countId);
    const material = materials.find(m => m.id === count?.materialId);
    
    dataService.updateStockCount(countId, {
      countedQuantity: correctedQuantity,
      status: 'düzeltildi',
      verifiedBy: currentUser.name,
      verifiedAt: new Date().toISOString(),
      correctionNotes: notes,
      totalValue: correctedQuantity * (count?.unitPrice || 0)
    });

    if (count && material) {
      dataService.updateMaterial(material.id, {
        currentStock: correctedQuantity,
        lastStockCountDate: new Date().toISOString(),
        lastStockCountBy: count.countedBy,
        lastStockCountQuantity: correctedQuantity
      });
    }

    dataService.logAction({
      action: 'SAYIM_DÜZELTİLDİ',
      module: 'STOK_SAYIM',
      recordId: countId,
      details: `${material?.name} sayımı düzeltildi - Eski: ${count?.countedQuantity}, Yeni: ${correctedQuantity}`,
      performedBy: currentUser.name,
    });

    loadData();
    setShowApprovalModal(false);
  };

  // Oturum silme
  const handleDeleteSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (confirm(`"${session?.title}" oturumunu silmek istediğinizden emin misiniz?`)) {
      // Oturuma ait tüm sayımları sil
      const sessionCounts = stockCounts.filter(count => count.sessionId === sessionId);
      sessionCounts.forEach(count => {
        dataService.deleteStockCount(count.id);
      });
      
      dataService.deleteStockCountSession(sessionId);
      
      dataService.logAction({
        action: 'OTURUM_SİLİNDİ',
        module: 'STOK_SAYİM',
        recordId: sessionId,
        details: `${session?.sessionNo} - ${session?.title} oturumu ve ${sessionCounts.length} sayım kaydı silindi`,
        performedBy: currentUser.name,
      });

      loadData();
    }
  };

  // Oturum detaylarını görüntüleme
  const handleViewSessionDetails = (sessionId: string) => {
    const details = dataService.getStockCountsBySessionDetailed(sessionId);
    setSelectedSessionDetails(details);
  };

  // Durum badge'leri
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'beklemede': { color: 'bg-yellow-100 text-yellow-800', label: 'Beklemede' },
      'onaylandı': { color: 'bg-green-100 text-green-800', label: 'Onaylandı' },
      'reddedildi': { color: 'bg-red-100 text-red-800', label: 'Reddedildi' },
      'düzeltildi': { color: 'bg-blue-100 text-blue-800', label: 'Düzeltildi' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.beklemede;
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Oturum durumu badge'leri
  const getSessionStatusBadge = (status: string) => {
    const statusConfig = {
      'planlı': { color: 'bg-gray-100 text-gray-800', label: 'Planlı' },
      'devam-ediyor': { color: 'bg-blue-100 text-blue-800', label: 'Devam Ediyor' },
      'tamamlandı': { color: 'bg-green-100 text-green-800', label: 'Tamamlandı' },
      'iptal': { color: 'bg-red-100 text-red-800', label: 'İptal' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planlı;
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Başlık ve Yeni Oturum Butonu */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Stok Takip</h2>
        <button
          onClick={() => setShowSessionModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Yeni Sayım Oturumu</span>
        </button>
      </div>

      {/* Ana İçerik */}
      <div className="bg-white rounded-lg shadow-md">
        {/* Tab Navigasyonu */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'sessions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Sayım Oturumları ({filteredSummaries.length})
            </button>
            <button
              onClick={() => setActiveTab('counts')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'counts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <ClipboardList className="h-4 w-4 inline mr-2" />
              Tüm Sayımlar ({filteredCounts.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Arama ve Filtre Çubuğu */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={
                  activeTab === 'sessions' 
                    ? "Oturum no, başlık veya sayım yapan ara..." 
                    : "Barkod, malzeme adı veya sayım yapan kişi ara..."
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Filter className="h-5 w-5 text-gray-400 mt-2" />
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={activeTab === 'sessions' ? sessionStatusFilter : statusFilter}
                onChange={(e) => activeTab === 'sessions' ? setSessionStatusFilter(e.target.value) : setStatusFilter(e.target.value)}
              >
                {activeTab === 'sessions' ? (
                  <>
                    <option value="all">Tüm Durumlar</option>
                    <option value="planlı">Planlı</option>
                    <option value="devam-ediyor">Devam Ediyor</option>
                    <option value="tamamlandı">Tamamlandı</option>
                    <option value="iptal">İptal</option>
                  </>
                ) : (
                  <>
                    <option value="all">Tüm Durumlar</option>
                    <option value="beklemede">Beklemede</option>
                    <option value="onaylandı">Onaylandı</option>
                    <option value="reddedildi">Reddedildi</option>
                    <option value="düzeltildi">Düzeltildi</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Sütun Filtreleri */}
          {activeTab === 'sessions' && (
            <div className="grid grid-cols-7 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Oturum no ara..."
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={columnFilters.sessionNo || ''}
                  onChange={(e) => handleColumnFilter('sessionNo', e.target.value)}
                />
                {columnFilters.sessionNo && (
                  <button
                    onClick={() => clearColumnFilter('sessionNo')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Başlık ara..."
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={columnFilters.title || ''}
                  onChange={(e) => handleColumnFilter('title', e.target.value)}
                />
                {columnFilters.title && (
                  <button
                    onClick={() => clearColumnFilter('title')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Sayım yapan ara..."
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={columnFilters.countedBy || ''}
                  onChange={(e) => handleColumnFilter('countedBy', e.target.value)}
                />
                {columnFilters.countedBy && (
                  <button
                    onClick={() => clearColumnFilter('countedBy')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
              <div></div>
              <div></div>
              <div></div>
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Filter className="h-4 w-4 mr-1" />
                Sütun Filtreleri
              </div>
            </div>
          )}

          {activeTab === 'counts' && (
            <div className="grid grid-cols-8 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Malzeme ara..."
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={columnFilters.materialName || ''}
                  onChange={(e) => handleColumnFilter('materialName', e.target.value)}
                />
                {columnFilters.materialName && (
                  <button
                    onClick={() => clearColumnFilter('materialName')}
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
                  placeholder="Oturum no ara..."
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={columnFilters.sessionNo || ''}
                  onChange={(e) => handleColumnFilter('sessionNo', e.target.value)}
                />
                {columnFilters.sessionNo && (
                  <button
                    onClick={() => clearColumnFilter('sessionNo')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Sayım yapan ara..."
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={columnFilters.countedBy || ''}
                  onChange={(e) => handleColumnFilter('countedBy', e.target.value)}
                />
                {columnFilters.countedBy && (
                  <button
                    onClick={() => clearColumnFilter('countedBy')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
              <div></div>
              <div></div>
              <div></div>
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Filter className="h-4 w-4 mr-1" />
                Sütun Filtreleri
              </div>
            </div>
          )}

          {/* Oturumlar Tabı */}
          {activeTab === 'sessions' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Oturum No</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Başlık</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Sayım Tarihi</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Sayım Yapan</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Durum</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Toplam Sayılan Ürün</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Toplam Değer</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSummaries.map((summary) => (
                    <tr key={summary.sessionId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{summary.sessionNo}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{summary.title}</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(summary.countDate).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{summary.countedBy}</td>
                      <td className="py-3 px-4">{getSessionStatusBadge(summary.status)}</td>
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
                          {summary.status === 'devam-ediyor' && (
                            <button
                              onClick={() => {
                                const session = sessions.find(s => s.id === summary.sessionId);
                                if (session) handleStartCounting(session);
                              }}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Sayıma Devam Et"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          )}
                          {currentUser.permissions.includes('admin') && (
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
          )}

          {/* Sayımlar Tabı */}
          {activeTab === 'counts' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Sayım Tarihi</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Oturum No</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Malzeme</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Barkod</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Sayılan Miktar</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Toplam Değer</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Sayım Yapan</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Durum</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCounts.map((count) => (
                    <tr key={count.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(count.countDate).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {sessions.find(s => s.id === count.sessionId)?.sessionNo || 'Bilinmeyen'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{materials.find(m => m.id === count.materialId)?.name || 'Bilinmeyen'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{count.barcode}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-blue-600">
                          {count.countedQuantity} {materials.find(m => m.id === count.materialId)?.unit || ''}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        ₺{count.totalValue.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{count.countedBy}</td>
                      <td className="py-3 px-4">
                        {getStatusBadge(count.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          {count.status === 'beklemede' && currentUser.permissions.includes('sayim_onayla') && (
                            <button
                              onClick={() => {
                                setSelectedCount(count);
                                setShowApprovalModal(true);
                              }}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Onayla/Reddet"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
          materials={materials}
          onSave={handleCreateCount}
          onClose={() => {
            setShowCountingInterface(false);
            setSelectedSession(null);
          }}
        />
      )}

      {showApprovalModal && selectedCount && (
        <ApprovalModal
          count={selectedCount}
          material={materials.find(m => m.id === selectedCount.materialId)}
          onApprove={handleApproveCount}
          onReject={handleRejectCount}
          onCorrect={handleCorrectCount}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedCount(null);
          }}
        />
      )}

      {/* Oturum Detayları Modal */}
      {selectedSessionDetails.length > 0 && (
        <SessionDetailsModal
          sessionDetails={selectedSessionDetails}
          session={sessions.find(s => s.id === selectedSessionDetails[0]?.sessionId)}
          onClose={() => setSelectedSessionDetails([])}
        />
      )}
    </div>
  );
}

// Oturum Modal Component
interface SessionModalProps {
  onSave: (session: Omit<StockCountSession, 'id' | 'createdAt' | 'totalProductsCounted'>) => void;
  onClose: () => void;
}

function SessionModal({ onSave, onClose }: SessionModalProps) {
  const [formData, setFormData] = useState({
    sessionNo: `OTR-${Date.now()}`,
    title: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    countDate: new Date().toISOString().split('T')[0],
    countedBy: '',
    status: 'planlı' as 'planlı',
    notes: '',
  });

  const currentUser = dataService.getCurrentUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      ...formData,
      createdBy: currentUser.name
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <h3 className="text-lg font-semibold mb-4">Yeni Sayım Oturumu</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Oturum No *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.sessionNo}
                onChange={(e) => setFormData({ ...formData, sessionNo: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durum *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="planlı">Planlı</option>
                <option value="devam-ediyor">Devam Ediyor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Başlık *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Sayım oturumu başlığı"
            />
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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bitiş Tarihi *
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [countedQuantity, setCountedQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const categories = ['İlaç', 'Tıbbi Malzeme', 'Cerrahi Malzeme', 'Koruyucu Ekipman', 'Lens', 'Diğer'];

  const handleBarcodeChange = (value: string) => {
    setBarcode(value);
    
    if (value) {
      const material = materials.find(m => m.barcode === value);
      if (material) {
        setCurrentMaterial(material);
        setShowManualEntry(false);
      } else {
        setCurrentMaterial(null);
        setShowManualEntry(true);
      }
    } else {
      setCurrentMaterial(null);
      setShowManualEntry(false);
    }
  };

  const handleSaveCount = () => {
    if (!currentMaterial) {
      alert('Lütfen önce malzeme bilgilerini giriniz!');
      return;
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
      status: 'beklemede',
      notes: notes,
      verifiedBy: '',
      verifiedAt: '',
      correctionNotes: ''
    };

    onSave(countData);

    // Formu sıfırla
    setBarcode('');
    setCurrentMaterial(null);
    setCountedQuantity(1);
    setNotes('');
    setShowManualEntry(false);
  };

  const handleManualMaterialSave = (materialData: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMaterial = dataService.saveMaterial(materialData);
    setCurrentMaterial(newMaterial);
    setShowManualEntry(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold">Sayım Arayüzü - {session.title}</h3>
            <p className="text-gray-600">Oturum: {session.sessionNo} | Sayım Yapan: {session.countedBy}</p>
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
                  <span className="font-medium">Durum:</span>
                  <div>{session.status}</div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barkod *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  required
                  className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  value={barcode}
                  onChange={(e) => handleBarcodeChange(e.target.value)}
                  placeholder="Barkodu taratın veya girin"
                  autoFocus
                />
                <Barcode className="h-8 w-8 text-gray-400 mt-2" />
              </div>
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
                </div>
              </div>
            )}

            {showManualEntry && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-3">Yeni Malzeme Bilgilerini Girin</h4>
                <ManualMaterialEntry
                  barcode={barcode}
                  categories={categories}
                  onSave={handleManualMaterialSave}
                  onCancel={() => {
                    setShowManualEntry(false);
                    setBarcode('');
                  }}
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
                    {dataService.getStockCounts().filter(c => c.sessionId === session.id && c.status === 'onaylandı').length}
                  </div>
                  <div className="text-sm text-gray-600">Onaylanan</div>
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
                      const material = materials.find(m => m.id === count.materialId);
                      return (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium text-sm">{material?.name}</div>
                            <div className="text-xs text-gray-600">Barkod: {count.barcode}</div>
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
              <span>Kaydet ve Sayıma Devam Et</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Manuel Malzeme Giriş Component
interface ManualMaterialEntryProps {
  barcode: string;
  categories: string[];
  onSave: (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

function ManualMaterialEntry({ barcode, categories, onSave, onCancel }: ManualMaterialEntryProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    currentStock: 0,
    unitPrice: 0,
    supplier: '',
    unit: 'adet',
    minStock: 0,
  });

  const units = ['adet', 'kutu', 'şişe', 'tüp', 'paket', 'ampul', 'kg', 'lt', 'metre'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      name: formData.name,
      barcode: barcode,
      category: formData.category,
      unit: formData.unit,
      unitPrice: formData.unitPrice,
      currentStock: formData.currentStock,
      minStock: formData.minStock,
      supplier: formData.supplier,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mevcut Stok
          </label>
          <input
            type="number"
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
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kritik Stok
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.minStock}
            onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
          />
        </div>
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

// Onay Modal Component
interface ApprovalModalProps {
  count: StockCount;
  material: Material | undefined;
  onApprove: (countId: string) => void;
  onReject: (countId: string, correctionNotes: string) => void;
  onCorrect: (countId: string, correctedQuantity: number, notes: string) => void;
  onClose: () => void;
}

function ApprovalModal({ count, material, onApprove, onReject, onCorrect, onClose }: ApprovalModalProps) {
  const [action, setAction] = useState<'approve' | 'reject' | 'correct' | null>(null);
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [correctedQuantity, setCorrectedQuantity] = useState(count.countedQuantity);

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(count.id);
    } else if (action === 'reject') {
      onReject(count.id, correctionNotes);
    } else if (action === 'correct') {
      onCorrect(count.id, correctedQuantity, correctionNotes);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Sayım Onayı</h3>
        
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Malzeme:</span>
              <div>{material?.name}</div>
            </div>
            <div>
              <span className="font-medium">Barkod:</span>
              <div>{count.barcode}</div>
            </div>
            <div>
              <span className="font-medium">Sistem Stoku:</span>
              <div>{material?.currentStock} {material?.unit}</div>
            </div>
            <div>
              <span className="font-medium">Sayılan Miktar:</span>
              <div>{count.countedQuantity} {material?.unit}</div>
            </div>
            <div>
              <span className="font-medium">Sayım Yapan:</span>
              <div>{count.countedBy}</div>
            </div>
            <div>
              <span className="font-medium">Tarih:</span>
              <div>{new Date(count.countDate).toLocaleDateString('tr-TR')}</div>
            </div>
          </div>

          {count.notes && (
            <div>
              <span className="font-medium text-sm">Notlar:</span>
              <div className="text-sm text-gray-600 mt-1">{count.notes}</div>
            </div>
          )}
        </div>

        {!action ? (
          <div className="space-y-3">
            <button
              onClick={() => setAction('approve')}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Onayla
            </button>
            <button
              onClick={() => setAction('correct')}
              className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Düzelt ve Onayla
            </button>
            <button
              onClick={() => setAction('reject')}
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Reddet
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {action === 'correct' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Düzeltilen Miktar
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={correctedQuantity}
                  onChange={(e) => setCorrectedQuantity(Number(e.target.value))}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {action === 'approve' ? 'Onay Notu:' : 
                 action === 'correct' ? 'Düzeltme Notu:' : 'Reddetme Nedeni:'}
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={correctionNotes}
                onChange={(e) => setCorrectionNotes(e.target.value)}
                placeholder={
                  action === 'approve' ? 'Onay notu...' :
                  action === 'correct' ? 'Düzeltme nedeni...' :
                  'Reddetme nedeni...'
                }
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setAction(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
              >
                Geri
              </button>
              <button
                onClick={handleSubmit}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  action === 'correct' ? 'bg-yellow-600 hover:bg-yellow-700' :
                  'bg-red-600 hover:bg-red-700'
                }`}
              >
                {action === 'approve' ? 'Onayla' :
                 action === 'correct' ? 'Düzelt ve Onayla' : 'Reddet'}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// Oturum Detayları Modal Component
interface SessionDetailsModalProps {
  sessionDetails: any[];
  session: StockCountSession | undefined;
  onClose: () => void;
}

function SessionDetailsModal({ sessionDetails, session, onClose }: SessionDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold">Oturum Detayları - {session?.title}</h3>
            <p className="text-gray-600">Oturum No: {session?.sessionNo} | Sayım Yapan: {session?.countedBy}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Barkod</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Malzeme Adı</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Kategori</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Sayılan Miktar</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Birim Fiyatı</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Toplam Değer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Durum</th>
              </tr>
            </thead>
            <tbody>
              {sessionDetails.map((detail, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">{detail.barcode}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{detail.materialName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{detail.materialCategory}</td>
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
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      detail.status === 'onaylandı' ? 'bg-green-100 text-green-800' :
                      detail.status === 'beklemede' ? 'bg-yellow-100 text-yellow-800' :
                      detail.status === 'reddedildi' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {detail.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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