// src/components/Doctor.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Doctor, DoctorSchedule } from '../types';
import { dataService } from '../utils/dataService';
import { Eye, Pencil, Trash2, UserPlus, Search, Filter, Upload, Download, Calendar, Phone, Mail, Stethoscope, Clock } from 'lucide-react';

interface DoctorFormData {
  name: string;
  surname: string;
  specialty: string;
  licenseNumber: string;
  phone: string;
  email: string;
  department: string;
  title: string;
  weeklyHours: number;
  maxPatientsPerDay: number;
  isActive: boolean;
  schedule: DoctorSchedule[];
}

const DoctorManagement: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDaySchedule, setSelectedDaySchedule] = useState<DoctorSchedule | null>(null);
  const [doctorStats, setDoctorStats] = useState({
    total: 0,
    active: 0,
    surgeons: 0,
    ophthalmologists: 0
  });

  // Form state
  const [formData, setFormData] = useState<DoctorFormData>({
    name: '',
    surname: '',
    specialty: '',
    licenseNumber: '',
    phone: '',
    email: '',
    department: 'Göz Hastalıkları',
    title: 'Dr.',
    weeklyHours: 40,
    maxPatientsPerDay: 20,
    isActive: true,
    schedule: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Doktorları yükle
  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, filterSpecialty, filterDepartment]);

  const loadDoctors = () => {
    setLoading(true);
    try {
      const doctorsData = dataService.getDoctors();
      setDoctors(doctorsData);
      
      // İstatistikleri güncelle
      const stats = {
        total: doctorsData.length,
        active: doctorsData.filter(d => d.isActive).length,
        surgeons: doctorsData.filter(d => d.specialty.toLowerCase().includes('cerrah')).length,
        ophthalmologists: doctorsData.filter(d => d.department === 'Göz Hastalıkları').length
      };
      setDoctorStats(stats);
    } catch (error) {
      console.error('Doktorlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    // Arama filtresi
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(term) ||
        doctor.surname.toLowerCase().includes(term) ||
        doctor.licenseNumber.toLowerCase().includes(term) ||
        doctor.specialty.toLowerCase().includes(term) ||
        doctor.email.toLowerCase().includes(term)
      );
    }

    // Uzmanlık filtresi
    if (filterSpecialty !== 'all') {
      filtered = filtered.filter(doctor => doctor.specialty === filterSpecialty);
    }

    // Departman filtresi
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(doctor => doctor.department === filterDepartment);
    }

    setFilteredDoctors(filtered);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && selectedDoctor) {
        // Güncelleme
        const updated = dataService.updateDoctor(selectedDoctor.id, {
          ...formData,
          schedule: formData.schedule
        });
        if (updated) {
          alert('Doktor başarıyla güncellendi!');
        }
      } else {
        // Yeni ekleme
        const newDoctor = dataService.saveDoctor({
          ...formData,
          schedule: formData.schedule
        });
        if (newDoctor) {
          alert('Doktor başarıyla eklendi!');
        }
      }

      resetForm();
      loadDoctors();
      setShowForm(false);
    } catch (error: any) {
      alert(`Hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsEditing(true);
    setFormData({
      name: doctor.name,
      surname: doctor.surname,
      specialty: doctor.specialty,
      licenseNumber: doctor.licenseNumber,
      phone: doctor.phone,
      email: doctor.email,
      department: doctor.department,
      title: doctor.title || 'Dr.',
      weeklyHours: doctor.weeklyHours,
      maxPatientsPerDay: doctor.maxPatientsPerDay,
      isActive: doctor.isActive,
      schedule: doctor.schedule
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu doktoru silmek istediğinizden emin misiniz?')) {
      const success = dataService.deleteDoctor(id);
      if (success) {
        alert('Doktor başarıyla silindi!');
        loadDoctors();
      }
    }
  };

  const handleViewDetails = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowScheduleModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      surname: '',
      specialty: '',
      licenseNumber: '',
      phone: '',
      email: '',
      department: 'Göz Hastalıkları',
      title: 'Dr.',
      weeklyHours: 40,
      maxPatientsPerDay: 20,
      isActive: true,
      schedule: []
    });
    setSelectedDoctor(null);
    setIsEditing(false);
  };

  const handleAddSchedule = () => {
    const newSchedule: DoctorSchedule = {
      day: 'monday',
      startTime: '09:00',
      endTime: '17:00',
      maxAppointments: 20
    };
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, newSchedule]
    }));
  };

  const handleScheduleChange = (index: number, field: keyof DoctorSchedule, value: string | number) => {
    const updatedSchedule = [...formData.schedule];
    updatedSchedule[index] = { ...updatedSchedule[index], [field]: value };
    setFormData(prev => ({ ...prev, schedule: updatedSchedule }));
  };

  const handleRemoveSchedule = (index: number) => {
    const updatedSchedule = formData.schedule.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, schedule: updatedSchedule }));
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(doctors, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'doktorlar.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedDoctors = JSON.parse(content);
        
        if (Array.isArray(importedDoctors)) {
          importedDoctors.forEach(doctor => {
            dataService.saveDoctor({
              name: doctor.name,
              surname: doctor.surname,
              specialty: doctor.specialty,
              licenseNumber: doctor.licenseNumber,
              phone: doctor.phone,
              email: doctor.email,
              department: doctor.department,
              title: doctor.title || 'Dr.',
              weeklyHours: doctor.weeklyHours || 40,
              maxPatientsPerDay: doctor.maxPatientsPerDay || 20,
              isActive: doctor.isActive !== false,
              schedule: doctor.schedule || []
            });
          });
          
          alert(`${importedDoctors.length} doktor başarıyla içe aktarıldı!`);
          loadDoctors();
        }
      } catch (error) {
        alert('Dosya okunurken hata oluştu!');
      }
    };
    reader.readAsText(file);
  };

  // Uzmanlık seçenekleri
  const specialtyOptions = [
    'Katarakt Cerrahisi',
    'Glokom',
    'Retina',
    'Kornea',
    'Şaşılık',
    'Pediatrik Oftalmoloji',
    'Oküloplastik Cerrahi',
    'Nöro-oftalmoloji',
    'Üveit'
  ];

  // Departman seçenekleri
  const departmentOptions = [
    'Göz Hastalıkları',
    'Cerrahi',
    'Acil',
    'Poliklinik',
    'Ameliyathane'
  ];

  // Gün seçenekleri
  const dayOptions = [
    { value: 'monday', label: 'Pazartesi' },
    { value: 'tuesday', label: 'Salı' },
    { value: 'wednesday', label: 'Çarşamba' },
    { value: 'thursday', label: 'Perşembe' },
    { value: 'friday', label: 'Cuma' },
    { value: 'saturday', label: 'Cumartesi' },
    { value: 'sunday', label: 'Pazar' }
  ];

  return (
    <div className="doctor-management">
      {/* Başlık ve İstatistikler */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Doktor Yönetimi</h1>
        <p className="text-gray-600 mb-6">Sistemde kayıtlı doktorları görüntüleyin ve yönetin</p>
        
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Toplam Doktor</p>
                <p className="text-2xl font-bold text-gray-900">{doctorStats.total}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Aktif Doktor</p>
                <p className="text-2xl font-bold text-green-600">{doctorStats.active}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <Stethoscope className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cerrahlar</p>
                <p className="text-2xl font-bold text-purple-600">{doctorStats.surgeons}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Göz Hastalıkları</p>
                <p className="text-2xl font-bold text-orange-600">{doctorStats.ophthalmologists}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Araç Çubuğu */}
      <div className="bg-white rounded-xl p-4 shadow border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
            {/* Arama Kutusu */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Doktor ara..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtreler */}
            <div className="flex flex-col md:flex-row gap-2">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
              >
                <option value="all">Tüm Uzmanlıklar</option>
                {specialtyOptions.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>

              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="all">Tüm Departmanlar</option>
                {departmentOptions.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Yeni Doktor
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              Dışa Aktar
            </button>
            
            <button
              onClick={handleImport}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Upload className="w-5 h-5" />
              İçe Aktar
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Doktor Listesi */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Kayıtlı doktor bulunamadı</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doktor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uzmanlık
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departman
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İletişim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lisans No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {doctor.name.charAt(0)}{doctor.surname.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {doctor.title} {doctor.name} {doctor.surname}
                          </div>
                          <div className="text-sm text-gray-500">
                            Haftalık {doctor.weeklyHours} saat
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doctor.specialty}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {doctor.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {doctor.phone}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Mail className="w-4 h-4" />
                          {doctor.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doctor.licenseNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        doctor.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {doctor.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(doctor)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="Detayları Gör"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(doctor)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-50 rounded"
                          title="Düzenle"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(doctor.id)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                          title="Sil"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Doktor Ekleme/Düzenleme Formu Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-xl bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Doktor Düzenle' : 'Yeni Doktor Ekle'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kişisel Bilgiler */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ad *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Soyad *
                    </label>
                    <input
                      type="text"
                      name="surname"
                      value={formData.surname}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ünvan
                    </label>
                    <select
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Dr.">Dr.</option>
                      <option value="Uz. Dr.">Uz. Dr.</option>
                      <option value="Prof. Dr.">Prof. Dr.</option>
                      <option value="Doç. Dr.">Doç. Dr.</option>
                      <option value="Op. Dr.">Op. Dr.</option>
                    </select>
                  </div>
                </div>

                {/* Mesleki Bilgiler */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Uzmanlık *
                    </label>
                    <select
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Seçiniz</option>
                      {specialtyOptions.map(specialty => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lisans Numarası *
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departman *
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {departmentOptions.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* İletişim Bilgileri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Çalışma Saatleri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Haftalık Çalışma Saati
                  </label>
                  <input
                    type="number"
                    name="weeklyHours"
                    value={formData.weeklyHours}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="168"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Günlük Maksimum Hasta Sayısı
                  </label>
                  <input
                    type="number"
                    name="maxPatientsPerDay"
                    value={formData.maxPatientsPerDay}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Çalışma Programı */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Çalışma Programı
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSchedule}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Calendar className="w-4 h-4" />
                    Gün Ekle
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.schedule.map((schedule, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                      <select
                        value={schedule.day}
                        onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        {dayOptions.map(day => (
                          <option key={day.value} value={day.value}>{day.label}</option>
                        ))}
                      </select>
                      
                      <input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                      
                      <input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={schedule.maxAppointments}
                          onChange={(e) => handleScheduleChange(index, 'maxAppointments', parseInt(e.target.value))}
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                          placeholder="Max hasta"
                          min="1"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSchedule(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {formData.schedule.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Henüz çalışma programı eklenmemiş
                    </p>
                  )}
                </div>
              </div>

              {/* Durum */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Aktif Doktor
                </label>
              </div>

              {/* Form Butonları */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Kaydediliyor...' : isEditing ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doktor Detayları Modal */}
      {showScheduleModal && selectedDoctor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-xl bg-white">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedDoctor.title} {selectedDoctor.name} {selectedDoctor.surname}
                </h3>
                <p className="text-sm text-gray-600">{selectedDoctor.specialty}</p>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Doktor Bilgileri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">İletişim Bilgileri</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{selectedDoctor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{selectedDoctor.email}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Mesleki Bilgiler</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Lisans No:</span>
                      <div className="font-medium">{selectedDoctor.licenseNumber}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Departman:</span>
                      <div className="font-medium">{selectedDoctor.department}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Çalışma Programı */}
              <div>
                <h4 className="font-medium text-gray-700 mb-4">Çalışma Programı</h4>
                <div className="space-y-3">
                  {selectedDoctor.schedule.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Çalışma programı tanımlanmamış
                    </p>
                  ) : (
                    selectedDoctor.schedule.map((schedule, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div>
                          <div className="font-medium">
                            {dayOptions.find(d => d.value === schedule.day)?.label}
                          </div>
                          <div className="text-sm text-gray-600">
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            Max {schedule.maxAppointments} hasta
                          </div>
                          <div className="text-sm text-gray-600">
                            {Math.round((new Date(`2000-01-01T${schedule.endTime}`).getTime() - 
                              new Date(`2000-01-01T${schedule.startTime}`).getTime()) / (1000 * 60 * 60))} saat
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* İstatistikler */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">İstatistikler</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Haftalık Çalışma</div>
                    <div className="font-medium">{selectedDoctor.weeklyHours} saat</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Günlük Kapasite</div>
                    <div className="font-medium">{selectedDoctor.maxPatientsPerDay} hasta</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Durum</div>
                    <div className={`font-medium ${
                      selectedDoctor.isActive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedDoctor.isActive ? 'Aktif' : 'Pasif'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Toplam Çalışma Günü</div>
                    <div className="font-medium">{selectedDoctor.schedule.length} gün</div>
                  </div>
                </div>
              </div>

              {/* Modal Butonları */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Kapat
                </button>
                <button
                  onClick={() => {
                    setShowScheduleModal(false);
                    handleEdit(selectedDoctor);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Düzenle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorManagement;