import React, { useState } from 'react';
import { 
  Scale, Clock, Receipt, ShieldAlert, CheckCircle2, 
  HelpCircle, ChevronDown, ChevronUp, BookOpen, AlertTriangle, ArrowRight 
} from 'lucide-react';

export default function Testimonials() {
  const [openFaq, setOpenFaq] = useState(null);

  const traps = [
    {
      id: 1,
      title: "Kê Khống Nấc Cân Nặng",
      subtitle: "Chiêu thức phổ biến nhất",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      icon: Scale,
      iconColor: "text-rose-600 bg-rose-50 border-rose-200",
      problem: "Hàng thời trang, mỹ phẩm thực tế chỉ nặng 250g - 400g nhưng bưu tá nhập tay hoặc cảm biến băng chuyền tự động gán lên 1.2kg - 1.5kg. Cước phí lập tức nhảy vọt từ 18.000 đ lên 42.000 đ/đơn.",
      solution: "Hệ thống tự động quy đổi kích thước thể tích DxRxC (/5000 hoặc /6000) theo chuẩn bưu chính để đối chiếu với nấc cước thực thu, định vị chính xác ô Excel bị tính lố cân."
    },
    {
      id: 2,
      title: "Giam Đơn Hoàn Quá Hạn Khiếu Nại",
      subtitle: "Nguy cơ mất trắng tiền hàng",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      icon: Clock,
      iconColor: "text-amber-600 bg-amber-50 border-amber-200",
      problem: "Khách từ chối nhận, bưu cục ngâm kiện hàng tại kho trung chuyển quá 72h hoặc quá 14 ngày. Khi trả về shop phát hiện bể vỡ, tráo ruột thì bưu cục từ chối bồi thường vì 'đã quá hạn khiếu nại quy định'.",
      solution: "Hệ thống tự động quét mốc thời gian giao thất bại và ngày hoàn thực tế, lập tức gắn cờ cảnh báo đỏ các kiện hoàn vi phạm cam kết SLA để shop lập biên bản bồi thường."
    },
    {
      id: 3,
      title: "Phụ Phí Ảo & Phí Vùng Xa Khống",
      subtitle: "Âm thầm bào mòn lợi nhuận",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: Receipt,
      iconColor: "text-indigo-600 bg-indigo-50 border-indigo-200",
      problem: "Trong hợp đồng nguyên tắc, shop được miễn giảm phụ phí đồng kiểm hoặc phí vùng sâu vùng xa. Tuy nhiên trên bảng kê tổng, hệ thống hãng vẫn tự động cộng 3.000 đ - 12.000 đ/đơn mà mắt thường rất khó phát hiện.",
      solution: "Bóc tách từng cột phụ phí (xăng dầu, ngoại thành, bảo hiểm hàng giá trị cao) đối chiếu với bảng giá cam kết hợp đồng để truy xuất danh sách đơn bị trừ phí vô lý."
    },
    {
      id: 4,
      title: "Lệch Tiền Thu Hộ COD & Bảng Kê Trễ",
      subtitle: "Thất thoát dòng tiền mặt",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      icon: ShieldAlert,
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
      problem: "Shipper đã thu tiền mặt của người nhận và app báo phát thành công, nhưng trên file đối soát tiền COD bị giữ lại, trừ âm hoặc chênh lệch vài chục ngàn do gán nhầm mã đơn hàng khác.",
      solution: "Khớp mã vận đơn (Tracking Number), số tiền COD khai báo và tiền thực chuyển để phát hiện ngay các đơn thu hộ bị thất thoát hoặc chậm quyết toán qua nhiều kỳ."
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
    },
    {
      q: "Website hỗ trợ định dạng file của những đơn vị vận chuyển nào?",
      a: "Hệ thống hỗ trợ chuẩn xác tất cả file bảng kê đối soát Excel (.xlsx, .xls, .csv) của 6 hãng vận chuyển lớn nhất Việt Nam: Giao Hàng Tiết Kiệm (GHTK), Giao Hàng Nhanh (GHN), Viettel Post, Shopee Xpress (SPX), TikTok Shop Logistics và J&T Express."
    }
  ];

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
      {/* Knowledge Guide Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold mb-3 shadow-2xs">
          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
          <span>Cẩm Nang Nghiệp Vụ Đối Soát Vận Chuyển</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          4 Cạm Bẫy Bị Bưu Cục Trừ Oan & Cẩm Nang Tự Vệ
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          Nắm vững quy chế hợp đồng và cơ chế đối soát tự động để bảo vệ trọn vẹn từng đồng lợi nhuận của shop.
        </p>
      </div>

      {/* 4 Traps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
        {traps.map((trap) => {
          const Icon = trap.icon;
          return (
            <div 
              key={trap.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 hover:shadow-md hover:border-indigo-200 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${trap.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                        {trap.id}. {trap.title}
                      </h4>
                      <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${trap.badgeColor}`}>
                        {trap.subtitle}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-slate-700">
                    <span className="font-bold text-rose-900 block mb-1 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Thực trạng bưu cục:</span>
                    </span>
                    <p className="text-[11px] leading-relaxed text-slate-600">
                      {trap.problem}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-slate-700">
                    <span className="font-bold text-emerald-900 block mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Giải pháp đối soát:</span>
                    </span>
                    <p className="text-[11px] leading-relaxed text-slate-600">
                      {trap.solution}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
