import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Radio, Satellite, ShieldAlert, ShieldCheck, PhoneCall, PhoneOff, 
  Volume2, VolumeX, Activity, AlertTriangle, Play, Pause, RotateCcw, 
  MapPin, CheckCircle2, Flame, Sparkles, TrendingUp, Layers, ChevronRight,
  Zap, Award, Lock, ArrowUpRight, Cpu, Clock, Terminal
} from 'lucide-react';
import { cyberSound } from '../utils/cyberSoundEngine';

// Danh sách 12 Mega Hub Logistics huyết mạch toàn quốc
const LOGISTICS_HUBS = [
  {
    id: 'HN_LB',
    name: 'Kho Mega Long Biên (Hà Nội)',
    region: 'Miền Bắc',
    x: 62, // Tỷ lệ % tọa độ trên bản đồ SVG
    y: 18,
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
    name: 'Mega Hub Bắc Ninh (Kho Yên Phong)',
    region: 'Miền Bắc',
    x: 66,
    y: 15,
    status: 'CRITICAL',
    overweightRate: '22.4%',
    delayedReturnRate: '31.5%',
    avgCodDays: '4.1 ngày',
    riskScore: 92,
    topRiskCarrier: 'SPX & TikTok Logistics',
    recentAnomalies: 156,
    description: 'Kho phân loại tự động lớn nhất miền Bắc. Băng chuyền quang học hay lỗi nhận diện kích thước thùng giấy.'
  },
  {
    id: 'HP_DV',
    name: 'Kho Cảng Đình Vũ (Hải Phòng)',
    region: 'Miền Bắc',
    x: 74,
    y: 20,
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
    name: 'Kho Trung Chuyển Vinh (Nghệ An)',
    region: 'Bắc Trung Bộ',
    x: 55,
    y: 32,
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
    name: 'Mega Hub Hòa Cầm (Đà Nẵng)',
    region: 'Miền Trung',
    x: 64,
    y: 45,
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
    name: 'Kho Vận Quy Nhơn (Bình Định)',
    region: 'Nam Trung Bộ',
    x: 72,
    y: 56,
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
    name: 'Kho Pleiku (Gia Lai - Tây Nguyên)',
    region: 'Tây Nguyên',
    x: 60,
    y: 59,
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
    name: 'Kho Diên Khánh (Khánh Hòa - Nha Trang)',
    region: 'Nam Trung Bộ',
    x: 75,
    y: 68,
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
    name: 'Mega Hub Củ Chi (TP. Hồ Chí Minh)',
    region: 'Miền Nam',
    x: 52,
    y: 81,
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
    name: 'Kho Sóng Thần (Dĩ An - Bình Dương)',
    region: 'Đông Nam Bộ',
    x: 58,
    y: 79,
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
    name: 'Kho Amata (Biên Hòa - Đồng Nai)',
    region: 'Đông Nam Bộ',
    x: 63,
    y: 80,
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
    name: 'Mega Hub Tây Đô (Cần Thơ)',
    region: 'Đồng Bằng Sông Cửu Long',
    x: 44,
    y: 91,
    status: 'ALERT',
    overweightRate: '17.3%',
    delayedReturnRate: '33.1%',
    avgCodDays: '4.2 ngày',
    riskScore: 79,
    topRiskCarrier: 'GHN & VNPost',
    recentAnomalies: 88,
    description: 'Cửa ngõ miền Tây sông nước. Bưu tá thường báo hủy ảo vì lý do "nước nổi / xa đường ô tô".'
  }
];

