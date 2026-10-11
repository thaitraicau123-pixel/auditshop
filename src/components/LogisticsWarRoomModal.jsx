import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Radio, Satellite, ShieldAlert, ShieldCheck, PhoneCall, PhoneOff, 
  Volume2, VolumeX, Activity, AlertTriangle, Play, Pause, RotateCcw, 
  MapPin, CheckCircle2, Flame, Sparkles, TrendingUp, Layers, ChevronRight,
  Zap, Award, Lock, ArrowUpRight, Cpu, Clock, Terminal, ChevronDown,
  Camera, Crosshair, Scan, Target, Eye, FileText, Check
} from 'lucide-react';
import { cyberSound } from '../utils/cyberSoundEngine';

// Danh sách 12 Mega Hub Logistics huyết mạch toàn quốc với tọa độ GPS và trinh sát camera
const LOGISTICS_HUBS = [
  {
    id: 'HN_LB',
    code: 'HN',
    num: 1,
    name: 'Kho Mega Long Biên (Hà Nội)',
    shortName: 'Mega Long Biên',
    region: 'Miền Bắc',
    x: 61,
    y: 19,
    mapX: 44.5,
    mapY: 28.5,
    gps: '21°02\'N 105°53\'E',
    cctvCam: 'CAM 01 - BĂNG CHUYỀN LONG BIÊN',
    status: 'ALERT',
    overweightRate: '16.8%',
    delayedReturnRate: '24.2%',
    avgCodDays: '3.4 ngày',
    riskScore: 78,
    topRiskCarrier: 'GHTK & SPX',
    recentAnomalies: 84,
    description: 'Trạm trung chuyển cửa ngõ Thủ Đô. Lưu lượng 180.000 đơn/ngày. Thường xuyên nghẽn hàng hoàn vào thứ 6.'
  },
  {
    id: 'BN_HUB',
    code: 'BN',
    num: 2,
    name: 'Mega Hub Bắc Ninh (Kho Yên Phong)',
    shortName: 'Mega Bắc Ninh',
    region: 'Miền Bắc',
    x: 67,
    y: 15,
    mapX: 47.0,
    mapY: 26.5,
    gps: '21°11\'N 106°04\'E',
    cctvCam: 'CAM 02 - MÁY QUÉT QUANG HỌC YÊN PHONG',
    status: 'CRITICAL',
    overweightRate: '22.4%',
    delayedReturnRate: '31.5%',
    avgCodDays: '4.1 ngày',
    riskScore: 92,
    topRiskCarrier: 'SPX & TikTok Logistics',
    recentAnomalies: 156,
    description: 'Kho phân loại tự động lớn nhất miền Bắc. Băng chuyền quang học hay lỗi nhận diện kích thước thùng giấy dính chùm.'
  },
  {
    id: 'HP_DV',
    code: 'HP',
    num: 3,
    name: 'Kho Cảng Đình Vũ (Hải Phòng)',
    shortName: 'Cảng Đình Vũ',
    region: 'Miền Bắc',
    x: 75,
    y: 20,
    mapX: 49.5,
    mapY: 28.5,
    gps: '20°50\'N 106°45\'E',
    cctvCam: 'CAM 03 - CONTAINER BÃI ĐÌNH VŨ',
    status: 'NORMAL',
    overweightRate: '6.5%',
    delayedReturnRate: '11.0%',
    avgCodDays: '2.1 ngày',
    riskScore: 32,
    topRiskCarrier: 'Viettel Post',
    recentAnomalies: 19,
    description: 'Trạm lưu chuyển hàng duyên hải và container nhập khẩu. Tỷ lệ đối soát ổn định.'
  },
  {
    id: 'NA_VINH',
    code: 'NA',
    num: 4,
    name: 'Kho Trung Chuyển Vinh (Nghệ An)',
    shortName: 'Kho Vinh',
    region: 'Miền Bắc',
    x: 54,
    y: 33,
    mapX: 40.5,
    mapY: 37.5,
    gps: '18°40\'N 105°40\'E',
    cctvCam: 'CAM 04 - BĂNG TẢI TRUNG CHUYỂN VINH',
    status: 'ALERT',
    overweightRate: '14.1%',
    delayedReturnRate: '28.0%',
    avgCodDays: '3.8 ngày',
    riskScore: 71,
    topRiskCarrier: 'GHN & J&T',
    recentAnomalies: 62,
    description: 'Trạm trung chuyển then chốt miền Trung. Điểm nóng ngâm đơn giao không thành công.'
  },
  {
    id: 'DN_HC',
    code: 'ĐN',
    num: 5,
    name: 'Mega Hub Hòa Cầm (Đà Nẵng)',
    shortName: 'Mega Hòa Cầm',
    region: 'Miền Trung',
    x: 65,
    y: 46,
    mapX: 50.5,
    mapY: 52.0,
    gps: '16°00\'N 108°11\'E',
    cctvCam: 'CAM 05 - PHÂN LUỒNG BẮC NAM HÒA CẦM',
    status: 'CRITICAL',
    overweightRate: '19.5%',
    delayedReturnRate: '36.2%',
    avgCodDays: '4.5 ngày',
    riskScore: 88,
    topRiskCarrier: 'GHTK & GHN',
    recentAnomalies: 128,
    description: 'Nút thắt phân luồng 2 chiều Bắc - Nam. Đơn hàng hoàn thường xuyên bị om quá 10 ngày trước khi trả.'
  },
  {
    id: 'QN_DH',
    code: 'QN',
    num: 6,
    name: 'Kho Vận Quy Nhơn (Bình Định)',
    shortName: 'Kho Quy Nhơn',
    region: 'Miền Trung',
    x: 73,
    y: 57,
    mapX: 55.0,
    mapY: 62.5,
    gps: '13°46\'N 109°13\'E',
    cctvCam: 'CAM 06 - KHO BÃI VEN BIỂN QUY NHƠN',
    status: 'NORMAL',
    overweightRate: '8.2%',
    delayedReturnRate: '15.4%',
    avgCodDays: '2.5 ngày',
    riskScore: 41,
    topRiskCarrier: 'VNPost Bưu Điện',
    recentAnomalies: 23,
    description: 'Trạm thứ cấp trung chuyển ven biển Nam Trung Bộ.'
  },
  {
    id: 'GL_PLK',
    code: 'GL',
    num: 7,
    name: 'Kho Pleiku (Gia Lai - Tây Nguyên)',
    shortName: 'Kho Pleiku',
    region: 'Miền Trung',
    x: 59,
    y: 60,
    mapX: 47.0,
    mapY: 61.0,
    gps: '13°59\'N 108°00\'E',
    cctvCam: 'CAM 07 - BĂNG TẢI TÂY NGUYÊN',
    status: 'ALERT',
    overweightRate: '15.9%',
    delayedReturnRate: '22.7%',
    avgCodDays: '3.6 ngày',
    riskScore: 68,
    topRiskCarrier: 'Viettel Post',
    recentAnomalies: 45,
    description: 'Tuyến đường đèo dốc, thường phát sinh phụ phí vùng sâu vùng xa sai lệch.'
  },
  {
    id: 'KH_NT',
    code: 'NT',
    num: 8,
    name: 'Kho Diên Khánh (Nha Trang)',
    shortName: 'Kho Nha Trang',
    region: 'Miền Trung',
    x: 76,
    y: 69,
    mapX: 55.5,
    mapY: 69.5,
    gps: '12°15\'N 109°05\'E',
    cctvCam: 'CAM 08 - TRUNG TÂM PHÂN LOẠI KHÁNH HÒA',
    status: 'NORMAL',
    overweightRate: '7.4%',
    delayedReturnRate: '12.8%',
    avgCodDays: '2.2 ngày',
    riskScore: 36,
    topRiskCarrier: 'J&T Express',
    recentAnomalies: 18,
    description: 'Vận hành tương đối chuẩn chỉ, kiểm tra nấc cân nặng đều đặn.'
  },
  {
    id: 'SG_CC',
    code: 'SG',
    num: 9,
    name: 'Mega Hub Củ Chi (TP. Hồ Chí Minh)',
    shortName: 'Mega Củ Chi',
    region: 'Miền Nam',
    x: 51,
    y: 81,
    mapX: 42.0,
    mapY: 74.0,
    gps: '10°58\'N 106°29\'E',
    cctvCam: 'CAM 04 - BĂNG CHUYỀN SOI CÂN 3D CỦ CHI',
    status: 'CRITICAL',
    overweightRate: '25.8%',
    delayedReturnRate: '39.0%',
    avgCodDays: '4.8 ngày',
    riskScore: 96,
    topRiskCarrier: 'SPX, GHTK & GHN',
    recentAnomalies: 245,
    description: 'TỔNG KHO LỚN NHẤT ĐÔNG NAM Á. Lưu lượng 450.000 đơn/ngày. Tâm bão kê khống cân nấc thể tích hàng cồng kềnh.'
  },
  {
    id: 'BD_ST',
    code: 'BD',
    num: 10,
    name: 'Kho Sóng Thần (Dĩ An - Bình Dương)',
    shortName: 'Kho Sóng Thần',
    region: 'Miền Nam',
    x: 59,
    y: 78,
    mapX: 45.0,
    mapY: 73.0,
    gps: '10°53\'N 106°44\'E',
    cctvCam: 'CAM 10 - KHU XƯỞNG SỈ SÓNG THẦN',
    status: 'ALERT',
    overweightRate: '18.2%',
    delayedReturnRate: '27.4%',
    avgCodDays: '3.9 ngày',
    riskScore: 82,
    topRiskCarrier: 'GHTK & J&T',
    recentAnomalies: 98,
    description: 'Trung tâm kho xưởng công nghiệp. Sai lệch cước chủ yếu ở đơn giao sỉ thùng to.'
  },
  {
    id: 'DN_BH',
    code: 'ĐNAI',
    num: 11,
    name: 'Kho Amata (Biên Hòa - Đồng Nai)',
    shortName: 'Kho Amata',
    region: 'Miền Nam',
    x: 65,
    y: 80,
    mapX: 47.5,
    mapY: 74.5,
    gps: '10°57\'N 106°50\'E',
    cctvCam: 'CAM 11 - BĂNG TẢI AMATA ĐỒNG NAI',
    status: 'ALERT',
    overweightRate: '13.7%',
    delayedReturnRate: '21.5%',
    avgCodDays: '3.2 ngày',
    riskScore: 65,
    topRiskCarrier: 'Viettel Post',
    recentAnomalies: 54,
    description: 'Tỷ lệ cước vượt thỏa thuận thường xảy ra ở đơn giao cuối tuần.'
  },
  {
    id: 'CT_TD',
    code: 'CT',
    num: 12,
    name: 'Mega Hub Tây Đô (Cần Thơ)',
    shortName: 'Mega Cần Thơ',
    region: 'Miền Nam',
    x: 43,
    y: 91,
    mapX: 38.5,
    mapY: 82.5,
    gps: '10°02\'N 105°44\'E',
    cctvCam: 'CAM 12 - TRUNG CHUYỂN MIỀN TÂY SÔNG HẬU',
    status: 'ALERT',
    overweightRate: '17.3%',
    delayedReturnRate: '33.1%',
    avgCodDays: '4.2 ngày',
    riskScore: 79,
    topRiskCarrier: 'GHN & VNPost',
    recentAnomalies: 88,
    description: 'Cửa ngõ miền Tây sông nước. Bưu tá thường báo hủy ảo vì lý do nước nổi hoặc xa đường ô tô.'
  }
];

