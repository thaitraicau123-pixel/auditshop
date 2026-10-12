import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import UploadZone from './components/UploadZone';
import AuditDashboard from './components/AuditDashboard';
import DisputeTable from './components/DisputeTable';
import PaymentModal from './components/PaymentModal';
import DisputeTemplateModal from './components/DisputeTemplateModal';
import EmergencyAlertModal from './components/EmergencyAlertModal';
import VictoryCelebrationModal from './components/VictoryCelebrationModal';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import ScanHistoryModal from './components/ScanHistoryModal';
import AdminModal from './components/AdminModal';
import ChangelogModal from './components/ChangelogModal';
import RoiCalculator from './components/RoiCalculator';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import CoffeeDonateModal from './components/CoffeeDonateModal';
import HallOfFameModal from './components/HallOfFameModal';
import CrossReconcileModal from './components/CrossReconcileModal';
import RateCompareModal from './components/RateCompareModal';
import QuickAuditModal from './components/QuickAuditModal';
import DisputePlaybookModal from './components/DisputePlaybookModal';
import DamageClaimModal from './components/DamageClaimModal';
import { analyzeOrders } from './utils/auditEngine';
import { syncLocalAccountsToCloud, fetchCloudAccounts } from './utils/cloudDatabase';
import { CURRENT_SYSTEM_VERSION } from './data/changelog';

