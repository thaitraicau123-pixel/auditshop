import React from 'react';
import { ShieldCheck, MessageCircle, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-10 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
            🛡️
          </div>
          <div>
            <div className="font-bold text-white text-sm">SoatDon.vn</div>
            <p className="text-slate-500 text-[11px]">Hệ thống bảo vệ doanh thu & kiểm toán cước vận chuyển tự động</p>
          </div>
        </div>

        <div className="text-center md:text-right">
          <p className="max-w-md text-[11px] leading-relaxed mb-2 text-slate-400">
            *Lưu ý: SoatDon.vn là công cụ phần mềm độc lập hỗ trợ nhà bán hàng rà soát bảng kê đối soát theo quy chuẩn hợp đồng. Chúng tôi cam kết bảo mật 100% dữ liệu đơn hàng và khách hàng của bạn.
          </p>
          <div className="flex items-center justify-center md:justify-end gap-4 text-slate-400">
            <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hỗ trợ kỹ thuật Zalo: 0988.xxx.xxx</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>support@soatdon.vn</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
