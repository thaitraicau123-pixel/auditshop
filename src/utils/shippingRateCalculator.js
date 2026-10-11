/**
 * Shipping Rate Matrix & SLA Calculator for 6 Major Carriers in Vietnam
 * (GHTK, GHN, Viettel Post, Shopee Xpress, J&T Express, VNPost)
 */

export const REGIONS = [
  { id: 'HN_INNER', label: 'Hà Nội (Nội thành)', zone: 'NORTH' },
  { id: 'HN_OUTER', label: 'Hà Nội (Ngoại thành / Huyện)', zone: 'NORTH' },
  { id: 'HCM_INNER', label: 'TP. Hồ Chí Minh (Nội thành)', zone: 'SOUTH' },
  { id: 'HCM_OUTER', label: 'TP. Hồ Chí Minh (Ngoại thành)', zone: 'SOUTH' },
  { id: 'NORTH_PROV', label: 'Các Tỉnh Miền Bắc (Hải Phòng, Bắc Ninh, v.v.)', zone: 'NORTH' },
  { id: 'CENTRAL_PROV', label: 'Miền Trung & Tây Nguyên (Đà Nẵng, Huế, v.v.)', zone: 'CENTRAL' },
  { id: 'SOUTH_PROV', label: 'Các Tỉnh Miền Nam (Cần Thơ, Bình Dương, v.v.)', zone: 'SOUTH' }
];

// Xác định loại tuyến
export function determineRouteType(fromId, toId) {
  if (fromId === toId || (fromId.startsWith('HN') && toId.startsWith('HN')) || (fromId.startsWith('HCM') && toId.startsWith('HCM'))) {
    return 'INTRA_PROVINCE'; // Nội tỉnh
  }
  const fromReg = REGIONS.find(r => r.id === fromId)?.zone || 'NORTH';
  const toReg = REGIONS.find(r => r.id === toId)?.zone || 'SOUTH';

  if (fromReg === toReg) {
    return 'INTRA_REGION'; // Nội miền
  }

  // Tuyến đặc biệt HN <-> HCM
  if ((fromId.startsWith('HN') && toId.startsWith('HCM')) || (fromId.startsWith('HCM') && toId.startsWith('HN'))) {
    return 'SPECIAL_AXIS'; // Trục Hà Nội - Sài Gòn
  }

  return 'INTER_REGION'; // Liên miền
}

