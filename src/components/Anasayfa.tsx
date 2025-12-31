// src/components/Anasayfa.tsx - GÜNCELLENMİŞ VERSİYON (Hava Durumu Eklendi)
import React, { useState, useEffect } from 'react';
import { 
  Home as AnaSayfaIcon,
  Package, 
  Users, 
  FileText, 
  ClipboardList, 
  BarChart3, 
  Bell, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Coffee,
  Bed,
  Activity,
  Calendar,
  Clock,
  TrendingUp,
  Scissors,
  Utensils,
  Heart,
  User as UserIcon,
  X,
  Info,
  AlertCircle,
  Plus,
  Database,
  ChevronRight,
  Settings,
  UserPlus,
  Edit,
  Trash2,
  Stethoscope as StethoscopeIcon,
  Mail,
  Phone,
  MapPin,
  UserCheck,
  Scissors as ScalpelIcon,
  Utensils as UtensilsIcon,
  Upload,
  Download,
  FileSpreadsheet,
  Cloud,
  Thermometer,
  Wind,
  Droplets,
  CloudRain,
  Sun,
  CloudSun
} from 'lucide-react';

import { dataService } from '../utils/dataService';
import { User, DailyPlan, Meal, Surgery, Appointment, Doctor } from '../types';
import { useAuth } from '../components/AuthContext.tsx';

// Icon alias'ları oluştur
const Scalpel = ScalpelIcon;
const UtensilsCrossed = UtensilsIcon;

