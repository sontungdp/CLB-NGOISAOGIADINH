/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Student,
  Branch,
  Discipline,
  FeePackage,
  ClassSession,
  PaymentReceipt,
  AttendanceRecord,
  ClubConfig,
  TabType,
  BranchFilter,
  UserAccount,
} from './types';
import { StorageService } from './utils/storage';
import { INITIAL_DISCIPLINES } from './data/initialData';
import { getTodayDateString } from './utils/formatters';

// Navigation & Views
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { Dashboard } from './components/Dashboard';
import { StudentManagement } from './components/StudentManagement';
import { TuitionManagement } from './components/TuitionManagement';
import { AttendanceTracker } from './components/AttendanceTracker';
import { ClassManagement } from './components/ClassManagement';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { SettingsView } from './components/SettingsView';

// Modals
import { StudentModal } from './components/StudentModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptPrintModal } from './components/ReceiptPrintModal';
import { ReminderModal } from './components/ReminderModal';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => StorageService.getCurrentUser());
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [branchFilter, setBranchFilter] = useState<BranchFilter>('all');

  // Theme State (default to 'light' for high contrast, clean & bright UI)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('nsgd_theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      localStorage.setItem('nsgd_theme', next);
    } catch {}
  };

  // Core Data State with immediate synchronous default values
  const [students, setStudents] = useState<Student[]>(() => StorageService.getStudents());
  const [branches, setBranches] = useState<Branch[]>(() => StorageService.getBranches());
  const [disciplines, setDisciplines] = useState<Discipline[]>(INITIAL_DISCIPLINES);
  const [packages, setPackages] = useState<FeePackage[]>(() => StorageService.getPackages());
  const [classes, setClasses] = useState<ClassSession[]>(() => StorageService.getClasses());
  const [receipts, setReceipts] = useState<PaymentReceipt[]>(() => StorageService.getReceipts());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => StorageService.getAttendance());
  const [config, setConfig] = useState<ClubConfig>(() => StorageService.getConfig());
  const [users, setUsers] = useState<UserAccount[]>(() => StorageService.getUsers());

  // Modal States
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [studentDetailOpen, setStudentDetailOpen] = useState(false);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState<Student | null>(null);

  const [receiptPrintOpen, setReceiptPrintOpen] = useState(false);
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<PaymentReceipt | null>(null);

  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [selectedStudentForReminder, setSelectedStudentForReminder] = useState<Student | null>(null);

  // Load Initial State from Storage
  const loadAllData = () => {
    setStudents(StorageService.getStudents());
    setBranches(StorageService.getBranches());
    setPackages(StorageService.getPackages());
    setClasses(StorageService.getClasses());
    setReceipts(StorageService.getReceipts());
    setAttendance(StorageService.getAttendance());
    setConfig(StorageService.getConfig());
    setUsers(StorageService.getUsers());
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // -------------------------------------------------------------
  // STUDENT HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setStudentModalOpen(true);
  };

  const handleOpenEditStudent = (student: Student) => {
    setEditingStudent(student);
    setStudentModalOpen(true);
  };

  const handleSaveStudent = (savedStudent: Student) => {
    const updated = StorageService.saveStudent(savedStudent);
    setStudents(updated);

    // If detail modal is open for this student, update it too
    if (selectedStudentForDetail && selectedStudentForDetail.id === savedStudent.id) {
      setSelectedStudentForDetail(savedStudent);
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa hồ sơ học viên này khỏi danh sách?')) {
      const updated = StorageService.deleteStudent(studentId);
      setStudents(updated);
      if (studentDetailOpen && selectedStudentForDetail?.id === studentId) {
        setStudentDetailOpen(false);
      }
    }
  };

  const handleViewStudentDetail = (student: Student) => {
    setSelectedStudentForDetail(student);
    setStudentDetailOpen(true);
  };

  // -------------------------------------------------------------
  // PAYMENT / TUITION HANDLERS
  // -------------------------------------------------------------
  const handleOpenPayment = (student?: Student) => {
    setSelectedStudentForPayment(student || null);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (receipt: PaymentReceipt, updatedStudent: Student) => {
    // 1. Save receipt
    const updatedReceipts = StorageService.addReceipt(receipt);
    setReceipts(updatedReceipts);

    // 2. Save student status
    const updatedStudents = StorageService.saveStudent(updatedStudent);
    setStudents(updatedStudents);

    if (selectedStudentForDetail && selectedStudentForDetail.id === updatedStudent.id) {
      setSelectedStudentForDetail(updatedStudent);
    }

    // Automatically prompt print receipt modal
    setSelectedReceiptForPrint(receipt);
    setReceiptPrintOpen(true);
  };

  const handlePrintReceipt = (receipt: PaymentReceipt) => {
    setSelectedReceiptForPrint(receipt);
    setReceiptPrintOpen(true);
  };

  const handleCancelReceipt = (receiptId: string) => {
    if (confirm('Bạn có chắc chắn muốn hủy phiếu thu này?')) {
      const updated = receipts.filter((r) => r.id !== receiptId);
      setReceipts(updated);
      StorageService.saveReceipts(updated);
    }
  };

  // -------------------------------------------------------------
  // REMINDER HANDLERS
  // -------------------------------------------------------------
  const handleOpenReminder = (student: Student) => {
    setSelectedStudentForReminder(student);
    setReminderModalOpen(true);
  };

  // -------------------------------------------------------------
  // ATTENDANCE HANDLERS
  // -------------------------------------------------------------
  const handleCheckInStudent = (
    student: Student,
    classSession: ClassSession,
    date: string,
    note?: string
  ) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}-${student.id}`,
      studentId: student.id,
      studentName: student.fullName,
      studentCode: student.code,
      classId: classSession?.id || 'default',
      className: classSession?.name || 'Ca tập chung',
      branchId: student.branchId,
      date,
      timeChecked: timeStr,
      status: 'present',
      deductedSession: student.remainingSessions !== undefined,
      note,
    };

    const updatedAtt = StorageService.addAttendance(newRecord);
    setAttendance(updatedAtt);

    // Decrement session count if session-based
    if (student.remainingSessions !== undefined && student.remainingSessions > 0) {
      const updatedStudent: Student = {
        ...student,
        remainingSessions: student.remainingSessions - 1,
        feeStatus:
          student.remainingSessions - 1 <= 0
            ? 'overdue'
            : student.remainingSessions - 1 <= 3
            ? 'expiring_soon'
            : 'paid',
      };
      const updatedStList = StorageService.saveStudent(updatedStudent);
      setStudents(updatedStList);
    }
  };

  // -------------------------------------------------------------
  // CLASS / PACKAGE / CONFIG HANDLERS
  // -------------------------------------------------------------
  const handleSaveClass = (classSession: ClassSession) => {
    const updated = StorageService.saveClass(classSession);
    setClasses(updated);
  };

  const handleDeleteClass = (classId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa lớp học này?')) {
      const updated = StorageService.deleteClass(classId);
      setClasses(updated);
    }
  };

  const handleSavePackages = (pkgs: FeePackage[]) => {
    setPackages(pkgs);
    StorageService.savePackages(pkgs);
  };

  const handleSaveUsers = (newUsers: UserAccount[]) => {
    setUsers(newUsers);
    StorageService.saveUsers(newUsers);
  };

  const handleSaveConfig = (newConfig: ClubConfig) => {
    setConfig(newConfig);
    setBranches(newConfig.branches);
    StorageService.saveConfig(newConfig);
    StorageService.saveBranches(newConfig.branches);
  };

  const handleToggleReserve = (student: Student) => {
    const isReserved = student.feeStatus === 'reserved';
    const updated: Student = {
      ...student,
      feeStatus: isReserved ? 'paid' : 'reserved',
      notes: isReserved ? student.notes?.replace('[BẢO LƯU] ', '') : `[BẢO LƯU] ${student.notes || ''}`,
    };
    handleSaveStudent(updated);
  };

  const handleResetData = () => {
    StorageService.resetToInitialData();
    loadAllData();
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    StorageService.setCurrentUser(user);
    if (user.branchId && user.branchId !== 'all') {
      setBranchFilter(user.branchId as BranchFilter);
    }
  };

  const handleLogout = () => {
    StorageService.logoutUser();
    setCurrentUser(null);
  };

  const handleSwitchUser = () => {
    StorageService.logoutUser();
    setCurrentUser(null);
  };

  const overdueCount = students.filter(s => s.feeStatus === 'unpaid' || s.feeStatus === 'expiring_soon').length;

  // If user is not logged in, show Login Screen immediately
  if (!currentUser) {
    return (
      <LoginScreen
        users={users}
        onLogin={handleLoginSuccess}
        theme={theme}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      theme === 'light'
        ? 'bg-slate-100/90 text-slate-800 selection:bg-red-700 selection:text-white'
        : 'bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950'
    }`}>
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        branchFilter={branchFilter}
        onChangeBranchFilter={setBranchFilter}
        branches={branches}
        config={config}
        alertCount={overdueCount}
        onQuickAddStudent={handleOpenAddStudent}
        onQuickPayment={() => handleOpenPayment()}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        onOpenChangePassword={() => setChangePasswordModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <Dashboard
            students={students}
            branches={branches}
            disciplines={disciplines}
            packages={packages}
            receipts={receipts}
            attendance={attendance}
            branchFilter={branchFilter}
            onSelectBranchFilter={setBranchFilter}
            onPayTuition={(student) => handleOpenPayment(student)}
            onSendReminder={handleOpenReminder}
            onPrintReceipt={handlePrintReceipt}
            onViewStudent={handleViewStudentDetail}
          />
        )}

        {activeTab === 'students' && (
          <StudentManagement
            students={students}
            branches={branches}
            disciplines={disciplines}
            packages={packages}
            classes={classes}
            branchFilter={branchFilter}
            onSelectBranchFilter={setBranchFilter}
            onViewStudent={handleViewStudentDetail}
            onEditStudent={handleOpenEditStudent}
            onDeleteStudent={handleDeleteStudent}
            onPayTuition={(student) => handleOpenPayment(student)}
            onSendReminder={handleOpenReminder}
            onOpenAddStudent={handleOpenAddStudent}
          />
        )}

        {activeTab === 'tuition' && (
          <TuitionManagement
            receipts={receipts}
            branches={branches}
            students={students}
            branchFilter={branchFilter}
            onSelectBranchFilter={setBranchFilter}
            onOpenNewPayment={() => handleOpenPayment()}
            onPrintReceipt={handlePrintReceipt}
            onCancelReceipt={handleCancelReceipt}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceTracker
            students={students}
            branches={branches}
            classes={classes}
            attendance={attendance}
            branchFilter={branchFilter}
            onSelectBranchFilter={setBranchFilter}
            onCheckInStudent={handleCheckInStudent}
          />
        )}

        {activeTab === 'classes' && (
          <ClassManagement
            classes={classes}
            branches={branches}
            disciplines={disciplines}
            students={students}
            branchFilter={branchFilter}
            onSelectBranchFilter={setBranchFilter}
            onSaveClass={handleSaveClass}
            onDeleteClass={handleDeleteClass}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsAnalytics
            receipts={receipts}
            students={students}
            branches={branches}
            disciplines={disciplines}
            packages={packages}
            branchFilter={branchFilter}
            onSelectBranchFilter={setBranchFilter}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            config={config}
            packages={packages}
            branches={branches}
            disciplines={disciplines}
            users={users}
            onSaveConfig={handleSaveConfig}
            onSavePackages={handleSavePackages}
            onSaveUsers={handleSaveUsers}
            onResetData={handleResetData}
            onReloadAllData={loadAllData}
          />
        )}

      </main>

      {/* Footer */}
      <footer className={`border-t py-4 px-6 text-center text-xs transition-colors ${
        theme === 'light'
          ? 'bg-white border-slate-200 text-slate-500'
          : 'bg-slate-950 border-slate-800 text-slate-400'
      }`}>
        <p>
          © 2026 <strong className={theme === 'light' ? 'text-slate-800' : 'text-slate-200'}>CLB Ngôi Sao Gia Định</strong> • Phần Mềm Quản Lý Học Phí 2 Chi Nhánh • Thiết kế chuyên nghiệp, tiện dụng
        </p>
      </footer>

      {/* ALL MODALS */}
      
      {/* 1. Add / Edit Student Modal */}
      {studentModalOpen && (
        <StudentModal
          student={editingStudent}
          branches={branches}
          disciplines={disciplines}
          packages={packages}
          classes={classes}
          totalStudentsCount={students.length}
          onClose={() => setStudentModalOpen(false)}
          onSave={handleSaveStudent}
        />
      )}

      {/* 2. Student Detail Modal */}
      {studentDetailOpen && selectedStudentForDetail && (
        <StudentDetailModal
          student={selectedStudentForDetail}
          branch={branches.find((b) => b.id === selectedStudentForDetail.branchId) || branches[0]}
          discipline={disciplines.find((d) => d.id === selectedStudentForDetail.disciplineId)}
          feePackage={packages.find((p) => p.id === selectedStudentForDetail.packageId)}
          currentClass={classes.find((c) => c.id === selectedStudentForDetail.classId)}
          receipts={receipts.filter((r) => r.studentId === selectedStudentForDetail.id)}
          attendance={attendance.filter((a) => a.studentId === selectedStudentForDetail.id)}
          onClose={() => setStudentDetailOpen(false)}
          onEditStudent={handleOpenEditStudent}
          onPayTuition={(student) => handleOpenPayment(student)}
          onSendReminder={handleOpenReminder}
          onPrintReceipt={handlePrintReceipt}
          onToggleReserve={handleToggleReserve}
        />
      )}

      {/* 3. Payment Modal (VietQR / Cash / Card) */}
      {paymentModalOpen && (
        <PaymentModal
          students={students}
          packages={packages}
          branches={branches}
          selectedStudentId={selectedStudentForPayment?.id}
          defaultBranchId={selectedStudentForPayment?.branchId || 'cn1'}
          currentUser={currentUser}
          onClose={() => setPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* 4. Receipt Printable Modal */}
      {receiptPrintOpen && selectedReceiptForPrint && (
        <ReceiptPrintModal
          receipt={selectedReceiptForPrint}
          student={students.find((s) => s.id === selectedReceiptForPrint.studentId)}
          branch={branches.find((b) => b.id === selectedReceiptForPrint.branchId)}
          onClose={() => setReceiptPrintOpen(false)}
        />
      )}

      {/* 5. Reminder Modal (Zalo / SMS) */}
      {reminderModalOpen && selectedStudentForReminder && (
        <ReminderModal
          student={selectedStudentForReminder}
          branch={branches.find((b) => b.id === selectedStudentForReminder.branchId) || branches[0]}
          feePackage={packages.find((p) => p.id === selectedStudentForReminder.packageId)}
          onClose={() => setReminderModalOpen(false)}
        />
      )}

      {/* 6. Change Password Modal */}
      {changePasswordModalOpen && currentUser && (
        <ChangePasswordModal
          user={currentUser}
          onClose={() => setChangePasswordModalOpen(false)}
          onSave={(updatedUser) => {
            handleSaveUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
            setCurrentUser(updatedUser);
            StorageService.setCurrentUser(updatedUser);
          }}
        />
      )}

    </div>
  );
}
