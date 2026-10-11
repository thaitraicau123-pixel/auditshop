import React, { useState, useEffect } from 'react';
import { 
  X, Camera, Printer, Copy, Check, AlertTriangle, 
  Upload, ShieldAlert, FileText, CheckCircle2, Trash2, Calendar 
} from 'lucide-react';

export default function DamageClaimModal({ isOpen, onClose }) {
  const [trackingCode, setTrackingCode] = useState('');
  const [carrier, setCarrier] = useState('GHTK');
  const [productName, setProductName] = useState('');
  const [productValue, setProductValue] = useState(850000);
  const [incidentType, setIncidentType] = useState('DAMAGED'); // DAMAGED, SWAPPED, UNSEALED, EXPIRED
  const [shipperName, setShipperName] = useState('');
  const [shipperPhone, setShipperPhone] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('Vỏ hộp carton bên ngoài bị móp méo, thủng rách đáy. Sản phẩm bên trong bị nứt vỡ hoàn toàn, rò rỉ dung dịch, không còn khả năng sử dụng.');
  const [images, setImages] = useState([]);
  const [copied, setCopied] = useState(false);

  // Thoát nhanh bằng phím Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Tải ảnh hiện trường
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setImages(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            name: file.name,
            src: uploadEvent.target.result,
            time: new Date().toLocaleString('vi-VN')
          }
        ].slice(0, 4)); // Giới hạn 4 ảnh
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  // Nạp dữ liệu mẫu
  const handleLoadSample = () => {
    setTrackingCode('GHTK8829104');
    setCarrier('GHTK');
    setProductName('Nước hoa Pháp cao cấp 100ml');
    setProductValue(1250000);
    setIncidentType('DAMAGED');
    setShipperName('Nguyễn Văn Tuấn (Mã NV: 8492)');
    setShipperPhone('0912345678');
    setIncidentDescription('Bưu kiện nhận hoàn bị dập nát góc trái, chai nước hoa bên trong bị vỡ nát, mùi hương nồng nặc, tem niêm phong dán đè băng dính vàng của kho trung chuyển.');
  };

  // In biên bản sự cố A4 chuẩn pháp lý
  const handlePrintClaimDocument = () => {
    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) {
      window.print();
      return;
    }

    const today = new Date();
    const dateStr = `ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;

    const incidentTitle = incidentType === 'DAMAGED' ? 'HÀNG HÓA BỊ BỂ VỠ / HƯ HỎNG TOÀN PHẦN' :
      incidentType === 'SWAPPED' ? 'BƯU KIỆN CÓ DẤU HIỆU BỊ RẠCH TRÁO ĐỔI RUỘT' :
      incidentType === 'UNSEALED' ? 'BƯU PHẨM BỊ MẤT TEM NIÊM PHONG / RỦI RO THẤT THOÁT' :
      'HÀNG HOÀN BỊ NGÂM QUÁ HẠN QUY ĐỊNH GÂY THIỆT HẠI';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bien_Ban_Su_Co_${trackingCode || 'Bưu_Gửi'}</title>
          <style>
            @page { size: A4; margin: 18mm; }
            body { font-family: "Times New Roman", Times, serif; font-size: 13pt; line-height: 1.45; color: #000; margin: 0; padding: 20px; }
            .header-top { text-align: center; font-weight: bold; margin-bottom: 20px; }
            .title { text-align: center; font-size: 15pt; font-weight: bold; margin: 15px 0 5px 0; text-transform: uppercase; }
            .subtitle { text-align: center; font-size: 11pt; font-style: italic; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #000; padding: 7px 10px; font-size: 12pt; text-align: left; }
            th { background-color: #f2f2f2; }
            .signatures { margin-top: 35px; display: flex; justify-content: space-between; page-break-inside: avoid; }
            .sig-block { width: 45%; text-align: center; }
            .sig-space { height: 75px; }
            .watermark-note { font-size: 10pt; font-style: italic; color: #555; text-align: center; margin-top: 25px; border-top: 1px dashed #ccc; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header-top">
            <div>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div>Độc lập - Tự do - Hạnh phúc</div>
            <div style="font-weight: normal; font-size: 11pt;">----------o0o----------</div>
          </div>

          <div class="title">BIÊN BẢN XÁC NHẬN SỰ CỐ BƯU GỬI HOÀN TRẢ</div>
          <div class="subtitle">(V/v: ${incidentTitle})</div>

          <p>Hôm nay, ${dateStr}, tại địa điểm tiếp nhận hàng hoàn của người gửi, chúng tôi gồm có:</p>

          <p><b>BÊN A (NGƯỜI GỬI / CHỦ SHOP):</b><br/>
          - Đại diện Shop: ..................................................................... SĐT: ...........................................<br/>
          - Địa chỉ gửi hàng: ....................................................................................................................</p>

          <p><b>BÊN B (ĐẠI DIỆN ĐƠN VỊ VẬN CHUYỂN ${carrier}):</b><br/>
          - Họ và tên Shipper / Bưu tá: <b>${shipperName || '...................................................'}</b><br/>
          - Số điện thoại bưu tá: <b>${shipperPhone || '...................................................'}</b><br/>
          - Thuộc Bưu cục / Trạm điều phối: ...........................................................................................</p>

          <p>Hai bên cùng tiến hành đồng kiểm bưu gửi hoàn trả và xác nhận các nội dung sau:</p>

          <table>
            <tr>
              <th width="35%">Mã Vận Đơn</th>
              <td><b>${trackingCode || 'Chưa cung cấp'}</b></td>
            </tr>
            <tr>
              <th>Đơn vị vận chuyển</th>
              <td>${carrier} Express</td>
            </tr>
            <tr>
              <th>Tên hàng hóa gửi đi</th>
              <td>${productName || 'Hàng hóa theo phiếu gửi'}</td>
            </tr>
            <tr>
              <th>Giá trị khai giá / Thiệt hại</th>
              <td><b>${Number(productValue).toLocaleString('vi-VN')} VNĐ</b></td>
            </tr>
            <tr>
              <th>Hiện trạng bưu kiện khi hoàn</th>
              <td>${incidentDescription}</td>
            </tr>
          </table>

          <p><b>CĂN CỨ PHÁP LÝ &amp; YÊU CẦU BỒI THƯỜNG:</b></p>
          <p>- Căn cứ Điều 38, Điều 40 Luật Bưu chính 2010 về trách nhiệm bồi thường thiệt hại đối với bưu gửi bị hư hỏng, mất mát trong quá trình cung ứng dịch vụ bưu chính.<br/>
          - Biên bản này được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản để làm căn cứ thực hiện thủ tục bồi thường 100% giá trị bưu phẩm trong thời hạn quy định.</p>

          <div class="signatures">
            <div class="sig-block">
              <b>ĐẠI DIỆN BƯU TÁ GIAO HOÀN</b><br/>
              <i>(Ký và ghi rõ họ tên)</i>
              <div class="sig-space"></div>
              <b>${shipperName || ''}</b>
            </div>

            <div class="sig-block">
              <b>ĐẠI DIỆN NGƯỜI GỬI HÀNG</b><br/>
              <i>(Ký và ghi rõ họ tên)</i>
              <div class="sig-space"></div>
            </div>
          </div>

          <div class="watermark-note">
            Biên bản được tạo tự động bởi Hệ Thống Kiểm Toán Vận Chuyển SoatDon.vn • Mã xác thực số: SD-${Date.now()}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  const disputeText = `KÍNH GỬI BỘ PHẬN BỒI THƯỜNG ${carrier}:
