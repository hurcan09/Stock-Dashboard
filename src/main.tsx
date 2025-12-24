// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Debug modu kontrolü
const DEBUG_MODE = import.meta.env.DEV;
const APP_VERSION = '3.0.0';
const APP_NAME = 'Osmangazi Göz Stok Takip Sistemi';

// Global hata logları
const errorLogs: Array<{timestamp: string; error: any}> = [];

// Error Boundary bileşeni - geliştirilmiş hata yönetimi
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error; errorInfo?: React.ErrorInfo }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Hata bilgilerini logla
    const errorData = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href
    };
    
    errorLogs.push(errorData);
    console.error('💥 Uygulama hatası:', errorData);
    
    // LocalStorage'a kaydet (isteğe bağlı)
    try {
      const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      existingErrors.push(errorData);
      localStorage.setItem('app_errors', JSON.stringify(existingErrors.slice(-50))); // Son 50 hatayı sakla
    } catch (e) {
      console.error('Hata log kaydedilemedi:', e);
    }

    this.setState({
      hasError: true,
      error,
      errorInfo
    });
  }

  // Hata durumunda kullanıcı arayüzü
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-900 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center border border-blue-200/30">
            {/* Hata İkonu */}
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            {/* Hata Başlığı */}
            <h1 className="text-2xl font-bold text-blue-900 mb-3">
              Sistem Hatası!
            </h1>
            
            {/* Hata Açıklaması */}
            <div className="text-gray-600 mb-6 space-y-3">
              <p className="text-lg font-medium text-orange-600">
                Osmangazi Göz Stok Takip Sisteminde bir hata oluştu.
              </p>
              <p className="text-sm">
                Lütfen sayfayı yenileyerek tekrar deneyin. 
                Sorun devam ederse sistem yöneticinize başvurun.
              </p>
            </div>
            
            {/* Hata Detayları (Geliştirici için) */}
            {DEBUG_MODE && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-blue-700 hover:text-orange-600 mb-3 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Hata Detayları (Geliştirici)
                </summary>
                <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200/50 space-y-3">
                  <div>
                    <span className="text-xs font-medium text-blue-900">Hata Mesajı:</span>
                    <div className="text-sm font-mono text-red-600 bg-white p-2 rounded mt-1">
                      {this.state.error.message}
                    </div>
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <span className="text-xs font-medium text-blue-900">Stack Trace:</span>
                      <div className="text-xs font-mono text-gray-700 bg-white p-2 rounded mt-1 max-h-40 overflow-y-auto">
                        {this.state.error.stack}
                      </div>
                    </div>
                  )}
                  {this.state.errorInfo && (
                    <div>
                      <span className="text-xs font-medium text-blue-900">Component Stack:</span>
                      <div className="text-xs font-mono text-gray-700 bg-white p-2 rounded mt-1 max-h-40 overflow-y-auto">
                        {this.state.errorInfo.componentStack}
                      </div>
                    </div>
                  )}
                </div>
              </details>
            )}
            
            {/* Çözüm Butonları */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  // LocalStorage'ı temizle (isteğe bağlı)
                  try {
                    localStorage.removeItem('app_errors');
                  } catch (e) {
                    console.warn('LocalStorage temizlenemedi:', e);
                  }
                  window.location.reload();
                }}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sayfayı Yenile
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 px-6 py-3.5 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow"
              >
                Tekrar Dene
              </button>
            </div>
            
            {/* Sistem Bilgisi */}
            <div className="mt-8 pt-6 border-t border-blue-200/50">
              <div className="text-sm text-blue-700 space-y-1">
                <div className="flex justify-between">
                  <span>Sistem:</span>
                  <span className="font-medium">{APP_NAME}</span>
                </div>
                <div className="flex justify-between">
                  <span>Versiyon:</span>
                  <span className="font-medium">{APP_VERSION}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ortam:</span>
                  <span className={`font-medium ${import.meta.env.PROD ? 'text-green-600' : 'text-orange-600'}`}>
                    {import.meta.env.MODE}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading bileşeni - geliştirilmiş
