import InventoryOverview from './components/InventoryOverview';
// src/App.tsx - GÜNCELLENMİŞ VERSİYON
import { useState, useEffect } from 'react';
import MaterialManagement from './components/MaterialManagement';
import StockCountManagement from './components/StockCountManagement';
import InvoiceManagement from './components/InvoiceManagement';
import Reports from './components/Reports';

import Layout from './components/Layout';
import UserManagement from './components/UserManagement';
import { dataService } from './utils/dataService';
import { AuthProvider, useAuth } from './components/AuthContext.tsx';

// Ana uygulama bileşeni
function AppContent() {
  const [requestedPage, setCurrentPage] = useState('dashboard');
  const { isAuthenticated, canViewPage } = useAuth();
  const currentPage = canViewPage(requestedPage) ? requestedPage : 'dashboard';
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <InventoryOverview navigate={setCurrentPage} />;
      case 'materials':
        return (
          <div className="h-full">
            <MaterialManagement />
          </div>
        );
      case 'stock-count':
        return <StockCountManagement />;
      case 'count-history':
        return <InventoryOverview history navigate={setCurrentPage} />;
      case 'invoices':
        return <InvoiceManagement />;
      case 'reports':
        return <Reports onHistory={() => setCurrentPage('count-history')} />;
      case 'users':
        return <UserManagement />;
      default:
        return <InventoryOverview navigate={setCurrentPage} />;
    }
  };

  if (!isAuthenticated) return null;

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