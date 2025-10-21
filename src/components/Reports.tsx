import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingDown, 
  TrendingUp, 
  Package, 
  Users, 
  AlertTriangle, 
  Calendar, 
  PieChart,
  LineChart as LineChartIcon,
  Download,
  Eye
} from 'lucide-react';
import { Material, Patient, PatientMaterialUsage, Invoice, SystemLog, MaterialUsageAnalysis, StockValueAnalysis, YearlySummary } from '../types';
import { dataService } from '../utils/dataService';

// Modal bileşenleri
interface MaterialsModalProps {
  materials: Material[];
  title: string;
  onClose: () => void;
}

function MaterialsModal({ materials, title, onClose }: MaterialsModalProps) {
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>(materials);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');

  useEffect(() => {
    let filtered = materials;
    
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.barcode.includes(searchTerm) ||
        m.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter) {
      filtered = filtered.filter(m => m.category === categoryFilter);
    }
    
    if (supplierFilter) {
      filtered = filtered.filter(m => m.supplier === supplierFilter);
    }
    
    setFilteredMaterials(filtered);
  }, [materials, searchTerm, categoryFilter, supplierFilter]);

  const categories = [...new Set(materials.map(m => m.category))];
  const suppliers = [...new Set(materials.map(m => m.supplier))];

  const handleExport = () => {
    const headers = ['Malzeme Adı', 'Barkod', 'Kategori', 'Mevcut Stok', 'Kritik Stok', 'Birim Fiyat', 'Tedarikçi', 'Stok Değeri'];
    const data = filteredMaterials.map(material => [
      material.name,
      material.barcode,
      material.category,
      material.currentStock,
      material.minStock,
      material.unitPrice,
      material.supplier,
      (material.currentStock * material.unitPrice).toFixed(2)
    ]);
    
    const csvContent = [headers, ...data]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.toLowerCase().replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-7xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">{title} ({filteredMaterials.length} kayıt)</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Excel'e Aktar</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filtreler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Arama</label>
            <input
              type="text"
              placeholder="Malzeme adı, barkod..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tedarikçi</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
            >
              <option value="">Tüm Tedarikçiler</option>
              {suppliers.map(sup => (
                <option key={sup} value={sup}>{sup}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
                setSupplierFilter('');
              }}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Malzeme Adı</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Barkod</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Kategori</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Mevcut Stok</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Kritik Stok</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Birim Fiyatı</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tedarikçi</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Stok Değeri</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Stok Durumu</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map((material) => {
                const stockRatio = material.minStock > 0 ? material.currentStock / material.minStock : 0;
                const stockValue = material.currentStock * material.unitPrice;
                
                return (
                  <tr key={material.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{material.name}</span>
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
                    <td className="py-3 px-4 text-sm font-semibold text-green-600">
                      ₺{stockValue.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        material.currentStock === 0
                          ? 'bg-red-100 text-red-800'
                          : stockRatio <= 1
                          ? 'bg-yellow-100 text-yellow-800'
                          : stockRatio <= 2
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {material.currentStock === 0
                          ? 'Stok Yok'
                          : stockRatio <= 1
                          ? 'Kritik'
                          : stockRatio <= 2
                          ? 'Düşük'
                          : 'Normal'}
                      </span>
                    </td>
                  </tr>
                );
              })}
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

interface PatientsModalProps {
  patients: Patient[];
  title: string;
  onClose: () => void;
}

function PatientsModal({ patients, title, onClose }: PatientsModalProps) {
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>(patients);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.tcNo.includes(searchTerm) ||
        patient.phone.includes(searchTerm)
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [patients, searchTerm]);

  const handleExport = () => {
    const headers = ['Ad', 'Soyad', 'TC Kimlik No', 'Telefon', 'Adres', 'Kayıt Tarihi'];
    const data = filteredPatients.map(patient => [
      patient.name,
      patient.surname,
      patient.tcNo,
      patient.phone,
      patient.address,
      new Date(patient.createdAt).toLocaleDateString('tr-TR')
    ]);
    
    const csvContent = [headers, ...data]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.toLowerCase().replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-7xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">{title} ({filteredPatients.length} kayıt)</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Excel'e Aktar</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Arama */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Hasta adı, soyadı, TC kimlik no veya telefon ara..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Hasta Bilgileri</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">TC Kimlik No</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Telefon</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Adres</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{patient.name} {patient.surname}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{patient.tcNo}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{patient.phone}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{patient.address}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(patient.createdAt).toLocaleDateString('tr-TR')}
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

// Grafik bileşenleri
interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  title: string;
  height?: number;
}

function BarChart({ data, title, height = 300 }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1); // 0'a bölünmeyi önlemek için minimum 1
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-2" style={{ height: `${height}px` }}>
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-32 text-sm font-medium truncate">{item.label}</div>
            <div className="flex-1">
              <div 
                className="h-6 rounded-lg transition-all duration-500"
                style={{ 
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || '#3b82f6'
                }}
              ></div>
            </div>
            <div className="w-16 text-sm font-semibold text-right">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LineChartProps {
  data: { period: string; value: number }[];
  title: string;
  height?: number;
}

function LineChartComponent({ data, title, height = 300 }: LineChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const range = maxValue - minValue;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div 
        className="relative border-l-2 border-b-2 border-gray-300"
        style={{ height: `${height}px` }}
      >
        {data.map((item, index) => {
          const percentage = range === 0 ? 50 : ((item.value - minValue) / range) * 100;
          const left = (index / (data.length - 1 || 1)) * 100; // Sıfıra bölünmeyi önle
          
          return (
            <div
              key={index}
              className="absolute w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
              style={{
                left: `${left}%`,
                top: `${100 - percentage}%`
              }}
            >
              <div className="absolute -top-8 -left-4 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
                {item.period}: {item.value}
              </div>
            </div>
          );
        })}
        
        {/* Çizgi */}
        <svg className="absolute inset-0 w-full h-full">
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={data.map((_, index) => {
              const left = (index / (data.length - 1 || 1)) * 100;
              const percentage = range === 0 ? 50 : ((data[index].value - minValue) / range) * 100;
              return `${left},${100 - percentage}`;
            }).join(' ')}
          />
        </svg>
        
        {/* Y ekseni etiketleri */}
        <div className="absolute -left-8 top-0 text-xs text-gray-500">{maxValue}</div>
        <div className="absolute -left-8 bottom-0 text-xs text-gray-500">{minValue}</div>
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        {data.map((item, index) => (
          <div key={index} className="text-center">
            {item.period}
          </div>
        ))}
      </div>
    </div>
  );
}

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  title: string;
}

