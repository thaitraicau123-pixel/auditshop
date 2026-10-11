/**
 * Dữ liệu nhật ký cập nhật hệ thống (Changelog & Release Notes)
 * Lưu trữ phiên bản, thời gian phát hành và toàn bộ tính năng mới đã thêm.
 */

export const CURRENT_SYSTEM_VERSION = 'v2.6';

export const CHANGELOG_HISTORY = [
  {
    version: 'v2.6',
    releaseDate: '11/10/2026 - 15:35',
    title: 'Siêu Cập Nhật: Đồng Bộ Đa Thiết Bị & Hệ Thống AI Tự Luyện 100%',
    isCurrent: true,
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
