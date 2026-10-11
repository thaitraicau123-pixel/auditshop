import React, { useState } from 'react';
import { Star, Quote, CheckCircle2, ShieldCheck, ChevronDown, ChevronUp, HelpCircle, Sparkles } from 'lucide-react';

export default function Testimonials() {
  const [openFaq, setOpenFaq] = useState(null);

  const reviews = [
    {
      name: "Chị Lan Hương",
      role: "Chủ shop thời trang nữ (Hà Nội)",
      platform: "TikTok Shop & GHTK",
      orders: "150 đơn/ngày",
      saved: "Đã cứu lại: 5.850.000 đ",
      avatar: "H",
      color: "from-pink-500 to-rose-500",
      content: "Trước giờ cứ tin tưởng bưu cục, quẳng file đối soát vào một xó. Tháng vừa rồi quét thử mới tá hỏa phát hiện áo thun có 200g mà bị kê lên 850g suốt 3 tuần! Cầm file khiếu nại của web ra bưu cục họ phải hoàn tiền ngay trong 2 ngày."
    },
    {
      name: "Anh Tuấn Minh",
      role: "Kinh doanh phụ kiện điện thoại (TP.HCM)",
      platform: "Shopee & GHN",
      orders: "80 đơn/ngày",
      saved: "Đã cứu lại: 3.420.000 đ",
      avatar: "M",
      color: "from-blue-500 to-indigo-500",
      content: "Cứu nguy nhất là quả đơn hoàn! Mình có 4 đơn giá trị cao bị shipper ngâm gần 2 tuần không hoàn về, nếu không nhờ web báo động đỏ thì quá 14 ngày là sàn từ chối bồi thường luôn. Riêng quả đấy đã cứu lại hơn 3 củ rồi."
    },
    {
      name: "Chị Thảo My",
      role: "Shop Mỹ phẩm xách tay (Đà Nẵng)",
      platform: "Facebook Ads & Viettel Post",
      orders: "50 đơn/ngày",
      saved: "Đã cứu lại: 2.100.000 đ",
      avatar: "T",
      color: "from-purple-500 to-violet-500",
      content: "Tool dùng cực kỳ tiện, kéo file vào là xong chứ ngồi soi Excel bằng mắt thì cận thị mất. Bỏ ra vài chục nghìn mà lấy lại tiền triệu, quá xứng đáng để dùng lâu dài."
    }
  ];

  const FAQS = [
    {
      q: "Dữ liệu bảng kê Excel của tôi có được bảo mật không?",
      a: "Cam kết 100% bảo mật. Toàn bộ thuật toán đọc và đối soát file diễn ra trực tiếp trên trình duyệt của bạn (Client-side in Browser). Hệ thống không lưu trữ bất kỳ thông tin đơn hàng, tên khách hàng hay số điện thoại nào lên máy chủ bên ngoài."
    },
    {
      q: "Bưu cục có chịu hoàn tiền cước chênh lệch và bồi thường đơn hoàn không?",
      a: "Chắc chắn có. Các hãng vận chuyển lớn như GHTK, GHN, Viettel Post, SPX đều có quy chế tiếp nhận khiếu nại đối soát trong vòng 48h - 72h. File Excel khiếu nại và mẫu công văn chuẩn A4 do SoatDon.vn xuất ra có định vị chính xác ô lỗi và tọa độ đối chiếu nên bưu cục bắt buộc phải giải quyết theo hợp đồng."
    },
    {
      q: "Tôi cần gửi khiếu nại bằng cách nào để được duyệt nhanh nhất?",
      a: "Sau khi quét file, bạn chỉ cần bấm nút 'Xuất file Excel khiếu nại (.xlsx)' và sao chép mẫu thư khiếu nại đính kèm. Bạn gửi file này qua nhóm Zalo Chăm sóc khách hàng của bưu cục hoặc email đối soát. Thông thường tiền hoàn sẽ được khấu trừ hoặc chuyển khoản hoàn lại trong 2 - 3 ngày làm việc."
    },
    {
      q: "Shop tôi bán ít đơn (khoảng 20 - 30 đơn/ngày) thì có cần thiết dùng không?",
      a: "Rất cần thiết. Thực tế cho thấy ngay cả các shop quy mô nhỏ cũng thường xuyên bị nhảy nấc cước từ 500g lên 1.2kg do bưu tá cân nhầm trên băng chuyền tự động. Mỗi tháng tích tụ cũng mất từ 600.000đ đến 1.500.000đ — nhiều hơn rất nhiều so với chi phí vài nghìn đồng để kiểm toán."
    }
  ];

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
      {/* Testimonials Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold mb-3 shadow-2xs">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Đánh Giá Thực Tế Từ Khách Hàng (4.9 / 5.0)</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Các chủ shop nói gì sau khi kiểm toán?
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Hơn 1.250 nhà bán hàng trên toàn quốc đã tin tưởng và đòi lại quyền lợi thành công.
        </p>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {reviews.map((rev, idx) => (
          <div 
            key={idx}
            className="bg-white border border-slate-200/90 rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg hover:border-indigo-200 transition-all shadow-xs relative overflow-hidden group"
          >
            <div>
              {/* Rating stars & verified badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Đã đối soát</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 italic mb-6 leading-relaxed">
                "{rev.content}"
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${rev.color} text-white flex items-center justify-center font-black text-xs shadow-xs`}>
                  {rev.avatar}
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-xs sm:text-sm">{rev.name}</div>
                  <div className="text-[11px] text-slate-400">{rev.role}</div>
                </div>
              </div>
              <span className="text-[10px] font-black font-mono px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                {rev.saved}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Frequently Asked Questions (FAQ) Section */}
      <div className="max-w-3xl mx-auto pt-6 border-t border-slate-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Giải Đáp Thắc Mắc Thường Gặp</span>
          </div>
          <h4 className="text-xl sm:text-2xl font-black text-slate-900">
            Câu Hỏi Thường Gặp Của Chủ Shop
          </h4>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-800 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[11px] font-black shrink-0">
                      ?
                    </span>
                    <span>{faq.q}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
