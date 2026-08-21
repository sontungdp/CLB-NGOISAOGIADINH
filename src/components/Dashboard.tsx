import React from 'react';
import {
  Student,
  Branch,
  Discipline,
  FeePackage,
  PaymentReceipt,
  AttendanceRecord,
  BranchFilter,
} from '../types';
import {
  formatVND,
  formatDate,
  formatDateTime,
  getStudentStatusBadge,
  getDaysDiffFromToday,
} from '../utils/formatters';
import { ClubLogo } from './ClubLogo';
import {
  DollarSign,
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  CreditCard,
  MessageSquare,
  Printer,
  ChevronRight,
  Shield,
  Activity,
  Award,
  CalendarCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

interface DashboardProps {
  students: Student[];
  branches: Branch[];
  disciplines: Discipline[];
  packages: FeePackage[];
  receipts: PaymentReceipt[];
  attendance: AttendanceRecord[];
  branchFilter: BranchFilter;
  onSelectBranchFilter: (filter: BranchFilter) => void;
  onPayTuition: (student: Student) => void;
  onSendReminder: (student: Student) => void;
  onPrintReceipt: (receipt: PaymentReceipt) => void;
  onViewStudent: (student: Student) => void;
}

const COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];

export const Dashboard: React.FC<DashboardProps> = ({
  students,
  branches,
  disciplines,
  packages,
  receipts,
  attendance,
  branchFilter,
  onSelectBranchFilter,
  onPayTuition,
  onSendReminder,
  onPrintReceipt,
  onViewStudent,
}) => {
  // Filter by branch
  const filteredStudents =
    branchFilter === 'all'
      ? students
      : students.filter((s) => s.branchId === branchFilter);

  const filteredReceipts =
    branchFilter === 'all'
      ? receipts
      : receipts.filter((r) => r.branchId === branchFilter);

  const filteredAttendance =
    branchFilter === 'all'
      ? attendance
      : attendance.filter((a) => a.branchId === branchFilter);

  // Financial calculations
  const totalRevenue = filteredReceipts.reduce((sum, r) => sum + r.finalAmount, 0);

  // Calculate this month revenue (August 2026 or current month)
  const currentMonthReceipts = filteredReceipts.filter((r) => {
    const d = new Date(r.paymentDate);
    return d.getMonth() === 7 && d.getFullYear() === 2026; // Aug 2026
  });
  const monthRevenue = currentMonthReceipts.reduce((sum, r) => sum + r.finalAmount, 0);

  // Active students
  const activeStudents = filteredStudents.filter((s) => s.feeStatus !== 'reserved');
  const overdueStudents = filteredStudents.filter((s) => {
    if (s.feeStatus === 'overdue' || s.feeStatus === 'unpaid') return true;
    if (s.feeDueDate && getDaysDiffFromToday(s.feeDueDate) < 0) return true;
    if (s.remainingSessions !== undefined && s.remainingSessions <= 0) return true;
    return false;
  });

  const expiringSoonStudents = filteredStudents.filter((s) => {
    if (s.feeStatus === 'reserved') return false;
    if (s.remainingSessions !== undefined && s.remainingSessions > 0 && s.remainingSessions <= 3) {
      return true;
    }
    if (s.feeDueDate) {
      const diff = getDaysDiffFromToday(s.feeDueDate);
      return diff >= 0 && diff <= 7;
    }
    return s.feeStatus === 'expiring_soon';
  });

  // Students requiring action (overdue or expiring)
  const attentionList = [...overdueStudents, ...expiringSoonStudents].filter(
    (student, index, self) => index === self.findIndex((t) => t.id === student.id)
  );

  // Branch 1 vs Branch 2 Stats
  const cn1Receipts = receipts.filter((r) => r.branchId === 'cn1');
  const cn2Receipts = receipts.filter((r) => r.branchId === 'cn2');
  const cn1Revenue = cn1Receipts.reduce((sum, r) => sum + r.finalAmount, 0);
  const cn2Revenue = cn2Receipts.reduce((sum, r) => sum + r.finalAmount, 0);
  const cn1Students = students.filter((s) => s.branchId === 'cn1');
  const cn2Students = students.filter((s) => s.branchId === 'cn2');

  // Chart Data: Monthly Revenue History (Simulation of 6 months)
  const monthlyRevenueData = [
    { month: 'T3/2026', cn1: 14500000, cn2: 12200000, total: 26700000 },
    { month: 'T4/2026', cn1: 18200000, cn2: 15400000, total: 33600000 },
    { month: 'T5/2026', cn1: 21000000, cn2: 19800000, total: 40800000 },
    { month: 'T6/2026', cn1: 24500000, cn2: 22100000, total: 46600000 },
    { month: 'T7/2026', cn1: 28900000, cn2: 25400000, total: 54300000 },
    { month: 'T8/2026', cn1: cn1Revenue || 19500000, cn2: cn2Revenue || 17800000, total: (cn1Revenue || 19500000) + (cn2Revenue || 17800000) },
  ];

  // Discipline Distribution Data
  const disciplineData = disciplines.map((d) => {
    const count = filteredStudents.filter((s) => s.disciplineId === d.id).length;
    return { name: d.name.split(' (')[0], count, id: d.id };
  }).filter((item) => item.count > 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Branch Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border border-slate-800 p-6 shadow-xl text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <ClubLogo size="lg" className="border border-amber-400/40 shadow-xl" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                  CLB NGÔI SAO GIA ĐỊNH
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {branchFilter === 'all'
                  ? 'Tổng Quan Quản Lý Học Phí & Học Viên 2 Chi Nhánh'
                  : branchFilter === 'cn1'
                  ? 'Chi Nhánh 1 (2A Phan Đăng Lưu, Bình Thạnh)'
                  : 'Chi Nhánh 2 (45 Nguyễn Văn Đậu, Bình Thạnh)'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Kiểm soát số liệu học phí, tự động tạo mã VietQR, cảnh báo học phí quá hạn và điểm danh thực tế.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => onSelectBranchFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                branchFilter === 'all'
                  ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Cả 2 Cơ Sở
            </button>
            <button
              onClick={() => onSelectBranchFilter('cn1')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                branchFilter === 'cn1'
                  ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Cơ Sở 1 (Phan Đăng Lưu)
            </button>
            <button
              onClick={() => onSelectBranchFilter('cn2')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                branchFilter === 'cn2'
                  ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Cơ Sở 2 (Nguyễn Văn Đậu)
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Doanh thu */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-amber-500/50 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng Thu Học Phí
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {formatVND(totalRevenue)}
            </p>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              {filteredReceipts.length} phiếu thu đã lập
            </p>
          </div>
        </div>

        {/* Học viên */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-blue-500/50 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Học Viên Đang Tập
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 font-mono">
              {activeStudents.length} <span className="text-sm font-normal text-slate-500">học viên</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Tổng {filteredStudents.length} hồ sơ (bao gồm bảo lưu)
            </p>
          </div>
        </div>

        {/* Quá hạn đóng phí */}
        <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-red-500/60 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
              Quá Hạn Đóng Phí
            </span>
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-red-600 font-mono">
              {overdueStudents.length} <span className="text-sm font-normal text-red-500">học viên</span>
            </p>
            <p className="text-xs text-red-600/90 mt-1 font-medium">
              Cần liên hệ nhắc nợ học phí
            </p>
          </div>
        </div>

        {/* Sắp hết hạn */}
        <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-amber-500/60 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Sắp Đến Hạn (&le; 7 ngày)
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-amber-700 font-mono">
              {expiringSoonStudents.length} <span className="text-sm font-normal text-amber-600">học viên</span>
            </p>
            <p className="text-xs text-amber-700 mt-1 font-medium">
              Gửi tin nhắn Zalo/SMS nhắc gia hạn
            </p>
          </div>
        </div>

      </div>

      {/* Branch 1 vs Branch 2 Comparative Overview (When showing All) */}
      {branchFilter === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* CN1 Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-extrabold text-red-700 uppercase tracking-wider px-2 py-0.5 bg-red-50 rounded-md border border-red-200">
                  CƠ SỞ 1
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">2A Phan Đăng Lưu, Bình Thạnh</h3>
                <p className="text-xs text-slate-500 mt-0.5">HLV Trưởng: Nguyễn Hoàng Long (0907 888 111)</p>
              </div>
              <button
                onClick={() => onSelectBranchFilter('cn1')}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 font-semibold border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Xem chi tiết &rarr;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
              <div>
                <span className="text-xs text-slate-500">Doanh thu ghi nhận:</span>
                <p className="text-lg font-black text-amber-600 font-mono">{formatVND(cn1Revenue)}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Học viên quản lý:</span>
                <p className="text-lg font-black text-slate-800 font-mono">{cn1Students.length} HV</p>
              </div>
            </div>
          </div>

          {/* CN2 Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-extrabold text-red-700 uppercase tracking-wider px-2 py-0.5 bg-red-50 rounded-md border border-red-200">
                  CƠ SỞ 2
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">45 Nguyễn Văn Đậu, Bình Thạnh</h3>
                <p className="text-xs text-slate-500 mt-0.5">HLV Trưởng: Trần Minh Trí (0907 888 222)</p>
              </div>
              <button
                onClick={() => onSelectBranchFilter('cn2')}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 font-semibold border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Xem chi tiết &rarr;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
              <div>
                <span className="text-xs text-slate-500">Doanh thu ghi nhận:</span>
                <p className="text-lg font-black text-amber-600 font-mono">{formatVND(cn2Revenue)}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Học viên quản lý:</span>
                <p className="text-lg font-black text-slate-800 font-mono">{cn2Students.length} HV</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Actionable Attention List: Học viên cần đóng học phí ngay */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">
                Danh Sách Cần Gia Hạn & Nhắc Học Phí ({attentionList.length})
              </h2>
              <p className="text-xs text-slate-500">
                Các học viên đã quá hạn hoặc sắp hết hạn trong 7 ngày tới
              </p>
            </div>
          </div>
        </div>

        {attentionList.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            🎉 Tuyệt vời! Hiện không có học viên nào bị quá hạn học phí.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Học Viên</th>
                  <th className="py-3 px-4">Chi Nhánh</th>
                  <th className="py-3 px-4">Bộ Môn & Lớp</th>
                  <th className="py-3 px-4">Tình Trạng Học Phí</th>
                  <th className="py-3 px-4">Liên Hệ</th>
                  <th className="py-3 px-4 text-right">Thao Tác Nhanh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {attentionList.map((student) => {
                  const badge = getStudentStatusBadge(
                    student.feeStatus,
                    student.feeDueDate,
                    student.remainingSessions
                  );
                  const discipline = disciplines.find((d) => d.id === student.disciplineId);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onViewStudent(student)}
                          className="flex items-center gap-2.5 text-left group cursor-pointer"
                        >
                          <div
                            className={`w-7 h-7 rounded-full ${student.avatarColor} text-white font-bold flex items-center justify-center text-xs shrink-0`}
                          >
                            {student.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                              {student.fullName}
                            </p>
                            <p className="font-mono text-[11px] text-slate-500">{student.code}</p>
                          </div>
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700">
                          {student.branchId === 'cn1' ? 'Chi Nhánh 1' : 'Chi Nhánh 2'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800">{discipline?.name || 'Võ Thuật'}</p>
                        <p className="text-[11px] text-slate-500">
                          Hạn cũ: {formatDate(student.feeDueDate)}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] ${badge.bg} ${badge.textCol} ${badge.borderCol}`}
                        >
                          {badge.text}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-700">
                        {student.phone}
                        {student.parentPhone && (
                          <span className="block text-[10px] text-slate-500">PH: {student.parentPhone}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSendReminder(student)}
                            title="Gửi tin nhắn Zalo / SMS nhắc học phí"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-blue-600 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onPayTuition(student)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Thu Phí
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Xu Hướng Doanh Thu Thu Học Phí (6 Tháng)</h3>
              <p className="text-xs text-slate-500">So sánh doanh thu giữa Cơ Sở 1 & Cơ Sở 2</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-amber-600 font-bold">
                <span className="w-3 h-3 bg-amber-500 rounded-xs inline-block"></span> CN1
              </span>
              <span className="flex items-center gap-1 text-blue-600 font-bold">
                <span className="w-3 h-3 bg-blue-500 rounded-xs inline-block"></span> CN2
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#94a3b8"
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value: any) => [formatVND(Number(value)), '']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="cn1" name="Chi Nhánh 1" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cn2" name="Chi Nhánh 2" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Discipline Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Cơ Cấu Bộ Môn Võ Thuật</h3>
            <p className="text-xs text-slate-500">Tỷ lệ phân bổ học viên theo môn tập</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={disciplineData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={35}
                  paddingAngle={3}
                >
                  {disciplineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {disciplineData.slice(0, 4).map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  ></span>
                  {d.name}
                </span>
                <span className="font-bold font-mono text-slate-900">{d.count} HV</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Receipts List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-base">Giao Dịch Thu Học Phí Gần Nhất</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReceipts.slice(0, 6).map((receipt) => (
            <div
              key={receipt.id}
              className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-amber-600">{receipt.receiptCode}</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{receipt.studentName}</p>
                </div>
                <button
                  onClick={() => onPrintReceipt(receipt)}
                  title="In phiếu thu"
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-500">
                <p>{receipt.packageName}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {formatDateTime(receipt.paymentDate)} ({receipt.branchId === 'cn1' ? 'CN1' : 'CN2'})
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] px-2 py-0.5 rounded bg-white text-slate-700 font-medium border border-slate-200">
                  {receipt.paymentMethod === 'transfer' ? 'VietQR' : receipt.paymentMethod === 'cash' ? 'Tiền mặt' : 'POS'}
                </span>
                <span className="font-mono font-black text-amber-600 text-sm">
                  {formatVND(receipt.finalAmount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
