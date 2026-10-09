import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    {
      name: "Chị Lan Hương",
      role: "Chủ shop thời trang nữ (Hà Nội)",
      platform: "TikTok Shop & GHTK",
      orders: "150 đơn/ngày",
      saved: "Đã cứu lại: 5.850.000 đ",
      content: "Trước giờ cứ tin tưởng bưu cục, quẳng file đối soát vào một xó. Tháng vừa rồi quét thử mới tá hỏa phát hiện áo thun có 200g mà bị kê lên 850g suốt 3 tuần! Cầm file khiếu nại của web ra bưu cục họ phải hoàn tiền ngay trong 2 ngày."
    },
    {
      name: "Anh Tuấn Minh",
      role: "Kinh doanh phụ kiện điện thoại (TP.HCM)",
      platform: "Shopee & GHN",
      orders: "80 đơn/ngày",
      saved: "Đã cứu lại: 3.420.000 đ",
      content: "Cứu nguy nhất là quả đơn hoàn! Mình có 4 đơn giá trị cao bị shipper ngâm gần 2 tuần không hoàn về, nếu không nhờ web báo động đỏ thì quá 14 ngày là sàn từ chối bồi thường luôn. Riêng quả đấy đã cứu lại hơn 3 củ rồi."
    },
    {
      name: "Chị Thảo My",
      role: "Shop Mỹ phẩm xách tay (Đà Nẵng)",
      platform: "Facebook Ads & Viettel Post",
      orders: "50 đơn/ngày",
      saved: "Đã cứu lại: 2.100.000 đ",
      content: "Tool dùng cực kỳ tiện, kéo file vào là xong chứ ngồi soi Excel bằng mắt thì cận thị mất. Tháng bỏ ra 199k mà lấy lại tiền triệu, quá xứng đáng để dùng lâu dài."
    }
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
          Các chủ shop nói gì sau khi kiểm toán?
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Hơn 1.200 nhà bán hàng đã sử dụng và đòi lại quyền lợi thành công.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev, idx) => (
          <div 
            key={idx}
            className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-600 transition-all shadow-xl"
          >
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 italic mb-6 leading-relaxed">
                "{rev.content}"
              </p>
            </div>

            <div className="pt-4 border-t border-slate-700/60">
              <div className="font-bold text-white text-sm">{rev.name}</div>
              <div className="text-xs text-slate-400">{rev.role} • <span className="text-amber-400">{rev.platform}</span></div>
              <div className="mt-2 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md inline-block border border-emerald-500/20">
                {rev.saved}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
