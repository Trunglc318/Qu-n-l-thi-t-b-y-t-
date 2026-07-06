export type EquipmentStatus = 'Ready' | 'InUse' | 'Maintenance' | 'Faulty' | 'ChargingRequired';

export interface MaintenanceLog {
  id: string;
  equipmentId: string;
  technicianName: string;
  maintenanceDate: string;
  description: string;
  cost: number;
  statusBefore: string;
  statusAfter: string;
  photoBefore?: string; // Base64 or mock image URL
  photoAfter?: string;  // Base64 or mock image URL
}

export interface UsageLog {
  id: string;
  equipmentId: string;
  user: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number; // Calculated total usage time
}

export interface Equipment {
  id: string; // Mã thiết bị
  name: string; // Tên thiết bị
  serial: string; // Số seri
  manufactureDate: string; // Ngày tháng năm sản xuất
  firstUseDate: string; // Ngày tháng năm sử dụng
  status: EquipmentStatus; // Tình trạng
  batteryLevel: number; // Phần trăm pin
  lastChargedDate: string; // Ngày sạc pin gần nhất
  nextChargeDueDate: string; // Ngày cần sạc pin tiếp theo (nhắc nhở sạc sạc pin 1 lần / tháng)
  nextMaintenanceDate: string; // Ngày bảo trì định kỳ tiếp theo
  lastInspectionDate?: string; // Ngày kiểm định gần nhất
  nextInspectionDate?: string; // Ngày kiểm định tiếp theo (nhắc lịch kiểm định)
  currentUser?: string; // Người sử dụng hiện tại (nếu đang InUse)
  currentUsageStart?: string; // Thời gian bắt đầu sử dụng hiện tại
  totalUsageMinutes: number; // Tổng thời gian sử dụng (phút)
  maintenanceLogs: MaintenanceLog[]; // Lý lịch bảo trì
  usageLogs: UsageLog[]; // Lịch sử sử dụng
  department?: string; // Khoa lâm sàng sử dụng (Ví dụ: Khoa Hồi Sức, Khoa Cấp Cứu)
}

export type UserRole = 'Admin' | 'Technician' | 'User';

export interface Department {
  id: string;
  name: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  username?: string; // Tên đăng nhập
  department?: string; // Khoa trực thuộc
  password?: string; // Mật khẩu truy cập
  allowedDepartments?: string[]; // Quyền xem, sử dụng thiết bị ở các khoa này
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'battery' | 'maintenance' | 'system' | 'usage' | 'inspection';
  equipmentId?: string;
  createdAt: string;
  read: boolean;
}

export interface PerformanceStats {
  date: string;
  uptimeRate: number; // % uptime
  activeHours: number; // hours used
  maintenanceCount: number;
}