function PieChartComponent({ data, title }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  
  if (total === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <PieChart className="h-12 w-12 mx-auto mb-2" />
          <p>Gösterilecek veri bulunamadı</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex items-center justify-center">
        <div className="relative" style={{ width: '200px', height: '200px' }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const x1 = 100 + 80 * Math.cos(currentAngle * Math.PI / 180);
              const y1 = 100 + 80 * Math.sin(currentAngle * Math.PI / 180);
              
              const x2 = 100 + 80 * Math.cos((currentAngle + angle) * Math.PI / 180);
              const y2 = 100 + 80 * Math.sin((currentAngle + angle) * Math.PI / 180);
              
              const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
              
              const slice = (
                <path
                  key={index}
                  d={path}
                  fill={item.color}
                  stroke="#fff"
                  strokeWidth="2"
                />
              );
              
              currentAngle += angle;
              return slice;
            })}
          </svg>
          
          {/* Ortadaki toplam */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-xs text-gray-500">Toplam</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: item.color }}
            ></div>
            <span>{item.label}</span>
            <span className="ml-auto font-semibold">
              {item.value} ({((item.value / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Ana Reports bileşeni
export default function Reports() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [usages, setUsages] = useState<PatientMaterialUsage[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedChartType, setSelectedChartType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [materialAnalysis, setMaterialAnalysis] = useState<MaterialUsageAnalysis | null>(null);
  const [stockValueAnalysis, setStockValueAnalysis] = useState<StockValueAnalysis | null>(null);
  const [yearlySummary, setYearlySummary] = useState<YearlySummary | null>(null);
  
  const [showAllMaterials, setShowAllMaterials] = useState(false);
  const [showAllPatients, setShowAllPatients] = useState(false);
  const [showCriticalStock, setShowCriticalStock] = useState(false);
  const [showStockValue, setShowStockValue] = useState(false);
  const [showUsageCost, setShowUsageCost] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedYear]);

  useEffect(() => {
    if (selectedMaterial) {
      const analysis = dataService.getMaterialUsageAnalysis(selectedMaterial, selectedYear);
      setMaterialAnalysis(analysis);
    } else {
      setMaterialAnalysis(null);
    }
  }, [selectedMaterial, selectedYear]);

  useEffect(() => {
    const analysis = dataService.getStockValueAnalysis(selectedChartType, selectedYear);
    setStockValueAnalysis(analysis);
  }, [selectedChartType, selectedYear]);

  useEffect(() => {
    const summary = dataService.getYearlySummary(selectedYear);
    setYearlySummary(summary);
  }, [selectedYear]);

  const loadData = () => {
    setMaterials(dataService.getMaterials());
    setPatients(dataService.getPatients());
    setUsages(dataService.getPatientMaterialUsage());
    setInvoices(dataService.getInvoices());
    setLogs(dataService.getLogs());
  };

  const getDateRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return { startDate, endDate };
  };

  const filterByDate = (items: any[], dateField: string, days: number) => {
    const { startDate } = getDateRange(days);
    return items.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= startDate;
    });
  };

  // İstatistiksel veriler - kullanılmayan değişkenler kaldırıldı
  const lowStockMaterials = materials.filter(m => m.currentStock <= m.minStock && m.currentStock > 0);
  const outOfStockMaterials = materials.filter(m => m.currentStock === 0);
  const criticalStockMaterials = [...lowStockMaterials, ...outOfStockMaterials];

  const yearlyUsages = usages.filter(u => {
    try {
      return new Date(u.usageDate).getFullYear() === selectedYear;
    } catch {
      return false;
    }
  });

  const yearlyInvoices = invoices.filter(inv => {
    try {
      return new Date(inv.invoiceDate).getFullYear() === selectedYear;
    } catch {
      return false;
    }
  });

  const periodLogs = filterByDate(logs, 'performedAt', parseInt(selectedPeriod));
  const recentActivities = periodLogs.slice(0, 10);

  // Malzeme kullanım analizi
  const materialUsageMap = new Map<string, { name: string; quantity: number; cost: number }>();
  
  yearlyUsages.forEach(usage => {
    const material = materials.find(m => m.id === usage.materialId);
    if (material) {
      const existing = materialUsageMap.get(usage.materialId) || { 
        name: material.name, 
        quantity: 0, 
        cost: 0 
      };
      materialUsageMap.set(usage.materialId, {
        name: material.name,
        quantity: existing.quantity + usage.quantity,
        cost: existing.cost + usage.totalCost,
      });
    }
  });

  // Hasta maliyet analizi
  const patientCostMap = new Map<string, { name: string; cost: number; usageCount: number }>();
  
  yearlyUsages.forEach(usage => {
    const patient = patients.find(p => p.id === usage.patientId);
    if (patient) {
      const existing = patientCostMap.get(usage.patientId) || { 
        name: `${patient.name} ${patient.surname}`, 
        cost: 0, 
        usageCount: 0 
      };
      patientCostMap.set(usage.patientId, {
        name: existing.name,
        cost: existing.cost + usage.totalCost,
        usageCount: existing.usageCount + 1,
      });
    }
  });

  const topPatientsByExpense = Array.from(patientCostMap.values())
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10);

  // Kategori analizi
  const categoryUsageMap = new Map<string, { quantity: number; cost: number }>();
  
  yearlyUsages.forEach(usage => {
    const material = materials.find(m => m.id === usage.materialId);
    if (material) {
      const existing = categoryUsageMap.get(material.category) || { quantity: 0, cost: 0 };
      categoryUsageMap.set(material.category, {
        quantity: existing.quantity + usage.quantity,
        cost: existing.cost + usage.totalCost,
      });
    }
  });

  const categoryUsageData = Array.from(categoryUsageMap.entries())
    .map(([category, data]) => ({
      label: category,
      value: data.quantity,
      color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`
    }));

  const years = [2022, 2023, 2024, 2025];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Raporlar ve İstatistikler</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <label className="text-sm font-medium text-gray-700">Yıl:</label>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Dönem:</label>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="7">Son 7 gün</option>
              <option value="30">Son 30 gün</option>
              <option value="90">Son 90 gün</option>
              <option value="365">Son 1 yıl</option>
            </select>
          </div>
        </div>
      </div>

      {/* Özet Kartları */}
      {yearlySummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div 
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setShowAllMaterials(true)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Malzeme</p>
                <p className="text-2xl font-bold text-blue-600">{yearlySummary.totalMaterials}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-xs text-blue-600">
              <Eye className="h-3 w-3 mr-1" />
              <span>Detayları görüntüle</span>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setShowAllPatients(true)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Hasta</p>
                <p className="text-2xl font-bold text-green-600">{yearlySummary.totalPatients}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <Eye className="h-3 w-3 mr-1" />
              <span>Detayları görüntüle</span>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setShowStockValue(true)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stok Değeri</p>
                <p className="text-2xl font-bold text-purple-600">₺{yearlySummary.totalStockValue.toFixed(0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center text-xs text-purple-600">
              <Eye className="h-3 w-3 mr-1" />
              <span>Detayları görüntüle</span>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setShowCriticalStock(true)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kritik Stok</p>
                <p className="text-2xl font-bold text-red-600">{yearlySummary.criticalStockCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-2 flex items-center text-xs text-red-600">
              <Eye className="h-3 w-3 mr-1" />
              <span>Detayları görüntüle</span>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setShowUsageCost(true)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kullanım Maliyeti</p>
                <p className="text-2xl font-bold text-orange-600">₺{yearlySummary.totalUsageCost.toFixed(0)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center text-xs text-orange-600">
              <Eye className="h-3 w-3 mr-1" />
              <span>Detayları görüntüle</span>
            </div>
          </div>
        </div>
      )}

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Malzeme Kullanım Analizi */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Malzeme Kullanım Analizi</h3>
            <div className="flex space-x-2">
              <select
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedChartType}
                onChange={(e) => setSelectedChartType(e.target.value as any)}
              >
                <option value="daily">Günlük</option>
                <option value="weekly">Haftalık</option>
                <option value="monthly">Aylık</option>
                <option value="yearly">Yıllık</option>
              </select>
            </div>
          </div>
          {materialAnalysis ? (
            <div className="space-y-4">
              <BarChart 
                data={materialAnalysis.usageTrend.map((item, index) => ({
                  label: item.period,
                  value: item.totalUsage,
                  color: `hsl(${index * 40}, 70%, 50%)`
                }))}
                title="Aylık Kullanım Trendi"
                height={250}
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="font-semibold text-blue-600">Toplam Kullanım</div>
                  <div className="text-xl font-bold">
                    {materialAnalysis.usageTrend.reduce((sum, item) => sum + item.totalUsage, 0)}
                  </div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="font-semibold text-green-600">Toplam Maliyet</div>
                  <div className="text-xl font-bold">
                    ₺{materialAnalysis.usageTrend.reduce((sum, item) => sum + item.totalCost, 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
              <p>Analiz verisi bulunamadı</p>
            </div>
          )}
        </div>

        {/* Stok Değer Trendi */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Stok Değer Trendi</h3>
            <div className="flex items-center space-x-2">
              <LineChartIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">Son 12 Ay</span>
            </div>
          </div>
          {stockValueAnalysis && stockValueAnalysis.monthlyTrend ? (
            <LineChartComponent
              data={stockValueAnalysis.monthlyTrend}
              title="Aylık Stok Değer Trendi"
              height={250}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-2" />
              <p>Trend verisi bulunamadı</p>
            </div>
          )}
        </div>
      </div>

      {/* Kategori ve Hasta Analizleri */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kategori Bazlı Kullanım */}
        <PieChartComponent
          data={categoryUsageData}
          title="Kategori Bazlı Malzeme Kullanımı"
        />

        {/* Hasta Maliyet Analizi */}
        <BarChart
          data={topPatientsByExpense.map((patient, index) => ({
            label: patient.name,
            value: patient.cost,
            color: `hsl(${index * 36}, 70%, 50%)`
          }))}
          title="Hasta Bazlı Malzeme Maliyetleri"
          height={300}
        />
      </div>

      {/* Son Aktiviteler */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Son Aktiviteler</h3>
        <div className="space-y-3">
          {recentActivities.map((log, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  log.action === 'CREATE' ? 'bg-green-500' :
                  log.action === 'UPDATE' ? 'bg-blue-500' :
                  log.action === 'DELETE' ? 'bg-red-500' : 'bg-gray-500'
                }`}></div>
                <span className="text-sm">{log.details}</span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(log.performedAt).toLocaleString('tr-TR')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal'lar */}
      {showAllMaterials && (
        <MaterialsModal
          materials={materials}
          title="Tüm Malzemeler"
          onClose={() => setShowAllMaterials(false)}
        />
      )}

      {showAllPatients && (
        <PatientsModal
          patients={patients}
          title="Tüm Hastalar"
          onClose={() => setShowAllPatients(false)}
        />
      )}

      {showCriticalStock && (
        <MaterialsModal
          materials={criticalStockMaterials}
          title="Kritik Stoktaki Malzemeler"
          onClose={() => setShowCriticalStock(false)}
        />
      )}

      {showStockValue && (
        <MaterialsModal
          materials={materials.sort((a, b) => (b.currentStock * b.unitPrice) - (a.currentStock * a.unitPrice))}
          title="Stok Değeri En Yüksek Malzemeler"
          onClose={() => setShowStockValue(false)}
        />
      )}

      {showUsageCost && (
        <MaterialsModal
          materials={materials.filter(m => 
            yearlyUsages.some(u => u.materialId === m.id)
          ).sort((a, b) => {
            const aUsage = yearlyUsages.filter(u => u.materialId === a.id).reduce((sum, u) => sum + u.totalCost, 0);
            const bUsage = yearlyUsages.filter(u => u.materialId === b.id).reduce((sum, u) => sum + u.totalCost, 0);
            return bUsage - aUsage;
          })}
          title="En Çok Kullanılan Malzemeler (Maliyet)"
          onClose={() => setShowUsageCost(false)}
        />
      )}
    </div>
  );
}