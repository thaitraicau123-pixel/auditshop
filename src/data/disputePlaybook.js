/**
 * Dispute Playbook & Legal Negotiation Scripts
 * Cẩm nang & Bộ kịch bản đàm phán đòi tiền bưu cục cứng rắn, chuẩn luật pháp lý
 */

export const DISPUTE_SCENARIOS = [
  {
    id: 'OVERWEIGHT_MACHINE_EXCUSE',
    title: 'Bưu cục đổ lỗi: "Băng chuyền tự động đo máy móc, hệ thống không sai được"',
    icon: 'Scale',
    color: 'rose',
    trapSummary: 'Bưu cục từ chối đối soát lại cân nặng vì bảo rằng camera và cân quét tự động chuẩn 100%, không cho nhân viên sửa tay.',
    legalCitation: 'Khoản 2 Điều 10 Luật Bưu chính 2010 & Quy chuẩn kỹ thuật QCVN 01:2018/BTTTT về sai số thiết bị đo lường bưu chính.',
    counterArgument: 'Cân tự động vẫn có tỷ lệ lệch cảm biến quang học khi kiện hàng đi xéo, chập đôi kiện hoặc băng chuyền rung lắc. Shop có lưu video/ảnh đóng gói và kích thước 3 chiều thực tế.',
    zaloTemplate: `Kính gửi Bộ phận Đối Soát & Chăm Sóc Khách Hàng,

Shop xin phản hồi về các mã đơn bị kê khống nấc cân nặng trong kỳ đối soát này.
Việc bưu cục phản hồi "băng chuyền tự động không sai" là không phù hợp với thực tế kỹ thuật và Khoản 2 Điều 10 Luật Bưu chính 2010.

Sản phẩm của Shop là [Tên sản phẩm], kích thước tiêu chuẩn đóng hộp là [D]x[R]x[C] cm, cân nặng thực tế tối đa chỉ [X] gram. Việc hệ thống hãng ghi nhận nhảy vọt lên [Y] gram (gấp nhiều lần) là do lỗi cảm biến chập kiện hoặc quét nhầm bưu gửi đi kèm.

Shop yêu cầu bưu cục:
1. Trích xuất camera cân quét tại băng chuyền kho trung chuyển đối với mã đơn này.
2. Hoàn trả khoản cước chênh lệch [Số tiền] đ vào kỳ đối soát gần nhất.

Nếu bưu cục không xử lý thỏa đáng, Shop sẽ gửi đơn khiếu nại lên Phòng Quản lý Bưu chính - Sở Thông tin & Truyền thông theo quy định.

Trân trọng!`
  },
  {
    id: 'RETURN_EXPIRED_72H',
    title: 'Bưu cục thoái thác: "Đơn hoàn quá thời hạn 72h nên bên em không tiếp nhận bồi thường"',
    icon: 'Clock',
    color: 'amber',
    trapSummary: 'Hàng hoàn bị vỡ hỏng hoặc tráo ruột, nhưng bưu cục nại cớ "quá 72h kể từ ngày phát" để phủi trách nhiệm bồi hoàn.',
    legalCitation: 'Điều 38 Luật Bưu chính 2010 & Điều 24 Nghị định 47/2011/NĐ-CP: Thời hiệu khiếu nại bưu phẩm mất mát, hư hại tối thiểu là 06 tháng.',
    counterArgument: 'Thời hạn 72h chỉ là quy định nội bộ do hãng tự đặt ra, không thể đứng trên Luật Bưu chính (quy định thời hiệu 6 tháng). Ngoài ra, shipper ngâm hàng tại kho trung chuyển trễ hẹn SLA chính là nguyên nhân dẫn đến quá hạn.',
    zaloTemplate: `Kính gửi Trưởng Bưu Cục & Trưởng Bộ Phận Bồi Thường,

Về đơn hàng [Mã vận đơn] bị hư hỏng/mất mát khi hoàn về:
Shop không đồng ý với lý do từ chối bồi thường "quá thời hạn 72h".

Căn cứ Điều 38 Luật Bưu chính 2010 và Điều 24 Nghị định 47/2011/NĐ-CP, thời hiệu khiếu nại đối với bưu gửi bị mất, hư hại là 06 tháng kể từ ngày kết thúc thời gian toàn trình. Quy chế nội bộ 72h của bưu cục không có giá trị miễn trừ nghĩa vụ bồi thường thiệt hại theo quy định pháp luật bưu chính Việt Nam.

Hơn nữa, lịch trình vận đơn thể hiện bưu tá đã ngâm kiện hàng tại kho từ ngày [Ngày 1] đến ngày [Ngày 2] (trễ [X] ngày so với cam kết SLA).

Shop yêu cầu:
- Bưu cục lập Biên bản xác nhận sự cố hư hỏng/mất mát ngay hôm nay.
- Thực hiện thủ tục bồi thường 100% giá trị bưu phẩm [Số tiền] đ theo hợp đồng.

Trân trọng!`
  },
  {
    id: 'COD_UNDERPAID_OR_MISSING',
    title: 'Bưu cục chuyển thiếu hoặc quên trả tiền thu hộ COD',
    icon: 'DollarSign',
    color: 'emerald',
    trapSummary: 'Shipper đã thu tiền mặt của khách và app báo phát thành công, nhưng kỳ đối soát tiền COD bị giữ lại, trừ âm hoặc chênh lệch.',
    legalCitation: 'Điều 551 Bộ Luật Dân Sự 2015 về Hợp đồng dịch vụ & Nghĩa vụ thanh toán tiền ủy thác thu hộ.',
    counterArgument: 'Tiền COD là tiền tài sản của người bán giao cho bưu cục giữ hộ, bưu cục có nghĩa vụ hoàn trả đúng hạn và đủ số tiền đã thu, không được tự ý cấn trừ các khoản phí chưa thỏa thuận.',
    zaloTemplate: `Kính gửi Kế toán Đối soát & Quản lý Kinh doanh,

Qua rà soát đối chiếu file xuất kho và bảng kê thanh toán kỳ này, Shop phát hiện đơn hàng [Mã vận đơn] có sự sai lệch nghiêm trọng về tiền thu hộ COD:

- Tiền COD người mua thanh toán thực tế: [Số tiền 1] đ
- Tiền COD bưu cục chuyển trả cho Shop: [Số tiền 2] đ
=> Chênh lệch thất thoát: [Số tiền lệch] đ

Shipper đã xác nhận giao thành công và thu đủ tiền mặt từ khách hàng vào ngày [Ngày]. Việc chậm trễ hoặc giữ lại tiền thu hộ là hành vi vi phạm nghĩa vụ thanh toán theo hợp đồng dịch vụ.

Shop yêu cầu kế toán đối soát kiểm tra lại nhật ký nộp tiền của bưu tá và chuyển khoản bổ sung ngay số tiền [Số tiền lệch] đ trong vòng 24 giờ làm việc.

Trân trọng!`
  },
  {
    id: 'DAMAGED_PACKAGING_BLAME',
    title: 'Bưu cục đổ lỗi: "Hàng bể vỡ do shop đóng gói không chèn xốp đạt chuẩn"',
    icon: 'PackageX',
    color: 'violet',
    trapSummary: 'Hàng hoàn về vỡ nát, bưu cục đổ lỗi do shop đóng gói sơ sài, không đạt tiêu chuẩn đóng gói của hãng.',
    legalCitation: 'Khoản 1 Điều 536 Bộ Luật Dân Sự 2015: Bưu cục đã tiếp nhận kiện hàng nguyên vẹn tại quầy nghĩa là đã đồng ý tiêu chuẩn đóng gói.',
    counterArgument: 'Khi tiếp nhận hàng gửi, nhân viên bưu cục đã kiểm tra và nhận hàng, không có khuyến cáo đóng gói lại. Nếu bao bì bên ngoài bị rách, móp thì chứng tỏ bị va đập mạnh trong quá trình bốc xếp hoặc đè hàng nặng lên.',
    zaloTemplate: `Kính gửi Bộ phận Khiếu nại Vận chuyển,

Về đơn hàng [Mã vận đơn] bị bể vỡ khi hoàn trả:
Bưu cục phản hồi "do shop đóng gói không chuẩn" là hoàn toàn thiếu căn cứ.

1. Khi nhân viên bưu cục nhận kiện hàng tại kho Shop, hàng hóa đã được kiểm tra và dán tem niêm phong. Căn cứ Khoản 1 Điều 536 Bộ Luật Dân Sự, việc bưu cục tiếp nhận bưu gửi đồng nghĩa đã chấp thuận quy cách đóng gói hợp lệ.
2. Vỏ hộp carton bên ngoài khi hoàn về có dấu hiệu bị móp méo, rách nát và thủng cạnh, chứng tỏ kiện hàng đã bị quăng quật hoặc chèn ép vật nặng quá tải trọng trong quá trình trung chuyển.

Shop đã lưu giữ đầy đủ ảnh chụp hiện trường vỏ hộp và video mở hàng hoàn. Yêu cầu bưu cục lập biên bản giám định hiện trường và bồi hoàn theo giá trị khai giá.

Trân trọng!`
  },
  {
    id: 'HIDDEN_REMOTE_SURCHARGES',
    title: 'Bưu cục tự ý cộng phụ phí vùng sâu vùng xa / đồng kiểm ảo',
    icon: 'Receipt',
    color: 'indigo',
    trapSummary: 'Trong bảng kê tổng xuất hiện các khoản phụ phí 5.000đ - 15.000đ/đơn không có trong hợp đồng nguyên tắc đã ký.',
    legalCitation: 'Điều 405 Bộ Luật Dân Sự 2015 về Hợp đồng theo mẫu & Cam kết biểu giá dịch vụ.',
    counterArgument: 'Mọi khoản phụ thu ngoài biểu phí thỏa thuận phải được shop đồng ý bằng văn bản trước khi áp dụng. Tự động áp phụ phí trên hệ thống là vi phạm điều khoản hợp đồng.',
    zaloTemplate: `Kính gửi Nhân viên Quản lý Hợp đồng (Sale phụ trách shop),

Shop vừa rà soát bảng kê đối soát và phát hiện có [X] đơn hàng bị cộng thêm phụ phí vùng xa / phụ phí xử lý đặc biệt từ 5.000 đ đến [Y] đ/đơn.

Căn cứ Hợp đồng dịch vụ bưu chính số [Số HĐ] đã ký giữa Shop và Quý công ty, Shop được áp dụng biểu phí đồng giá toàn quốc và không có phụ phí vùng xa đối với danh mục hàng hóa này.

Yêu cầu Kế toán gỡ bỏ toàn bộ các khoản phụ phí tự phát trên bảng kê và hoàn lại tổng số tiền [Số tiền] đ đã trừ sai.

Trân trọng!`
  },
  {
    id: 'RETURN_PARCEL_SWAPPED',
    title: 'Hàng hoàn bị tráo ruột (Điện thoại thành cục đá, áo quần thành giẻ)',
    icon: 'ShieldAlert',
    color: 'red',
    trapSummary: 'Khách không nhận, hàng hoàn về tới tay shop nhưng ruột bên trong bị bóc trộm hoặc đánh tráo thành vật phẩm khác.',
    legalCitation: 'Điều 175 Bộ Luật Hình Sự 2015 (Tội lạm dụng tín nhiệm chiếm đoạt tài sản) & Trách nhiệm bồi thường toàn bộ theo Luật Bưu chính.',
    counterArgument: 'Hàng hóa gửi đi có khối lượng và tem niêm phong ban đầu. Nếu hàng bị tráo ruột trong hành trình vận chuyển, bưu cục phải chịu trách nhiệm truy cứu bưu tá và bồi thường 100% giá trị bưu gửi.',
    zaloTemplate: `KÍNH GỬI: BAN GIÁM ĐỐC & BỘ PHẬN AN NINH ĐIỀU TRA BƯU CỤC

V/v: Báo cáo vụ việc có dấu hiệu trộm cắp, tráo ruột bưu gửi bưu chính nghiêm trọng

- Mã vận đơn: [Mã vận đơn]
- Người gửi: [Tên Shop] - SĐT: [SĐT]
- Sản phẩm gửi đi: [Tên sản phẩm] - Giá trị: [Số tiền] đ
- Tình trạng nhận hoàn: Bưu kiện bị rạch đáy/dán lại băng dính đè lên tem niêm phong, ruột bên trong đã bị tráo đổi thành [Mô tả vật tráo].

Shop đã lập Biên bản đồng kiểm có chữ ký của Shipper giao hàng và trích xuất camera quá trình mở gói hàng.

Đây là hành vi có dấu hiệu chiếm đoạt tài sản theo Điều 175 Bộ Luật Hình Sự. Shop yêu cầu:
1. Bộ phận an ninh bưu cục kiểm tra lại cân nặng từng trạm trung chuyển để định vị trạm xảy ra hành vi tráo hàng.
2. Bồi hoàn 100% giá trị bưu gửi [Số tiền] đ trong vòng 48h.
3. Nếu không nhận được phản hồi thỏa đáng, Shop sẽ gửi đơn trình báo đến Cơ quan Công an để làm rõ hành vi trộm cắp bưu gửi.

Trân trọng!`
  }
];
