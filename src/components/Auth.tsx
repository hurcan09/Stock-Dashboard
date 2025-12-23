// src/components/Auth.tsx - TAMAMEN GÜNCELLENMİŞ VERSİYON (Koyu Tema)
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LogIn, LogOut, User, UserPlus, Lock, Mail, 
  Eye, EyeOff, Shield, CheckCircle, XCircle, 
  Home, Settings, Users, Package, FileText, ClipboardList,
  Bell, HelpCircle, Menu, X, Search, Filter,
  Eye as Visibility,
  EyeOff as VisibilityOff,
  Activity,
  UserCheck,
  Power,
  ChevronDown,
  Eye as Hospital
} from 'lucide-react';
import { dataService } from '../utils/dataService';
import { User as UserType } from '../types';

// Giriş form verisi
interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Kayıt form verisi
interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserType['role'];
  department: string;
  phone: string;
}

// Şifre sıfırlama form verisi
interface ResetPasswordFormData {
  email: string;
  verificationCode: string;
  newPassword: string;
  confirmPassword: string;
}

// Profil form verisi
interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  department: string;
}

// Auth Props Interface
interface AuthProps {
  onLogin: (user: UserType) => void;
}

// NavItem Component
const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  onClick?: () => void;
}> = ({ icon, label, active = false, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
        active 
          ? 'bg-orange-500/20 text-white border-l-4 border-orange-500' 
          : 'text-gray-300 hover:text-white hover:bg-slate-800'
      }`}
    >
      <div className={`mr-3 ${active ? 'text-orange-400' : 'text-gray-400'}`}>
        {icon}
      </div>
      <span className="font-medium text-base">{label}</span>
    </button>
  );
};

// Login Form Component
const LoginForm: React.FC<{
  formData: LoginFormData;
  loading: boolean;
  error: string;
  success: string;
  showPassword: boolean;
  onFormChange: (data: LoginFormData) => void;
  onShowPasswordToggle: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
  onRegisterClick: () => void;
}> = ({
  formData,
  loading,
  error,
  success,
  showPassword,
  onFormChange,
  onShowPasswordToggle,
  onSubmit,
  onForgotPassword,
  onRegisterClick
}) => {
  return (
    <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8 w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-4 shadow-2xl">
          <div className="relative">
            <Hospital className="h-10 w-10 text-white" />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-white rounded-full"></div>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Osmangazi Göz
        </h1>
        <p className="text-orange-400 font-medium text-base">Stok Takip Sistemi v3.0</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 backdrop-blur-sm border border-red-700/50 rounded-xl flex items-center shadow-lg">
          <XCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
          <p className="text-red-200 font-medium text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-900/50 backdrop-blur-sm border border-green-700/50 rounded-xl flex items-center shadow-lg">
          <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
          <p className="text-green-200 font-medium text-sm">{success}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Mail className="h-4 w-4 inline mr-1 text-orange-400" />
            Email Adresi
          </label>
          <input
            type="email"
            required
            className="w-full px-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 text-white placeholder:text-gray-500"
            placeholder="ornek@osmangazigoz.com"
            value={formData.email}
            onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Lock className="h-4 w-4 inline mr-1 text-orange-400" />
            Şifre
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full px-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 pr-12 text-white placeholder:text-gray-500"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => onFormChange({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-400 transition-colors"
              onClick={onShowPasswordToggle}
            >
              {showPassword ? (
                <VisibilityOff className="h-5 w-5" />
              ) : (
                <Visibility className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4 text-orange-500 focus:ring-orange-600 border-slate-600 rounded bg-slate-800"
              checked={formData.rememberMe}
              onChange={(e) => onFormChange({ ...formData, rememberMe: e.target.checked })}
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-300">
              Beni hatırla
            </label>
          </div>
          <button
            type="button"
            className="text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors"
            onClick={onForgotPassword}
          >
            Şifremi unuttum
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-xl hover:shadow-2xl"
        >
          {loading ? (
            <>
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
              Giriş Yapılıyor...
            </>
          ) : (
            <>
              <LogIn className="h-5 w-5 mr-3" />
              Giriş Yap
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-slate-700/50">
        <p className="text-center text-gray-300 mb-4 text-base">
          Hesabınız yok mu?
        </p>
        <button
          type="button"
          className="w-full border-2 border-orange-500 text-orange-400 hover:bg-orange-500/10 hover:border-orange-400 py-3.5 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
          onClick={onRegisterClick}
        >
          <UserPlus className="h-5 w-5 mr-3" />
          Yeni Hesap Oluştur
        </button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-orange-400 font-medium">
          Demo Giriş Bilgileri:
        </p>
        <div className="mt-3 space-y-2">
          <div className="text-xs bg-slate-800/50 text-orange-300 p-2 rounded-lg border border-slate-700">
            <span className="font-semibold">Admin:</span> admin@osmangazigoz.com / 123456
          </div>
          <div className="text-xs bg-slate-800/50 text-orange-300 p-2 rounded-lg border border-slate-700">
            <span className="font-semibold">Doktor:</span> doktor@osmangazigoz.com / 123456
          </div>
          <div className="text-xs bg-slate-800/50 text-orange-300 p-2 rounded-lg border border-slate-700">
            <span className="font-semibold">Personel:</span> personel@osmangazigoz.com / 123456
          </div>
        </div>
      </div>
    </div>
  );
};

// Register Form Component
const RegisterForm: React.FC<{
  formData: RegisterFormData;
  loading: boolean;
  error: string;
  success: string;
  onFormChange: (data: RegisterFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}> = ({ formData, loading, error, success, onFormChange, onSubmit, onCancel }) => {
  return (
    <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8 w-full max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <UserPlus className="h-6 w-6 mr-3 text-orange-400" />
            Yeni Hesap Oluştur
          </h2>
          <p className="text-orange-400 text-sm mt-1">Osmangazi Göz Stok Takip Sistemi</p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-orange-400 transition-colors p-2 hover:bg-slate-800 rounded-xl"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 backdrop-blur-sm border border-red-700/50 rounded-xl shadow-lg">
          <p className="text-red-200 font-medium text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-900/50 backdrop-blur-sm border border-green-700/50 rounded-xl shadow-lg">
          <p className="text-green-200 font-medium text-sm">{success}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ad Soyad *
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 text-white placeholder:text-gray-500"
              value={formData.name}
              onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rol *
            </label>
            <select
              className="w-full px-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 text-white"
              value={formData.role}
              onChange={(e) => onFormChange({ ...formData, role: e.target.value as UserType['role'] })}
            >
              <option value="staff">Personel</option>
              <option value="manager">Yönetici</option>
              <option value="doctor">Doktor</option>
              <option value="viewer">Gözlemci</option>
              <option value="admin">Sistem Yöneticisi</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Adresi *
          </label>
          <input
            type="email"
            required
            className="w-full px-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 text-white placeholder:text-gray-500"
            value={formData.email}
            onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              className="w-full px-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 text-white placeholder:text-gray-500"
              value={formData.phone}
              onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Departman
            </label>
            <input
              type="text"
              className="w-full px-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 text-white placeholder:text-gray-500"
              value={formData.department}
              onChange={(e) => onFormChange({ ...formData, department: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Şifre *
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 text-white placeholder:text-gray-500"
              value={formData.password}
              onChange={(e) => onFormChange({ ...formData, password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Şifre Tekrar *
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 text-white placeholder:text-gray-500"
              value={formData.confirmPassword}
              onChange={(e) => onFormChange({ ...formData, confirmPassword: e.target.value })}
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 shadow-xl hover:shadow-2xl"
          >
            {loading ? 'Kaydediliyor...' : 'Kaydol'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border-2 border-orange-500 text-orange-400 hover:bg-orange-500/10 hover:border-orange-400 py-3.5 px-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
};

// Reset Password Form Component
const ResetPasswordForm: React.FC<{
  formData: ResetPasswordFormData;
  loading: boolean;
  error: string;
  success: string;
  verificationStep: number;
  onFormChange: (data: ResetPasswordFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}> = ({ formData, loading, error, success, verificationStep, onFormChange, onSubmit, onCancel }) => {
  return (
    <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8 w-full max-w-md">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Lock className="h-6 w-6 mr-3 text-orange-400" />
            Şifre Sıfırlama
          </h2>
          <p className="text-orange-400 text-sm mt-1">Osmangazi Göz Stok Takip Sistemi</p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-orange-400 transition-colors p-2 hover:bg-slate-800 rounded-xl"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 backdrop-blur-sm border border-red-700/50 rounded-xl shadow-lg">
          <p className="text-red-200 font-medium text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-900/50 backdrop-blur-sm border border-green-700/50 rounded-xl shadow-lg">
          <p className="text-green-200 font-medium text-sm">{success}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {verificationStep === 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mail className="h-4 w-4 inline mr-1 text-orange-400" />
              Email Adresiniz
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 text-white placeholder:text-gray-500"
              value={formData.email}
              onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
            />
            <p className="mt-3 text-sm text-orange-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
              Şifre sıfırlama bağlantısı email adresinize gönderilecektir.
            </p>
          </div>
        )}

        {verificationStep === 2 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Doğrulama Kodu
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-4 bg-slate-800/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 text-center text-2xl tracking-widest font-bold text-white"
              value={formData.verificationCode}
              onChange={(e) => onFormChange({ ...formData, verificationCode: e.target.value })}
              placeholder="000000"
              maxLength={6}
            />
            <p className="mt-3 text-sm text-orange-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
              Email adresinize gönderilen 6 haneli kodu girin.
            </p>
          </div>
        )}

        {verificationStep === 3 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Lock className="h-4 w-4 inline mr-1 text-orange-400" />
                Yeni Şifre
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 text-white placeholder:text-gray-500"
                value={formData.newPassword}
                onChange={(e) => onFormChange({ ...formData, newPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Lock className="h-4 w-4 inline mr-1 text-orange-400" />
                Yeni Şifre (Tekrar)
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 text-white placeholder:text-gray-500"
                value={formData.confirmPassword}
                onChange={(e) => onFormChange({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 shadow-xl hover:shadow-2xl"
        >
          {loading ? 'İşleniyor...' : 
           verificationStep === 1 ? 'Kodu Gönder' :
           verificationStep === 2 ? 'Kodu Doğrula' :
           'Şifreyi Değiştir'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full border-2 border-orange-500 text-orange-400 hover:bg-orange-500/10 hover:border-orange-400 py-3.5 px-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Giriş Ekranına Dön
        </button>
      </form>
    </div>
  );
};

// Profile Modal Component
const ProfileModal: React.FC<{
  isOpen: boolean;
  loading: boolean;
  error: string;
  success: string;
  formData: ProfileFormData;
  currentUser: UserType | null;
  onClose: () => void;
  onFormChange: (data: ProfileFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}> = ({ isOpen, loading, error, success, formData, currentUser, onClose, onFormChange, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <User className="h-6 w-6 mr-3 text-orange-400" />
              Profil Bilgilerim
            </h2>
            <p className="text-orange-400 text-sm mt-1">Osmangazi Göz Stok Takip Sistemi</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-orange-400 transition-colors p-2 hover:bg-slate-800 rounded-xl"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 backdrop-blur-sm border border-red-700/50 rounded-xl shadow-lg">
            <p className="text-red-200 font-medium text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/50 backdrop-blur-sm border border-green-700/50 rounded-xl shadow-lg">
            <p className="text-green-200 font-medium text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ad Soyad
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 text-white placeholder:text-gray-500"
                value={formData.name}
                onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 text-white placeholder:text-gray-500"
                value={formData.email}
                onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                className="w-full px-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 text-white placeholder:text-gray-500"
                value={formData.phone}
                onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Departman
              </label>
              <input
                type="text"
                className="w-full px-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 text-white placeholder:text-gray-500"
                value={formData.department}
                onChange={(e) => onFormChange({ ...formData, department: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 p-6 rounded-xl border border-slate-700/50">
            <h3 className="font-semibold text-white mb-4 flex items-center text-base">
              <Shield className="h-5 w-5 mr-2 text-orange-400" />
              Hesap Bilgileri
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-300 font-medium">Rol:</span>
                <span className="ml-2 px-3 py-1 bg-slate-800 text-orange-300 text-xs font-semibold rounded-full capitalize">
                  {currentUser?.role}
                </span>
              </div>
              <div>
                <span className="text-gray-300 font-medium">Durum:</span>
                <span className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full ${
                  currentUser?.isActive 
                    ? 'bg-green-900/50 text-green-300' 
                    : 'bg-red-900/50 text-red-300'
                }`}>
                  {currentUser?.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-300 font-medium">Yetkiler:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentUser?.permissions?.manageMaterials && (
                    <span className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded-full font-medium">Malzeme</span>
                  )}
                  {currentUser?.permissions?.managePatients && (
                    <span className="px-2 py-1 bg-green-900/50 text-green-300 text-xs rounded-full font-medium">Hasta</span>
                  )}
                  {currentUser?.permissions?.manageInvoices && (
                    <span className="px-2 py-1 bg-purple-900/50 text-purple-300 text-xs rounded-full font-medium">Fatura</span>
                  )}
                  {currentUser?.permissions?.viewReports && (
                    <span className="px-2 py-1 bg-orange-900/50 text-orange-300 text-xs rounded-full font-medium">Rapor</span>
                  )}
                  {currentUser?.permissions?.manageUsers && (
                    <span className="px-2 py-1 bg-red-900/50 text-red-300 text-xs rounded-full font-medium">Kullanıcı</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 shadow-xl hover:shadow-2xl"
            >
              {loading ? 'Güncelleniyor...' : 'Bilgileri Güncelle'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-orange-500 text-orange-400 hover:bg-orange-500/10 hover:border-orange-400 py-3.5 px-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// User Management Modal Component
const UserManagementModal: React.FC<{
  isOpen: boolean;
  users: UserType[];
  currentUser: UserType | null;
  searchTerm: string;
  filterRole: string;
  loading: boolean;
  error: string;
  success: string;
  onClose: () => void;
  onSearchChange: (term: string) => void;
  onFilterChange: (role: string) => void;
  onToggleUserStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onEditUser: (user: UserType) => void;
  onRegisterClick: () => void;
}> = ({
  isOpen,
  users,
  currentUser,
  searchTerm,
  filterRole,
  loading,
  error,
  success,
  onClose,
  onSearchChange,
  onFilterChange,
  onToggleUserStatus,
  onDeleteUser,
  onEditUser,
  onRegisterClick
}) => {
  if (!isOpen) return null;

  const getRoleColor = (role: UserType['role']) => {
    switch (role) {
      case 'admin': return 'bg-red-900/50 text-red-300';
      case 'manager': return 'bg-blue-900/50 text-blue-300';
      case 'doctor': return 'bg-green-900/50 text-green-300';
      case 'staff': return 'bg-purple-900/50 text-purple-300';
      case 'viewer': return 'bg-gray-900/50 text-gray-300';
      default: return 'bg-gray-900/50 text-gray-300';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const getRoleDisplayName = (role: UserType['role']) => {
    switch (role) {
      case 'admin': return 'Sistem Yöneticisi';
      case 'manager': return 'Yönetici';
      case 'doctor': return 'Doktor';
      case 'staff': return 'Personel';
      case 'viewer': return 'Gözlemci';
      default: return role;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Users className="h-6 w-6 mr-3 text-orange-400" />
                Kullanıcı Yönetimi
              </h2>
              <p className="text-orange-400 text-sm mt-1">
                Osmangazi Göz - Kullanıcı yetkilerini yönetin
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-orange-400 transition-colors p-2 hover:bg-slate-800 rounded-xl"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 backdrop-blur-sm border border-red-700/50 rounded-xl shadow-lg">
              <p className="text-red-200 font-medium text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-900/50 backdrop-blur-sm border border-green-700/50 rounded-xl shadow-lg">
              <p className="text-green-200 font-medium text-sm">{success}</p>
            </div>
          )}

          {/* Arama ve Filtre */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Kullanıcı ara..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 text-white placeholder:text-gray-500"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-orange-400" />
              <select
                className="px-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 text-white"
                value={filterRole}
                onChange={(e) => onFilterChange(e.target.value)}
              >
                <option value="all">Tüm Roller</option>
                <option value="admin">Sistem Yöneticisi</option>
                <option value="manager">Yönetici</option>
                <option value="doctor">Doktor</option>
                <option value="staff">Personel</option>
                <option value="viewer">Gözlemci</option>
              </select>
            </div>
            <button
              onClick={onRegisterClick}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center shadow-xl hover:shadow-2xl"
            >
              <UserPlus className="h-5 w-5 mr-3" />
              Yeni Kullanıcı
            </button>
          </div>
        </div>

        {/* Kullanıcı Listesi */}
        <div className="p-8">
          <div className="overflow-x-auto rounded-xl border border-slate-700/50">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-800/50 to-slate-900/50">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-white">Kullanıcı</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-white">Rol</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-white">Departman</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-white">Durum</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-white">Son Giriş</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-white">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                          <span className="text-white font-bold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user.name}</p>
                          <p className="text-sm text-gray-300">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-orange-300 bg-orange-900/20 px-3 py-1 rounded-full text-sm font-medium">
                        {user.department || 'Belirtilmemiş'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => onToggleUserStatus(user.id)}
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl ${
                          user.isActive
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                            : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                        }`}
                      >
                        {user.isActive ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Aktif
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Pasif
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="text-white font-medium">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('tr-TR') : 'Hiç giriş yapmadı'}
                        </div>
                        {user.lastLogin && (
                          <div className="text-xs text-gray-400">
                            {new Date(user.lastLogin).toLocaleTimeString('tr-TR')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEditUser(user)}
                          className="p-2 text-orange-400 hover:text-orange-300 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <User className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onToggleUserStatus(user.id)}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Durumu Değiştir"
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => onDeleteUser(user.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-slate-700 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">Kullanıcı bulunamadı</p>
              <p className="text-gray-500 text-sm mt-1">Arama kriterlerinize uygun kullanıcı bulunamadı</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-300">
              Toplam <span className="font-bold text-white">{filteredUsers.length}</span> kullanıcı bulundu
            </div>
            <div className="text-xs text-orange-400 bg-orange-900/20 px-3 py-1.5 rounded-full">
              Yöneticiler tüm kullanıcıları görebilir ve yönetebilir
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Auth Component
export default function Auth({ onLogin }: AuthProps) {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationStep, setVerificationStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  
  const [loginForm, setLoginForm] = useState<LoginFormData>({
    email: 'admin@osmangazigoz.com',
    password: '123456',
    rememberMe: true
  });

  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff',
    department: '',
    phone: ''
  });

  const [resetForm, setResetForm] = useState<ResetPasswordFormData>({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    department: ''
  });

  useEffect(() => {
    checkAuthStatus();
    loadUsers();
  }, []);

  useEffect(() => {
    if (currentUser && showProfile) {
      setProfileForm({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '',
        department: currentUser.department || ''
      });
    }
  }, [currentUser, showProfile]);

  const checkAuthStatus = () => {
    const user = dataService.getCurrentUser();
    if (user && user.id !== 'guest-1') {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  };

  const loadUsers = useCallback(() => {
    const loadedUsers = dataService.getUsers();
    setUsers(loadedUsers);
  }, []);

  const saveUsers = useCallback((updatedUsers: UserType[]) => {
    updatedUsers.forEach(user => {
      if (user.id.startsWith('user-')) {
        dataService.saveUser(user);
      } else {
        dataService.updateUser(user.id, user);
      }
    });
    setUsers(updatedUsers);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(loginForm.email)) {
        throw new Error('Geçerli bir email adresi giriniz');
      }

      if (loginForm.password.length < 6) {
        throw new Error('Şifre en az 6 karakter olmalıdır');
      }

      const user = users.find(u => 
        u.email.toLowerCase() === loginForm.email.toLowerCase() && 
        u.isActive
      );

      if (!user) {
        throw new Error('Kullanıcı bulunamadı veya hesap aktif değil');
      }

      // Demo için sabit şifre kontrolü
      if (loginForm.password !== '123456') {
        throw new Error('Geçersiz şifre');
      }

      setCurrentUser(user);
      setIsAuthenticated(true);
      dataService.setCurrentUser(user);
      
      if (loginForm.rememberMe) {
        localStorage.setItem('rememberedUser', loginForm.email);
      } else {
        localStorage.removeItem('rememberedUser');
      }

      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, lastLogin: new Date().toISOString() } : u
      );
      saveUsers(updatedUsers);

      setSuccess('Osmangazi Göz sistemine başarıyla giriş yapıldı!');
      
      dataService.logAction({
        action: 'LOGIN',
        module: 'AUTH',
        recordId: user.id,
        details: `${user.name} giriş yaptı`,
        performedBy: user.name
      });

      setTimeout(() => {
        setSuccess('');
        setShowLogin(false);
        // Login callback'ini çağır
        onLogin(user);
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Giriş sırasında bir hata oluştu');
      
      dataService.logAction({
        action: 'LOGIN_FAILED',
        module: 'AUTH',
        recordId: 'AUTH',
        details: `Başarısız giriş denemesi: ${loginForm.email}`,
        performedBy: 'System'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (registerForm.password !== registerForm.confirmPassword) {
        throw new Error('Şifreler eşleşmiyor');
      }

      if (registerForm.password.length < 6) {
        throw new Error('Şifre en az 6 karakter olmalıdır');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registerForm.email)) {
        throw new Error('Geçerli bir email adresi giriniz');
      }

      const existingUser = users.find(u => 
        u.email.toLowerCase() === registerForm.email.toLowerCase()
      );

      if (existingUser) {
        throw new Error('Bu email adresi zaten kayıtlı');
      }

      const newUser: UserType = {
        id: `user-${Date.now()}`,
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        username: registerForm.email.split('@')[0],
        role: registerForm.role,
        department: registerForm.department,
        phone: registerForm.phone,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: {
          createSession: registerForm.role === 'admin' || registerForm.role === 'manager',
          approveCounts: registerForm.role === 'admin' || registerForm.role === 'manager',
          manageMaterials: registerForm.role === 'admin',
          managePatients: registerForm.role !== 'viewer',
          manageInvoices: registerForm.role === 'admin',
          viewReports: true,
          manageUsers: registerForm.role === 'admin',
          manageSettings: registerForm.role === 'admin',
          bulkStatusChange: registerForm.role === 'admin',
          quickCount: registerForm.role === 'admin' || registerForm.role === 'manager',
          exportData: registerForm.role === 'admin' || registerForm.role === 'manager',
          viewDashboard: true,
          importExcel: registerForm.role === 'admin' || registerForm.role === 'manager',
          manageDailyPlan: registerForm.role === 'admin' || registerForm.role === 'manager'
        }
      };

      const savedUser = dataService.saveUser(newUser);
      const updatedUsers = [...users, savedUser];
      setUsers(updatedUsers);

      setSuccess('Kullanıcı başarıyla kaydedildi!');
      
      dataService.logAction({
        action: 'REGISTER',
        module: 'AUTH',
        recordId: newUser.id,
        details: `Yeni kullanıcı kaydı: ${newUser.name} (${newUser.role})`,
        performedBy: currentUser?.name || 'System'
      });

      setRegisterForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'staff',
        department: '',
        phone: ''
      });

      setTimeout(() => {
        setShowRegister(false);
        setShowLogin(true);
        setSuccess('');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Kayıt sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (verificationStep === 1) {
        const user = users.find(u => 
          u.email.toLowerCase() === resetForm.email.toLowerCase()
        );

        if (!user) {
          throw new Error('Bu email adresi ile kayıtlı kullanıcı bulunamadı');
        }

        setSuccess('Doğrulama kodu email adresinize gönderildi (Demo: 123456)');
        setVerificationStep(2);
        
      } else if (verificationStep === 2) {
        if (resetForm.verificationCode !== '123456') {
          throw new Error('Geçersiz doğrulama kodu');
        }

        setVerificationStep(3);
        
      } else if (verificationStep === 3) {
        if (resetForm.newPassword !== resetForm.confirmPassword) {
          throw new Error('Şifreler eşleşmiyor');
        }

        if (resetForm.newPassword.length < 6) {
          throw new Error('Şifre en az 6 karakter olmalıdır');
        }

        const userIndex = users.findIndex(u => 
          u.email.toLowerCase() === resetForm.email.toLowerCase()
        );

        if (userIndex === -1) {
          throw new Error('Kullanıcı bulunamadı');
        }

        setSuccess('Şifreniz başarıyla değiştirildi!');
        
        dataService.logAction({
          action: 'PASSWORD_RESET',
          module: 'AUTH',
          recordId: users[userIndex].id,
          details: 'Şifre sıfırlandı',
          performedBy: 'System'
        });

        setTimeout(() => {
          setShowResetPassword(false);
          setShowLogin(true);
          setVerificationStep(1);
          setResetForm({
            email: '',
            verificationCode: '',
            newPassword: '',
            confirmPassword: ''
          });
          setSuccess('');
        }, 2000);
      }

    } catch (err: any) {
      setError(err.message || 'Şifre sıfırlama sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!currentUser) {
        throw new Error('Kullanıcı bulunamadı');
      }

      const updatedUser = dataService.updateUser(currentUser.id, {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        department: profileForm.department
      });

      if (updatedUser) {
        setCurrentUser(updatedUser);
        dataService.setCurrentUser(updatedUser);
        loadUsers();
      }

      setSuccess('Profil bilgileriniz güncellendi!');
      
      dataService.logAction({
        action: 'PROFILE_UPDATE',
        module: 'AUTH',
        recordId: currentUser.id,
        details: 'Profil bilgileri güncellendi',
        performedBy: currentUser.name
      });

      setTimeout(() => setSuccess(''), 3000);

    } catch (err: any) {
      setError(err.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const updatedUser = dataService.updateUser(userId, {
      isActive: !user.isActive
    });

    if (updatedUser) {
      loadUsers();
      
      dataService.logAction({
        action: 'USER_STATUS_CHANGE',
        module: 'AUTH',
        recordId: userId,
        details: `Kullanıcı durumu değiştirildi: ${user.name} - ${!user.isActive ? 'Aktif' : 'Pasif'}`,
        performedBy: currentUser?.name || 'System'
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      setError('Kendi hesabınızı silemezsiniz');
      return;
    }

    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      const user = users.find(u => u.id === userId);
      
      const success = dataService.deleteUser(userId);
      if (success) {
        loadUsers();
        
        if (user) {
          dataService.logAction({
            action: 'USER_DELETED',
            module: 'AUTH',
            recordId: userId,
            details: `Kullanıcı silindi: ${user.name}`,
            performedBy: currentUser?.name || 'System'
          });
        }
      }
    }
  };

  const handleEditUser = (user: UserType) => {
    setSuccess(`${user.name} kullanıcısı düzenleniyor...`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleLogout = () => {
    dataService.logAction({
      action: 'LOGOUT',
      module: 'AUTH',
      recordId: currentUser?.id || 'SYSTEM',
      details: `${currentUser?.name || 'Kullanıcı'} çıkış yaptı`,
      performedBy: currentUser?.name || 'System'
    });

    dataService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setShowLogin(true);
    setShowProfile(false);
    setShowUserManagement(false);
  };

  const hasPermission = (permission: keyof UserType['permissions']) => {
    return currentUser?.permissions[permission] || false;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Arkaplan dekorasyonları */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-slate-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative w-full max-w-md z-10">
          {showLogin && (
            <LoginForm
              formData={loginForm}
              loading={loading}
              error={error}
              success={success}
              showPassword={showPassword}
              onFormChange={setLoginForm}
              onShowPasswordToggle={() => setShowPassword(!showPassword)}
              onSubmit={handleLogin}
              onForgotPassword={() => {
                setShowLogin(false);
                setShowResetPassword(true);
              }}
              onRegisterClick={() => {
                setShowLogin(false);
                setShowRegister(true);
              }}
            />
          )}

          {showRegister && (
            <RegisterForm
              formData={registerForm}
              loading={loading}
              error={error}
              success={success}
              onFormChange={setRegisterForm}
              onSubmit={handleRegister}
              onCancel={() => {
                setShowRegister(false);
                setShowLogin(true);
              }}
            />
          )}

          {showResetPassword && (
            <ResetPasswordForm
              formData={resetForm}
              loading={loading}
              error={error}
              success={success}
              verificationStep={verificationStep}
              onFormChange={setResetForm}
              onSubmit={handleResetPassword}
              onCancel={() => {
                setShowResetPassword(false);
                setShowLogin(true);
                setVerificationStep(1);
              }}
            />
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-orange-400">
              Osmangazi Göz Hastanesi Stok Takip Sistemi v3.0
            </p>
            <p className="text-xs text-slate-500 mt-1">
              © {new Date().getFullYear()} Tüm hakları saklıdır.
            </p>
          </div>
        </div>

        <style>{`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfile}
        loading={loading}
        error={error}
        success={success}
        formData={profileForm}
        currentUser={currentUser}
        onClose={() => setShowProfile(false)}
        onFormChange={setProfileForm}
        onSubmit={handleUpdateProfile}
      />

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={showUserManagement}
        users={users}
        currentUser={currentUser}
        searchTerm={searchTerm}
        filterRole={filterRole}
        loading={loading}
        error={error}
        success={success}
        onClose={() => setShowUserManagement(false)}
        onSearchChange={setSearchTerm}
        onFilterChange={setFilterRole}
        onToggleUserStatus={handleToggleUserStatus}
        onDeleteUser={handleDeleteUser}
        onEditUser={handleEditUser}
        onRegisterClick={() => {
          setShowUserManagement(false);
          setShowRegister(true);
        }}
      />

      {/* Hoşgeldin Ekranı */}
      <div className="p-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-2xl border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mr-4 shadow-2xl">
                  <span className="text-white font-bold text-xl">
                    {currentUser?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Hoşgeldin, {currentUser?.name}!</h1>
                  <p className="text-orange-300 mt-1">
                    {currentUser?.role === 'admin' && 'Sistem Yöneticisi'}
                    {currentUser?.role === 'manager' && 'Yönetici'}
                    {currentUser?.role === 'doctor' && 'Doktor'}
                    {currentUser?.role === 'staff' && 'Personel'}
                    {currentUser?.role === 'viewer' && 'Gözlemci'}
                    <span className="mx-2 text-slate-400">•</span>
                    <span className="text-slate-300">{currentUser?.department}</span>
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-lg text-slate-200">
                  Osmangazi Göz sistemine giriş yaptınız.
                  {currentUser?.role === 'admin' && ' Yönetici panelinden sistemi yönetebilirsiniz.'}
                  {currentUser?.role === 'manager' && ' Stok işlemlerini yönetebilirsiniz.'}
                  {currentUser?.role === 'doctor' && ' Hasta kayıt ve malzeme kullanım işlemlerini gerçekleştirebilirsiniz.'}
                  {currentUser?.role === 'staff' && ' Günlük operasyonları yönetebilirsiniz.'}
                  {currentUser?.role === 'viewer' && ' Sistemi görüntüleyebilirsiniz.'}
                </p>
              </div>

              <div className="mt-8 flex items-center space-x-6">
                <button
                  onClick={() => setShowProfile(true)}
                  className="bg-slate-800/50 hover:bg-slate-700/50 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center backdrop-blur-sm border border-slate-700"
                >
                  <User className="h-5 w-5 mr-2" />
                  Profilim
                </button>
                
                {hasPermission('manageUsers') && (
                  <button
                    onClick={() => setShowUserManagement(true)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center shadow-2xl hover:shadow-3xl"
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Kullanıcı Yönetimi
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="bg-red-900/30 hover:bg-red-800/40 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center backdrop-blur-sm border border-red-800/30"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Çıkış Yap
                </button>
              </div>
            </div>
            
            <div className="hidden lg:block ml-8">
              <div className="w-32 h-32 bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-slate-700">
                <Hospital className="h-16 w-16 text-orange-400/80" />
              </div>
            </div>
          </div>
        </div>

        {/* Aktif Oturumlar ve Son Aktiviteler - Sadece Yöneticiler için */}
        {hasPermission('manageUsers') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Aktif Oturumlar */}
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-orange-400" />
                  Aktif Oturumlar
                </h3>
                <span className="px-3 py-1 bg-orange-900/30 text-orange-300 text-sm font-medium rounded-full border border-orange-700/50">
                  {dataService.getUserSessions().filter(s => s.isActive).length} aktif
                </span>
              </div>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {dataService.getUserSessions()
                  .filter(session => session.isActive)
                  .slice(0, 5)
                  .map((session) => (
                    <div key={session.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{session.userName}</p>
                          <p className="text-sm text-slate-300 mt-1">
                            <span className="capitalize">{session.userRole}</span>
                            <span className="mx-2 text-slate-500">•</span>
                            {session.deviceInfo?.browser}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm(`${session.userName} oturumunu sonlandırmak istiyor musunuz?`)) {
                              dataService.terminateUserSession(session.id, 'Yönetici tarafından sonlandırıldı');
                              loadUsers();
                            }
                          }}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Oturumu Sonlandır"
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 text-xs text-slate-400">
                        <span>IP: {session.ipAddress}</span>
                        <span className="mx-2 text-slate-600">•</span>
                        <span>{new Date(session.loginTime).toLocaleTimeString('tr-TR')}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Son Aktiviteler */}
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-orange-400" />
                  Son Aktiviteler
                </h3>
                <span className="px-3 py-1 bg-slate-800 text-slate-300 text-sm font-medium rounded-full border border-slate-700">
                  Son 10 aktivite
                </span>
              </div>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {dataService.getLogs()
                  .slice(0, 10)
                  .map((log, index) => (
                    <div key={index} className="border-b border-slate-700/50 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-white">{log.performedBy}</p>
                          <p className="text-sm text-slate-300 mt-1">{log.details}</p>
                        </div>
                        <div className="text-right ml-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            log.action.includes('CREATE') ? 'bg-green-900/50 text-green-300' :
                            log.action.includes('UPDATE') ? 'bg-blue-900/50 text-blue-300' :
                            log.action.includes('DELETE') ? 'bg-red-900/50 text-red-300' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {log.action}
                          </span>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(log.performedAt || '').toLocaleTimeString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Hızlı Başlangıç Butonları */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-white mb-4">Hızlı Başlangıç</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-slate-700 text-white px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-2xl">
              <Package className="h-5 w-5 mr-2 text-orange-400" />
              Malzeme Yönetimi
            </button>
            <button className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-slate-700 text-white px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-2xl">
              <ClipboardList className="h-5 w-5 mr-2 text-orange-400" />
              Stok Sayımı
            </button>
            <button className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-slate-700 text-white px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-2xl">
              <Users className="h-5 w-5 mr-2 text-orange-400" />
              Hasta Yönetimi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}