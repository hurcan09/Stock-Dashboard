import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Error Boundary bileşeni - hata yönetimi için
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Bir hata oluştuğunda state'i güncelle
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Hata bilgilerini logla (gerçek uygulamada bir logging servisine gönder)
    console.error('Uygulama hatası:', error, errorInfo);
    
    // Kullanıcı dostu hata mesajı göster
    this.setState({
      hasError: true,
      error: new Error(`Bir hata oluştu: ${error.message}`)
    });
  }

  // Hata durumunda kullanıcı arayüzü
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            {/* Hata İkonu */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            {/* Hata Başlığı */}
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              Bir Hata Oluştu!
            </h1>
            
            {/* Hata Açıklaması */}
            <p className="text-gray-600 mb-6">
              Üzgünüz, uygulamada beklenmeyen bir hata oluştu. 
              Bu sorun geçici olabilir, lütfen sayfayı yenileyerek tekrar deneyin.
            </p>
            
            {/* Hata Detayları (Geliştirici için) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                  Hata Detayları (Geliştirici)
                </summary>
                <div className="bg-gray-100 p-3 rounded-lg text-xs font-mono text-gray-700 overflow-auto">
                  {this.state.error.stack}
                </div>
              </details>
            )}
            
            {/* Çözüm Butonları */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sayfayı Yenile
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false })}
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
            
            {/* Destek Bilgisi */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Sorun devam ederse{' '}
                <a 
                  href="mailto:destek@osmanagazigozhastanesi.com"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  destek ekibimizle
                </a>{' '}
                iletişime geçin.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading bileşeni - uygulama yüklenirken gösterilecek
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        {/* Logo ve Hastane Bilgisi */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mr-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold text-gray-800">Osmangazi Göz</h1>
            <p className="text-gray-600">Stok Takip Sistemi</p>
          </div>
        </div>

        {/* Yükleniyor Animasyonu */}
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          
          {/* Nokta Animasyonu */}
          <div className="flex justify-center space-x-1 mb-8">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          </div>
        </div>

        {/* Yükleniyor Mesajı */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-700">Sistem Hazırlanıyor</h2>
          <p className="text-gray-500 max-w-sm">
            Osmangazi Göz Hastanesi Stok Takip Sistemi yükleniyor...
          </p>
          
          {/* İlerleme Çubuğu */}
          <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>

        {/* Sistem Bilgileri */}
        <div className="mt-8 p-4 bg-white bg-opacity-50 rounded-lg max-w-xs mx-auto">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Versiyon:</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Ortam:</span>
              <span className="font-medium text-green-600">{import.meta.env.MODE}</span>
            </div>
            <div className="flex justify-between">
              <span>Son Güncelleme:</span>
              <span className="font-medium">{new Date().toLocaleDateString('tr-TR')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Service Worker kayıt fonksiyonu (PWA desteği için)
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker başarıyla kaydedildi:', registration);
      
      // Güncelleme kontrolü
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Yeni versiyon bulundu, kullanıcıyı bilgilendir
              console.log('Yeni versiyon mevcut! Sayfayı yenileyin.');
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker kaydı başarısız:', error);
    }
  }
};

// Uygulama başlatma fonksiyonu
const initializeApp = async () => {
  console.log('🚀 Osmangazi Göz Hastanesi Stok Takip Sistemi başlatılıyor...');
  
  // Sistem bilgilerini logla
  console.log('📊 Sistem Bilgileri:', {
    versiyon: '1.0.0',
    ortam: import.meta.env.MODE,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    online: navigator.onLine,
    tarih: new Date().toISOString()
  });

  // PWA desteği için service worker'ı kaydet (production'da)
  if (import.meta.env.PROD) {
    await registerServiceWorker();
  }

  // Performans ölçümü
  const appStartTime = performance.now();

  // Root element kontrolü
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element bulunamadı! Lütfen index.html dosyasını kontrol edin.');
  }

  // React uygulamasını başlat
  try {
    const root = createRoot(rootElement);
    
    // Önce loading ekranını göster
    root.render(<LoadingScreen />);
    
    // Kısa bir süre sonra ana uygulamayı yükle (simülasyon)
    setTimeout(() => {
      const appLoadTime = performance.now() - appStartTime;
      console.log(`✅ Uygulama ${appLoadTime.toFixed(2)}ms içinde yüklendi`);
      
      root.render(
        <React.StrictMode>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </React.StrictMode>
      );
    }, 1000); // 1 saniye loading süresi (gerçek uygulamada bu gerekmez)

  } catch (error) {
    console.error('❌ Uygulama başlatılamadı:', error);
    
    // Fallback error ekranı
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          min-height: 100vh;
          background: linear-gradient(135deg, #fef2f2, #fffbeb);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <div style="
            background: white;
            border-radius: 16px;
            padding: 40px;
            max-width: 500px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          ">
            <div style="
              width: 80px;
              height: 80px;
              background: #dc2626;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 24px;
            ">
              <svg style="width: 40px; height: 40px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h1 style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 16px;">
              Kritik Sistem Hatası
            </h1>
            <p style="color: #6b7280; margin-bottom: 24px; line-height: 1.6;">
              Uygulama başlatılamadı. Lütfen sayfayı yenileyin veya sistem yöneticinizle iletişime geçin.
            </p>
            <button 
              onclick="window.location.reload()"
              style="
                background: #2563eb;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                margin-right: 12px;
              "
            >
              Sayfayı Yenile
            </button>
            <button 
              onclick="window.location.href = '/'"
              style="
                background: transparent;
                color: #374151;
                border: 1px solid #d1d5db;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
              "
            >
              Ana Sayfa
            </button>
            <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 14px; color: #9ca3af;">
                Osmangazi Göz Hastanesi Stok Takip Sistemi v1.0.0
              </p>
            </div>
          </div>
        </div>
      `;
    }
  }
};

// Online/Offline durum takibi
const setupConnectivityListener = () => {
  const updateOnlineStatus = () => {
    const status = navigator.onLine ? 'online' : 'offline';
    console.log(`📡 Bağlantı durumu: ${status}`);
    
    // Bağlantı durumu değişikliğinde bildirim göster (isteğe bağlı)
    if (status === 'offline') {
      console.warn('İnternet bağlantısı kesildi! Çevrimdışı moda geçiliyor...');
    } else {
      console.log('İnternet bağlantısı yeniden sağlandı!');
    }
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // İlk durumu kontrol et
  updateOnlineStatus();
};

// Uygulama başlatma
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupConnectivityListener();
  });
} else {
  initializeApp();
  setupConnectivityListener();
}

// Global error handler
window.addEventListener('error', (event) => {
  console.error('🛑 Global hata yakalandı:', event.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('🛑 İşlenmemiş promise reddi:', event.reason);
  event.preventDefault();
});

// Development ortamı için ekstra loglar
if (import.meta.env.DEV) {
  console.log('🔧 Development modu aktif');
  
  // Hot Module Replacement desteği
  if (import.meta.hot) {
    import.meta.hot.accept();
    console.log('🔥 HMR (Hot Module Replacement) aktif');
  }
}

// Performans metrikleri (isteğe bağlı)
const reportWebVitals = () => {
  if (import.meta.env.PROD) {
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(console.log);
      onINP(console.log);
      onFCP(console.log);
      onLCP(console.log);
      onTTFB(console.log);
    });
  }
};

// Vitals raporlamayı başlat
reportWebVitals();

export {};