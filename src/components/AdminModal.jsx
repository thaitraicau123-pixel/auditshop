import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, Lock, Unlock, X, Users, Database, 
  DollarSign, Activity, FileSpreadsheet, Eye, Trash2, CheckCircle2, 
  Search, RefreshCw, Key, Gift, ArrowUpRight, Copy, Check, Download
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('SCANS'); // SCANS, USERS, TRANSACTIONS
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScanDetails, setSelectedScanDetails] = useState(null);
  const [copiedCell, setCopiedCell] = useState(null);

  // Dữ liệu từ hệ thống LocalStorage
  const [scanHistory, setScanHistory] = useState([]);
  const [userAccounts, setUserAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const loadAdminData = () => {
    try {
      const scans = JSON.parse(localStorage.getItem('soatdon_scan_history') || '[]');
      setScanHistory(scans);

      const accounts = JSON.parse(localStorage.getItem('soatdon_accounts') || '[]');
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

  // Các thao tác quản trị
  const handleAddBalanceToUser = (phone, scansToAdd) => {
    try {
      const accounts = JSON.parse(localStorage.getItem('soatdon_accounts') || '[]');
      const updated = accounts.map(acc => {
        if (acc.phone === phone) {
          return {
            ...acc,
            balanceScans: (acc.balanceScans || 0) + scansToAdd
          };
        }
        return acc;
      });
      localStorage.setItem('soatdon_accounts', JSON.stringify(updated));
      setUserAccounts(updated);

      // Cập nhật người dùng hiện tại nếu trùng số điện thoại
      const currentUser = JSON.parse(localStorage.getItem('soatdon_user') || 'null');
      if (currentUser && currentUser.phone === phone) {
        const nextCur = { ...currentUser, balanceScans: (currentUser.balanceScans || 0) + scansToAdd };
        localStorage.setItem('soatdon_user', JSON.stringify(nextCur));
      }
    } catch (e) {}
  };

  const handleSetUserPlan = (phone, plan) => {
    try {
      const accounts = JSON.parse(localStorage.getItem('soatdon_accounts') || '[]');
      const updated = accounts.map(acc => {
        if (acc.phone === phone) {
          return {
            ...acc,
            plan: plan
          };
        }
        return acc;
      });
      localStorage.setItem('soatdon_accounts', JSON.stringify(updated));
      setUserAccounts(updated);

      const currentUser = JSON.parse(localStorage.getItem('soatdon_user') || 'null');
      if (currentUser && currentUser.phone === phone) {
        const nextCur = { ...currentUser, plan: plan };
        localStorage.setItem('soatdon_user', JSON.stringify(nextCur));
      }
    } catch (e) {}
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

  // Tổng hợp KPIs
  const totalScans = scanHistory.length;
  const totalOrdersAudited = scanHistory.reduce((sum, item) => sum + (item.totalOrders || 0), 0);
  const totalLeakageFound = scanHistory.reduce((sum, item) => sum + (item.totalLeakage || 0), 0);
  const totalRevenue = transactions.reduce((sum, item) => sum + (item.amount || 0), 0) + (scanHistory.filter(s => s.isUnlocked).length * 9000);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Quản Trị */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg tracking-wide">Trung Tâm Quản Trị Hệ Thống (Admin Portal)</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Kiểm soát toàn bộ hoạt động quét file, địa chỉ ô Excel nghi ngờ & quản trị tài khoản
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminLoggedIn && (
              <button
                onClick={handleAdminLogout}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Đăng xuất
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
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

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setActiveTab('SCANS'); setSelectedScanDetails(null); }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'SCANS'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  📁 Nhật Ký Quét & Ô Excel Lỗi ({scanHistory.length})
                </button>

                <button
                  onClick={() => { setActiveTab('USERS'); setSelectedScanDetails(null); }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'USERS'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  👥 Quản Lý Người Dùng & Cấp Lượt ({userAccounts.length})
                </button>

                <button
                  onClick={() => { setActiveTab('TRANSACTIONS'); setSelectedScanDetails(null); }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'TRANSACTIONS'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  💳 Giao Dịch & Cấu Hình VietQR
                </button>
              </div>

              <button
                onClick={loadAdminData}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
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
                      <table className="w-full text-left text-xs border-collapse">
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
                        <table className="w-full text-left text-xs border-collapse">
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
                    <table className="w-full text-left text-xs border-collapse">
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
                      <table className="w-full text-left text-xs border-collapse">
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
          </div>
        )}
      </div>
    </div>
  );
}
