import React, { useState, useMemo } from 'react';
import {
  PaymentReceipt,
  Branch,
  BranchFilter,
  Student,
} from '../types';
import {
  formatVND,
  formatDateTime,
  formatDate,
  exportToCsv,
} from '../utils/formatters';
import {
  Search,
  Download,
  Plus,
  Printer,
  CreditCard,
  Banknote,
  QrCode,
  Calendar,
  DollarSign,
  Trash2,
  FileText,
  ShieldCheck,
} from 'lucide-react';

interface TuitionManagementProps {
  receipts: PaymentReceipt[];
  branches: Branch[];
  students: Student[];
  branchFilter: BranchFilter;
  onSelectBranchFilter: (filter: BranchFilter) => void;
  onOpenNewPayment: () => void;
  onPrintReceipt: (receipt: PaymentReceipt) => void;
  onCancelReceipt: (receiptId: string) => void;
}

export const TuitionManagement: React.FC<TuitionManagementProps> = ({
  receipts,
  branches,
  students,
  branchFilter,
  onSelectBranchFilter,
  onOpenNewPayment,
  onPrintReceipt,
  onCancelReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all'); // all, today, month

  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      // Branch filter
      if (branchFilter !== 'all' && r.branchId !== branchFilter) return false;

      // Method filter
      if (methodFilter !== 'all' && r.paymentMethod !== methodFilter) return false;

      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchCode = r.receiptCode.toLowerCase().includes(q);
        const matchName = r.studentName.toLowerCase().includes(q);
        const matchStdCode = r.studentCode.toLowerCase().includes(q);
        const matchPackage = r.packageName.toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchStdCode && !matchPackage) return false;
      }

      return true;
    });
  }, [receipts, branchFilter, methodFilter, searchTerm]);

  const totalCollected = filteredReceipts.reduce((sum, r) => sum + r.finalAmount, 0);
  const totalDiscounts = filteredReceipts.reduce((sum, r) => sum + r.discount, 0);

  const handleExport = () => {
    const headers = [
      'Mã Phiếu Thu',
      'Chi Nhánh',
      'Mã HV',
      'Họ và Tên',
      'Gói Học Phí',
      'Phương Thức',
      'Giá Gốc',
      'Giảm Giá',
      'Thực Thu',
      'Ngày Thu',
      'Hạn Sử Dụng Đến',
      'Người Thu',
      'Ghi Chú',
    ];

    const rows = filteredReceipts.map((r) => [
      r.receiptCode,
      branches.find((b) => b.id === r.branchId)?.name || (r.branchId === 'cn1' ? 'Chi Nhánh 1 (Phan Chu Trinh)' : 'Chi Nhánh 2 (Nơ Trang Long)'),
      r.studentCode,
      r.studentName,
      r.packageName,
      r.paymentMethod === 'transfer' ? 'Chuyển khoản VietQR' : 'Tiền mặt',
      r.originalAmount,
      r.discount,
      r.finalAmount,
      r.paymentDate,
      r.validTo || 'Theo buổi',
      r.cashier,
      r.note || '',
    ]);

    const filename = `Danh_Sach_Phieu_Thu_Hoc_Phi_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCsv(filename, headers, rows);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Main Title & Action */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-700">
                <FileText className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">Sổ Thu Học Phí & Phiếu Thu</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý toàn bộ biên lai, dòng tiền học phí và in phiếu thu cho học viên 2 chi nhánh.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Xuất CSV
            </button>
            <button
              onClick={onOpenNewPayment}
              className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tạo Phiếu Thu Mới
            </button>
          </div>
        </div>

        {/* Total Metric Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            Tổng Thực Thu ({filteredReceipts.length} phiếu)
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono my-2">
            {formatVND(totalCollected)}
          </p>
          <div className="text-[11px] text-slate-600 flex justify-between">
            <span>Tổng giảm giá đã tặng:</span>
            <span className="text-rose-600 font-mono font-semibold">{formatVND(totalDiscounts)}</span>
          </div>
        </div>

      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã phiếu, tên học viên..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-red-600 focus:bg-white outline-none"
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
            <option value="cn1">📍 Cơ Sở 1 (Phan Chu Trinh)</option>
            <option value="cn2">📍 Cơ Sở 2 (Nơ Trang Long)</option>
          </select>
        </div>

        {/* Method Filter */}
        <div>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-red-600 focus:bg-white outline-none cursor-pointer"
          >
            <option value="all">💳 Tất cả Hình Thức Thanh Toán</option>
            <option value="transfer">📱 Chuyển khoản VietQR</option>
            <option value="cash">💵 Tiền mặt tại quầy</option>
          </select>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {filteredReceipts.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            Không tìm thấy phiếu thu học phí nào phù hợp điều kiện.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Mã Phiếu Thu</th>
                  <th className="py-3.5 px-4">Ngày Thu</th>
                  <th className="py-3.5 px-4">Học Viên</th>
                  <th className="py-3.5 px-4">Chi Nhánh</th>
                  <th className="py-3.5 px-4">Khoản Thu / Gói Học</th>
                  <th className="py-3.5 px-4">Hình Thức</th>
                  <th className="py-3.5 px-4 text-right">Thực Thu</th>
                  <th className="py-3.5 px-4">Thu Ngân</th>
                  <th className="py-3.5 px-4 text-right">In Phiếu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredReceipts.map((receipt) => {
                  return (
                    <tr key={receipt.id} className="hover:bg-slate-50 transition-colors">
                      
                      {/* Receipt Code */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-amber-700 text-xs">
                          {receipt.receiptCode}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {formatDateTime(receipt.paymentDate)}
                      </td>

                      {/* Student */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-xs">{receipt.studentName}</p>
                        <p className="font-mono text-[10px] text-slate-500">{receipt.studentCode}</p>
                      </td>

                      {/* Branch */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700">
                          {receipt.branchId === 'cn1' ? 'Cơ Sở 1' : 'Cơ Sở 2'}
                        </span>
                      </td>

                      {/* Package */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{receipt.packageName}</p>
                        <p className="text-[10px] text-slate-500">
                          {receipt.sessionCountAdded ? `+${receipt.sessionCountAdded} buổi` : `Hạn: ${formatDate(receipt.validTo)}`}
                        </p>
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                            receipt.paymentMethod === 'transfer'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {receipt.paymentMethod === 'transfer' ? (
                            <>
                              <QrCode className="w-3 h-3 text-amber-600" />
                              <span>VietQR</span>
                            </>
                          ) : (
                            <>
                              <Banknote className="w-3 h-3 text-emerald-600" />
                              <span>Tiền mặt</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right">
                        <p className="font-mono font-bold text-amber-700 text-sm">
                          {formatVND(receipt.finalAmount)}
                        </p>
                        {receipt.discount > 0 && (
                          <p className="text-[10px] text-rose-600 font-mono">
                            - {formatVND(receipt.discount)}
                          </p>
                        )}
                      </td>

                      {/* Cashier */}
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        {receipt.cashier}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onPrintReceipt(receipt)}
                          title="In phiếu thu / Lưu PDF"
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer ml-auto"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-700" />
                          In
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
  );
};
