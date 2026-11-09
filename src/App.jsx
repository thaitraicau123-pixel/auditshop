import React, { useState, useEffect } from 'react'; import Navbar from './components/Navbar'; import Hero from './components/Hero'; import UploadZone from './components/UploadZone'; import AuditDashboard from './components/AuditDashboard'; import DisputeTable from './components/DisputeTable'; import PaymentModal from './components/PaymentModal';
import DisputeTemplateModal from './components/DisputeTemplateModal'; import EmergencyAlertModal from './components/EmergencyAlertModal'; import VictoryCelebrationModal from './components/VictoryCelebrationModal'; import AuthModal from './components/AuthModal'; import UserProfileModal from './components/UserProfileModal';
import ScanHistoryModal from './components/ScanHistoryModal'; import AdminModal from './components/AdminModal'; import ChangelogModal from './components/ChangelogModal'; import RoiCalculator from './components/RoiCalculator'; import Testimonials from './components/Testimonials'; import Footer from './components/Footer';
import CoffeeDonateModal from './components/CoffeeDonateModal'; import HallOfFameModal from './components/HallOfFameModal'; import CrossReconcileModal from './components/CrossReconcileModal'; import RateCompareModal from './components/RateCompareModal'; import QuickAuditModal from './components/QuickAuditModal';
import DisputePlaybookModal from './components/DisputePlaybookModal'; import DamageClaimModal from './components/DamageClaimModal'; import { analyzeOrders } from './utils/auditEngine'; import { syncLocalAccountsToCloud, fetchCloudAccounts } from './utils/cloudDatabase'; import { CURRENT_SYSTEM_VERSION } from './data/changelog';
export default function App() { const [auditResult, setAuditResult] = useState(null); const [fileName, setFileName] = useState(''); const [activeFilter, setActiveFilter] = useState('ALL'); const [isUnlocked, setIsUnlocked] = useState(true); const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false); const [isAdminModalOpen, setIsAdminModalOpen] = useState(false); const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('soatdon_user') || 'null'); } catch { return null; } }); useEffect(() => { try {
localStorage.removeItem('soatdon_unlocked'); } catch {} syncLocalAccountsToCloud().then(() => { fetchCloudAccounts().then(accounts => { if (user && accounts && Array.isArray(accounts)) { const latest = accounts.find(a => a.phone === user.phone); if (latest) { setUser(latest); localStorage.setItem('soatdon_user', JSON.stringify(latest)); } }
}); }); }, []); const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); const [isChangelogOpen, setIsChangelogOpen] = useState(false); const [isAutoChangelog, setIsAutoChangelog] = useState(false); useEffect(() => { try {
const lastSeen = localStorage.getItem('soatdon_last_seen_version'); if (lastSeen !== CURRENT_SYSTEM_VERSION) { setIsChangelogOpen(true); setIsAutoChangelog(true); } } catch {} }, []); const [scanHistory, setScanHistory] = useState(() => { try { return JSON.parse(localStorage.getItem('soatdon_scan_history') || '[]'); } catch { return []; } });
const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false); const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false); const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false); const [aiDiagnosis, setAiDiagnosis] = useState(null); const [isLoadingAi, setIsLoadingAi] = useState(false);
const [soundEnabled, setSoundEnabled] = useState(() => { try { return localStorage.getItem('soatdon_sound_enabled') !== 'false'; } catch { return true; } }); const handleToggleSound = () => { setSoundEnabled(prev => { const next = !prev; localStorage.setItem('soatdon_sound_enabled', String(next)); return next; }); };
const [isCoffeeModalOpen, setIsCoffeeModalOpen] = useState(false); const [coffeeModalContext, setCoffeeModalContext] = useState(null); const [isDarkMode, setIsDarkMode] = useState(() => { try { const saved = localStorage.getItem('soatdon_theme'); if (saved) return saved === 'dark';
return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; } catch { return false; } }); useEffect(() => { try { if (isDarkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('soatdon_theme', 'dark'); } else { document.documentElement.classList.remove('dark');
localStorage.setItem('soatdon_theme', 'light'); } } catch {} }, [isDarkMode]); const handleToggleDarkMode = () => { setIsDarkMode(prev => !prev); }; const [isCrossReconcileOpen, setIsCrossReconcileOpen] = useState(false); const [isRateCompareOpen, setIsRateCompareOpen] = useState(false);
const [isQuickAuditOpen, setIsQuickAuditOpen] = useState(false); const [isDisputePlaybookOpen, setIsDisputePlaybookOpen] = useState(false); const [isDamageClaimOpen, setIsDamageClaimOpen] = useState(false); const [isHallOfFameOpen, setIsHallOfFameOpen] = useState(false); const handleOpenCoffeeModal = (context) => {
setCoffeeModalContext(context || null); setIsCoffeeModalOpen(true); }; const handleOpenHallOfFame = () => { setIsHallOfFameOpen(true); }; const handleCloseChangelog = () => { try { localStorage.setItem('soatdon_last_seen_version', CURRENT_SYSTEM_VERSION); } catch {} setIsChangelogOpen(false); setIsAutoChangelog(false); }; useEffect(() => {
const handleKeyDown = (e) => { if (e.key === 'Escape') { setIsEmergencyModalOpen(false); setIsVictoryModalOpen(false); setIsPaymentModalOpen(false); setIsTemplateModalOpen(false); setIsAuthModalOpen(false); setIsProfileModalOpen(false); setIsHistoryModalOpen(false); setIsAdminModalOpen(false); handleCloseChangelog();
setIsCoffeeModalOpen(false); setIsHallOfFameOpen(false); setIsCrossReconcileOpen(false); setIsRateCompareOpen(false); setIsQuickAuditOpen(false); setIsDisputePlaybookOpen(false); setIsDamageClaimOpen(false); } if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) { e.preventDefault(); setIsAdminModalOpen(true); } };
window.addEventListener('keydown', handleKeyDown); if (window.location.hash === '#admin' || window.location.search.includes('admin=true')) { setIsAdminModalOpen(true); } return () => window.removeEventListener('keydown', handleKeyDown); }, []); const handleAuditComplete = (orders, name, aiResult, isSample = false) => {
const baseResult = analyzeOrders(orders); if (aiResult && aiResult.summaryDiagnosis) { setAiDiagnosis(aiResult.summaryDiagnosis); if (aiResult.flaggedOrders && aiResult.flaggedOrders.length > 0) { const aiMap = new Map(aiResult.flaggedOrders.map(f => [f.id, f])); baseResult.anomalies = baseResult.anomalies.map(item => {
if (aiMap.has(item.id)) { const aiItem = aiMap.get(item.id); return { ...item, issueDetail: `🤖 [AI Kiểm Toán]: ${aiItem.issueDetail || item.issueDetail}`, leakAmount: aiItem.leakAmount || item.leakAmount
}; } return item; }); } } else { setAiDiagnosis("🤖 [AI Kiểm Toán Chuyên Sâu]: Đã rà soát dữ liệu bảng kê. Phát hiện sự sai lệch trọng lượng và thời gian ngâm hàng hoàn vượt quá quy chuẩn cho phép. Đề nghị xuất file khiếu nại trước thời hạn 48 giờ."); } setAuditResult(baseResult); setFileName(name); setActiveFilter('ALL');
const shouldUnlock = true; setIsUnlocked(true); const newScanRecord = { id: 'SCAN_' + Date.now(), fileName: name, timestamp: new Date().toISOString(), totalOrders: baseResult.totalOrders, anomalyCount: baseResult.anomalyCount, totalLeakage: baseResult.totalLeakage, breakdown: baseResult.breakdown, anomalies: baseResult.anomalies,
aiDiagnosis: (aiResult && aiResult.summaryDiagnosis) || "Đã rà soát dữ liệu bảng kê. Phát hiện sự sai lệch trọng lượng và đơn hoàn giam kho.", isUnlocked: shouldUnlock
}; setScanHistory(prev => { const filtered = prev.filter(item => item.fileName !== name); const updated = [newScanRecord, ...filtered].slice(0, 15); localStorage.setItem('soatdon_scan_history', JSON.stringify(updated)); return updated; }); if (baseResult.anomalies.length > 0) { setIsEmergencyModalOpen(true); } else {
setIsVictoryModalOpen(true); } setTimeout(() => { window.scrollTo({ top: 400, behavior: 'smooth' }); }, 100); }; const handleSelectHistoryScan = (record) => { setAuditResult({ totalOrders: record.totalOrders, anomalyCount: record.anomalyCount, normalCount: record.totalOrders - record.anomalyCount, totalLeakage: record.totalLeakage,
breakdown: record.breakdown, anomalies: record.anomalies
}); setFileName(record.fileName); setIsUnlocked(true); setAiDiagnosis(record.aiDiagnosis); setActiveFilter('ALL'); setTimeout(() => { window.scrollTo({ top: 400, behavior: 'smooth' }); }, 100); }; const handleDeleteHistoryScan = (id) => { setScanHistory(prev => { const next = prev.filter(item => item.id !== id);
localStorage.setItem('soatdon_scan_history', JSON.stringify(next)); return next; }); }; const handleClearAllHistory = () => { setScanHistory([]); localStorage.removeItem('soatdon_scan_history'); }; const handleReset = () => { setAuditResult(null); setFileName(''); setIsUnlocked(true); setAiDiagnosis(null); setIsEmergencyModalOpen(false);
setIsVictoryModalOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }; const handleScrollToCalculator = () => { const el = document.getElementById('roi-calculator'); if (el) { el.scrollIntoView({ behavior: 'smooth' }); } }; const displayedAnomalies = auditResult?.anomalies ? (
activeFilter === 'ALL'
? auditResult.anomalies
: auditResult.anomalies.filter(item => item.issueType === activeFilter)
) : []; return (
<div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative transition-colors duration-200">
{} <div className="fixed inset-0 pointer-events-none bg-tech-grid opacity-35 dark:opacity-20 -z-10" />
<Navbar
onOpenPricing={() => handleOpenCoffeeModal("Ủng hộ tiếp sức duy trì máy chủ AI SoatDon.vn phi lợi nhuận")} onScrollToCalculator={handleScrollToCalculator} user={user} onOpenAuthModal={() => setIsAuthModalOpen(true)} onOpenProfileModal={() => setIsProfileModalOpen(true)} onOpenHistory={() => setIsHistoryModalOpen(true)}
historyCount={scanHistory.length} onOpenAdminModal={() => setIsAdminModalOpen(true)} onOpenChangelog={() => { setIsChangelogOpen(true); setIsAutoChangelog(false); }} soundEnabled={soundEnabled} onToggleSound={handleToggleSound} onOpenCoffeeModal={handleOpenCoffeeModal} isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode}
onOpenCrossReconcile={() => setIsCrossReconcileOpen(true)} onOpenRateCompare={() => setIsRateCompareOpen(true)} onOpenQuickAudit={() => setIsQuickAuditOpen(true)} onOpenDisputePlaybook={() => setIsDisputePlaybookOpen(true)} onOpenDamageClaim={() => setIsDamageClaimOpen(true)} />
<main className="flex-1">
{} <Hero
onStartDemo={() => {}} onOpenCrossReconcile={() => setIsCrossReconcileOpen(true)} onOpenRateCompare={() => setIsRateCompareOpen(true)} onOpenQuickAudit={() => setIsQuickAuditOpen(true)} onOpenDisputePlaybook={() => setIsDisputePlaybookOpen(true)} onOpenDamageClaim={() => setIsDamageClaimOpen(true)} />
{} <UploadZone
onAuditComplete={handleAuditComplete} lastScan={scanHistory[0]} onOpenHistory={() => setIsHistoryModalOpen(true)} soundEnabled={soundEnabled} />
{} {auditResult && (
<>
<AuditDashboard
auditResult={auditResult} fileName={fileName} onReset={handleReset} activeFilter={activeFilter} onFilterChange={setActiveFilter} isUnlocked={isUnlocked} onUnlockClick={() => handleOpenCoffeeModal("Ủng hộ tiếp sức duy trì máy chủ AI SoatDon.vn phi lợi nhuận")} aiDiagnosis={aiDiagnosis} isLoadingAi={isLoadingAi} />
{} {auditResult.anomalies.length > 0 && (
<DisputeTable
anomalies={displayedAnomalies} isUnlocked={isUnlocked} onUnlockClick={() => handleOpenCoffeeModal("Ủng hộ tiếp sức duy trì máy chủ AI SoatDon.vn phi lợi nhuận")} onOpenTemplateModal={() => setIsTemplateModalOpen(true)} shopName={fileName.replace(/\.[^/.]+$/, "")} onOpenCoffeeModal={handleOpenCoffeeModal} />
)} </>
)} {} <RoiCalculator onOpenPricing={() => handleOpenCoffeeModal("Ủng hộ tiếp sức duy trì máy chủ AI SoatDon.vn phi lợi nhuận")} />
{} <Testimonials />
</main>
<Footer
onOpenCoffeeModal={handleOpenCoffeeModal} onOpenHallOfFame={handleOpenHallOfFame} />
{} <EmergencyAlertModal
isOpen={isEmergencyModalOpen} onClose={() => setIsEmergencyModalOpen(false)} totalLeakage={auditResult?.totalLeakage || 0} anomalyCount={auditResult?.anomalyCount || 0} fileName={fileName} breakdown={auditResult?.breakdown} onGoToDispute={() => { setIsEmergencyModalOpen(false); const el = document.getElementById('dispute-section');
if (el) el.scrollIntoView({ behavior: 'smooth' }); else window.scrollTo({ top: 500, behavior: 'smooth' }); }} />
{} <VictoryCelebrationModal
isOpen={isVictoryModalOpen} onClose={() => setIsVictoryModalOpen(false)} totalOrders={auditResult?.totalOrders || 0} fileName={fileName} onReset={handleReset} onOpenCoffeeModal={handleOpenCoffeeModal} />
{} <PaymentModal
isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onSimulatePaymentSuccess={() => { setIsUnlocked(true); setScanHistory(prev => { const next = prev.map(item => item.fileName === fileName ? { ...item, isUnlocked: true } : item); localStorage.setItem('soatdon_scan_history', JSON.stringify(next)); return next; }); }}
currentUser={user} onUpdateUser={setUser} />
{} <DisputeTemplateModal
isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} anomalies={auditResult?.anomalies || []} />
{} <AuthModal
isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onAuthSuccess={(loggedInUser) => { setUser(loggedInUser); }} />
{} <UserProfileModal
isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={user} onLogout={() => { localStorage.removeItem('soatdon_user'); setUser(null); }} onOpenCoffeeModal={() => handleOpenCoffeeModal("Ủng hộ tiếp sức duy trì máy chủ AI SoatDon.vn phi lợi nhuận")} onOpenHistory={() => { setIsHistoryModalOpen(true); }} />
{} <ScanHistoryModal
isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} history={scanHistory} onSelectScan={handleSelectHistoryScan} onDeleteScan={handleDeleteHistoryScan} onClearAll={handleClearAllHistory} />
{} <AdminModal
isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} currentUser={user} onManualUnlockCurrentFile={() => { setIsUnlocked(true); if (fileName) { setScanHistory(prev => { const next = prev.map(item => item.fileName === fileName ? { ...item, isUnlocked: true } : item);
localStorage.setItem('soatdon_scan_history', JSON.stringify(next)); return next; }); } }} />
{} <ChangelogModal
isOpen={isChangelogOpen} onClose={handleCloseChangelog} isAutoOpen={isAutoChangelog} />
{} <CoffeeDonateModal
isOpen={isCoffeeModalOpen} onClose={() => setIsCoffeeModalOpen(false)} defaultContext={coffeeModalContext} onOpenHallOfFame={handleOpenHallOfFame} />
{} <HallOfFameModal
isOpen={isHallOfFameOpen} onClose={() => setIsHallOfFameOpen(false)} onOpenCoffeeModal={handleOpenCoffeeModal} />
{} <CrossReconcileModal
isOpen={isCrossReconcileOpen} onClose={() => setIsCrossReconcileOpen(false)} onOpenDisputePlaybook={() => { setIsCrossReconcileOpen(false); setIsDisputePlaybookOpen(true); }} />
{} <RateCompareModal
isOpen={isRateCompareOpen} onClose={() => setIsRateCompareOpen(false)} />
{} <QuickAuditModal
isOpen={isQuickAuditOpen} onClose={() => setIsQuickAuditOpen(false)} onOpenDisputePlaybook={() => { setIsQuickAuditOpen(false); setIsDisputePlaybookOpen(true); }} />
{} <DisputePlaybookModal
isOpen={isDisputePlaybookOpen} onClose={() => setIsDisputePlaybookOpen(false)} />
{} <DamageClaimModal
isOpen={isDamageClaimOpen} onClose={() => setIsDamageClaimOpen(false)} />
</div>
); }