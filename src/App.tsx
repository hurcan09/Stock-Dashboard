import { useState } from 'react';
import Layout from './components/Layout';
import MaterialManagement from './components/MaterialManagement';
import StockCountManagement from './components/StockCountManagement';
import PatientManagement from './components/PatientManagement';
import InvoiceManagement from './components/InvoiceManagement';
import Reports from './components/Reports';

function App() {
  const [currentPage, setCurrentPage] = useState('materials');

  const renderPage = () => {
    switch (currentPage) {
      case 'materials':
        return <MaterialManagement />;
      case 'stock-count':
        return <StockCountManagement />;
      case 'patients':
        return <PatientManagement />;
      case 'invoices':
        return <InvoiceManagement />;
      case 'reports':
        return <Reports />;
      default:
        return <MaterialManagement />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;