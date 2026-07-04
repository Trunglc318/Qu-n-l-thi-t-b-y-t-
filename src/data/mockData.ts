import { Equipment, UserProfile, AppNotification, PerformanceStats } from '../types';

// Helper to get past dates relative to current local time (2026-07-04)
const getPastDate = (daysAgo: number): string => {
  const date = new Date('2026-07-04T08:01:40');
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const getFutureDate = (daysAhead: number): string => {
  const date = new Date('2026-07-04T08:01:40');
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0];
};

// Simulated base64 images for maintenance states
export const mockImages = {
  before1: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="%23fca5a5"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%23991b1b" font-weight="bold">TRƯỚC BẢO TRÌ</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%237f1d1d">Thiết bị bám bụi, lỗi pin yếu, dây cáp lỏng</text></svg>',
  after1: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="%2386efac"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%23166534" font-weight="bold">SAU BẢO TRÌ</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%2314532d">Đã vệ sinh, thay cell pin mới, cố định cáp</text></svg>',
  before2: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="%23fde047"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%23854d0e" font-weight="bold">TRƯỚC BẢO TRÌ</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%23713f12">Màn hình mờ, có vệt sọc nứt nhẹ</text></svg>',
  after2: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="%2386efac"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%23166534" font-weight="bold">SAU BẢO TRÌ</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%2314532d">Đã thay tấm nền màn hình mới, hiển thị rõ</text></svg>',
};

export const mockUsers: UserProfile[] = [
  {
    id: 'U001',
    name: 'Admin',
    email: 'thongtinthuoc.bvbaothang@gmail.com',
    role: 'Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=120',
    username: 'admin',
    department: 'Tất cả các khoa',
    password: '123'
  },
  {
    id: 'U002',
    name: 'Kỹ sư Trần Quốc Bình',
    email: 'binh.tq@bvbaothang.org',
    role: 'Technician',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=120',
    username: 'tech',
    department: 'Phòng Vật Tư - TBYT',
    password: '123'
  },
  {
    id: 'U003',
    name: 'Điều dưỡng Lê Thị Mai',
    email: 'mai.lt@bvbaothang.org',
    role: 'User',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=120',
    username: 'nurse_hoisuc',
    department: 'Khoa Hồi Sức Tích Cực',
    password: '123'
  },
  {
    id: 'U004',
    name: 'Điều dưỡng Trần Thị Hương',
    email: 'huong.tt@bvbaothang.org',
    role: 'User',
    avatarUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=120',
    username: 'nurse_capcuu',
    department: 'Khoa Cấp Cứu',
    password: '123'
  }
];

export const DEPARTMENTS = [
  'Khoa Hồi Sức Tích Cực',
  'Khoa Cấp Cứu',
  'Khoa Chẩn Đoán Hình Ảnh',
  'Khoa Kiểm Soát Nhiễm Khuẩn',
  'Khoa Nội Tổng Hợp',
  'Khoa Ngoại Chấn Thương',
  'Khoa Nhi'
];