// Bảng biểu phí tiêu chuẩn của 6 hãng vận chuyển
export const CARRIERS_CONFIG = [
  {
    id: 'GHTK',
    name: 'Giao Hàng Tiết Kiệm (GHTK)',
    shortName: 'GHTK',
    volumetricDivisor: 5000,
    color: 'emerald',
    badge: 'Phủ sóng 99% xã phường',
    tagline: 'Giao nhanh nội tỉnh & tối ưu shop thời trang',
    rates: {
      INTRA_PROVINCE: { baseWeight: 500, baseFee: 16500, nextStep: 500, nextFee: 2500, slaHours: '6 - 24 giờ' },
      INTRA_REGION: { baseWeight: 500, baseFee: 26000, nextStep: 500, nextFee: 4000, slaHours: '24 - 48 giờ' },
      SPECIAL_AXIS: { baseWeight: 500, baseFee: 30000, nextStep: 500, nextFee: 5000, slaHours: '36 - 48 giờ' },
      INTER_REGION: { baseWeight: 500, baseFee: 34000, nextStep: 500, nextFee: 6000, slaHours: '48 - 72 giờ' }
    },
    codPolicy: 'Miễn phí COD dưới 3.000.000 đ',
    insurancePolicy: 'Miễn phí khai giá dưới 1.000.000 đ, trên 1tr thu 0.5%'
  },
  {
    id: 'GHN',
    name: 'Giao Hàng Nhanh (GHN Express)',
    shortName: 'GHN',
    volumetricDivisor: 5000,
    color: 'orange',
    badge: 'Mạng lưới bưu cục dày đặc',
    tagline: 'Chuyên nghiệp, tốc độ xử lý đơn hỏa tốc',
    rates: {
      INTRA_PROVINCE: { baseWeight: 500, baseFee: 15500, nextStep: 500, nextFee: 3000, slaHours: '6 - 24 giờ' },
      INTRA_REGION: { baseWeight: 500, baseFee: 28000, nextStep: 500, nextFee: 4500, slaHours: '24 - 48 giờ' },
      SPECIAL_AXIS: { baseWeight: 500, baseFee: 29000, nextStep: 500, nextFee: 5500, slaHours: '36 - 48 giờ' },
      INTER_REGION: { baseWeight: 500, baseFee: 35000, nextStep: 500, nextFee: 6500, slaHours: '48 - 72 giờ' }
    },
    codPolicy: 'Miễn phí COD mọi giá trị',
    insurancePolicy: '0.5% giá trị hàng hóa trên 1.000.000 đ'
  },
  {
    id: 'VTP',
    name: 'Viettel Post',
    shortName: 'Viettel Post',
    volumetricDivisor: 6000, // Đường bộ quy đổi /6000 có lợi hơn cho shop
    color: 'red',
    badge: 'Tối ưu hàng nặng & cồng kềnh',
    tagline: 'Hệ số DxRxC / 6000 lợi cân nhất, phủ khắp vùng sâu vùng xa',
    rates: {
      INTRA_PROVINCE: { baseWeight: 500, baseFee: 14000, nextStep: 500, nextFee: 2000, slaHours: '12 - 24 giờ' },
      INTRA_REGION: { baseWeight: 500, baseFee: 24000, nextStep: 500, nextFee: 3500, slaHours: '24 - 48 giờ' },
      SPECIAL_AXIS: { baseWeight: 500, baseFee: 28000, nextStep: 500, nextFee: 4500, slaHours: '48 giờ' },
      INTER_REGION: { baseWeight: 500, baseFee: 31000, nextStep: 500, nextFee: 5000, slaHours: '48 - 72 giờ' }
    },
    codPolicy: 'Miễn phí COD dưới 2.000.000 đ',
    insurancePolicy: '0.5% giá trị khai giá'
  },
  {
    id: 'SPX',
    name: 'Shopee Xpress (SPX)',
    shortName: 'SPX',
    volumetricDivisor: 5000,
    color: 'amber',
    badge: 'Chuẩn sàn TMĐT Shopee',
    tagline: 'Cước ưu đãi tốt cho nhà bán hàng Shopee',
    rates: {
      INTRA_PROVINCE: { baseWeight: 500, baseFee: 15000, nextStep: 500, nextFee: 2500, slaHours: '12 - 24 giờ' },
      INTRA_REGION: { baseWeight: 500, baseFee: 25000, nextStep: 500, nextFee: 4000, slaHours: '24 - 48 giờ' },
      SPECIAL_AXIS: { baseWeight: 500, baseFee: 28500, nextStep: 500, nextFee: 4800, slaHours: '36 - 48 giờ' },
      INTER_REGION: { baseWeight: 500, baseFee: 33000, nextStep: 500, nextFee: 5500, slaHours: '48 - 72 giờ' }
    },
    codPolicy: 'Miễn phí COD',
    insurancePolicy: 'Áp dụng biểu phí Shopee'
  },
  {
    id: 'JT',
    name: 'J&T Express',
    shortName: 'J&T Express',
    volumetricDivisor: 5000,
    color: 'rose',
    badge: 'Hoạt động 365 ngày không nghỉ',
    tagline: 'Giao hàng cả cuối tuần & ngày lễ tết',
    rates: {
      INTRA_PROVINCE: { baseWeight: 500, baseFee: 16000, nextStep: 500, nextFee: 2500, slaHours: '12 - 24 giờ' },
      INTRA_REGION: { baseWeight: 500, baseFee: 26000, nextStep: 500, nextFee: 4200, slaHours: '24 - 48 giờ' },
      SPECIAL_AXIS: { baseWeight: 500, baseFee: 29000, nextStep: 500, nextFee: 5000, slaHours: '36 - 48 giờ' },
      INTER_REGION: { baseWeight: 500, baseFee: 34000, nextStep: 500, nextFee: 6000, slaHours: '48 - 72 giờ' }
    },
    codPolicy: 'Miễn phí thu hộ COD',
    insurancePolicy: '0.5% trên 1.000.000 đ'
  },
  {
    id: 'VNP',
    name: 'VNPost (Bưu Điện Việt Nam)',
    shortName: 'VNPost',
    volumetricDivisor: 6000,
    color: 'yellow',
    badge: 'Mạng lưới bưu điện quốc gia',
    tagline: 'Tới tận hải đảo, thôn bản biên giới',
    rates: {
      INTRA_PROVINCE: { baseWeight: 500, baseFee: 13500, nextStep: 500, nextFee: 2000, slaHours: '24 giờ' },
      INTRA_REGION: { baseWeight: 500, baseFee: 23500, nextStep: 500, nextFee: 3200, slaHours: '48 giờ' },
      SPECIAL_AXIS: { baseWeight: 500, baseFee: 27500, nextStep: 500, nextFee: 4200, slaHours: '48 - 72 giờ' },
      INTER_REGION: { baseWeight: 500, baseFee: 30000, nextStep: 500, nextFee: 4800, slaHours: '72 - 96 giờ' }
    },
    codPolicy: '0.8% tiền COD (tối thiểu 10.000 đ nếu ngoài tỉnh)',
    insurancePolicy: '1% giá trị bưu gửi khai giá'
  }
];

