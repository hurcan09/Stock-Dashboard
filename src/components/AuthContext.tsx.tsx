// src/contexts/AuthContext.tsx - TAMAMEN GÜNCELLENMİŞ VERSİYON
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { dataService } from '../utils/dataService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: keyof User['permissions']) => boolean;
  canViewPage: (page: string) => boolean;
  canEditPage: (page: string) => boolean;
  canDeletePage: (page: string) => boolean;
  canAddToPage: (page: string) => boolean;
  refreshUser: () => void;
  hasFullAccess: (page: string) => boolean;
  getRoleDisplayName: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // localStorage'dan kullanıcıyı kontrol et
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Kullanıcı verisi okunamadı:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const login = async (email: string, password: string, rememberMe?: boolean): Promise<boolean> => {
    try {
      const users = dataService.getUsers();
      const foundUser = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.isActive
      );

      if (!foundUser) {
        throw new Error('Kullanıcı bulunamadı veya hesap aktif değil');
      }

      // Demo için sabit şifre kontrolü
      if (password !== '123456') {
        throw new Error('Geçersiz şifre');
      }

      // Kullanıcıyı güncelle (son giriş tarihi)
      const updatedUser = {
        ...foundUser,
        lastLogin: new Date().toISOString()
      };
      
      dataService.updateUser(foundUser.id, updatedUser);
      
      setUser(updatedUser);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      if (rememberMe) {
        localStorage.setItem('rememberedUser', email);
      } else {
        localStorage.removeItem('rememberedUser');
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    dataService.logout();
  };

  const hasPermission = (permission: keyof User['permissions']): boolean => {
    if (!user) return false;
    return user.permissions[permission] || false;
  };

  // Sayfa görüntüleme yetkisi
  const canViewPage = (page: string): boolean => {
    if (!user) return false;
    
    const pageLower = page.toLowerCase();
    
    // SİSTEM YÖNETİCİSİ - TÜM SAYFALARI GÖREBİLİR
    if (user.role === 'admin') return true;
    
    // YÖNETİCİ - BELİRLİ SAYFALARI GÖREBİLİR (EKLEYİP ÇIKARABİLİR)
    if (user.role === 'manager') {
      const managerPages = [
        'dashboard', 'anasayfa',
        'materials', 'malzeme-yonetimi',
        'stock-count', 'stok-sayimi',
        'patients', 'hasta-yonetimi',
        'invoices', 'faturalar',
        'reports', 'raporlar',
        'users', 'kullanıcılar',
        'doctors', 'doktorlar',
        'daily-plan', 'gunluk-plan',
        'yemek-listesi'
      ];
      return managerPages.includes(pageLower);
    }
    
    // DOKTOR - SADECE GÖRÜNTÜLEME YETKİSİ
    if (user.role === 'doctor') {
      const doctorPages = [
        'dashboard', 'anasayfa',
        'patients', 'hasta-yonetimi',
        'reports', 'raporlar',
        'doctors', 'doktorlar',
        'daily-plan', 'gunluk-plan'
      ];
      return doctorPages.includes(pageLower);
    }
    
    // PERSONEL
    if (user.role === 'staff') {
      const staffPages = [
        'dashboard', 'anasayfa',
        'materials', 'malzeme-yonetimi',
        'stock-count', 'stok-sayimi',
        'patients', 'hasta-yonetimi',
        'daily-plan', 'gunluk-plan'
      ];
      return staffPages.includes(pageLower);
    }
    
    // GÖZLEMCİ
    if (user.role === 'viewer') {
      const viewerPages = [
        'dashboard', 'anasayfa',
        'materials', 'malzeme-yonetimi',
        'stock-count', 'stok-sayimi',
        'reports', 'raporlar'
      ];
      return viewerPages.includes(pageLower);
    }
    
    return false;
  };

  // Sayfa düzenleme yetkisi
  const canEditPage = (page: string): boolean => {
    if (!user) return false;
    
    const pageLower = page.toLowerCase();
    
    // SİSTEM YÖNETİCİSİ - TÜM SAYFALARI DÜZENLEYEBİLİR
    if (user.role === 'admin') return true;
    
    // YÖNETİCİ - BELİRLİ SAYFALARI DÜZENLEYEBİLİR
    if (user.role === 'manager') {
      const editablePages = [
        'materials', 'malzeme-yonetimi',
        'stock-count', 'stok-sayimi',
        'patients', 'hasta-yonetimi',
        'invoices', 'faturalar',
        'daily-plan', 'gunluk-plan',
        'yemek-listesi'
      ];
      return editablePages.includes(pageLower);
    }
    
    // DOKTOR - HİÇBİR SAYFAYI DÜZENLEYEMEZ (SADECE GÖRÜNTÜLEME)
    if (user.role === 'doctor') return false;
    
    // PERSONEL - SINIRLI DÜZENLEME
    if (user.role === 'staff') {
      const staffEditablePages = [
        'materials', 'malzeme-yonetimi',
        'stock-count', 'stok-sayimi'
      ];
      return staffEditablePages.includes(pageLower);
    }
    
    // GÖZLEMCİ - HİÇBİR ŞEYİ DÜZENLEYEMEZ
    return false;
  };

  // Sayfa silme yetkisi - SADECE SİSTEM YÖNETİCİSİ
  const canDeletePage = (page: string): boolean => {
    if (!user) return false;
    
    // SADECE SİSTEM YÖNETİCİSİ SİLEBİLİR
    return user.role === 'admin';
  };

  // Sayfaya ekleme yetkisi
  const canAddToPage = (page: string): boolean => {
    if (!user) return false;
    
    const pageLower = page.toLowerCase();
    
    // SİSTEM YÖNETİCİSİ - TÜM SAYFALARA EKLEYEBİLİR
    if (user.role === 'admin') return true;
    
    // YÖNETİCİ - BELİRLİ SAYFALARA EKLEYEBİLİR
    if (user.role === 'manager') {
      const addablePages = [
        'materials', 'malzeme-yonetimi',
        'stock-count', 'stok-sayimi',
        'patients', 'hasta-yonetimi',
        'invoices', 'faturalar',
        'daily-plan', 'gunluk-plan',
        'yemek-listesi'
      ];
      return addablePages.includes(pageLower);
    }
    
    // DOKTOR - HİÇBİR SAYFAYA EKLEYEMEZ
    if (user.role === 'doctor') return false;
    
    // PERSONEL - SINIRLI EKLEME
    if (user.role === 'staff') {
      const staffAddablePages = [
        'materials', 'malzeme-yonetimi',
        'stock-count', 'stok-sayimi'
      ];
      return staffAddablePages.includes(pageLower);
    }
    
    return false;
  };

  // Tam erişim yetkisi - SADECE SİSTEM YÖNETİCİSİ
  const hasFullAccess = (page: string): boolean => {
    if (!user) return false;
    return user.role === 'admin';
  };

  // Rol görüntüleme adı
  const getRoleDisplayName = (): string => {
    if (!user) return '';
    
    switch (user.role) {
      case 'admin': return 'Sistem Yöneticisi';
      case 'manager': return 'Yönetici';
      case 'doctor': return 'Doktor';
      case 'staff': return 'Personel';
      case 'viewer': return 'Gözlemci';
      default: return user.role;
    }
  };

  const refreshUser = () => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Kullanıcı verisi yeniden yüklenemedi:', error);
      }
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    hasPermission,
    canViewPage,
    canEditPage,
    canDeletePage,
    canAddToPage,
    refreshUser,
    hasFullAccess,
    getRoleDisplayName
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};