import { ReactNode, useState, useEffect } from 'react';
import { Eye as Hospital, Package, Users, FileText, BarChart3, ClipboardList, Home, AlertTriangle, TrendingUp, ShoppingCart } from 'lucide-react';
import { dataService } from '../utils/dataService';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const [dashboardStats, setDashboardStats] = useState({
    totalMaterials: 0,
    totalPatients: 0,
    totalStockValue: 0,
    criticalStockCount: 0,
    totalUsageCost: 0,
    lowStockMaterials: [] as any[],
    recentActivities: [] as any[],
    topUsedMaterials: [] as any[],
  });

  // Dashboard istatistiklerini yükle
  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = () => {
    const stats = dataService.getDashboardStats();
    setDashboardStats(stats);
  };

  // Menü öğeleri - Dashboard eklendi
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'materials', label: 'Malzeme Yönetimi', icon: Package },
    { id: 'stock-count', label: 'Stok Takip', icon: ClipboardList },
    { id: 'patients', label: 'Hasta Yönetimi', icon: Users },
    { id: 'invoices', label: 'Fatura Yönetimi', icon: FileText },
    { id: 'reports', label: 'Raporlar', icon: BarChart3 },
  ];

  // Kritik stok uyarısı kontrolü
  const hasCriticalStock = dashboardStats.criticalStockCount > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Hospital className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">Osmangazi Göz Hastanesi</h1>
                <p className="text-blue-100 text-sm">Stok Takip Sistemi</p>
              </div>
            </div>
            
            {/* Dashboard İstatistikleri - Hızlı Bakış */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* Toplam Malzeme */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Package className="h-4 w-4" />
                  <span className="text-sm font-medium">Malzeme</span>
                </div>
                <div className="text-lg font-bold">{dashboardStats.totalMaterials}</div>
              </div>
              
              {/* Toplam Hasta */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Hasta</span>
                </div>
                <div className="text-lg font-bold">{dashboardStats.totalPatients}</div>
              </div>
              
              {/* Kritik Stok Uyarısı */}
              {hasCriticalStock && (
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <AlertTriangle className="h-4 w-4 text-yellow-300" />
                    <span className="text-sm font-medium">Kritik Stok</span>
                  </div>
                  <div className="text-lg font-bold text-yellow-300">{dashboardStats.criticalStockCount}</div>
                </div>
              )}
              
              {/* Stok Değeri */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Stok Değeri</span>
                </div>
                <div className="text-lg font-bold">₺{dashboardStats.totalStockValue.toFixed(0)}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Navigasyon Menüsü */}
        <nav className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              // Dashboard için özel badge
              const showBadge = item.id === 'materials' && dashboardStats.criticalStockCount > 0;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`relative flex items-center space-x-2 px-6 py-4 font-medium border-b-2 transition-all ${
                    isActive
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  
                  {/* Kritik Stok Bildirimi */}
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Dashboard İçeriği - Sadece dashboard sayfasında gösterilecek */}
        {currentPage === 'dashboard' && (
          <div className="mb-6">
            <DashboardOverview 
              stats={dashboardStats} 
              onNavigate={onPageChange}
            />
          </div>
        )}

        {/* Ana İçerik */}
        <main>{children}</main>
      </div>
    </div>
  );
}

// Dashboard Bileşeni
interface DashboardOverviewProps {
  stats: {
    totalMaterials: number;
    totalPatients: number;
    totalStockValue: number;
    criticalStockCount: number;
    totalUsageCost: number;
    lowStockMaterials: any[];
    recentActivities: any[];
    topUsedMaterials: any[];
  };
  onNavigate: (page: string) => void;
}

function DashboardOverview({ stats, onNavigate }: DashboardOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Hoş Geldiniz Başlığı */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Hoş Geldiniz!</h2>
            <p className="text-gray-600 mt-1">Osmangazi Göz Hastanesi Stok Takip Sistemine genel bakış</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Son Güncelleme</p>
            <p className="text-sm font-medium text-gray-700">
              {new Date().toLocaleDateString('tr-TR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Hızlı İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Toplam Malzeme Kartı */}
        <div 
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onNavigate('materials')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Malzeme</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalMaterials}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span>Stok sisteminde kayıtlı</span>
          </div>
        </div>

        {/* Toplam Hasta Kartı */}
        <div 
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onNavigate('patients')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Hasta</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalPatients}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <ShoppingCart className="h-4 w-4 text-blue-500 mr-1" />
            <span>Malzeme kullanım kaydı</span>
          </div>
        </div>

        {/* Stok Değeri Kartı */}
        <div 
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onNavigate('reports')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stok Değeri</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">₺{stats.totalStockValue.toFixed(0)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <FileText className="h-4 w-4 text-purple-500 mr-1" />
            <span>Toplam envanter değeri</span>
          </div>
        </div>

        {/* Kritik Stok Kartı */}
        <div 
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-red-500"
          onClick={() => onNavigate('materials')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kritik Stok</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.criticalStockCount}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
            <div className="mt-4 flex items-center text-sm text-red-500">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span>Dikkat gerektiren ürün</span>
          </div>
        </div>
      </div>

      {/* Alt Grid - Kritik Stok ve Son Aktiviteler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kritik Stok Uyarıları */}
        {stats.lowStockMaterials.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600">Kritik Stok Uyarıları</h3>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="space-y-3">
              {stats.lowStockMaterials.slice(0, 5).map((material, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex-1">
                    <div className="font-medium text-red-800">{material.name}</div>
                    <div className="text-sm text-red-600">
                      Mevcut: {material.currentStock} {material.unit} • Min: {material.minStock} {material.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-red-800">
                      ₺{(material.currentStock * material.unitPrice).toFixed(2)}
                    </div>
                    <div className="text-xs text-red-600">Stok Değeri</div>
                  </div>
                </div>
              ))}
            </div>
            {stats.lowStockMaterials.length > 5 && (
              <div className="mt-4 text-center">
                <button 
                  onClick={() => onNavigate('materials')}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  +{stats.lowStockMaterials.length - 5} daha göster
                </button>
              </div>
            )}
          </div>
        )}

        {/* Son Aktiviteler */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Son Aktiviteler</h3>
            <ClipboardList className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {stats.recentActivities.slice(0, 6).map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                  activity.action.includes('YENİ') ? 'bg-green-500' :
                  activity.action.includes('GÜNCELLE') ? 'bg-blue-500' :
                  activity.action.includes('SİL') ? 'bg-red-500' : 'bg-gray-500'
                }`}></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm text-gray-700">{activity.performedBy}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.performedAt).toLocaleTimeString('tr-TR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {activity.module}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {stats.recentActivities.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <ClipboardList className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p>Henüz aktivite kaydı bulunmuyor</p>
            </div>
          )}
        </div>
      </div>

      {/* En Çok Kullanılan Malzemeler */}
      {stats.topUsedMaterials.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">En Çok Kullanılan Malzemeler</h3>
            <BarChart3 className="h-5 w-5 text-gray-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.topUsedMaterials.map((material, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">{material.quantity}</div>
                <div className="text-sm font-medium text-gray-700 mb-1">{material.name}</div>
                <div className="text-xs text-gray-500">₺{material.cost.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hızlı Erişim Butonları */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Hızlı Erişim</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('materials')}
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
          >
            <Package className="h-6 w-6 text-blue-600 mb-2" />
            <div className="font-medium text-blue-800">Malzeme Ekle</div>
            <div className="text-sm text-blue-600">Yeni malzeme kaydı oluştur</div>
          </button>
          
          <button
            onClick={() => onNavigate('patients')}
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
          >
            <Users className="h-6 w-6 text-green-600 mb-2" />
            <div className="font-medium text-green-800">Hasta Ekle</div>
            <div className="text-sm text-green-600">Yeni hasta kaydı oluştur</div>
          </button>
          
          <button
            onClick={() => onNavigate('invoices')}
            className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
          >
            <FileText className="h-6 w-6 text-purple-600 mb-2" />
            <div className="font-medium text-purple-800">Fatura Ekle</div>
            <div className="text-sm text-purple-600">Yeni fatura kaydı oluştur</div>
          </button>
          
          <button
            onClick={() => onNavigate('stock-count')}
            className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-left"
          >
            <ClipboardList className="h-6 w-6 text-orange-600 mb-2" />
            <div className="font-medium text-orange-800">Stok Sayımı</div>
            <div className="text-sm text-orange-600">Yeni sayım oturumu başlat</div>
          </button>
        </div>
      </div>
    </div>
  );
}