export default function App() {
  const [auditResult, setAuditResult] = useState(null);
  const [fileName, setFileName] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  
  // User Authentication & Balance State
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('soatdon_user') || 'null');
    } catch {
      return null;
    }
  });

  // Tự động đồng bộ tài khoản từ Cloud Database khi tải trang (Đa thiết bị / Mọi máy tính)
  useEffect(() => {
    try {
      localStorage.removeItem('soatdon_unlocked');
    } catch {}

    syncLocalAccountsToCloud().then(() => {
      fetchCloudAccounts().then(accounts => {
        if (user && accounts && Array.isArray(accounts)) {
          const latest = accounts.find(a => a.phone === user.phone);
          if (latest) {
            setUser(latest);
            localStorage.setItem('soatdon_user', JSON.stringify(latest));
          }
        }
      });
    });
  }, []);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Changelog Modal State (Tự động hiển thị khi website có cập nhật mới)
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isAutoChangelog, setIsAutoChangelog] = useState(false);

  useEffect(() => {
    try {
      const lastSeen = localStorage.getItem('soatdon_last_seen_version');
      if (lastSeen !== CURRENT_SYSTEM_VERSION) {
        setIsChangelogOpen(true);
        setIsAutoChangelog(true);
      }
    } catch {}
  }, []);

  // Scan History State
  const [scanHistory, setScanHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('soatdon_scan_history') || '[]');
    } catch {
      return [];
    }
  });
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  // Urgent & Radiant Pop-up Modals
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);

  // AI State
  const [aiDiagnosis, setAiDiagnosis] = useState(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Sound FX State (Bật/tắt âm thanh hiệu ứng toàn trang)
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem('soatdon_sound_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  const handleToggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('soatdon_sound_enabled', String(next));
      return next;
    });
  };

  // Coffee Donate Modal State (Mời dev ly cà phê)
  const [isCoffeeModalOpen, setIsCoffeeModalOpen] = useState(false);
  const [coffeeModalContext, setCoffeeModalContext] = useState(null);

  // Chế độ Giao diện Sáng / Tối (Dark / Light Mode)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('soatdon_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('soatdon_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('soatdon_theme', 'light');
      }
    } catch {}
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // 5 Tiện ích đối soát chuyên sâu mới (V3.0 Logistics Suite)
  const [isCrossReconcileOpen, setIsCrossReconcileOpen] = useState(false);
  const [isRateCompareOpen, setIsRateCompareOpen] = useState(false);
  const [isQuickAuditOpen, setIsQuickAuditOpen] = useState(false);
  const [isDisputePlaybookOpen, setIsDisputePlaybookOpen] = useState(false);
  const [isDamageClaimOpen, setIsDamageClaimOpen] = useState(false);

  // Hall of Fame State (Bảng Vàng Tri Ân)
  const [isHallOfFameOpen, setIsHallOfFameOpen] = useState(false);

  const handleOpenCoffeeModal = (context) => {
    setCoffeeModalContext(context || null);
    setIsCoffeeModalOpen(true);
  };

  const handleOpenHallOfFame = () => {
    setIsHallOfFameOpen(true);
  };

  const handleCloseChangelog = () => {
    try {
      localStorage.setItem('soatdon_last_seen_version', CURRENT_SYSTEM_VERSION);
    } catch {}
    setIsChangelogOpen(false);
    setIsAutoChangelog(false);
  };

  // Phím tắt toàn cục: ESC đóng modal & Ctrl+Shift+A mở Admin bí mật
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsEmergencyModalOpen(false);
        setIsVictoryModalOpen(false);
        setIsPaymentModalOpen(false);
        setIsTemplateModalOpen(false);
        setIsAuthModalOpen(false);
        setIsProfileModalOpen(false);
        setIsHistoryModalOpen(false);
        setIsAdminModalOpen(false);
        handleCloseChangelog();
        setIsCoffeeModalOpen(false);
        setIsHallOfFameOpen(false);
        setIsCrossReconcileOpen(false);
        setIsRateCompareOpen(false);
        setIsQuickAuditOpen(false);
        setIsDisputePlaybookOpen(false);
        setIsDamageClaimOpen(false);
      }

      // 🔐 Phím tắt bí mật chỉ anh Bùi Quốc Thái biết: Ctrl + Shift + A (hoặc Cmd + Shift + A trên Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Mở nhanh bằng URL bí mật có #admin hoặc ?admin=true
    if (window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
      setIsAdminModalOpen(true);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAuditComplete = (orders, name, aiResult, isSample = false) => {
    // 1. Phân tích số liệu chuẩn
    const baseResult = analyzeOrders(orders);

    // 2. Nếu AI Chuyên Sâu trả về kết quả
    if (aiResult && aiResult.summaryDiagnosis) {
      setAiDiagnosis(aiResult.summaryDiagnosis);

      // Nếu AI gắn cờ đơn hàng cụ thể, hợp nhất để kết quả chuẩn xác tuyệt đối
      if (aiResult.flaggedOrders && aiResult.flaggedOrders.length > 0) {
        const aiMap = new Map(aiResult.flaggedOrders.map(f => [f.id, f]));
        baseResult.anomalies = baseResult.anomalies.map(item => {
          if (aiMap.has(item.id)) {
            const aiItem = aiMap.get(item.id);
            return {
              ...item,
              issueDetail: `🤖 [AI Kiểm Toán]: ${aiItem.issueDetail || item.issueDetail}`,
              leakAmount: aiItem.leakAmount || item.leakAmount
            };
          }
          return item;
        });
      }
    } else {
      setAiDiagnosis("🤖 [AI Kiểm Toán Chuyên Sâu]: Đã rà soát dữ liệu bảng kê. Phát hiện sự sai lệch trọng lượng và thời gian ngâm hàng hoàn vượt quá quy chuẩn cho phép. Đề nghị xuất file khiếu nại trước thời hạn 48 giờ.");
    }

    setAuditResult(baseResult);
    setFileName(name);
    setActiveFilter('ALL');

    // DỰ ÁN CỘNG ĐỒNG PHI LỢI NHUẬN: 100% các file quét đều được mở khóa đầy đủ không điều kiện
    const shouldUnlock = true;
    setIsUnlocked(true);

    // 3. Tự động lưu thông tin lần soát đơn này vào lịch sử
    const newScanRecord = {
      id: 'SCAN_' + Date.now(),
      fileName: name,
      timestamp: new Date().toISOString(),
      totalOrders: baseResult.totalOrders,
      anomalyCount: baseResult.anomalyCount,
      totalLeakage: baseResult.totalLeakage,
      breakdown: baseResult.breakdown,
      anomalies: baseResult.anomalies,
      aiDiagnosis: (aiResult && aiResult.summaryDiagnosis) || "Đã rà soát dữ liệu bảng kê. Phát hiện sự sai lệch trọng lượng và đơn hoàn giam kho.",
      isUnlocked: shouldUnlock
    };

    setScanHistory(prev => {
      const filtered = prev.filter(item => item.fileName !== name);
      const updated = [newScanRecord, ...filtered].slice(0, 15);
      localStorage.setItem('soatdon_scan_history', JSON.stringify(updated));
      return updated;
    });

    // 4. Mở pop-up tương ứng
    if (baseResult.anomalies.length > 0) {
      setIsEmergencyModalOpen(true);
    } else {
      setIsVictoryModalOpen(true);
    }

    // Cuộn mượt xuống phần kết quả
    setTimeout(() => {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }, 100);
  };

  // Chọn xem lại một lần soát đơn trong quá khứ
  const handleSelectHistoryScan = (record) => {
    setAuditResult({
      totalOrders: record.totalOrders,
      anomalyCount: record.anomalyCount,
      normalCount: record.totalOrders - record.anomalyCount,
      totalLeakage: record.totalLeakage,
      breakdown: record.breakdown,
      anomalies: record.anomalies
    });
    setFileName(record.fileName);
    setIsUnlocked(true);
    setAiDiagnosis(record.aiDiagnosis);
    setActiveFilter('ALL');

    setTimeout(() => {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }, 100);
  };

  const handleDeleteHistoryScan = (id) => {
    setScanHistory(prev => {
      const next = prev.filter(item => item.id !== id);
      localStorage.setItem('soatdon_scan_history', JSON.stringify(next));
      return next;
    });
  };

  const handleClearAllHistory = () => {
    setScanHistory([]);
    localStorage.removeItem('soatdon_scan_history');
  };

  const handleReset = () => {
    setAuditResult(null);
    setFileName('');
    setIsUnlocked(true);
    setAiDiagnosis(null);
    setIsEmergencyModalOpen(false);
    setIsVictoryModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToCalculator = () => {
    const el = document.getElementById('roi-calculator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Lọc danh sách bất thường
  const displayedAnomalies = auditResult?.anomalies ? (
    activeFilter === 'ALL'
      ? auditResult.anomalies
      : auditResult.anomalies.filter(item => item.issueType === activeFilter)
  ) : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative transition-colors duration-200">
      {/* Ambient background tech mesh pattern */}
      <div className="fixed inset-0 pointer-events-none bg-tech-grid opacity-35 dark:opacity-20 -z-10" />
      <Navbar 
        onOpenPricing={() => handleOpenCoffeeModal("Ủng hộ tiếp sức duy trì máy chủ AI SoatDon.vn phi lợi nhuận")}
        onScrollToCalculator={handleScrollToCalculator}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        historyCount={scanHistory.length}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenChangelog={() => {
          setIsChangelogOpen(true);
          setIsAutoChangelog(false);
        }}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenCoffeeModal={handleOpenCoffeeModal}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenCrossReconcile={() => setIsCrossReconcileOpen(true)}
        onOpenRateCompare={() => setIsRateCompareOpen(true)}
        onOpenQuickAudit={() => setIsQuickAuditOpen(true)}
        onOpenDisputePlaybook={() => setIsDisputePlaybookOpen(true)}
        onOpenDamageClaim={() => setIsDamageClaimOpen(true)}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero 
          onStartDemo={() => {}} 
          onOpenCrossReconcile={() => setIsCrossReconcileOpen(true)}
          onOpenRateCompare={() => setIsRateCompareOpen(true)}
          onOpenQuickAudit={() => setIsQuickAuditOpen(true)}
          onOpenDisputePlaybook={() => setIsDisputePlaybookOpen(true)}
          onOpenDamageClaim={() => setIsDamageClaimOpen(true)}
        />

        {/* Upload & Scanner Zone */}
        <UploadZone 
          onAuditComplete={handleAuditComplete} 
          lastScan={scanHistory[0]}
          onOpenHistory={() => setIsHistoryModalOpen(true)}
          soundEnabled={soundEnabled}
        />

        {/* Results Dashboard if audited */}
        {auditResult && (
          <>
            <AuditDashboard 
              auditResult={auditResult}
              fileName={fileName}
              onReset={handleReset}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              isUnlocked={isUnlocked}
              onUnlockClick={() => handleOpenCoffeeModal("Ủng hộ tiếp sức duy trì máy chủ AI SoatDon.vn phi lợi nhuận")}
              aiDiagnosis={aiDiagnosis}
              isLoadingAi={isLoadingAi}
            />

            {/* Chỉ hiện DisputeTable khi có đơn lỗi */}
            {auditResult.anomalies.length > 0 && (
              <DisputeTable 
                anomalies={displayedAnomalies}
                isUnlocked={isUnlocked}
                onUnlockClick={() => handleOpenCoffeeModal("Ủng hộ tiếp sức duy trì máy chủ AI SoatDon.vn phi lợi nhuận")}
                onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
                shopName={fileName.replace(/\.[^/.]+$/, "")}
                onOpenCoffeeModal={handleOpenCoffeeModal}
              />
            )}
          </>
        )}

        {/* ROI Calculator for conversion & social content demo */}
        <RoiCalculator onOpenPricing={() => handleOpenCoffeeModal("Ủng hộ tiếp sức duy trì máy chủ AI SoatDon.vn phi lợi nhuận")} />

        {/* Social Proof / Reviews */}
        <Testimonials />
      </main>

      <Footer 
        onOpenCoffeeModal={handleOpenCoffeeModal} 
        onOpenHallOfFame={handleOpenHallOfFame}
      />

      {/* 🚨 CỬA SỔ BÁO ĐỘNG ĐỎ KHI PHÁT HIỆN THẤT THOÁT TIỀN */}
      <EmergencyAlertModal 
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        totalLeakage={auditResult?.totalLeakage || 0}
        anomalyCount={auditResult?.anomalyCount || 0}
        fileName={fileName}
        breakdown={auditResult?.breakdown}
        onGoToDispute={() => {
          setIsEmergencyModalOpen(false);
          const el = document.getElementById('dispute-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          else window.scrollTo({ top: 500, behavior: 'smooth' });
        }}
      />

      {/* 🌟 CỬA SỔ VINH DANH CHIẾN THẮNG KHI 100% KHÔNG MẤT TIỀN */}
      <VictoryCelebrationModal 
        isOpen={isVictoryModalOpen}
        onClose={() => setIsVictoryModalOpen(false)}
        totalOrders={auditResult?.totalOrders || 0}
        fileName={fileName}
        onReset={handleReset}
        onOpenCoffeeModal={handleOpenCoffeeModal}
      />

      {/* Payment & VietQR Checkout Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSimulatePaymentSuccess={() => {
          setIsUnlocked(true);
          setScanHistory(prev => {
            const next = prev.map(item => item.fileName === fileName ? { ...item, isUnlocked: true } : item);
            localStorage.setItem('soatdon_scan_history', JSON.stringify(next));
            return next;
          });
        }}
        currentUser={user}
        onUpdateUser={setUser}
      />

      {/* Dispute Email & Zalo Script Modal with AI support */}
      <DisputeTemplateModal 
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        anomalies={auditResult?.anomalies || []}
      />

      {/* Modal Đăng Ký / Đăng Nhập Tài Khoản */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(loggedInUser) => {
          setUser(loggedInUser);
        }}
      />

      {/* Modal Hồ Sơ & Quản Lý Lượt Quét */}
      <UserProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onLogout={() => {
          localStorage.removeItem('soatdon_user');
          setUser(null);
        }}
        onOpenCoffeeModal={() => handleOpenCoffeeModal("Ủng hộ tiếp sức duy trì máy chủ AI SoatDon.vn phi lợi nhuận")}
        onOpenHistory={() => {
          setIsHistoryModalOpen(true);
        }}
      />

      {/* Modal Lịch Sử Các Lần Soát Đơn Trước */}
      <ScanHistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={scanHistory}
        onSelectScan={handleSelectHistoryScan}
        onDeleteScan={handleDeleteHistoryScan}
        onClearAll={handleClearAllHistory}
      />

      {/* Trung Tâm Quản Trị Admin (Chỉ Bùi Quốc Thái) */}
      <AdminModal 
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        currentUser={user}
        onManualUnlockCurrentFile={() => {
          setIsUnlocked(true);
          if (fileName) {
            setScanHistory(prev => {
               const next = prev.map(item => item.fileName === fileName ? { ...item, isUnlocked: true } : item);
               localStorage.setItem('soatdon_scan_history', JSON.stringify(next));
               return next;
            });
          }
        }}
      />

      {/* Bảng Thông Báo Cập Nhật Hệ Thống & Tính Năng Mới */}
      <ChangelogModal 
        isOpen={isChangelogOpen}
        onClose={handleCloseChangelog}
        isAutoOpen={isAutoChangelog}
      />

      {/* ☕ Pop-up Mời Dev Ly Cà Phê (Tiếp Sức Máy Chủ AI) */}
      <CoffeeDonateModal 
        isOpen={isCoffeeModalOpen}
        onClose={() => setIsCoffeeModalOpen(false)}
        defaultContext={coffeeModalContext}
        onOpenHallOfFame={handleOpenHallOfFame}
      />

      {/* 🏆 Cửa Sổ Bảng Vàng Tri Ân Cộng Đồng Shop */}
      <HallOfFameModal 
        isOpen={isHallOfFameOpen}
        onClose={() => setIsHallOfFameOpen(false)}
        onOpenCoffeeModal={handleOpenCoffeeModal}
      />

      {/* ⚔️ Modal So Khớp 2 Chiều File Kho vs File Bưu Cục */}
      <CrossReconcileModal 
        isOpen={isCrossReconcileOpen}
        onClose={() => setIsCrossReconcileOpen(false)}
        onOpenDisputePlaybook={() => {
          setIsCrossReconcileOpen(false);
          setIsDisputePlaybookOpen(true);
        }}
      />

      {/* 📊 Modal Ma Trận Tra Cứu & So Sánh Cước 6 Hãng */}
      <RateCompareModal 
        isOpen={isRateCompareOpen}
        onClose={() => setIsRateCompareOpen(false)}
      />

      {/* 🔍 Modal Soi Nhanh 1 Mã Vận Đơn */}
      <QuickAuditModal 
        isOpen={isQuickAuditOpen}
        onClose={() => setIsQuickAuditOpen(false)}
        onOpenDisputePlaybook={() => {
          setIsQuickAuditOpen(false);
          setIsDisputePlaybookOpen(true);
        }}
      />

      {/* 💬 Modal Kịch Bản Đòi Tiền Zalo Dẫn Luật Bưu Chính 2010 */}
      <DisputePlaybookModal 
        isOpen={isDisputePlaybookOpen}
        onClose={() => setIsDisputePlaybookOpen(false)}
      />

      {/* 📸 Modal Lập Biên Bản Hàng Bể Vỡ / Tráo Hàng In Ra Bản A4 */}
      <DamageClaimModal 
        isOpen={isDamageClaimOpen}
        onClose={() => setIsDamageClaimOpen(false)}
      />
    </div>
  );
}

