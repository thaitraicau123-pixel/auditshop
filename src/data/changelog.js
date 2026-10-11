/**
 * Dữ liệu nhật ký cập nhật hệ thống (Changelog & Release Notes)
 * Lưu trữ phiên bản, thời gian phát hành và toàn bộ tính năng mới đã thêm.
 */

export const CURRENT_SYSTEM_VERSION = 'v3.1';

export const CHANGELOG_HISTORY = [
  {
    version: 'v3.1',
    releaseDate: '12/10/2026 - 01:30',
    title: '🔒 Siết Chặt Bản Quyền Đối Soát & Tinh Gọn Giao Diện Logistics Pro',
    isCurrent: true,
    badges: ['Khóa Bản Quyền Chuẩn 🔒', 'Bảng Vàng Tri Ân 🏆', 'Giao Diện Logistics Pro', 'Loại Bỏ Thú Cưng Mini'],
    summary: 'Sửa triệt để lỗ hổng quét đơn miễn phí, siết chặt cơ chế bảo vệ thương mại và nạp lượt quét; tinh gọn toàn bộ giao diện theo phong cách AI Logistics chuyên nghiệp, độc lập và trang trọng.',
    categories: [
      {
        name: 'Bảo Vệ Thương Mại & Cơ Chế Bản Quyền',
        tag: 'SECURITY & PAYWALL',
        color: 'emerald',
        items: [
          {
            title: 'Khắc Phục Triệt Để Lỗ Hổng Quét Miễn Phí (Zero-Bypass)',
            desc: 'Loại bỏ hoàn toàn cơ chế bypass tự động mở khóa cũ; file tải lên thực tế chỉ được mở khóa khi tài khoản có gói cước hợp lệ hoặc nạp lượt quét.'
          },
          {
            title: 'Tách Biệt Bảng Kê Mẫu Dùng Thử & File Thực Tế',
            desc: '7 bảng kê mẫu (1-Click AI Test) vẫn cho phép trải nghiệm đầy đủ mà không trừ lượt quét; trong khi file đối soát thật tải lên từ máy tính được bảo vệ bản quyền nghiêm ngặt.'
          }
        ]
      },
      {
        name: 'Chuẩn Hóa Giao Diện & Bảng Vàng Tri Ân',
        tag: 'UI/UX CLEANUP',
        color: 'blue',
        items: [
          {
            title: 'Loại Bỏ Thú Cưng Mini-Game & Mascot Đồ Họa',
            desc: 'Gỡ bỏ toàn bộ widget thú cưng, các hiệu ứng lắc lư và giọng thoại cún mèo; chuyển đổi giao diện sang phong cách kiểm toán dữ liệu chuyên nghiệp, tinh tế.'
          },
          {
            title: 'Bảng Vàng Tri Ân Độc Lập (Hall of Fame)',
            desc: 'Tách riêng Bảng Vàng Tri Ân thành cửa sổ vinh danh trang trọng dành cho các chủ shop đã mời ly cà phê tiếp sức máy chủ AI.'
          }
        ]
      }
    ]
  },
  {
    version: 'v3.0',
    releaseDate: '11/10/2026 - 21:30',
    title: '🏆 Ra Mắt Bảng Vàng Tri Ân Shop & Khắc Phục Lỗi Dấu X Modal',
    isCurrent: false,
    badges: ['Bảng Vàng Tri Ân 🏆', 'Sửa Nút Đóng X 🛡️', 'Thoát Nhanh Bằng Esc', 'Giao Diện HUD Mới'],
    summary: 'Cập nhật mang đến Bảng Vàng Tri Ân công khai vinh danh các nhà bán hàng hảo tâm, cùng việc sửa triệt để lỗi che khuất dấu X và tối ưu cơ chế thoát cửa sổ bằng phím Esc.',
    categories: [
      {
        name: 'Trải nghiệm Người dùng & Tương tác Vui nhộn',
        tag: 'MINI-GAME',
        color: 'emerald',
        items: [
          {
            title: 'Hệ Thống Nuôi Thú Cưng Cún & Mèo (Pet Nurturing Lv.1 - Lv.7)',
            desc: 'Thú cưng tự động tích lũy thức ăn hạt và EXP mỗi khi shop quét đơn Excel; nhận thức ăn Pate VIP khi donate. Thăng tiến 7 cấp danh hiệu từ Cún Mèo Tập Sự đến Vua Soi Cước Huyền Thoại.'
          },
          {
            title: 'Mini Clicker Game "Bắt Đền Kê Khống Nấc Cân"',
            desc: 'Tương tác clicker hấp dẫn: Bấm để cún mèo tóm gọn 3 kiện hàng bị bưu cục tính lố nấc cân, nhận ngay 60 EXP thăng cấp!'
          },
          {
            title: 'Bảng Vàng Tri Ân Cộng Đồng Công Khai',
            desc: 'Vinh danh công khai danh sách các shop đã chung tay mời ly cà phê tiếp sức máy chủ AI, phân hạng Kim Cương, Vàng, Bạc kèm tìm kiếm và lọc danh hiệu.'
          }
        ]
      },
      {
        name: 'Tối ưu Giao diện & Điều hướng Thoát Cửa Sổ',
        tag: 'UX/UI FIX',
        color: 'blue',
        items: [
          {
            title: 'Sửa Triệt Để Lỗi Che Dấu X Trên Mọi Kích Thước Màn Hình',
            desc: 'Thiết kế Sticky Header cố định cho tất cả các modal, nút đóng X to tròn nổi bật và không bao giờ bị thụt lên trên nóc màn hình dù dùng trình duyệt nào.'
          },
          {
            title: '3 Cơ Chế Quay Lại Web Dễ Dàng Khi Bấm Nhầm',
            desc: 'Hỗ trợ bấm phím Escape (Esc) thoát tức thì, click chuột ra ngoài vùng xám (backdrop) để đóng, và thêm nút lớn "← Đóng & Quay lại web (Esc)" dưới chân mọi cửa sổ.'
          },
          {
            title: 'Tinh Gọn HUD & Biểu Tượng Cún Mèo Trực Quan',
            desc: 'Bố cục lại các nút bấm, giảm rối mắt, thêm thanh đo sức khỏe logistics và linh vật thú cưng nhắc nhở vui tươi.'
          }
        ]
      }
    ]
  },
  {
    version: 'v2.9',
    releaseDate: '11/10/2026 - 20:20',
    title: '☕ Ra Mắt Tính Năng "Mời Dev Ly Cà Phê" & 3 Điểm Rơi Tri Ân Thông Minh',
    isCurrent: false,
    badges: ['Mời Cà Phê ☕', 'VietQR 1-Chạm', '3 Điểm Rơi Cảm Xúc', 'Bảng Vàng Tri Ân'],
    summary: 'Tích hợp tiện ích Mời Dev Ly Cà Phê (Buy Me A Coffee) qua VietQR MB Bank tại 3 thời điểm tâm lý vàng: ngay sau khi xuất file khiếu nại, tại chân trang Footer và trong cửa sổ vinh danh chiến thắng để lấy hên bão đơn!',
    categories: [
      {
        name: 'Tiện ích Tiếp Sức & Gắn Kết Cộng Đồng',
        tag: 'COMMUNITY',
        color: 'amber',
        items: [
          {
            title: 'Hộp thoại Mời Cà Phê VietQR Tức Thì (15k - 25k - 50k - 100k)',
            desc: 'Mã QR động tạo sẵn nội dung chuyển khoản, hiển thị STK MB Bank 0986019623 với các mức ủng hộ gần gũi: Cốc trà đá 15k, Ly cà phê muối 25k, Bữa cơm trưa 50k, hoặc số tiền tùy tâm.'
          },
          {
            title: '3 Điểm Rơi Cảm Xúc Thông Minh',
            desc: 'Điểm 1: Tự động nhắc nhở sau khi xuất file Excel khiếu nại; Điểm 2: Nút bấm trang trọng tại chân trang Footer; Điểm 3: Gợi ý "Mời cà phê lấy hên buôn may bán đắt" khi kiểm toán sạch 100% không mất tiền.'
          },
          {
            title: 'Bảng Vàng Tri Ân Các Shop Hảo Tâm',
            desc: 'Vinh danh những lời nhắn gửi và tình cảm quý báu của các chủ shop đã đồng hành tiếp sức cho máy chủ AI SoatDon.vn.'
          }
        ]
      }
    ]
  },
  {
    version: 'v2.8',
    releaseDate: '11/10/2026 - 19:40',
    title: '✨ Đại Tu Toàn Diện Trải Nghiệm Người Dùng (UI/UX 2.0) & Holographic Radar Scanner',
    isCurrent: false,
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
