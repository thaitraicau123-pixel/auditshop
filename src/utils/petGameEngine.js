/**
 * Pet Game Engine & Hall of Fame Data Store
 * Quản lý trạng thái Nuôi Thú Cưng & Bảng Vàng Tri Ân
 */

const PET_STORAGE_KEY = 'soatdon_pet_data';
const HALL_OF_FAME_KEY = 'soatdon_hall_of_fame';

// Danh sách nhà tài trợ ban đầu (Social proof & tri ân cộng đồng)
export const INITIAL_HALL_OF_FAME = [
  {
    id: 'DONOR_INIT_1',
    name: 'Shop Mẹ & Bé Hà Nội',
    amount: 100000,
    note: 'Đòi lại được 2.3 triệu GHTK ngâm đơn hoàn. Tiếp sức server AI và gửi cún mèo hộp pate to nha!',
    timestamp: '2026-10-10T14:20:00.000Z',
    rank: 'DIAMOND'
  },
  {
    id: 'DONOR_INIT_2',
    name: 'Gia Dụng Thông Minh SG',
    amount: 100000,
    note: 'Tool quá đỉnh cao, soi ra 32 đơn bị đội cân nặng. Chúc admin và thú cưng luôn khỏe mạnh!',
    timestamp: '2026-10-10T16:45:00.000Z',
    rank: 'DIAMOND'
  },
  {
    id: 'DONOR_INIT_3',
    name: 'Kho Sỉ Thời Trang Mía',
    amount: 50000,
    note: 'Mời dev bữa cơm trưa + cây xúc xích cho bé mèo thần tài nha! Buôn may bán đắt!',
    timestamp: '2026-10-11T08:15:00.000Z',
    rank: 'GOLD'
  },
  {
    id: 'DONOR_INIT_4',
    name: 'Phụ Kiện Điện Thoại Z Store',
    amount: 50000,
    note: 'Rà soát 18 đơn ngâm hoàn quá 72h đòi bồi thường thành công. Thưởng cún hộp pate xịn!',
    timestamp: '2026-10-11T10:30:00.000Z',
    rank: 'GOLD'
  },
  {
    id: 'DONOR_INIT_5',
    name: 'Mỹ Phẩm Xinh Cosmetics',
    amount: 25000,
    note: 'Mời dev ly cà phê muối tiếp sức duy trì server nha! Rất thích tính năng soi nấc cân.',
    timestamp: '2026-10-11T12:05:00.000Z',
    rank: 'SILVER'
  },
  {
    id: 'DONOR_INIT_6',
    name: 'Giày Xuất Khẩu Zen',
    amount: 25000,
    note: 'Cún soi cước sủa chuẩn quá, cứu shop được gần 800k tiền chênh lệch COD!',
    timestamp: '2026-10-11T13:20:00.000Z',
    rank: 'SILVER'
  }
];

// Danh hiệu theo cấp độ
export const PET_RANKS = [
  { level: 1, title: 'Cún & Mèo Tập Sự', icon: '🐾', requiredExp: 200, desc: 'Đang tập đánh hơi bảng kê Excel' },
  { level: 2, title: 'Trinh Sát Nấc Cân', icon: '🔎', requiredExp: 500, desc: 'Bắt đầu phát hiện bưu cục cân lố gram' },
  { level: 3, title: 'Thám Tử Bưu Cục', icon: '🕵️', requiredExp: 1000, desc: 'Phát giác đơn hoàn ngâm kho > 72h' },
  { level: 4, title: 'Thần Tài Chiêu Lộc', icon: '🪙', requiredExp: 1800, desc: 'Bảo vệ đủ 100% tiền COD chuyển về shop' },
  { level: 5, title: 'Hiệp Sĩ Doanh Thu', icon: '🛡️', requiredExp: 3000, desc: 'Không để bất kỳ nhà xe nào trừ oan 1 xu' },
  { level: 6, title: 'Đại Tướng Logistics', icon: '⚔️', requiredExp: 5000, desc: 'Thẩm định siêu tốc mọi định dạng file' },
  { level: 7, title: 'Vua Soi Cước Huyền Thoại', icon: '👑', requiredExp: 8000, desc: 'Hộ mệnh tối cao của mọi nhà bán hàng TMĐT' }
];

