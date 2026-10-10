import React, { useState } from 'react';
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
import RoiCalculator from './components/RoiCalculator';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import { analyzeOrders } from './utils/auditEngine';

export default function App() {
  const [auditResult, setAuditResult] = useState(null);
  const [fileName, setFileName] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [isUnlocked, setIsUnlocked] = useState(false);
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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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

  const handleAuditComplete = (orders, name, aiResult) => {
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

    // Tự động mở khóa nếu có gói tháng hoặc còn lượt quét
    let shouldUnlock = false;
    if (user) {
      if (user.plan === 'monthly') {
        shouldUnlock = true;
      } else if ((user.balanceScans || 0) > 0) {
        shouldUnlock = true;
        // Trừ 1 lượt quét
        const updatedUser = { ...user, balanceScans: Math.max(0, user.balanceScans - 1) };
        setUser(updatedUser);
        localStorage.setItem('soatdon_user', JSON.stringify(updatedUser));
        try {
          const accounts = JSON.parse(localStorage.getItem('soatdon_accounts') || '[]');
          const idx = accounts.findIndex(a => a.phone === user.phone);
          if (idx !== -1) {
            accounts[idx] = updatedUser;
            localStorage.setItem('soatdon_accounts', JSON.stringify(accounts));
          }
        } catch (e) {}
      }
    } else if (localStorage.getItem('soatdon_unlocked') === 'true') {
      shouldUnlock = true;
    }

    setIsUnlocked(shouldUnlock);

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
    setIsUnlocked(record.isUnlocked || false);
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
    setIsUnlocked(false);
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
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar 
        onOpenPricing={() => setIsPaymentModalOpen(true)}
        onScrollToCalculator={handleScrollToCalculator}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        historyCount={scanHistory.length}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero onStartDemo={() => {}} />

        {/* Upload & Scanner Zone */}
        <UploadZone 
          onAuditComplete={handleAuditComplete} 
          lastScan={scanHistory[0]}
          onOpenHistory={() => setIsHistoryModalOpen(true)}
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
              onUnlockClick={() => setIsPaymentModalOpen(true)}
              aiDiagnosis={aiDiagnosis}
              isLoadingAi={isLoadingAi}
            />

            {/* Chỉ hiện DisputeTable khi có đơn lỗi */}
            {auditResult.anomalies.length > 0 && (
              <DisputeTable 
                anomalies={displayedAnomalies}
                isUnlocked={isUnlocked}
                onUnlockClick={() => setIsPaymentModalOpen(true)}
                onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
                shopName={fileName.replace(/\.[^/.]+$/, "")}
              />
            )}
          </>
        )}

        {/* ROI Calculator for conversion & social content demo */}
        <RoiCalculator onOpenPricing={() => setIsPaymentModalOpen(true)} />

        {/* Social Proof / Reviews */}
        <Testimonials />
      </main>

      <Footer />

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
        onOpenPricing={() => {
          setIsPaymentModalOpen(true);
        }}
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

      {/* Trung Tâm Quản Trị Admin */}
      <AdminModal 
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
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
    </div>
  );
}
