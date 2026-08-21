import React, { useState } from 'react';
import { Student, Branch, Discipline, FeePackage, ClassSession, BranchId } from '../types';
import { generateNextStudentCode, getTodayDateString } from '../utils/formatters';
import { X, UserPlus, UserCheck, Check, Shield } from 'lucide-react';

interface StudentModalProps {
  student?: Student | null; // if editing
  branches: Branch[];
  disciplines: Discipline[];
  packages: FeePackage[];
  classes: ClassSession[];
  totalStudentsCount: number;
  onClose: () => void;
  onSave: (student: Student) => void;
}

const AVATAR_COLORS = [
  'bg-red-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-orange-500',
];

export const StudentModal: React.FC<StudentModalProps> = ({
  student,
  branches,
  disciplines,
  packages,
  classes,
  totalStudentsCount,
  onClose,
  onSave,
}) => {
  const isEdit = !!student;

  const [branchId, setBranchId] = useState<BranchId>(student?.branchId || 'cn1');
  const [fullName, setFullName] = useState(student?.fullName || '');
  const [phone, setPhone] = useState(student?.phone || '');
  const [email, setEmail] = useState(student?.email || '');
  const [gender, setGender] = useState<'Nam' | 'Nữ' | 'Khác'>(student?.gender || 'Nam');
  const [dateOfBirth, setDateOfBirth] = useState(student?.dateOfBirth || '2000-01-01');
  const [parentName, setParentName] = useState(student?.parentName || '');
  const [parentPhone, setParentPhone] = useState(student?.parentPhone || '');
  const [disciplineId, setDisciplineId] = useState(student?.disciplineId || 'boxing');
  const [classId, setClassId] = useState(student?.classId || '');
  const [packageId, setPackageId] = useState(student?.packageId || packages[0]?.id || '');
  const [joinDate, setJoinDate] = useState(student?.joinDate || getTodayDateString());
  const [feeStatus, setFeeStatus] = useState<Student['feeStatus']>(student?.feeStatus || 'paid');
  const [feeDueDate, setFeeDueDate] = useState(student?.feeDueDate || '');
  const [remainingSessions, setRemainingSessions] = useState<number | undefined>(student?.remainingSessions);
  const [notes, setNotes] = useState(student?.notes || '');
  const [address, setAddress] = useState(student?.address || '');
  const [avatarColor, setAvatarColor] = useState(
    student?.avatarColor || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
  );

  // Available classes for selected branch & discipline
  const filteredClasses = classes.filter(
    (c) => c.branchId === branchId && (disciplineId ? c.disciplineId === disciplineId : true)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    const selectedPkg = packages.find((p) => p.id === packageId);
    let calculatedDueDate = feeDueDate;
    let computedSessions = remainingSessions;

    if (!isEdit && !calculatedDueDate) {
      if (selectedPkg?.type === 'sessions' || selectedPkg?.type === 'pt') {
        computedSessions = selectedPkg.sessionCount || 20;
        const d = new Date();
        d.setDate(d.getDate() + 60);
        calculatedDueDate = d.toISOString().split('T')[0];
      } else {
        const d = new Date();
        d.setMonth(d.getMonth() + (selectedPkg?.durationMonths || 1));
        calculatedDueDate = d.toISOString().split('T')[0];
      }
    }

    const savedStudent: Student = {
      id: student?.id || `std-${Date.now()}`,
      code: student?.code || generateNextStudentCode(branchId, totalStudentsCount),
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      gender,
      dateOfBirth: dateOfBirth || undefined,
      parentName: parentName.trim() || undefined,
      parentPhone: parentPhone.trim() || undefined,
      branchId,
      disciplineId,
      classId: classId || undefined,
      packageId,
      joinDate,
      feeStatus,
      feeDueDate: calculatedDueDate || undefined,
      remainingSessions: computedSessions,
      totalSessions: selectedPkg?.sessionCount || student?.totalSessions,
      notes: notes.trim() || undefined,
      address: address.trim() || undefined,
      avatarColor,
    };

    onSave(savedStudent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-red-900 via-red-800 to-amber-900 text-white border-b border-red-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-amber-200">
              {isEdit ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">
                {isEdit ? 'Chỉnh Sửa Thông Tin Học Viên' : 'Tiếp Nhận & Đăng Ký Học Viên Mới'}
              </h3>
              <p className="text-xs text-amber-200 font-medium">
                CLB Võ Thuật & Thể Thao Ngôi Sao Gia Định
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Branch & Avatar Color */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Chi Nhánh Tập Luyện <span className="text-red-700">*</span>
              </label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value as BranchId)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-red-700 shadow-xs"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.shortName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Màu Thẻ Đại Diện
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {AVATAR_COLORS.slice(0, 6).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAvatarColor(c)}
                    className={`w-6 h-6 rounded-full ${c} border-2 transition-transform cursor-pointer ${
                      avatarColor === c ? 'scale-125 border-slate-900 shadow-md' : 'border-transparent opacity-70'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Personal info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ và Tên Học Viên <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 font-semibold focus:ring-2 focus:ring-red-700 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số Điện Thoại <span className="text-red-700">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901 234 567"
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 font-mono font-bold focus:ring-2 focus:ring-red-700 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Giới Tính
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-red-700 shadow-xs"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày Sinh
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-red-700 shadow-xs"
              />
            </div>
          </div>

          {/* Parent info (optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Họ tên Phụ huynh (nếu học viên thiếu nhi)
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Anh Hùng (Bố)"
                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-red-700 shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                SĐT Phụ huynh
              </label>
              <input
                type="tel"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="0903..."
                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-900 font-mono font-medium focus:ring-2 focus:ring-red-700 shadow-xs"
              />
            </div>
          </div>

          {/* Discipline, Package & Class */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bộ Môn Tập Luyện
              </label>
              <select
                value={disciplineId}
                onChange={(e) => setDisciplineId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-red-700 shadow-xs"
              >
                {disciplines.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gói Đăng Ký
              </label>
              <select
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-red-700 shadow-xs"
              >
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lớp Học / Ca Tập
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-red-700 shadow-xs"
              >
                <option value="">-- Chưa xếp lớp / Tập tự do --</option>
                {filteredClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.timeSlot})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày Gia Nhập
              </label>
              <input
                type="date"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-red-700 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Trạng Thái Học Phí
              </label>
              <select
                value={feeStatus}
                onChange={(e) => setFeeStatus(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-red-700 shadow-xs"
              >
                <option value="paid">Đã đóng phí</option>
                <option value="expiring_soon">Sắp hết hạn (&lt; 7 ngày)</option>
                <option value="overdue">Quá hạn đóng phí</option>
                <option value="unpaid">Chưa đóng</option>
                <option value="reserved">Bảo lưu</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hạn Học Phí (hoặc Hạn Thẻ)
              </label>
              <input
                type="date"
                value={feeDueDate}
                onChange={(e) => setFeeDueDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-red-700 shadow-xs"
              />
            </div>
          </div>

          {/* Notes & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Địa Chỉ Cư Trú
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Quận Bình Thạnh, TP.HCM"
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-red-700 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Ghi Chú Đặc Biệt (Mục tiêu, bệnh lý...)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Muốn thi đấu, giảm cân, tiền sử chấn thương..."
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-red-700 shadow-xs"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-red-700 to-amber-600 hover:from-red-800 hover:to-amber-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-md"
            >
              <Check className="w-4 h-4" />
              {isEdit ? 'Cập Nhật Thông Tin' : 'Lưu & Hoàn Tất Đăng Ký'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