// Danh sách các vụ việc trinh sát thời gian thực
const LIVE_INCIDENTS = [
  { time: '00:04:12', hub: 'Kho Củ Chi Mega Hub', carrier: 'SPX', type: 'KÊ KHỐNG CÂN NẶNG', detail: 'Phát hiện 28 đơn nấc 350g bị máy quét đo tự động nhảy lên 1.850g (+32.000đ/đơn).' },
  { time: '00:05:40', hub: 'Mega Hub Bắc Ninh', carrier: 'GHTK', type: 'NGÂM HÀNG HOÀN', detail: '34 bưu kiện shop thời trang hoàn kho đã quá 9 ngày chưa điều phối giao về shop.' },
  { time: '00:06:15', hub: 'Mega Hub Hòa Cầm (Đà Nẵng)', carrier: 'GHN', type: 'LỆCH TIỀN COD', detail: 'Đơn mã GHN-998271 thu khách 850.000đ nhưng bảng kê đối soát chỉ ghi 650.000đ.' },
  { time: '00:07:02', hub: 'Kho Sóng Thần (Bình Dương)', carrier: 'J&T', type: 'GIAO ẢO / HỦY BỪNG', detail: 'Bưu tá cập nhật "Khách từ chối nhận" nhưng khách gửi log chứng minh không có cuộc gọi nào.' },
  { time: '00:08:29', hub: 'Mega Hub Tây Đô (Cần Thơ)', carrier: 'VNPost', type: 'OM TIỀN COD', detail: 'Dòng tiền COD 32.400.000đ bị giữ lại quá 5 ngày làm việc vượt cam kết SLA.' }
];

