// src/App.tsx - GÜNCELLENMİŞ VERSİYON
import React, { useState, useEffect } from 'react';
import MaterialManagement from './components/MaterialManagement';
import StockCountManagement from './components/StockCountManagement';
import PatientManagement from './components/PatientManagement';
import InvoiceManagement from './components/InvoiceManagement';
import Reports from './components/Reports';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Anasayfa from './components/Anasayfa';
import DoctorManagement from './components/DoctorManagement.tsx';
import UserManagement from './components/UserManagement';
import { dataService } from './utils/dataService';
import { User } from './types';
import { AuthProvider, useAuth } from './components/AuthContext.tsx';

interface AuthProps {
  onLogin: (userData: User) => void;
}

// Ana uygulama bileşeni
function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { user, isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 App component yüklendi');
    
    const checkAuth = () => {
      const currentUserData = localStorage.getItem('currentUser');
      
      if (currentUserData) {
        try {
          const parsedUser = JSON.parse(currentUserData);
          if (parsedUser && parsedUser.id) {
            console.log('✅ LocalStorage\'dan kullanıcı bulundu:', parsedUser.name);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('❌ Kullanıcı verisi parse edilemedi:', error);
        }
      }
      
      const adminUser = dataService.getUsers().find(u => u.role === 'admin');
      
      if (adminUser) {
        console.log('✅ Admin kullanıcı bulundu, otomatik giriş yapılıyor:', adminUser.name);
        dataService.setCurrentUser(adminUser);
      } else {
        console.log('❌ Admin kullanıcı bulunamadı, auth ekranı gösteriliyor');
      }
      setLoading(false);
    };

    const timer = setTimeout(checkAuth, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Anasayfa />;
      case 'materials':
        return (
          <div className="h-full">
            <MaterialManagement />
          </div>
        );
      case 'stock-count':
        return <StockCountManagement />;
      case 'patients':
        return <PatientManagement />;
      case 'invoices':
        return <InvoiceManagement />;
      case 'reports':
        return <Reports />;
      case 'users':
        return <UserManagement />;
      case 'doctors':
        return <DoctorManagement />;
      case 'daily-plan':
        return <div>Günlük Plan (Yapım aşamasında)</div>;
      default:
        return <Anasayfa />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-orange-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg 
                className="h-8 w-8 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="text-2xl font-bold text-white mt-6 mb-2">
          Osmangazi Göz Stok Takip Sistemi
        </div>
        <div className="text-blue-200">
          Sistem hazırlanıyor...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const AuthComponent = Auth as React.FC<AuthProps>;
    return <AuthComponent onLogin={() => {}} />;
  }

  return (
    <Layout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    >
      {renderPage()}
    </Layout>
  );
}

// Ana App bileşeni
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;