export const initialEquipment: Equipment[] = [
  {
    id: 'MT-001',
    name: 'Máy thở chức năng cao Mindray SV300',
    serial: 'MR-SV300-98231',
    manufactureDate: '2024-05-12',
    firstUseDate: '2024-08-20',
    status: 'Ready',
    batteryLevel: 92,
    lastChargedDate: getPastDate(5),
    nextChargeDueDate: getFutureDate(25),
    nextMaintenanceDate: getFutureDate(10),
    totalUsageMinutes: 14280, // ~238 hours
    department: 'Khoa Hồi Sức Tích Cực',
    maintenanceLogs: [
      {
        id: 'M001',
        equipmentId: 'MT-001',
        technicianName: 'Trần Quốc Bình',
        maintenanceDate: getPastDate(90),
        description: 'Bảo trì định kỳ định kỳ 6 tháng. Thay bộ lọc khí thở, kiểm tra cảm biến oxy.',
        cost: 2500000,
        statusBefore: 'Bụi bẩn bám màng lọc, cảm biến oxy sai số ±5%',
        statusAfter: 'Đã thay màng lọc, hiệu chuẩn cảm biến oxy về mức ±1%, chạy thử ổn định',
        photoBefore: mockImages.before1,
        photoAfter: mockImages.after1
      }
    ],
    usageLogs: [
      {
        id: 'L001',
        equipmentId: 'MT-001',
        user: 'Lê Thị Mai',
        startTime: '2026-07-01T08:00:00',
        endTime: '2026-07-01T14:30:00',
        durationMinutes: 390
      }
    ]
  },
  {
    id: 'SA-002',
    name: 'Máy siêu âm màu 4D GE Voluson E10',
    serial: 'GE-VE10-77192',
    manufactureDate: '2023-11-05',
    firstUseDate: '2024-01-15',
    status: 'InUse',
    batteryLevel: 68,
    lastChargedDate: getPastDate(12),
    nextChargeDueDate: getFutureDate(18),
    nextMaintenanceDate: getFutureDate(5),
    currentUser: 'Lê Thị Mai',
    currentUsageStart: '2026-07-04T07:15:00',
    totalUsageMinutes: 32400, // 540 hours
    department: 'Khoa Chẩn Đoán Hình Ảnh',
    maintenanceLogs: [
      {
        id: 'M002',
        equipmentId: 'SA-002',
        technicianName: 'Trần Quốc Bình',
        maintenanceDate: getPastDate(60),
        description: 'Hiệu chuẩn đầu dò khối, cập nhật phần mềm xử lý hình ảnh.',
        cost: 4800000,
        statusBefore: 'Hình ảnh siêu âm bị vệt sọc mờ do đầu dò quá nhiệt nhẹ',
        statusAfter: 'Khắc phục hoàn toàn lỗi tản nhiệt, nâng cấp firmware 2.4, hình ảnh sắc nét',
        photoBefore: mockImages.before2,
        photoAfter: mockImages.after2
      }
    ],
    usageLogs: [
      {
        id: 'L002',
        equipmentId: 'SA-002',
        user: 'Lê Thị Mai',
        startTime: '2026-07-03T09:00:00',
        endTime: '2026-07-03T16:00:00',
        durationMinutes: 420
      }
    ]
  },
  {
    id: 'ECG-003',
    name: 'Máy đo điện tim 12 kênh Fukuda Denshi',
    serial: 'FK-ECG12-10928',
    manufactureDate: '2025-01-20',
    firstUseDate: '2025-03-01',
    status: 'ChargingRequired',
    batteryLevel: 8,
    lastChargedDate: getPastDate(32), // Quá 1 tháng sạc
    nextChargeDueDate: getPastDate(2),
    nextMaintenanceDate: getFutureDate(45),
    totalUsageMinutes: 8900,
    department: 'Khoa Cấp Cứu',
    maintenanceLogs: [],
    usageLogs: []
  },
  {
    id: 'BTE-004',
    name: 'Bơm tiêm điện thông minh Terumo TE-331',
    serial: 'TR-BTE33-55612',
    manufactureDate: '2024-09-18',
    firstUseDate: '2024-11-10',
    status: 'Faulty',
    batteryLevel: 45,
    lastChargedDate: getPastDate(20),
    nextChargeDueDate: getFutureDate(10),
    nextMaintenanceDate: getPastDate(1), // Quá hạn bảo trì
    totalUsageMinutes: 19600,
    department: 'Khoa Hồi Sức Tích Cực',
    maintenanceLogs: [
      {
        id: 'M003',
        equipmentId: 'BTE-004',
        technicianName: 'Trần Quốc Bình',
        maintenanceDate: getPastDate(120),
        description: 'Kiểm tra lỗi kẹt pittông đẩy truyền dịch.',
        cost: 1200000,
        statusBefore: 'Thỉnh thoảng báo động kẹt pittông dù không có vật cản',
        statusAfter: 'Vệ sinh trục vít đẩy, bôi trơn và chạy thử tải thành công',
        photoBefore: mockImages.before1,
        photoAfter: mockImages.after1
      }
    ],
    usageLogs: []
  },
  {
    id: 'MST-005',
    name: 'Nồi hấp tiệt trùng hơi nước trung tâm Tuttnauer',
    serial: 'TN-MST55-22481',
    manufactureDate: '2022-08-10',
    firstUseDate: '2022-12-05',
    status: 'Ready',
    batteryLevel: 100, // Cắm nguồn trực tiếp
    lastChargedDate: getPastDate(1),
    nextChargeDueDate: getFutureDate(29),
    nextMaintenanceDate: getPastDate(12), // Quá hạn bảo trì
    totalUsageMinutes: 94800,
    department: 'Khoa Kiểm Sát Nhiễm Khuẩn',
    maintenanceLogs: [],
    usageLogs: []
  }
];

export const initialNotifications: AppNotification[] = [
  {
    id: 'N001',
    title: 'Nhắc nhở sạc pin định kỳ',
    message: 'Thiết bị Máy đo điện tim Fukuda (ECG-003) có mức pin 8%. Yêu cầu cắm sạc ngay lập tức (Lịch sạc pin định kỳ 1 lần/tháng).',
    type: 'battery',
    equipmentId: 'ECG-003',
    createdAt: '2026-07-04T07:30:00',
    read: false
  },
  {
    id: 'N002',
    title: 'Cảnh báo quá hạn bảo trì',
    message: 'Nồi hấp tiệt trùng Tuttnauer (MST-005) đã quá hạn bảo trì định kỳ từ ngày ' + getPastDate(12) + '. Hãy lên lịch bảo trì.',
    type: 'maintenance',
    equipmentId: 'MST-005',
    createdAt: '2026-07-03T08:00:00',
    read: false
  },
  {
    id: 'N003',
    title: 'Thiết bị gặp sự cố',
    message: 'Bơm tiêm điện Terumo (BTE-004) được chuyển trạng thái sang "Đang hỏng" (Faulty) do lỗi kỹ thuật cảm biến tải trọng.',
    type: 'system',
    equipmentId: 'BTE-004',
    createdAt: '2026-07-02T10:15:00',
    read: true
  }
];

// 7-day Real-time operating stats for dashboard charts
export const initialPerformanceStats: PerformanceStats[] = [
  { date: '28/06', uptimeRate: 94.2, activeHours: 42.5, maintenanceCount: 0 },
  { date: '29/06', uptimeRate: 95.8, activeHours: 45.0, maintenanceCount: 1 },
  { date: '30/06', uptimeRate: 92.1, activeHours: 39.8, maintenanceCount: 0 },
  { date: '01/07', uptimeRate: 96.5, activeHours: 48.2, maintenanceCount: 0 },
  { date: '02/07', uptimeRate: 88.4, activeHours: 36.4, maintenanceCount: 1 },
  { date: '03/07', uptimeRate: 93.9, activeHours: 44.1, maintenanceCount: 0 },
  { date: '04/07', uptimeRate: 95.1, activeHours: 46.8, maintenanceCount: 1 }
];