// 3 Kịch bản gọi điện tác chiến của Tổng Đài AI
const VOICE_CALL_SCENARIOS = [
  {
    id: 'SCENARIO_1',
    title: 'Đòi Đền Bù Hàng Bể Vỡ 1.450.000đ',
    subtitle: 'Bưu tá làm bể vỡ chai nước hoa cao cấp nhưng đổ lỗi shop đóng gói ẩu',
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
    title: 'Ép Hoàn Tiền Cân Khống 45 Đơn (1.890.000đ)',
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
    title: 'Truy Thu Gấp 12.500.000đ COD Bị Om 7 Ngày',
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
  const [carrierFilter, setCarrierFilter] = useState('ALL');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Voice Call State
  const [selectedScenario, setSelectedScenario] = useState(VOICE_CALL_SCENARIOS[0]);
  const [isCalling, setIsCalling] = useState(false);
  const [callStep, setCallStep] = useState(0); // Index in dialogue
  const [callDuration, setCallDuration] = useState(0);
  const [callSuccess, setCallSuccess] = useState(false);
  const [concessionRate, setConcessionRate] = useState(0); // 0% to 100%
  const [speechSynthEnabled, setSpeechSynthEnabled] = useState(true);
  
  const timerRef = useRef(null);
  const dialogTimeoutRef = useRef(null);
  const canvasRef = useRef(null);

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
    }, 6000);
    return () => clearInterval(interval);
  }, [isOpen, activeTab, soundEnabled]);

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
      const barCount = 36;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const time = Date.now() * 0.008;
        const amp = isCalling && !callSuccess 
          ? Math.abs(Math.sin(time + i * 0.3) * (height * 0.45)) + 4 
          : 6;

        ctx.fillStyle = i % 2 === 0 ? '#6366f1' : '#ec4899';
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
    setConcessionRate(10);

    // Phát chuông điện thoại
    if (soundEnabled) {
      cyberSound.playPhoneRing();
      setTimeout(() => cyberSound.playPhoneRing(), 1600);
    }

    // Sau 3.5s bắt đầu đàm thoại
    setTimeout(() => {
      if (soundEnabled) cyberSound.playPhoneConnect();
      runDialogueStep(0);
      
      // Bắt đầu bộ đếm giây cuộc gọi
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }, 3200);
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

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-xl p-2 sm:p-4 flex items-center justify-center animate-fade-in"
    >
      <div className="bg-slate-900 border border-indigo-500/30 w-full max-w-6xl rounded-3xl shadow-[0_0_60px_-15px_rgba(99,102,241,0.35)] overflow-hidden flex flex-col my-auto max-h-[95vh] relative text-slate-100">
        
        {/* TOP COMMAND HUD BAR */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-950/90 border-b border-indigo-900/50 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 text-indigo-400 flex items-center justify-center shrink-0 relative">
              <Satellite className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-400/40 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base tracking-wide bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                  AI LOGISTICS WAR ROOM &amp; RADAR BƯU CỤ 63 TỈNH
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider">
                  VỆ TINH LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-mono">
                Hệ thống trinh sát điểm đen gian lận cước &amp; Tổng đài Voice AI đòi tiền tự động
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
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

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors flex items-center justify-center cursor-pointer shrink-0"
              title="Đóng phòng tác chiến (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODE NAVIGATION TABS */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('RADAR')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'RADAR'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-400 animate-spin-slow" />
              <span>🛰️ Bản Đồ Vệ Tinh Radar Trinh Sát</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('VOICE_CALL')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'VOICE_CALL'
                  ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              <PhoneCall className="w-4 h-4 text-amber-300 animate-bounce" />
              <span>🎙️ Tổng Đài Voice AI Đòi Tiền (Gọi Thử Nghiệm)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase">
                MIND-BLOWING
              </span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              PULSE: 12 TRẠM MEGA
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-indigo-300">ĐỘ TRỄ SỐ LIỆU: &lt; 0.2s</span>
          </div>
        </div>

        {/* TAB 1: RADAR RECONNAISSANCE MAP */}
        {activeTab === 'RADAR' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-6">
            
            {/* Top Stat Ticker */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-xs">
                <span className="text-[11px] text-slate-400 block font-semibold">TỔNG ĐƠN ĐANG THEO DÕI</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-white">482.910</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> +12.4% lưu lượng hôm nay
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-rose-900/40 shadow-xs">
                <span className="text-[11px] text-rose-300 block font-semibold">ĐƠN BỊ KÊ KHỐNG CÂN (24H)</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-rose-400">3.491 đơn</span>
                <span className="text-[10px] text-rose-300 mt-0.5 block">Ước tính lệch: ~98.200.000 đ</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-amber-900/40 shadow-xs">
                <span className="text-[11px] text-amber-300 block font-semibold">ĐƠN HOÀN OM QUÁ 72H</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-amber-400">1.820 đơn</span>
                <span className="text-[10px] text-amber-300 mt-0.5 block">Tập trung: Củ Chi &amp; Hòa Cầm</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-indigo-900/40 shadow-xs">
                <span className="text-[11px] text-indigo-300 block font-semibold">ĐÃ ĐÒI HOÀN TIỀN THÀNH CÔNG</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">89.4% vụ</span>
                <span className="text-[10px] text-emerald-300 mt-0.5 block">Thời gian giải quyết: ~18 giờ</span>
              </div>
            </div>

            {/* Interactive Cyber Map & Hub Details Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* Vietnam Cyber SVG Map Box */}
              <div className="lg:col-span-7 bg-slate-950/80 rounded-3xl border border-indigo-500/20 p-4 sm:p-6 relative overflow-hidden min-h-[480px] flex flex-col justify-between">
                
                {/* Background Radar Grid lines */}
                <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[380px] h-[380px] rounded-full border border-indigo-500/15 animate-ping opacity-25" />
                  <div className="w-[260px] h-[260px] rounded-full border border-indigo-500/20" />
                  <div className="w-[120px] h-[120px] rounded-full border border-indigo-500/25" />
                </div>

                {/* Header overlay */}
                <div className="relative z-10 flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono">
                      BẢN ĐỒ HUYẾT MẠCH BƯU CHÍNH (VIỆT NAM CYBER RECON)
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-400 bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-800">
                    Bấm vào từng Hub để soi rủi ro
                  </span>
                </div>

                {/* SVG Vietnam Map Outline & Pulsing Hub Nodes */}
                <div className="relative w-full h-[400px] flex items-center justify-center my-2">
                  <svg viewBox="0 0 100 100" className="w-full h-full max-h-[390px] drop-shadow-[0_0_20px_rgba(99,102,241,0.25)]">
                    {/* Đường bờ biển hình chữ S Việt Nam cách điệu mượt mà */}
                    <path
                      d="M 58 12 Q 68 15 65 24 Q 56 30 54 38 Q 63 46 70 54 Q 74 65 68 76 Q 58 84 52 88 Q 42 94 40 92 Q 38 88 46 84 Q 52 79 56 68 Q 50 56 46 44 Q 48 32 54 22 Z"
                      fill="rgba(30, 41, 59, 0.45)"
                      stroke="#4f46e5"
                      strokeWidth="1.2"
                      strokeDasharray="2 1"
                    />

                    {/* Tuyến đường nối logistics Bắc - Trung - Nam */}
                    <path
                      d="M 66 15 L 62 18 L 55 32 L 64 45 L 72 56 L 68 76 L 58 79 L 52 81 L 44 91"
                      fill="none"
                      stroke="rgba(99, 102, 241, 0.4)"
                      strokeWidth="0.8"
                      strokeDasharray="1 1.5"
                    />

                    {/* Vòng quét Radar quay tròn */}
                    <line x1="58" y1="50" x2="90" y2="20" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="0.8" className="origin-center animate-radar" />

                    {/* 12 Hub Nodes */}
                    {LOGISTICS_HUBS.map((hub) => {
                      const isSelected = selectedHub.id === hub.id;
                      const isCritical = hub.status === 'CRITICAL';
                      const isAlert = hub.status === 'ALERT';

                      return (
                        <g 
                          key={hub.id} 
                          className="cursor-pointer group"
                          onClick={() => {
                            setSelectedHub(hub);
                            if (soundEnabled) cyberSound.playSonarPing();
                          }}
                        >
                          {/* Pulsing ring */}
                          <circle
                            cx={hub.x}
                            cy={hub.y}
                            r={isSelected ? 3.5 : 2.5}
                            fill={isCritical ? 'rgba(239, 68, 68, 0.4)' : isAlert ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'}
                            className="animate-ping"
                          />
                          {/* Inner Node */}
                          <circle
                            cx={hub.x}
                            cy={hub.y}
                            r={isSelected ? 2.8 : 2.0}
                            fill={isCritical ? '#ef4444' : isAlert ? '#f59e0b' : '#10b981'}
                            stroke="#ffffff"
                            strokeWidth="0.6"
                          />
                          {/* Label tooltip */}
                          <text
                            x={hub.x + 3.2}
                            y={hub.y + 0.8}
                            fill={isSelected ? '#ffffff' : '#94a3b8'}
                            fontSize="2.8"
                            fontWeight={isSelected ? 'bold' : 'normal'}
                            className="select-none group-hover:fill-indigo-300 transition-colors"
                          >
                            {hub.name.split('(')[0]}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Map Legend */}
                <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> Báo động đỏ (Nguy cơ cao)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> Cảnh báo
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Bình thường
                    </span>
                  </div>
                  <span className="font-mono text-indigo-400">GPS: VN-LOG-RADAR-V3</span>
                </div>
              </div>

              {/* Hub Inspection Detail Card */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="p-5 rounded-3xl bg-slate-950/90 border border-indigo-500/30 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-indigo-400" />
                      <div>
                        <h4 className="font-black text-sm text-white">{selectedHub.name}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">{selectedHub.region}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      selectedHub.status === 'CRITICAL' 
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' 
                        : selectedHub.status === 'ALERT'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {selectedHub.status === 'CRITICAL' ? 'NGUY CƠ CAO (92/100)' : selectedHub.status === 'ALERT' ? 'CẦN CHÚ Ý' : 'AN TOÀN'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4 p-3 rounded-xl bg-slate-900 border border-slate-800">
                    {selectedHub.description}
                  </p>

                  {/* 4 Hub Metric Gauges */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs mb-4">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block font-medium">Tỷ lệ nhảy cân khống</span>
                      <span className="text-base font-black font-mono text-rose-400">{selectedHub.overweightRate}</span>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: selectedHub.overweightRate }} />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block font-medium">Om hàng hoàn &gt; 72h</span>
                      <span className="text-base font-black font-mono text-amber-400">{selectedHub.delayedReturnRate}</span>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: selectedHub.delayedReturnRate }} />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block font-medium">Thời gian hoàn COD TB</span>
                      <span className="text-base font-black font-mono text-indigo-300">{selectedHub.avgCodDays}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Cam kết SLA: &lt; 2 ngày</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block font-medium">Bưu cục rủi ro nhất</span>
                      <span className="text-xs font-black text-rose-300 mt-1 block truncate">{selectedHub.topRiskCarrier}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{selectedHub.recentAnomalies} đơn lỗi gần đây</span>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-200 space-y-1 mb-4">
                    <b className="text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Khuyến nghị từ SoatDon.vn:
                    </b>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Khi gửi hàng qua trạm này, shop bắt buộc phải chụp ảnh kiện hàng kèm thước đo và lưu biên bản bàn giao có chữ ký bưu tá để đối soát tự động.
                    </p>
                  </div>
                </div>

                {/* Real-time Incident Feed Stream */}
                <div className="p-4 rounded-3xl bg-slate-950/90 border border-slate-800 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-200 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      NHẬT KÝ SỰ CỐ TRINH SÁT (REAL-TIME FEED)
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {LIVE_INCIDENTS.map((inc, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[11px] flex flex-col gap-0.5">
                        <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                          <span className="text-indigo-400 font-bold">[{inc.time}] {inc.hub}</span>
                          <span className="text-rose-400 font-bold bg-rose-950/60 px-1.5 py-0.2 rounded border border-rose-900">
                            {inc.type}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-snug">{inc.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: VOICE CALL WAR ROOM SIMULATOR */}
        {activeTab === 'VOICE_CALL' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-6">
            
            {/* Scenario Picker Carousel */}
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2.5">
                1. CHỌN TÌNH HUỐNG TRANH CHẤP CẦN TỔNG ĐÀI AI GỌI ĐÒI TIỀN:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {VOICE_CALL_SCENARIOS.map((scen) => {
                  const isSelected = selectedScenario.id === scen.id;
                  return (
                    <div
                      key={scen.id}
                      onClick={() => {
                        if (isCalling) handleStopCall();
                        setSelectedScenario(scen);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400' 
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-white">{scen.title}</span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold">
                          {scen.disputeAmount}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {scen.subtitle}
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-indigo-300 font-mono">
                        <span>{scen.carrier}</span>
                        <span>{scen.dialogue.length} lượt đàm thoại</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LIVE AUDIO WAR ROOM CALL CONSOLE */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-indigo-500/30 relative overflow-hidden flex flex-col gap-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${isCalling ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
                    <h4 className="text-base sm:text-lg font-black text-white">
                      {isCalling ? 'CUỘC GỌI TÁC CHIẾN ĐANG DIỄN RA TRỰC TIẾP' : 'SẴN SÀNG KẾT NỐI TỔNG ĐÀI ĐÒI TIỀN'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    Đầu nối bưu cục: <b className="text-indigo-400">{selectedScenario.carrier}</b> • Giá trị tranh chấp: <b className="text-rose-400">{selectedScenario.disputeAmount}</b>
                  </p>
                </div>

                {/* Call Control Buttons */}
                <div className="flex items-center gap-3">
                  {/* TTS Speech Toggle */}
                  <button
                    type="button"
                    onClick={() => setSpeechSynthEnabled(!speechSynthEnabled)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      speechSynthEnabled 
                        ? 'bg-purple-950/80 border-purple-700 text-purple-300' 
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                    title="Bật/Tắt giọng đọc AI tiếng Việt thật phát ra loa"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Giọng Nói AI ({speechSynthEnabled ? 'BẬT' : 'TẮT'})</span>
                  </button>

                  {!isCalling ? (
                    <button
                      type="button"
                      onClick={handleStartCall}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                    >
                      <PhoneCall className="w-4 h-4 animate-bounce" />
                      <span>BẮT ĐẦU GỌI NGAY</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStopCall}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <PhoneOff className="w-4 h-4" />
                      <span>GÁC MÁY / HỦY</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Call Waveform Visualizer & Concession Gauge */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                <div className="md:col-span-8 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>AUDIO WAVEFORM (VOICE RADAR)</span>
                    <span className="text-indigo-400">
                      THỜI LƯỢNG: {String(Math.floor(callDuration / 60)).padStart(2, '0')}:{String(callDuration % 60).padStart(2, '0')}
                    </span>
                  </div>
                  {/* Canvas visualizer */}
                  <canvas ref={canvasRef} width={600} height={60} className="w-full h-[60px] rounded-xl bg-slate-950" />
                </div>

                <div className="md:col-span-4 p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">TỶ LỆ BƯU CỤC NHƯỢNG BỘ:</span>
                    <span className="font-mono font-black text-base text-emerald-400">{concessionRate}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        concessionRate === 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-rose-500'
                      }`} 
                      style={{ width: `${concessionRate}%` }} 
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {concessionRate === 100 
                      ? '🎉 Bưu cục đã chấp thuận bồi thường 100%!' 
                      : isCalling 
                      ? 'AI đang dùng Luật Bưu chính dồn ép lý lẽ...' 
                      : 'Chưa kết nối'}
                  </span>
                </div>
              </div>

              {/* Dynamic Transcript Live Dialogue Stream */}
              <div className="space-y-3 min-h-[220px] max-h-[340px] overflow-y-auto pr-2">
                {!isCalling && callStep === 0 && (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    <PhoneCall className="w-8 h-8 mx-auto mb-2 text-slate-600 animate-pulse" />
                    Bấm <b>"BẮT ĐẦU GỌI NGAY"</b> ở trên để nghe Trợ lý AI thực chiến đối chất thép với bưu cục bằng Luật Bưu chính 2010.
                  </div>
                )}

                {selectedScenario.dialogue.slice(0, callStep + 1).map((item, idx) => {
                  const isAi = item.speaker === 'AI_AGENT';
                  const isCurrent = idx === callStep && isCalling;

                  return (
                    <div 
                      key={idx} 
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isAi 
                          ? 'bg-indigo-950/40 border-indigo-800/80 ml-6 sm:ml-12' 
                          : 'bg-rose-950/30 border-rose-900/60 mr-6 sm:mr-12'
                      } ${isCurrent ? 'ring-2 ring-indigo-400 shadow-md' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1 text-xs">
                        <span className={`font-black flex items-center gap-1.5 ${isAi ? 'text-indigo-300' : 'text-rose-300'}`}>
                          {isAi ? <Cpu className="w-3.5 h-3.5 text-indigo-400" /> : <PhoneCall className="w-3.5 h-3.5 text-rose-400" />}
                          {isAi ? '🤖 AI Kiểm Toán SoatDon.vn (Bên Khiếu Nại):' : '👨‍💼 Đại Diện Bưu Cục Vận Chuyển:'}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.2 rounded-full animate-pulse border border-amber-800">
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
              </div>

              {/* Victory Voucher Banner when 100% Won */}
              {callSuccess && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-teal-950/80 to-slate-900 border border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-sm text-white flex items-center gap-2">
                        ĐÒI TIỀN THÀNH CÔNG RỰC RỠ: {selectedScenario.disputeAmount}
                      </h5>
                      <p className="text-xs text-emerald-300">
                        Bưu cục đã đồng ý lập biên bản bồi thường 100% và duyệt giảm trừ cước vào kỳ thanh toán tới.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      alert(`Đã xuất biên bản thỏa thuận hòa giải có chữ ký số xác thực giá trị ${selectedScenario.disputeAmount}!`);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Tải Biên Bản Thỏa Thuận A4
                  </button>
                </div>
              )}

            </div>

          </div>
        )}

        {/* FOOTER BAR */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300 font-mono">Hệ thống Trinh sát &amp; Voice Call AI hoạt động với độ tin cậy 99.98%</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer"
          >
            Đóng Phòng Tác Chiến
          </button>
        </div>

      </div>
    </div>
  );
}
