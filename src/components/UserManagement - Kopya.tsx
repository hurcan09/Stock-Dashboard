import React, { useState, useEffect } from 'react';
import { 
  Package, Users, FileText, BarChart3, 
  AlertTriangle, Clock, TrendingUp, Activity,
  Eye, EyeOff, ChevronDown, Filter,
  Plus, Download, RefreshCw, Search
} from 'lucide-react';
import { dataService } from '../utils/dataService';
import { User, DashboardStats, Material } from '../types';

interface DashboardProps {
  user: User;
  onPageChange: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onPageChange }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalMaterials: 0,
    totalPatients: 0,
    totalStockValue: 0,
    criticalStockCount: 0,
    totalUsageCost: 0,
    lowStockMaterials: [],
    recentActivities: [],
    topUsedMaterials: [],
    totalInvoices: 0,
    totalInvoiceAmount: 0,
    todayUsageCost: 0,
    weeklySales: 0,
    monthlySales: 0,
    todayUsagesCount: 0,
    activeSessions: 0,
    statusSummary: {
      normal: 0,
      konsinye: 0,
      iade: 0,
      faturalı: 0
    },
    totalSessions: 0,
    recentSessions: [],
    quickCountSessions: 0,
    todayCounts: 0,
    pendingApprovals: 0,
    dailyPlan: {
      surgeries: 0,
      appointments: 0,
      emergencyCases: 0,
      mealsServed: 0
    },
    hospitalStats: {
      totalDoctors: 0,
      totalNurses: 0,
      bedOccupancy: 0,
      todayRevenue: 0
    },
    userStats: {
      activeUsers: 0,
      activeSessions: 0,
      recentLogins: 0
    }
  });

  const [lowStockMaterials, setLowStockMaterials] = useState<Material[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = () => {
    const dashboardStats = dataService.getDashboardStats();
    setStats(dashboardStats);
    
    const materials = dataService.getLowStockMaterials();
    setLowStockMaterials(materials.slice(0, 5));
    
    const activities = dataService.getLogs().slice(0, 10);
    setRecentActivities(activities);
  };

  const getStatusCount = (status: string) => {
    return stats.statusSummary?.[status as keyof typeof stats.statusSummary] || 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const quickActions = [
    { icon: <Plus className="h-4 w-4" />, label: 'Yeni Malzeme', action: () => onPageChange('materials') },
    { icon: <Package className="h-4 w-4" />, label: 'Stok Sayımı', action: () => onPageChange('stock-count') },
    { icon: <Users className="h-4 w-4" />, label: 'Hasta Ekle', action: () => onPageChange('patients') },
    { icon: <FileText className="h-4 w-4" />, label: 'Fatura Oluştur', action: () => onPageChange('invoices') },
  ];

  return (
    <div className="p-4 lg:p-6">
      {/* Hoşgeldin Kartı */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 mb-8 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Hoşgeldin, {user.name}!
            </h1>
            <p className="text-gray-600 mb-4">
              Osmangazi Göz Stok Takip Sistemine başarıyla giriş yaptınız.
              {user.role === 'admin' && ' Yönetici panelini kullanabilirsiniz.'}
              {user.role === 'manager' && ' Stok işlemlerini yönetebilirsiniz.'}
              {user.role === 'doctor' && ' Hasta kayıtlarını görüntüleyebilirsiniz.'}
              {user.role === 'staff' && ' Günlük operasyonları takip edebilirsiniz.'}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Rol: {user.role}
              </span>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                Departman: {user.department}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Son Giriş: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('tr-TR') : 'Bugün'}
              </span>
            </div>
          </div>
          <button
            onClick={loadDashboardData}
            className="mt-4 lg:mt-0 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Yenile
          </button>
        </div>
      </div>

      {/* Hızlı Aksiyonlar */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Aksiyonlar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  {action.icon}
                </div>
                <span className="font-medium text-gray-900">{action.label}</span>
              </div>
              <ChevronDown className="h-5 w-5 text-gray-400 transform rotate-270" />
            </button>
          ))}
        </div>
      </div>

      {/* Genel İstatistikler */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Genel İstatistikler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Toplam</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{stats.totalMaterials}</h3>
            <p className="text-gray-600">Malzeme Sayısı</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Kritik</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{stats.criticalStockCount}</h3>
            <p className="text-gray-600">Düşük Stok</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Değer</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {formatCurrency(stats.totalStockValue)}
            </h3>
            <p className="text-gray-600">Stok Değeri</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Hasta</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{stats.totalPatients}</h3>
            <p className="text-gray-600">Toplam Hasta</p>
          </div>
        </div>
      </div>

      {/* Düşük Stok Malzemeler ve Son Aktiviteler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Düşük Stok Malzemeler */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Düşük Stok Malzemeler
            </h3>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
              {lowStockMaterials.length} adet
            </span>
          </div>
          
          <div className="space-y-4">
            {lowStockMaterials.length > 0 ? (
              lowStockMaterials.map((material) => (
                <div
                  key={material.id}
                  className="p-4 border border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer"
                  onClick={() => onPageChange('materials')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{material.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{material.code} • {material.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-700">
                        {material.currentStock} {material.unit}
                      </div>
                      <div className="text-sm text-orange-600">
                        Min: {material.minStock} {material.unit}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Düşük stok malzemesi bulunmuyor</p>
                <p className="text-sm text-gray-400 mt-1">Tüm stoklar yeterli seviyede</p>
              </div>
            )}
          </div>

          {lowStockMaterials.length > 0 && (
            <button
              onClick={() => onPageChange('materials')}
              className="w-full mt-6 px-4 py-2 bg-white border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium"
            >
              Tüm Düşük Stokları Görüntüle
            </button>
          )}
        </div>

        {/* Son Aktiviteler */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Son Aktiviteler
            </h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              Son 10 aktivite
            </span>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {recentActivities.length > 0 ? (
              recentActivities.map((log, index) => (
                <div key={index} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          log.action.includes('CREATE') ? 'bg-green-100 text-green-800' :
                          log.action.includes('UPDATE') ? 'bg-blue-100 text-blue-800' :
                          log.action.includes('DELETE') ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.action}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{log.performedBy}</span>
                      </div>
                      <p className="text-gray-600 text-sm mt-2">{log.details}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-xs text-gray-500">
                        {log.performedAt ? new Date(log.performedAt).toLocaleDateString('tr-TR') : ''}
                      </div>
                      <div className="text-xs text-gray-400">
                        {log.performedAt ? new Date(log.performedAt).toLocaleTimeString('tr-TR') : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aktivite bulunmuyor</p>
                <p className="text-sm text-gray-400 mt-1">Henüz bir işlem gerçekleştirilmemiş</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Malzeme Statüleri */}
      <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Malzeme Statüleri</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-green-800">Normal Malzemeler</span>
              <span className="h-2 w-2 bg-green-500 rounded-full"></span>
            </div>
            <div className="text-2xl font-bold text-green-900">{getStatusCount('normal')}</div>
          </div>
          
          <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-blue-800">Konsinye Malzemeler</span>
              <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{getStatusCount('konsinye')}</div>
          </div>
          
          <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-red-800">İade Malzemeler</span>
              <span className="h-2 w-2 bg-red-500 rounded-full"></span>
            </div>
            <div className="text-2xl font-bold text-red-900">{getStatusCount('iade')}</div>
          </div>
          
          <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-purple-800">Faturalı Malzemeler</span>
              <span className="h-2 w-2 bg-purple-500 rounded-full"></span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{getStatusCount('faturalı')}</div>
          </div>
        </div>
      </div>

      {/* Footer Notu */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              <strong>Osmangazi Göz Stok Takip Sistemi v3.0</strong>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Son güncelleme: {new Date().toLocaleString('tr-TR')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">
              Aktif Kullanıcı: {user.name}
            </p>
            <p className="text-xs text-gray-500">
              Yetkiler: {Object.keys(user.permissions).filter(k => user.permissions[k as keyof typeof user.permissions]).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;