export function getPetData() {
  try {
    const raw = localStorage.getItem(PET_STORAGE_KEY);
    if (!raw) {
      const initial = {
        level: 2,
        exp: 280,
        hunger: 80,
        happiness: 90,
        totalOrdersFed: 150,
        totalDonated: 25000,
        foodTokens: 30, // Thức ăn hạt tích lũy từ đơn hàng
        lastFedTime: Date.now()
      };
      localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return {
      level: 1,
      exp: 100,
      hunger: 60,
      happiness: 80,
      totalOrdersFed: 50,
      totalDonated: 0,
      foodTokens: 10,
      lastFedTime: Date.now()
    };
  }
}

export function savePetData(data) {
  try {
    localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Lỗi lưu pet data:", e);
  }
}

/**
 * Tự động nạp thức ăn & EXP khi người dùng soát đơn hàng
 */
export function addOrdersToPet(ordersCount) {
  if (!ordersCount || ordersCount <= 0) return getPetData();
  const pet = getPetData();
  
  // Mỗi 1 đơn hàng quét = 2 EXP và 1 hạt thức ăn
  const gainedExp = Math.round(ordersCount * 2);
  const gainedTokens = Math.max(1, Math.round(ordersCount / 5));

  pet.exp = (pet.exp || 0) + gainedExp;
  pet.foodTokens = (pet.foodTokens || 0) + gainedTokens;
  pet.totalOrdersFed = (pet.totalOrdersFed || 0) + ordersCount;
  pet.hunger = Math.min(100, (pet.hunger || 50) + 15);
  pet.happiness = Math.min(100, (pet.happiness || 50) + 10);

  checkLevelUp(pet);
  savePetData(pet);
  return pet;
}

/**
 * Thưởng pate/cà phê từ việc donate
 */
export function addDonationToPet(amount) {
  const pet = getPetData();
  const gainedExp = Math.round((amount || 10000) / 50); // Donate 25k = 500 EXP

  pet.exp = (pet.exp || 0) + gainedExp;
  pet.totalDonated = (pet.totalDonated || 0) + amount;
  pet.hunger = 100;
  pet.happiness = 100;

  checkLevelUp(pet);
  savePetData(pet);
  return pet;
}

/**
 * Kiểm tra thú cưng lên cấp
 */
function checkLevelUp(pet) {
  for (let i = PET_RANKS.length - 1; i >= 0; i--) {
    if (pet.exp >= PET_RANKS[i].requiredExp) {
      if (pet.level < PET_RANKS[i].level) {
        pet.level = PET_RANKS[i].level;
      }
      break;
    }
  }
}

/**
 * Lấy danh sách Bảng Vàng Tri Ân
 */
export function getHallOfFameList() {
  try {
    const raw = localStorage.getItem(HALL_OF_FAME_KEY);
    if (!raw) {
      localStorage.setItem(HALL_OF_FAME_KEY, JSON.stringify(INITIAL_HALL_OF_FAME));
      return INITIAL_HALL_OF_FAME;
    }
    const stored = JSON.parse(raw);
    return Array.isArray(stored) && stored.length > 0 ? stored : INITIAL_HALL_OF_FAME;
  } catch {
    return INITIAL_HALL_OF_FAME;
  }
}

/**
 * Ghi danh thêm một nhà hảo tâm mới vào Bảng Vàng
 */
export function addSupporterToHallOfFame(supporter) {
  const current = getHallOfFameList();
  let rank = 'BRONZE';
  if (supporter.amount >= 100000) rank = 'DIAMOND';
  else if (supporter.amount >= 50000) rank = 'GOLD';
  else if (supporter.amount >= 25000) rank = 'SILVER';

  const entry = {
    id: 'DONOR_' + Date.now(),
    name: supporter.name?.trim() || 'Shop Hảo Tâm Ẩn Danh',
    amount: Number(supporter.amount) || 25000,
    note: supporter.note?.trim() || 'Ủng hộ tiếp sức duy trì server và nuôi cún mèo!',
    timestamp: new Date().toISOString(),
    rank
  };

  const updated = [entry, ...current];
  try {
    localStorage.setItem(HALL_OF_FAME_KEY, JSON.stringify(updated));
  } catch (e) {}

  addDonationToPet(entry.amount);
  return updated;
}
