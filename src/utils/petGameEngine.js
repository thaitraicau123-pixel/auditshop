/**
 * Hall of Fame Data Store
 * Quản lý Bảng Vàng Tri Ân Cộng Đồng Shop
 */

const HALL_OF_FAME_KEY = 'soatdon_hall_of_fame';

export const INITIAL_HALL_OF_FAME = [];

/**
 * Lấy danh sách Bảng Vàng Tri Ân
 */
export function getHallOfFameList() {
  try {
    const raw = localStorage.getItem(HALL_OF_FAME_KEY);
    if (!raw) {
      return [];
    }
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored)) return [];
    // Tự động loại bỏ bất kỳ dữ liệu mẫu thử nghiệm cũ nào (bắt đầu bằng DONOR_INIT_)
    const cleanList = stored.filter(d => d && typeof d === 'object' && !d.id?.startsWith('DONOR_INIT_'));
    return cleanList;
  } catch {
    return [];
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
    note: supporter.note?.trim() || 'Ủng hộ tiếp sức duy trì server AI SoatDon.vn!',
    timestamp: new Date().toISOString(),
    rank
  };

  const updated = [entry, ...current];
  try {
    localStorage.setItem(HALL_OF_FAME_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Lỗi lưu supporter:", e);
  }

  return updated;
}

// Stubs for backward compatibility if ever called
export function getPetData() { return null; }
export function savePetData() {}
export function addOrdersToPet() {}
export function addDonationToPet() {}
export const PET_RANKS = [];
