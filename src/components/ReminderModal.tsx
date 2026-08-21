import React, { useState } from 'react';
import { Student, Branch, FeePackage } from '../types';
import { formatDate } from '../utils/formatters';
import { X, Copy, Check, MessageSquare, Phone, Send } from 'lucide-react';

interface ReminderModalProps {
  student: Student;
  branch: Branch;
  feePackage?: FeePackage;
  onClose: () => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  student,
  branch,
  feePackage,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  // Generate dynamic message
  const generateMessage = () => {
    const isSessions = student.remainingSessions !== undefined;
    const sessionInfo = isSessions ? `Hiện thẻ của bạn chỉ còn ${student.remainingSessions} buổi tập.` : `Hạn học phí của bạn sẽ kết thúc vào ngày ${formatDate(student.feeDueDate)}.`;

    return `🥋 Kính gửi ${student.parentName ? 'quý phụ huynh học viên ' + student.fullName : 'học viên ' + student.fullName},

CLB Ngôi Sao Gia Định (${branch.name}) xin thông báo:
- Mã học viên: ${student.code}
- Gói tập / Khóa học: ${feePackage?.name || 'Khóa học'}
- Tình trạng: ${sessionInfo}

Kính mời quý anh/chị đóng học phí kỳ tiếp theo để duy trì thời khóa biểu rèn luyện:
🏦 THÔNG TIN CHUYỂN KHOẢN:
- Ngân hàng: ${branch.bankName}
- Số tài khoản: ${branch.bankAccount}
- Chủ tài khoản: ${branch.bankOwner}
- Nội dung CK: ${student.code} ${student.fullName}

📞 Hotline hỗ trợ: ${branch.phone}
Trân trọng cảm ơn!`;
  };

  const [messageText, setMessageText] = useState(generateMessage());

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanPhone = (student.parentPhone || student.phone).replace(/[^0-9]/g, '');

  const handleOpenZalo = () => {
    // Open Zalo web chat with phone number
    window.open(`https://zalo.me/${cleanPhone}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-950/20 bg-linear-to-r from-red-900 via-red-800 to-amber-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-amber-200">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Nhắc Đóng Học Phí</h3>
              <p className="text-xs text-amber-200">
                {student.fullName} - {student.code} ({branch.shortName})
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

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Người nhận: </span>
              <span className="font-bold text-slate-900">
                {student.parentName ? `${student.parentName} (PH của ${student.fullName})` : student.fullName}
              </span>
            </div>
            <div className="flex items-center gap-1 text-red-700 font-mono font-bold">
              <Phone className="w-3.5 h-3.5" />
              {student.parentPhone || student.phone}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Nội dung tin nhắn (Có thể chỉnh sửa):
            </label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={8}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-hidden focus:border-red-700 focus:ring-2 focus:ring-red-700 leading-relaxed font-sans shadow-xs"
            />
          </div>

          {/* Quick Bank Details Badge */}
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 space-y-1">
            <p className="font-bold text-red-800">Tài khoản nhận học phí ({branch.shortName}):</p>
            <p className="font-mono">{branch.bankName}: <span className="font-bold text-slate-900">{branch.bankAccount}</span> ({branch.bankOwner})</p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-sm font-semibold transition-colors cursor-pointer shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Đã sao chép!' : 'Sao chép tin nhắn'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenZalo}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer shadow-sm"
            >
              <Send className="w-4 h-4" />
              Mở Zalo Gửi
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
