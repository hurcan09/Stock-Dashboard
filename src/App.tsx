// src/App.tsx - TAM DÜZELTİLMİŞ VERSİYON
import React, { useState, useEffect } from 'react';
import MaterialManagement from './components/MaterialManagement';
import StockCountManagement from './components/StockCountManagement';
import PatientManagement from './components/PatientManagement';
import InvoiceManagement from './components/InvoiceManagement';
import Reports from './components/Reports';
import Auth from './components/Auth';
import Layout from './components/Layout';
import { dataService } from './utils/dataService';
import { User, DailyPlan, Meal, Surgery, Appointment } from './types';

// Lucide icon import'ları - güncel versiyona uygun
import { 
  Package, 
  ClipboardList, 
  Users, 
  FileText, 
  BarChart3,
  Home,
  AlertCircle,
  CheckCircle,
  Download,
  Upload,
  Filter,
  RefreshCw,
  Bell,
  Eye,
  Coffee,
  Bed,
  Thermometer,
  Activity,
  Calendar,
  Clock,
  FileUp,
  TrendingUp,
  Scissors, // Scalpel yerine
  Utensils, // UtensilsCrossed yerine
  Heart, // Stethoscope yerine
  User as UserIcon
} from 'lucide-react';

// Icon alias'ları oluştur
const Scalpel = Scissors;
const Stethoscope = Heart;
const UtensilsCrossed = Utensils;

// Auth component'ı için props interface'ini tanımlayın
interface AuthProps {
  onLogin: (userData: User) => void;
}

// Excel import bileşeni
const ExcelImportSection: React.FC = () => {
  const [importing, setImporting] = useState(false);
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setImporting(true);
    
    setTimeout(() => {
      console.log('Excel dosyası yüklendi:', file.name);
      setImporting(false);
      
      dataService.logAction({
        action: 'EXCEL_IMPORT',
        module: 'DASHBOARD',
        recordId: 'excel-upload',
        details: `Excel dosyası yüklendi: ${file.name}`,
        performedBy: 'System'
      });
    }, 1500);
  };
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileUp className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Excel Veri Yükleme</h3>
            <p className="text-sm text-gray-500">Günlük planlamayı Excel'den yükleyin</p>
          </div>
        </div>
        <Download className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-sm">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Yemek listesi formatı: .xlsx veya .csv</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Ameliyat listesi formatı: .xlsx</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Randevu listesi formatı: .xlsx veya .csv</span>
        </div>
      </div>
      
      <div className="mt-4">
        <label className="block">
          <div className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all cursor-pointer">
            {importing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Yükleniyor...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Excel Dosyası Yükle</span>
              </>
            )}
            <input 
              type="file" 
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={importing}
            />
          </div>
        </label>
        <p className="text-xs text-gray-500 text-center mt-2">
          Maksimum dosya boyutu: 10MB
        </p>
      </div>
    </div>
  );
};

