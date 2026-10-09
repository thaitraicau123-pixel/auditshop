import React from 'react';
import { ShieldCheck, MessageCircle, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-indigo-600 flex items-center justify-center font-bold border border-blue-100 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-sm">SoatDon<span className="text-indigo-600">.vn</span></div>
            <p className="text-slate-400 text-[11px]">Hệ thống bảo vệ doanh thu & kiểm toán cước vận chuyển thông minh</p>
          </div>
        </div>

        <div className="text-center md:text-right">
          <p className="max-w-md text-[11px] leading-relaxed mb-2 text-slate-500">
            *Lưu ý: SoatDon.vn là công cụ phần mềm độc lập hỗ trợ nhà bán hàng rà soát bảng kê đối soát theo quy chuẩn hợp đồng. Chúng tôi cam kết bảo mật 100% dữ liệu đơn hàng và khách hàng của bạn.
          </p>
          <div className="flex items-center justify-center md:justify-end gap-4 text-slate-600">
            <a href="https://zalo.me/0986019623" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-indigo-600 transition-colors cursor-pointer font-medium">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hỗ trợ Zalo / Hotline: <b className="text-slate-900">0986019623</b></span>
            </a>
            <span>•</span>
            <span className="flex items-center gap-1 hover:text-indigo-600 transition-colors font-medium">
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              <span>support@soatdon.vn</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
