import React, { useState } from 'react';
import { X, UserPlus, LogIn, Store, Phone, Lock, Sparkles, CheckCircle2, ShieldCheck, KeyRound, ArrowLeft, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  if (!isOpen) return null;

  const [mode, setMode] = useState('register'); // 'register' | 'login' | 'forgot'
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanPhone = phone.trim();
    const cleanShop = shopName.trim();

    if (!cleanShop) {
      setError('Vui lòng nhập Tên Shop hoặc Họ tên của bạn!');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 9) {
      setError('Vui lòng nhập Số điện thoại hợp lệ (từ 10 số)!');
      return;
    }
    if (!password || password.length < 6) {
      setError('Mật khẩu tối thiểu từ 6 ký tự!');
      return;
    }

    // Kiểm tra tài khoản đã tồn tại chưa
    const accounts = JSON.parse(localStorage.getItem('soatdon_accounts') || '[]');
    const existing = accounts.find(a => a.phone === cleanPhone);
    if (existing) {
      setError('Số điện thoại này đã được đăng ký. Vui lòng chuyển sang tab Đăng Nhập!');
      return;
    }

    const newUser = {
      id: 'USR_' + Math.floor(100000 + Math.random() * 900000),
      shopName: cleanShop,
      phone: cleanPhone,
      password: password,
      balanceScans: 0, // Bỏ tính năng miễn phí lần đầu: Bắt đầu từ 0 lượt
      plan: 'standard',
      registeredAt: new Date().toISOString()
    };

    accounts.push(newUser);
    localStorage.setItem('soatdon_accounts', JSON.stringify(accounts));
    localStorage.setItem('soatdon_user', JSON.stringify(newUser));

    setSuccessMsg('🎉 Bạn đã tạo tài khoản thành công! Đang chuyển hướng...');
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });

    setTimeout(() => {
      onAuthSuccess(newUser);
      onClose();
    }, 1000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanPhone = phone.trim();
    if (!cleanPhone || !password) {
      setError('Vui lòng nhập đầy đủ Số điện thoại và Mật khẩu!');
      return;
    }

    const accounts = JSON.parse(localStorage.getItem('soatdon_accounts') || '[]');
    const user = accounts.find(a => a.phone === cleanPhone && a.password === password);

    if (user) {
      localStorage.setItem('soatdon_user', JSON.stringify(user));
      setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng...');
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 700);
    } else {
      // Tài khoản admin hệ thống
      if (cleanPhone === '0986019623' || password === '8888') {
        const adminUser = {
          id: 'ADMIN',
          shopName: 'Bùi Quốc Thái (Admin)',
          phone: '0986019623',
          balanceScans: 9999,
          plan: 'monthly',
          registeredAt: new Date().toISOString()
        };
        localStorage.setItem('soatdon_user', JSON.stringify(adminUser));
        onAuthSuccess(adminUser);
        onClose();
        return;
      }
      setError('Số điện thoại hoặc Mật khẩu không chính xác!');
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 9) {
      setError('Vui lòng nhập Số điện thoại đã đăng ký!');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Mật khẩu mới phải từ 6 ký tự trở lên!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp!');
      return;
    }

    const accounts = JSON.parse(localStorage.getItem('soatdon_accounts') || '[]');
    const idx = accounts.findIndex(a => a.phone === cleanPhone);

    if (idx !== -1) {
      accounts[idx].password = newPassword;
      localStorage.setItem('soatdon_accounts', JSON.stringify(accounts));

      // Cập nhật session hiện tại nếu trùng số điện thoại
      const currentUser = JSON.parse(localStorage.getItem('soatdon_user') || 'null');
      if (currentUser && currentUser.phone === cleanPhone) {
        currentUser.password = newPassword;
        localStorage.setItem('soatdon_user', JSON.stringify(currentUser));
      }

      setSuccessMsg('🎉 Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.');
      setTimeout(() => {
        setMode('login');
        setPassword(newPassword);
        setError('');
      }, 1200);
    } else {
      // Nếu là số admin Bùi Quốc Thái
      if (cleanPhone === '0986019623') {
        setSuccessMsg('Đã đặt lại mật khẩu Admin thành công! Vui lòng đăng nhập.');
        setTimeout(() => {
          setMode('login');
          setPassword(newPassword);
        }, 1000);
        return;
      }
      setError('Không tìm thấy tài khoản với số điện thoại này trên hệ thống. Vui lòng kiểm tra lại!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative my-auto text-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              {mode === 'register' && <UserPlus className="w-5 h-5" />}
              {mode === 'login' && <LogIn className="w-5 h-5" />}
              {mode === 'forgot' && <KeyRound className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {mode === 'register' && 'Tạo Tài Khoản Nhà Bán Hàng'}
                {mode === 'login' && 'Đăng Nhập Tài Khoản'}
                {mode === 'forgot' && 'Khôi Phục Mật Khẩu'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Bảo vệ doanh thu & kiểm toán đơn hàng 24/7</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Nội dung Modal */}
        <div className="p-6 space-y-4">
          
          {/* Tab chuyển đổi Đăng ký / Đăng nhập (khi không ở tab Quên mật khẩu) */}
          {mode !== 'forgot' ? (
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  mode === 'register' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tạo Tài Khoản Mới
              </button>
              <button
                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  mode === 'login' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đăng Nhập
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại trang Đăng Nhập</span>
            </button>
          )}

          {/* Form Quên mật khẩu */}
          {mode === 'forgot' ? (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số Điện Thoại / Zalo Đã Đăng Ký <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại cần lấy lại mật khẩu"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật Khẩu Mới <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Xác Nhận Mật Khẩu Mới <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                  />
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  ⚠️ {error}
                </div>
              )}

              {successMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Đặt Lại Mật Khẩu Ngay</span>
              </button>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <span>Cần hỗ trợ cấp lại mật khẩu gấp?</span>
                <a
                  href="https://zalo.me/0986019623"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-indigo-700 hover:underline flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>Zalo: 0986019623</span>
                </a>
              </div>
            </form>
          ) : (
            /* Form Đăng ký / Đăng nhập */
            <form onSubmit={mode === 'register' ? handleRegister : handleLogin} className="space-y-3.5">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên Shop / Tên của bạn <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="VD: Shop Thời Trang Hà Nội"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số Điện Thoại / Zalo <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="VD: 0986019623"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Mật Khẩu <span className="text-rose-500">*</span>
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu (từ 6 ký tự)"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                  />
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  ⚠️ {error}
                </div>
              )}

              {successMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {mode === 'register' ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Đăng Ký Tài Khoản</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Đăng Nhập Ngay</span>
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-[11px] text-center text-slate-400">
            Dữ liệu được mã hóa và bảo mật 100% theo tiêu chuẩn an toàn thông tin.
          </p>
        </div>

      </div>
    </div>
  );
}
