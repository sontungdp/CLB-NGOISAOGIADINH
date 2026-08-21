import React, { useState } from 'react';
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
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedBranchId, setSelectedBranchId] = useState<'cn1' | 'cn2'>(
    branchFilter === 'cn2' ? 'cn2' : 'cn1'
  );

  // Available classes for selected branch
  const branchClasses = classes.filter((c) => c.branchId === selectedBranchId);
  const [selectedClassId, setSelectedClassId] = useState<string>(branchClasses[0]?.id || '');

  const activeClass = classes.find((c) => c.id === selectedClassId) || branchClasses[0];

  // Students belonging to this branch (or assigned to this class)
  const branchStudents = students.filter((s) => {
    if (s.branchId !== selectedBranchId) return false;
    if (s.feeStatus === 'reserved') return false;
    if (selectedClassId && s.classId) {
      return s.classId === selectedClassId;
    }
    return true;
  });

  // Check which students are checked in on this date for this class
  const dateAttendance = attendance.filter(
    (a) => a.date === selectedDate && a.branchId === selectedBranchId
  );

  const isCheckedIn = (studentId: string) => {
    return dateAttendance.some((a) => a.studentId === studentId);
  };

  const getAttendanceRecord = (studentId: string) => {
    return dateAttendance.find((a) => a.studentId === studentId);
  };

  const presentCount = branchStudents.filter((s) => isCheckedIn(s.id)).length;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-700">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">Điểm Danh & Trừ Buổi Tập</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Theo dõi chuyên cần theo ngày, tự động trừ số buổi cho các thẻ học viên gói lượt.
            </p>
          </div>

          {/* Sĩ số Badge */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs">
            <div className="text-right">
              <span className="text-slate-500">Có mặt hôm nay:</span>
              <p className="text-base font-bold text-emerald-700 font-mono">
                {presentCount} / {branchStudents.length} HV
              </p>
            </div>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Branch Switch */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              1. Chọn Chi Nhánh
            </label>
            <select
              value={selectedBranchId}
              onChange={(e) => {
                const bId = e.target.value as 'cn1' | 'cn2';
                setSelectedBranchId(bId);
                const nextClasses = classes.filter((c) => c.branchId === bId);
                if (nextClasses.length > 0) setSelectedClassId(nextClasses[0].id);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-red-600 focus:bg-white font-semibold cursor-pointer"
            >
              <option value="cn1">📍 Chi Nhánh 1 (Phan Đăng Lưu)</option>
              <option value="cn2">📍 Chi Nhánh 2 (Nguyễn Văn Đậu)</option>
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-red-600 focus:bg-white cursor-pointer"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-red-600 focus:bg-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* Attendance Sheet Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">
              {activeClass ? activeClass.name : 'Danh Sách Học Viên Chi Nhánh'}
            </span>
            {activeClass && (
              <span className="text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
                {activeClass.timeSlot} | {activeClass.coachName}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500">
            Ngày: <strong className="text-slate-900 font-mono">{formatDate(selectedDate)}</strong>
          </span>
        </div>

        {branchStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            Không có học viên nào trong lớp / chi nhánh này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Học Viên</th>
                  <th className="py-3 px-4">Loại Gói / Thẻ Buổi</th>
                  <th className="py-3 px-4">Số Buổi / Hạn Dùng</th>
                  <th className="py-3 px-4">Giờ Check-in</th>
                  <th className="py-3 px-4 text-right">Trạng Thái Điểm Danh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {branchStudents.map((student) => {
                  const record = getAttendanceRecord(student.id);
                  const checked = !!record;
                  const isSessionBased = student.remainingSessions !== undefined;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      
                      {/* Student */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full ${student.avatarColor} text-white font-bold flex items-center justify-center text-xs shrink-0`}
                          >
                            {student.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{student.fullName}</p>
                            <p className="font-mono text-[10px] text-slate-500">{student.code}</p>
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
                          <span className="text-slate-700">Gói Tháng / Định Kỳ</span>
                        )}
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
                          <span className="text-slate-700">{formatDate(student.feeDueDate)}</span>
                        )}
                      </td>

                      {/* Time Checked */}
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {checked ? (
                          <span className="text-amber-800 font-bold">{record?.timeChecked}</span>
                        ) : (
                          '---'
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        {checked ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Đã Có Mặt
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              onCheckInStudent(
                                student,
                                activeClass || branchClasses[0],
                                selectedDate,
                                isSessionBased ? 'Đã trừ 1 buổi tập' : undefined
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
  );
};
