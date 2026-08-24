import {
  Student,
  FeePackage,
  ClassSession,
  PaymentReceipt,
  AttendanceRecord,
  ClubConfig,
  Branch,
  Discipline,
  UserAccount,
} from '../types';
import {
  INITIAL_CONFIG,
  INITIAL_PACKAGES,
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_RECEIPTS,
  INITIAL_ATTENDANCE,
  INITIAL_BRANCHES,
  INITIAL_DISCIPLINES,
  INITIAL_USERS,
} from '../data/initialData';

const KEYS = {
  CONFIG: 'nsgd_club_config_v1',
  BRANCHES: 'nsgd_branches_v1',
  DISCIPLINES: 'nsgd_disciplines_v1',
  PACKAGES: 'nsgd_fee_packages_v1',
  CLASSES: 'nsgd_classes_v1',
  STUDENTS: 'nsgd_students_v1',
  RECEIPTS: 'nsgd_receipts_v1',
  ATTENDANCE: 'nsgd_attendance_v1',
  USERS: 'nsgd_users_v1',
  CURRENT_USER: 'nsgd_current_user_v1',
};

export const StorageService = {
  getConfig(): ClubConfig {
    try {
      const data = localStorage.getItem(KEYS.CONFIG);
      if (data) {
        const parsed: ClubConfig = JSON.parse(data);
        let updated = false;
        if (parsed.clubName && (parsed.clubName.includes('VÕ THUẬT') || parsed.clubName.includes('THỂ THAO'))) {
          parsed.clubName = 'CLB NGÔI SAO GIA ĐỊNH';
          updated = true;
        }
        if (!parsed.category || parsed.category !== INITIAL_CONFIG.category) {
          parsed.category = INITIAL_CONFIG.category;
          updated = true;
        }
        if (!parsed.address || parsed.address.includes('Phan Đăng Lưu')) {
          parsed.address = INITIAL_CONFIG.address;
          updated = true;
        }
        if (!parsed.email || parsed.email !== INITIAL_CONFIG.email) {
          parsed.email = INITIAL_CONFIG.email;
          updated = true;
        }
        if (!parsed.hotline || parsed.hotline.includes('1900') || parsed.hotline.includes('0907')) {
          parsed.hotline = INITIAL_CONFIG.hotline;
          updated = true;
        }
        if (updated) {
          localStorage.setItem(KEYS.CONFIG, JSON.stringify(parsed));
        }
        return parsed;
      }
      return INITIAL_CONFIG;
    } catch {
      return INITIAL_CONFIG;
    }
  },

  saveConfig(config: ClubConfig): void {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  },

  getBranches(): Branch[] {
    try {
      const data = localStorage.getItem(KEYS.BRANCHES);
      if (data) {
        const branches: Branch[] = JSON.parse(data);
        let updated = false;
        const migrated = branches.map((b) => {
          if (b.id === 'cn1') {
            if (b.address.includes('Phan Đăng Lưu') || b.phone.includes('0907')) {
              updated = true;
              return {
                ...b,
                shortName: 'Cơ Sở 1 (Phan Chu Trinh)',
                address: '2A Phan Chu Trinh, Phường 12, Bình Thạnh, Ho Chi Minh City, Vietnam',
                phone: '096 677 90 99',
                bankAccount: '0966779099',
              };
            }
          }
          if (b.id === 'cn2') {
            if (b.address.includes('Nguyễn Văn Đậu') || b.phone.includes('0907')) {
              updated = true;
              return {
                ...b,
                shortName: 'Cơ Sở 2 (Nơ Trang Long)',
                address: '25A Nơ Trang Long, Phường Gia Định, TPHCM',
                phone: '096 677 90 99',
              };
            }
          }
          return b;
        });

        if (updated) {
          localStorage.setItem(KEYS.BRANCHES, JSON.stringify(migrated));
          return migrated;
        }
        return branches;
      }
      return INITIAL_BRANCHES;
    } catch {
      return INITIAL_BRANCHES;
    }
  },

  saveBranches(branches: Branch[]): void {
    localStorage.setItem(KEYS.BRANCHES, JSON.stringify(branches));
  },

  getDisciplines(): Discipline[] {
    try {
      const data = localStorage.getItem(KEYS.DISCIPLINES);
      return data ? JSON.parse(data) : INITIAL_DISCIPLINES;
    } catch {
      return INITIAL_DISCIPLINES;
    }
  },

  saveDisciplines(disciplines: Discipline[]): void {
    localStorage.setItem(KEYS.DISCIPLINES, JSON.stringify(disciplines));
  },

  getPackages(): FeePackage[] {
    try {
      const data = localStorage.getItem(KEYS.PACKAGES);
      return data ? JSON.parse(data) : INITIAL_PACKAGES;
    } catch {
      return INITIAL_PACKAGES;
    }
  },

  savePackages(packages: FeePackage[]): void {
    localStorage.setItem(KEYS.PACKAGES, JSON.stringify(packages));
  },

  getClasses(): ClassSession[] {
    try {
      const data = localStorage.getItem(KEYS.CLASSES);
      return data ? JSON.parse(data) : INITIAL_CLASSES;
    } catch {
      return INITIAL_CLASSES;
    }
  },

  saveClasses(classes: ClassSession[]): void {
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(classes));
  },

  saveClass(cls: ClassSession): ClassSession[] {
    const list = this.getClasses();
    const index = list.findIndex((c) => c.id === cls.id);
    let updated: ClassSession[];
    if (index >= 0) {
      updated = list.map((c) => (c.id === cls.id ? cls : c));
    } else {
      updated = [...list, cls];
    }
    this.saveClasses(updated);
    return updated;
  },

  deleteClass(id: string): ClassSession[] {
    const list = this.getClasses().filter((c) => c.id !== id);
    this.saveClasses(list);
    return list;
  },

  getStudents(): Student[] {
    try {
      const data = localStorage.getItem(KEYS.STUDENTS);
      return data ? JSON.parse(data) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  },

  saveStudents(students: Student[]): void {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  },

  saveStudent(student: Student): Student[] {
    const list = this.getStudents();
    const index = list.findIndex((s) => s.id === student.id);
    let updated: Student[];
    if (index >= 0) {
      updated = list.map((s) => (s.id === student.id ? student : s));
    } else {
      updated = [student, ...list];
    }
    this.saveStudents(updated);
    return updated;
  },

  deleteStudent(id: string): Student[] {
    const list = this.getStudents().filter((s) => s.id !== id);
    this.saveStudents(list);
    return list;
  },

  getReceipts(): PaymentReceipt[] {
    try {
      const data = localStorage.getItem(KEYS.RECEIPTS);
      return data ? JSON.parse(data) : INITIAL_RECEIPTS;
    } catch {
      return INITIAL_RECEIPTS;
    }
  },

  saveReceipts(receipts: PaymentReceipt[]): void {
    localStorage.setItem(KEYS.RECEIPTS, JSON.stringify(receipts));
  },

  addReceipt(receipt: PaymentReceipt): PaymentReceipt[] {
    const list = [receipt, ...this.getReceipts()];
    this.saveReceipts(list);
    return list;
  },

  getAttendance(): AttendanceRecord[] {
    try {
      const data = localStorage.getItem(KEYS.ATTENDANCE);
      return data ? JSON.parse(data) : INITIAL_ATTENDANCE;
    } catch {
      return INITIAL_ATTENDANCE;
    }
  },

  saveAttendance(records: AttendanceRecord[]): void {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(records));
  },

  addAttendance(record: AttendanceRecord): AttendanceRecord[] {
    const list = [record, ...this.getAttendance()];
    this.saveAttendance(list);
    return list;
  },

  getUsers(): UserAccount[] {
    try {
      const data = localStorage.getItem(KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUsers(users: UserAccount[]): void {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  saveUser(user: UserAccount): UserAccount[] {
    const list = this.getUsers();
    const index = list.findIndex((u) => u.id === user.id);
    let updated: UserAccount[];
    if (index >= 0) {
      updated = list.map((u) => (u.id === user.id ? user : u));
    } else {
      updated = [...list, user];
    }
    this.saveUsers(updated);

    // Update current user if modifying self
    const current = this.getCurrentUser();
    if (current && current.id === user.id) {
      this.setCurrentUser(user);
    }

    return updated;
  },

  deleteUser(id: string): UserAccount[] {
    const list = this.getUsers().filter((u) => u.id !== id);
    this.saveUsers(list);
    return list;
  },

  getCurrentUser(): UserAccount | null {
    try {
      const data = localStorage.getItem(KEYS.CURRENT_USER);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: UserAccount | null): void {
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  },

  logoutUser(): void {
    localStorage.removeItem(KEYS.CURRENT_USER);
  },

  resetToInitialData(): void {
    this.saveConfig(INITIAL_CONFIG);
    this.saveBranches(INITIAL_BRANCHES);
    this.saveDisciplines(INITIAL_DISCIPLINES);
    this.savePackages(INITIAL_PACKAGES);
    this.saveClasses(INITIAL_CLASSES);
    this.saveStudents(INITIAL_STUDENTS);
    this.saveReceipts(INITIAL_RECEIPTS);
    this.saveAttendance(INITIAL_ATTENDANCE);
    this.saveUsers(INITIAL_USERS);
  },

  /**
   * Clear all operational data (Students, Receipts, Attendance)
   * while keeping configurations (Club config, Branches, Disciplines, Packages, Users) intact.
   * Perfect for handing over a fresh system to a real client.
   */
  clearOperationalData(): void {
    this.saveStudents([]);
    this.saveReceipts([]);
    this.saveAttendance([]);
  },

  exportBackup(): string {
    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      club: 'CLB Ngôi Sao Gia Định',
      config: this.getConfig(),
      branches: this.getBranches(),
      disciplines: this.getDisciplines(),
      packages: this.getPackages(),
      classes: this.getClasses(),
      students: this.getStudents(),
      receipts: this.getReceipts(),
      attendance: this.getAttendance(),
      users: this.getUsers(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.config) this.saveConfig(parsed.config);
      if (parsed.branches) this.saveBranches(parsed.branches);
      if (parsed.disciplines) this.saveDisciplines(parsed.disciplines);
      if (parsed.packages) this.savePackages(parsed.packages);
      if (parsed.classes) this.saveClasses(parsed.classes);
      if (parsed.students) this.saveStudents(parsed.students);
      if (parsed.receipts) this.saveReceipts(parsed.receipts);
      if (parsed.attendance) this.saveAttendance(parsed.attendance);
      if (parsed.users) this.saveUsers(parsed.users);
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  },
};
