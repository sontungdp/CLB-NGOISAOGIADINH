import { StudentFeeStatus } from '../types';

export function formatVND(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount).replace('₫', 'đ');
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '---';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateTimeStr: string | undefined | null): string {
  if (!dateTimeStr) return '---';
  try {
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) return dateTimeStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateTimeStr;
  }
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDaysDiffFromToday(targetDateStr: string | undefined | null): number {
  if (!targetDateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getStudentStatusBadge(
  status: StudentFeeStatus,
  dueDateStr?: string,
  remainingSessions?: number
): { text: string; bg: string; textCol: string; borderCol: string; icon: string } {
  if (status === 'free') {
    return {
      text: 'Lớp Năng Khiếu (Miễn phí)',
      bg: 'bg-purple-950/80',
      textCol: 'text-purple-300 font-semibold',
      borderCol: 'border-purple-700/70',
      icon: 'Sparkles',
    };
  }

  const daysDiff = dueDateStr ? getDaysDiffFromToday(dueDateStr) : null;

  if (status === 'reserved') {
    return {
      text: 'Đang bảo lưu',
      bg: 'bg-slate-700/60',
      textCol: 'text-slate-300',
      borderCol: 'border-slate-600',
      icon: 'PauseCircle',
    };
  }

  if (remainingSessions !== undefined && remainingSessions !== null) {
    if (remainingSessions <= 0) {
      return {
        text: 'Hết buổi (0 buổi)',
        bg: 'bg-rose-950/80',
        textCol: 'text-rose-300 font-semibold',
        borderCol: 'border-rose-700/60',
        icon: 'AlertTriangle',
      };
    }
    if (remainingSessions <= 3) {
      return {
        text: `Sắp hết (Còn ${remainingSessions} buổi)`,
        bg: 'bg-amber-950/80',
        textCol: 'text-amber-300 font-semibold',
        borderCol: 'border-amber-700/60',
        icon: 'Clock',
      };
    }
    return {
      text: `Còn ${remainingSessions} buổi`,
      bg: 'bg-emerald-950/80',
      textCol: 'text-emerald-300 font-medium',
      borderCol: 'border-emerald-700/60',
      icon: 'CheckCircle2',
    };
  }

  if (daysDiff !== null) {
    if (daysDiff < 0) {
      return {
        text: `Quá hạn ${Math.abs(daysDiff)} ngày`,
        bg: 'bg-red-950/80',
        textCol: 'text-red-300 font-semibold',
        borderCol: 'border-red-700/70',
        icon: 'AlertOctagon',
      };
    }
    if (daysDiff <= 7) {
      return {
        text: daysDiff === 0 ? 'Hết hạn hôm nay' : `Hết hạn sau ${daysDiff} ngày`,
        bg: 'bg-amber-950/80',
        textCol: 'text-amber-300 font-semibold',
        borderCol: 'border-amber-700/70',
        icon: 'Clock',
      };
    }
  }

  if (status === 'overdue') {
    return {
      text: 'Quá hạn đóng phí',
      bg: 'bg-red-950/80',
      textCol: 'text-red-300 font-semibold',
      borderCol: 'border-red-700/70',
      icon: 'AlertOctagon',
    };
  }

  if (status === 'expiring_soon') {
    return {
      text: 'Sắp hết hạn',
      bg: 'bg-amber-950/80',
      textCol: 'text-amber-300 font-semibold',
      borderCol: 'border-amber-700/70',
      icon: 'Clock',
    };
  }

  if (status === 'unpaid') {
    return {
      text: 'Chưa đóng phí',
      bg: 'bg-rose-950/80',
      textCol: 'text-rose-300 font-semibold',
      borderCol: 'border-rose-700/70',
      icon: 'XCircle',
    };
  }

  return {
    text: 'Đã đóng phí',
    bg: 'bg-emerald-950/80',
    textCol: 'text-emerald-300 font-medium',
    borderCol: 'border-emerald-700/70',
    icon: 'CheckCircle2',
  };
}

export function generateVietQrUrl(params: {
  bankBin: string;
  bankAccount: string;
  amount: number;
  memo: string;
  accountOwner?: string;
}): string {
  const cleanAccount = params.bankAccount.replace(/\s+/g, '');
  const encodedMemo = encodeURIComponent(params.memo);
  const encodedName = params.accountOwner ? encodeURIComponent(params.accountOwner) : '';
  return `https://img.vietqr.io/image/${params.bankBin}-${cleanAccount}-compact2.png?amount=${params.amount}&addInfo=${encodedMemo}&accountName=${encodedName}`;
}

export function generateReceiptCode(branchId: 'cn1' | 'cn2'): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const prefix = branchId === 'cn1' ? 'PT-CN1' : 'PT-CN2';
  return `${prefix}-${year}-${randomNum}`;
}

export function generateNextStudentCode(branchId: 'cn1' | 'cn2', currentStudentsCount: number): string {
  const prefix = branchId === 'cn1' ? 'NSGD1' : 'NSGD2';
  const num = String(currentStudentsCount + 1).padStart(4, '0');
  return `${prefix}-${num}`;
}

export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const bom = '\uFEFF'; // UTF-8 BOM for Excel Vietnamese display
  const csvContent =
    bom +
    [
      headers.join(','),
      ...rows.map(row =>
        row
          .map(item => {
            const str = String(item ?? '').replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(',')
      ),
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  str = str.replace(/Đ/g, 'D');
  // Combining diacritical marks
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
  str = str.replace(/\u02C6|\u0306|\u031B/g, '');
  return str;
}

