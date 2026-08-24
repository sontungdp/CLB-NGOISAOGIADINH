import React, { useState, useMemo } from 'react';
import {
  Student,
  Branch,
  ClassSession,
  AttendanceRecord,
  BranchFilter,
} from '../types';
import {
  formatDate,
  getTodayDateString,
  formatVND,
  removeVietnameseTones,
  exportToCsv,
} from '../utils/formatters';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  MapPin,
  Sparkles,
  AlertTriangle,
  Search,
  Calendar,
  Filter,
  Download,
  Flame,
  Award,
  TrendingUp,
  BarChart3,
  Eye,
  X,
  Phone,
  SlidersHorizontal,
  ChevronRight,
  User,
  History,
  CalendarDays,
  Check,
} from 'lucide-react';

interface AttendanceTrackerProps {
  students: Student[];
  branches: Branch[];
  classes: ClassSession[];
  attendance: AttendanceRecord[];
  branchFilter: BranchFilter;
  onSelectBranchFilter: (filter: BranchFilter) => void;
  onCheckInStudent: (student: Student, classSession: ClassSession, date: string, note?: string) => void;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  students,
  branches,
  classes,
  attendance,
  branchFilter,
  onSelectBranchFilter,
  onCheckInStudent,
}) => {
  // Current view tab
  const [viewMode, setViewMode] = useState<'daily' | 'monthly' | 'history'>('daily');

  // Daily Check-in state
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedBranchId, setSelectedBranchId] = useState<'cn1' | 'cn2'>(
    branchFilter === 'cn2' ? 'cn2' : 'cn1'
  );
  const [dailySearchTerm, setDailySearchTerm] = useState<string>('');

  // Available classes for selected branch
  const branchClasses = classes.filter((c) => c.branchId === 'all' || c.branchId === selectedBranchId);
  const [selectedClassId, setSelectedClassId] = useState<string>(branchClasses[0]?.id || '');
  const activeClass = classes.find((c) => c.id === selectedClassId) || branchClasses[0];

  // Monthly Report Filter state
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1); // 1 - 12
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear()); // e.g. 2026
  const [monthlyBranchFilter, setMonthlyBranchFilter] = useState<'all' | 'cn1' | 'cn2'>(
    branchFilter === 'cn2' ? 'cn2' : branchFilter === 'cn1' ? 'cn1' : 'all'
  );
  const [monthlyClassFilter, setMonthlyClassFilter] = useState<string>('all');
  const [monthlySearchTerm, setMonthlySearchTerm] = useState<string>('');
  const [monthlyFrequencyFilter, setMonthlyFrequencyFilter] = useState<
    'all' | 'high' | 'medium' | 'low' | 'zero'
  >('all');

  // History Log Filter state
  const [historySearchTerm, setHistorySearchTerm] = useState<string>('');
  const [historyBranchFilter, setHistoryBranchFilter] = useState<'all' | 'cn1' | 'cn2'>('all');
  const [historyClassFilter, setHistoryClassFilter] = useState<string>('all');

  // Modal: View specific student's attendance detail
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);

  // Month prefix string for filtering: YYYY-MM
  const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  // Daily view: filter students for daily check-in
  const dailyStudents = useMemo(() => {
    const term = dailySearchTerm.trim().toLowerCase();
    const termNorm = removeVietnameseTones(term);

    return students.filter((s) => {
      if (s.branchId !== selectedBranchId) return false;
      if (s.feeStatus === 'reserved') return false;
      if (selectedClassId && s.classId && s.classId !== selectedClassId) {
        return false;
      }
      if (!term) return true;

      const nameLower = s.fullName.toLowerCase();
      const nameNorm = removeVietnameseTones(nameLower);
      const codeLower = s.code.toLowerCase();
      const phoneClean = s.phone.replace(/\s+/g, '');

      return (
        nameLower.includes(term) ||
        nameNorm.includes(termNorm) ||
        codeLower.includes(term) ||
        phoneClean.includes(term)
      );
    });
  }, [students, selectedBranchId, selectedClassId, dailySearchTerm]);

  // Check-in on selected date
  const dateAttendance = attendance.filter(
    (a) => a.date === selectedDate && a.branchId === selectedBranchId
  );

  const isCheckedIn = (studentId: string) => {
    return dateAttendance.some((a) => a.studentId === studentId);
  };

  const getAttendanceRecord = (studentId: string) => {
    return dateAttendance.find((a) => a.studentId === studentId);
  };

  const presentCount = dailyStudents.filter((s) => isCheckedIn(s.id)).length;

  // Calculate sessions attended by student in current date's month
  const getStudentSessionsInMonth = (studentId: string, ymPrefix: string) => {
    return attendance.filter(
      (a) => a.studentId === studentId && a.date.startsWith(ymPrefix)
    ).length;
  };

  // Monthly Report Calculations
  const monthlyAttendanceRecords = useMemo(() => {
    return attendance.filter((a) => a.date.startsWith(monthPrefix));
  }, [attendance, monthPrefix]);

  // Students list with monthly attendance metrics
  const monthlyStudentStats = useMemo(() => {
    const term = monthlySearchTerm.trim().toLowerCase();
    const termNorm = removeVietnameseTones(term);

    // Filter students by branch & class
    const list = students.filter((s) => {
      if (monthlyBranchFilter !== 'all' && s.branchId !== monthlyBranchFilter) return false;
      if (monthlyClassFilter !== 'all' && s.classId !== monthlyClassFilter) return false;
      if (!term) return true;

      const nameLower = s.fullName.toLowerCase();
      const nameNorm = removeVietnameseTones(nameLower);
      const codeLower = s.code.toLowerCase();
      const phoneClean = s.phone.replace(/\s+/g, '');

      return (
        nameLower.includes(term) ||
        nameNorm.includes(termNorm) ||
        codeLower.includes(term) ||
        phoneClean.includes(term)
      );
    });

    // Compute monthly sessions for each student
    const statsList = list.map((student) => {
      const studentMonthlyRecords = monthlyAttendanceRecords.filter((a) => a.studentId === student.id);
      const sessionCount = studentMonthlyRecords.length;
      const allTimeSessions = attendance.filter((a) => a.studentId === student.id).length;

      // Extract unique dates attended this month (sorted ascending)
      const datesAttended = Array.from(new Set(studentMonthlyRecords.map((a) => a.date))).sort();

      // Determine frequency category
      let category: 'high' | 'medium' | 'low' | 'zero' = 'zero';
      if (sessionCount >= 10) category = 'high';
      else if (sessionCount >= 6) category = 'medium';
      else if (sessionCount > 0) category = 'low';

      return {
        student,
        sessionCount,
        allTimeSessions,
        datesAttended,
        records: studentMonthlyRecords,
        category,
      };
    });

    // Apply frequency filter
    if (monthlyFrequencyFilter !== 'all') {
      return statsList.filter((item) => item.category === monthlyFrequencyFilter);
    }

    // Sort descending by sessions in month
    return statsList.sort((a, b) => b.sessionCount - a.sessionCount);
  }, [
    students,
    monthlyAttendanceRecords,
    attendance,
    monthlyBranchFilter,
    monthlyClassFilter,
    monthlySearchTerm,
    monthlyFrequencyFilter,
  ]);

  // Overall Monthly KPIs
  const totalMonthlyCheckins = monthlyAttendanceRecords.length;
  const activeStudentsInMonthCount = useMemo(() => {
    const set = new Set(monthlyAttendanceRecords.map((a) => a.studentId));
    return set.size;
  }, [monthlyAttendanceRecords]);

  const topStudentInMonth = useMemo(() => {
    if (monthlyStudentStats.length === 0) return null;
    const top = monthlyStudentStats[0];
    return top.sessionCount > 0 ? top : null;
  }, [monthlyStudentStats]);

  const averageSessionsPerActive = activeStudentsInMonthCount > 0
    ? (totalMonthlyCheckins / activeStudentsInMonthCount).toFixed(1)
    : '0';

  // Quick month helpers
  const handleSetCurrentMonth = () => {
    const now = new Date();
    setSelectedMonth(now.getMonth() + 1);
    setSelectedYear(now.getFullYear());
  };

  const handleSetPrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  // Export Monthly Report to CSV/Excel
  const handleExportMonthlyCSV = () => {
    const headers = [
      'STT',
      'Mã Học Viên',
      'Họ và Tên',
      'Số Điện Thoại',
      'Cơ Sở',
      'Lớp Tập',
      'Tháng Báo Cáo',
      'Số Buổi Tập Trong Tháng',
      'Tổng Buổi Toàn Thời Gian',
      'Các Ngày Điểm Danh (Tháng)',
      'Loại Gói',
      'Hạn Học Phí',
    ];

    const rows = monthlyStudentStats.map((item, index) => {
      const cls = classes.find((c) => c.id === item.student.classId);
      const branch = branches.find((b) => b.id === item.student.branchId);

      return [
        index + 1,
        item.student.code,
        item.student.fullName,
        item.student.phone,
        branch?.name || (item.student.branchId === 'cn1' ? 'Cơ Sở 1' : 'Cơ Sở 2'),
        cls?.name || 'Chưa gán lớp',
        `Tháng ${selectedMonth}/${selectedYear}`,
        item.sessionCount,
        item.allTimeSessions,
        item.datesAttended.map((d) => formatDate(d)).join('; '),
        item.student.remainingSessions !== undefined ? `Gói Lượt (Còn ${item.student.remainingSessions}b)` : 'Gói Định Kỳ',
        formatDate(item.student.feeDueDate),
      ];
    });

    exportToCsv(`BaoCao_ChuyenCan_Lop_Thang_${selectedMonth}_${selectedYear}.csv`, headers, rows);
  };

  // History Log view filtering
  const filteredHistoryAttendance = useMemo(() => {
    const term = historySearchTerm.trim().toLowerCase();
    const termNorm = removeVietnameseTones(term);

    return attendance.filter((a) => {
      if (historyBranchFilter !== 'all' && a.branchId !== historyBranchFilter) return false;
      if (historyClassFilter !== 'all' && a.classId !== historyClassFilter) return false;
      if (!term) return true;

      const nameLower = a.studentName.toLowerCase();
      const nameNorm = removeVietnameseTones(nameLower);
      const codeLower = a.studentCode.toLowerCase();

      return nameLower.includes(term) || nameNorm.includes(termNorm) || codeLower.includes(term);
    });
  }, [attendance, historyBranchFilter, historyClassFilter, historySearchTerm]);

  // Selected date month prefix for daily view
  const dailyDateMonthPrefix = selectedDate.slice(0, 7);
  const dailyMonthLabel = `T${selectedDate.slice(5, 7)}/${selectedDate.slice(0, 4)}`;

  return (
    <div className="space-y-6 pb-12">
      {/* Navigation View Mode Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-700">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Quản Lý Điểm Danh & Chuyên Cần
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Chấm công lớp học, trừ buổi thẻ lượt và lọc thống kê số buổi học viên tập trong tháng.
              </p>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setViewMode('daily')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'daily'
                ? 'bg-white text-red-700 shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            Điểm Danh Theo Ngày
          </button>

          <button
            type="button"
            onClick={() => setViewMode('monthly')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'monthly'
                ? 'bg-white text-red-700 shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Lọc & Báo Cáo Theo Tháng
            <span className="bg-red-100 text-red-800 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
              Mới
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('history')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'history'
                ? 'bg-white text-red-700 shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            Nhật Ký Check-in ({attendance.length})
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: DAILY CHECK-IN (ĐIỂM DANH THEO NGÀY) */}
      {/* ======================================================== */}
      {viewMode === 'daily' && (
        <div className="space-y-5">
          {/* Controls Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Chấm Công Lớp Học Theo Ca</span>
                  <span className="text-xs font-mono font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {formatDate(selectedDate)}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chọn cơ sở, lớp tập và ngày để điểm danh. Cột &quot;Tập Tháng Này&quot; hiển thị số buổi học viên đã tham gia trong tháng ({dailyMonthLabel}).
                </p>
              </div>

              {/* Sĩ số Badge */}
              <div className="flex items-center gap-3 bg-red-50/70 border border-red-200 px-4 py-2 rounded-xl text-xs">
                <div className="text-right">
                  <span className="text-slate-600 font-medium">Có mặt ngày này:</span>
                  <p className="text-base font-black text-red-700 font-mono">
                    {presentCount} / {dailyStudents.length} HV
                  </p>
                </div>
              </div>
            </div>

            {/* Controls Toolbar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {/* Branch Switch */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  1. Chọn Cơ Sở
                </label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => {
                    const bId = e.target.value as 'cn1' | 'cn2';
                    setSelectedBranchId(bId);
                    const nextClasses = classes.filter((c) => c.branchId === 'all' || c.branchId === bId);
                    if (nextClasses.length > 0) setSelectedClassId(nextClasses[0].id);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-red-600 focus:bg-white font-semibold cursor-pointer"
                >
                  <option value="cn1">📍 Cơ Sở 1 (2A Phan Chu Trinh)</option>
                  <option value="cn2">📍 Cơ Sở 2 (25A Nơ Trang Long)</option>
                </select>
              </div>

              {/* Class Switch */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  2. Chọn Lớp / Ca Tập
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-red-600 focus:bg-white cursor-pointer font-medium"
                >
                  <option value="">-- Tất cả học viên trong cơ sở --</option>
                  {branchClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.timeSlot})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Picker */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  3. Ngày Điểm Danh
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-red-600 focus:bg-white font-mono font-semibold"
                />
              </div>

              {/* Search in Class */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  4. Tìm Học Viên
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={dailySearchTerm}
                    onChange={(e) => setDailySearchTerm(e.target.value)}
                    placeholder="Gõ tên, mã HV..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-red-600 focus:bg-white font-medium"
                  />
                  {dailySearchTerm && (
                    <button
                      type="button"
                      onClick={() => setDailySearchTerm('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Sheet Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 text-sm">
                  {activeClass ? activeClass.name : 'Danh Sách Học Viên Chi Nhánh'}
                </span>
                {activeClass && (
                  <span className="text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
                    {activeClass.timeSlot} | {activeClass.coachName}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>
                  Ngày: <strong className="text-slate-900 font-mono">{formatDate(selectedDate)}</strong>
                </span>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => {
                    const ym = selectedDate.split('-');
                    setSelectedMonth(parseInt(ym[1], 10));
                    setSelectedYear(parseInt(ym[0], 10));
                    setViewMode('monthly');
                  }}
                  className="text-red-700 hover:text-red-800 font-bold underline flex items-center gap-1 cursor-pointer"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Xem tổng hợp cả tháng {dailyMonthLabel}
                </button>
              </div>
            </div>

            {dailyStudents.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Không tìm thấy học viên nào phù hợp với bộ lọc hoặc lớp học này.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Học Viên</th>
                      <th className="py-3 px-4">Loại Gói Học Phí</th>
                      <th className="py-3 px-4 text-center">
                        <span className="text-red-700 font-black">Tập Tháng Này ({dailyMonthLabel})</span>
                      </th>
                      <th className="py-3 px-4">Số Buổi Còn / Hạn Dùng</th>
                      <th className="py-3 px-4">Giờ Check-in</th>
                      <th className="py-3 px-4 text-right">Trạng Thái Điểm Danh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {dailyStudents.map((student) => {
                      const record = getAttendanceRecord(student.id);
                      const checked = !!record;
                      const isSessionBased = student.remainingSessions !== undefined;
                      const sessionsInThisMonth = getStudentSessionsInMonth(
                        student.id,
                        dailyDateMonthPrefix
                      );

                      return (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                          {/* Student Info */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full ${
                                  student.avatarColor || 'bg-red-600'
                                } text-white font-bold flex items-center justify-center text-xs shrink-0`}
                              >
                                {student.fullName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-xs">{student.fullName}</p>
                                <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
                                  <span>{student.code}</span>
                                  <span>•</span>
                                  <span>{student.phone}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Package type */}
                          <td className="py-3.5 px-4">
                            {isSessionBased ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                                Thẻ Vé Lượt / PT
                              </span>
                            ) : (
                              <span className="text-slate-700 font-medium">Gói Tháng / Định Kỳ</span>
                            )}
                          </td>

                          {/* Sessions in This Month (Highlighted) */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedStudentForDetail(student)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black transition-transform hover:scale-105 cursor-pointer ${
                                sessionsInThisMonth >= 8
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : sessionsInThisMonth >= 4
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                  : sessionsInThisMonth > 0
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}
                              title="Bấm để xem chi tiết lịch sử điểm danh của học viên"
                            >
                              <Flame className={`w-3.5 h-3.5 ${sessionsInThisMonth > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
                              <span>{sessionsInThisMonth} buổi</span>
                              <Eye className="w-3 h-3 text-slate-400" />
                            </button>
                          </td>

                          {/* Remaining / Expiry */}
                          <td className="py-3.5 px-4 font-mono">
                            {isSessionBased ? (
                              <span
                                className={`font-bold ${
                                  (student.remainingSessions || 0) <= 2
                                    ? 'text-red-600 animate-pulse'
                                    : 'text-emerald-700'
                                }`}
                              >
                                Còn {student.remainingSessions} buổi
                              </span>
                            ) : (
                              <span className="text-slate-700 font-medium">{formatDate(student.feeDueDate)}</span>
                            )}
                          </td>

                          {/* Time Checked */}
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {checked ? (
                              <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                {record?.timeChecked}
                              </span>
                            ) : (
                              <span className="text-slate-400">---</span>
                            )}
                          </td>

                          {/* Action Button */}
                          <td className="py-3.5 px-4 text-right">
                            {checked ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Đã Có Mặt
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  onCheckInStudent(
                                    student,
                                    activeClass || branchClasses[0],
                                    selectedDate,
                                    isSessionBased ? 'Đã trừ 1 buổi thẻ lượt' : undefined
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                              >
                                <UserCheck className="w-4 h-4" />
                                {isSessionBased ? 'Điểm Danh & Trừ 1 Buổi' : 'Điểm Danh Có Mặt'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MONTHLY ATTENDANCE REPORT & FILTER (BÁO CÁO CHUYÊN CẦN THEO THÁNG) */}
      {/* ======================================================== */}
      {viewMode === 'monthly' && (
        <div className="space-y-6">
          {/* Monthly Filter Bar Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900">
                    Báo Cáo Chuyên Cần Học Viên Theo Tháng
                  </h2>
                  <span className="bg-red-50 text-red-700 border border-red-200 text-xs px-2.5 py-0.5 rounded-full font-black font-mono">
                    Tháng {selectedMonth}/{selectedYear}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Xem và lọc chính xác từng học viên theo lớp đã đi tập bao nhiêu buổi trong tháng, thống kê chuyên cần và xuất file Excel.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleExportMonthlyCSV}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  Xuất Báo Cáo Excel
                </button>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
              {/* 1. Month Picker */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  1. Chọn Tháng & Năm
                </label>
                <div className="flex items-center gap-1.5">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-red-600 focus:bg-white cursor-pointer"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        Tháng {m}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-red-600 focus:bg-white cursor-pointer font-mono"
                  >
                    {[2024, 2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>
                        Năm {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Branch Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  2. Chọn Cơ Sở
                </label>
                <select
                  value={monthlyBranchFilter}
                  onChange={(e) => setMonthlyBranchFilter(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-red-600 focus:bg-white cursor-pointer"
                >
                  <option value="all">🏢 Tất Cả Cơ Sở (CS1 & CS2)</option>
                  <option value="cn1">📍 Cơ Sở 1 (Phan Chu Trinh)</option>
                  <option value="cn2">📍 Cơ Sở 2 (Nơ Trang Long)</option>
                </select>
              </div>

              {/* 3. Class Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  3. Lớp Học / Bộ Môn
                </label>
                <select
                  value={monthlyClassFilter}
                  onChange={(e) => setMonthlyClassFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-red-600 focus:bg-white cursor-pointer"
                >
                  <option value="all">🥋 Tất cả các lớp tập</option>
                  {classes
                    .filter((c) => monthlyBranchFilter === 'all' || c.branchId === 'all' || c.branchId === monthlyBranchFilter)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.timeSlot})
                      </option>
                    ))}
                </select>
              </div>

              {/* 4. Frequency Level */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  4. Mức Độ Chuyên Cần
                </label>
                <select
                  value={monthlyFrequencyFilter}
                  onChange={(e) => setMonthlyFrequencyFilter(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-red-600 focus:bg-white cursor-pointer"
                >
                  <option value="all">Tất cả mức độ</option>
                  <option value="high">🟢 Chăm chỉ (≥ 10 buổi/tháng)</option>
                  <option value="medium">🟡 Đều đặn (6 - 9 buổi/tháng)</option>
                  <option value="low">🟠 Ít đi tập (1 - 5 buổi/tháng)</option>
                  <option value="zero">🔴 Chưa đi buổi nào (0 buổi)</option>
                </select>
              </div>

              {/* 5. Search Student */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  5. Tìm Học Viên
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={monthlySearchTerm}
                    onChange={(e) => setMonthlySearchTerm(e.target.value)}
                    placeholder="Gõ tên, mã, SĐT..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-red-600 focus:bg-white"
                  />
                  {monthlySearchTerm && (
                    <button
                      type="button"
                      onClick={() => setMonthlySearchTerm('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Period Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-500">Chọn nhanh:</span>
              <button
                type="button"
                onClick={handleSetCurrentMonth}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-bold transition-colors cursor-pointer"
              >
                Tháng Này
              </button>
              <button
                type="button"
                onClick={handleSetPrevMonth}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-bold transition-colors cursor-pointer"
              >
                Tháng Trước
              </button>
            </div>
          </div>

          {/* Monthly KPI Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Check-ins */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Tổng Lượt Điểm Danh</p>
                <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {totalMonthlyCheckins} <span className="text-xs font-normal text-slate-500">lượt</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Trong Tháng {selectedMonth}/{selectedYear}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>

            {/* Card 2: Active Students */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Học Viên Có Đi Tập</p>
                <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">
                  {activeStudentsInMonthCount} <span className="text-xs font-normal text-slate-500">/ {students.length} HV</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Tỷ lệ tham gia: {((activeStudentsInMonthCount / (students.length || 1)) * 100).toFixed(0)}%</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            {/* Card 3: Average Sessions */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">TB Buổi Tập / HV</p>
                <p className="text-2xl font-black text-blue-700 mt-1 font-mono">
                  {averageSessionsPerActive} <span className="text-xs font-normal text-slate-500">buổi/tháng</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Chuẩn đề xuất: 8 - 12 buổi</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* Card 4: Top Attendee */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Chăm Chỉ Nhất Tháng</p>
                {topStudentInMonth ? (
                  <>
                    <p className="text-sm font-black text-amber-900 mt-1 truncate max-w-[160px]">
                      {topStudentInMonth.student.fullName}
                    </p>
                    <p className="text-xs font-bold text-amber-700 font-mono">
                      🔥 {topStudentInMonth.sessionCount} buổi tập
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 mt-1">Chưa có dữ liệu</p>
                )}
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Monthly Detailed Attendance Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  Bảng Thống Kê Số Buổi Tập Của Học Viên (Tháng {selectedMonth}/{selectedYear})
                </span>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                  {monthlyStudentStats.length} học viên
                </span>
              </div>
              <span className="text-xs text-slate-500">
                Bấm vào dòng học viên hoặc nút <Eye className="w-3.5 h-3.5 inline text-red-700" /> để xem chi tiết từng ngày check-in.
              </span>
            </div>

            {monthlyStudentStats.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Không tìm thấy học viên nào khớp với bộ lọc tháng này.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Học Viên</th>
                      <th className="py-3 px-4">Cơ Sở & Lớp Tập</th>
                      <th className="py-3 px-4">Gói Học Phí</th>
                      <th className="py-3 px-4 text-center">
                        <span className="text-red-700 font-black">
                          SỐ BUỔI ĐÃ TẬP (T{selectedMonth}/{selectedYear})
                        </span>
                      </th>
                      <th className="py-3 px-4">Các Ngày Check-in Trong Tháng</th>
                      <th className="py-3 px-4 text-center">Tích Lũy Toàn Thời Gian</th>
                      <th className="py-3 px-4 text-right">Chi Tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {monthlyStudentStats.map((item) => {
                      const { student, sessionCount, allTimeSessions, datesAttended } = item;
                      const cls = classes.find((c) => c.id === student.classId);
                      const isSessionBased = student.remainingSessions !== undefined;

                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-red-50/40 transition-colors cursor-pointer group"
                          onClick={() => setSelectedStudentForDetail(student)}
                        >
                          {/* Student Info */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full ${
                                  student.avatarColor || 'bg-red-600'
                                } text-white font-bold flex items-center justify-center text-xs shrink-0`}
                              >
                                {student.fullName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-xs group-hover:text-red-700 transition-colors">
                                  {student.fullName}
                                </p>
                                <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
                                  <span>{student.code}</span>
                                  <span>•</span>
                                  <span>{student.phone}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Branch & Class */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  student.branchId === 'cn1'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {student.branchId === 'cn1' ? 'CS1 (Phan Chu Trinh)' : 'CS2 (Nơ Trang Long)'}
                              </span>
                              <p className="text-slate-700 font-medium truncate max-w-[170px]">
                                {cls ? cls.name : 'Chưa gán lớp'}
                              </p>
                            </div>
                          </td>

                          {/* Fee Package */}
                          <td className="py-3.5 px-4 font-mono">
                            {isSessionBased ? (
                              <span className="text-emerald-700 font-bold">
                                Gói lượt (Còn {student.remainingSessions}b)
                              </span>
                            ) : (
                              <span className="text-slate-600">
                                Gói tháng (Hạn: {formatDate(student.feeDueDate)})
                              </span>
                            )}
                          </td>

                          {/* SESSIONS IN MONTH (MAIN FOCUS) */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span
                                className={`px-3 py-1 rounded-xl text-sm font-black font-mono shadow-2xs ${
                                  sessionCount >= 10
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : sessionCount >= 6
                                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                    : sessionCount > 0
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                                }`}
                              >
                                {sessionCount} buổi
                              </span>
                              <span className="text-[10px] font-bold mt-1 text-slate-500">
                                {sessionCount >= 10
                                  ? '🌟 Rất chăm chỉ'
                                  : sessionCount >= 6
                                  ? '👍 Đều đặn'
                                  : sessionCount > 0
                                  ? '⚠️ Ít đi tập'
                                  : '❌ Chưa đi tập'}
                              </span>
                            </div>
                          </td>

                          {/* DATES ATTENDED CHIPS */}
                          <td className="py-3.5 px-4">
                            {datesAttended.length === 0 ? (
                              <span className="text-slate-400 italic text-[11px]">
                                Chưa check-in buổi nào trong T{selectedMonth}
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                                {datesAttended.slice(0, 6).map((d) => (
                                  <span
                                    key={d}
                                    className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200"
                                  >
                                    {d.slice(8, 10)}/{d.slice(5, 7)}
                                  </span>
                                ))}
                                {datesAttended.length > 6 && (
                                  <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-mono text-[10px] font-bold">
                                    +{datesAttended.length - 6} ngày
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* All-time Sessions */}
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                            {allTimeSessions} buổi
                          </td>

                          {/* Action Button */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStudentForDetail(student);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-bold text-xs transition-colors cursor-pointer border border-slate-200"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Chi Tiết
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: ATTENDANCE HISTORY LOG (NHẬT KÝ CHI TIẾT TỪNG BUỔI) */}
      {/* ======================================================== */}
      {viewMode === 'history' && (
        <div className="space-y-5">
          {/* Controls */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Nhật Ký Tất Cả Lượt Điểm Danh ({filteredHistoryAttendance.length} lượt)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lịch sử check-in chi tiết theo từng ngày, giờ và ghi chú của học viên.
                </p>
              </div>

              {/* Export History */}
              <button
                type="button"
                onClick={() => {
                  const headers = [
                    'STT',
                    'Ngày Điểm Danh',
                    'Giờ Check-in',
                    'Mã Học Viên',
                    'Tên Học Viên',
                    'Cơ Sở',
                    'Lớp Học',
                    'Trừ Buổi Thẻ Lượt',
                    'Ghi Chú',
                  ];
                  const rows = filteredHistoryAttendance.map((a, idx) => [
                    idx + 1,
                    formatDate(a.date),
                    a.timeChecked,
                    a.studentCode,
                    a.studentName,
                    a.branchId === 'cn1' ? 'Cơ Sở 1 (Phan Chu Trinh)' : 'Cơ Sở 2 (Nơ Trang Long)',
                    a.className,
                    a.deductedSession ? 'Có' : 'Không',
                    a.note || '',
                  ]);
                  exportToCsv(`NhatKy_DiemDanh_${getTodayDateString()}.csv`, headers, rows);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Xuất Nhật Ký CSV
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Lọc Cơ Sở
                </label>
                <select
                  value={historyBranchFilter}
                  onChange={(e) => setHistoryBranchFilter(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-red-600 focus:bg-white cursor-pointer"
                >
                  <option value="all">Tất cả chi nhánh</option>
                  <option value="cn1">Cơ Sở 1</option>
                  <option value="cn2">Cơ Sở 2</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Lọc Lớp
                </label>
                <select
                  value={historyClassFilter}
                  onChange={(e) => setHistoryClassFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-red-600 focus:bg-white cursor-pointer"
                >
                  <option value="all">Tất cả các lớp</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Tìm Học Viên
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={historySearchTerm}
                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                    placeholder="Gõ tên hoặc mã HV..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-red-600 focus:bg-white"
                  />
                  {historySearchTerm && (
                    <button
                      type="button"
                      onClick={() => setHistorySearchTerm('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {filteredHistoryAttendance.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Không tìm thấy lượt điểm danh nào.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Ngày & Giờ</th>
                      <th className="py-3 px-4">Học Viên</th>
                      <th className="py-3 px-4">Cơ Sở</th>
                      <th className="py-3 px-4">Lớp Học</th>
                      <th className="py-3 px-4">Loại Trừ Buổi</th>
                      <th className="py-3 px-4">Ghi Chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredHistoryAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                          <div>{formatDate(rec.date)}</div>
                          <span className="text-[11px] text-amber-800 font-bold">{rec.timeChecked}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{rec.studentName}</p>
                          <span className="font-mono text-[10px] text-slate-500">{rec.studentCode}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              rec.branchId === 'cn1' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {rec.branchId === 'cn1' ? 'Cơ Sở 1' : 'Cơ Sở 2'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-700 font-medium">{rec.className}</td>

                        <td className="py-3.5 px-4">
                          {rec.deductedSession ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200 text-[10px]">
                              -1 Buổi Thẻ Lượt
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Điểm danh định kỳ</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 italic">{rec.note || '---'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: STUDENT ATTENDANCE HISTORY DETAIL */}
      {/* ======================================================== */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${
                    selectedStudentForDetail.avatarColor || 'bg-red-600'
                  } text-white font-black flex items-center justify-center text-sm`}
                >
                  {selectedStudentForDetail.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    Lịch Sử Điểm Danh: {selectedStudentForDetail.fullName}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Mã HV: {selectedStudentForDetail.code} • SĐT: {selectedStudentForDetail.phone}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForDetail(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Summary Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-red-50 border border-red-200 p-3 rounded-xl">
                  <span className="text-[11px] font-bold text-red-700 uppercase">Tập Tháng {selectedMonth}/{selectedYear}</span>
                  <p className="text-xl font-black text-red-800 font-mono mt-0.5">
                    {attendance.filter(
                      (a) =>
                        a.studentId === selectedStudentForDetail.id &&
                        a.date.startsWith(monthPrefix)
                    ).length} buổi
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
                  <span className="text-[11px] font-bold text-blue-700 uppercase">Toàn Thời Gian</span>
                  <p className="text-xl font-black text-blue-800 font-mono mt-0.5">
                    {attendance.filter((a) => a.studentId === selectedStudentForDetail.id).length} buổi
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase">Tình Trạng Thẻ</span>
                  <p className="text-xs font-bold text-emerald-800 mt-1 font-mono">
                    {selectedStudentForDetail.remainingSessions !== undefined
                      ? `Còn ${selectedStudentForDetail.remainingSessions} buổi`
                      : `Hạn: ${formatDate(selectedStudentForDetail.feeDueDate)}`}
                  </p>
                </div>
              </div>

              {/* Attendance Log List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Chi Tiết Từng Buổi Tập:</span>
                  <span className="text-slate-500 font-normal">Sắp xếp theo thời gian mới nhất</span>
                </div>

                {attendance.filter((a) => a.studentId === selectedStudentForDetail.id).length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-100">
                    Chưa có lượt điểm danh nào được ghi nhận cho học viên này.
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                    {attendance
                      .filter((a) => a.studentId === selectedStudentForDetail.id)
                      .map((att) => {
                        const isThisMonth = att.date.startsWith(monthPrefix);
                        return (
                          <div
                            key={att.id}
                            className={`p-3 text-xs flex items-center justify-between hover:bg-slate-50 ${
                              isThisMonth ? 'bg-amber-50/40' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 font-bold flex items-center justify-center font-mono text-[11px] shrink-0">
                                {att.date.slice(8, 10)}/{att.date.slice(5, 7)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">{formatDate(att.date)}</span>
                                  <span className="font-mono text-amber-800 font-bold text-[11px]">
                                    ({att.timeChecked})
                                  </span>
                                  {isThisMonth && (
                                    <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">
                                      Tháng {selectedMonth}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">{att.className}</p>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Có mặt
                              </span>
                              {att.deductedSession && (
                                <p className="text-[10px] text-rose-600 font-bold">Đã trừ 1 buổi</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudentForDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
