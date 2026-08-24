export type BranchId = 'cn1' | 'cn2';
export type BranchFilter = 'all' | 'cn1' | 'cn2';
export type TabType = 'dashboard' | 'students' | 'tuition' | 'attendance' | 'classes' | 'reports' | 'settings';

export interface Branch {
  id: BranchId;
  name: string;
  shortName: string;
  address: string;
  phone: string;
  manager: string;
  bankName: string;
  bankAccount: string;
  bankOwner: string;
  bankBin: string; // e.g. '970422' (MBBank), '970436' (Vietcombank), etc.
}

export interface Discipline {
  id: string;
  name: string;
  shortCode: string;
  iconName: string;
  color: string;
}

export type PackageType = 'monthly' | 'quarterly' | 'biannual' | 'yearly' | 'sessions' | 'pt';

export interface FeePackage {
  id: string;
  name: string;
  type: PackageType;
  price: number; // VND
  sessionCount?: number; // for 'sessions' or 'pt'
  durationMonths?: number; // for time-based
  disciplineId: string;
  branchAvailability: 'all' | 'cn1' | 'cn2';
  description?: string;
}

export type StudentFeeStatus = 'paid' | 'expiring_soon' | 'overdue' | 'unpaid' | 'reserved';

export interface Student {
  id: string;
  code: string; // e.g. "NSGD1-0089"
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  parentName?: string;
  parentPhone?: string;
  branchId: BranchId;
  disciplineId: string;
  classId?: string;
  joinDate: string;
  packageId: string;
  feeStatus: StudentFeeStatus;
  feeDueDate?: string; // YYYY-MM-DD
  feePaidDate?: string; // YYYY-MM-DD
  remainingSessions?: number;
  totalSessions?: number;
  notes?: string;
  avatarColor: string;
  address?: string;
}

export interface ClassSession {
  id: string;
  name: string;
  branchId: BranchId | 'all'; // 'cn1', 'cn2', or 'all' (Cả 2 chi nhánh)
  disciplineId: string;
  coachName: string;
  scheduleDays: string[]; // ['T2', 'T4', 'T6']
  timeSlot: string; // e.g. "18:00 - 19:30"
  maxStudents: number;
  room?: string;
}

export type PaymentMethod = 'cash' | 'transfer';

export interface PaymentReceipt {
  id: string;
  receiptCode: string; // e.g. "PT-2025-0102"
  studentId: string;
  studentName: string;
  studentCode: string;
  branchId: BranchId;
  packageId: string;
  packageName: string;
  originalAmount: number;
  discount: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string; // YYYY-MM-DD HH:mm:ss
  validFrom: string; // YYYY-MM-DD
  validTo?: string; // YYYY-MM-DD
  sessionCountAdded?: number;
  note?: string;
  cashier: string;
  isCancelled?: boolean;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  studentName: string;
  studentCode: string;
  branchId: BranchId;
  classId: string;
  className: string;
  status: 'present' | 'absent' | 'excused';
  timeChecked: string;
  deductedSession: boolean;
  note?: string;
}

export interface ClubConfig {
  clubName: string;
  category?: string; // e.g. "Trang · Câu lạc bộ thể thao"
  address?: string; // "2A Phan Chu Trinh, Phường 12, Bình Thạnh, Ho Chi Minh City, Vietnam"
  hotline: string; // "096 677 90 99"
  email?: string; // "ngoisaogiadinhvn@gmail.com"
  slogan: string;
  branches: Branch[];
  defaultReminderTemplate: string;
}

export type UserRole = 'admin' | 'manager' | 'cashier' | 'coach';

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: UserRole;
  branchId: BranchId | 'all';
  phone?: string;
  email?: string;
  avatarColor: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}