/**
 * Tính cước và so sánh đồng loạt 6 hãng
 */
export function calculateAllCarrierRates({
  fromRegion = 'HN_INNER',
  toRegion = 'HCM_INNER',
  actualWeight = 300, // gram
  length = 20, // cm
  width = 15, // cm
  height = 10, // cm
  codAmount = 350000, // VNĐ
  declaredValue = 350000 // VNĐ
}) {
  const routeType = determineRouteType(fromRegion, toRegion);

  const results = CARRIERS_CONFIG.map(carrier => {
    // 1. Tính trọng lượng quy đổi thể tích DxRxC
    const volumetricWeight = Math.round((length * width * height) / carrier.volumetricDivisor * 1000);
    const chargeableWeight = Math.max(actualWeight, volumetricWeight);

    // 2. Lấy biểu phí tương ứng tuyến đường
    const rule = carrier.rates[routeType] || carrier.rates.INTER_REGION;

    // 3. Tính cước chính
    let shippingFee = rule.baseFee;
    if (chargeableWeight > rule.baseWeight) {
      const extraGrams = chargeableWeight - rule.baseWeight;
      const extraSteps = Math.ceil(extraGrams / rule.nextStep);
      shippingFee += extraSteps * rule.nextFee;
    }

    // 4. Phụ phí COD (nếu có)
    let codFee = 0;
    if (carrier.id === 'VNP' && codAmount > 0 && routeType !== 'INTRA_PROVINCE') {
      codFee = Math.max(Math.round(codAmount * 0.008), 10000);
    }

    // 5. Phí bảo hiểm hàng giá trị cao
    let insuranceFee = 0;
    if (declaredValue > 1000000) {
      insuranceFee = Math.round((declaredValue - 1000000) * 0.005);
    }

    const totalFee = shippingFee + codFee + insuranceFee;

    return {
      carrierId: carrier.id,
      carrierName: carrier.name,
      shortName: carrier.shortName,
      color: carrier.color,
      badge: carrier.badge,
      tagline: carrier.tagline,
      actualWeight,
      volumetricWeight,
      chargeableWeight,
      isVolumetricHeavier: volumetricWeight > actualWeight,
      shippingFee,
      codFee,
      insuranceFee,
      totalFee,
      slaHours: rule.slaHours,
      codPolicy: carrier.codPolicy,
      insurancePolicy: carrier.insurancePolicy
    };
  });

  // Sắp xếp từ rẻ nhất đến đắt nhất
  results.sort((a, b) => a.totalFee - b.totalFee);

  // Gắn danh hiệu
  if (results.length > 0) {
    results[0].bestValue = true; // Rẻ nhất
  }

  return {
    routeType,
    fromRegion,
    toRegion,
    comparedList: results,
    cheapestCarrier: results[0],
    mostExpensiveCarrier: results[results.length - 1],
    maxSaving: (results[results.length - 1]?.totalFee || 0) - (results[0]?.totalFee || 0)
  };
}
