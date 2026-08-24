import React, { useState } from 'react';
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
  Search,
  X,
  ArrowUpRight,
  Eye,
  CheckCircle2,
  Phone,
  FileText,
  Filter,
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
} from 'recharts';

type DetailModalType = 'revenue' | 'active_students' | 'overdue_students' | 'expiring_soon_students' | null;

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
  // Detail Modal State
  const [detailModal, setDetailModal] = useState<DetailModalType>(null);
  const [modalSearch, setModalSearch] = useState('');
  const [modalBranch, setModalBranch] = useState<'all' | 'cn1' | 'cn2'>('all');
  const [modalDiscipline, setModalDiscipline] = useState('all');
  const [modalPaymentMethod, setModalPaymentMethod] = useState('all');

  const openDetailModal = (type: DetailModalType) => {
    setDetailModal(type);
    setModalSearch('');
    setModalBranch(branchFilter);
    setModalDiscipline('all');
    setModalPaymentMethod('all');
  };

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
                  ? 'Cơ Sở 1 (2A Phan Chu Trinh, Phường Bình Thạnh, TPHCM)'
                  : 'Cơ Sở 2 (25A Nơ Trang Long, Phường Gia Định, TPHCM)'}
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
              Cơ Sở 1 (Phan Chu Trinh)
            </button>
            <button
              onClick={() => onSelectBranchFilter('cn2')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                branchFilter === 'cn2'
                  ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Cơ Sở 2 (Nơ Trang Long)
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid - Clickable to open drilldown details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Doanh thu */}
        <div
          onClick={() => openDetailModal('revenue')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && openDetailModal('revenue')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-amber-500 hover:ring-2 hover:ring-amber-500/20 hover:shadow-md transition-all cursor-pointer select-none text-left"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Tổng Thu Học Phí
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 font-bold group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 font-mono tracking-tight group-hover:text-amber-700 transition-colors">
              {formatVND(totalRevenue)}
            </p>
            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-100">
              <p className="text-xs text-emerald-600 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                {filteredReceipts.length} phiếu thu đã lập
              </p>
              <span className="text-[11px] font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Xem chi tiết &rarr;
              </span>
            </div>
          </div>
        </div>

        {/* 2. Học viên đang tập */}
        <div
          onClick={() => openDetailModal('active_students')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && openDetailModal('active_students')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-blue-500 hover:ring-2 hover:ring-blue-500/20 hover:shadow-md transition-all cursor-pointer select-none text-left"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Học Viên Đang Tập
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 font-bold group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 font-mono group-hover:text-blue-700 transition-colors">
              {activeStudents.length} <span className="text-sm font-normal text-slate-500">học viên</span>
            </p>
            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Tổng {filteredStudents.length} hồ sơ (gồm bảo lưu)
              </p>
              <span className="text-[11px] font-bold text-blue-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Xem danh sách &rarr;
              </span>
            </div>
          </div>
        </div>

        {/* 3. Quá hạn đóng phí */}
        <div
          onClick={() => openDetailModal('overdue_students')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && openDetailModal('overdue_students')}
          className="bg-white border border-red-200 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-red-500 hover:ring-2 hover:ring-red-500/20 hover:shadow-md transition-all cursor-pointer select-none text-left"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
              Quá Hạn Đóng Phí
            </span>
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 animate-pulse group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-red-600 font-mono">
              {overdueStudents.length} <span className="text-sm font-normal text-red-500">học viên</span>
            </p>
            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-red-100">
              <p className="text-xs text-red-600/90 font-medium">
                Cần thu nợ học phí ngay
              </p>
              <span className="text-[11px] font-bold text-red-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Xem chi tiết &rarr;
              </span>
            </div>
          </div>
        </div>

        {/* 4. Sắp hết hạn */}
        <div
          onClick={() => openDetailModal('expiring_soon_students')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && openDetailModal('expiring_soon_students')}
          className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-amber-500 hover:ring-2 hover:ring-amber-500/20 hover:shadow-md transition-all cursor-pointer select-none text-left"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Sắp Đến Hạn (&le; 7 ngày)
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-amber-700 font-mono">
              {expiringSoonStudents.length} <span className="text-sm font-normal text-amber-600">học viên</span>
            </p>
            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-amber-100">
              <p className="text-xs text-amber-700 font-medium">
                Nhắc gia hạn Zalo / SMS
              </p>
              <span className="text-[11px] font-bold text-amber-800 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Xem chi tiết &rarr;
              </span>
            </div>
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
                <h3 className="font-bold text-slate-900 text-base mt-1">2A Phan Chu Trinh, Phường Bình Thạnh, TPHCM</h3>
                <p className="text-xs text-slate-500 mt-0.5">HLV Trưởng: Nguyễn Hoàng Long (096 677 90 99)</p>
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
                <h3 className="font-bold text-slate-900 text-base mt-1">25A Nơ Trang Long, Phường Gia Định, TPHCM</h3>
                <p className="text-xs text-slate-500 mt-0.5">HLV Trưởng: Trần Minh Trí (096 677 90 99)</p>
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
                  {receipt.paymentMethod === 'transfer' ? 'VietQR' : 'Tiền mặt'}
                </span>
                <span className="font-mono font-black text-amber-600 text-sm">
                  {formatVND(receipt.finalAmount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DETAIL MODAL FOR KPI DRILLDOWN */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-white border border-slate-200 text-slate-900 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div
              className={`px-6 py-5 text-white border-b flex items-center justify-between shrink-0 ${
                detailModal === 'revenue'
                  ? 'bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 border-amber-900'
                  : detailModal === 'active_students'
                  ? 'bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 border-blue-900'
                  : detailModal === 'overdue_students'
                  ? 'bg-gradient-to-r from-red-700 via-red-800 to-slate-900 border-red-900'
                  : 'bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 border-amber-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-white shadow-inner">
                  {detailModal === 'revenue' && <DollarSign className="w-6 h-6 text-amber-300" />}
                  {detailModal === 'active_students' && <Users className="w-6 h-6 text-blue-200" />}
                  {detailModal === 'overdue_students' && <AlertTriangle className="w-6 h-6 text-red-200" />}
                  {detailModal === 'expiring_soon_students' && <Clock className="w-6 h-6 text-amber-200" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base sm:text-lg">
                    {detailModal === 'revenue' && 'Chi Tiết Doanh Thu & Lịch Sử Phiếu Thu'}
                    {detailModal === 'active_students' && 'Danh Sách Học Viên Đang Tập Luyện'}
                    {detailModal === 'overdue_students' && 'Danh Sách Học Viên Quá Hạn Đóng Học Phí'}
                    {detailModal === 'expiring_soon_students' && 'Danh Sách Học Viên Sắp Đến Hạn (≤ 7 Ngày)'}
                  </h3>
                  <p className="text-xs text-slate-200">
                    {detailModal === 'revenue' && 'Tra cứu đầy đủ các giao dịch thu tiền, phương thức thanh toán và in lại phiếu thu'}
                    {detailModal === 'active_students' && 'Theo dõi toàn bộ võ sinh đang duy trì gói tập tại 2 cơ sở'}
                    {detailModal === 'overdue_students' && 'Danh sách cần ưu tiên liên hệ nhắc nợ và thu học phí gia hạn ngay'}
                    {detailModal === 'expiring_soon_students' && 'Chủ động gửi tin nhắn Zalo/SMS nhắc gia hạn trước ngày hết hạn'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailModal(null)}
                className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                title="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                
                {/* Search Input */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    placeholder={
                      detailModal === 'revenue'
                        ? 'Tìm theo mã phiếu, tên học viên, gói học...'
                        : 'Tìm theo tên học viên, mã võ sinh, số điện thoại...'
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl py-2 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-xs font-medium"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  {modalSearch && (
                    <button
                      onClick={() => setModalSearch('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Branch filter */}
                  <select
                    value={modalBranch}
                    onChange={(e) => setModalBranch(e.target.value as any)}
                    className="bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-amber-500 shadow-xs cursor-pointer"
                  >
                    <option value="all">🏢 Cả 2 Cơ Sở</option>
                    <option value="cn1">📍 Cơ Sở 1 (Phan Chu Trinh)</option>
                    <option value="cn2">📍 Cơ Sở 2 (Nơ Trang Long)</option>
                  </select>

                  {/* Additional filter depending on modal type */}
                  {detailModal === 'revenue' ? (
                    <select
                      value={modalPaymentMethod}
                      onChange={(e) => setModalPaymentMethod(e.target.value)}
                      className="bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-amber-500 shadow-xs cursor-pointer"
                    >
                      <option value="all">💳 Mọi Hình Thức</option>
                      <option value="transfer">📱 Chuyển Khoản (VietQR)</option>
                      <option value="cash">💵 Tiền Mặt</option>
                    </select>
                  ) : (
                    <select
                      value={modalDiscipline}
                      onChange={(e) => setModalDiscipline(e.target.value)}
                      className="bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-amber-500 shadow-xs cursor-pointer"
                    >
                      <option value="all">🥊 Tất Cả Bộ Môn</option>
                      {disciplines.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name.split(' (')[0]}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

              </div>

              {/* Dynamic KPI summary banner inside modal */}
              {detailModal === 'revenue' && (() => {
                const filtered = receipts.filter((r) => {
                  if (modalBranch !== 'all' && r.branchId !== modalBranch) return false;
                  if (modalPaymentMethod !== 'all' && r.paymentMethod !== modalPaymentMethod) return false;
                  if (modalSearch) {
                    const q = modalSearch.toLowerCase();
                    return (
                      r.receiptCode.toLowerCase().includes(q) ||
                      r.studentName.toLowerCase().includes(q) ||
                      r.packageName.toLowerCase().includes(q)
                    );
                  }
                  return true;
                });

                const sum = filtered.reduce((s, r) => s + r.finalAmount, 0);
                const qrSum = filtered.filter((r) => r.paymentMethod === 'transfer').reduce((s, r) => s + r.finalAmount, 0);
                const cashSum = filtered.filter((r) => r.paymentMethod === 'cash').reduce((s, r) => s + r.finalAmount, 0);

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center">
                      <span className="text-[10px] font-bold text-amber-800 uppercase">Tổng Thu Đang Lọc</span>
                      <p className="text-base font-black text-amber-700 font-mono">{formatVND(sum)}</p>
                      <span className="text-[10px] text-amber-600 font-medium">{filtered.length} phiếu</span>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                      <span className="text-[10px] font-bold text-blue-700 uppercase">VietQR Chuyển Khoản</span>
                      <p className="text-sm font-black text-blue-800 font-mono">{formatVND(qrSum)}</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">Tiền Mặt Tại Quầy</span>
                      <p className="text-sm font-black text-emerald-800 font-mono">{formatVND(cashSum)}</p>
                    </div>
                  </div>
                );
              })()}

              {detailModal === 'overdue_students' && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-900">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span><strong>Ưu tiên thu phí:</strong> Bạn có thể bấm nút <strong>"Thu Phí"</strong> để tạo nhanh mã VietQR hoặc bấm biểu tượng tin nhắn để gửi Zalo nhắc nợ.</span>
                  </div>
                </div>
              )}

              {detailModal === 'expiring_soon_students' && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span><strong>Chăm sóc học viên:</strong> Nhắc phí trước từ 3-7 ngày giúp tỷ lệ tái tục học phí đạt trên 95%.</span>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Body Table Content */}
            <div className="p-4 overflow-y-auto flex-1">
              
              {/* CASE 1: REVENUE DETAILS */}
              {detailModal === 'revenue' && (() => {
                const filtered = receipts.filter((r) => {
                  if (modalBranch !== 'all' && r.branchId !== modalBranch) return false;
                  if (modalPaymentMethod !== 'all' && r.paymentMethod !== modalPaymentMethod) return false;
                  if (modalSearch) {
                    const q = modalSearch.toLowerCase();
                    return (
                      r.receiptCode.toLowerCase().includes(q) ||
                      r.studentName.toLowerCase().includes(q) ||
                      r.packageName.toLowerCase().includes(q)
                    );
                  }
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-500 space-y-2">
                      <FileText className="w-10 h-10 mx-auto text-slate-300" />
                      <p className="text-sm font-semibold">Không tìm thấy phiếu thu nào phù hợp với bộ lọc.</p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3 px-3">Thời Gian</th>
                          <th className="py-3 px-3">Mã Phiếu</th>
                          <th className="py-3 px-3">Học Viên</th>
                          <th className="py-3 px-3">Gói Học Phí</th>
                          <th className="py-3 px-3">Cơ Sở</th>
                          <th className="py-3 px-3">Phương Thức</th>
                          <th className="py-3 px-3 text-right">Số Tiền (VND)</th>
                          <th className="py-3 px-3 text-center">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filtered.map((r) => {
                          const linkedStudent = students.find((s) => s.id === r.studentId);
                          return (
                            <tr key={r.id} className="hover:bg-amber-50/40 transition-colors">
                              <td className="py-3 px-3 text-slate-500 whitespace-nowrap font-mono">
                                {formatDateTime(r.paymentDate)}
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  {r.receiptCode}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                {linkedStudent ? (
                                  <button
                                    onClick={() => {
                                      setDetailModal(null);
                                      onViewStudent(linkedStudent);
                                    }}
                                    className="font-bold text-slate-900 hover:text-red-700 text-left cursor-pointer flex items-center gap-1.5"
                                  >
                                    <div className={`w-5 h-5 rounded-full ${linkedStudent.avatarColor} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}>
                                      {linkedStudent.fullName.charAt(0)}
                                    </div>
                                    <span>{r.studentName}</span>
                                  </button>
                                ) : (
                                  <span className="font-bold text-slate-900">{r.studentName}</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-slate-700">
                                <p className="font-medium">{r.packageName}</p>
                                {r.discount > 0 && (
                                  <span className="text-[10px] text-emerald-600 font-semibold">
                                    - {formatVND(r.discount)} (KM)
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span className="font-semibold text-slate-700">
                                  {r.branchId === 'cn1' ? 'Cơ Sở 1' : 'Cơ Sở 2'}
                                </span>
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                                    r.paymentMethod === 'transfer'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}
                                >
                                  {r.paymentMethod === 'transfer' ? 'VietQR' : 'Tiền mặt'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-black text-amber-700 text-sm whitespace-nowrap">
                                {formatVND(r.finalAmount)}
                              </td>
                              <td className="py-3 px-3 text-center whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    onPrintReceipt(r);
                                  }}
                                  title="In hoặc lưu phiếu thu này"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer text-[11px]"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span>In Phiếu</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}

              {/* CASE 2: ACTIVE STUDENTS */}
              {detailModal === 'active_students' && (() => {
                const list = students.filter((s) => {
                  if (s.feeStatus === 'reserved') return false;
                  if (modalBranch !== 'all' && s.branchId !== modalBranch) return false;
                  if (modalDiscipline !== 'all' && s.disciplineId !== modalDiscipline) return false;
                  if (modalSearch) {
                    const q = modalSearch.toLowerCase();
                    return (
                      s.fullName.toLowerCase().includes(q) ||
                      s.code.toLowerCase().includes(q) ||
                      s.phone.includes(q) ||
                      (s.parentPhone && s.parentPhone.includes(q))
                    );
                  }
                  return true;
                });

                if (list.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-500 space-y-2">
                      <Users className="w-10 h-10 mx-auto text-slate-300" />
                      <p className="text-sm font-semibold">Không tìm thấy học viên nào phù hợp.</p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3 px-3">Học Viên</th>
                          <th className="py-3 px-3">Cơ Sở</th>
                          <th className="py-3 px-3">Bộ Môn</th>
                          <th className="py-3 px-3">Hạn Phí / Số Buổi</th>
                          <th className="py-3 px-3">Tình Trạng</th>
                          <th className="py-3 px-3">Số Điện Thoại</th>
                          <th className="py-3 px-3 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {list.map((student) => {
                          const badge = getStudentStatusBadge(
                            student.feeStatus,
                            student.feeDueDate,
                            student.remainingSessions
                          );
                          const discipline = disciplines.find((d) => d.id === student.disciplineId);

                          return (
                            <tr key={student.id} className="hover:bg-blue-50/30 transition-colors">
                              <td className="py-3 px-3">
                                <button
                                  onClick={() => {
                                    setDetailModal(null);
                                    onViewStudent(student);
                                  }}
                                  className="flex items-center gap-2.5 text-left group cursor-pointer"
                                >
                                  <div className={`w-7 h-7 rounded-full ${student.avatarColor} text-white font-bold flex items-center justify-center text-xs shrink-0`}>
                                    {student.fullName.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                                      {student.fullName}
                                    </p>
                                    <p className="font-mono text-[10px] text-slate-500">{student.code}</p>
                                  </div>
                                </button>
                              </td>
                              <td className="py-3 px-3 font-semibold text-slate-700 whitespace-nowrap">
                                {student.branchId === 'cn1' ? 'Cơ Sở 1' : 'Cơ Sở 2'}
                              </td>
                              <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                                {discipline?.name.split(' (')[0] || 'Võ Thuật'}
                              </td>
                              <td className="py-3 px-3 text-slate-700">
                                {student.feeDueDate ? (
                                  <div>
                                    <p className="font-bold">{formatDate(student.feeDueDate)}</p>
                                    <p className="text-[10px] text-slate-500">Bắt đầu: {formatDate(student.joinDate)}</p>
                                  </div>
                                ) : (
                                  <span className="font-bold font-mono text-amber-700">{student.remainingSessions || 0} buổi</span>
                                )}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold ${badge.bg} ${badge.textCol} ${badge.borderCol}`}>
                                  {badge.text}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                                {student.phone}
                              </td>
                              <td className="py-3 px-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setDetailModal(null);
                                      onViewStudent(student);
                                    }}
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                                    title="Xem hồ sơ chi tiết"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDetailModal(null);
                                      onSendReminder(student);
                                    }}
                                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors cursor-pointer"
                                    title="Nhắc học phí"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDetailModal(null);
                                      onPayTuition(student);
                                    }}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer text-[11px] shadow-xs"
                                  >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span>Thu Phí</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}

              {/* CASE 3: OVERDUE STUDENTS */}
              {detailModal === 'overdue_students' && (() => {
                const list = overdueStudents.filter((s) => {
                  if (modalBranch !== 'all' && s.branchId !== modalBranch) return false;
                  if (modalDiscipline !== 'all' && s.disciplineId !== modalDiscipline) return false;
                  if (modalSearch) {
                    const q = modalSearch.toLowerCase();
                    return (
                      s.fullName.toLowerCase().includes(q) ||
                      s.code.toLowerCase().includes(q) ||
                      s.phone.includes(q) ||
                      (s.parentPhone && s.parentPhone.includes(q))
                    );
                  }
                  return true;
                });

                if (list.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-500 space-y-2">
                      <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
                      <p className="text-sm font-bold text-slate-800">Không có học viên nào bị quá hạn học phí.</p>
                      <p className="text-xs text-slate-400">Tất cả võ sinh đều đã hoàn tất học phí đúng hạn!</p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-red-50 text-red-950 font-bold border-b border-red-200 uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3 px-3">Võ Sinh Quá Hạn</th>
                          <th className="py-3 px-3">Cơ Sở</th>
                          <th className="py-3 px-3">Bộ Môn</th>
                          <th className="py-3 px-3">Mức Độ Quá Hạn</th>
                          <th className="py-3 px-3">Hạn Cũ</th>
                          <th className="py-3 px-3">Số Điện Thoại</th>
                          <th className="py-3 px-3 text-right">Hành Động Khẩn</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-100/60 bg-white">
                        {list.map((student) => {
                          const diff = student.feeDueDate ? getDaysDiffFromToday(student.feeDueDate) : null;
                          const discipline = disciplines.find((d) => d.id === student.disciplineId);

                          return (
                            <tr key={student.id} className="hover:bg-red-50/50 transition-colors">
                              <td className="py-3 px-3">
                                <button
                                  onClick={() => {
                                    setDetailModal(null);
                                    onViewStudent(student);
                                  }}
                                  className="flex items-center gap-2.5 text-left group cursor-pointer"
                                >
                                  <div className="w-7 h-7 rounded-full bg-red-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
                                    {student.fullName.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                                      {student.fullName}
                                    </p>
                                    <p className="font-mono text-[10px] text-slate-500">{student.code}</p>
                                  </div>
                                </button>
                              </td>
                              <td className="py-3 px-3 font-semibold text-slate-700 whitespace-nowrap">
                                {student.branchId === 'cn1' ? 'Cơ Sở 1' : 'Cơ Sở 2'}
                              </td>
                              <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                                {discipline?.name.split(' (')[0] || 'Võ Thuật'}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 font-black text-[10px]">
                                  {diff !== null && diff < 0
                                    ? `Trễ ${Math.abs(diff)} ngày`
                                    : student.remainingSessions !== undefined && student.remainingSessions <= 0
                                    ? 'Đã hết buổi tập'
                                    : 'Chưa đóng học phí'}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                                {formatDate(student.feeDueDate)}
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-800">
                                <p className="font-bold">{student.phone}</p>
                                {student.parentPhone && (
                                  <p className="text-[10px] text-slate-500 font-normal">PH: {student.parentPhone}</p>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setDetailModal(null);
                                      onSendReminder(student);
                                    }}
                                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-[11px] flex items-center gap-1 shadow-xs"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    <span>Nhắc Nợ</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDetailModal(null);
                                      onPayTuition(student);
                                    }}
                                    className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg transition-colors cursor-pointer text-[11px] flex items-center gap-1 shadow-xs"
                                  >
                                    <CreditCard className="w-3 h-3" />
                                    <span>Thu Ngay</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}

              {/* CASE 4: EXPIRING SOON STUDENTS */}
              {detailModal === 'expiring_soon_students' && (() => {
                const list = expiringSoonStudents.filter((s) => {
                  if (modalBranch !== 'all' && s.branchId !== modalBranch) return false;
                  if (modalDiscipline !== 'all' && s.disciplineId !== modalDiscipline) return false;
                  if (modalSearch) {
                    const q = modalSearch.toLowerCase();
                    return (
                      s.fullName.toLowerCase().includes(q) ||
                      s.code.toLowerCase().includes(q) ||
                      s.phone.includes(q) ||
                      (s.parentPhone && s.parentPhone.includes(q))
                    );
                  }
                  return true;
                });

                if (list.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-500 space-y-2">
                      <CheckCircle2 className="w-10 h-10 mx-auto text-amber-500" />
                      <p className="text-sm font-bold text-slate-800">Không có học viên nào sắp hết hạn trong 7 ngày tới.</p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-amber-50 text-amber-950 font-bold border-b border-amber-200 uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3 px-3">Học Viên</th>
                          <th className="py-3 px-3">Cơ Sở</th>
                          <th className="py-3 px-3">Bộ Môn</th>
                          <th className="py-3 px-3">Thời Hạn Còn Lại</th>
                          <th className="py-3 px-3">Ngày Đến Hạn</th>
                          <th className="py-3 px-3">Liên Hệ</th>
                          <th className="py-3 px-3 text-right">Nhắc / Gia Hạn</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-100/60 bg-white">
                        {list.map((student) => {
                          const diff = student.feeDueDate ? getDaysDiffFromToday(student.feeDueDate) : null;
                          const discipline = disciplines.find((d) => d.id === student.disciplineId);

                          return (
                            <tr key={student.id} className="hover:bg-amber-50/50 transition-colors">
                              <td className="py-3 px-3">
                                <button
                                  onClick={() => {
                                    setDetailModal(null);
                                    onViewStudent(student);
                                  }}
                                  className="flex items-center gap-2.5 text-left group cursor-pointer"
                                >
                                  <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                                    {student.fullName.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                                      {student.fullName}
                                    </p>
                                    <p className="font-mono text-[10px] text-slate-500">{student.code}</p>
                                  </div>
                                </button>
                              </td>
                              <td className="py-3 px-3 font-semibold text-slate-700 whitespace-nowrap">
                                {student.branchId === 'cn1' ? 'Cơ Sở 1' : 'Cơ Sở 2'}
                              </td>
                              <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                                {discipline?.name.split(' (')[0] || 'Võ Thuật'}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px]">
                                  {diff !== null && diff >= 0
                                    ? diff === 0
                                    ? 'Hôm nay hết hạn'
                                    : `Còn ${diff} ngày nữa`
                                    : student.remainingSessions !== undefined
                                    ? `Còn ${student.remainingSessions} buổi`
                                    : 'Sắp đến hạn'}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-amber-800 whitespace-nowrap">
                                {formatDate(student.feeDueDate)}
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-800">
                                <p className="font-bold">{student.phone}</p>
                                {student.parentPhone && (
                                  <p className="text-[10px] text-slate-500 font-normal">PH: {student.parentPhone}</p>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setDetailModal(null);
                                      onSendReminder(student);
                                    }}
                                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition-colors cursor-pointer text-[11px] flex items-center gap-1"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    <span>Nhắc Zalo</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDetailModal(null);
                                      onPayTuition(student);
                                    }}
                                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer text-[11px] flex items-center gap-1 shadow-xs"
                                  >
                                    <CreditCard className="w-3 h-3" />
                                    <span>Gia Hạn</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
              <span className="text-slate-500">
                CLB Ngôi Sao Gia Định &bull; Hệ thống quản lý học phí & học viên
              </span>
              <button
                type="button"
                onClick={() => setDetailModal(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
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
