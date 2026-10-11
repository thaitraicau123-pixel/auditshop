import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, X, MessageCircle } from 'lucide-react';

export default function PetCompanionWidget({ onOpenCoffeeModal }) {
  const [activeSpeech, setActiveSpeech] = useState(null);
  const [activePet, setActivePet] = useState('dog'); // 'dog' or 'cat'
  const [isMinimized, setIsMinimized] = useState(false);

  const DOG_QUOTES = [
    "Gâu gâu! Shop cứ yên tâm đăng đơn, để cún đánh hơi xem bưu cục nào dám kê khống nấc cân! 🐶🔎",
    "Gâu! Đơn nào ngâm hàng hoàn quá 72h là cún sủa báo động ngay để shop đòi bồi thường! 🐶🚨",
    "Gâu gâu! Cún bảo vệ từng đồng doanh thu cho shop, không để rơi rớt một xu! 🐶🛡️",
    "Gâu! Hôm nay shop gói hàng nhớ chụp ảnh nấc cân làm bằng chứng cho cún nha! 🐶📦"
  ];

  const CAT_QUOTES = [
    "Meo meo! Chúc shop hôm nay bão đơn nghìn lượt, tiền COD về tài khoản đủ 100%! 🐱💰",
    "Meo~ Mèo thần tài vừa tính toán: Cước phí phải chuẩn từng đồng mới chịu nha! 🐱🧮",
    "Meo meo! Đòi lại được tiền trừ oan từ bưu cục thì nhớ thưởng dev ly cà phê muối nha chủ shop! 🐱☕",
    "Meo! Shop buôn may bán đắt, khách nhận hàng đều tay không hoàn không hủy nha! 🐱✨"
  ];

  const handlePetClick = (pet) => {
    setActivePet(pet);
    const quotes = pet === 'dog' ? DOG_QUOTES : CAT_QUOTES;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setActiveSpeech(randomQuote);
  };

  // Tự động tắt bong bóng thoại sau 6 giây
  useEffect(() => {
    if (activeSpeech) {
      const timer = setTimeout(() => {
        setActiveSpeech(null);
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [activeSpeech]);

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className="p-2.5 rounded-full bg-white border border-slate-200 shadow-lg hover:shadow-xl text-lg flex items-center gap-1 hover:scale-110 transition-all cursor-pointer group"
          title="Mở thú cưng đồng hành (Cún 🐶 & Mèo 🐱)"
        >
          <span className="animate-pet-wag">🐶</span>
          <span className="animate-pet-bounce">🐱</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
      {/* Bong bóng thoại vui nhộn */}
      {activeSpeech && (
        <div className="mb-2 max-w-xs sm:max-w-sm p-3.5 rounded-2xl bg-white border-2 border-indigo-200 text-slate-800 text-xs shadow-xl relative animate-scaleUp">
          <button
            onClick={() => setActiveSpeech(null)}
            className="absolute top-1.5 right-1.5 text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          
          <div className="flex items-start gap-2 pr-4">
            <span className="text-xl shrink-0">
              {activePet === 'dog' ? '🐶' : '🐱'}
            </span>
            <div className="leading-relaxed font-medium">
              <span className="font-extrabold text-indigo-700 block mb-0.5">
                {activePet === 'dog' ? 'Cún Soi Cước bảo vệ shop:' : 'Mèo Thần Tài chúc shop:'}
              </span>
              <span>{activeSpeech}</span>
            </div>
          </div>

          {/* Mũi nhọn bong bóng thoại */}
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r-2 border-b-2 border-indigo-200 transform rotate-45" />
        </div>
      )}

      {/* Thanh Pet Dock Mini */}
      <div className="flex items-center gap-2 p-1.5 px-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-indigo-500/10 hover:shadow-2xl transition-all">
        {/* Nút bé Cún */}
        <button
          type="button"
          onClick={() => handlePetClick('dog')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs group"
          title="Bấm để Cún Soi Cước sủa lời bảo vệ doanh thu!"
        >
          <span className="text-lg group-hover:animate-pet-wag inline-block">🐶</span>
          <span className="text-[11px] hidden sm:inline">Cún Soi Cước</span>
        </button>

        {/* Nút bé Mèo */}
        <button
          type="button"
          onClick={() => handlePetClick('cat')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs group"
          title="Bấm để Mèo Thần Tài chiêu lộc bão đơn!"
        >
          <span className="text-lg group-hover:animate-pet-bounce inline-block">🐱</span>
          <span className="text-[11px] hidden sm:inline">Mèo Thần Tài</span>
        </button>

        {/* Nút Mời Cà Phê Siêu Cute */}
        {onOpenCoffeeModal && (
          <button
            type="button"
            onClick={() => onOpenCoffeeModal("🐱☕ Mèo & Cún xin mời dev ly cà phê muối tiếp sức duy trì máy chủ SoatDon.vn nha!")}
            className="p-1.5 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs flex items-center gap-1"
            title="Mời dev ly cà phê"
          >
            <span>☕</span>
            <span className="text-[10px] hidden md:inline">Mời Cà Phê</span>
          </button>
        )}

        {/* Nút thu nhỏ */}
        <button
          onClick={() => setIsMinimized(true)}
          className="p-1 text-slate-300 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors ml-0.5"
          title="Thu nhỏ thanh thú cưng"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