function LoadingScreen() {
  const [progress, setProgress] = React.useState(0);
  
  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Arkaplan animasyonları */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Logo ve Hastane Bilgisi */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-28 h-28 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Osmangazi Göz</h1>
            <p className="text-blue-200 font-medium">Stok Takip Sistemi</p>
          </div>
        </div>

        {/* Yükleniyor Animasyonu */}
        <div className="relative mb-8">
          <div className="w-24 h-24 border-4 border-blue-300/30 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
          
          {/* Dış halka */}
          <div className="absolute inset-0 w-24 h-24 border-2 border-orange-300/20 rounded-full mx-auto animate-ping"></div>
        </div>

        {/* Yükleniyor Mesajı */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold text-white">Sistem Hazırlanıyor</h2>
          <p className="text-blue-300 max-w-sm mx-auto">
            Osmangazi Göz Hastanesi Stok Takip Sistemi başlatılıyor...
          </p>
          
          {/* İlerleme Çubuğu */}
          <div className="w-64 bg-blue-800/30 rounded-full h-2.5 mx-auto overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-500 to-orange-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-sm text-blue-300">
            %{Math.min(100, Math.round(progress))} yüklendi
          </div>
        </div>

        {/* Sistem Bilgileri */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-xs mx-auto border border-white/10">
          <div className="text-xs text-blue-200 space-y-2">
            <div className="flex justify-between items-center">
              <span>Versiyon:</span>
              <span className="font-semibold text-white">{APP_VERSION}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Ortam:</span>
              <span className={`font-semibold ${import.meta.env.PROD ? 'text-green-400' : 'text-orange-400'}`}>
                {import.meta.env.MODE}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Tarih:</span>
              <span className="font-semibold">{new Date().toLocaleDateString('tr-TR')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Saat:</span>
              <span className="font-semibold">{new Date().toLocaleTimeString('tr-TR')}</span>
            </div>
          </div>
        </div>

        {/* Debug Bilgileri */}
        {DEBUG_MODE && (
          <div className="mt-6 text-xs text-blue-400">
            <div className="flex items-center justify-center space-x-4">
              <span>React: {React.version}</span>
              <span className="h-1 w-1 bg-blue-400 rounded-full"></span>
              <span>HMR: {import.meta.hot ? 'Aktif' : 'Pasif'}</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}

// SİLİNDİ: Service Worker kayıt fonksiyonu
// Bu kısım tamamen kaldırıldı

// Sistem sağlık kontrolü
const checkSystemHealth = () => {
  const healthReport = {
    timestamp: new Date().toISOString(),
    localStorage: false,
    sessionStorage: false,
    indexDB: false,
    online: navigator.onLine,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cores: navigator.hardwareConcurrency || 'unknown',
    memory: (navigator as any).deviceMemory || 'unknown'
  };

  try {
    localStorage.setItem('__health_check', 'test');
    localStorage.removeItem('__health_check');
    healthReport.localStorage = true;
  } catch (e) {
    console.warn('LocalStorage kullanılamıyor:', e);
  }

  try {
    sessionStorage.setItem('__health_check', 'test');
    sessionStorage.removeItem('__health_check');
    healthReport.sessionStorage = true;
  } catch (e) {
    console.warn('SessionStorage kullanılamıyor:', e);
  }

  console.log('🩺 Sistem Sağlık Raporu:', healthReport);
  return healthReport;
};

// Global hata yakalayıcılar
const setupGlobalErrorHandlers = () => {
  // Global error handler
  window.addEventListener('error', (event) => {
    const errorData = {
      type: 'global_error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.toString(),
      timestamp: new Date().toISOString()
    };
    
    console.error('🌐 Global hata yakalandı:', errorData);
    errorLogs.push(errorData);
    event.preventDefault();
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    const errorData = {
      type: 'unhandled_rejection',
      reason: event.reason?.toString(),
      timestamp: new Date().toISOString()
    };
    
    console.error('🔗 İşlenmemiş promise reddi:', errorData);
    errorLogs.push(errorData);
    event.preventDefault();
  });
};

// Uygulama başlatma fonksiyonu - hata ayıklama ile geliştirilmiş
const initializeApp = async () => {
  const startTime = performance.now();
  
  console.log(`🚀 ${APP_NAME} v${APP_VERSION} başlatılıyor...`);
  console.log(`📅 ${new Date().toLocaleString('tr-TR')}`);
  console.log(`🌍 Ortam: ${import.meta.env.MODE}`);
  console.log(`🔗 URL: ${window.location.href}`);

  // Sistem sağlık kontrolü
  const healthReport = checkSystemHealth();

  // Root element kontrolü - detaylı
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    const error = new Error('Root element (#root) bulunamadı! Lütfen index.html dosyasını kontrol edin.');
    console.error('❌ Kritik Hata:', error);
    
    // Acil durum ekranı
    document.body.innerHTML = `
      <div style="
        min-height: 100vh;
        background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div style="
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 40px;
          max-width: 600px;
          width: 100%;
          text-align: center;
        ">
          <div style="
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 30px;
            box-shadow: 0 20px 40px rgba(249, 115, 22, 0.3);
          ">
            <span style="font-size: 48px;">⚡</span>
          </div>
          
          <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 16px; color: #F97316;">
            Sistem Başlatılamadı
          </h1>
          
          <p style="color: #94A3B8; margin-bottom: 20px; line-height: 1.6;">
            ${error.message}
          </p>
          
          <div style="
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 20px;
            text-align: left;
            margin: 30px 0;
          ">
            <h3 style="color: #F97316; margin-bottom: 12px; font-size: 16px; font-weight: 600;">
              Sorun Giderme Adımları:
            </h3>
            <ol style="color: #CBD5E1; margin-left: 20px; line-height: 1.8;">
              <li>Tarayıcı konsolunu açın (F12)</li>
              <li>index.html dosyasında #root elementini kontrol edin</li>
              <li>Sayfayı tamamen yenileyin (Ctrl + Shift + R)</li>
              <li>Tarayıcı önbelleğini temizleyin</li>
              <li>Node modüllerini yeniden yükleyin: <code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">npm install</code></li>
            </ol>
          </div>
          
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button onclick="window.location.reload()" style="
              background: linear-gradient(to right, #F97316, #FB923C);
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 10px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s;
              min-width: 140px;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(249, 115, 22, 0.4)';" 
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
              🔄 Yeniden Dene
            </button>
            
            <button onclick="console.clear(); window.location.reload()" style="
              background: transparent;
              color: #CBD5E1;
              border: 2px solid #475569;
              padding: 12px 24px;
              border-radius: 10px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s;
              min-width: 140px;
            " onmouseover="this.style.backgroundColor='rgba(71, 85, 105, 0.2)';" 
            onmouseout="this.style.backgroundColor='transparent';">
              🧹 Temizle ve Yeniden Dene
            </button>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <p style="font-size: 14px; color: #64748B;">
              ${APP_NAME} v${APP_VERSION} • ${new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    `;
    return;
  }

  console.log('✅ Root element bulundu:', rootElement);

  try {
    // React root oluştur
    const root = createRoot(rootElement);
    console.log('✅ React root oluşturuldu');

    // Önce loading ekranını göster
    root.render(<LoadingScreen />);
    console.log('⏳ Loading ekranı gösteriliyor...');

    // SİLİNDİ: Service Worker kaydı artık yapılmıyor

    // Global hata yakalayıcıları kur
    setupGlobalErrorHandlers();

    // Ana uygulamayı yükle
    setTimeout(() => {
      const loadTime = performance.now() - startTime;
      console.log(`✅ Uygulama ${loadTime.toFixed(2)}ms içinde yüklendi`);
      
      root.render(
        <React.StrictMode>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </React.StrictMode>
      );
      
      console.log('🎉 Uygulama başarıyla başlatıldı!');
      
      // Başarı bildirimi
      if (DEBUG_MODE) {
        console.log('🔧 Debug modu aktif');
        console.log('📊 Hata logları:', errorLogs);
      }
    }, 300); // 0.3 saniye loading süresi

  } catch (error: any) {
    console.error('❌ Uygulama başlatılamadı:', error);
    
    // Fallback error ekranı
    rootElement.innerHTML = `
      <div style="
        min-height: 100vh;
        background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div style="
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 40px;
          max-width: 500px;
          width: 100%;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(249, 115, 22, 0.3);
        ">
          <div style="
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
          ">
            <span style="font-size: 40px; color: white;">⚠️</span>
          </div>
          
          <h1 style="font-size: 24px; font-weight: 700; color: #0F172A; margin-bottom: 16px;">
            Kritik Başlatma Hatası
          </h1>
          
          <p style="color: #475569; margin-bottom: 24px; line-height: 1.6;">
            ${error?.message || 'Bilinmeyen bir hata oluştu'}
          </p>
          
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button onclick="window.location.reload()" style="
              background: linear-gradient(to right, #F97316, #FB923C);
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 10px;
              font-weight: 600;
              cursor: pointer;
            ">
              Sayfayı Yenile
            </button>
          </div>
          
          <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #E2E8F0;">
            <p style="font-size: 14px; color: #64748B;">
              ${APP_NAME} v${APP_VERSION}
            </p>
          </div>
        </div>
      </div>
    `;
  }
};

// Bağlantı durumu takibi
const setupConnectivityListener = () => {
  const updateOnlineStatus = () => {
    const isOnline = navigator.onLine;
    const status = isOnline ? 'online' : 'offline';
    const icon = isOnline ? '✅' : '❌';
    
    console.log(`${icon} Bağlantı durumu: ${status}`);
    
    // Tarayıcı konsolunda görünür mesaj
    if (!isOnline) {
      console.warn('⚠️ İnternet bağlantısı kesildi! Çevrimdışı moda geçiliyor...');
    }
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  updateOnlineStatus();
};

// Development ortamı için ekstra özellikler
if (DEBUG_MODE) {
  // Hot Module Replacement desteği
  if (import.meta.hot) {
    import.meta.hot.accept();
    console.log('🔥 HMR (Hot Module Replacement) aktif');
  }

  // Performans izleme
  const observePerformance = () => {
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log(`🎨 LCP: ${entry.startTime.toFixed(2)}ms`);
          }
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  };
  
  observePerformance();
}

// DOM hazır olduğunda uygulamayı başlat
const startApp = () => {
  console.group('🚀 Uygulama Başlatma Süreci');
  
  initializeApp();
  setupConnectivityListener();
  
  console.groupEnd();
};

// DOM yükleme durumunu kontrol et
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}

// Performans metrikleri
const reportWebVitals = () => {
  if (import.meta.env.PROD && 'web-vitals' in window) {
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(console.log);
      onINP(console.log);
      onFCP(console.log);
      onLCP(console.log);
      onTTFB(console.log);
    }).catch(() => {
      // web-vitals yüklenemedi, sessizce devam et
    });
  }
};

// Vitals raporlamayı başlat
reportWebVitals();

// Uygulama bilgilerini global olarak erişilebilir yap (isteğe bağlı)
declare global {
  interface Window {
    __OSMANGIZI_APP__: {
      version: string;
      name: string;
      debug: boolean;
      getErrorLogs: () => typeof errorLogs;
    };
  }
}

window.__OSMANGIZI_APP__ = {
  version: APP_VERSION,
  name: APP_NAME,
  debug: DEBUG_MODE,
  getErrorLogs: () => [...errorLogs]
};

export {};