// Sistem durumu özet modal bileşeni
const SystemStatusModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const materials = dataService.getMaterials();
  const users = dataService.getUsers();
  const lowStockMaterials = dataService.getLowStockMaterials();
  const expiredMaterials = dataService.getExpiredMaterials();
  const activeUsers = users.filter(u => u.isActive);
  
  const stats = [
    {
      label: 'Toplam Malzeme',
      value: materials.length,
      icon: <Package className="h-5 w-5" />,
      color: 'text-blue-600'
    },
    {
      label: 'Kritik Stok',
      value: lowStockMaterials.length,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'text-red-600'
    },
    {
      label: 'Süresi Geçmiş',
      value: expiredMaterials.length,
      icon: <Clock className="h-5 w-5" />,
      color: 'text-orange-600'
    },
    {
      label: 'Aktif Kullanıcı',
      value: activeUsers.length,
      icon: <Users className="h-5 w-5" />,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-2xl">
          <div className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            <h2 className="text-lg font-bold">Sistem Durumu Özeti</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-5">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors">
                <div className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${stat.color.replace('text-', 'bg-')} bg-opacity-20 mb-2`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <Activity className="h-4 w-4 mr-2 text-blue-600" />
              Son Aktiviteler
            </h3>
            <div className="space-y-2">
              {dataService.getLogs().slice(0, 3).map((log, index) => (
                <div key={index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{log.performedBy}</p>
                    <p className="text-xs text-gray-600 truncate">{log.details}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {log.performedAt ? new Date(log.performedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

// Ekleme Modal Bileşeni (Excel/Manuel Ekleme)
const AddItemModal: React.FC<{
  type: 'meal' | 'surgery' | 'doctor';
  onClose: () => void;
  onSuccess: () => void;
}> = ({ type, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'excel' | 'manual'>('manual');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualData, setManualData] = useState<any>({
    name: '',
    time: '',
    doctor: '',
    patient: '',
    type: '',
    calories: '',
    patientCount: ''
  });

  const handleExcelUpload = async () => {
    if (!excelFile) {
      alert('Lütfen bir Excel dosyası seçin');
      return;
    }

    setLoading(true);
    // Excel yükleme simülasyonu
    setTimeout(() => {
      setLoading(false);
      alert(`${excelFile.name} başarıyla yüklendi!`);
      onSuccess();
      onClose();
    }, 1500);
  };

  const handleManualSubmit = () => {
    // Manuel veri ekleme işlemi
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(`${type === 'meal' ? 'Yemek' : type === 'surgery' ? 'Ameliyat' : 'Doktor'} başarıyla eklendi!`);
      onSuccess();
      onClose();
    }, 1000);
  };

  const downloadTemplate = () => {
    // Excel template indirme
    const link = document.createElement('a');
    link.href = '/templates/' + type + '_template.xlsx';
    link.download = type + '_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg">
        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              <h2 className="text-lg font-bold">
                {type === 'meal' ? 'Yemek Ekle' : 
                 type === 'surgery' ? 'Ameliyat Ekle' : 
                 'Doktor Ekle'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* Tab Butonları */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'manual' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('manual')}
            >
              <Edit className="h-4 w-4 inline mr-2" />
              Manuel Ekle
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'excel' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('excel')}
            >
              <FileSpreadsheet className="h-4 w-4 inline mr-2" />
              Excel ile Ekle
            </button>
          </div>

          {/* Manuel Ekleme Formu */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              {type === 'meal' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yemek Türü</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={manualData.type}
                      onChange={(e) => setManualData({...manualData, type: e.target.value})}
                    >
                      <option value="">Seçiniz</option>
                      <option value="breakfast">Kahvaltı</option>
                      <option value="lunch">Öğle Yemeği</option>
                      <option value="dinner">Akşam Yemeği</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yemek Saati</label>
                    <input 
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={manualData.time}
                      onChange={(e) => setManualData({...manualData, time: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kalori</label>
                    <input 
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={manualData.calories}
                      onChange={(e) => setManualData({...manualData, calories: e.target.value})}
                    />
                  </div>
                </>
              )}

              {type === 'surgery' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ameliyat Türü</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={manualData.type}
                      onChange={(e) => setManualData({...manualData, type: e.target.value})}
                      placeholder="Örn: Katarakt Ameliyatı"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Doktor</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={manualData.doctor}
                      onChange={(e) => setManualData({...manualData, doctor: e.target.value})}
                      placeholder="Dr. Ad Soyad"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={manualData.patient}
                      onChange={(e) => setManualData({...manualData, patient: e.target.value})}
                      placeholder="Hasta Ad Soyad"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Saati</label>
                    <input 
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={manualData.time}
                      onChange={(e) => setManualData({...manualData, time: e.target.value})}
                    />
                  </div>
                </>
              )}

              {type === 'doctor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Doktor Adı</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={manualData.name}
                      onChange={(e) => setManualData({...manualData, name: e.target.value})}
                      placeholder="Dr. Ad Soyad"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Uzmanlık</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={manualData.type}
                      onChange={(e) => setManualData({...manualData, type: e.target.value})}
                      placeholder="Örn: Katarakt Uzmanı"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                    <input 
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={manualData.phone}
                      onChange={(e) => setManualData({...manualData, phone: e.target.value})}
                      placeholder="05xx xxx xx xx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={manualData.email}
                      onChange={(e) => setManualData({...manualData, email: e.target.value})}
                      placeholder="email@ornek.com"
                    />
                  </div>
                </>
              )}

              <button
                onClick={handleManualSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2.5 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50"
              >
                {loading ? 'Ekleniyor...' : 'Ekle'}
              </button>
            </div>
          )}

          {/* Excel Ekleme */}
          {activeTab === 'excel' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-2">Excel dosyanızı sürükleyip bırakın veya tıklayarak seçin</p>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="excel-upload"
                />
                <label
                  htmlFor="excel-upload"
                  className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-200"
                >
                  Dosya Seç
                </label>
                {excelFile && (
                  <div className="mt-3 p-2 bg-green-50 rounded-lg">
                    <FileSpreadsheet className="h-4 w-4 inline mr-2 text-green-600" />
                    <span className="text-sm text-green-800">{excelFile.name}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleExcelUpload}
                  disabled={!excelFile || loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
                >
                  {loading ? 'Yükleniyor...' : 'Excel Dosyasını Yükle'}
                </button>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Şablon İndir
                </button>
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium mb-1">Excel formatı gereksinimleri:</p>
                <ul className="list-disc list-inside space-y-1">
                  {type === 'meal' && (
                    <>
                      <li>Yemek Türü (breakfast, lunch, dinner)</li>
                      <li>Yemek Saati (HH:MM)</li>
                      <li>Kalori (sayı)</li>
                      <li>Hasta Sayısı (sayı)</li>
                    </>
                  )}
                  {type === 'surgery' && (
                    <>
                      <li>Ameliyat Türü</li>
                      <li>Doktor Adı</li>
                      <li>Hasta Adı</li>
                      <li>Başlangıç Saati</li>
                      <li>Süre (dakika)</li>
                    </>
                  )}
                  {type === 'doctor' && (
                    <>
                      <li>Doktor Adı</li>
                      <li>Uzmanlık Alanı</li>
                      <li>Telefon</li>
                      <li>Email</li>
                      <li>Lisans No</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-all"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
};

// Özet bilgi modal bileşeni
const SummaryModal: React.FC<{ 
  type: 'surgery' | 'doctor' | 'meal'; 
  onClose: () => void;
  surgeries?: Surgery[];
  doctors?: Doctor[];
  meals?: Meal[];
}> = ({ type, onClose, surgeries = [], doctors = [], meals = [] }) => {
  
  const summaryContents = {
    surgery: {
      title: 'Ameliyat Özeti',
      icon: <Scalpel className="h-6 w-6" />,
      bgColor: 'bg-gradient-to-r from-red-500 to-pink-500',
      stats: [
        { label: 'Toplam Ameliyat', value: surgeries.length },
        { label: 'Tamamlandı', value: surgeries.filter(s => s.status === 'completed').length },
        { label: 'Devam Ediyor', value: surgeries.filter(s => s.status === 'in-progress').length },
        { label: 'Planlandı', value: surgeries.filter(s => s.status === 'scheduled').length }
      ]
    },
    doctor: {
      title: 'Doktor Özeti',
      icon: <StethoscopeIcon className="h-6 w-6" />,
      bgColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
      stats: [
        { label: 'Toplam Doktor', value: doctors.length },
        { label: 'Aktif Doktor', value: doctors.filter(d => d.isActive).length },
        { label: 'Katarakt Uzmanı', value: doctors.filter(d => d.specialty?.toLowerCase().includes('katarakt')).length },
        { label: 'Retina Uzmanı', value: doctors.filter(d => d.specialty?.toLowerCase().includes('retina')).length }
      ]
    },
    meal: {
      title: 'Yemek Özeti',
      icon: <UtensilsCrossed className="h-6 w-6" />,
      bgColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      stats: [
        { label: 'Toplam Yemek', value: meals.length },
        { label: 'Toplam Hasta', value: meals.reduce((sum, meal) => sum + meal.patientCount, 0) },
        { label: 'Toplam Kalori', value: meals.reduce((sum, meal) => sum + meal.calories, 0) },
        { label: 'Ortalama Kalori', value: Math.round(meals.reduce((sum, meal) => sum + meal.calories, 0) / meals.length) }
      ]
    }
  };

  const content = summaryContents[type];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md">
        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg mr-3 ${content.bgColor} text-white`}>
                {content.icon}
              </div>
              <h2 className="text-lg font-bold">{content.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-5">
          <div className="space-y-3">
            {content.stats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-gray-700 font-medium">{stat.label}:</span>
                <span className="text-lg font-bold text-gray-900">{stat.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Liste görünüm modal bileşeni
const ListViewModal: React.FC<{
  type: 'surgery' | 'doctor' | 'meal';
  onClose: () => void;
  data: any[];
  title: string;
  icon: React.ReactNode;
}> = ({ type, onClose, data, title, icon }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 rounded-lg mr-3 bg-white bg-opacity-20">
                {icon}
              </div>
              <h2 className="text-lg font-bold">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-5 overflow-y-auto max-h-[70vh]">
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                {type === 'surgery' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Scalpel className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{(item as Surgery).surgeryType}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        (item as Surgery).status === 'completed' ? 'bg-green-100 text-green-800' :
                        (item as Surgery).status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {(item as Surgery).status === 'scheduled' ? 'Planlandı' :
                         (item as Surgery).status === 'in-progress' ? 'Devam Ediyor' : 'Tamamlandı'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-600">Hasta: {(item as Surgery).patientName}</div>
                      <div className="text-gray-600">Doktor: Dr. {(item as Surgery).doctorName}</div>
                      <div className="text-gray-600">Saat: {(item as Surgery).startTime}</div>
                      <div className="text-gray-600">Süre: {(item as Surgery).duration} dk</div>
                    </div>
                  </div>
                )}
                
                {type === 'doctor' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <StethoscopeIcon className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{(item as Doctor).name}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        (item as Doctor).isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {(item as Doctor).isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-600">Uzmanlık: {(item as Doctor).specialty}</div>
                      <div className="text-gray-600">Ofis: {(item as Doctor).office || 'Belirtilmemiş'}</div>
                      <div className="text-gray-600">Email: {(item as Doctor).email || 'Belirtilmemiş'}</div>
                      <div className="text-gray-600">Tel: {(item as Doctor).phone || 'Belirtilmemiş'}</div>
                    </div>
                  </div>
                )}
                
                {type === 'meal' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <UtensilsCrossed className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900 capitalize">
                          {(item as Meal).type === 'breakfast' ? 'Kahvaltı' : 
                           (item as Meal).type === 'lunch' ? 'Öğle Yemeği' : 'Akşam Yemeği'}
                        </span>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {(item as Meal).calories} kcal
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-600">Saat: {(item as Meal).mealTime}</div>
                      <div className="text-gray-600">Hasta: {(item as Meal).patientCount} kişi</div>
                      <div className="text-gray-600 col-span-2">Menü: {(item as Meal).items.join(', ')}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

// DOKTOR KARTI COMPONENTI
const DoctorCard: React.FC<{ doctor: Doctor }> = ({ doctor }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {doctor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{doctor.name} {doctor.surname}</h4>
            <p className="text-sm text-gray-600">{doctor.specialty}</p>
            {doctor.title && (
              <p className="text-xs text-blue-600 mt-1">{doctor.title}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {doctor.email && (
                <span className="inline-flex items-center text-xs text-gray-500">
                  <Mail className="h-3 w-3 mr-1" />
                  {doctor.email}
                </span>
              )}
              {doctor.phone && (
                <span className="inline-flex items-center text-xs text-gray-500">
                  <Phone className="h-3 w-3 mr-1" />
                  {doctor.phone}
                </span>
              )}
              {doctor.department && (
                <span className="inline-flex items-center text-xs text-gray-500">
                  <MapPin className="h-3 w-3 mr-1" />
                  {doctor.department}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-xs px-2 py-1 rounded-full mb-2 ${
            doctor.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {doctor.isActive ? 'Aktif' : 'Pasif'}
          </span>
          <span className="text-xs text-gray-500">
            Lisans: {doctor.licenseNumber}
          </span>
        </div>
      </div>
      
      {doctor.schedule && doctor.schedule.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-700 mb-1">Çalışma Saatleri:</p>
          <div className="flex flex-wrap gap-1">
            {doctor.schedule.slice(0, 3).map((schedule, idx) => (
              <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                {schedule.day === 'monday' ? 'Pzt' :
                 schedule.day === 'tuesday' ? 'Sal' :
                 schedule.day === 'wednesday' ? 'Çar' :
                 schedule.day === 'thursday' ? 'Per' :
                 schedule.day === 'friday' ? 'Cum' :
                 schedule.day === 'saturday' ? 'Cmt' : 'Paz'}
                : {schedule.startTime}-{schedule.endTime}
              </span>
            ))}
            {doctor.schedule.length > 3 && (
              <span className="text-xs text-gray-500">+{doctor.schedule.length - 3} gün</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ANA SAYFA BİLEŞENİ
const Anasayfa: React.FC = () => {
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | undefined>(undefined);
  const [showSystemStatus, setShowSystemStatus] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState<string | null>(null);
  const [showListViewModal, setShowListViewModal] = useState<{
    type: 'surgery' | 'doctor' | 'meal';
    data: any[];
  } | null>(null);
  const [showAddModal, setShowAddModal] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const todayPlan = dataService.getTodayPlan();
    setDailyPlan(todayPlan);
    
    const loadedDoctors = dataService.getDoctors();
    setDoctors(loadedDoctors);
    
    // Bursa hava durumu verilerini çek
    fetchBursaWeather();
    
    // Her 15 dakikada bir hava durumunu güncelle
    const interval = setInterval(fetchBursaWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchBursaWeather = async () => {
    try {
      setWeatherLoading(true);
      // Burada gerçek bir hava durumu API'si kullanılabilir
      // Örnek olarak mock veri kullanıyoruz
      const mockWeatherData = {
        location: 'Bursa, Türkiye',
        temperature: Math.floor(Math.random() * 10) + 10, // 10-20°C arası
        feelsLike: Math.floor(Math.random() * 8) + 12, // 12-20°C arası
        humidity: Math.floor(Math.random() * 40) + 40, // %40-80
        windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
        condition: ['Güneşli', 'Parçalı Bulutlu', 'Bulutlu', 'Az Bulutlu'][Math.floor(Math.random() * 4)],
        icon: 'cloud-sun',
        precipitation: Math.floor(Math.random() * 30), // 0-30 mm
        pressure: 1015 + Math.floor(Math.random() * 10), // 1015-1025 hPa
        sunrise: '07:30',
        sunset: '18:45',
        lastUpdated: new Date().toLocaleTimeString('tr-TR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
      
      // Gerçek API kullanımı için:
      // const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=Bursa,TR&appid=YOUR_API_KEY&units=metric&lang=tr');
      // const data = await response.json();
      
      setTimeout(() => {
        setWeatherData(mockWeatherData);
        setWeatherLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Hava durumu verisi alınamadı:', error);
      setWeatherLoading(false);
    }
  };

  const getWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case 'sun':
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'cloud-sun':
        return <CloudSun className="h-8 w-8 text-orange-500" />;
      case 'cloud':
        return <Cloud className="h-8 w-8 text-gray-500" />;
      case 'cloud-rain':
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      default:
        return <CloudSun className="h-8 w-8 text-orange-500" />;
    }
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const defaultMeals: Meal[] = [
    {
      id: '1',
      type: 'breakfast',
      name: 'Kahvaltı',
      items: ['Peynir, Zeytin, Domates, Salatalık', 'Bal/Tahin-Pekmez', 'Süt', 'Haşlanmış Yumurta'],
      calories: 450,
      dietType: 'normal',
      mealTime: '08:00',
      patientCount: 120
    },
    {
      id: '2',
      type: 'lunch',
      name: 'Öğle Yemeği',
      items: ['Mercimek Çorbası', 'Izgara Tavuk', 'Bulgur Pilavı', 'Yoğurt', 'Mevsim Salata'],
      calories: 650,
      dietType: 'normal',
      mealTime: '12:30',
      patientCount: 150
    },
    {
      id: '3',
      type: 'dinner',
      name: 'Akşam Yemeği',
      items: ['Sebze Çorbası', 'Fırın Balık', 'Zeytinyağlı Taze Fasulye', 'Cacık', 'Meyve'],
      calories: 550,
      dietType: 'normal',
      mealTime: '18:00',
      patientCount: 100
    }
  ];

  const defaultSurgeries: Surgery[] = [
    {
      id: '1',
      doctorId: 'doc-1',
      doctorName: 'Ahmet Yılmaz',
      doctorSpecialty: 'Katarakt',
      patientId: 'pat-1',
      patientName: 'Mehmet Demir',
      surgeryType: 'Katarakt Ameliyatı',
      duration: 45,
      startTime: '09:00',
      endTime: '09:45',
      room: 'A-1',
      roomType: 'operating',
      status: 'completed',
      priority: 'normal',
      requiredMaterials: []
    },
    {
      id: '2',
      doctorId: 'doc-2',
      doctorName: 'Ayşe Kaya',
      doctorSpecialty: 'Glokom',
      patientId: 'pat-2',
      patientName: 'Fatma Çelik',
      surgeryType: 'Glokom Cerrahisi',
      duration: 90,
      startTime: '10:30',
      endTime: '12:00',
      room: 'A-2',
      roomType: 'operating',
      status: 'in-progress',
      priority: 'normal',
      requiredMaterials: []
    },
    {
      id: '3',
      doctorId: 'doc-3',
      doctorName: 'Mehmet Demir',
      doctorSpecialty: 'Retina',
      patientId: 'pat-3',
      patientName: 'Ali Yılmaz',
      surgeryType: 'Retina Cerrahisi',
      duration: 120,
      startTime: '14:00',
      endTime: '16:00',
      room: 'A-3',
      roomType: 'operating',
      status: 'scheduled',
      priority: 'normal',
      requiredMaterials: []
    }
  ];

  const meals = dailyPlan?.meals || defaultMeals;
  const surgeries = dailyPlan?.surgeries || defaultSurgeries;

  // Yetki kontrolleri
  const isSystemAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const canAddMealOrSurgery = isSystemAdmin || isManager;
  const canAddDoctor = isSystemAdmin;

  const refreshData = () => {
    const todayPlan = dataService.getTodayPlan();
    setDailyPlan(todayPlan);
    const loadedDoctors = dataService.getDoctors();
    setDoctors(loadedDoctors);
  };

  return (
    <div className="space-y-6">
      {/* Başlık ve Hoşgeldiniz */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Anasayfa</h1>
            <p className="text-blue-200">Osmangazi Göz Stok Takip Sistemine Hoşgeldiniz</p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{formattedDate}</span>
              </div>
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4" />
                <span className="text-sm">{user?.name} - {user?.role === 'admin' ? 'Sistem Yöneticisi' : 
                  user?.role === 'manager' ? 'Yönetici' : 
                  user?.role === 'doctor' ? 'Doktor' : user?.role}</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <AnaSayfaIcon className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Hızlı Durum Kartları - YEMEK HİZMETİ KARTI KALDIRILDI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white shadow-md hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-0.5"
          onClick={() => setShowSummaryModal('surgery')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Toplam Ameliyat</h3>
            <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
              <Scalpel className="h-6 w-6" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-2">{surgeries.length}</p>
          <p className="text-sm opacity-90">Bugün planlanan ameliyat sayısı</p>
          <div className="mt-4 flex items-center text-sm opacity-80">
            <Info className="h-4 w-4 mr-2" />
            Tıklayın: Özet bilgi
          </div>
        </div>

        <div 
          className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl p-5 text-white shadow-md hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-0.5"
          onClick={() => setShowSummaryModal('doctor')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Toplam Doktor</h3>
            <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
              <StethoscopeIcon className="h-6 w-6" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-2">{doctors.length}</p>
          <p className="text-sm opacity-90">Sistemdeki doktor sayısı</p>
          <div className="mt-4 flex items-center text-sm opacity-80">
            <Info className="h-4 w-4 mr-2" />
            Tıklayın: Özet bilgi
          </div>
        </div>

        {/* BURSA HAVA DURUMU KARTI */}
        <div className="bg-gradient-to-br from-sky-600 to-blue-800 rounded-xl p-5 text-white shadow-md hover:shadow-lg transition-all group hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Bursa Hava Durumu</h3>
            <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
              <Cloud className="h-6 w-6" />
            </div>
          </div>
          
          {weatherLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : weatherData ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-4xl font-bold">{weatherData.temperature}°C</div>
                  <div className="text-sm opacity-90">{weatherData.condition}</div>
                </div>
                <div className="text-right">
                  {getWeatherIcon(weatherData.icon)}
                  <div className="text-xs opacity-80 mt-1">{weatherData.location}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-4 w-4 opacity-80" />
                  <span>Hissedilen: {weatherData.feelsLike}°C</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Droplets className="h-4 w-4 opacity-80" />
                  <span>Nem: {weatherData.humidity}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wind className="h-4 w-4 opacity-80" />
                  <span>Rüzgar: {weatherData.windSpeed} km/h</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CloudRain className="h-4 w-4 opacity-80" />
                  <span>Yağış: {weatherData.precipitation} mm</span>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-white/20 text-xs">
                <div className="flex justify-between">
                  <span>Gün Doğumu: {weatherData.sunrise}</span>
                  <span>Gün Batımı: {weatherData.sunset}</span>
                </div>
                <div className="text-center opacity-80 mt-1">
                  Son Güncelleme: {weatherData.lastUpdated}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="opacity-90">Hava durumu bilgisi alınamadı</p>
              <button 
                onClick={fetchBursaWeather}
                className="mt-2 text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ana İçerik Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sol Taraf: Yemek Listesi ve Ameliyat */}
        <div className="space-y-6">
          {/* Yemek Listesi - Sistem Yöneticisi ve Yönetici ekleyebilir */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                  <UtensilsCrossed className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Günlük Yemek Listesi</h3>
                  <p className="text-sm text-gray-600">
                    {canAddMealOrSurgery ? 'Yöneticiler tarafından girilen menü' : 'Günlük yemek menüsü'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowListViewModal({
                    type: 'meal',
                    data: meals
                  })}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Detaylı Liste
                </button>
                {canAddMealOrSurgery && (
                  <button
                    onClick={() => setShowAddModal('meal')}
                    className="text-sm font-medium text-green-600 hover:text-green-800 flex items-center transition-colors"
                    title="Yemek ekle (Excel veya Manuel)"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ekle
                  </button>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              {meals.map((meal) => (
                <div key={meal.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        meal.type === 'breakfast' ? 'bg-yellow-100 text-yellow-800' :
                        meal.type === 'lunch' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        <UtensilsCrossed className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">
                          {meal.type === 'breakfast' ? 'Kahvaltı' : 
                           meal.type === 'lunch' ? 'Öğle Yemeği' : 'Akşam Yemeği'}
                        </h4>
                        <p className="text-xs text-gray-600">{meal.mealTime} • {meal.patientCount} hasta</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{meal.calories} kcal</div>
                      {canAddMealOrSurgery && (
                        <div className="flex space-x-1 mt-1">
                          <button className="text-xs text-blue-600 hover:text-blue-800">Düzenle</button>
                          {isSystemAdmin && (
                            <button className="text-xs text-red-600 hover:text-red-800">Sil</button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ameliyat Planlaması - Sistem Yöneticisi ve Yönetici ekleyebilir */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg">
                  <Scalpel className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Ameliyat Planlaması</h3>
                  <p className="text-sm text-gray-600">Bugün planlanan ameliyatlar</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowListViewModal({
                    type: 'surgery',
                    data: surgeries
                  })}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Liste Görüntüle
                </button>
                {canAddMealOrSurgery && (
                  <button
                    onClick={() => setShowAddModal('surgery')}
                    className="text-sm font-medium text-green-600 hover:text-green-800 flex items-center transition-colors"
                    title="Ameliyat ekle (Excel veya Manuel)"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ekle
                  </button>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              {surgeries.map((surgery) => (
                <div key={surgery.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <StethoscopeIcon className="h-4 w-4 text-gray-400" />
                      <div>
                        <h4 className="font-medium text-gray-900 truncate">{surgery.surgeryType}</h4>
                        <p className="text-xs text-gray-600">Dr. {surgery.doctorName} • {surgery.patientName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{surgery.startTime}</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        surgery.status === 'completed' ? 'bg-green-100 text-green-800' :
                        surgery.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {surgery.status === 'scheduled' ? 'Planlandı' :
                         surgery.status === 'in-progress' ? 'Devam Ediyor' : 'Tamamlandı'}
                      </span>
                      {canAddMealOrSurgery && (
                        <div className="flex space-x-1 mt-1">
                          <button className="text-xs text-blue-600 hover:text-blue-800">Düzenle</button>
                          {isSystemAdmin && (
                            <button className="text-xs text-red-600 hover:text-red-800">Sil</button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sağ Taraf: Doktorlar ve Sistem Durumu */}
        <div className="space-y-6">
          {/* Doktorlar - Tüm kullanıcılar görüntüleyebilir, sadece Sistem Yöneticisi ekleyebilir */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                  <StethoscopeIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Doktorlar</h3>
                  <p className="text-sm text-gray-600">Sistemdeki tüm doktorlar</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowListViewModal({
                    type: 'doctor',
                    data: doctors
                  })}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Liste Görüntüle
                </button>
                {canAddDoctor && (
                  <button
                    onClick={() => setShowAddModal('doctor')}
                    className="text-sm font-medium text-green-600 hover:text-green-800 flex items-center transition-colors"
                    title="Doktor ekle (Excel veya Manuel)"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ekle
                  </button>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              {doctors.slice(0, 4).map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </div>
          
          {/* Sistem Durumu */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Sistem Durumu</h3>
                  <p className="text-sm text-gray-600">Sistemin genel durumu</p>
                </div>
              </div>
              <button
                onClick={() => window.open('/logs', '_blank')}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center transition-colors"
              >
                <Clock className="h-4 w-4 mr-2" />
                Detaylı Log
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Aktif Oturumlar</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Bugünkü İşlemler</p>
                    <p className="text-2xl font-bold text-gray-900">147</p>
                  </div>
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Veri Boyutu</p>
                    <p className="text-2xl font-bold text-gray-900">4.2 GB</p>
                  </div>
                  <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Database className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Hata Sayısı</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                  </div>
                  <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Son Güncelleme:</span>
                <span className="font-medium text-gray-900">{new Date().toLocaleTimeString('tr-TR')}</span>
              </div>
            </div>
          </div>

          {/* Sistem Durumu ve Uyarılar */}
          <div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 cursor-pointer hover:bg-gray-50 transition-colors group"
            onClick={() => setShowSystemStatus(true)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Sistem Durumu ve Uyarılar</h3>
                  <p className="text-sm text-gray-600">Tıklayın: Kısa özet bilgiler</p>
                </div>
              </div>
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                <Bell className="h-5 w-5" />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{dataService.getMaterials().length}</div>
                <div className="text-xs text-gray-600">Malzeme</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{dataService.getLowStockMaterials().length}</div>
                <div className="text-xs text-gray-600">Kritik</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{dataService.getUsers().filter(u => u.isActive).length}</div>
                <div className="text-xs text-gray-600">Aktif</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sistem durumu hakkında detaylı bilgi için tıklayın</span>
                <ChevronRight className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modaller */}
      {showSystemStatus && <SystemStatusModal onClose={() => setShowSystemStatus(false)} />}
      {showSummaryModal && (
        <SummaryModal 
          type={showSummaryModal as 'surgery' | 'doctor' | 'meal'}
          onClose={() => setShowSummaryModal(null)}
          surgeries={surgeries}
          doctors={doctors}
          meals={meals}
        />
      )}
      {showListViewModal && (
        <ListViewModal
          type={showListViewModal.type}
          onClose={() => setShowListViewModal(null)}
          data={showListViewModal.data}
          title={
            showListViewModal.type === 'surgery' ? 'Ameliyat Takvimi' :
            showListViewModal.type === 'doctor' ? 'Tüm Doktorlar' :
            'Yemek Listesi Detayları'
          }
          icon={
            showListViewModal.type === 'surgery' ? <Calendar className="h-5 w-5" /> :
            showListViewModal.type === 'doctor' ? <StethoscopeIcon className="h-5 w-5" /> :
            <UtensilsCrossed className="h-5 w-5" />
          }
        />
      )}
      {showAddModal && (
        <AddItemModal
          type={showAddModal as 'meal' | 'surgery' | 'doctor'}
          onClose={() => setShowAddModal(null)}
          onSuccess={refreshData}
        />
      )}
    </div>
  );
};

export default Anasayfa;