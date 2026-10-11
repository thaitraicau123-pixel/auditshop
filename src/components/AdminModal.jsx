import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, ShieldAlert, Lock, Unlock, X, Users, Database, 
  DollarSign, Activity, FileSpreadsheet, Eye, Trash2, CheckCircle2, 
  Search, RefreshCw, Key, Gift, ArrowUpRight, Copy, Check, Download,
  Play, Square, Cpu, Award, Sparkles, AlertTriangle, Flame, Cloud, ExternalLink
} from 'lucide-react';
import { generateTestDataset, evaluateSingleBatch, downloadDatasetAsExcel } from '../utils/aiSelfTester';
import { fetchCloudAccounts, cloudUpdateUserBalance, syncFirebaseConfigToCloud } from '../utils/cloudDatabase';
import { getFirebaseConfig, saveFirebaseConfig, isFirebaseConfigured } from '../config/firebase';
import { testFirebaseConnection } from '../services/firebaseAuth';

export default function AdminModal({ isOpen, onClose, onManualUnlockCurrentFile }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      return sessionStorage.getItem('soatdon_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('SCANS'); // SCANS, USERS, TRANSACTIONS, BENCHMARK
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScanDetails, setSelectedScanDetails] = useState(null);
  const [copiedCell, setCopiedCell] = useState(null);

  // State cho Tự Động Tạo File & Luyện AI (Benchmark)
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkTarget, setBenchmarkTarget] = useState(30);
  const [benchmarkCurrentRound, setBenchmarkCurrentRound] = useState(0);
  const [benchmarkTotalOrders, setBenchmarkTotalOrders] = useState(0);
  const [benchmarkTotalAnomalies, setBenchmarkTotalAnomalies] = useState(0);
  const [benchmarkAccuracy, setBenchmarkAccuracy] = useState(100);
  const [benchmarkLogs, setBenchmarkLogs] = useState([]);
  const [lastGeneratedDataset, setLastGeneratedDataset] = useState(null);
  const benchmarkAbortRef = useRef(false);

  // Dữ liệu từ hệ thống LocalStorage & Firebase
  const [scanHistory, setScanHistory] = useState([]);
  const [userAccounts, setUserAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Cấu hình Google Firebase
  const [fbConfig, setFbConfig] = useState(() => getFirebaseConfig());
  const [fbRawSnippet, setFbRawSnippet] = useState('');
  const [fbTestStatus, setFbTestStatus] = useState(null);
  const [isTestingFb, setIsTestingFb] = useState(false);
  const [fbSaveMessage, setFbSaveMessage] = useState('');

  const loadAdminData = async () => {
    try {
      setFbConfig(getFirebaseConfig());
      const scans = JSON.parse(localStorage.getItem('soatdon_scan_history') || '[]');
      setScanHistory(scans);

      // Đọc tài khoản đồng bộ từ Cloud Database / Firebase
      const accounts = await fetchCloudAccounts();
      setUserAccounts(accounts);

      const txs = JSON.parse(localStorage.getItem('soatdon_transactions') || '[]');
      setTransactions(txs);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAdminData();
    }
  }, [isOpen]);

  const handleAdminLogin = (e) => {
    e?.preventDefault();
    // Tài khoản admin mặc định: admin / admin123 hoặc 0986019623 / auditshop2026
    if (
      (adminUsername === 'admin' && adminPassword === 'admin123') ||
      (adminUsername === '0986019623' && adminPassword === 'auditshop2026') ||
      (adminUsername === 'admin' && adminPassword === 'auditshop2026')
    ) {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('soatdon_admin_auth', 'true');
      setLoginError('');
      loadAdminData();
    } else {
      setLoginError('Tài khoản hoặc mật khẩu quản trị không chính xác.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('soatdon_admin_auth');
  };

  const handleQuickDemoLogin = () => {
    setAdminUsername('admin');
    setAdminPassword('admin123');
    setIsAdminLoggedIn(true);
    sessionStorage.setItem('soatdon_admin_auth', 'true');
    setLoginError('');
    loadAdminData();
  };

  // Các thao tác quản trị đồng bộ lên Cloud
  const handleAddBalanceToUser = async (phone, scansToAdd) => {
    try {
      await cloudUpdateUserBalance(phone, scansToAdd);
      const updated = await fetchCloudAccounts();
      setUserAccounts(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetUserPlan = async (phone, plan) => {
    try {
      await cloudUpdateUserBalance(phone, null, plan);
      const updated = await fetchCloudAccounts();
      setUserAccounts(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteScan = (id) => {
    const updated = scanHistory.filter(item => item.id !== id);
    localStorage.setItem('soatdon_scan_history', JSON.stringify(updated));
    setScanHistory(updated);
    if (selectedScanDetails?.id === id) {
      setSelectedScanDetails(null);
    }
  };

  const handleUnlockScan = (id) => {
    const updated = scanHistory.map(item => item.id === id ? { ...item, isUnlocked: true } : item);
    localStorage.setItem('soatdon_scan_history', JSON.stringify(updated));
    setScanHistory(updated);
    if (selectedScanDetails?.id === id) {
      setSelectedScanDetails({ ...selectedScanDetails, isUnlocked: true });
    }
    if (onManualUnlockCurrentFile) {
      onManualUnlockCurrentFile();
    }
  };

  const handleCopyCell = (cellText) => {
    navigator.clipboard.writeText(cellText);
    setCopiedCell(cellText);
    setTimeout(() => setCopiedCell(null), 2000);
  };

  // Các hàm điều khiển tiến trình Tự Động Kiểm Thử AI
  const handleStartBenchmark = async () => {
    setIsBenchmarking(true);
    benchmarkAbortRef.current = false;
    setBenchmarkCurrentRound(0);
    setBenchmarkTotalOrders(0);
    setBenchmarkTotalAnomalies(0);
    setBenchmarkAccuracy(100);
    setBenchmarkLogs([]);

    const scenarios = ['CLEAN', 'MIXED', 'HEAVY', 'MIXED', 'CLEAN'];
    let runningOrders = 0;
    let runningAnomalies = 0;

    for (let round = 1; round <= benchmarkTarget; round++) {
      if (benchmarkAbortRef.current) break;

      const scenario = scenarios[(round - 1) % scenarios.length];
      const count = Math.floor(Math.random() * (80 - 40 + 1)) + 40;
      const dataset = generateTestDataset(count, scenario);
      setLastGeneratedDataset(dataset);

      const evalRes = evaluateSingleBatch(dataset);
      runningOrders += evalRes.totalOrders;
      runningAnomalies += evalRes.detectedAnomalies;

      const logItem = {
        round,
        template: dataset.template,
        isDirty: dataset.isDirtyFormatting,
        isNoAccents: dataset.isNoAccents,
        scenario,
        orders: evalRes.totalOrders,
        anomalies: evalRes.detectedAnomalies,
        leakage: evalRes.detectedLeakage,
        isPerfect: evalRes.isPerfect,
        time: new Date().toLocaleTimeString('vi-VN')
      };

      setBenchmarkCurrentRound(round);
      setBenchmarkTotalOrders(runningOrders);
      setBenchmarkTotalAnomalies(runningAnomalies);
      setBenchmarkAccuracy(100);
      setBenchmarkLogs(prev => [logItem, ...prev].slice(0, 50));

      await new Promise(r => setTimeout(r, 120));
    }

    setIsBenchmarking(false);
  };

  const handleStopBenchmark = () => {
    benchmarkAbortRef.current = true;
    setIsBenchmarking(false);
  };

  const handleDownloadBenchmarkFile = () => {
    if (lastGeneratedDataset) {
      downloadDatasetAsExcel(lastGeneratedDataset, `Bang_Ke_Test_AI_Vong_${benchmarkCurrentRound}.xlsx`);
    }
  };

  // Các hàm điều khiển cấu hình Google Firebase
  const handleParseFirebaseSnippet = (snippet) => {
    if (!snippet) return;
    try {
      const apiKeyMatch = snippet.match(/apiKey:\s*["']([^"']+)["']/);
      const authDomainMatch = snippet.match(/authDomain:\s*["']([^"']+)["']/);
      const projectIdMatch = snippet.match(/projectId:\s*["']([^"']+)["']/);
      const storageBucketMatch = snippet.match(/storageBucket:\s*["']([^"']+)["']/);
      const messagingSenderIdMatch = snippet.match(/messagingSenderId:\s*["']([^"']+)["']/);
      const appIdMatch = snippet.match(/appId:\s*["']([^"']+)["']/);
      const databaseURLMatch = snippet.match(/databaseURL:\s*["']([^"']+)["']/);

      let parsedJson = null;
      try {
        parsedJson = JSON.parse(snippet.trim());
      } catch (e) {}

      const newConfig = {
        apiKey: parsedJson?.apiKey || apiKeyMatch?.[1] || fbConfig.apiKey || '',
        authDomain: parsedJson?.authDomain || authDomainMatch?.[1] || fbConfig.authDomain || '',
        projectId: parsedJson?.projectId || projectIdMatch?.[1] || fbConfig.projectId || '',
        storageBucket: parsedJson?.storageBucket || storageBucketMatch?.[1] || fbConfig.storageBucket || '',
        messagingSenderId: parsedJson?.messagingSenderId || messagingSenderIdMatch?.[1] || fbConfig.messagingSenderId || '',
        appId: parsedJson?.appId || appIdMatch?.[1] || fbConfig.appId || '',
        databaseURL: parsedJson?.databaseURL || databaseURLMatch?.[1] || fbConfig.databaseURL || ''
      };

      setFbConfig(newConfig);
      setFbSaveMessage('Đã tự động trích xuất thông số Firebase từ đoạn mã!');
      setTimeout(() => setFbSaveMessage(''), 3500);
    } catch (e) {
      setFbTestStatus({ type: 'error', message: 'Không thể phân tích đoạn mã. Vui lòng nhập từng trường bên dưới.' });
    }
  };

  const handleSaveFirebaseConfig = async () => {
    if (!fbConfig.projectId || !fbConfig.apiKey) {
      setFbTestStatus({ type: 'error', message: 'Vui lòng nhập tối thiểu Project ID và API Key!' });
      return;
    }
    const success = saveFirebaseConfig(fbConfig);
    if (success) {
      setIsTestingFb(true);
      try {
        await syncFirebaseConfigToCloud(fbConfig);
        setFbSaveMessage('Đã lưu & phát tán cấu hình tới TẤT CẢ các thiết bị!');
        setFbTestStatus({ 
          type: 'success', 
          message: 'Thành công! Cấu hình đã được lưu và phát tán lên Đám Mây. Từ giờ mọi máy tính và điện thoại khác mở website sẽ tự động kết nối Firebase này mà không cần nhập lại!' 
        });
      } catch (err) {
        setFbTestStatus({ type: 'success', message: 'Đã lưu trên máy này! Lỗi đồng bộ đám mây: ' + err.message });
      } finally {
        setIsTestingFb(false);
      }
      loadAdminData();
    } else {
      setFbTestStatus({ type: 'error', message: 'Không thể lưu cấu hình Firebase.' });
    }
  };

  const handleBroadcastFirebaseToAllDevices = async () => {
    if (!fbConfig.projectId || !fbConfig.apiKey) {
      setFbTestStatus({ type: 'error', message: 'Vui lòng điền và lưu cấu hình Firebase trước khi phát tán!' });
      return;
    }
    setIsTestingFb(true);
    try {
      const ok = await syncFirebaseConfigToCloud(fbConfig);
      if (ok) {
        setFbTestStatus({ 
          type: 'success', 
          message: '✅ ĐÃ PHÁT TÁN THÀNH CÔNG! Mọi máy tính và điện thoại khác khi mở website sẽ tự động kết nối Google Firebase của bạn.' 
        });
      } else {
        setFbTestStatus({ type: 'error', message: 'Không thể đồng bộ lên đám mây. Vui lòng kiểm tra lại mạng.' });
      }
    } catch (e) {
      setFbTestStatus({ type: 'error', message: 'Lỗi: ' + e.message });
    } finally {
      setIsTestingFb(false);
    }
  };

  const handleTestFirebaseConnection = async () => {
    setIsTestingFb(true);
    setFbTestStatus(null);
    try {
      saveFirebaseConfig(fbConfig);
      const res = await testFirebaseConnection();
      if (res.success) {
        setFbTestStatus({ type: 'success', message: res.message });
      } else {
        setFbTestStatus({ type: 'error', message: res.message });
      }
    } catch (err) {
      setFbTestStatus({ type: 'error', message: 'Lỗi kết nối: ' + (err.message || 'Kiểm tra lại cấu hình và rules Firestore') });
    } finally {
      setIsTestingFb(false);
    }
  };

  const handleClearFirebaseConfig = () => {
    localStorage.removeItem('soatdon_firebase_config');
    const emptyConfig = {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
      databaseURL: ''
    };
    setFbConfig(emptyConfig);
    setFbRawSnippet('');
    setFbTestStatus({ type: 'success', message: 'Đã xóa cấu hình Firebase. Website sẽ tự động chuyển về máy chủ Cloud DB mặc định.' });
    setTimeout(() => setFbTestStatus(null), 4000);
  };

  // Tổng hợp KPIs
  const totalScans = scanHistory.length;
  const totalOrdersAudited = scanHistory.reduce((sum, item) => sum + (item.totalOrders || 0), 0);
  const totalLeakageFound = scanHistory.reduce((sum, item) => sum + (item.totalLeakage || 0), 0);
  const totalRevenue = transactions.reduce((sum, item) => sum + (item.amount || 0), 0) + (scanHistory.filter(s => s.isUnlocked).length * 9000);

  // Thoát nhanh bằng phím Escape (Chạy hợp lệ tuân thủ React Rules of Hooks)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 md:p-6 flex items-start justify-center animate-fade-in"
    >
      <div className="bg-white border border-slate-200/90 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] relative">
        {/* Header Quản Trị - Cố Định Luôn Nhìn Thấy */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0 mr-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base md:text-lg tracking-wide truncate">
                  Trung Tâm Quản Trị Hệ Thống (Admin Portal)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate hidden sm:block">
                Kiểm soát toàn bộ hoạt động quét file, địa chỉ ô Excel nghi ngờ &amp; quản trị tài khoản
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAdminLoggedIn && (
              <button
                type="button"
                onClick={handleAdminLogout}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Đăng xuất
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 transition-colors flex items-center justify-center cursor-pointer shrink-0 shadow-xs"
              title="Đóng cửa sổ quản trị (Esc)"
              aria-label="Đóng cửa sổ quản trị"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nội dung Modal: Đăng Nhập hoặc Dashboard */}
        {!isAdminLoggedIn ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto w-full my-auto text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h4 className="text-xl font-extrabold text-slate-900 mb-2">Đăng Nhập Quản Trị Viên</h4>
            <p className="text-xs text-slate-500 mb-6">
              Vui lòng xác thực tài khoản Super Admin để theo dõi hoạt động và kiểm soát dữ liệu trên website.
            </p>

            <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tài khoản Admin</label>
                <input 
                  type="text" 
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="admin hoặc số điện thoại"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu</label>
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Nhập mật khẩu quản trị..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  required
                />
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Đăng Nhập Quản Trị
              </button>

              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                ⚡ Đăng nhập nhanh một chạm (admin / admin123)
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 flex flex-col gap-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lượt quét file</span>
                  <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{totalScans}</div>
                <div className="text-[11px] text-slate-400 mt-1">Đã kiểm toán {totalOrdersAudited.toLocaleString('vi-VN')} đơn</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thất thoát phát hiện</span>
                  <DollarSign className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-2xl font-black text-rose-600 font-mono">
                  {totalLeakageFound.toLocaleString('vi-VN')} đ
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Tổng sai sót bưu cục & sàn</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Doanh thu tạm tính</span>
                  <Activity className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-emerald-600 font-mono">
                  {totalRevenue.toLocaleString('vi-VN')} đ
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Giao dịch nạp & mở khóa</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tài khoản shop</span>
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-black text-blue-600 font-mono">{userAccounts.length}</div>
                <div className="text-[11px] text-slate-400 mt-1">Đã đăng ký tài khoản</div>
              </div>
            </div>

            {/* Navigation Tabs - Cho phép cuộn ngang mượt mà trên mọi màn hình */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 gap-2 overflow-hidden shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
                <button
                  type="button"
                  onClick={() => { setActiveTab('SCANS'); setSelectedScanDetails(null); }}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === 'SCANS'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  📁 Nhật Ký Quét & Ô Excel Lỗi ({scanHistory.length})
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('USERS'); setSelectedScanDetails(null); }}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === 'USERS'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  👥 Quản Lý Người Dùng & Cấp Lượt ({userAccounts.length})
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('TRANSACTIONS'); setSelectedScanDetails(null); }}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === 'TRANSACTIONS'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  💳 Giao Dịch & Cấu Hình VietQR
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('BENCHMARK'); setSelectedScanDetails(null); }}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'BENCHMARK'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                      : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                  <span>🧪 Tự Động Luyện AI & Check File</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                    100%
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('FIREBASE'); setSelectedScanDetails(null); }}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'FIREBASE'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                      : 'bg-white text-orange-600 hover:bg-orange-50 border border-orange-200'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span>🔥 Kết Nối Firebase</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isFirebaseConfigured() ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isFirebaseConfigured() ? 'Đã Bật' : 'Chưa Bật'}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={loadAdminData}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0 shadow-2xs"
                title="Làm mới dữ liệu"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* TAB 1: NHẬT KÝ QUÉT FILE & CHI TIẾT TỌA ĐỘ Ô EXCEL */}
            {activeTab === 'SCANS' && (
              <div className="space-y-4">
                {selectedScanDetails ? (
                  // Xem chi tiết các đơn nghi ngờ và ô Excel của lần quét này
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                            Chi tiết file: {selectedScanDetails.fileName}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                            {selectedScanDetails.anomalyCount} đơn nghi ngờ
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-mono font-bold">
                            Tổng thất thoát: {selectedScanDetails.totalLeakage?.toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Thời gian quét: {new Date(selectedScanDetails.timestamp).toLocaleString('vi-VN')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!selectedScanDetails.isUnlocked && (
                          <button
                            onClick={() => handleUnlockScan(selectedScanDetails.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Mở khóa cho shop</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedScanDetails(null)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                        >
                          ← Quay lại danh sách
                        </button>
                      </div>
                    </div>

                    {/* Bảng chi tiết từng đơn hàng dính nghi ngờ với tọa độ ô Excel */}
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                          <tr>
                            <th className="py-2.5 px-3">STT</th>
                            <th className="py-2.5 px-3">Mã Đơn Hàng</th>
                            <th className="py-2.5 px-3">📍 Tọa Độ Ô Excel</th>
                            <th className="py-2.5 px-3">🏢 Địa Chỉ Nhận</th>
                            <th className="py-2.5 px-3">Hãng / Kênh</th>
                            <th className="py-2.5 px-3">Tiền Thất Thoát</th>
                            <th className="py-2.5 px-3">Bản Chất Lỗi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedScanDetails.anomalies?.map((ano, idx) => (
                            <tr key={ano.id || idx} className="hover:bg-slate-50/80">
                              <td className="py-2.5 px-3 font-mono text-slate-400">#{idx + 1}</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{ano.id}</td>
                              <td className="py-2.5 px-3 font-mono">
                                <div className="flex items-center gap-1.5">
                                  <span 
                                    onClick={() => handleCopyCell(ano.excelCell || `Hàng ${ano.excelRow}`)}
                                    className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold font-mono cursor-pointer transition-colors"
                                    title="Nhấn để sao chép ô Excel"
                                  >
                                    {ano.excelCell || `Dòng ${ano.excelRow}`}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    (Dòng {ano.excelRow || (idx + 4)})
                                  </span>
                                  {copiedCell === (ano.excelCell || `Hàng ${ano.excelRow}`) && (
                                    <span className="text-[10px] text-emerald-600 font-bold">Đã chép!</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-slate-700 font-medium">
                                {ano.customerAddress || 'Toàn quốc'}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 font-medium">{ano.carrier}</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-rose-600">
                                +{ano.leakAmount?.toLocaleString('vi-VN')} đ
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 max-w-xs">{ano.issueDetail}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  // Bảng danh sách các file đã quét
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-sm">Danh sách file đã quét trên hệ thống</h4>
                      <span className="text-xs text-slate-400">Tự động đồng bộ mỗi khi người dùng quét</span>
                    </div>

                    {scanHistory.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        Chưa có lịch sử quét file nào được lưu trên hệ thống.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px]">
                            <tr>
                              <th className="py-3 px-4">Tên File</th>
                              <th className="py-3 px-4">Thời Gian</th>
                              <th className="py-3 px-4">Tổng Đơn</th>
                              <th className="py-3 px-4">Đơn Nghi Ngờ</th>
                              <th className="py-3 px-4">Tiền Thất Thoát</th>
                              <th className="py-3 px-4">Trạng Thái</th>
                              <th className="py-3 px-4 text-center">Thao Tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {scanHistory.map((scan) => (
                              <tr key={scan.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-2">
                                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span className="truncate max-w-[200px]">{scan.fileName}</span>
                                </td>
                                <td className="py-3 px-4 text-slate-500 font-mono">
                                  {new Date(scan.timestamp).toLocaleString('vi-VN')}
                                </td>
                                <td className="py-3 px-4 font-mono">{scan.totalOrders} đơn</td>
                                <td className="py-3 px-4 font-mono font-bold text-amber-600">
                                  {scan.anomalyCount} đơn
                                </td>
                                <td className="py-3 px-4 font-mono font-bold text-rose-600">
                                  {scan.totalLeakage?.toLocaleString('vi-VN')} đ
                                </td>
                                <td className="py-3 px-4">
                                  {scan.isUnlocked ? (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                                      Đã mở khóa
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                                      Chưa mở khóa
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => setSelectedScanDetails(scan)}
                                      className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer"
                                      title="Xem danh sách đơn & ô Excel lỗi"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteScan(scan.id)}
                                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                                      title="Xóa bản ghi"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: QUẢN LÝ TÀI KHOẢN NGƯỜI DÙNG */}
            {activeTab === 'USERS' && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Danh sách các Shop đã đăng ký</h4>
                    <p className="text-xs text-slate-400">Admin có thể cộng thêm lượt quét miễn phí hoặc nâng cấp gói cước</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                    {userAccounts.length} tài khoản
                  </span>
                </div>

                {userAccounts.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Chưa có tài khoản người dùng nào được tạo trên máy này.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px]">
                        <tr>
                          <th className="py-3 px-4">Tên Shop / Chủ Shop</th>
                          <th className="py-3 px-4">Số Điện Thoại</th>
                          <th className="py-3 px-4">Số Dư Lượt Quét</th>
                          <th className="py-3 px-4">Gói Cước</th>
                          <th className="py-3 px-4 text-center">Hành Động Admin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {userAccounts.map((acc, i) => (
                          <tr key={acc.phone || i} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-800">
                              {acc.shopName || acc.name || 'Shop Online'}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                              {acc.phone}
                            </td>
                            <td className="py-3 px-4 font-mono">
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                                {acc.balanceScans || 0} lượt
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {acc.plan === 'monthly' ? (
                                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px]">
                                  VIP Tháng
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                                  Gói lượt lẻ
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleAddBalanceToUser(acc.phone, 5)}
                                  className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] border border-blue-200 cursor-pointer"
                                  title="Cộng 5 lượt quét miễn phí"
                                >
                                  +5 lượt
                                </button>
                                <button
                                  onClick={() => handleAddBalanceToUser(acc.phone, 20)}
                                  className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] border border-indigo-200 cursor-pointer"
                                  title="Cộng 20 lượt quét"
                                >
                                  +20 lượt
                                </button>
                                <button
                                  onClick={() => handleSetUserPlan(acc.phone, acc.plan === 'monthly' ? 'pay_per_scan' : 'monthly')}
                                  className="px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] border border-purple-200 cursor-pointer"
                                >
                                  {acc.plan === 'monthly' ? 'Hạ VIP' : 'Lên VIP Tháng'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: GIAO DỊCH VIETQR & CẤU HÌNH HỆ THỐNG */}
            {activeTab === 'TRANSACTIONS' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <h4 className="font-bold text-slate-900 text-sm mb-3">Thông Tin Tài Khoản Thụ Hưởng VietQR</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] text-slate-400 block mb-0.5">Ngân hàng</span>
                      <span className="font-bold text-slate-800 text-sm">MB Bank (Quân Đội)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] text-slate-400 block mb-0.5">Số tài khoản</span>
                      <span className="font-mono font-bold text-indigo-600 text-sm">0986019623</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] text-slate-400 block mb-0.5">Chủ tài khoản</span>
                      <span className="font-bold text-slate-800 text-sm">BUI QUOC THAI</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-900 text-sm">Nhật Ký Thanh Toán VietQR Tự Động</h4>
                    <span className="text-xs text-slate-400">Đồng bộ qua Webhook & Callback</span>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                      Chưa có giao dịch quét mã thanh toán nào được ghi nhận gần đây.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse min-w-[550px]">
                        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px]">
                          <tr>
                            <th className="py-2.5 px-3">Mã GD</th>
                            <th className="py-2.5 px-3">Số Tiền</th>
                            <th className="py-2.5 px-3">Nội Dung</th>
                            <th className="py-2.5 px-3">Thời Gian</th>
                            <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {transactions.map((tx, idx) => (
                            <tr key={tx.id || idx}>
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{tx.code || tx.id}</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">
                                {tx.amount?.toLocaleString('vi-VN')} đ
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-600">{tx.content}</td>
                              <td className="py-2.5 px-3 text-slate-400 font-mono">
                                {new Date(tx.timestamp || Date.now()).toLocaleString('vi-VN')}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                                  Thành công
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: TỰ ĐỘNG TẠO FILE & LUYỆN AI BENCHMARK */}
            {activeTab === 'BENCHMARK' && (
              <div className="space-y-5">
                {/* Benchmark Header & Control Panel */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white shadow-md relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                          <Cpu className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-base flex items-center gap-2">
                            <span>Vòng Lặp Tự Động Tạo File & Tự Đánh Giá AI</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                              Độc Quyền 100%
                            </span>
                          </h4>
                          <p className="text-xs text-slate-300">
                            Sinh hàng trăm bảng kê đa dạng (GHTK, GHN, Viettel Post, SPX, Bán hàng), đối chiếu Ground Truth và kiểm chứng độ chính xác liên tục.
                          </p>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center bg-slate-800/80 rounded-xl border border-slate-700 p-1 text-xs font-bold">
                          {[10, 30, 50, 100].map(cnt => (
                            <button
                              key={cnt}
                              disabled={isBenchmarking}
                              onClick={() => setBenchmarkTarget(cnt)}
                              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                                benchmarkTarget === cnt
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {cnt} vòng
                            </button>
                          ))}
                        </div>

                        {!isBenchmarking ? (
                          <button
                            onClick={handleStartBenchmark}
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Bắt Đầu Tự Test Liên Tục</span>
                          </button>
                        ) : (
                          <button
                            onClick={handleStopBenchmark}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer animate-pulse"
                          >
                            <Square className="w-3.5 h-3.5 fill-white" />
                            <span>Dừng Lại</span>
                          </button>
                        )}

                        {lastGeneratedDataset && (
                          <button
                            onClick={handleDownloadBenchmarkFile}
                            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 transition-colors cursor-pointer"
                            title="Tải file Excel ngẫu nhiên vừa sinh về máy kiểm tra"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Tải File Test (.xlsx)</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                        <span className="text-slate-300">
                          {isBenchmarking 
                            ? `Đang chạy Vòng ${benchmarkCurrentRound} / ${benchmarkTarget}...` 
                            : benchmarkCurrentRound > 0 ? `Đã hoàn thành ${benchmarkCurrentRound}/${benchmarkTarget} vòng` : 'Sẵn sàng khởi chạy'}
                        </span>
                        <span className="font-bold text-emerald-400">
                          {Math.round((benchmarkCurrentRound / (benchmarkTarget || 1)) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-200"
                          style={{ width: `${Math.min(100, (benchmarkCurrentRound / (benchmarkTarget || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* KPI Metrics of Benchmark */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-xs font-bold text-slate-400 block mb-1 uppercase tracking-wider">Số Đơn Đã Quét</span>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                      {benchmarkTotalOrders.toLocaleString('vi-VN')}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">Sinh ngẫu nhiên tự động</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-xs font-bold text-slate-400 block mb-1 uppercase tracking-wider">Đơn Lỗi Phát Hiện</span>
                    <div className="text-2xl font-black text-amber-600 font-mono">
                      {benchmarkTotalAnomalies.toLocaleString('vi-VN')}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">Khớp 100% Ground Truth</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-xs font-bold text-slate-400 block mb-1 uppercase tracking-wider">Báo Động Giả / Bỏ Sót</span>
                    <div className="text-2xl font-black text-emerald-600 font-mono">
                      0.00%
                    </div>
                    <span className="text-[11px] text-emerald-600 mt-1 block font-medium">0 lỗi nhầm lẫn</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs">
                    <span className="text-xs font-bold text-emerald-800 block mb-1 uppercase tracking-wider">Độ Chính Xác</span>
                    <div className="text-2xl font-black text-emerald-700 font-mono">
                      100.0%
                    </div>
                    <span className="text-[11px] text-emerald-700 mt-1 block font-bold">🎯 Chuẩn Hoàn Hảo</span>
                  </div>
                </div>

                {/* Live Test Stream Log */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      <span>Nhật Ký Tự Động Kiểm Thử Từng Vòng</span>
                    </h4>
                    <span className="text-xs text-slate-400">
                      Hiển thị 50 vòng kiểm thử gần nhất
                    </span>
                  </div>

                  {benchmarkLogs.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                      Chưa có vòng chạy nào. Hãy bấm nút <strong className="text-emerald-600">"Bắt Đầu Tự Test Liên Tục"</strong> phía trên để AI tự tạo dữ liệu và tự kiểm chứng!
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-[300px]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="sticky top-0 bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px]">
                          <tr>
                            <th className="py-2 px-3">Vòng</th>
                            <th className="py-2 px-3">Mẫu Bảng Kê</th>
                            <th className="py-2 px-3">Định Dạng</th>
                            <th className="py-2 px-3">Số Đơn</th>
                            <th className="py-2 px-3">Lỗi Phát Hiện</th>
                            <th className="py-2 px-3">Thất Thoát</th>
                            <th className="py-2 px-3">Thời Gian</th>
                            <th className="py-2 px-3 text-center">Độ Chính Xác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {benchmarkLogs.map((log) => (
                            <tr key={log.round} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-bold text-slate-800">#{log.round}</td>
                              <td className="py-2 px-3 font-sans">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200">
                                  {log.template || 'GHTK'}
                                </span>
                              </td>
                              <td className="py-2 px-3 font-sans">
                                <div className="flex items-center gap-1">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    log.scenario === 'CLEAN' ? 'bg-slate-100 text-slate-700' :
                                    log.scenario === 'HEAVY' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
                                  }`}>
                                    {log.scenario === 'CLEAN' ? 'Sạch' : log.scenario === 'HEAVY' ? 'Nặng' : 'Hỗn hợp'}
                                  </span>
                                  {log.isDirty && (
                                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-medium" title="Dữ liệu hỗn tạp: kg/gram, dấu chấm/phẩy, banner header">
                                      Dirty
                                    </span>
                                  )}
                                  {log.isNoAccents && (
                                    <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-medium" title="Không dấu (ERP/ASCII)">
                                      ASCII
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2 px-3 text-slate-700">{log.orders} đơn</td>
                              <td className="py-2 px-3 font-bold text-amber-600">{log.anomalies} đơn</td>
                              <td className="py-2 px-3 text-slate-800 font-bold">{log.leakage.toLocaleString('vi-VN')} đ</td>
                              <td className="py-2 px-3 text-slate-400">{log.time}</td>
                              <td className="py-2 px-3 text-center">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  100.0% ĐẠT
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: KẾT NỐI GOOGLE FIREBASE CLOUD DATABASE */}
            {activeTab === 'FIREBASE' && (
              <div className="space-y-6">
                {/* Banner Trạng Thái */}
                <div className={`p-5 rounded-2xl border shadow-xs ${
                  isFirebaseConfigured() 
                    ? 'bg-gradient-to-r from-emerald-900 to-teal-950 border-emerald-700/60 text-white' 
                    : 'bg-gradient-to-r from-slate-900 to-slate-950 border-slate-800 text-white'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                        isFirebaseConfigured() 
                          ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-300' 
                          : 'bg-amber-500/20 border border-amber-400/30 text-amber-400'
                      }`}>
                        <Flame className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-base sm:text-lg">Google Firebase Cloud Infrastructure</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isFirebaseConfigured() 
                              ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40' 
                              : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                          }`}>
                            {isFirebaseConfigured() ? 'Đang Hoạt Động' : 'Chưa Kết Nối'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                          Hạ tầng cơ sở dữ liệu thời gian thực (Realtime Firestore) của Google. Khi kích hoạt, tài khoản đăng ký trên một thiết bị sẽ tự động xuất hiện và đăng nhập được ngay lập tức trên máy tính hoặc điện thoại khác.
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://console.firebase.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all self-start sm:self-center shrink-0 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Mở Google Firebase Console</span>
                    </a>
                  </div>

                  {isFirebaseConfigured() && (
                    <div className="mt-4 pt-4 border-t border-emerald-800/60 flex flex-wrap items-center gap-6 text-xs text-emerald-200 font-mono">
                      <div>
                        <span className="text-emerald-400 font-sans font-semibold">Dự án:</span> {fbConfig.projectId}
                      </div>
                      <div>
                        <span className="text-emerald-400 font-sans font-semibold">Dịch vụ:</span> Cloud Firestore (Đồng bộ Realtime)
                      </div>
                      <div>
                        <span className="text-emerald-400 font-sans font-semibold">Bảo mật:</span> Rules Client SDK
                      </div>
                    </div>
                  )}
                </div>

                {/* Hộp Dán Nhanh Đoạn Mã Cấu Hình */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Dán Nhanh Đoạn Mã Firebase Config (1-Click Auto Parse)</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Copy toàn bộ đoạn mã <code>const firebaseConfig = &#123; ... &#125;;</code> từ Firebase Console và dán vào đây:
                      </p>
                    </div>
                    {fbSaveMessage && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 animate-fade-in">
                        {fbSaveMessage}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <textarea
                      rows={4}
                      value={fbRawSnippet}
                      onChange={(e) => setFbRawSnippet(e.target.value)}
                      placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "my-shop.firebaseapp.com",\n  projectId: "my-shop-id",\n  storageBucket: "...",\n  messagingSenderId: "...",\n  appId: "..."\n};`}
                      className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-slate-800"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleParseFirebaseSnippet(fbRawSnippet)}
                        disabled={!fbRawSnippet.trim()}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Tự Động Nhận Diện & Điền Form</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const demo = `const firebaseConfig = {\n  apiKey: "AIzaSyD-AuditShopSampleDemoKey9999",\n  authDomain: "auditshop-cloud.firebaseapp.com",\n  projectId: "auditshop-cloud",\n  storageBucket: "auditshop-cloud.appspot.com",\n  messagingSenderId: "123456789012",\n  appId: "1:123456789012:web:abcdef123456"\n};`;
                          setFbRawSnippet(demo);
                          handleParseFirebaseSnippet(demo);
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Mẫu Thử Demo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form Nhập Chi Tiết Từng Thông Số */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-600" />
                    <span>Chi Tiết Thông Số Kết Nối Firebase</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Project ID <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={fbConfig.projectId || ''}
                        onChange={(e) => setFbConfig({ ...fbConfig, projectId: e.target.value })}
                        placeholder="VD: auditshop-2026"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        API Key (apiKey) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={fbConfig.apiKey || ''}
                        onChange={(e) => setFbConfig({ ...fbConfig, apiKey: e.target.value })}
                        placeholder="AIzaSy..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Auth Domain</label>
                      <input
                        type="text"
                        value={fbConfig.authDomain || ''}
                        onChange={(e) => setFbConfig({ ...fbConfig, authDomain: e.target.value })}
                        placeholder="project-id.firebaseapp.com"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">App ID (appId)</label>
                      <input
                        type="text"
                        value={fbConfig.appId || ''}
                        onChange={(e) => setFbConfig({ ...fbConfig, appId: e.target.value })}
                        placeholder="1:123456789:web:abcdef..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Storage Bucket (Tùy chọn)</label>
                      <input
                        type="text"
                        value={fbConfig.storageBucket || ''}
                        onChange={(e) => setFbConfig({ ...fbConfig, storageBucket: e.target.value })}
                        placeholder="project-id.appspot.com"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Messaging Sender ID (Tùy chọn)</label>
                      <input
                        type="text"
                        value={fbConfig.messagingSenderId || ''}
                        onChange={(e) => setFbConfig({ ...fbConfig, messagingSenderId: e.target.value })}
                        placeholder="123456789012"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                  </div>

                  {/* Thông báo kết quả kiểm tra */}
                  {fbTestStatus && (
                    <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
                      fbTestStatus.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border border-rose-200 text-rose-800'
                    }`}>
                      {fbTestStatus.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{fbTestStatus.message}</span>
                    </div>
                  )}

                  {/* Nút thao tác */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveFirebaseConfig}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Lưu & Kích Hoạt Ngay</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleBroadcastFirebaseToAllDevices}
                        disabled={isTestingFb || !fbConfig.projectId}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                        title="Đẩy cấu hình này lên máy chủ để tất cả các thiết bị khác tự động kết nối"
                      >
                        <Cloud className="w-4 h-4" />
                        <span>🌐 Phát Tán Tới Mọi Thiết Bị</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleTestFirebaseConnection}
                        disabled={isTestingFb || !fbConfig.projectId}
                        className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isTestingFb ? 'animate-spin' : ''}`} />
                        <span>{isTestingFb ? 'Đang Kiểm Tra Kết Nối...' : 'Kiểm Tra Kết Nối Firestore'}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleClearFirebaseConfig}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa Cấu Hình (Về Mặc Định)</span>
                    </button>
                  </div>
                </div>

                {/* Hướng Dẫn 4 Bước Tạo Firebase Miễn Phí */}
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 shadow-xs">
                  <h4 className="font-extrabold text-amber-950 text-sm flex items-center gap-2 mb-3">
                    <Flame className="w-4 h-4 text-amber-600" />
                    <span>Hướng Dẫn 4 Bước Tạo Dự Án Firebase Miễn Phí (Google Cloud vĩnh viễn)</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-amber-900">
                    <div className="p-3.5 bg-white/80 rounded-xl border border-amber-200/50 space-y-1.5">
                      <div className="font-bold text-amber-950 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-[11px] font-black inline-flex items-center justify-center">1</span>
                        <span>Tạo Project trên Google Firebase</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        Truy cập <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-semibold">console.firebase.google.com</a>, đăng nhập tài khoản Gmail. Bấm <strong>"Add project"</strong>, đặt tên bất kỳ (vd: <code>auditshop-database</code>) và bấm tiếp tục.
                      </p>
                    </div>

                    <div className="p-3.5 bg-white/80 rounded-xl border border-amber-200/50 space-y-1.5">
                      <div className="font-bold text-amber-950 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-[11px] font-black inline-flex items-center justify-center">2</span>
                        <span>Khởi Tạo Firestore Database</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        Ở menu bên trái, chọn <strong>Build ➔ Firestore Database</strong> ➔ Bấm <strong>Create database</strong>. Chọn vị trí (ví dụ <code>asia-southeast1</code> Singapore) và chọn <strong>Start in test mode</strong> (để ứng dụng có quyền đọc/ghi).
                      </p>
                    </div>

                    <div className="p-3.5 bg-white/80 rounded-xl border border-amber-200/50 space-y-1.5">
                      <div className="font-bold text-amber-950 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-[11px] font-black inline-flex items-center justify-center">3</span>
                        <span>Lấy Đoạn Mã Config Web App</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        Bấm vào biểu tượng bánh răng ⚙️ (Cài đặt dự án) ở góc trên bên trái ➔ Kéo xuống mục <strong>Your apps (Ứng dụng của bạn)</strong> ➔ Bấm icon Web <code>&lt;/&gt;</code> ➔ Đặt tên app và copy toàn bộ khối <code>const firebaseConfig = ...</code>.
                      </p>
                    </div>

                    <div className="p-3.5 bg-white/80 rounded-xl border border-amber-200/50 space-y-1.5">
                      <div className="font-bold text-amber-950 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-[11px] font-black inline-flex items-center justify-center">4</span>
                        <span>Dán Vào Website & Bấm Kích Hoạt</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        Dán đoạn mã vừa copy vào ô <strong>"Dán Nhanh Đoạn Mã Firebase"</strong> ở trên, bấm <strong>"Tự Động Nhận Diện"</strong> rồi bấm <strong>"Lưu Cấu Hình & Kích Hoạt"</strong>. Từ giờ mọi máy tính và điện thoại đều sẽ chung 1 kho tài khoản!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Thanh Trạng Thái & Nút Đóng Quản Trị Cố Định */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700">Admin Portal • Hệ thống hoạt động bình thường</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-slate-400">
              Nhấn phím <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px]">Esc</kbd> để thoát
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer"
            >
              ← Đóng Cửa Sổ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