// Danh sách các sự cố trinh sát thời gian thực
const LIVE_INCIDENTS = [
  { time: '00:04:12', hub: 'Kho Củ Chi Mega Hub', carrier: 'SPX', type: 'KÊ KHỐNG CÂN NẶNG', detail: 'Phát hiện 28 đơn nấc 350g bị máy quét tự động nhảy lên 1.850g (+32.000đ/đơn).' },
  { time: '00:05:40', hub: 'Mega Hub Bắc Ninh', carrier: 'GHTK', type: 'NGÂM HÀNG HOÀN', detail: '34 bưu kiện shop thời trang hoàn kho đã quá 9 ngày chưa điều phối giao về shop.' },
  { time: '00:06:15', hub: 'Mega Hub Hòa Cầm (Đà Nẵng)', carrier: 'GHN', type: 'LỆCH TIỀN COD', detail: 'Đơn mã GHN-998271 thu khách 850.000đ nhưng bảng kê đối soát chỉ ghi 650.000đ.' },
  { time: '00:07:02', hub: 'Kho Sóng Thần (Bình Dương)', carrier: 'J&T', type: 'GIAO ẢO / HỦY BỪNG', detail: 'Bưu tá cập nhật Khách từ chối nhận nhưng khách gửi log chứng minh không có cuộc gọi nào.' },
  { time: '00:08:29', hub: 'Mega Hub Tây Đô (Cần Thơ)', carrier: 'VNPost', type: 'OM TIỀN COD', detail: 'Dòng tiền COD 32.400.000đ bị giữ lại quá 5 ngày làm việc vượt cam kết SLA.' }
];

