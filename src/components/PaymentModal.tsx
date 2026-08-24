import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Student, FeePackage, Branch, PaymentReceipt, PaymentMethod, UserAccount } from '../types';
import { formatVND, formatDate, getTodayDateString, generateReceiptCode, generateVietQrUrl, removeVietnameseTones, getStudentStatusBadge } from '../utils/formatters';
import { ClubLogo } from './ClubLogo';
import confetti from 'canvas-confetti';
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  Sparkles,
  Check,
  ArrowRight,
  UserCheck,
  ShieldCheck,
  Search,
  ChevronDown,
  Building2,
  Calendar,
  AlertCircle,
  User,
} from 'lucide-react';

interface PaymentModalProps {
  students: Student[];
  packages: FeePackage[];
  branches: Branch[];
  selectedStudentId?: string;
  defaultBranchId?: 'cn1' | 'cn2';
  currentUser?: UserAccount | null;
  onClose: () => void;
  onSuccess: (receipt: PaymentReceipt, updatedStudent: Student) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  students,
  packages,
  branches,
  selectedStudentId,
  defaultBranchId = 'cn1',
  currentUser,
  onClose,
  onSuccess,
}) => {
  const [studentId, setStudentId] = useState<string>(selectedStudentId || (students[0]?.id ?? ''));
  const currentStudent = students.find((s) => s.id === studentId) || students[0];

  // Search state for student selection
  const [studentSearchTerm, setStudentSearchTerm] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [studentBranchFilter, setStudentBranchFilter] = useState<'all' | 'cn1' | 'cn2'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter students based on search term and branch
  const filteredStudents = useMemo(() => {
    const term = studentSearchTerm.trim().toLowerCase();
    const normalizedTerm = removeVietnameseTones(term);

    return students.filter((s) => {
      if (studentBranchFilter !== 'all' && s.branchId !== studentBranchFilter) {
        return false;
      }

      if (!term) return true;

      const nameLower = s.fullName.toLowerCase();
      const nameNormalized = removeVietnameseTones(nameLower);
      const codeLower = s.code.toLowerCase();
      const phoneClean = s.phone.replace(/\s+/g, '');

      return (
        nameLower.includes(term) ||
        nameNormalized.includes(normalizedTerm) ||
        codeLower.includes(term) ||
        phoneClean.includes(term)
      );
    });
  }, [students, studentSearchTerm, studentBranchFilter]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentBranchId = currentStudent ? currentStudent.branchId : defaultBranchId;
  const currentBranch = branches.find((b) => b.id === currentBranchId) || branches[0];

  // Available packages for this branch & discipline
  const availablePackages = packages.filter(
    (pkg) =>
      pkg.branchAvailability === 'all' ||
      pkg.branchAvailability === currentBranchId
  );

  const [packageId, setPackageId] = useState<string>(
    currentStudent?.packageId && availablePackages.some((p) => p.id === currentStudent.packageId)
      ? currentStudent.packageId
      : availablePackages[0]?.id || ''
  );

  const selectedPackage = packages.find((p) => p.id === packageId) || availablePackages[0];

  const [originalAmount, setOriginalAmount] = useState<number>(selectedPackage?.price || 800000);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer');
  const [paymentDate, setPaymentDate] = useState<string>(getTodayDateString());
  const [note, setNote] = useState<string>('');
  const [cashier, setCashier] = useState<string>(currentUser?.fullName || 'Thu Ngân');

  // When selected package changes, update amount
  useEffect(() => {
    if (selectedPackage) {
      setOriginalAmount(selectedPackage.price);
    }
  }, [selectedPackage]);

  // When student changes, update package if applicable
  useEffect(() => {
    if (currentStudent && currentStudent.packageId) {
      if (packages.some((p) => p.id === currentStudent.packageId)) {
        setPackageId(currentStudent.packageId);
      }
    }
  }, [studentId]);

  const finalAmount = Math.max(0, originalAmount - discount);

  // Compute new expiration date or sessions
  const calculateNewExpiryAndSessions = () => {
    const isSessions = selectedPackage?.type === 'sessions' || selectedPackage?.type === 'pt';
    let newDueDate = currentStudent?.feeDueDate;
    let newRemaining = currentStudent?.remainingSessions;

    if (isSessions) {
      const addedSessions = selectedPackage?.sessionCount || 10;
      newRemaining = (currentStudent?.remainingSessions || 0) + addedSessions;
      // compute 60 or 90 days validity
      const d = new Date();
      d.setDate(d.getDate() + (selectedPackage?.durationMonths || 2) * 30);
      newDueDate = d.toISOString().split('T')[0];
    } else {
      const durationMonths = selectedPackage?.durationMonths || 1;
      const baseDate =
        currentStudent?.feeDueDate && new Date(currentStudent.feeDueDate) > new Date()
          ? new Date(currentStudent.feeDueDate)
          : new Date();
      
      baseDate.setMonth(baseDate.getMonth() + durationMonths);
      newDueDate = baseDate.toISOString().split('T')[0];
    }

    return { newDueDate, newRemaining };
  };

  const { newDueDate, newRemaining } = calculateNewExpiryAndSessions();

  // Dynamic VietQR
  const transferMemo = `${currentStudent?.code || 'NSGD'} ${currentStudent?.fullName || ''}`.trim();
  const vietQrUrl = generateVietQrUrl({
    bankBin: currentBranch.bankBin,
    bankAccount: currentBranch.bankAccount,
    amount: finalAmount,
    memo: transferMemo,
    accountOwner: currentBranch.bankOwner,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent || !selectedPackage) return;

    const receiptCode = generateReceiptCode(currentBranchId);
    const now = new Date();
    const timeFormatted = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const fullDateTime = `${paymentDate} ${timeFormatted}`;

    const receipt: PaymentReceipt = {
      id: `rcp-${Date.now()}`,
      receiptCode,
      studentId: currentStudent.id,
      studentName: currentStudent.fullName,
      studentCode: currentStudent.code,
      branchId: currentBranchId,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      originalAmount,
      discount,
      finalAmount,
      paymentMethod,
      paymentDate: fullDateTime,
      validFrom: paymentDate,
      validTo: newDueDate,
      sessionCountAdded: selectedPackage.sessionCount,
      note: note || (paymentMethod === 'transfer' ? 'Chuyển khoản VietQR thành công' : 'Thanh toán tại quầy'),
      cashier,
    };

    const updatedStudent: Student = {
      ...currentStudent,
      packageId: selectedPackage.id,
      feeStatus: selectedPackage.type === 'free' || selectedPackage.price === 0 ? 'free' : 'paid',
      feePaidDate: paymentDate,
      feeDueDate: newDueDate,
      remainingSessions: newRemaining,
      totalSessions: selectedPackage.sessionCount
        ? (currentStudent.totalSessions || 0) + selectedPackage.sessionCount
        : currentStudent.totalSessions,
    };

    // Confetti effect
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    onSuccess(receipt, updatedStudent);
  };

  const statusBadge = currentStudent
    ? getStudentStatusBadge(currentStudent.feeStatus, currentStudent.feeDueDate, currentStudent.remainingSessions)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-red-900 via-red-800 to-amber-900 text-white border-b border-red-950/20">
          <div className="flex items-center gap-3">
            <ClubLogo size="md" className="border border-white/40 rounded-full bg-white" />
            <div>
              <h3 className="font-bold text-white text-base">Thu Học Phí & Xuất Phiếu Thu</h3>
              <p className="text-xs text-amber-200 font-semibold">
                {currentBranch.name}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* 1. Chọn học viên với tính năng gõ tìm kiếm nhanh */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3" ref={dropdownRef}>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Chọn Học Viên Đóng Phí (Gõ tên / mã / SĐT để tìm nhanh)
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setStudentBranchFilter('all')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    studentBranchFilter === 'all'
                      ? 'bg-slate-800 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setStudentBranchFilter('cn1')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    studentBranchFilter === 'cn1'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  CS1
                </button>
                <button
                  type="button"
                  onClick={() => setStudentBranchFilter('cn2')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    studentBranchFilter === 'cn2'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  CS2
                </button>
              </div>
            </div>

            {/* Search Input & Combobox */}
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={studentSearchTerm}
                  onChange={(e) => {
                    setStudentSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="🔎 Gõ tên học viên (VD: Sơn, Tùng, Long, Hùng), mã HV hoặc SĐT..."
                  className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-20 py-2.5 text-sm text-slate-900 font-semibold focus:ring-2 focus:ring-red-700 focus:border-red-700 shadow-xs"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  {studentSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setStudentSearchTerm('')}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                      title="Xóa tìm kiếm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="p-1 text-slate-500 hover:text-slate-800 rounded-md cursor-pointer"
                    title="Mở danh sách"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Autocomplete Dropdown List */}
              {isDropdownOpen && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 bg-slate-50 text-[11px] font-bold text-slate-500 flex items-center justify-between sticky top-0 border-b border-slate-100 z-10">
                    <span>Tìm thấy {filteredStudents.length} học viên</span>
                    <span className="text-slate-400">Bấm để chọn</span>
                  </div>

                  {filteredStudents.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      Không tìm thấy học viên nào khớp với từ khóa "{studentSearchTerm}".
                    </div>
                  ) : (
                    filteredStudents.map((s) => {
                      const isSelected = s.id === studentId;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setStudentId(s.id);
                            setIsDropdownOpen(false);
                            setStudentSearchTerm('');
                          }}
                          className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 hover:bg-red-50/70 transition-colors cursor-pointer ${
                            isSelected ? 'bg-red-50/90 font-bold border-l-4 border-red-700' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 ${
                                s.avatarColor || 'bg-red-600'
                              }`}
                            >
                              {s.fullName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {s.fullName}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                <span className="font-mono font-semibold text-slate-700">{s.code}</span>
                                <span>•</span>
                                <span>{s.phone}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                s.branchId === 'cn1' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {s.branchId === 'cn1' ? 'CS1' : 'CS2'}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                s.feeStatus === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : s.feeStatus === 'expiring_soon'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {s.remainingSessions !== undefined
                                ? `${s.remainingSessions} buổi`
                                : formatDate(s.feeDueDate)}
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-red-700 shrink-0" />}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Currently Selected Student Card */}
            {currentStudent && (
              <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 ${
                      currentStudent.avatarColor || 'bg-red-600'
                    }`}
                  >
                    {currentStudent.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-slate-900">{currentStudent.fullName}</strong>
                      <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        {currentStudent.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      SĐT: <span className="font-semibold text-slate-700">{currentStudent.phone}</span> • Cơ sở:{' '}
                      <span className="font-semibold text-slate-700">
                        {currentStudent.branchId === 'cn1' ? 'Cơ Sở 1 (Phan Chu Trinh)' : 'Cơ Sở 2 (Nơ Trang Long)'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center">
                  <div className="text-right text-xs">
                    <p className="text-[11px] text-slate-500">
                      {currentStudent.remainingSessions !== undefined
                        ? `Còn lại: ${currentStudent.remainingSessions} buổi`
                        : `Hạn cũ: ${formatDate(currentStudent.feeDueDate)}`}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        currentStudent.feeStatus === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : currentStudent.feeStatus === 'expiring_soon'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {currentStudent.feeStatus === 'paid'
                        ? 'Đã đóng phí'
                        : currentStudent.feeStatus === 'expiring_soon'
                        ? 'Sắp hết hạn'
                        : 'Quá hạn / Hết phí'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(true);
                      setStudentSearchTerm('');
                    }}
                    className="text-xs font-bold text-red-700 hover:text-red-800 underline ml-2 cursor-pointer"
                  >
                    Đổi
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Chọn gói học phí & Đơn giá */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                2. Gói Học Phí
              </label>
              <select
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 font-semibold focus:ring-2 focus:ring-red-700 focus:border-red-700 shadow-xs"
              >
                {availablePackages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} ({formatVND(pkg.price)})
                  </option>
                ))}
              </select>
              {selectedPackage?.description && (
                <p className="text-xs text-slate-500 mt-1.5 italic">
                  ℹ️ {selectedPackage.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Đơn Giá Gốc (VNĐ)
              </label>
              <input
                type="number"
                value={originalAmount}
                onChange={(e) => setOriginalAmount(Number(e.target.value))}
                step={50000}
                min={0}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 font-mono font-bold focus:ring-2 focus:ring-red-700 focus:border-red-700 shadow-xs"
              />
            </div>
          </div>

          {/* 3. Giảm giá & Kỳ hạn gia hạn */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Giảm Giá / Khuyến Mãi (VNĐ)
              </label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                step={50000}
                min={0}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-rose-600 font-mono font-bold focus:ring-2 focus:ring-red-700 focus:border-red-700 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ngày Thu & Bắt Đầu Khóa
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-red-700 focus:border-red-700 shadow-xs"
              />
            </div>
          </div>

          {/* New Expiry Info Card */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {selectedPackage?.sessionCount ? (
                  <>Số buổi sau khi cộng: <strong className="text-emerald-800 font-bold">{newRemaining} buổi</strong></>
                ) : (
                  <>Hạn học phí mới sau khi gia hạn: <strong className="text-emerald-800 font-bold">{formatDate(newDueDate)}</strong></>
                )}
              </span>
            </div>
            <span className="font-mono text-[11px] text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded">
              Tự động cộng dồn
            </span>
          </div>

          {/* 4. Hình thức thanh toán */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              3. Phương Thức Thanh Toán
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === 'transfer'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm ring-1 ring-amber-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <QrCode className="w-5 h-5 mb-1 text-amber-600" />
                Chuyển Khoản (VietQR)
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm ring-1 ring-emerald-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Banknote className="w-5 h-5 mb-1 text-emerald-600" />
                Tiền Mặt Tại Quầy
              </button>
            </div>
          </div>

          {/* VietQR Display when Transfer is chosen */}
          {paymentMethod === 'transfer' && (
            <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-32 h-32 bg-white rounded-lg p-1.5 shrink-0 shadow-md flex items-center justify-center border border-amber-200">
                <img
                  src={vietQrUrl}
                  alt="Mã VietQR"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1.5 text-xs flex-1">
                <div className="flex items-center gap-1.5 text-red-800 font-bold">
                  <ShieldCheck className="w-4 h-4 text-red-700" />
                  Mã QR Chuyển Khoản Tự Động ({currentBranch.shortName})
                </div>
                <p className="text-slate-700">
                  Ngân hàng: <span className="font-bold text-slate-900">{currentBranch.bankName}</span>
                </p>
                <p className="text-slate-700">
                  Số tài khoản: <span className="font-mono font-bold text-red-800 text-sm">{currentBranch.bankAccount}</span>
                </p>
                <p className="text-slate-700">
                  Chủ tài khoản: <span className="font-bold text-slate-900">{currentBranch.bankOwner}</span>
                </p>
                <p className="text-slate-700">
                  Số tiền: <span className="font-bold text-emerald-800 text-sm">{formatVND(finalAmount)}</span>
                </p>
                <p className="text-slate-700">
                  Nội dung CK: <span className="font-mono font-bold bg-white border border-amber-300 px-2 py-0.5 rounded text-red-800">{transferMemo}</span>
                </p>
              </div>
            </div>
          )}

          {/* Cashier & Note */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Người Thu Tiền / Thu Ngân
              </label>
              <input
                type="text"
                value={cashier}
                onChange={(e) => setCashier(e.target.value)}
                placeholder="Tên nhân viên thu"
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-red-700 shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ghi Chú Phiếu Thu
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Tặng 1 áo CLB, ưu đãi giới thiệu..."
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-red-700 shadow-xs"
              />
            </div>
          </div>

          {/* Total & Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Tổng tiền thanh toán:</p>
              <p className="text-2xl font-black text-red-700 font-mono">
                {formatVND(finalAmount)}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-red-700 to-amber-600 hover:from-red-800 hover:to-amber-700 text-white font-bold rounded-xl text-sm transition-all cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" />
                Xác Nhận Thu Phí & In Biên Lai
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
