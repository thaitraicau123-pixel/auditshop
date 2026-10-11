/**
 * Dữ liệu nhật ký cập nhật hệ thống (Changelog & Release Notes)
 * Lưu trữ phiên bản, thời gian phát hành và toàn bộ tính năng mới đã thêm.
 */

export const CURRENT_SYSTEM_VERSION = 'v2.8';

export const CHANGELOG_HISTORY = [
  {
    version: 'v2.8',
    releaseDate: '11/10/2026 - 19:40',
    title: '✨ Đại Tu Toàn Diện Trải Nghiệm Người Dùng (UI/UX 2.0) & Holographic Radar Scanner',
    isCurrent: true,
    badges: ['Holographic Scanner', 'Web Audio FX', 'Carrier Ranking', 'Smart Filter', 'Print PDF'],
    summary: 'Cải tiến mạnh mẽ giao diện SaaS cao cấp, hiệu ứng quét AI Holographic Radar HUD, âm thanh sinh động Web Audio, biểu đồ phân bổ tổn thất, bảng xếp hạng rủi ro hãng vận chuyển, công cụ lọc & tìm kiếm đơn bất thường tức thì, và tính năng In Biên Bản Khiếu Nại chuẩn A4/PDF gửi bưu cục.',
    categories: [
      {
        name: 'Giao diện & Hiệu ứng tương tác đỉnh cao',
        tag: 'UI/UX',
        color: 'emerald',
        items: [
          {
            title: 'Holographic Radar Scanner HUD',
            desc: 'Hiệu ứng tia quét radar xoay tròn công nghệ cao, % tiến độ quét mượt mà cùng checklist 4 giai đoạn đối soát trực quan.'
          },
          {
            title: 'Hệ thống Âm thanh Web Audio API sinh động',
            desc: 'Tích hợp âm thanh báo động thất thoát tiền (Alert Sound) và âm thanh vinh danh chiến thắng (Victory Sound) khi bảng kê hoàn hảo 100%. Nút bật/tắt âm thanh tiện lợi trên thanh Navbar.'
          },
          {
            title: 'Bộ 7 Bảng Kê Mẫu Thực Tế 1-Click',
            desc: 'Cho phép dùng thử tức thì bảng kê của GHTK, GHN, Viettel Post, Shopee Xpress, TikTok Shop, Mẫu Chuẩn không lỗi và Mẫu Full 300 đơn mà không cần chuẩn bị file trước.'
          }
        ]
      },
      {
        name: 'Trực quan hóa & Phân tích chuyên sâu',
        tag: 'ANALYTICS',
        color: 'indigo',
        items: [
          {
            title: 'Biểu đồ Phân bổ Thất thoát Segmented Bar',
            desc: 'Trực quan hóa tỷ lệ % đóng góp của 4 nhóm lỗi (Kê cân, Ngâm hoàn, Phụ phí ảo, Lệch COD) với tooltip số liệu chi tiết.'
          },
          {
            title: 'Bảng xếp hạng Hãng vận chuyển gây thất thoát (Carrier Ranking)',
            desc: 'Xếp hạng các đơn vị vận chuyển gây thiệt hại nhiều nhất cho shop, kèm tỷ lệ % và số đơn bị lỗi theo từng hãng.'
          },
          {
            title: 'Chỉ số Sức khỏe Logistics (Shop Health Score /100)',
            desc: 'Đánh giá mức độ an toàn của bảng kê theo thang điểm 100 với nhãn trạng thái Ổn định, Cảnh báo hoặc Nguy cơ cao.'
          }
        ]
      },
      {
        name: 'Công cụ tác nghiệp thực chiến',
        tag: 'WORKFLOW',
        color: 'amber',
        items: [
          {
            title: 'Tìm kiếm tức thì & Bộ lọc ĐVVC thông minh',
            desc: 'Tìm nhanh theo mã vận đơn, tên khách, vị trí ô Excel (vd: E14); lọc theo từng hãng và sắp xếp theo tiền thất thoát giảm dần.'
          },
          {
            title: 'Phân trang bảng đơn mượt mà (Pagination)',
            desc: 'Trình bày gọn gàng 15 đơn/trang, hỗ trợ chuyển trang nhanh, tương thích hoàn hảo trên điện thoại di động.'
          },
          {
            title: 'In Biên Bản Khiếu Nại Trang Trọng & Xuất PDF',
            desc: 'Xuất công văn khiếu nại định dạng chuẩn A4 có quốc hiệu, tiêu đề, nội dung và nơi ký tên đóng dấu gửi Giám đốc bưu cục.'
          }
        ]
      }
    ]
  },
  {
    version: 'v2.7',
    releaseDate: '11/10/2026 - 16:00',
    title: '🔥 Tích Hợp Google Firebase Cloud & Đồng Bộ Đa Thiết Bị Quốc Tế',
    isCurrent: false,
    badges: ['Google Firebase', 'Cloud Firestore', 'Realtime Sync', 'Đa Thiết Bị'],
    summary: 'Tích hợp cơ sở dữ liệu Google Cloud Firestore trực tiếp vào hệ sinh thái. Hỗ trợ 1-click kết nối Firebase từ Admin Portal, tự động đồng bộ realtime tài khoản, số dư lượt quét và gói cước trên mọi thiết bị máy tính và điện thoại thông minh.',
    categories: [
      {
        name: 'Hạ tầng Google Firebase Cloud',
        tag: 'FIREBASE',
        color: 'amber',
        items: [
          {
            title: 'Cơ sở dữ liệu Google Cloud Firestore',
            desc: 'Đồng bộ tài khoản, mật khẩu, số dư và gói VIP trên mạng lưới máy chủ Google Cloud toàn cầu với độ trễ tính bằng mili-giây.'
          },
          {
            title: 'Trung tâm Quản trị Kết nối Firebase 1-Click',
            desc: 'Bổ sung tab "🔥 Kết Nối Firebase" trong Admin Portal: Dán nhanh đoạn mã cấu hình firebaseConfig, tự động trích xuất thông số, kiểm tra kết nối Firestore trực tiếp và hướng dẫn 4 bước tạo dự án Google miễn phí.'
          },
          {
            title: 'Hệ thống Cơ sở dữ liệu Kép (Dual-Cloud Resilience)',
            desc: 'Hoạt động song song và tương thích ngược hoàn hảo giữa Google Firestore và Cloud DB Serverless, đảm bảo người dùng luôn đăng nhập thông suốt ở mọi nơi.'
          }
        ]
      }
    ]
  },
  {
    version: 'v2.6',
    releaseDate: '11/10/2026 - 15:35',
    title: 'Siêu Cập Nhật: Đồng Bộ Đa Thiết Bị & Hệ Thống AI Tự Luyện 100%',
    isCurrent: false,
    badges: ['Cloud Database', 'AI Engine 2.0', 'Tự Test Hoàn Hảo'],
    summary: 'Nâng cấp toàn diện cơ sở dữ liệu đám mây đa thiết bị và trang bị cỗ máy AI tự động sinh bảng kê & tự sửa lỗi đạt độ chính xác 100%.',
    categories: [
      {
        name: 'Tính năng mới cốt lõi',
        tag: 'NEW FEATURE',
        color: 'emerald',
        items: [
          {
            title: 'Đồng bộ tài khoản Đa Thiết Bị (Cross-Device Cloud Sync)',
            desc: 'Tài khoản tạo trên máy tính này lập tức đăng nhập được trên máy tính khác hoặc điện thoại mà không bị giới hạn trong bộ nhớ cục bộ. Số dư lượt quét và gói VIP được đồng bộ theo thời gian thực.'
          },
          {
            title: 'Bảng Thông Báo Cập Nhật Tự Động (System Changelog)',
            desc: 'Tự động hiển thị thông báo mỗi khi hệ thống có bản nâng cấp mới, ghi nhận rõ thời gian và chi tiết các tính năng đã thêm.'
          },
          {
            title: 'Cỗ máy AI Tự Tạo Bảng Kê & Tự Sửa Lỗi (Self-Audit Loop)',
            desc: 'AI tự sinh hàng ngàn đơn hàng trên 6 mẫu hãng lớn (GHTK, GHN, Viettel Post, SPX, TikTok, Kế Toán Bán Hàng) với dữ liệu hỗn tạp (Dirty Data: kg/gram, 25.000 đ, banner công ty) để tự kiểm toán liên tục đạt 100.0% accuracy.'
          }
        ]
      },
      {
        name: 'Cải tiến & Tối ưu hóa',
        tag: 'IMPROVEMENT',
        color: 'blue',
        items: [
          {
            title: 'Triệt tiêu bộ nhớ đệm CDN (Anti-Cache Realtime)',
            desc: 'Áp dụng cơ chế cache-busting thông minh để dữ liệu tài khoản và số dư luôn đồng bộ ngay tức khắc trên mọi thiết bị mà không bị trễ.'
          },
          {
            title: 'Hỗ trợ đối soát file không dấu (ASCII / ERP cũ)',
            desc: 'Nhận diện thông minh các bảng kê xuất từ các phần mềm quản lý bán hàng cũ không có dấu tiếng Việt.'
          },
          {
            title: 'Bỏ qua dòng tiêu đề / Banner công ty',
            desc: 'Tự động quét và định vị chính xác hàng tiêu đề cột dù bảng tính có chèn logo hay 4 dòng banner ở đầu trang.'
          }
        ]
      }
    ]
  },
  {
    version: 'v2.5',
    releaseDate: '10/10/2026 - 20:15',
    title: 'Admin Portal Quản Trị & Giám Sát Ô Excel Nghi Ngờ',
    isCurrent: false,
    badges: ['Admin Portal', 'Tọa Độ Excel', 'Lịch Sử Quét'],
    summary: 'Bổ sung trung tâm quản trị Admin tối cao, tra cứu tọa độ ô Excel sai lệch và quản lý lịch sử quét.',
    categories: [
      {
        name: 'Tính năng Admin',
        tag: 'ADMIN',
        color: 'purple',
        items: [
          {
            title: 'Trung tâm Quản trị Admin (Admin Portal)',
            desc: 'Xem danh sách toàn bộ lượt quét, tổng doanh thu, số dư tài khoản của các shop và kiểm soát gian lận.'
          },
          {
            title: 'Định vị chính xác ô Excel lỗi (VD: Sheet1!E14)',
            desc: 'Chỉ rõ tọa độ ô Excel bị sai lệch giúp chủ shop đối chiếu tức thì mà không cần tìm thủ công.'
          }
        ]
      }
    ]
  },
  {
    version: 'v2.0',
    releaseDate: '09/10/2026 - 10:00',
    title: 'Khởi Chạy Hệ Thống SoatDon.vn',
    isCurrent: false,
    badges: ['Khởi Đầu', 'AI Kiểm Toán', 'VietQR'],
    summary: 'Ra mắt nền tảng kiểm toán cước vận chuyển và tiền COD tự động ứng dụng AI đầu tiên tại Việt Nam.',
    categories: [
      {
        name: 'Nền tảng ban đầu',
        tag: 'CORE',
        color: 'slate',
        items: [
          {
            title: 'Quét đối soát 4 nhóm thất thoát vận chuyển',
            desc: 'Phát hiện kê khống cân nặng, cước vượt thỏa thuận, đơn hoàn ngâm kho quá 8 ngày và lệch tiền thu hộ COD.'
          },
          {
            title: 'Mẫu khiếu nại bưu cục tự động 1 click',
            desc: 'Xuất file Excel tổng hợp các đơn lỗi kèm công văn khiếu nại bưu cục đòi lại tiền thất thoát.'
          }
        ]
      }
    ]
  }
];
