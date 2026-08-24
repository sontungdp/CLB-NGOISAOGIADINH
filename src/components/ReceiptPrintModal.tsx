import React from 'react';
import { PaymentReceipt, Student, Branch } from '../types';
import { formatVND, formatDate, formatDateTime } from '../utils/formatters';
import { ClubLogo } from './ClubLogo';
import { Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';

interface ReceiptPrintModalProps {
  receipt: PaymentReceipt | null;
  student?: Student;
  branch?: Branch;
  onClose: () => void;
}

export const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({
  receipt,
  student,
  branch,
  onClose,
}) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Actions (Hidden in Print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-amber-300">Biên Lai Thu Học Phí</h3>
            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              {receipt.receiptCode}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-sm transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              In Phiếu Thu
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Content */}
        <div className="printable-receipt p-8 bg-white text-slate-900">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-start gap-3.5">
              <ClubLogo size={58} className="shadow-xs" />
              <div className="space-y-0.5">
                <h1 className="text-base font-black tracking-tight text-slate-950 uppercase leading-tight">
                  CLB NGÔI SAO GIA ĐỊNH
                </h1>
                <p className="text-xs font-bold text-amber-700">
                  {branch?.name || (receipt.branchId === 'cn1' ? 'CLB Ngôi Sao Gia Định - Chi Nhánh 1' : 'CLB Ngôi Sao Gia Định - Chi Nhánh 2')}
                </p>
                <p className="text-[11px] text-slate-600">
                  Địa chỉ: {branch?.address || (receipt.branchId === 'cn1' ? '2A Phan Chu Trinh, Phường Bình Thạnh, TPHCM' : '25A Nơ Trang Long, Phường Gia Định, TPHCM')}
                </p>
                <p className="text-[11px] text-slate-600">
                  Hotline: {branch?.phone || '096 677 90 99'} | Email: ngoisaogiadinhvn@gmail.com
                </p>
              </div>
            </div>
            <div className="text-right space-y-1 shrink-0">
              <div className="inline-block bg-slate-100 border border-slate-300 px-3 py-1 rounded text-right">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Mã Phiếu Thu</p>
                <p className="text-sm font-mono font-bold text-slate-900">{receipt.receiptCode}</p>
              </div>
              <p className="text-[11px] text-slate-500">
                Ngày thu: {formatDateTime(receipt.paymentDate)}
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center my-6">
            <h2 className="text-2xl font-black tracking-wide text-slate-950 uppercase">
              PHIẾU THU HỌC PHÍ
            </h2>
            <p className="text-xs italic text-slate-500 mt-1">
              (Liên 1: Lưu nội bộ CLB / Liên 2: Giao cho học viên, phụ huynh)
            </p>
          </div>

          {/* Student Info Grid */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 text-sm">
            <div className="grid grid-cols-2 gap-y-3 gap-x-6">
              <div>
                <span className="text-slate-500 font-medium">Họ và tên học viên:</span>
                <span className="ml-2 font-bold text-slate-950 text-base">{receipt.studentName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Mã học viên:</span>
                <span className="ml-2 font-mono font-semibold text-slate-900">{receipt.studentCode}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Số điện thoại:</span>
                <span className="ml-2 font-medium text-slate-900">{student?.phone || '---'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Chi nhánh tập luyện:</span>
                <span className="ml-2 font-semibold text-slate-900">
                  {receipt.branchId === 'cn1' ? 'Chi Nhánh 1' : 'Chi Nhánh 2'}
                </span>
              </div>
              {student?.parentName && (
                <div className="col-span-2">
                  <span className="text-slate-500 font-medium">Phụ huynh / Người bảo hộ:</span>
                  <span className="ml-2 font-medium text-slate-900">{student.parentName} ({student.parentPhone})</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Detail Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Khoản thu / Khóa học</th>
                  <th className="py-2.5 px-4 text-center">Thời hạn / Số buổi</th>
                  <th className="py-2.5 px-4 text-right">Đơn giá</th>
                  <th className="py-2.5 px-4 text-right">Giảm giá</th>
                  <th className="py-2.5 px-4 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{receipt.packageName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {receipt.note || 'Học phí rèn luyện tại CLB Ngôi Sao Gia Định'}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-center text-xs">
                    {receipt.sessionCountAdded ? (
                      <span className="font-semibold text-emerald-700">+{receipt.sessionCountAdded} buổi tập</span>
                    ) : (
                      <span>{formatDate(receipt.validFrom)} → {formatDate(receipt.validTo)}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-700">
                    {formatVND(receipt.originalAmount)}
                  </td>
                  <td className="py-3 px-4 text-right text-rose-600 font-medium">
                    {receipt.discount > 0 ? `-${formatVND(receipt.discount)}` : '0 đ'}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-950 text-base">
                    {formatVND(receipt.finalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary & Method */}
          <div className="flex items-center justify-between border-t border-b border-slate-200 py-3 mb-6 bg-amber-50/50 px-4 rounded-lg">
            <div className="text-xs text-slate-600">
              <span>Hình thức thanh toán: </span>
              <span className="font-bold uppercase text-slate-900">
                {receipt.paymentMethod === 'cash' ? 'Tiền mặt tại quầy' : 'Chuyển khoản Ngân hàng (VietQR)'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 mr-2">Tổng thanh toán:</span>
              <span className="text-xl font-extrabold text-amber-600">
                {formatVND(receipt.finalAmount)}
              </span>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 text-center text-xs mt-8 pt-4">
            <div className="space-y-16">
              <p className="font-semibold text-slate-700 uppercase">Người Nộp Tiền</p>
              <p className="italic text-slate-400 font-medium">(Ký và ghi rõ họ tên)</p>
            </div>
            <div className="space-y-16">
              <p className="font-semibold text-slate-700 uppercase">Người Thu Tiền</p>
              <div>
                <p className="font-bold text-slate-900">{receipt.cashier}</p>
                <p className="text-[11px] text-slate-500">Đã thu đủ</p>
              </div>
            </div>
            <div className="space-y-16">
              <p className="font-semibold text-slate-700 uppercase">Ban Chủ Nhiệm CLB</p>
              <div className="flex flex-col items-center">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <CheckCircle className="w-3.5 h-3.5" /> ĐÃ XÁC NHẬN
                </span>
                <p className="font-bold text-slate-900 mt-1">Ngôi Sao Gia Định</p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400">
            Cảm ơn quý học viên & phụ huynh đã đồng hành cùng CLB Ngôi Sao Gia Định!
          </div>
        </div>

        {/* Modal Bottom Footer (Hidden in Print) */}
        <div className="no-print px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            💡 Mẹo: Bạn có thể chọn "Save as PDF" khi hộp thoại in hiện ra để lưu file PDF.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-sm transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              In Phiếu Thu Ngay
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