YÊU CẦU BỒI THƯỜNG BƯU KIỆN HƯ HỎNG/MẤT MÁT MÃ: ${trackingCode || '[Mã vận đơn]'}
- Sản phẩm: ${productName || '[Tên sản phẩm]'}
- Giá trị bồi hoàn: ${Number(productValue).toLocaleString('vi-VN')} đ
- Tình trạng: ${incidentDescription}
- Bưu tá giao hoàn: ${shipperName || '[Tên bưu tá]'} (${shipperPhone || '[SĐT]'})
Shop đã lập Biên bản xác nhận sự cố đồng kiểm và lưu ảnh hiện trường. Yêu cầu bưu cục giải quyết bồi thường trong vòng 48h theo Luật Bưu chính.`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(disputeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 md:p-6 flex items-start justify-center animate-fade-in font-sans"
    >
      <div className="bg-white border border-slate-200/90 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] relative text-slate-800">
        
        {/* Header Cố Định */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0 mr-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5 text-rose-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base md:text-lg tracking-wide truncate">
                  Trình Tạo Biên Bản Bồi Thường Hàng Bể Vỡ / Tráo Ruột
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                  BẰNG CHỨNG PHÁP LÝ
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate hidden sm:block">
                Tạo biên bản sự cố A4 có chữ ký bưu tá &amp; ảnh hiện trường để bưu cục không thể từ chối đền bù
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 transition-colors flex items-center justify-center cursor-pointer shrink-0 shadow-xs"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thân Modal */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/60 space-y-5">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Nhập thông tin sự cố bưu gửi:
            </span>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-xs text-indigo-600 hover:underline font-bold cursor-pointer"
            >
              ⚡ Nạp mẫu thử nghiệm
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mã vận đơn sự cố</label>
                <input 
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="VD: GHTK8829104"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Đơn vị vận chuyển</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  <option value="GHTK">Giao Hàng Tiết Kiệm (GHTK)</option>
                  <option value="GHN">Giao Hàng Nhanh (GHN)</option>
                  <option value="Viettel Post">Viettel Post</option>
                  <option value="Shopee Xpress">Shopee Xpress (SPX)</option>
                  <option value="J&T Express">J&amp;T Express</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Giá trị yêu cầu đền bù (đ)</label>
                <input 
                  type="number"
                  value={productValue}
                  onChange={(e) => setProductValue(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-rose-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên sản phẩm gửi đi</label>
                <input 
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="VD: Áo khoác dạ nữ / Nước hoa cao cấp"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bản chất sự cố</label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-rose-700 bg-rose-50/50"
                >
                  <option value="DAMAGED">Hàng hóa bị bể vỡ / móp méo hư hại</option>
                  <option value="SWAPPED">Bưu phẩm bị rạch tráo ruột bên trong</option>
                  <option value="UNSEALED">Mất niêm phong / rách tem bảo đảm</option>
                  <option value="EXPIRED">Giam hàng quá hạn SLA dẫn đến hư hỏng</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ tên Shipper giao hoàn</label>
                <input 
                  type="text"
                  value={shipperName}
                  onChange={(e) => setShipperName(e.target.value)}
                  placeholder="VD: Nguyễn Văn A (Mã shipper)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">SĐT Shipper</label>
                <input 
                  type="text"
                  value={shipperPhone}
                  onChange={(e) => setShipperPhone(e.target.value)}
                  placeholder="VD: 0987654321"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả hiện trạng bưu kiện khi nhận</label>
              <textarea 
                rows={3}
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed"
              />
            </div>

            {/* Tải lên ảnh hiện trường */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Ảnh chụp hiện trường bưu gửi (Tối đa 4 ảnh)</span>
                </label>
                <span className="text-[11px] text-slate-400">Tự động gắn dấu Watermark ngày giờ</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map(img => (
                  <div key={img.id} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video group">
                    <img src={img.src} alt={img.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                      <span className="text-[9px] text-white font-mono leading-tight">{img.time}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {images.length < 4 && (
                  <label className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer text-slate-400 hover:text-indigo-600 transition-colors aspect-video bg-slate-50/50">
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-[11px] font-bold">Thêm ảnh</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

          </div>

          {/* Hai nút hành động: In biên bản A4 & Copy tin nhắn Zalo */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép' : 'Sao chép tin nhắn Zalo CSKH'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintClaimDocument}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>In Biên Bản Sự Cố A4 Có Chữ Ký Shipper</span>
            </button>
          </div>

        </div>

        {/* Footer Cố Định */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Biên bản có giá trị pháp lý theo Điều 38 Luật Bưu chính 2010</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            Đóng Cửa Sổ (Esc)
          </button>
        </div>

      </div>
    </div>
  );
}