// Yemek listesi bileşeni
const MealSchedule: React.FC<{ meals: Meal[] }> = ({ meals }) => {
  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return <Coffee className="h-5 w-5" />;
      case 'lunch': return <UtensilsCrossed className="h-5 w-5" />;
      case 'dinner': return <Bed className="h-5 w-5" />;
      default: return <UtensilsCrossed className="h-5 w-5" />;
    }
  };

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast': return 'bg-yellow-100 text-yellow-800';
      case 'lunch': return 'bg-orange-100 text-orange-800';
      case 'dinner': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Günlük Yemek Listesi</h3>
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <Filter className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {meals.map((meal) => (
          <div key={meal.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${getMealTypeColor(meal.type)}`}>
                  {getMealTypeIcon(meal.type)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 capitalize">
                    {meal.type === 'breakfast' ? 'Kahvaltı' : 
                     meal.type === 'lunch' ? 'Öğle Yemeği' : 'Akşam Yemeği'}
                  </h4>
                  {meal.dietType && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {meal.dietType}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700">{meal.calories} kcal</div>
                <div className="text-xs text-gray-500">Kalori</div>
              </div>
            </div>
            
            <div className="pl-12">
              <ul className="space-y-2">
                {meal.items.map((item, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-700">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mr-3"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Toplam {meals.length} öğün planlandı
          </div>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            Detaylı Liste
          </button>
        </div>
      </div>
    </div>
  );
};

// Ameliyat planlama bileşeni
const SurgerySchedule: React.FC<{ surgeries: Surgery[] }> = ({ surgeries }) => {
  const totalSurgeries = surgeries.length;
  const completedSurgeries = surgeries.filter(s => s.status === 'completed').length;
  const inProgressSurgeries = surgeries.filter(s => s.status === 'in-progress').length;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg">
            <Scalpel className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Ameliyat Planlaması</h3>
            <p className="text-sm text-gray-500">Bugün {totalSurgeries} ameliyat planlandı</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800">{completedSurgeries}</div>
            <div className="text-xs text-gray-500">Tamamlandı</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800">{inProgressSurgeries}</div>
            <div className="text-xs text-gray-500">Devam Ediyor</div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {surgeries.map((surgery) => (
          <div key={surgery.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Stethoscope className="h-5 w-5 text-gray-400" />
                    <h4 className="font-semibold text-gray-800">{surgery.surgeryType}</h4>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(surgery.status)} font-medium`}>
                    {surgery.status === 'scheduled' ? 'Planlandı' :
                     surgery.status === 'in-progress' ? 'Devam Ediyor' :
                     surgery.status === 'completed' ? 'Tamamlandı' : 'İptal Edildi'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{surgery.patientName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{surgery.startTime} ({surgery.duration} dk)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-xs text-purple-600">D</span>
                    </div>
                    <span className="text-gray-600">Dr. {surgery.doctorName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-gray-600">Ameliyathane {surgery.room}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {surgeries.filter(s => s.status === 'scheduled').length} ameliyat planlandı
          </div>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Ameliyat Takvimi
          </button>
        </div>
      </div>
    </div>
  );
};

// Hasta randevuları bileşeni
const AppointmentSchedule: React.FC<{ appointments: Appointment[] }> = ({ appointments }) => {
  const totalAppointments = appointments.length;
  const emergencyAppointments = appointments.filter(a => a.type === 'emergency').length;
  const waitingPatients = appointments.filter(a => a.status === 'waiting').length;
  
  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertCircle className="h-5 w-5" />;
      case 'checkup': return <Eye className="h-5 w-5" />;
      case 'followup': return <Thermometer className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'checkup': return 'bg-blue-100 text-blue-800';
      case 'followup': return 'bg-green-100 text-green-800';
      case 'routine': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Hasta Randevuları</h3>
            <p className="text-sm text-gray-500">Bugün {totalAppointments} randevu planlandı</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-red-600">{emergencyAppointments}</div>
            <div className="text-xs text-gray-500">Acil</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600">{waitingPatients}</div>
            <div className="text-xs text-gray-500">Bekleyen</div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded-full ${getAppointmentTypeColor(appointment.type)}`}>
                      {getAppointmentTypeIcon(appointment.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{appointment.patientName}</h4>
                      <p className="text-sm text-gray-500">Dr. {appointment.doctorName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-800">{appointment.appointmentTime}</div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      appointment.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                      appointment.status === 'in-progress' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {appointment.status === 'scheduled' ? 'Planlandı' :
                       appointment.status === 'waiting' ? 'Bekliyor' :
                       appointment.status === 'in-progress' ? 'Devam Ediyor' : 'Tamamlandı'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {appointment.type === 'emergency' ? 'Acil' :
                       appointment.type === 'checkup' ? 'Kontrol' :
                       appointment.type === 'followup' ? 'Takip' : 'Rutin'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {appointments.filter(a => a.status === 'waiting').length} hasta bekliyor
          </div>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
            <Users className="h-4 w-4 mr-1" />
            Tüm Randevular
          </button>
        </div>
      </div>
    </div>
  );
};

// Dashboard ana bileşeni
const DailyDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | undefined>(undefined);

  useEffect(() => {
    const todayPlan = dataService.getTodayPlan();
    setDailyPlan(todayPlan);
  }, []);

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
    }
  ];

  const defaultAppointments: Appointment[] = [
    {
      id: '1',
      patientId: 'pat-1',
      patientName: 'Emine Koç',
      doctorId: 'doc-1',
      doctorName: 'Ahmet Yılmaz',
      doctorSpecialty: 'Katarakt',
      appointmentTime: '08:30',
      duration: 30,
      type: 'checkup',
      status: 'completed'
    },
    {
      id: '2',
      patientId: 'pat-2',
      patientName: 'Hasan Yılmaz',
      doctorId: 'doc-2',
      doctorName: 'Ayşe Kaya',
      doctorSpecialty: 'Glokom',
      appointmentTime: '09:15',
      duration: 30,
      type: 'followup',
      status: 'completed'
    }
  ];

  const meals = dailyPlan?.meals || defaultMeals;
  const surgeries = dailyPlan?.surgeries || defaultSurgeries;
  const appointments = dailyPlan?.appointments || defaultAppointments;

  return (
    <div className="space-y-6">
      {/* Hoşgeldin mesajı */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Hoşgeldin, {user?.name}!</h2>
            <p className="opacity-90">
              Osmangazi Göz sistemine giriş yaptınız.
              {user?.role === 'admin' && ' Yönetici panelinden sistemi yönetebilirsiniz.'}
              {user?.role === 'manager' && ' Günlük planlamayı yönetebilirsiniz.'}
              {user?.role === 'staff' && ' Hasta ve malzeme işlemlerini gerçekleştirebilirsiniz.'}
              {user?.role === 'viewer' && ' Sistemi görüntüleyebilirsiniz.'}
            </p>
            <div className="mt-4 flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-orange-300" />
                <span className="text-lg font-semibold">{formattedDate}</span>
              </div>
              <div className="h-6 w-px bg-white/30"></div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-xl font-bold">{surgeries.length}</div>
                  <div className="text-sm opacity-80">Ameliyat</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{appointments.length}</div>
                  <div className="text-sm opacity-80">Randevu</div>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <Activity className="h-12 w-12 text-white/80" />
            </div>
          </div>
        </div>
      </div>

      {/* Excel Import Bölümü */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Hızlı Durum Kartları */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Toplam Ameliyat</h3>
                <Scalpel className="h-5 w-5" />
              </div>
              <p className="text-3xl font-bold">{surgeries.length}</p>
              <p className="text-sm opacity-80 mt-2">Bugün planlanan ameliyat</p>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Toplam Randevu</h3>
                <Calendar className="h-5 w-5" />
              </div>
              <p className="text-3xl font-bold">{appointments.length}</p>
              <p className="text-sm opacity-80 mt-2">Bugün planlanan randevu</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Acil Durum</h3>
                <AlertCircle className="h-5 w-5" />
              </div>
              <p className="text-3xl font-bold">
                {appointments.filter(a => a.type === 'emergency').length}
              </p>
              <p className="text-sm opacity-80 mt-2">Acil vakalar</p>
            </div>
          </div>
        </div>
        
        <div>
          <ExcelImportSection />
        </div>
      </div>

      {/* Ana İçerik Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Yemek Listesi */}
        <div className="lg:col-span-1">
          <MealSchedule meals={meals} />
        </div>
        
        {/* Ameliyat ve Randevular */}
        <div className="lg:col-span-2 space-y-6">
          <SurgerySchedule surgeries={surgeries} />
          <AppointmentSchedule appointments={appointments} />
        </div>
      </div>

      {/* Sistem Durumu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Sistem Durumu ve Uyarılar</h3>
          <Bell className="h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-sm text-blue-700">Stok Durumu</div>
                <div className="text-lg font-bold text-blue-900">
                  {dataService.getMaterials().length} malzeme
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-sm text-yellow-700">Kritik Uyarılar</div>
                <div className="text-lg font-bold text-yellow-900">
                  {dataService.getLowStockMaterials().length} kritik malzeme
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-sm text-green-700">Aktif Personel</div>
                <div className="text-lg font-bold text-green-900">
                  {dataService.getUsers().filter(u => u.isActive).length} aktif
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // App.tsx'te useEffect'i tamamen değiştirin:
  useEffect(() => {
    console.log('🔄 App component yüklendi');
  
    // 2 saniye bekle ve otomatik admin girişi yap
    const timer = setTimeout(() => {
      const adminUser = dataService.getUsers().find(u => u.role === 'admin');
      
      if (adminUser) {
        console.log('✅ Admin kullanıcı bulundu, otomatik giriş yapılıyor:', adminUser.name);
        dataService.setCurrentUser(adminUser);
        setUser(adminUser);
      } else {
        console.log('❌ Admin kullanıcı bulunamadı, auth ekranı gösteriliyor');
        setUser(null);
      }
      setLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Auth component'ından gelen login işlemi
  const handleLogin = (userData: User) => {
    setUser(userData);
    dataService.setCurrentUser(userData);
    
    dataService.logAction({
      action: 'LOGIN',
      module: 'AUTH',
      recordId: userData.id,
      details: `${userData.name} sisteme giriş yaptı`,
      performedBy: userData.name
    });
  };

  // Logout işlemi
  const handleLogout = () => {
    if (user) {
      dataService.logAction({
        action: 'LOGOUT',
        module: 'AUTH',
        recordId: user.id,
        details: `${user.name} sistemden çıkış yaptı`,
        performedBy: user.name
      });
    }
    
    dataService.logout();
    setUser(null);
    setCurrentPage('dashboard');
  };

  // Sayfa render fonksiyonu
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DailyDashboard user={user!} />;
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

  // Loading ekranı
  // App.tsx dosyasının en altında loading ekranını güncelleyin:
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-900 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mb-4"></div>
        <div className="text-lg font-medium text-white">
          Osmangazi Göz Stok Takip Sistemi
         </div>
         <div className="text-sm text-blue-300 mt-2">
          Yükleniyor...
        </div>
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa Auth component'ını göster
  if (!user) {
    const AuthComponent = Auth as React.FC<AuthProps>;
    return <AuthComponent onLogin={handleLogin} />;
  }

  // Kullanıcı giriş yapmışsa Layout ile ana uygulamayı göster
  return (
    <Layout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      user={user}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;