// 3 Kịch bản gọi điện tác chiến của Tổng Đài AI
const VOICE_CALL_SCENARIOS = [
  {
    id: 'SCENARIO_1',
    title: 'Hàng Bể Vỡ 1.450.000đ',
    subtitle: 'Bưu tá làm vỡ chai nước hoa cao cấp nhưng đổ lỗi shop đóng gói ẩu',
    carrier: 'GHTK - Chuyên Viên Khiếu Nại Bưu Cục',
    disputeAmount: '1.450.000 đ',
    dialogue: [
      {
        speaker: 'OPERATOR',
        text: 'Alo bưu cục xin nghe! Em nhận được khiếu nại đơn nước hoa 1.450k của shop rồi, nhưng bên em kiểm tra thì hàng này do shop quấn ít bóng khí nên vỡ trong quá trình chạy xe, bên em từ chối đền nhé!',
        duration: 7000
      },
      {
        speaker: 'AI_AGENT',
        text: 'Chào bạn, tôi là Hệ thống Trợ lý Pháp lý & Kiểm toán SoatDon.vn đại diện Shop. Căn cứ video trích xuất camera đóng gói chuẩn lúc 14:20:15 và cân nấc bưu tá ký nhận 450 gram còn nguyên tem, bưu kiện được bọc 5 lớp xốp khí và dán băng keo Hàng Dễ Vỡ song phương.',
        duration: 9000
      },
      {
        speaker: 'OPERATOR',
        text: 'Dạ... nhưng mà quy định bên em hàng chất lỏng là rủi ro người gửi chịu mà shop?',
        duration: 5000
      },
      {
        speaker: 'AI_AGENT',
        text: 'Căn cứ Khoản 1 Điều 40 Luật Bưu chính 2010 và Điều 534 Bộ luật Dân sự 2015: Doanh nghiệp bưu chính có nghĩa vụ bảo quản an toàn bưu phẩm kể từ thời điểm nhận bưu gửi. Hình ảnh hiện trường cho thấy vỏ hộp ngoài bị dập nát do va đập ngoại lực từ xe vận chuyển bưu cục. Tôi yêu cầu lập biên bản hoàn tiền 100% trong 24h, nếu không hồ sơ sẽ chuyển lên Cục Viễn thông và Bưu điện tỉnh.',
        duration: 11000
      },
      {
        speaker: 'OPERATOR',
        text: 'Dạ dạ em hiểu rồi ạ! Em vừa kiểm tra lại ảnh chụp bưu tá giao, đúng là vỏ hộp có dấu vết bị đè bẹp. Bưu cục em xin nhận trách nhiệm và duyệt chuyển khoản bồi thường 1.450.000đ vào ví shop trong kỳ đối soát ngày mai ạ!',
        duration: 8000
      }
    ]
  },
  {
    id: 'SCENARIO_2',
    title: 'Cân Khống 45 Đơn (1.890.000đ)',
    subtitle: 'Kho Củ Chi tự ý nhảy nấc cân nặng từ 350g lên 2.200g (+42.000đ/đơn)',
    carrier: 'SPX Logistics - Quản Lý Khu Vực',
    disputeAmount: '1.890.000 đ',
    dialogue: [
      {
        speaker: 'OPERATOR',
        text: 'Chào shop, em là quản lý kho. Các đơn hàng này máy quét tự động bên em đo thể tích Dài x Rộng x Cao ra 2.2kg nên hệ thống tự nhảy cước, bên em thu đúng quy chuẩn bảng giá nhé!',
        duration: 7000
      },
      {
        speaker: 'AI_AGENT',
        text: 'Chào bạn. Tôi là AI SoatDon.vn. Chúng tôi đã phân tích ma trận 45 đơn hàng của shop: Sản phẩm là áo thun cotton, kích thước bao bì nén khí 20x15x3 cm, thể tích thực tính theo công thức chuẩn chia 5000 chỉ là 180 gram, cân nặng thực tế 320 gram.',
        duration: 9000
      },
      {
        speaker: 'OPERATOR',
        text: 'Ơ nhưng mà máy quét băng chuyền nó ghi nhận kích thước thùng to hơn mà shop?',
        duration: 5000
      },
      {
        speaker: 'AI_AGENT',
        text: 'Băng chuyền của bạn đã bị lỗi quang học khi quét nhiều bưu kiện dính chùm vào nhau. Bưu tá lấy hàng tại shop đã ký xác nhận nấc dưới 500g trên biên bản bàn giao. Bạn đang vi phạm thỏa thuận giá cước cam kết. Số tiền chênh lệch khống là 1.890.000đ. Tôi đã xuất file đối chiếu từng mã vận đơn gửi thẳng cho Giám đốc kinh doanh vùng của bạn.',
        duration: 11000
      },
      {
        speaker: 'OPERATOR',
        text: 'Em vừa đối chiếu với file bàn giao bưu tá lấy hàng, đúng là bưu kiện dính nhau lúc chạy qua mắt đọc! Em xin lỗi shop, em sẽ phát lệnh điều chỉnh giảm trừ 1.890.000đ ngay trên bảng kê tuần này cho shop ạ!',
        duration: 8000
      }
    ]
  },
  {
    id: 'SCENARIO_3',
    title: 'Om Tiền COD 12.500.000đ',
    subtitle: 'Khách đã nhận hàng thành công 1 tuần nhưng tiền thu hộ COD chưa về tài khoản',
    carrier: 'Viettel Post - Kế Toán Đối Soát Bưu Cục',
    disputeAmount: '12.500.000 đ',
    dialogue: [
      {
        speaker: 'OPERATOR',
        text: 'Alo shop, khoản COD 12.5 triệu của shop bên kế toán đang rà soát chu kỳ ngân hàng, shop đợi sang tuần sau nhé!',
        duration: 6000
      },
      {
        speaker: 'AI_AGENT',
        text: 'Không được trì hoãn. Theo Hợp đồng dịch vụ logistics Điều 6: Thời hạn hoàn tiền thu hộ COD là 48 giờ sau khi trạng thái đơn chuyển sang Đã Giao Thành Công. 8 đơn hàng này khách đã ký nhận từ ngày 05/10, tức là đã trễ 120 giờ.',
        duration: 9000
      },
      {
        speaker: 'OPERATOR',
        text: 'Dạ do cuối tuần vừa rồi ngân hàng bên em bảo trì hệ thống nên lệnh chi hộ bị nghẽn...',
        duration: 5000
      },
      {
        speaker: 'AI_AGENT',
        text: 'Lỗi đối tác ngân hàng không phải là trường hợp bất khả kháng để bưu cục chiếm dụng dòng tiền của khách hàng. Căn cứ Điều 357 Bộ luật Dân sự: Bên chậm thanh toán phải trả tiền lãi trên số tiền chậm trả. Yêu cầu kế toán trưởng lập ủy nhiệm chi khẩn cấp trước 17:00 hôm nay.',
        duration: 10000
      },
      {
        speaker: 'OPERATOR',
        text: 'Vâng vâng em hiểu mức độ cấp bách rồi ạ! Em đã tạo lệnh chi tay trực tiếp qua Vietinbank cho tài khoản shop, tiền sẽ nổi trong 15 phút tới. Mong shop thông cảm bỏ qua cho bên em!',
        duration: 8000
      }
    ]
  }
];

