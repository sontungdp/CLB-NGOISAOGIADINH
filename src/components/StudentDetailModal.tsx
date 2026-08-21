import React, { useState } from 'react';
import { Student, Branch, Discipline, FeePackage, ClassSession, PaymentReceipt, AttendanceRecord } from '../types';
import { formatVND, formatDate, formatDateTime, getStudentStatusBadge } from '../utils/formatters';
import { ClubLogo } from './ClubLogo';
import {
  X,
  CreditCard,
  MessageSquare,
  Printer,
  Calendar,
  Phone,
  MapPin,
  Clock,
  User,
  Shield,
  Activity,
  Award,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface StudentDetailModalProps {
  student: Student;
  branch: Branch;
  discipline?: Discipline;
  feePackage?: FeePackage;
  currentClass?: ClassSession;
  receipts: PaymentReceipt[];
  attendance: AttendanceRecord[];
  onClose: () => void;
  onPayTuition: (student: Student) => void;
  onSendReminder: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onPrintReceipt: (receipt: PaymentReceipt) => void;
  onToggleReserve: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  branch,
  discipline,
  feePackage,
  currentClass,
  receipts,
  attendance,
  onClose,
  onPayTuition,
  onSendReminder,
  onEditStudent,
  onPrintReceipt,
  onToggleReserve,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'receipts' | 'attendance'>('profile');

  const studentReceipts = receipts.filter((r) => r.studentId === student.id);
  const studentAttendance = attendance.filter((a) => a.studentId === student.id);

  const statusBadge = getStudentStatusBadge(
    student.feeStatus,
    student.feeDueDate,
    student.remainingSessions
  );

  const totalPaid = studentReceipts.reduce((sum, r) => sum + r.finalAmount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Student Banner */}
        <div className="relative bg-linear-to-r from-red-900 via-red-800 to-amber-900 text-white p-6 border-b border-red-950/20">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative shrink-0">
              <div
                className={`w-16 h-16 rounded-2xl ${student.avatarColor} flex items-center justify-center text-white text-2xl font-black shadow-lg border-2 border-white/30`}
              >
                {student.fullName.charAt(0)}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5">
                <ClubLogo size={24} className="border border-white/50 shadow-md rounded-full bg-white" />
              </div>
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-bold text-white">{student.fullName}</h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-black/25 text-amber-200 font-bold border border-white/20">
                  {student.code}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusBadge.bg} ${statusBadge.textCol} ${statusBadge.borderCol}`}
                >
                  {statusBadge.text}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/80">
                <span className="flex items-center gap-1 text-amber-200">
                  <Shield className="w-3.5 h-3.5" />
                  {branch.shortName}
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-rose-200" />
                  {discipline?.name || 'Võ Thuật'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-200" />
                  Gia nhập: {formatDate(student.joinDate)}
                </span>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <button
                onClick={() => onPayTuition(student)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md"
              >
                <CreditCard className="w-4 h-4" />
                Thu Phí
              </button>
              <button
                onClick={() => onSendReminder(student)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-200" />
                Nhắc Phí
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'border-red-700 text-red-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Hồ Sơ & Khóa Học
          </button>
          <button
            onClick={() => setActiveTab('receipts')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'receipts'
                ? 'border-red-700 text-red-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Lịch Sử Đóng Học Phí
            <span className="px-1.5 py-0.2 bg-slate-200 text-[10px] rounded-full text-slate-700 font-bold">
              {studentReceipts.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'attendance'
                ? 'border-red-700 text-red-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Điểm Danh & Chuyên Cần
            <span className="px-1.5 py-0.2 bg-slate-200 text-[10px] rounded-full text-slate-700 font-bold">
              {studentAttendance.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Fee Card Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Gói Đang Tham Gia</p>
                  <p className="text-sm font-bold text-slate-900">{feePackage?.name || 'Chưa đăng ký'}</p>
                  <p className="text-xs text-amber-700 font-bold mt-1">
                    {formatVND(feePackage?.price)}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Thời Hạn / Số Buổi Còn</p>
                  {student.remainingSessions !== undefined ? (
                    <div>
                      <p className="text-lg font-bold text-emerald-700 font-mono">
                        {student.remainingSessions} / {student.totalSessions || 20} buổi
                      </p>
                      <p className="text-xs text-slate-500">Hạn: {formatDate(student.feeDueDate)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-bold text-slate-900">{formatDate(student.feeDueDate)}</p>
                      <p className="text-xs text-slate-500">Đã đóng: {formatDate(student.feePaidDate)}</p>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Tổng Học Phí Đã Đóng</p>
                  <p className="text-lg font-extrabold text-red-700 font-mono">
                    {formatVND(totalPaid)}
                  </p>
                  <p className="text-xs text-slate-500">{studentReceipts.length} lần giao dịch</p>
                </div>
              </div>

              {/* Personal Details */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Thông Tin Cá Nhân & Liên Hệ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-500">Số điện thoại: </span>
                    <span className="font-mono font-bold text-slate-900 ml-1">{student.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Giới tính: </span>
                    <span className="font-semibold text-slate-800 ml-1">{student.gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Ngày sinh: </span>
                    <span className="font-semibold text-slate-800 ml-1">{formatDate(student.dateOfBirth)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Email: </span>
                    <span className="font-semibold text-slate-800 ml-1">{student.email || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500">Địa chỉ: </span>
                    <span className="font-semibold text-slate-800 ml-1">{student.address || 'Quận Bình Thạnh, TP.HCM'}</span>
                  </div>
                  {student.parentName && (
                    <div className="sm:col-span-2 bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between shadow-xs">
                      <div>
                        <span className="text-slate-500">Phụ huynh: </span>
                        <span className="font-bold text-slate-900 ml-1">{student.parentName}</span>
                      </div>
                      <span className="font-mono text-red-700 font-bold text-xs">{student.parentPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Class & Training Details */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Lớp Học & Ca Tập Hiện Tại
                </h4>
                {currentClass ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{currentClass.name}</p>
                      <p className="text-slate-500 mt-0.5">
                        HLV Phụ trách: <span className="text-red-700 font-semibold">{currentClass.coachName}</span> | Phòng: {currentClass.room}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-900 font-mono font-bold">
                        {currentClass.timeSlot}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Chưa đăng ký lớp cố định (tập luyện tự do hoặc kèm 1-1).</p>
                )}
              </div>

              {/* Notes */}
              {student.notes && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Ghi Chú
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed italic">{student.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'receipts' && (
            <div className="space-y-3">
              {studentReceipts.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  Chưa có lịch sử thu học phí nào cho học viên này.
                </div>
              ) : (
                studentReceipts.map((r) => (
                  <div
                    key={r.id}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-red-700 text-xs">{r.receiptCode}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                          {r.paymentMethod === 'transfer' ? 'VietQR' : r.paymentMethod === 'cash' ? 'Tiền mặt' : 'POS'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{r.packageName}</p>
                      <p className="text-xs text-slate-500">
                        Ngày thu: {formatDateTime(r.paymentDate)} | Thu ngân: {r.cashier}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <p className="text-base font-extrabold text-red-700 font-mono">
                          {formatVND(r.finalAmount)}
                        </p>
                        {r.discount > 0 && (
                          <p className="text-[11px] text-rose-600 font-medium">Đã giảm {formatVND(r.discount)}</p>
                        )}
                      </div>
                      <button
                        onClick={() => onPrintReceipt(r)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        In
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-3">
              {studentAttendance.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  Chưa có dữ liệu điểm danh nào của học viên này.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Ngày</th>
                        <th className="py-2.5 px-4">Lớp Học</th>
                        <th className="py-2.5 px-4">Giờ Vào</th>
                        <th className="py-2.5 px-4">Trạng Thái</th>
                        <th className="py-2.5 px-4">Ghi Chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {studentAttendance.map((att) => (
                        <tr key={att.id}>
                          <td className="py-2.5 px-4 font-mono text-slate-700">{formatDate(att.date)}</td>
                          <td className="py-2.5 px-4 text-slate-900 font-medium">{att.className}</td>
                          <td className="py-2.5 px-4 font-mono text-amber-800 font-bold">{att.timeChecked}</td>
                          <td className="py-2.5 px-4">
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Có mặt
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 italic">{att.note || '---'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={() => onToggleReserve(student)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
              student.feeStatus === 'reserved'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {student.feeStatus === 'reserved' ? 'Kích hoạt lại học viên' : 'Bảo lưu khóa học'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditStudent(student)}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Chỉnh Sửa
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
