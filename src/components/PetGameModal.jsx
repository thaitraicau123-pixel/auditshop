import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Heart, Trophy, Award, Coffee, 
  Flame, Crown, Star, ThumbsUp, ChevronRight, Gift, 
  ShieldCheck, Search, Zap, Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  getPetData, savePetData, PET_RANKS, 
  getHallOfFameList, addSupporterToHallOfFame 
} from '../utils/petGameEngine';
import { sounds } from '../utils/soundEffects';

export default function PetGameModal({ 
  isOpen, 
  onClose, 
  onOpenCoffeeModal,
  initialTab = 'PET' // 'PET' | 'HALL'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [pet, setPet] = useState(() => getPetData());
  const [hallOfFame, setHallOfFame] = useState(() => getHallOfFameList());
  const [rankFilter, setRankFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [petReaction, setPetReaction] = useState(null);
  const [isCatchingGame, setIsCatchingGame] = useState(false);
  const [catchScore, setCatchScore] = useState(0);

  // Đồng bộ khi mở modal
  useEffect(() => {
    if (isOpen) {
      setPet(getPetData());
      setHallOfFame(getHallOfFameList());
      if (initialTab) setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Thoát nhanh bằng phím Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentRank = PET_RANKS.find(r => r.level === pet.level) || PET_RANKS[0];
  const nextRank = PET_RANKS.find(r => r.level === pet.level + 1) || null;
  const currentLevelBaseExp = currentRank.requiredExp;
  const nextLevelExp = nextRank ? nextRank.requiredExp : (currentRank.requiredExp * 1.5);
  const expProgressPct = Math.min(100, Math.round(((pet.exp || 0) / nextLevelExp) * 100));

  // Hành động: Cho ăn bằng đơn hàng
  const handleFeedOrderFood = () => {
    if ((pet.foodTokens || 0) <= 0) {
      setPetReaction("Hết thức ăn hạt rồi! Hãy tải file bảng kê lên soát đơn để tích lũy thêm hạt nhé! 📦🍖");
      return;
    }

    const updated = {
      ...pet,
      foodTokens: Math.max(0, pet.foodTokens - 1),
      exp: (pet.exp || 0) + 25,
      hunger: Math.min(100, (pet.hunger || 50) + 15),
      happiness: Math.min(100, (pet.happiness || 50) + 10)
    };

    if (nextRank && updated.exp >= nextRank.requiredExp && updated.level < nextRank.level) {
      updated.level = nextRank.level;
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      sounds.playVictory();
      setPetReaction(`🎉 Oa! Cún & Mèo đã chính thức TIẾN HÓA lên cấp ${updated.level} [${nextRank.title}]! 👑`);
    } else {
      sounds.playVictory();
      setPetReaction("🍖 Gâu gâu! Ăn hạt thơm quá! Cún & Mèo được nạp năng lượng sẵn sàng soi cước tiếp! 🐶✨");
    }

    setPet(updated);
    savePetData(updated);
  };

  // Hành động: Vuốt ve
  const handlePetAction = () => {
    const updated = {
      ...pet,
      happiness: Math.min(100, (pet.happiness || 50) + 15),
      exp: (pet.exp || 0) + 10
    };
    sounds.playVictory();
    setPet(updated);
    savePetData(updated);
    setPetReaction("❤️ Meo meo~ Cún vẫy đuôi tít mù, mèo nằm ườn đòi vuốt ve tiếp nè chủ shop ơi! 🐱🐶");
  };

  // Mini clicker: Bắt đền bưu cục
  const startCatchGame = () => {
    setIsCatchingGame(true);
    setCatchScore(0);
    setPetReaction("🎯 Bắt đầu! Nhấp chuột vào các kiện hàng nghi vấn để cún mèo tóm gọn bưu cục cân lố cước!");
  };

  const handleCatchPackage = () => {
    const newScore = catchScore + 1;
    setCatchScore(newScore);
    sounds.playVictory();

    if (newScore >= 3) {
      setIsCatchingGame(false);
      const updated = {
        ...pet,
        exp: (pet.exp || 0) + 60,
        happiness: 100
      };
      setPet(updated);
      savePetData(updated);
      confetti({ particleCount: 50, spread: 60 });
      setPetReaction("🏆 Tuyệt đỉnh! Bạn và Cún Mèo đã tóm gọn 3 đơn hàng kê khống, nhận ngay +60 EXP! 🌟");
    }
  };

  // Lọc Bảng Vàng (Bảo vệ an toàn chống lỗi null/undefined)
  const filteredHall = (hallOfFame || []).filter(item => {
    if (!item) return false;
    const matchRank = rankFilter === 'ALL' || item.rank === rankFilter;
    const itemName = (item.name || '').toLowerCase();
    const itemNote = (item.note || '').toLowerCase();
    const q = (searchTerm || '').toLowerCase().trim();
    const matchSearch = !q || itemName.includes(q) || itemNote.includes(q);
    return matchRank && matchSearch;
  });

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-fadeIn font-sans"
    >
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-2xl w-full shadow-2xl relative my-auto max-h-[92vh] flex flex-col text-slate-800 overflow-hidden">
        
        {/* Header Cố Định (Sticky Header) - Dấu X luôn nổi bật, không bao giờ bị cắt */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-5 sm:px-6 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              {activeTab === 'PET' ? '🐾' : '🏆'}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                {activeTab === 'PET' ? 'Nông Trại Cún & Mèo Soi Đơn' : 'Bảng Vàng Tri Ân Cộng Đồng Shop'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {activeTab === 'PET' ? 'Nuôi pet dựa theo lượng đơn soát & điểm tiếp sức donate' : 'Vinh danh các nhà bán hàng hảo tâm tiếp sức duy trì server'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              title="Đóng (Phím Esc)"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Switcher */}
        <div className="px-5 sm:px-6 py-2 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-2 shrink-0">
          <div className="grid grid-cols-2 p-1 bg-slate-200/60 rounded-xl text-xs font-bold w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('PET')}
              className={`px-4 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'PET'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🐶🐱 Nuôi Thú Cưng</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px]">Lv.{pet.level}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('HALL')}
              className={`px-4 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'HALL'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🏆 Bảng Vàng Tri Ân</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 text-[10px]">{hallOfFame.length}</span>
            </button>
          </div>

          {onOpenCoffeeModal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCoffeeModal("💖 Tiếp sức nuôi cún mèo & Ghi danh Bảng Vàng Tri Ân!");
              }}
              className="hidden sm:flex text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white items-center gap-1 shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Tiếp Sức Donate</span>
            </button>
          )}
        </div>

        {/* Nội dung có thể cuộn */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {activeTab === 'PET' ? (
            /* TAB 1: MINI-GAME NUÔI THÚ CƯNG */
            <div className="space-y-4">
              
              {/* Pet Showcase Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-indigo-50/80 via-white to-amber-50/60 border border-indigo-100 shadow-xs relative overflow-hidden text-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-indigo-200 text-indigo-900 text-xs font-bold shadow-2xs mb-3">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span>Cấp {pet.level}: {currentRank.title} {currentRank.icon}</span>
                </div>

                {/* Animated Mascot Duo */}
                <div className="flex items-center justify-center gap-6 my-2">
                  <div className="relative group cursor-pointer" onClick={handlePetAction} title="Bấm để vuốt ve Cún!">
                    <div className="text-6xl animate-pet-wag transition-transform group-hover:scale-125">🐶</div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 mt-1 block">
                      Cún Soi Cước
                    </span>
                  </div>

                  <div className="text-2xl text-slate-300 font-light">♥</div>

                  <div className="relative group cursor-pointer" onClick={handlePetAction} title="Bấm để vuốt ve Mèo!">
                    <div className="text-6xl animate-pet-bounce transition-transform group-hover:scale-125">🐱</div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 mt-1 block">
                      Mèo Thần Tài
                    </span>
                  </div>
                </div>

                {/* Pet Speech Reaction */}
                {petReaction && (
                  <div className="mt-3 p-2.5 rounded-2xl bg-amber-100/80 border border-amber-200 text-xs font-semibold text-amber-950 animate-scaleUp max-w-md mx-auto">
                    {petReaction}
                  </div>
                )}

                {/* EXP Level Progress Bar */}
                <div className="mt-4 max-w-md mx-auto text-left">
                  <div className="flex justify-between items-center text-xs mb-1 font-bold text-slate-700">
                    <span>Kinh nghiệm tiến hóa (EXP):</span>
                    <span className="font-mono text-indigo-700">{pet.exp} / {nextLevelExp} EXP ({expProgressPct}%)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 transition-all duration-500 rounded-full"
                      style={{ width: `${expProgressPct}%` }}
                    />
                  </div>
                </div>

                {/* Hunger & Happiness Indicators */}
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mt-3 text-left">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <span>🍖 Độ no:</span>
                    </div>
                    <span className="font-mono text-xs font-black text-amber-600">{pet.hunger}%</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <span>💖 Vui vẻ:</span>
                    </div>
                    <span className="font-mono text-xs font-black text-rose-600">{pet.happiness}%</span>
                  </div>
                </div>
              </div>

              {/* Pet Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Cho ăn hạt từ đơn hàng */}
                <button
                  type="button"
                  onClick={handleFeedOrderFood}
                  className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200 text-left transition-all hover:-translate-y-0.5 cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl group-hover:scale-110 transition-transform">🍖</span>
                    <span className="font-mono text-[11px] font-black px-1.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                      Còn {pet.foodTokens || 0} hạt
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-900">Thưởng Thức Ăn Đơn</div>
                  <div className="text-[10px] text-emerald-800">Tích lũy từ đơn soát (+25 EXP)</div>
                </button>

                {/* 2. Vuốt ve cún mèo */}
                <button
                  type="button"
                  onClick={handlePetAction}
                  className="p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100/90 border border-rose-200 text-left transition-all hover:-translate-y-0.5 cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl group-hover:scale-110 transition-transform">🐾</span>
                    <span className="text-[10px] font-bold text-rose-700">Miễn phí</span>
                  </div>
                  <div className="font-bold text-xs text-slate-900">Vuốt Ve Cún & Mèo</div>
                  <div className="text-[10px] text-rose-800">Tăng độ vui vẻ (+10 EXP)</div>
                </button>

                {/* 3. Thưởng Pate / Donate */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenCoffeeModal) {
                      onOpenCoffeeModal("🥩 Thưởng Bò Wagyu & Hộp Pate xịn sò tiếp sức cún mèo!");
                    }
                  }}
                  className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100/90 border border-amber-200 text-left transition-all hover:-translate-y-0.5 cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl group-hover:scale-110 transition-transform">🥩</span>
                    <span className="text-[10px] font-bold text-amber-800 font-mono">Bảng Vàng VIP</span>
                  </div>
                  <div className="font-bold text-xs text-slate-900">Thưởng Pate / Cà Phê</div>
                  <div className="text-[10px] text-amber-800">Donate tiếp sức (+500 EXP)</div>
                </button>
              </div>

              {/* Mini clicker game */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-left text-xs">
                  <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>🎯 Mini Game: Bắt Đền Kê Khống Nấc Cân</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Click nhanh để cún mèo tóm gọn 3 kiện hàng bị bưu cục tính lố cước, nhận ngay 60 EXP!
                  </p>
                </div>

                {!isCatchingGame ? (
                  <button
                    type="button"
                    onClick={startCatchGame}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
                  >
                    Chơi Thử Ngay
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCatchPackage}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-xs animate-bounce shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <span>📦 Tóm Ngay! ({catchScore}/3)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Đơn hàng đã cho ăn:</span>
                  <b className="font-mono text-slate-800 text-sm">{pet.totalOrdersFed || 0} đơn</b>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Tiền tiếp sức nuôi pet:</span>
                  <b className="font-mono text-amber-600 text-sm">{(pet.totalDonated || 0).toLocaleString('vi-VN')} đ</b>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block text-[10px]">Danh hiệu hiện tại:</span>
                  <b className="text-indigo-700 text-xs truncate block">{currentRank.title}</b>
                </div>
              </div>

            </div>
          ) : (
            /* TAB 2: BẢNG VÀNG TRI ÂN CỘNG ĐỒNG */
            <div className="space-y-4">
              
              {/* Header Banner Bảng Vàng */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-md shadow-amber-500/20 text-center relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-2 text-2xl shadow-inner">
                    🏆
                  </div>
                  <h4 className="text-lg sm:text-xl font-black tracking-tight">
                    BẢNG VÀNG TRI ÂN NHÀ BÁN HÀNG
                  </h4>
                  <p className="text-xs text-amber-100 max-w-md mx-auto mt-1 leading-relaxed">
                    Vinh danh và gửi lời cảm ơn sâu sắc nhất tới các chủ Shop hảo tâm đã chung tay mời ly cà phê tiếp sức máy chủ AI SoatDon.vn!
                  </p>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {[
                    { key: 'ALL', label: 'Tất cả' },
                    { key: 'DIAMOND', label: '💎 Kim Cương (≥100k)' },
                    { key: 'GOLD', label: '🥇 Vàng (50k)' },
                    { key: 'SILVER', label: '🥈 Bạc (25k)' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setRankFilter(tab.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        rankFilter === tab.key
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm tên shop..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Danh sách Nhà Tài Trợ */}
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {filteredHall.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Chưa tìm thấy shop nào phù hợp với bộ lọc.
                  </div>
                ) : (
                  filteredHall.map((donor, idx) => {
                    const isDiamond = donor.rank === 'DIAMOND';
                    const isGold = donor.rank === 'GOLD';
                    const isSilver = donor.rank === 'SILVER';

                    return (
                      <div 
                        key={donor.id || idx}
                        className={`p-3.5 rounded-2xl border transition-all flex items-start sm:items-center justify-between gap-3 ${
                          isDiamond
                            ? 'bg-gradient-to-r from-amber-50/80 to-yellow-50/60 border-amber-300 shadow-xs'
                            : isGold
                              ? 'bg-slate-50 border-amber-200'
                              : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${
                            isDiamond
                              ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-white'
                              : isGold
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {idx < 3 ? (idx === 0 ? '🥇' : (idx === 1 ? '🥈' : '🥉')) : '👑'}
                          </div>
                          
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                                {donor.name}
                              </span>
                              {isDiamond && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[9px] font-black uppercase">
                                  Kim Cương 💎
                                </span>
                              )}
                              {isGold && (
                                <span className="px-1.5 py-0.2 rounded bg-yellow-100 text-yellow-800 text-[9px] font-black uppercase">
                                  Tài Trợ Vàng
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 italic mt-0.5 leading-relaxed">
                              "{donor.note}"
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-mono font-black text-amber-700 text-xs sm:text-sm">
                            {Number(donor.amount).toLocaleString('vi-VN')} đ
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(donor.timestamp).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Nút Tiếp sức ghi danh */}
              {onOpenCoffeeModal && (
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="text-left text-amber-900">
                    <b className="block">Shop muốn xuất hiện trên Bảng Vàng Tri Ân?</b>
                    <span className="text-[11px] text-amber-800">Chỉ cần ủng hộ từ 1 ly cà phê muối 25k, tên shop sẽ lập tức được vinh danh!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCoffeeModal("🏆 Tiếp sức cà phê & Ghi danh vào Bảng Vàng Tri Ân!");
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    Mời Cà Phê & Ghi Danh
                  </button>
                </div>
              )}

            </div>
          )}

          {/* Nút Quay Lại Rõ Ràng Cho Người Lỡ Bấm Nhầm */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>← Đóng cửa sổ & Quay lại web (Esc)</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
