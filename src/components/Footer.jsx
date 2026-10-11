import React from 'react';
import { ShieldCheck, MessageCircle, Mail, Coffee, Heart, Trophy, Sparkles, ExternalLink, Phone } from 'lucide-react';

export default function Footer({ onOpenCoffeeModal, onOpenHallOfFame }) {
  return (
    <footer className="border-t border-slate-200/90 bg-white pt-12 pb-10 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100">
          
          {/* Col 1: Brand & Security Pledge */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-bold shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-black text-slate-900 text-base tracking-tight">
                  SoatDon<span className="text-indigo-600">.vn</span>
                </div>
                <p className="text-slate-400 text-[11px] font-medium">Bảo vệ doanh thu & kiểm toán logistics</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Giải pháp AI kiểm toán độc lập dành riêng cho các nhà bán hàng online tại Việt Nam. Tự động rà soát sai lệch cước, ngâm đơn hoàn và đòi lại từng đồng bị trừ oan.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bảo mật 100% Client-Side Encryption</span>
            </div>
          </div>

          {/* Col 2: Core Capabilities */}
          <div>
            <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Tính Năng Cốt Lõi
            </h5>
            <ul className="space-y-2 text-slate-500 text-[11px]">
              <li className="hover:text-indigo-600 cursor-pointer transition-colors">
                • Thẩm định nấc cân nặng (DxRxC quy đổi)
              </li>
              <li className="hover:text-indigo-600 cursor-pointer transition-colors">
                • Báo động đỏ đơn hoàn ngâm quá hạn 72h
              </li>
              <li className="hover:text-indigo-600 cursor-pointer transition-colors">
                • Đối soát tiền thu hộ COD & phụ phí vùng xa
              </li>
              <li className="hover:text-indigo-600 cursor-pointer transition-colors">
                • Xuất biên bản khiếu nại định dạng chuẩn A4/PDF
              </li>
              <li className="hover:text-indigo-600 cursor-pointer transition-colors">
                • Tương thích GHTK, GHN, Viettel Post, SPX, TikTok
              </li>
            </ul>
          </div>

          {/* Col 3: Community & Gamification */}
          <div>
            <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Cộng Đồng & Tri Ân
            </h5>
            <div className="space-y-2">

              {onOpenHallOfFame && (
                <button
                  type="button"
                  onClick={() => onOpenHallOfFame()}
                  className="w-full text-left inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50/80 hover:bg-amber-100 text-amber-900 border border-amber-200/90 font-bold text-xs transition-all shadow-2xs cursor-pointer group"
                  title="Xem Bảng Vàng Tri Ân các shop hảo tâm"
                >
                  <span className="text-base group-hover:scale-110 transition-transform">🏆</span>
                  <span>Bảng Vàng Tri Ân Shop</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onOpenCoffeeModal?.("Ủng hộ duy trì máy chủ AI và cập nhật thuật toán SoatDon.vn")}
                className="w-full text-left inline-flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-900 border border-amber-200 font-bold text-xs transition-all shadow-2xs cursor-pointer group"
                title="Mời đội ngũ phát triển 1 ly cà phê muối tiếp sức duy trì máy chủ"
              >
                <span className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-amber-600 group-hover:rotate-12 transition-transform" />
                  <span>Mời dev cà phê muối ☕</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              </button>
            </div>
          </div>

          {/* Col 4: Support & Hotline */}
          <div>
            <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Hỗ Trợ & Liên Hệ
            </h5>
            <div className="space-y-2.5 text-[11px] text-slate-600">
              <a 
                href="https://zalo.me/0986019623" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 border border-slate-200 hover:border-emerald-200 transition-colors font-bold cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zalo Hỗ Trợ: 0986.019.623</span>
              </a>

              <div className="flex items-center gap-2 px-2 text-slate-500">
                <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Email: support@soatdon.vn</span>
              </div>

              <div className="flex items-center gap-2 px-2 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Thời gian trực: 24/7 (Cả T7 & CN)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p className="text-center md:text-left max-w-xl">
            *Lưu ý: SoatDon.vn là nền tảng phần mềm độc lập hỗ trợ nhà bán hàng rà soát bảng kê đối soát theo quy chuẩn hợp đồng. Dữ liệu xử lý an toàn 100% trên trình duyệt.
          </p>
          <div className="font-medium text-slate-500">
            © 2026 SoatDon.vn • Phát triển vì quyền lợi cộng đồng Shop Online Việt Nam
          </div>
        </div>

      </div>
    </footer>
  );
}

function Clock({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
