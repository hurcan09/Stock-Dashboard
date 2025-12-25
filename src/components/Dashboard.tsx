// src/components/UserManagement.tsx - TAM GÜNCELLENMİŞ VERSİYON
import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Search,
  Filter,
  Edit,
  Trash2,
  Power,
  Shield,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  CheckCircle,
  XCircle,
  Lock,
  Mail,
  Phone,
  Calendar,
  Activity,
  Download,
  Upload,
  RefreshCw,
  Key,
  Ban,
  Check,
  X,
  Info
} from 'lucide-react';
import { dataService } from '../utils/dataService';
import { User, UserSession, SystemLog } from '../types';

// Info Icon Component
const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// User Management Component
export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSessions, setActiveSessions] = useState<UserSession[]>([]);
  const [activityLogs, setActivityLogs] = useState<SystemLog[]>([]);
  
  // Kullanıcı düzenleme modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'staff' as User['role'],
    department: '',
    phone: '',
    isActive: true
  });

  // Yetki yönetimi modal state
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionUser, setPermissionUser] = useState<User | null>(null);
  const [permissionForm, setPermissionForm] = useState({
    manageMaterials: false,
    managePatients: false,
    manageInvoices: false,
    manageUsers: false,
    viewDashboard: false,
    importExcel: false,
    manageDailyPlan: false,
    viewReports: false
  });

  // Yeni kullanıcı modal state
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff' as User['role'],
    department: '',
    phone: ''
  });

  // Seçili kullanıcılar
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Verileri yükle
  const loadData = useCallback(() => {
    setLoading(true);
    try {
      const allUsers = dataService.getUsers();
      setUsers(allUsers);
      setFilteredUsers(allUsers);
      
      const sessions = dataService.getUserSessions();
      setActiveSessions(sessions.filter(s => s.isActive));
      
      const logs = dataService.getLogs().filter(log => 
        log.module === 'AUTH' || log.module === 'USER'
      ).slice(0, 10);
      setActivityLogs(logs);
    } catch (err: any) {
      setError('Veriler yüklenirken bir hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Arama ve filtreleme
  useEffect(() => {
    let result = users;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.department?.toLowerCase().includes(term) ||
        user.phone?.toLowerCase().includes(term)
      );
    }
    
    if (filterRole !== 'all') {
      result = result.filter(user => user.role === filterRole);
    }
    
    if (filterStatus !== 'all') {
      result = result.filter(user => 
        filterStatus === 'active' ? user.isActive : !user.isActive
      );
    }
    
    setFilteredUsers(result);
  }, [users, searchTerm, filterRole, filterStatus]);

  // Kullanıcı ekleme
  const handleAddUser = async () => {
    if (newUserForm.password !== newUserForm.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    
    if (newUserForm.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const newUser = dataService.saveUser({
        name: newUserForm.name,
        email: newUserForm.email,
        role: newUserForm.role,
        department: newUserForm.department,
        phone: newUserForm.phone,
        isActive: true,
        username: newUserForm.email.split('@')[0],
        password: newUserForm.password,
        permissions: {
          createSession: newUserForm.role === 'admin' || newUserForm.role === 'manager',
          approveCounts: newUserForm.role === 'admin' || newUserForm.role === 'manager',
          manageMaterials: newUserForm.role === 'admin',
          managePatients: newUserForm.role !== 'viewer',
          manageInvoices: newUserForm.role === 'admin',
          viewReports: true,
          manageUsers: newUserForm.role === 'admin',
          manageSettings: newUserForm.role === 'admin',
          bulkStatusChange: newUserForm.role === 'admin',
          quickCount: newUserForm.role === 'admin' || newUserForm.role === 'manager',
          exportData: newUserForm.role === 'admin' || newUserForm.role === 'manager',
          viewDashboard: true,
          importExcel: newUserForm.role === 'admin' || newUserForm.role === 'manager',
          manageDailyPlan: newUserForm.role === 'admin' || newUserForm.role === 'manager'
        }
      } as User);
      
      setSuccess(`${newUser.name} başarıyla eklendi`);
      setNewUserForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'staff',
        department: '',
        phone: ''
      });
      setShowNewUserModal(false);
      loadData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı düzenleme
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || '',
      phone: user.phone || '',
      isActive: user.isActive
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    setLoading(true);
    setError('');
    
    try {
      const updatedUser = dataService.updateUser(editingUser.id, editForm);
      
      if (updatedUser) {
        setSuccess(`${updatedUser.name} başarıyla güncellendi`);
        setShowEditModal(false);
        loadData();
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Yetki yönetimi
  const handleEditPermissions = (user: User) => {
    setPermissionUser(user);
    setPermissionForm({
      manageMaterials: user.permissions.manageMaterials,
      managePatients: user.permissions.managePatients,
      manageInvoices: user.permissions.manageInvoices,
      manageUsers: user.permissions.manageUsers,
      viewDashboard: user.permissions.viewDashboard,
      importExcel: user.permissions.importExcel,
      manageDailyPlan: user.permissions.manageDailyPlan,
      viewReports: user.permissions.viewReports
    });
    setShowPermissionModal(true);
  };

  const handleUpdatePermissions = async () => {
    if (!permissionUser) return;
    
    setLoading(true);
    setError('');
    
    try {
      const updatedUser = dataService.updateUser(permissionUser.id, {
        permissions: {
          ...permissionUser.permissions,
          ...permissionForm
        }
      });
      
      if (updatedUser) {
        setSuccess(`${permissionUser.name} yetkileri güncellendi`);
        setShowPermissionModal(false);
        loadData();
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı durumunu değiştirme
  const handleToggleUserStatus = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    if (window.confirm(`${user.name} kullanıcısının durumunu değiştirmek istiyor musunuz?`)) {
      dataService.updateUser(userId, { isActive: !user.isActive });
      setSuccess(`${user.name} durumu ${!user.isActive ? 'aktif' : 'pasif'} yapıldı`);
      loadData();
      
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Kullanıcı silme
  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    if (window.confirm(`${user.name} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) {
      const success = dataService.deleteUser(userId);
      if (success) {
        setSuccess(`${user.name} başarıyla silindi`);
        loadData();
        
        setTimeout(() => setSuccess(''), 3000);
      }
    }
  };

  // Oturum yönetimi
  const handleTerminateSession = (sessionId: string, userName: string) => {
    if (window.confirm(`${userName} oturumunu sonlandırmak istiyor musunuz?`)) {
      dataService.terminateUserSession(sessionId, 'Yönetici tarafından sonlandırıldı');
      setSuccess('Oturum sonlandırıldı');
      loadData();
      
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleTerminateAllSessions = () => {
    if (window.confirm('Tüm aktif oturumları sonlandırmak istiyor musunuz?')) {
      let count = 0;
      activeSessions.forEach(session => {
        if (dataService.terminateUserSession(session.id, 'Yönetici tarafından sonlandırıldı')) {
          count++;
        }
      });
      setSuccess(`${count} oturum sonlandırıldı`);
      loadData();
      
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Yardımcı fonksiyonlar
  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'doctor': return 'bg-green-100 text-green-800';
      case 'nurse': return 'bg-purple-100 text-purple-800';
      case 'staff': return 'bg-orange-100 text-orange-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'Sistem Yöneticisi';
      case 'manager': return 'Yönetici';
      case 'doctor': return 'Doktor';
      case 'nurse': return 'Hemşire';
      case 'staff': return 'Personel';
      case 'viewer': return 'Gözlemci';
      default: return role;
    }
  };

  // Seçim işlemleri
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleBulkStatusChange = (status: boolean) => {
    if (selectedUsers.length === 0) {
      setError('Lütfen en az bir kullanıcı seçin');
      return;
    }
    
    if (window.confirm(`${selectedUsers.length} kullanıcının durumunu ${status ? 'aktif' : 'pasif'} yapmak istiyor musunuz?`)) {
      selectedUsers.forEach(userId => {
        dataService.updateUser(userId, { isActive: status });
      });
      
      setSuccess(`${selectedUsers.length} kullanıcı ${status ? 'aktif' : 'pasif'} yapıldı`);
      setSelectedUsers([]);
      loadData();
      
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) {
      setError('Lütfen en az bir kullanıcı seçin');
      return;
    }
    
    if (window.confirm(`${selectedUsers.length} kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) {
      let deletedCount = 0;
      selectedUsers.forEach(userId => {
        const success = dataService.deleteUser(userId);
        if (success) deletedCount++;
      });
      
      setSuccess(`${deletedCount} kullanıcı silindi`);
      setSelectedUsers([]);
      loadData();
      
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Filtreleri temizle
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterRole('all');
    setFilterStatus('all');
  };

  return (
    <div className="space-y-6">
      {/* Hata ve Başarı Mesajları */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Başlık ve İstatistikler */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Kullanıcı Yönetimi</h1>
            <p className="text-blue-200">Sistem kullanıcılarını yönetin, yetkileri düzenleyin ve oturumları izleyin</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{users.length}</div>
              <div className="text-sm text-blue-300">Toplam Kullanıcı</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{activeSessions.length}</div>
              <div className="text-sm text-blue-300">Aktif Oturum</div>
            </div>
          </div>
        </div>
      </div>

      {/* Kontrol Paneli */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Arama */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtreler */}
          <div className="flex gap-2">
            <select
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">Tüm Roller</option>
              <option value="admin">Yönetici</option>
              <option value="manager">Müdür</option>
              <option value="doctor">Doktor</option>
              <option value="staff">Personel</option>
              <option value="viewer">Gözlemci</option>
            </select>

            <select
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>

            <button
              onClick={handleClearFilters}
              className="px-4 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors flex items-center"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Toplu İşlemler */}
        {selectedUsers.length > 0 && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-orange-600 mr-2" />
                <span className="font-medium text-orange-800">
                  {selectedUsers.length} kullanıcı seçildi
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkStatusChange(true)}
                  className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-lg transition-colors flex items-center"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Aktif Yap
                </button>
                <button
                  onClick={() => handleBulkStatusChange(false)}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors flex items-center"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Pasif Yap
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Seçilenleri Sil
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Kullanıcı Listesi */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-orange-600 rounded"
                  />
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Kullanıcı</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Rol</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Departman</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Durum</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Son Giriş</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="h-4 w-4 text-orange-600 rounded"
                    />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mr-4">
                        <span className="text-white font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.phone && (
                          <p className="text-xs text-gray-500">{user.phone}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-700">{user.department || '-'}</span>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleToggleUserStatus(user.id)}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        user.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {user.isActive ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Aktif
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Pasif
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div className="text-gray-900">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('tr-TR') : 'Hiç giriş yapmadı'}
                      </div>
                      {user.lastLogin && (
                        <div className="text-xs text-gray-500">
                          {new Date(user.lastLogin).toLocaleTimeString('tr-TR')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditPermissions(user)}
                        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Yetkileri Düzenle"
                      >
                        <Shield className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(user.id)}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                        title="Durumu Değiştir"
                      >
                        <Power className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-700 font-medium">Kullanıcı bulunamadı</p>
              <p className="text-gray-500 text-sm mt-1">Arama kriterlerinize uygun kullanıcı bulunamadı</p>
            </div>
          )}
        </div>

        {/* Yeni Kullanıcı Butonu */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowNewUserModal(true)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center shadow-lg hover:shadow-xl"
          >
            <UserPlus className="h-5 w-5 mr-3" />
            Yeni Kullanıcı Ekle
          </button>
        </div>
      </div>

      {/* Aktif Oturumlar ve Son Aktiviteler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aktif Oturumlar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-orange-600" />
              Aktif Oturumlar ({activeSessions.length})
            </h3>
            <button
              onClick={handleTerminateAllSessions}
              className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center"
            >
              <Power className="h-4 w-4 mr-1" />
              Tümünü Sonlandır
            </button>
          </div>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {activeSessions.slice(0, 5).map((session) => (
              <div key={session.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{session.userName}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="capitalize">{session.userRole}</span>
                      <span className="mx-2">•</span>
                      {session.deviceInfo?.browser}
                      <span className="mx-2">•</span>
                      {session.deviceInfo?.os}
                    </p>
                  </div>
                  <button
                    onClick={() => handleTerminateSession(session.id, session.userName)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Oturumu Sonlandır"
                  >
                    <Power className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  <span>IP: {session.ipAddress}</span>
                  <span className="mx-2">•</span>
                  <span>Giriş: {new Date(session.loginTime).toLocaleTimeString('tr-TR')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Son Aktiviteler */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-orange-600" />
              Son Aktiviteler
            </h3>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
              Son 10 aktivite
            </span>
          </div>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {activityLogs.map((log, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{log.performedBy}</p>
                    <p className="text-sm text-gray-700 mt-1">{log.details}</p>
                  </div>
                  <div className="text-right ml-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      log.action.includes('CREATE') ? 'bg-green-100 text-green-800' :
                      log.action.includes('UPDATE') ? 'bg-blue-100 text-blue-800' :
                      log.action.includes('DELETE') ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.action}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(log.performedAt).toLocaleTimeString('tr-TR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Yeni Kullanıcı Modal */}
      {showNewUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <UserPlus className="h-5 w-5 mr-2 text-orange-600" />
                  Yeni Kullanıcı Ekle
                </h2>
                <button
                  onClick={() => setShowNewUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şifre
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şifre Tekrar
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      value={newUserForm.confirmPassword}
                      onChange={(e) => setNewUserForm({...newUserForm, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rol
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value as User['role']})}
                    >
                      <option value="staff">Personel</option>
                      <option value="manager">Yönetici</option>
                      <option value="doctor">Doktor</option>
                      <option value="nurse">Hemşire</option>
                      <option value="viewer">Gözlemci</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departman
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      value={newUserForm.department}
                      onChange={(e) => setNewUserForm({...newUserForm, department: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({...newUserForm, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleAddUser}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
                >
                  {loading ? 'Ekleniyor...' : 'Kullanıcı Ekle'}
                </button>
                <button
                  onClick={() => setShowNewUserModal(false)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-medium transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Düzenleme Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Edit className="h-5 w-5 mr-2 text-orange-600" />
                  Kullanıcıyı Düzenle
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rol
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      value={editForm.role}
                      onChange={(e) => setEditForm({...editForm, role: e.target.value as User['role']})}
                    >
                      <option value="staff">Personel</option>
                      <option value="manager">Yönetici</option>
                      <option value="doctor">Doktor</option>
                      <option value="nurse">Hemşire</option>
                      <option value="viewer">Gözlemci</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durum
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      value={editForm.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setEditForm({...editForm, isActive: e.target.value === 'active'})}
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Pasif</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departman
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={editForm.department}
                    onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleUpdateUser}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
                >
                  {loading ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-medium transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yetki Yönetimi Modal */}
      {showPermissionModal && permissionUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-orange-600" />
                  Yetki Yönetimi: {permissionUser.name}
                </h2>
                <button
                  onClick={() => setShowPermissionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {Object.entries(permissionForm).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {key === 'manageMaterials' && 'Malzeme Yönetimi'}
                      {key === 'managePatients' && 'Hasta Yönetimi'}
                      {key === 'manageInvoices' && 'Fatura Yönetimi'}
                      {key === 'manageUsers' && 'Kullanıcı Yönetimi'}
                      {key === 'viewDashboard' && 'Dashboard Görüntüleme'}
                      {key === 'importExcel' && 'Excel Import'}
                      {key === 'manageDailyPlan' && 'Günlük Plan Yönetimi'}
                      {key === 'viewReports' && 'Rapor Görüntüleme'}
                    </label>
                    <button
                      onClick={() => setPermissionForm({
                        ...permissionForm,
                        [key]: !value
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-xl">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Bilgi
                </h4>
                <p className="text-sm text-blue-600">
                  Yetkiler değişiklikleri anında uygulanır. Kullanıcının mevcut oturumu varsa,
                  değişiklikler yeni oturum açıldığında geçerli olacaktır.
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleUpdatePermissions}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : 'Yetkileri Güncelle'}
                </button>
                <button
                  onClick={() => setShowPermissionModal(false)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-medium transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}