export default function LogisticsWarRoomModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('RADAR'); // 'RADAR' or 'VOICE_CALL'
  const [selectedHub, setSelectedHub] = useState(LOGISTICS_HUBS[8]); // Default: Mega Hub Củ Chi TP.HCM
  const [regionFilter, setRegionFilter] = useState('ALL'); // 'ALL', 'Miền Bắc', 'Miền Trung', 'Miền Nam'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Voice Call State
  const [selectedScenario, setSelectedScenario] = useState(VOICE_CALL_SCENARIOS[0]);
  const [isCalling, setIsCalling] = useState(false);
  const [callStep, setCallStep] = useState(0); // Index in dialogue
  const [callDuration, setCallDuration] = useState(0);
  const [callSuccess, setCallSuccess] = useState(false);
  const [concessionRate, setConcessionRate] = useState(0); // 0% to 100%
  const [speechSynthEnabled, setSpeechSynthEnabled] = useState(true);
  
  // Tactical Radar & Surveillance States
  const [radarViewMode, setRadarViewMode] = useState('RADAR_MAP'); // 'RADAR_MAP', 'CCTV_THERMAL', 'SATELLITE_AERIAL'
  const [evidenceFlash, setEvidenceFlash] = useState(false);
  const [evidenceToast, setEvidenceToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const timerRef = useRef(null);
  const dialogTimeoutRef = useRef(null);
  const canvasRef = useRef(null);
  const chatScrollRef = useRef(null);

  const handleCaptureEvidence = () => {
    if (soundEnabled) cyberSound.playCameraShutter();
    setEvidenceFlash(true);
    setTimeout(() => setEvidenceFlash(false), 220);
    setToastMessage(`📸 ĐÃ TRÍCH XUẤT ẢNH BẰNG CHỨNG GIAN LẬN [${selectedHub.code} - ${selectedHub.shortName}]! Đã lưu ảnh soi nấc cân lệch vào hồ sơ đối soát.`);
    setEvidenceToast(true);
    setTimeout(() => setEvidenceToast(false), 4500);
  };

  const handleLaunchDisputeFromHub = (hub) => {
    let target = VOICE_CALL_SCENARIOS[1]; // Cân khống (SPX / Củ Chi)
    if (hub.id === 'HN_LB' || hub.id === 'NA_VINH' || hub.id === 'QN_DH') {
      target = VOICE_CALL_SCENARIOS[0]; // Bể vỡ
    } else if (hub.id === 'DN_HC' || hub.id === 'CT_TD' || hub.id === 'DN_BH') {
      target = VOICE_CALL_SCENARIOS[2]; // Om tiền COD
    }
    setSelectedScenario(target);
    setActiveTab('VOICE_CALL');
    if (soundEnabled) cyberSound.playRadioChirp();
  };

  const handleExportHubDossier = (hub) => {
    if (soundEnabled) cyberSound.playCameraShutter();
    setToastMessage(`📑 ĐÃ XUẤT HỒ SƠ TÁC CHIẾN ${hub.name.toUpperCase()} (EXCEL/PDF)! Đã tập hợp toàn bộ ${hub.recentAnomalies} đơn vi phạm kèm mã tracking.`);
    setEvidenceToast(true);
    setTimeout(() => setEvidenceToast(false), 4500);
  };

  // Dọn dẹp âm thanh & timer khi unmount / đóng modal
  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (dialogTimeoutRef.current) clearTimeout(dialogTimeoutRef.current);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsCalling(false);
      setCallStep(0);
      setCallDuration(0);
      setCallSuccess(false);
      setConcessionRate(0);
    }
  }, [isOpen]);

  // Phím tắt ESC đóng modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Âm thanh sonar ping ngẫu nhiên cho bản đồ Radar
  useEffect(() => {
    if (!isOpen || activeTab !== 'RADAR' || !soundEnabled) return;
    const interval = setInterval(() => {
      cyberSound.playSonarPing();
    }, 8000);
    return () => clearInterval(interval);
  }, [isOpen, activeTab, soundEnabled]);

  // Tự động cuộn hội thoại xuống cuối khi có tin mới
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [callStep, isCalling]);

  // Animation Canvas Waveform cho cuộc gọi thoại
  useEffect(() => {
    if (!isOpen || activeTab !== 'VOICE_CALL' || !isCalling || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      const barCount = 28;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const time = Date.now() * 0.008;
        const amp = isCalling && !callSuccess 
          ? Math.abs(Math.sin(time + i * 0.35) * (height * 0.42)) + 3 
          : 4;

        ctx.fillStyle = i % 2 === 0 ? '#818cf8' : '#f43f5e';
        ctx.fillRect(i * (barWidth + 2), centerY - amp / 2, barWidth, amp);
      }
      animationFrameId = requestAnimationFrame(renderWave);
    };

    renderWave();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isOpen, activeTab, isCalling, callSuccess]);

  // Bắt đầu cuộc gọi Voice AI
  const handleStartCall = () => {
    if (isCalling) return;
    setIsCalling(true);
    setCallStep(0);
    setCallDuration(0);
    setCallSuccess(false);
    setConcessionRate(15);

    // Phát chuông điện thoại
    if (soundEnabled) {
      cyberSound.playPhoneRing();
      setTimeout(() => cyberSound.playPhoneRing(), 1500);
    }

    // Sau 3 giây bắt đầu đàm thoại
    setTimeout(() => {
      if (soundEnabled) cyberSound.playPhoneConnect();
      runDialogueStep(0);
      
      // Bắt đầu bộ đếm giây cuộc gọi
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }, 3000);
  };

  const handleStopCall = () => {
    setIsCalling(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (dialogTimeoutRef.current) clearTimeout(dialogTimeoutRef.current);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Tiến trình hội thoại tự động từng bước
  const runDialogueStep = (stepIndex) => {
    const dialogueList = selectedScenario.dialogue;
    if (stepIndex >= dialogueList.length) {
      // Kết thúc cuộc gọi - Đòi tiền thành công 100%!
      setCallSuccess(true);
      setConcessionRate(100);
      if (soundEnabled) cyberSound.playDisputeWon();
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setCallStep(stepIndex);
    const item = dialogueList[stepIndex];

    // Cập nhật mức độ nhượng bộ của bưu cục
    const newRate = Math.min(100, Math.round(((stepIndex + 1) / dialogueList.length) * 100));
    setConcessionRate(newRate);

    // Âm thanh radio chirp
    if (soundEnabled) cyberSound.playRadioChirp();

    // Phát giọng đọc Web Speech API nếu được kích hoạt
    if (speechSynthEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(item.text);
      utter.lang = 'vi-VN';
      utter.rate = item.speaker === 'AI_AGENT' ? 1.05 : 0.98;
      utter.pitch = item.speaker === 'AI_AGENT' ? 1.1 : 0.9;
      window.speechSynthesis.speak(utter);
    }

    // Hẹn giờ sang bước kế tiếp
    dialogTimeoutRef.current = setTimeout(() => {
      runDialogueStep(stepIndex + 1);
    }, item.duration || 7000);
  };

  const filteredHubs = regionFilter === 'ALL' 
    ? LOGISTICS_HUBS 
    : LOGISTICS_HUBS.filter(h => h.region.includes(regionFilter));

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-xl p-2 sm:p-4 flex items-center justify-center animate-fade-in"
    >
      <div className="bg-slate-900 border border-indigo-500/30 w-full max-w-6xl rounded-3xl shadow-[0_0_60px_-15px_rgba(99,102,241,0.35)] overflow-hidden flex flex-col my-auto max-h-[94vh] relative text-slate-100">
        
        {/* TOP COMMAND HUD BAR */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950/95 border-b border-indigo-900/50 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 text-indigo-400 flex items-center justify-center shrink-0 relative">
              <Satellite className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-400/40 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base tracking-wide bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                  AI LOGISTICS WAR ROOM
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider">
                  VỆ TINH 63 TỈNH
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-mono">
                Trinh sát điểm đen gian lận cước &amp; Tổng đài Voice AI đòi tiền tự động
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                soundEnabled 
                  ? 'bg-indigo-950/80 border-indigo-700 text-indigo-300' 
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
              title={soundEnabled ? "Tắt âm thanh hiệu ứng" : "Bật âm thanh hiệu ứng"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors flex items-center justify-center cursor-pointer shrink-0"
              title="Đóng phòng tác chiến (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MODE SWITCHER TABS - RÕ RÀNG, TÁCH BẠCH */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('RADAR')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'RADAR'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>🛰️ Tính Năng 1: Bản Đồ Vệ Tinh Radar Trinh Sát</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('VOICE_CALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'VOICE_CALL'
                  ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
              <span>🎙️ Tính Năng 2: Tổng Đài Voice AI Đòi Tiền Hotline</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase">
                HOT
              </span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>12 TRẠM MEGA ĐANG HOẠT ĐỘNG</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: RADAR RECONNAISSANCE MAP (THIẾT KẾ QUÂN SỰ CHUYÊN NGHIỆP CÓ HÌNH ẢNH THỰC TẾ) */}
        {/* ============================================================== */}
        {activeTab === 'RADAR' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 relative">
            
            {/* Inline Style cho hiệu ứng xoay radar và chớp màn trập */}
            <style>{`
              @keyframes cyberRadarSweep {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              .animate-cyber-sweep {
                animation: cyberRadarSweep 7s linear infinite;
              }
              @keyframes flashShutter {
                0% { opacity: 0.85; }
                100% { opacity: 0; }
              }
              .animate-shutter-flash {
                animation: flashShutter 0.22s ease-out forwards;
              }
            `}</style>

            {/* Shutter flash overlay when capturing evidence */}
            {evidenceFlash && (
              <div className="fixed inset-0 bg-white pointer-events-none z-50 animate-shutter-flash" />
            )}

            {/* Evidence captured Toast Notification */}
            {evidenceToast && (
              <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 max-w-lg w-[90%] bg-emerald-950/95 border-2 border-emerald-400 text-emerald-200 px-4 py-3 rounded-2xl shadow-[0_0_35px_rgba(16,185,129,0.5)] flex items-center gap-3 backdrop-blur-xl animate-bounce">
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs font-mono">
                  <b className="text-white block font-bold">XÁC NHẬN TÁC CHIẾN THÀNH CÔNG:</b>
                  <span>{toastMessage}</span>
                </div>
              </div>
            )}

            {/* Top Stat Summary Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/70">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">LƯU LƯỢNG QUÉT</span>
                <span className="text-lg font-black font-mono text-white">482.910 đơn</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">+12.4% lưu lượng 24h</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-rose-900/50">
                <span className="text-[10px] text-rose-300 block font-semibold uppercase">BỊ KÊ KHỐNG CÂN</span>
                <span className="text-lg font-black font-mono text-rose-400">3.491 đơn</span>
                <span className="text-[10px] text-rose-300 block mt-0.5">Lệch ~98.200.000 đ</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-amber-900/50">
                <span className="text-[10px] text-amber-300 block font-semibold uppercase">OM HOÀN &gt; 72H</span>
                <span className="text-lg font-black font-mono text-amber-400">1.820 đơn</span>
                <span className="text-[10px] text-amber-300 block mt-0.5">Củ Chi &amp; Hòa Cầm</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-indigo-900/50">
                <span className="text-[10px] text-indigo-300 block font-semibold uppercase">TỶ LỆ THU HỒI TIỀN</span>
                <span className="text-lg font-black font-mono text-emerald-400">89.4% thành công</span>
                <span className="text-[10px] text-emerald-300 block mt-0.5">Giải quyết trong 18h</span>
              </div>
            </div>

            {/* Main 2-Column Tactical War Map & Hub Intel Display */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              
              {/* Left Column (7 cols): Tactical Console Display + 12 Hub Selector */}
              <div className="lg:col-span-7 flex flex-col gap-3">
                
                {/* Visual View Mode Switcher Toolbar */}
                <div className="flex items-center justify-between gap-1.5 p-1.5 rounded-2xl bg-slate-950 border border-indigo-950/70 overflow-x-auto">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setRadarViewMode('RADAR_MAP');
                        if (soundEnabled) cyberSound.playRadioChirp();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                        radarViewMode === 'RADAR_MAP'
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Target className="w-3.5 h-3.5 text-emerald-300" />
                      <span>🛰️ RADAR QUÂN SỰ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRadarViewMode('CCTV_THERMAL');
                        if (soundEnabled) cyberSound.playRadioChirp();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                        radarViewMode === 'CCTV_THERMAL'
                          ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-1 ring-rose-400'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5 text-rose-300" />
                      <span>📹 CCTV SOI CÂN FLIR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRadarViewMode('SATELLITE_AERIAL');
                        if (soundEnabled) cyberSound.playRadioChirp();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                        radarViewMode === 'SATELLITE_AERIAL'
                          ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 ring-1 ring-cyan-400'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Satellite className="w-3.5 h-3.5 text-cyan-300" />
                      <span>🛸 KHÔNG ẢNH VỆ TINH</span>
                    </button>
                  </div>

                  <span className="text-[10px] font-mono text-emerald-400 font-bold hidden sm:inline-block pr-2">
                    ● ARGUS-7 LIVE
                  </span>
                </div>

                {/* THE MAIN TACTICAL SCREEN CONTAINER */}
                <div className="bg-slate-950 rounded-2xl border border-indigo-500/30 relative overflow-hidden shadow-[0_0_40px_rgba(15,23,42,0.8)]">
                  
                  {/* ========================================= */}
                  {/* MODE 1: RADAR QUÂN SỰ TÁC CHIẾN VIỆT NAM  */}
                  {/* ========================================= */}
                  {radarViewMode === 'RADAR_MAP' && (
                    <div className="relative w-full h-[330px] sm:h-[390px] overflow-hidden">
                      {/* Realistic Military Console Background Image */}
                      <img 
                        src="/images/tactical_vietnam_radar.jpg" 
                        alt="Tactical Vietnam Military Radar" 
                        className="w-full h-full object-cover object-center filter brightness-95 contrast-110 select-none pointer-events-none"
                      />

                      {/* CRT Scanline Overlay */}
                      <div 
                        className="absolute inset-0 pointer-events-none opacity-20"
                        style={{
                          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0px, rgba(0, 0, 0, 0.5) 1px, transparent 1px, transparent 3px)'
                        }}
                      />

                      {/* Vignette Shadow Overlay */}
                      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(2,6,23,0.75)_100%)]" />

                      {/* Live Rotating Conic Radar Sweep Beam */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                        <div 
                          className="w-[180%] h-[180%] rounded-full animate-cyber-sweep opacity-35"
                          style={{
                            background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 300deg, rgba(16, 185, 129, 0.15) 340deg, rgba(52, 211, 153, 0.75) 360deg)'
                          }}
                        />
                      </div>

                      {/* Top HUD Telemetry Banner */}
                      <div className="absolute top-2.5 left-3 flex items-center gap-2 z-20">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/90 border border-emerald-500/70 text-[10px] font-mono text-emerald-300 font-bold backdrop-blur-md shadow-lg">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          TACTICAL RADAR HUD • 63 TỈNH THÀNH
                        </span>
                        <span className="hidden sm:inline-block px-2 py-1 rounded bg-slate-950/80 border border-slate-700/80 text-[10px] font-mono text-cyan-300">
                          9.4 GHz X-BAND
                        </span>
                      </div>

                      <div className="absolute top-2.5 right-3 z-20">
                        <span className="px-2.5 py-1 rounded bg-slate-950/90 border border-indigo-500/60 text-[10px] font-mono text-indigo-300 font-bold backdrop-blur-md">
                          KHÓA MỤC TIÊU: <span className="text-white font-extrabold">{selectedHub.name.toUpperCase()}</span>
                        </span>
                      </div>

                      {/* 12 Hub Interactive Tactical Target Reticles Plotted on Vietnam Map */}
                      {LOGISTICS_HUBS.map((hub) => {
                        const isSelected = selectedHub.id === hub.id;
                        const isCritical = hub.status === 'CRITICAL';
                        const isAlert = hub.status === 'ALERT';
                        const bgColor = isCritical ? 'bg-rose-500' : isAlert ? 'bg-amber-500' : 'bg-emerald-500';

                        return (
                          <button
                            key={hub.id}
                            type="button"
                            onClick={() => {
                              setSelectedHub(hub);
                              if (soundEnabled) cyberSound.playTargetLock();
                            }}
                            className="absolute group z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer focus:outline-none transition-transform hover:scale-125"
                            style={{ left: `${hub.mapX}%`, top: `${hub.mapY}%` }}
                            title={`${hub.name} (${hub.gps}) - Nhấp để khóa mục tiêu`}
                          >
                            {/* Pulsing Outer Wave */}
                            <div className={`absolute -inset-2.5 rounded-full ${bgColor} opacity-40 ${isSelected ? 'animate-ping' : 'animate-pulse'}`} />

                            {/* Rotating HUD Brackets if Selected */}
                            {isSelected && (
                              <div className="absolute -inset-3.5 border border-dashed border-cyan-400 rounded-full animate-spin [animation-duration:8s] pointer-events-none" />
                            )}

                            {/* Center Target Core */}
                            <div className={`w-4 h-4 rounded-full ${bgColor} border-2 border-white flex items-center justify-center shadow-[0_0_12px_currentColor] text-[8px] font-black text-black`}>
                              {hub.num}
                            </div>

                            {/* Floating Target Identification Badge */}
                            <div className={`absolute left-5 -top-2 px-1.5 py-0.5 rounded text-[9px] font-black font-mono tracking-tight whitespace-nowrap shadow-xl border backdrop-blur-md transition-all ${
                              isSelected 
                                ? 'bg-indigo-950/95 border-indigo-400 text-white ring-1 ring-indigo-400 scale-105 z-30' 
                                : 'bg-slate-950/85 border-slate-700/80 text-slate-200 group-hover:bg-slate-900 group-hover:border-cyan-400'
                            }`}>
                              {hub.code} • {hub.shortName}
                              {isSelected && <span className="ml-1 text-cyan-300 font-bold">[LOCKED]</span>}
                            </div>
                          </button>
                        );
                      })}

                      {/* Bottom HUD Telemetry Strip */}
                      <div className="absolute bottom-2 left-3 right-3 z-20 flex items-center justify-between text-[10px] font-mono text-slate-300 bg-slate-950/85 border border-slate-800/90 rounded-lg px-2.5 py-1 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Target className="w-3 h-3" /> GPS: {selectedHub.gps}
                          </span>
                          <span className="hidden sm:inline text-slate-400">ĐỘ LỆCH CÂN: <b className="text-rose-400">{selectedHub.overweightRate}</b></span>
                        </div>
                        <span className="text-cyan-400 font-bold">12/12 MEGA HUB HOẠT ĐỘNG</span>
                      </div>
                    </div>
                  )}

                  {/* ========================================= */}
                  {/* MODE 2: CAMERA HỒNG NGOẠI CCTV SOI CÂN    */}
                  {/* ========================================= */}
                  {radarViewMode === 'CCTV_THERMAL' && (
                    <div className="relative w-full h-[330px] sm:h-[390px] overflow-hidden">
                      {/* Real Surveillance CCTV Thermal Camera Feed Image */}
                      <img 
                        src="/images/warehouse_cctv_scanner.jpg" 
                        alt="Camera Hồng Ngoại Soi Băng Chuyền" 
                        className="w-full h-full object-cover object-center filter brightness-100 contrast-115 select-none pointer-events-none"
                      />

                      {/* Surveillance Camera HUD Frame */}
                      <div className="absolute inset-0 pointer-events-none border-[10px] border-slate-950/40">
                        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
                        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
                        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
                        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />
                      </div>

                      {/* Top Camera Information Banner */}
                      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/90 border border-rose-500/80 text-[10px] font-mono text-rose-400 font-bold backdrop-blur-md">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                          ● LIVE REC [{selectedHub.cctvCam}]
                        </span>
                      </div>

                      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCaptureEvidence}
                          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black font-mono flex items-center gap-1.5 shadow-lg border border-indigo-400 cursor-pointer transition-all active:scale-95"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          CHỤP BẰNG CHỨNG
                        </button>
                      </div>

                      {/* Dynamic Bounding Box Overlay on Packages */}
                      <div className="absolute top-[48%] left-[30%] z-20 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <div className="px-2.5 py-1.5 rounded-lg bg-rose-950/95 border-2 border-rose-500 text-[10px] font-mono text-rose-300 shadow-2xl backdrop-blur-md animate-pulse">
                          <div className="font-black text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> PHÁT HIỆN GIAN LẬN (+1.500g)
                          </div>
                          <div className="text-[9px] text-white">Bưu cục cân: <b>1.850g</b> | AI Soi: <b className="text-emerald-400">350g</b></div>
                          <div className="text-[9px] text-amber-300 font-bold">LỆCH: +1.500g (+32.000 đ/đơn)</div>
                        </div>
                      </div>

                      <div className="absolute top-[43%] left-[68%] z-20 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none hidden sm:block">
                        <div className="px-2.5 py-1.5 rounded-lg bg-emerald-950/90 border-2 border-emerald-500 text-[10px] font-mono text-emerald-300 shadow-xl backdrop-blur-md">
                          <div className="font-black text-emerald-400">✓ CÂN NẶNG ĐẠT CHUẨN</div>
                          <div className="text-[9px] text-white">420g | Khớp 100% SLA</div>
                        </div>
                      </div>

                      {/* Bottom Camera Stats */}
                      <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between text-[10px] font-mono text-cyan-300 bg-slate-950/90 border border-cyan-800/80 rounded-lg px-3 py-1 backdrop-blur-md">
                        <span>BĂNG CHUYỀN: 1.8 m/s • 43 KIỆN/PHÚT</span>
                        <span className="text-amber-400 font-bold">NHIỆT ĐỘ: 18.2°C • LASER 3D ACTIVE</span>
                      </div>
                    </div>
                  )}

                  {/* ========================================= */}
                  {/* MODE 3: KHÔNG ẢNH VỆ TINH KHO BÃI LOGISTICS */}
                  {/* ========================================= */}
                  {radarViewMode === 'SATELLITE_AERIAL' && (
                    <div className="relative w-full h-[330px] sm:h-[390px] overflow-hidden">
                      {/* Top-Down Satellite Photo Image */}
                      <img 
                        src="/images/satellite_hub_recon.jpg" 
                        alt="Không ảnh Vệ tinh Kho Bãi Logistics" 
                        className="w-full h-full object-cover object-center filter brightness-100 contrast-110 select-none pointer-events-none"
                      />

                      {/* Vignette Overlay */}
                      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(2,6,23,0.7)_100%)]" />

                      {/* Top Satellite Information Banner */}
                      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/90 border border-emerald-500/80 text-[10px] font-mono text-emerald-300 font-bold backdrop-blur-md">
                          <Satellite className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          KHÔNG ẢNH VỆ TINH 8K • {selectedHub.shortName.toUpperCase()}
                        </span>
                      </div>

                      <div className="absolute top-4 right-4 z-20">
                        <span className="px-2.5 py-1 rounded bg-slate-950/90 border border-slate-700 text-[10px] font-mono text-slate-300">
                          ĐỘ CAO: 18.500m • GÓC: 144°
                        </span>
                      </div>

                      {/* Center Target Reticle */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-emerald-400/80 border-dashed animate-spin [animation-duration:15s] flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full border border-emerald-300/60 flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                          </div>
                        </div>
                      </div>

                      {/* Bottom Info Banner */}
                      <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between text-[10px] font-mono text-emerald-300 bg-slate-950/90 border border-emerald-800/80 rounded-lg px-3 py-1 backdrop-blur-md">
                        <span>BÃI CONTAINER &amp; CỬA XUẤT NHẬP TỰ ĐỘNG</span>
                        <span className="text-white font-bold">TỌA ĐỘ: {selectedHub.gps}</span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Tactical 12 Hub Selector Panel (Glassmorphism & Clean Regional Filter) */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-2 shadow-lg">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                      <Target className="w-3.5 h-3.5 text-indigo-400" />
                      DANH SÁCH 12 MEGA HUB (CHỌN NHANH):
                    </span>
                    
                    {/* Region Filter Buttons */}
                    <div className="flex items-center gap-1">
                      {['ALL', 'Bắc', 'Trung', 'Nam'].map((reg) => (
                        <button
                          key={reg}
                          type="button"
                          onClick={() => setRegionFilter(reg === 'ALL' ? 'ALL' : `Miền ${reg}`)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                            (reg === 'ALL' && regionFilter === 'ALL') || regionFilter === `Miền ${reg}`
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {reg}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Horizontal Scrollable Hub Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {filteredHubs.map((hub) => {
                      const isSelected = selectedHub.id === hub.id;
                      return (
                        <button
                          key={hub.id}
                          type="button"
                          onClick={() => {
                            setSelectedHub(hub);
                            if (soundEnabled) cyberSound.playTargetLock();
                          }}
                          className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected 
                              ? 'bg-indigo-950/80 border-indigo-500 text-white ring-1 ring-indigo-400 shadow-md' 
                              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="min-w-0 pr-1">
                            <div className="text-[11px] font-bold truncate">#{hub.num} {hub.shortName}</div>
                            <div className="text-[9px] text-slate-400 flex items-center gap-1">
                              <span>{hub.region}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-rose-400 font-mono font-bold">{hub.overweightRate}</span>
                            </div>
                          </div>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            hub.status === 'CRITICAL' ? 'bg-rose-500 animate-pulse' : hub.status === 'ALERT' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column (5 cols): Selected Hub Intelligence & Tactical Actions */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                
                {/* Hub Inspection Detail Card */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 shadow-2xl flex flex-col gap-3">
                  
                  {/* Top Hub Mini Snapshot & Identity */}
                  <div className="flex items-center gap-3 pb-2 border-b border-slate-800/80">
                    {/* Mini live preview camera thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-indigo-500/40 relative shrink-0 bg-slate-900">
                      <img 
                        src="/images/warehouse_cctv_scanner.jpg" 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover filter brightness-90 contrast-125"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[7px] text-emerald-400 font-mono text-center font-bold">
                        LIVE
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-indigo-400 font-bold">
                          {selectedHub.code} • TRẠM #{selectedHub.num}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          selectedHub.status === 'CRITICAL' 
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' 
                            : selectedHub.status === 'ALERT'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {selectedHub.status === 'CRITICAL' ? 'RỦI RO CAO' : selectedHub.status === 'ALERT' ? 'CẦN CHÚ Ý' : 'AN TOÀN'}
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-white truncate">{selectedHub.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        GPS: {selectedHub.gps} • {selectedHub.region}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    {selectedHub.description}
                  </p>

                  {/* 4 Hub Metric Gauges */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">Tỷ lệ nhảy cân khống</span>
                      <span className="text-base font-black font-mono text-rose-400">{selectedHub.overweightRate}</span>
                      <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: selectedHub.overweightRate }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">Om hàng hoàn &gt; 72h</span>
                      <span className="text-base font-black font-mono text-amber-400">{selectedHub.delayedReturnRate}</span>
                      <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: selectedHub.delayedReturnRate }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">Thời gian hoàn COD TB</span>
                      <span className="text-base font-black font-mono text-indigo-300">{selectedHub.avgCodDays}</span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">SLA cam kết: &lt; 2 ngày</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">Sự cố phát hiện gần đây</span>
                      <span className="text-base font-black font-mono text-white">{selectedHub.recentAnomalies} đơn</span>
                      <span className="text-[9px] text-rose-400 block mt-0.5">Đã gắn cờ kiểm tra</span>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-200">
                    <b className="text-white flex items-center gap-1.5 text-[11px]">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Lưu ý đóng hàng tại trạm này:
                    </b>
                    <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                      Bắt buộc chụp ảnh kiện hàng kèm thước đo và lưu biên bản bàn giao có chữ ký bưu tá để AI tự động so khớp đối soát.
                    </p>
                  </div>

                  {/* 2 COMBAT QUICK ACTION BUTTONS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleLaunchDisputeFromHub(selectedHub)}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-black font-mono flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all cursor-pointer active:scale-95"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>GỌI ĐÒI TIỀN NGAY</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportHubDossier(selectedHub)}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/40 text-indigo-300 text-xs font-black font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <FileText className="w-4 h-4" />
                      <span>XUẤT HỒ SƠ ĐỐI SOÁT</span>
                    </button>
                  </div>

                </div>

                {/* Real-time Incident Feed Stream */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2 shadow-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-200 flex items-center gap-1.5 font-mono text-[11px]">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      SỰ CỐ TRINH SÁT THEO THỜI GIAN THỰC
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {LIVE_INCIDENTS.map((inc, i) => (
                      <div key={i} className="p-2 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[11px] flex flex-col gap-0.5">
                        <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                          <span className="text-indigo-400 font-bold">[{inc.time}] {inc.hub}</span>
                          <span className="text-rose-400 font-bold bg-rose-950/60 px-1 py-0.2 rounded border border-rose-900 text-[9px]">
                            {inc.type}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-snug text-[10px]">{inc.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: VOICE CALL WAR ROOM SIMULATOR (SPLIT SCREEN GỌN GÀNG, KHÔNG ĐÈ) */}
        {/* ============================================================== */}
        {activeTab === 'VOICE_CALL' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
            
            {/* Split Screen 2 Cột: Bên trái Điều khiển & Thước đo, Bên phải Màn hình đàm thoại */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              
              {/* CỘT TRÁI (38%): CHỌN TÌNH HUỐNG & ĐIỀU KHIỂN CUỘC GỌI */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                
                {/* 3 Scenario Cards */}
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 block font-mono">
                    1. CHỌN TÌNH HUỐNG TRANH CHẤP:
                  </span>
                  
                  {VOICE_CALL_SCENARIOS.map((scen) => {
                    const isSelected = selectedScenario.id === scen.id;
                    return (
                      <div
                        key={scen.id}
                        onClick={() => {
                          if (isCalling) handleStopCall();
                          setSelectedScenario(scen);
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border-indigo-500 shadow-md ring-1 ring-indigo-400' 
                            : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black text-white">{scen.title}</span>
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold">
                            {scen.disputeAmount}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {scen.subtitle}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Call Control Card */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 block">ĐỐI TÁC BƯU CỤC:</span>
                      <span className="text-xs font-black text-indigo-300 truncate max-w-[200px] block">{selectedScenario.carrier}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-400 block">TIỀN TRANH CHẤP:</span>
                      <span className="text-sm font-black font-mono text-rose-400">{selectedScenario.disputeAmount}</span>
                    </div>
                  </div>

                  {/* Big Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    {!isCalling ? (
                      <button
                        type="button"
                        onClick={handleStartCall}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <PhoneCall className="w-4 h-4 animate-bounce" />
                        <span>BẮT ĐẦU GỌI NGAY</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStopCall}
                        className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <PhoneOff className="w-4 h-4" />
                        <span>GÁC MÁY / HỦY</span>
                      </button>
                    )}

                    {/* Speech Voice Toggle */}
                    <button
                      type="button"
                      onClick={() => setSpeechSynthEnabled(!speechSynthEnabled)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                        speechSynthEnabled 
                          ? 'bg-purple-950 border-purple-700 text-purple-300' 
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                      title="Bật/Tắt giọng đọc AI tiếng Việt thật phát ra loa"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Loa ({speechSynthEnabled ? 'BẬT' : 'TẮT'})</span>
                    </button>
                  </div>

                  {/* Audio Waveform Canvas */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                      <span>VOICE RADAR WAVEFORM</span>
                      <span className="text-indigo-400">
                        {isCalling ? `00:${String(callDuration).padStart(2, '0')}` : 'CHỜ KẾT NỐI'}
                      </span>
                    </div>
                    <canvas ref={canvasRef} width={380} height={40} className="w-full h-[40px] rounded-lg bg-slate-950" />
                  </div>

                  {/* Concession Meter */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 text-[11px]">BƯU CỤC NHƯỢNG BỘ:</span>
                      <span className="font-mono font-black text-sm text-emerald-400">{concessionRate}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                          concessionRate === 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-rose-500'
                        }`} 
                        style={{ width: `${concessionRate}%` }} 
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {concessionRate === 100 
                        ? '🎉 Bưu cục đã đầu hàng, chấp thuận bồi thường 100%!' 
                        : isCalling 
                        ? 'AI đang dồn ép bưu cục bằng căn cứ pháp lý...' 
                        : 'Sẵn sàng tác chiến'}
                    </span>
                  </div>
                </div>

              </div>

              {/* CỘT PHẢI (62%): MÀN HÌNH ĐÀM THOẠI TRỰC TIẾP (HOTLINE CALL MONITOR) */}
              <div className="lg:col-span-7 flex flex-col gap-3">
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 shadow-xl flex flex-col min-h-[440px] max-h-[500px]">
                  
                  {/* Call Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${isCalling ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
                      <span className="text-xs font-black uppercase text-white font-mono">
                        {isCalling ? 'ĐANG KẾT NỐI TRỰC TIẾP VỚI ĐẠI DIỆN BƯU CỤC' : 'MÀN HÌNH ĐÀM THOẠI VOICE AI'}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
                      Luật Bưu Chính 2010
                    </span>
                  </div>

                  {/* Scrollable Dialogue Message Bubbles */}
                  <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
                    {!isCalling && callStep === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                        <PhoneCall className="w-10 h-10 mb-3 text-slate-600 animate-pulse" />
                        <h5 className="font-extrabold text-sm text-slate-400 mb-1">Tổng Đài Đang Ở Chế Độ Chờ</h5>
                        <p className="text-xs text-slate-500 max-w-sm">
                          Bấm nút <b>"BẮT ĐẦU GỌI NGAY"</b> ở bên trái để nghe Trợ lý AI thực chiến đối chất thép với bưu cục bằng từng điều khoản pháp luật.
                        </p>
                      </div>
                    )}

                    {selectedScenario.dialogue.slice(0, callStep + 1).map((item, idx) => {
                      const isAi = item.speaker === 'AI_AGENT';
                      const isCurrent = idx === callStep && isCalling;

                      return (
                        <div 
                          key={idx} 
                          className={`p-3 rounded-2xl border transition-all ${
                            isAi 
                              ? 'bg-indigo-950/40 border-indigo-800/80 ml-4 sm:ml-8' 
                              : 'bg-rose-950/30 border-rose-900/60 mr-4 sm:mr-8'
                          } ${isCurrent ? 'ring-2 ring-indigo-400 shadow-md' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-1.5 text-xs">
                            <span className={`font-black flex items-center gap-1.5 ${isAi ? 'text-indigo-300' : 'text-rose-300'}`}>
                              {isAi ? <Cpu className="w-3.5 h-3.5 text-indigo-400" /> : <PhoneCall className="w-3.5 h-3.5 text-rose-400" />}
                              {isAi ? '🤖 AI Kiểm Toán SoatDon.vn:' : '👨‍💼 Đại Diện Bưu Cục:'}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded-full animate-pulse border border-amber-800">
                                ĐANG NÓI...
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                            {item.text}
                          </p>
                        </div>
                      );
                    })}

                    {/* Victory Banner inside chat */}
                    {callSuccess && (
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-teal-950/90 to-slate-900 border border-emerald-500/60 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in mt-3">
                        <div className="flex items-center gap-2.5">
                          <Award className="w-6 h-6 text-emerald-400 shrink-0" />
                          <div>
                            <div className="font-extrabold text-xs text-white">ĐÒI TIỀN THÀNH CÔNG: {selectedScenario.disputeAmount}</div>
                            <div className="text-[11px] text-emerald-300">Bưu cục đã chấp thuận bồi thường 100% vào kỳ đối soát tới.</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => alert(`Đã xuất biên bản thỏa thuận hòa giải giá trị ${selectedScenario.disputeAmount}!`)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all cursor-pointer whitespace-nowrap shrink-0"
                        >
                          Tải Biên Bản A4
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

        {/* FOOTER BAR */}
        <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300 font-mono text-[11px]">Hệ thống Trinh sát Radar &amp; Voice Call AI hoạt động với độ tin cậy 99.98%</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer text-xs"
          >
            Đóng Cửa Sổ (Esc)
          </button>
        </div>

      </div>
    </div>
  );
}
