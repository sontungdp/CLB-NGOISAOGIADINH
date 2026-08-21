import React, { useState, useMemo } from 'react';
import {
  Student,
  Branch,
  Discipline,
  FeePackage,
  ClassSession,
  BranchFilter,
  StudentFeeStatus,
} from '../types';
import {
  formatVND,
  formatDate,
  getStudentStatusBadge,
  getDaysDiffFromToday,
  exportToCsv,
} from '../utils/formatters';
import {
  Search,
  Filter,
  Download,
  Plus,
  CreditCard,
  MessageSquare,
  Eye,
  Edit2,
  Trash2,
  Phone,
  UserCheck,
  AlertCircle,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface StudentManagementProps {
  students: Student[];
  branches: Branch[];
  disciplines: Discipline[];
  packages: FeePackage[];
  classes: ClassSession[];
  branchFilter: BranchFilter;
  onSelectBranchFilter: (filter: BranchFilter) => void;
  onViewStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onPayTuition: (student: Student) => void;
  onSendReminder: (student: Student) => void;
  onOpenAddStudent: () => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  branches,
  disciplines,
  packages,
  classes,
  branchFilter,
  onSelectBranchFilter,
  onViewStudent,
  onEditStudent,
  onDeleteStudent,
  onPayTuition,
  onSendReminder,
  onOpenAddStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [disciplineFilter, setDisciplineFilter] = useState<string>('all');

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Branch filter
      if (branchFilter !== 'all' && student.branchId !== branchFilter) return false;

      // Discipline filter
      if (disciplineFilter !== 'all' && student.disciplineId !== disciplineFilter) return false;

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'overdue') {
          const diff = student.feeDueDate ? getDaysDiffFromToday(student.feeDueDate) : 0;
          if (student.feeStatus !== 'overdue' && diff >= 0 && (!student.remainingSessions || student.remainingSessions > 0)) {
            return false;
          }
        } else if (statusFilter === 'expiring_soon') {
          const diff = student.feeDueDate ? getDaysDiffFromToday(student.feeDueDate) : 99;
          const isLowSessions = student.remainingSessions !== undefined && student.remainingSessions <= 3 && student.remainingSessions > 0;
          if (student.feeStatus !== 'expiring_soon' && (diff < 0 || diff > 7) && !isLowSessions) {
            return false;
          }
        } else if (statusFilter === 'paid') {
          if (student.feeStatus !== 'paid') return false;
        } else if (statusFilter === 'reserved') {
          if (student.feeStatus !== 'reserved') return false;
        }
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = student.fullName.toLowerCase().includes(query);
        const matchCode = student.code.toLowerCase().includes(query);
        const matchPhone = student.phone.toLowerCase().includes(query);
        const matchParent = student.parentName?.toLowerCase().includes(query) || false;
        if (!matchName && !matchCode && !matchPhone && !matchParent) return false;
      }

      return true;
    });
  }, [students, branchFilter, disciplineFilter, statusFilter, searchTerm]);

  // Export to CSV
  const handleExport = () => {
    const headers = [
      'Mã HV',
      'Họ và Tên',
      'Chi Nhánh',
      'Số Điện Thoại',
      'Bộ Môn',
      'Gói Học',
      'Trạng Thái',
      'Hạn Học Phí',
      'Buổi Còn Lại',
      'Ngày Gia Nhập',
      'Phụ Huynh',
      'Ghi Chú',
    ];

    const rows = filteredStudents.map((s) => {
      const branchName = s.branchId === 'cn1' ? 'Chi Nhánh 1 (Phan Đăng Lưu)' : 'Chi Nhánh 2 (Nguyễn Văn Đậu)';
      const disc = disciplines.find((d) => d.id === s.disciplineId)?.name || s.disciplineId;
      const pkg = packages.find((p) => p.id === s.packageId)?.name || '---';

      return [
        s.code,
        s.fullName,
        branchName,
        s.phone,
        disc,
        pkg,
        s.feeStatus,
        s.feeDueDate || '---',
        s.remainingSessions ?? 'Theo tháng',
        s.joinDate,
        s.parentName ? `${s.parentName} (${s.parentPhone || ''})` : '---',
        s.notes || '',
      ];
    });

    const filename = `Danh_Sach_Hoc_Vien_NgoiSaoGiaDinh_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCsv(filename, headers, rows);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">Quản Lý Danh Sách Học Viên</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                {filteredStudents.length} học viên
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý thông tin, tình trạng học phí và gia hạn khóa học cho cả 2 cơ sở.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Xuất Excel / CSV
            </button>
            <button
              onClick={onOpenAddStudent}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Đăng Ký Học Viên Mới
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, SĐT, mã HV..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-red-600 focus:bg-white outline-none transition-all"
            />
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={branchFilter}
              onChange={(e) => onSelectBranchFilter(e.target.value as BranchFilter)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-red-600 focus:bg-white outline-none cursor-pointer"
            >
              <option value="all">🏢 Tất cả 2 Chi Nhánh</option>
              <option value="cn1">📍 Chi Nhánh 1 (Phan Đăng Lưu)</option>
              <option value="cn2">📍 Chi Nhánh 2 (Nguyễn Văn Đậu)</option>
            </select>
          </div>

          {/* Discipline Filter */}
          <div>
            <select
              value={disciplineFilter}
              onChange={(e) => setDisciplineFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-red-600 focus:bg-white outline-none cursor-pointer"
            >
              <option value="all">🥋 Tất cả Bộ Môn Võ Thuật</option>
              {disciplines.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-red-600 focus:bg-white outline-none cursor-pointer"
            >
              <option value="all">🏷️ Tất cả Trạng Thái</option>
              <option value="paid">✅ Đã đóng học phí</option>
              <option value="expiring_soon">⏳ Sắp hết hạn (&le; 7 ngày)</option>
              <option value="overdue">🚨 Quá hạn đóng phí</option>
              <option value="reserved">⏸️ Đang bảo lưu</option>
            </select>
          </div>
        </div>

      </div>

      {/* Students Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Không tìm thấy học viên nào phù hợp bộ lọc.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDisciplineFilter('all');
                onSelectBranchFilter('all');
              }}
              className="text-xs text-red-700 font-semibold underline cursor-pointer"
            >
              Đặt lại toàn bộ bộ lọc
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Học Viên</th>
                  <th className="py-3.5 px-4">Cơ Sở</th>
                  <th className="py-3.5 px-4">Bộ Môn & Gói</th>
                  <th className="py-3.5 px-4">Hạn Học Phí / Số Buổi</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4">Liên Hệ</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStudents.map((student) => {
                  const badge = getStudentStatusBadge(
                    student.feeStatus,
                    student.feeDueDate,
                    student.remainingSessions
                  );
                  const discipline = disciplines.find((d) => d.id === student.disciplineId);
                  const feePkg = packages.find((p) => p.id === student.packageId);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                      
                      {/* Name & Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl ${student.avatarColor} text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0`}
                          >
                            {student.fullName.charAt(0)}
                          </div>
                          <div>
                            <button
                              onClick={() => onViewStudent(student)}
                              className="font-bold text-slate-900 hover:text-red-700 text-sm transition-colors text-left cursor-pointer"
                            >
                              {student.fullName}
                            </button>
                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                              <span>{student.code}</span>
                              <span>•</span>
                              <span>{student.gender}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Branch */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                            student.branchId === 'cn1'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          <MapPin className="w-3 h-3" />
                          {student.branchId === 'cn1' ? 'Cơ Sở 1 (PĐL)' : 'Cơ Sở 2 (NVĐ)'}
                        </span>
                      </td>

                      {/* Discipline & Package */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{discipline?.name || 'Võ Thuật'}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{feePkg?.name || '---'}</p>
                      </td>

                      {/* Due Date or Sessions */}
                      <td className="py-3.5 px-4">
                        {student.remainingSessions !== undefined ? (
                          <div>
                            <span className="font-bold text-emerald-700 font-mono text-xs">
                              Còn {student.remainingSessions} / {student.totalSessions || 20} buổi
                            </span>
                            <p className="text-[11px] text-slate-500">Hạn: {formatDate(student.feeDueDate)}</p>
                          </div>
                        ) : (
                          <div>
                            <span className="font-semibold text-slate-800">
                              {formatDate(student.feeDueDate)}
                            </span>
                            {student.feePaidDate && (
                              <p className="text-[11px] text-slate-500">Đã đóng: {formatDate(student.feePaidDate)}</p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-semibold ${badge.bg} ${badge.textCol} ${badge.borderCol}`}
                        >
                          {badge.text}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 font-mono text-slate-800">
                        <div className="flex items-center gap-1 text-slate-700">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {student.phone}
                        </div>
                        {student.parentName && (
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            PH: {student.parentName}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onPayTuition(student)}
                            title="Thu học phí / Gia hạn"
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onSendReminder(student)}
                            title="Nhắc phí qua Zalo/SMS"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-blue-600 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onViewStudent(student)}
                            title="Xem chi tiết hồ sơ"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditStudent(student)}
                            title="Chỉnh sửa thông tin"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteStudent(student.id)}
                            title="Xóa học viên"
                            className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

    </div>
  );
};
