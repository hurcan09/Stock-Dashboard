// src/components/Layout.tsx - GÜNCELLENMİŞ VE TAM UYUMLU VERSİYON
import React, { ReactNode, useState, useEffect, useCallback } from 'react';
import { 
  Eye as Hospital, 
  Package, 
  Users, 
  FileText, 
  ClipboardList, 
  BarChart3, 
  LogOut, 
  Bell, 
  AlertTriangle,
  CheckSquare,
  Menu,
  X,
  Home,
  User,
  Search,
  ChevronDown,
  UserCheck,
  Clock,
  Power,
  Settings,
  Shield,
  Activity
} from 'lucide-react';
import { dataService } from '../utils/dataService';
import { DashboardStats, User as UserType, MaterialStatus, SystemLog } from '../types';

interface LayoutProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  user: UserType;
  onLogout: () => void;
  children: ReactNode;
}

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
  link: string;
}

// Statü kartı component'ı
const StatusCard: React.FC<{
  status: MaterialStatus;
  count: number;
}> = ({ status, count }) => {
  const statusConfig = {
    normal: {
      label: 'Normal Malzemeler',
      icon: 'N',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      iconBg: 'bg-green-100',
      iconText: 'text-green-700'
    },
    konsinye: {
      label: 'Konsinye Malzemeler',
      icon: 'K',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-700'
    },
    iade: {
      label: 'İade Malzemeler',
      icon: 'İ',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      iconBg: 'bg-red-100',
      iconText: 'text-red-700'
    },
    faturalı: {
      label: 'Faturalı Malzemeler',
      icon: 'F',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-700'
    }
  };

  const config = statusConfig[status];

  return (
    <div 
      className={`${config.bgColor} rounded-xl shadow-sm border ${config.borderColor} p-4 transition-all duration-300 hover:shadow-md hover:border-blue-300`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${config.textColor}`}>
            {config.label}
          </p>
          <p className={`text-2xl font-bold mt-1 text-gray-900`}>
            {count}
          </p>
        </div>
        <div className={`h-10 w-10 rounded-full ${config.iconBg} flex items-center justify-center`}>
          <span className={`text-sm font-bold ${config.iconText}`}>
            {config.icon}
          </span>
        </div>
      </div>
    </div>
  );
};

// Bildirim öğesi component'ı
const NotificationItem: React.FC<{
  notification: Notification;
  onClick: (id: string, link: string) => void;
}> = ({ notification, onClick }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      case 'success': return <CheckSquare className="h-5 w-5" />;
      case 'error': return <AlertTriangle className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getIconColor = () => {
    switch (notification.type) {
      case 'warning': return 'bg-orange-100 text-orange-600';
      case 'success': return 'bg-green-100 text-green-600';
      case 'error': return 'bg-red-100 text-red-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <div
      onClick={() => onClick(notification.id, notification.link)}
      className={`px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
        notification.read ? 'opacity-70' : 'bg-blue-50'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full ${getIconColor()}`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900">
              {notification.title}
            </p>
            {!notification.read && (
              <div className="h-2 w-2 rounded-full bg-orange-500"></div>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {notification.time}
          </p>
        </div>
      </div>
    </div>
  );
};

// Sol Menü Component'i
const SideMenu: React.FC<{
  currentPage: string;
  onPageChange: (page: string) => void;
  user: UserType;
}> = ({ currentPage, onPageChange, user }) => {
  const [showUserSection, setShowUserSection] = useState(false);
  
  const menuItems = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: <Home className="h-5 w-5" />, permission: 'viewDashboard' },
    { id: 'materials', label: 'Malzeme', icon: <Package className="h-5 w-5" />, permission: 'manageMaterials' },
    { id: 'stock-count', label: 'Stok Takip', icon: <ClipboardList className="h-5 w-5" />, permission: 'manageMaterials' },
    { id: 'patients', label: 'Hasta', icon: <Users className="h-5 w-5" />, permission: 'managePatients' },
    { id: 'invoices', label: 'Fatura', icon: <FileText className="h-5 w-5" />, permission: 'manageInvoices' },
    { id: 'reports', label: 'Raporlar', icon: <BarChart3 className="h-5 w-5" />, permission: 'viewReports' },
  ];

  // Kullanıcı yönetimi sadece admin için
  if (user?.permissions?.manageUsers) {
    menuItems.push({ id: 'users', label: 'Kullanıcılar', icon: <User className="h-5 w-5" />, permission: 'manageUsers' });
  }

  const filteredMenuItems = menuItems.filter(item => 
    !item.permission || user?.permissions?.[item.permission as keyof UserType['permissions']]
  );

  // Son Aktiviteler - Sadece Admin için
  const recentActivities = dataService.getLogs().slice(0, 5);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#0F1B5D] to-[#1E3A8A] text-white">
      {/* Logo ve Hastane Adı */}
      <div className="p-6 border-b border-blue-900">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-xl">
              <Hospital className="h-7 w-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-white rounded-full"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Osmangazi Göz</h1>
            <p className="text-orange-400 text-sm">Stok Takip Sistemi</p>
          </div>
        </div>
      </div>

      {/* Kullanıcı Bilgileri */}
      <div className="p-4 border-b border-blue-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-lg shadow-xl">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">{user?.name}</p>
            <p className="text-sm text-orange-300 capitalize">{user?.role}</p>
          </div>
          <button 
            onClick={() => setShowUserSection(!showUserSection)}
            className="p-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            <ChevronDown className={`h-4 w-4 text-blue-300 transition-transform ${showUserSection ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Kullanıcı Detayları */}
      {showUserSection && (
        <div className="px-4 py-3 bg-blue-900/50">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-300">Departman:</span>
              <span className="font-medium text-white">{user?.department}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-300">Email:</span>
              <span className="font-medium text-white">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-300">Yetkiler:</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {user?.permissions?.manageMaterials && (
                  <span className="px-2 py-1 bg-blue-700 text-blue-100 text-xs rounded-full">Malzeme</span>
                )}
                {user?.permissions?.managePatients && (
                  <span className="px-2 py-1 bg-green-700 text-green-100 text-xs rounded-full">Hasta</span>
                )}
                {user?.permissions?.manageInvoices && (
                  <span className="px-2 py-1 bg-purple-700 text-purple-100 text-xs rounded-full">Fatura</span>
                )}
                {user?.permissions?.viewReports && (
                  <span className="px-2 py-1 bg-orange-700 text-orange-100 text-xs rounded-full">Rapor</span>
                )}
                {user?.permissions?.manageUsers && (
                  <span className="px-2 py-1 bg-red-700 text-red-100 text-xs rounded-full">Kullanıcı</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ana Menü */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 font-medium rounded-lg transition-all duration-300 ${
                currentPage === item.id
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl border-l-4 border-orange-400'
                  : 'text-blue-100 hover:text-white hover:bg-blue-800'
              }`}
            >
              <div className={`${currentPage === item.id ? 'text-white' : 'text-orange-300'}`}>
                {item.icon}
              </div>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Son Aktiviteler - Sadece Admin için */}
      {user?.permissions?.manageUsers && (
        <div className="p-4 border-t border-blue-800">
          <h3 className="font-semibold text-orange-400 mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Son Aktiviteler
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {recentActivities.map((log: SystemLog, index) => (
              <div key={index} className="bg-blue-900/20 rounded-lg p-2">
                <p className="text-xs font-medium text-white">{log.performedBy}</p>
                <p className="text-xs text-blue-200 truncate">{log.details}</p>
                <p className="text-xs text-blue-400 text-right">
                  {log.performedAt ? new Date(log.performedAt).toLocaleTimeString('tr-TR') : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Layout({ children, currentPage, onPageChange, user, onLogout }: LayoutProps) {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
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

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadDashboardStats();
    loadNotifications();
    
    // 30 saniyede bir dashboard istatistiklerini güncelle
    const interval = setInterval(loadDashboardStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDashboardStats = useCallback(() => {
    const stats = dataService.getDashboardStats();
    setDashboardStats(stats);
  }, []);

  const loadNotifications = useCallback(() => {
    const criticalMaterials = dataService.getLowStockMaterials();
    const expiredMaterials = dataService.getExpiredMaterials();
    const expiringSoonMaterials = dataService.getExpiringSoonMaterials(7);
    const recentSessions = dataService.getStockCountSessions()
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 5);

    const newNotifications: Notification[] = [];

    // Kritik stok bildirimleri
    criticalMaterials.forEach(material => {
      newNotifications.push({
        id: `critical-${material.id}-${Date.now()}`,
        type: 'warning',
        title: '⚠️ Kritik Stok Uyarısı',
        message: `${material.name} malzemesi kritik stok seviyesinde (${material.currentStock} ${material.unit})`,
        time: 'Şimdi',
        read: false,
        link: 'materials'
      });
    });

    // Son kullanma tarihi geçmiş malzemeler
    expiredMaterials.forEach(material => {
      newNotifications.push({
        id: `expired-${material.id}-${Date.now()}`,
        type: 'error',
        title: '⏰ Son Kullanma Tarihi Geçmiş',
        message: `${material.name} malzemesinin son kullanma tarihi geçmiş (${material.expirationDate})`,
        time: 'Şimdi',
        read: false,
        link: 'materials'
      });
    });

    // Yakında bitecek malzemeler
    expiringSoonMaterials.forEach(material => {
      newNotifications.push({
        id: `expiring-${material.id}-${Date.now()}`,
        type: 'warning',
        title: '📅 Yakında Bitecek',
        message: `${material.name} malzemesinin son kullanma tarihi yaklaşıyor (${material.expirationDate})`,
        time: 'Şimdi',
        read: false,
        link: 'materials'
      });
    });

    // Yeni sayım oturumları
    recentSessions.forEach(session => {
      newNotifications.push({
        id: `session-${session.id}-${Date.now()}`,
        type: 'info',
        title: '📋 Yeni Sayım Oturumu',
        message: `${session.sessionNo} - ${session.invoiceNo} oturumu oluşturuldu`,
        time: session.createdAt ? new Date(session.createdAt).toLocaleDateString('tr-TR') : '',
        read: false,
        link: 'stock-count'
      });
    });

    // Eski okunmuş bildirimleri koru
    const existingReadNotifications = notifications.filter(n => n.read);
    const allNotifications = [...newNotifications, ...existingReadNotifications]
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, 20);

    setNotifications(allNotifications);
  }, [notifications]);

  const hasCriticalStock = dashboardStats.criticalStockCount > 0;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  }, [notifications]);

  const handleNotificationClick = (id: string, link: string) => {
    markNotificationAsRead(id);
    onPageChange(link);
    setShowNotifications(false);
  };

  const getStatusCount = (status: MaterialStatus) => {
    return dashboardStats.statusSummary?.[status] || 0;
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex">
      {/* Sabit Sol Menü - Desktop */}
      <div className="hidden lg:flex lg:w-72 xl:w-80 flex-shrink-0 sticky top-0 h-screen z-50">
        <SideMenu 
          currentPage={currentPage}
          onPageChange={onPageChange}
          user={user}
        />
      </div>

      {/* Ana İçerik Alanı */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Modern Header */}
        <header className="bg-gradient-to-r from-[#0F1B5D] to-[#1E3A8A] text-white shadow-lg sticky top-0 z-40 border-b border-blue-800">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Sol Taraf: Logo ve Menü Toggle (Mobil) */}
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="lg:hidden p-2 rounded-lg hover:bg-blue-800 transition-colors"
                  aria-label="Menüyü aç/kapat"
                >
                  {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
                
                <div className="flex items-center space-x-3 lg:hidden">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                      <Hospital className="h-6 w-6 text-white" />
                    </div>
                    {hasCriticalStock && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">Osmangazi Göz</h1>
                    <p className="text-orange-400 text-xs">Stok Takip Sistemi</p>
                  </div>
                </div>
              </div>
              
              {/* Orta: Sayfa Başlığı */}
              <div className="hidden lg:flex flex-1 justify-center">
                <div className="bg-blue-800/50 backdrop-blur-sm px-6 py-2 rounded-full border border-blue-700/50">
                  <h2 className="text-lg font-semibold text-white text-center">
                    {currentPage === 'dashboard' && 'Ana Sayfa'}
                    {currentPage === 'materials' && 'Malzeme Yönetimi'}
                    {currentPage === 'stock-count' && 'Stok Takip'}
                    {currentPage === 'patients' && 'Hasta Yönetimi'}
                    {currentPage === 'invoices' && 'Fatura Yönetimi'}
                    {currentPage === 'reports' && 'Raporlar'}
                    {currentPage === 'users' && 'Kullanıcı Yönetimi'}
                  </h2>
                </div>
              </div>
              
              {/* Sağ Taraf: Kullanıcı ve Bildirimler */}
              <div className="flex items-center space-x-4">
                {/* Mobil Sayfa Başlığı */}
                <div className="lg:hidden text-center">
                  <h2 className="text-sm font-semibold text-white">
                    {currentPage === 'dashboard' && 'Ana Sayfa'}
                    {currentPage === 'materials' && 'Malzeme'}
                    {currentPage === 'stock-count' && 'Stok'}
                    {currentPage === 'patients' && 'Hasta'}
                    {currentPage === 'invoices' && 'Fatura'}
                    {currentPage === 'reports' && 'Raporlar'}
                    {currentPage === 'users' && 'Kullanıcılar'}
                  </h2>
                </div>
                
                {/* Bildirimler */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowUserMenu(false);
                    }}
                    className="relative p-2 rounded-full bg-blue-800 hover:bg-blue-700 transition-colors shadow-lg"
                    title="Bildirimler"
                    aria-label="Bildirimler"
                  >
                    <Bell className="h-6 w-6 text-blue-200" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </span>
                    )}
                  </button>
                  
                  {/* Bildirimler Paneli */}
                  {showNotifications && (
                    <div className="fixed lg:absolute right-4 top-20 lg:top-full lg:mt-2 w-96 max-w-[90vw] bg-white backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 py-2 z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                        <h3 className="font-bold text-lg text-gray-900">Bildirimler</h3>
                        <div className="flex items-center space-x-2">
                          {unreadNotifications > 0 && (
                            <button
                              onClick={markAllNotificationsAsRead}
                              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                            >
                              Tümünü okundu işaretle
                            </button>
                          )}
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="text-gray-400 hover:text-orange-600"
                            aria-label="Bildirimleri kapat"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="max-h-[60vh] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <NotificationItem
                              key={notification.id}
                              notification={notification}
                              onClick={handleNotificationClick}
                            />
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center">
                            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Bildirim bulunmuyor</p>
                            <p className="text-sm text-gray-400 mt-1">Tüm işlemleriniz güncel</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="px-4 py-3 border-t border-gray-200">
                        <button
                          onClick={() => {
                            setShowNotifications(false);
                            onPageChange('reports');
                          }}
                          className="w-full text-center font-medium text-orange-600 hover:text-orange-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Tüm bildirimleri görüntüle →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Kullanıcı Menüsü */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                      setShowNotifications(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-blue-800 hover:bg-blue-700 transition-colors shadow-lg"
                    aria-label="Kullanıcı menüsü"
                  >
                    <div className="flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold shadow-lg">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-sm font-semibold text-white">{user?.name}</p>
                      <p className="text-xs text-orange-300 capitalize">{user?.role}</p>
                    </div>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="px-2 py-1 bg-gray-100 text-orange-600 text-xs rounded-full capitalize">
                            {user?.department}
                          </span>
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full capitalize">
                            {user?.role}
                          </span>
                        </div>
                      </div>
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onPageChange('dashboard');
                          }}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                        >
                          <Home className="h-4 w-4 text-gray-500" />
                          <span>Ana Sayfa</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            // Profil sayfası eklenecek
                          }}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                        >
                          <User className="h-4 w-4 text-gray-500" />
                          <span>Profilim</span>
                        </button>
                        <div className="border-t border-gray-200 my-2"></div>
                        <button
                          onClick={onLogout}
                          className="w-full px-4 py-2 text-left font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors flex items-center space-x-3"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Çıkış Yap</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobil Menü Overlay */}
        {showMobileMenu && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowMobileMenu(false)}
            />
            <div className="absolute left-0 top-0 h-full w-80 bg-gradient-to-b from-[#0F1B5D] to-[#1E3A8A] text-white shadow-2xl">
              <SideMenu 
                currentPage={currentPage}
                onPageChange={(page) => {
                  onPageChange(page);
                  setShowMobileMenu(false);
                }}
                user={user}
              />
            </div>
          </div>
        )}

        {/* Ana İçerik */}
        <main className="flex-1 overflow-x-auto p-0">
          <div className="bg-white min-h-[calc(100vh-12rem)] p-4 lg:p-6">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-[#0F1B5D] to-[#1E3A8A] text-white p-4 border-t border-blue-800">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-3 md:mb-0">
              <h3 className="text-base font-bold flex items-center text-white">
                <div className="relative mr-2">
                  <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Hospital className="h-3 w-3 text-white" />
                  </div>
                  {hasCriticalStock && (
                    <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                Osmangazi Göz Hastanesi
              </h3>
              <p className="text-orange-400 text-xs">Stok Takip Sistemi v3.0</p>
              <div className="mt-1 flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-blue-800/50 text-orange-300 text-xs rounded-full">
                  Kullanıcı: {user?.name}
                </span>
                <span className="px-2 py-0.5 bg-orange-900/50 text-orange-300 text-xs rounded-full capitalize">
                  Rol: {user?.role}
                </span>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm font-medium text-blue-300">© {new Date().getFullYear()} Osmangazi Göz. Tüm Hakları Saklıdır</p>
              <div className="flex flex-wrap justify-center md:justify-end gap-2 mt-1">
                <div className="flex items-center space-x-1">
                  <Package className="h-3 w-3 text-orange-400" />
                  <span className="text-xs text-blue-300">Malzeme: <span className="font-bold text-white">{dashboardStats.totalMaterials}</span></span>
                </div>
                <div className="flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3 text-red-400" />
                  <span className="text-xs text-blue-300">Kritik: <span className="font-bold text-white">{dashboardStats.criticalStockCount}</span></span>
                </div>
                <div className="flex items-center space-x-1">
                  <Search className="h-3 w-3 text-green-400" />
                  <span className="text-xs text-blue-300">Değer: <span className="font-bold text-white">₺{dashboardStats.totalStockValue.toLocaleString('tr-TR')}</span></span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Genel Overlay'ler */}
      {(showNotifications || showUserMenu) && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </div>
  );
}