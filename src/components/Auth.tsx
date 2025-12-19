// src/components/Auth.tsx - TAM GÜNCELLENMİŞ VERSİYON
// Auth.tsx dosyasının en üstüne şu import'u ekleyin:
import { useLocalStorage } from '../hooks/useLocalStorage';
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
  ChevronDown
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
      className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
        active 
          ? 'bg-orange-50 text-orange-600' 
          : 'text-blue-900 hover:bg-blue-50'
      }`}
    >
      <div className={`mr-3 ${active ? 'text-orange-600' : 'text-blue-700'}`}>
        {icon}
      </div>
      <span className="font-medium">{label}</span>
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
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-200/30 p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-900 to-blue-800 rounded-full mb-4 shadow-lg">
          <div className="relative">
            <Shield className="h-10 w-10 text-white" />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 rounded-full"></div>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          Osmangazi Göz
        </h1>
        <p className="text-blue-700 font-medium">Stok Takip Sistemi</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50/90 backdrop-blur-sm border border-red-200/50 rounded-xl flex items-center shadow-sm">
          <XCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50/90 backdrop-blur-sm border border-green-200/50 rounded-xl flex items-center shadow-sm">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
          <p className="text-green-700 font-medium">{success}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">
            <Mail className="h-4 w-4 inline mr-1" />
            Email Adresi
          </label>
          <input
            type="email"
            required
            className="w-full px-4 py-3.5 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300"
            placeholder="ornek@osmangazigoz.com"
            value={formData.email}
            onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">
            <Lock className="h-4 w-4 inline mr-1" />
            Şifre
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full px-4 py-3.5 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 pr-12"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => onFormChange({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-orange-600 transition-colors"
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
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-blue-300 rounded"
              checked={formData.rememberMe}
              onChange={(e) => onFormChange({ ...formData, rememberMe: e.target.checked })}
            />
            <label htmlFor="remember" className="ml-2 text-sm text-blue-700">
              Beni hatırla
            </label>
          </div>
          <button
            type="button"
            className="text-sm text-orange-600 hover:text-orange-800 font-medium transition-colors"
            onClick={onForgotPassword}
          >
            Şifremi unuttum
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
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

      <div className="mt-8 pt-8 border-t border-blue-200/50">
        <p className="text-center text-blue-700 mb-4">
          Hesabınız yok mu?
        </p>
        <button
          type="button"
          className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 py-3.5 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow"
          onClick={onRegisterClick}
        >
          <UserPlus className="h-5 w-5 mr-3" />
          Yeni Hesap Oluştur
        </button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-blue-600 font-medium">
          Demo Giriş Bilgileri:
        </p>
        <div className="mt-3 space-y-2">
          <div className="text-xs bg-blue-50/50 text-blue-800 p-2 rounded-lg">
            <span className="font-semibold">Admin:</span> admin@osmangazigoz.com / 123456
          </div>
          <div className="text-xs bg-blue-50/50 text-blue-800 p-2 rounded-lg">
            <span className="font-semibold">Doktor:</span> doktor@osmangazigoz.com / 123456
          </div>
          <div className="text-xs bg-blue-50/50 text-blue-800 p-2 rounded-lg">
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
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-200/30 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 flex items-center">
            <UserPlus className="h-6 w-6 mr-3 text-orange-600" />
            Yeni Hesap Oluştur
          </h2>
          <p className="text-blue-700 text-sm mt-1">Osmangazi Göz Stok Takip Sistemi</p>
        </div>
        <button
          onClick={onCancel}
          className="text-blue-400 hover:text-orange-600 transition-colors p-2 hover:bg-blue-50 rounded-xl"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50/90 backdrop-blur-sm border border-red-200/50 rounded-xl shadow-sm">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50/90 backdrop-blur-sm border border-green-200/50 rounded-xl shadow-sm">
          <p className="text-green-700 font-medium">{success}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Ad Soyad *
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3.5 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300"
              value={formData.name}
              onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Rol *
            </label>
            <select
              className="w-full px-4 py-3.5 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300"
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
          <label className="block text-sm font-medium text-blue-900 mb-2">
            Email Adresi *
          </label>
          <input
            type="email"
            required
            className="w-full px-4 py-3.5 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300"
            value={formData.email}
            onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              className="w-full px-4 py-3.5 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300"
              value={formData.phone}
              onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Departman
            </label>
            <input
              type="text"
              className="w-full px-4 py-3.5 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300"
              value={formData.department}
              onChange={(e) => onFormChange({ ...formData, department: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Şifre *
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3.5 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300"
              value={formData.password}
              onChange={(e) => onFormChange({ ...formData, password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Şifre Tekrar *
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3.5 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300"
              value={formData.confirmPassword}
              onChange={(e) => onFormChange({ ...formData, confirmPassword: e.target.value })}
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
          >
            {loading ? 'Kaydediliyor...' : 'Kaydol'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 py-3.5 px-4 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow"
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
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-200/30 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 flex items-center">
            <Lock className="h-6 w-6 mr-3 text-orange-600" />
            Şifre Sıfırlama
          </h2>
          <p className="text-blue-700 text-sm mt-1">Osmangazi Göz Stok Takip Sistemi</p>
        </div>
        <button
          onClick={onCancel}
          className="text-blue-400 hover:text-orange-600 transition-colors p-2 hover:bg-blue-50 rounded-xl"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50/90 backdrop-blur-sm border border-red-200/50 rounded-xl shadow-sm">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50/90 backdrop-blur-sm border border-green-200/50 rounded-xl shadow-sm">
          <p className="text-green-700 font-medium">{success}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {verificationStep === 1 && (
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              <Mail className="h-4 w-4 inline mr-1" />
              Email Adresiniz
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3.5 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300"
              value={formData.email}
              onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
            />
            <p className="mt-3 text-sm text-blue-600 bg-blue-50/50 p-3 rounded-lg">
              Şifre sıfırlama bağlantısı email adresinize gönderilecektir.
            </p>
          </div>
        )}

        {verificationStep === 2 && (
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Doğrulama Kodu
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-4 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 text-center text-2xl tracking-widest font-bold text-blue-900"
              value={formData.verificationCode}
              onChange={(e) => onFormChange({ ...formData, verificationCode: e.target.value })}
              placeholder="000000"
              maxLength={6}
            />
            <p className="mt-3 text-sm text-blue-600 bg-blue-50/50 p-3 rounded-lg">
              Email adresinize gönderilen 6 haneli kodu girin.
            </p>
          </div>
        )}

        {verificationStep === 3 && (
          <>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                <Lock className="h-4 w-4 inline mr-1" />
                Yeni Şifre
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3.5 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300"
                value={formData.newPassword}
                onChange={(e) => onFormChange({ ...formData, newPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                <Lock className="h-4 w-4 inline mr-1" />
                Yeni Şifre (Tekrar)
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3.5 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300"
                value={formData.confirmPassword}
                onChange={(e) => onFormChange({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
        >
          {loading ? 'İşleniyor...' : 
           verificationStep === 1 ? 'Kodu Gönder' :
           verificationStep === 2 ? 'Kodu Doğrula' :
           'Şifreyi Değiştir'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 py-3.5 px-4 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow"
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-200/30 p-8 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-blue-900 flex items-center">
              <User className="h-6 w-6 mr-3 text-orange-600" />
              Profil Bilgilerim
            </h2>
            <p className="text-blue-700 text-sm mt-1">Osmangazi Göz Stok Takip Sistemi</p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-400 hover:text-orange-600 transition-colors p-2 hover:bg-blue-50 rounded-xl"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50/90 backdrop-blur-sm border border-red-200/50 rounded-xl shadow-sm">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50/90 backdrop-blur-sm border border-green-200/50 rounded-xl shadow-sm">
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Ad Soyad
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3.5 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300"
                value={formData.name}
                onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3.5 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300"
                value={formData.email}
                onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                className="w-full px-4 py-3.5 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300"
                value={formData.phone}
                onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Departman
              </label>
              <input
                type="text"
                className="w-full px-4 py-3.5 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300"
                value={formData.department}
                onChange={(e) => onFormChange({ ...formData, department: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 p-6 rounded-xl border border-blue-200/50">
            <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-orange-600" />
              Hesap Bilgileri
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Rol:</span>
                <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full capitalize">
                  {currentUser?.role}
                </span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Durum:</span>
                <span className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full ${
                  currentUser?.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {currentUser?.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-blue-700 font-medium">Yetkiler:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentUser?.permissions?.manageMaterials && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">Malzeme</span>
                  )}
                  {currentUser?.permissions?.managePatients && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Hasta</span>
                  )}
                  {currentUser?.permissions?.manageInvoices && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">Fatura</span>
                  )}
                  {currentUser?.permissions?.viewReports && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">Rapor</span>
                  )}
                  {currentUser?.permissions?.manageUsers && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">Kullanıcı</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Güncelleniyor...' : 'Bilgileri Güncelle'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 py-3.5 px-4 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow"
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
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'doctor': return 'bg-green-100 text-green-800';
      case 'staff': return 'bg-purple-100 text-purple-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-200/30 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-blue-200/30 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-blue-900 flex items-center">
                <Users className="h-6 w-6 mr-3 text-orange-600" />
                Kullanıcı Yönetimi
              </h2>
              <p className="text-blue-700 text-sm mt-1">
                Osmangazi Göz - Kullanıcı yetkilerini yönetin
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-400 hover:text-orange-600 transition-colors p-2 hover:bg-blue-50 rounded-xl"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50/90 backdrop-blur-sm border border-red-200/50 rounded-xl shadow-sm">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50/90 backdrop-blur-sm border border-green-200/50 rounded-xl shadow-sm">
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          )}

          {/* Arama ve Filtre */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Kullanıcı ara..."
                className="w-full pl-12 pr-4 py-3.5 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-400" />
              <select
                className="px-4 py-3.5 bg-white/80 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300"
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
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center shadow-lg hover:shadow-xl"
            >
              <UserPlus className="h-5 w-5 mr-3" />
              Yeni Kullanıcı
            </button>
          </div>
        </div>

        {/* Kullanıcı Listesi */}
        <div className="p-8">
          <div className="overflow-x-auto rounded-xl border border-blue-200/50">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100/50">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-blue-900">Kullanıcı</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-blue-900">Rol</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-blue-900">Departman</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-blue-900">Durum</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-blue-900">Son Giriş</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-blue-900">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mr-4 shadow-sm">
                          <span className="text-white font-bold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-blue-900">{user.name}</p>
                          <p className="text-sm text-blue-600">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-blue-800 bg-blue-50 px-3 py-1 rounded-full text-sm font-medium">
                        {user.department || 'Belirtilmemiş'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => onToggleUserStatus(user.id)}
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-sm hover:shadow ${
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
                        <div className="text-blue-900 font-medium">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('tr-TR') : 'Hiç giriş yapmadı'}
                        </div>
                        {user.lastLogin && (
                          <div className="text-xs text-blue-600">
                            {new Date(user.lastLogin).toLocaleTimeString('tr-TR')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEditUser(user)}
                          className="p-2 text-blue-600 hover:text-orange-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <User className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onToggleUserStatus(user.id)}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                          title="Durumu Değiştir"
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => onDeleteUser(user.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
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
              <Users className="h-16 w-16 text-blue-300 mx-auto mb-4" />
              <p className="text-blue-700 font-medium">Kullanıcı bulunamadı</p>
              <p className="text-blue-600 text-sm mt-1">Arama kriterlerinize uygun kullanıcı bulunamadı</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-blue-700">
              Toplam <span className="font-bold">{filteredUsers.length}</span> kullanıcı bulundu
            </div>
            <div className="text-xs text-blue-600 bg-blue-50/50 px-3 py-1.5 rounded-full">
              Yöneticiler tüm kullanıcıları görebilir ve yönetebilir
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Auth Component
export default function Auth() {
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
    if (user && user.id !== '1') {
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
        window.location.reload();
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
      <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Arkaplan dekorasyonları */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
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
            <p className="text-sm text-blue-300">
              Osmangazi Göz Hastanesi Stok Takip Sistemi v3.0
            </p>
            <p className="text-xs text-blue-400 mt-1">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
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
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-bold text-xl">
                    {currentUser?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Hoşgeldin, {currentUser?.name}!</h1>
                  <p className="text-blue-200 mt-1">
                    {currentUser?.role === 'admin' && 'Sistem Yöneticisi'}
                    {currentUser?.role === 'manager' && 'Yönetici'}
                    {currentUser?.role === 'doctor' && 'Doktor'}
                    {currentUser?.role === 'staff' && 'Personel'}
                    {currentUser?.role === 'viewer' && 'Gözlemci'}
                    <span className="mx-2">•</span>
                    {currentUser?.department}
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-lg text-blue-100">
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
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center backdrop-blur-sm"
                >
                  <User className="h-5 w-5 mr-2" />
                  Profilim
                </button>
                
                {hasPermission('manageUsers') && (
                  <button
                    onClick={() => setShowUserManagement(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center shadow-lg hover:shadow-xl"
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Kullanıcı Yönetimi
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="bg-red-500/20 hover:bg-red-500/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center backdrop-blur-sm"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Çıkış Yap
                </button>
              </div>
            </div>
            
            <div className="hidden lg:block ml-8">
              <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/20">
                <Activity className="h-16 w-16 text-white/80" />
              </div>
            </div>
          </div>
        </div>

        {/* Aktif Oturumlar ve Son Aktiviteler - Sadece Yöneticiler için */}
        {hasPermission('manageUsers') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Aktif Oturumlar */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-200/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-blue-900 flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-orange-600" />
                  Aktif Oturumlar
                </h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {dataService.getUserSessions().filter(s => s.isActive).length} aktif
                </span>
              </div>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {dataService.getUserSessions()
                  .filter(session => session.isActive)
                  .slice(0, 5)
                  .map((session) => (
                    <div key={session.id} className="bg-blue-50/50 rounded-xl p-4 border border-blue-200/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-blue-900">{session.userName}</p>
                          <p className="text-sm text-blue-600 mt-1">
                            <span className="capitalize">{session.userRole}</span>
                            <span className="mx-2">•</span>
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
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          title="Oturumu Sonlandır"
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 text-xs text-blue-500">
                        <span>IP: {session.ipAddress}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(session.loginTime).toLocaleTimeString('tr-TR')}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Son Aktiviteler */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-200/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-blue-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-orange-600" />
                  Son Aktiviteler
                </h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  Son 10 aktivite
                </span>
              </div>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {dataService.getLogs()
                  .slice(0, 10)
                  .map((log, index) => (
                    <div key={index} className="border-b border-blue-100/50 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-blue-900">{log.performedBy}</p>
                          <p className="text-sm text-blue-700 mt-1">{log.details}</p>
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
                          <p className="text-xs text-blue-500 mt-1">
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
          <h3 className="text-lg font-bold text-blue-900 mb-4">Hızlı Başlangıç</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 text-blue-900 px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow">
              <Package className="h-5 w-5 mr-2" />
              Malzeme Yönetimi
            </button>
            <button className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 text-blue-900 px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow">
              <ClipboardList className="h-5 w-5 mr-2" />
              Stok Sayımı
            </button>
            <button className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 text-blue-900 px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow">
              <Users className="h-5 w-5 mr-2" />
              Hasta Yönetimi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}