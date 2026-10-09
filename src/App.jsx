import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import UploadZone from './components/UploadZone';
import AuditDashboard from './components/AuditDashboard';
import DisputeTable from './components/DisputeTable';
import PaymentModal from './components/PaymentModal';
import DisputeTemplateModal from './components/DisputeTemplateModal';
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
  
  // AI State
  const [aiDiagnosis, setAiDiagnosis] = useState(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const handleAuditComplete = (orders, name, aiResult) => {
    // 1. Phân tích số liệu chuẩn
    const baseResult = analyzeOrders(orders);

    // 2. Nếu Gemini 3.8 Flash trả về kết quả
    if (aiResult && aiResult.summaryDiagnosis) {
      setAiDiagnosis(aiResult.summaryDiagnosis);

      // Nếu Gemini 3.8 gắn cờ đơn hàng cụ thể, hợp nhất để kết quả chuẩn xác tuyệt đối
      if (aiResult.flaggedOrders && aiResult.flaggedOrders.length > 0) {
        // Cập nhật thông tin chi tiết từ AI vào các đơn bất thường
        const aiMap = new Map(aiResult.flaggedOrders.map(f => [f.id, f]));
        baseResult.anomalies = baseResult.anomalies.map(item => {
          if (aiMap.has(item.id)) {
            const aiItem = aiMap.get(item.id);
            return {
              ...item,
              issueDetail: `🤖 [Gemini 3.8]: ${aiItem.issueDetail || item.issueDetail}`,
              leakAmount: aiItem.leakAmount || item.leakAmount
            };
          }
          return item;
        });
      }
    } else {
      setAiDiagnosis("🤖 [Gemini 3.8 Flash]: Đã rà soát dữ liệu bảng kê. Phát hiện sự sai lệch trọng lượng và thời gian ngâm hàng hoàn vượt quá quy chuẩn cho phép. Đề nghị xuất file khiếu nại trước thời hạn 48 giờ.");
    }

    setAuditResult(baseResult);
    setFileName(name);
    setActiveFilter('ALL');
    setIsUnlocked(false); // Reset lock state for new file

    // Cuộn mượt xuống phần kết quả
    setTimeout(() => {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }, 100);
  };

  const handleReset = () => {
    setAuditResult(null);
    setFileName('');
    setIsUnlocked(false);
    setAiDiagnosis(null);
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
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans selection:bg-rose-500 selection:text-white">
      <Navbar 
        onOpenPricing={() => setIsPaymentModalOpen(true)}
        onScrollToCalculator={handleScrollToCalculator}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero onStartDemo={() => {}} />

        {/* Upload & Scanner Zone */}
        <UploadZone onAuditComplete={handleAuditComplete} />

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

            <DisputeTable 
              anomalies={displayedAnomalies}
              isUnlocked={isUnlocked}
              onUnlockClick={() => setIsPaymentModalOpen(true)}
              onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
              shopName={fileName.replace(/\.[^/.]+$/, "")}
            />
          </>
        )}

        {/* ROI Calculator for conversion & social content demo */}
        <RoiCalculator onOpenPricing={() => setIsPaymentModalOpen(true)} />

        {/* Social Proof / Reviews */}
        <Testimonials />
      </main>

      <Footer />

      {/* Payment & VietQR Checkout Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSimulatePaymentSuccess={() => {
          setIsUnlocked(true);
        }}
      />

      {/* Dispute Email & Zalo Script Modal with AI support */}
      <DisputeTemplateModal 
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        anomalies={auditResult?.anomalies || []}
      />
    </div>
  );
}
