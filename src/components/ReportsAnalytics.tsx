import React, { useState, useMemo } from 'react';
import {
  PaymentReceipt,
  Student,
  Branch,
  Discipline,
  FeePackage,
  BranchFilter,
} from '../types';
import {
  formatVND,
  formatDate,
  exportToCsv,
} from '../utils/formatters';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  PieChart as PieIcon,
  CreditCard,
  Building2,
  Users,
  Filter,
  Check,
  ChevronDown,
  Clock,
  ArrowRight,
  RotateCcw,
  Sparkles,
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
  Legend,
  AreaChart,
  Area,
} from 'recharts';

interface ReportsAnalyticsProps {
  receipts: PaymentReceipt[];
  students: Student[];
  branches: Branch[];
  disciplines: Discipline[];
  packages: FeePackage[];
  branchFilter: BranchFilter;
  onSelectBranchFilter: (filter: BranchFilter) => void;
}

export type PeriodType = 'all' | 'month' | 'quarter' | 'year' | 'custom';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({
  receipts,
  students,
  branches,
  disciplines,
  packages,
  branchFilter,
  onSelectBranchFilter,
}) => {
  // Current time reference
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentQuarter = Math.ceil(currentMonth / 3); // 1-4

  // Period Filter States
  const [periodType, setPeriodType] = useState<PeriodType>('all');
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(currentQuarter);
  
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date(currentYear, currentMonth - 1, 1);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return now.toISOString().split('T')[0];
  });

  // Available years from receipt data + current year
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>([currentYear, currentYear - 1, currentYear - 2]);
    receipts.forEach((r) => {
      if (r.paymentDate) {
        const y = parseInt(r.paymentDate.slice(0, 4), 10);
        if (!isNaN(y)) yearsSet.add(y);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [receipts, currentYear]);

  // Label for active period
  const periodLabel = useMemo(() => {
    if (periodType === 'all') return 'Toàn Bộ Thời Gian';
    if (periodType === 'month') {
      const mStr = selectedMonth < 10 ? `0${selectedMonth}` : `${selectedMonth}`;
      return `Tháng ${mStr}/${selectedYear}`;
    }
    if (periodType === 'quarter') {
      const qMonths =
        selectedQuarter === 1
          ? 'T1 - T3'
          : selectedQuarter === 2
          ? 'T4 - T6'
          : selectedQuarter === 3
          ? 'T7 - T9'
          : 'T10 - T12';
      return `Quý ${selectedQuarter}/${selectedYear} (${qMonths})`;
    }
    if (periodType === 'year') return `Cả Năm ${selectedYear}`;
    if (periodType === 'custom') {
      const startStr = customStartDate ? formatDate(customStartDate) : 'Từ đầu';
      const endStr = customEndDate ? formatDate(customEndDate) : 'Hiện tại';
      return `Từ ${startStr} đến ${endStr}`;
    }
    return '';
  }, [periodType, selectedYear, selectedMonth, selectedQuarter, customStartDate, customEndDate]);

  // Filter receipts by Branch and Time Period
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      // Branch filter
      if (branchFilter !== 'all' && r.branchId !== branchFilter) return false;

      // Time period filter
      if (periodType === 'all') return true;

      const dateStr = r.paymentDate ? r.paymentDate.split(' ')[0].split('T')[0] : '';
      if (!dateStr) return false;

      const rYear = parseInt(dateStr.slice(0, 4), 10);
      const rMonth = parseInt(dateStr.slice(5, 7), 10);

      if (periodType === 'month') {
        return rYear === selectedYear && rMonth === selectedMonth;
      }

      if (periodType === 'quarter') {
        const rQuarter = Math.ceil(rMonth / 3);
        return rYear === selectedYear && rQuarter === selectedQuarter;
      }

      if (periodType === 'year') {
        return rYear === selectedYear;
      }

      if (periodType === 'custom') {
        if (customStartDate && dateStr < customStartDate) return false;
        if (customEndDate && dateStr > customEndDate) return false;
        return true;
      }

      return true;
    });
  }, [receipts, branchFilter, periodType, selectedYear, selectedMonth, selectedQuarter, customStartDate, customEndDate]);

  // Totals for filtered receipts
  const totalRevenue = filteredReceipts.reduce((sum, r) => sum + r.finalAmount, 0);
  const totalDiscounts = filteredReceipts.reduce((sum, r) => sum + r.discount, 0);
  const totalOriginal = filteredReceipts.reduce((sum, r) => sum + r.originalAmount, 0);
  const avgReceiptValue = filteredReceipts.length > 0 ? Math.round(totalRevenue / filteredReceipts.length) : 0;

  // Branch breakdown in this period
  const cn1ReceiptsInPeriod = receipts.filter((r) => {
    if (r.branchId !== 'cn1') return false;
    if (periodType === 'all') return true;
    const dateStr = r.paymentDate ? r.paymentDate.split(' ')[0].split('T')[0] : '';
    if (!dateStr) return false;
    const rYear = parseInt(dateStr.slice(0, 4), 10);
    const rMonth = parseInt(dateStr.slice(5, 7), 10);
    if (periodType === 'month') return rYear === selectedYear && rMonth === selectedMonth;
    if (periodType === 'quarter') return rYear === selectedYear && Math.ceil(rMonth / 3) === selectedQuarter;
    if (periodType === 'year') return rYear === selectedYear;
    if (periodType === 'custom') {
      if (customStartDate && dateStr < customStartDate) return false;
      if (customEndDate && dateStr > customEndDate) return false;
      return true;
    }
    return true;
  });

  const cn2ReceiptsInPeriod = receipts.filter((r) => {
    if (r.branchId !== 'cn2') return false;
    if (periodType === 'all') return true;
    const dateStr = r.paymentDate ? r.paymentDate.split(' ')[0].split('T')[0] : '';
    if (!dateStr) return false;
    const rYear = parseInt(dateStr.slice(0, 4), 10);
    const rMonth = parseInt(dateStr.slice(5, 7), 10);
    if (periodType === 'month') return rYear === selectedYear && rMonth === selectedMonth;
    if (periodType === 'quarter') return rYear === selectedYear && Math.ceil(rMonth / 3) === selectedQuarter;
    if (periodType === 'year') return rYear === selectedYear;
    if (periodType === 'custom') {
      if (customStartDate && dateStr < customStartDate) return false;
      if (customEndDate && dateStr > customEndDate) return false;
      return true;
    }
    return true;
  });

  const cn1Total = cn1ReceiptsInPeriod.reduce((sum, r) => sum + r.finalAmount, 0);
  const cn2Total = cn2ReceiptsInPeriod.reduce((sum, r) => sum + r.finalAmount, 0);

  // Method breakdown
  const transferTotal = filteredReceipts
    .filter((r) => r.paymentMethod === 'transfer')
    .reduce((sum, r) => sum + r.finalAmount, 0);
  const cashTotal = filteredReceipts
    .filter((r) => r.paymentMethod === 'cash')
    .reduce((sum, r) => sum + r.finalAmount, 0);

  const paymentMethodData = [
    { name: 'Chuyển Khoản (VietQR)', value: transferTotal },
    { name: 'Tiền Mặt Tại Quầy', value: cashTotal },
  ].filter((item) => item.value > 0);

  // Discipline Revenue Breakdown
  const disciplineRevenueData = disciplines.map((disc) => {
    const total = filteredReceipts
      .filter((r) => {
        const pkg = packages.find((p) => p.id === r.packageId);
        return pkg?.disciplineId === disc.id;
      })
      .reduce((sum, r) => sum + r.finalAmount, 0);

    return {
      name: disc.name.split(' (')[0],
      amount: total,
    };
  }).filter((item) => item.amount > 0);

  // Monthly Revenue Timeline Data (For Year or All modes)
  const monthlyTrendData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const targetYear = periodType === 'year' ? selectedYear : currentYear;

    return months.map((m) => {
      const monthStr = m < 10 ? `0${m}` : `${m}`;
      const cn1MonthRevenue = receipts
        .filter((r) => {
          if (r.branchId !== 'cn1') return false;
          const d = r.paymentDate ? r.paymentDate.split(' ')[0] : '';
          return d.startsWith(`${targetYear}-${monthStr}`);
        })
        .reduce((sum, r) => sum + r.finalAmount, 0);

      const cn2MonthRevenue = receipts
        .filter((r) => {
          if (r.branchId !== 'cn2') return false;
          const d = r.paymentDate ? r.paymentDate.split(' ')[0] : '';
          return d.startsWith(`${targetYear}-${monthStr}`);
        })
        .reduce((sum, r) => sum + r.finalAmount, 0);

      return {
        name: `T${m}`,
        fullName: `Tháng ${m}/${targetYear}`,
        cn1: cn1MonthRevenue,
        cn2: cn2MonthRevenue,
        total: cn1MonthRevenue + cn2MonthRevenue,
      };
    });
  }, [receipts, periodType, selectedYear, currentYear]);

  // Quick Preset Handlers for Custom Date Range
  const setQuickRange = (preset: 'today' | '7days' | '30days' | 'thisMonth' | 'lastMonth' | 'thisQuarter') => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'today') {
      setCustomStartDate(todayStr);
      setCustomEndDate(todayStr);
    } else if (preset === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      setCustomStartDate(d.toISOString().split('T')[0]);
      setCustomEndDate(todayStr);
    } else if (preset === '30days') {
      const d = new Date();
      d.setDate(d.getDate() - 29);
      setCustomStartDate(d.toISOString().split('T')[0]);
      setCustomEndDate(todayStr);
    } else if (preset === 'thisMonth') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setCustomStartDate(firstDay.toISOString().split('T')[0]);
      setCustomEndDate(todayStr);
    } else if (preset === 'lastMonth') {
      const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      setCustomStartDate(firstDayLastMonth.toISOString().split('T')[0]);
      setCustomEndDate(lastDayLastMonth.toISOString().split('T')[0]);
    } else if (preset === 'thisQuarter') {
      const q = Math.floor(today.getMonth() / 3);
      const firstDayQ = new Date(today.getFullYear(), q * 3, 1);
      setCustomStartDate(firstDayQ.toISOString().split('T')[0]);
      setCustomEndDate(todayStr);
    }
  };

  // Export Financial Summary
  const handleExportSummary = () => {
    const headers = [
      'Kỳ Báo Cáo',
      'Hạng Mục',
      'Cơ Sở 1 (Phan Chu Trinh)',
      'Cơ Sở 2 (Nơ Trang Long)',
      'Tổng Toàn CLB',
    ];
    const rows = [
      [periodLabel, 'Tổng Doanh Thu Thực Thu', formatVND(cn1Total), formatVND(cn2Total), formatVND(cn1Total + cn2Total)],
      [periodLabel, 'Số Phiếu Thu Đã Lập', `${cn1ReceiptsInPeriod.length}`, `${cn2ReceiptsInPeriod.length}`, `${cn1ReceiptsInPeriod.length + cn2ReceiptsInPeriod.length}`],
      [periodLabel, 'Chuyển Khoản VietQR', formatVND(filteredReceipts.filter(r => r.paymentMethod === 'transfer').reduce((s, r) => s + r.finalAmount, 0)), '', ''],
      [periodLabel, 'Tiền Mặt Tại Quầy', formatVND(filteredReceipts.filter(r => r.paymentMethod === 'cash').reduce((s, r) => s + r.finalAmount, 0)), '', ''],
      [periodLabel, 'Tổng Học Viên Hiện Tại', `${students.filter(s => s.branchId === 'cn1').length}`, `${students.filter(s => s.branchId === 'cn2').length}`, `${students.length}`],
    ];

    const filename = `Bao_Cao_Tai_Chinh_CLB_${periodType}_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCsv(filename, headers, rows);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-700">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Báo Cáo Tài Chính & Doanh Thu</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Phân tích số liệu học phí, cơ cấu nguồn thu và đối chiếu hiệu quả giữa 2 cơ sở.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Branch Filter */}
          <select
            value={branchFilter}
            onChange={(e) => onSelectBranchFilter(e.target.value as BranchFilter)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-red-600 focus:bg-white cursor-pointer"
          >
            <option value="all">🏢 Toàn Hệ Thống (2 Cơ Sở)</option>
            <option value="cn1">📍 Cơ Sở 1 (Phan Chu Trinh)</option>
            <option value="cn2">📍 Cơ Sở 2 (Nơ Trang Long)</option>
          </select>

          {/* Export Button */}
          <button
            onClick={handleExportSummary}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" />
            Xuất Báo Cáo ({filteredReceipts.length})
          </button>
        </div>
      </div>

      {/* Modern Filter Control Bar (Tháng, Quý, Năm, Tự Chọn) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-red-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Bộ Lọc Thời Gian Báo Cáo</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
              <Calendar className="w-3 h-3" />
              {periodLabel}
            </span>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Khớp <span className="font-bold text-red-700 font-mono">{filteredReceipts.length}</span> phiếu thu ({formatVND(totalRevenue)})
          </span>
        </div>

        {/* Filter Mode Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setPeriodType('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              periodType === 'all'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Tất Cả Thời Gian
          </button>

          <button
            onClick={() => {
              setPeriodType('month');
              setSelectedYear(currentYear);
              setSelectedMonth(currentMonth);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              periodType === 'month'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Theo Tháng
          </button>

          <button
            onClick={() => {
              setPeriodType('quarter');
              setSelectedYear(currentYear);
              setSelectedQuarter(currentQuarter);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              periodType === 'quarter'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Theo Quý
          </button>

          <button
            onClick={() => {
              setPeriodType('year');
              setSelectedYear(currentYear);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              periodType === 'year'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Theo Năm
          </button>

          <button
            onClick={() => setPeriodType('custom')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              periodType === 'custom'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Tùy Chọn Khoảng Ngày
          </button>
        </div>

        {/* Detailed Controls Based on Selected Mode */}
        {periodType === 'month' && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">Chọn Tháng:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-red-600"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {m < 10 ? `0${m}` : m}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">Chọn Năm:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-red-600"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    Năm {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Month Shortcuts */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={() => {
                  setSelectedYear(currentYear);
                  setSelectedMonth(currentMonth);
                }}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                Tháng Này (T{currentMonth})
              </button>
              <button
                onClick={() => {
                  if (currentMonth === 1) {
                    setSelectedYear(currentYear - 1);
                    setSelectedMonth(12);
                  } else {
                    setSelectedYear(currentYear);
                    setSelectedMonth(currentMonth - 1);
                  }
                }}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                Tháng Trước
              </button>
            </div>
          </div>
        )}

        {periodType === 'quarter' && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">Chọn Quý:</label>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(parseInt(e.target.value, 10))}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-red-600"
              >
                <option value={1}>Quý 1 (Tháng 1 - Tháng 3)</option>
                <option value={2}>Quý 2 (Tháng 4 - Tháng 6)</option>
                <option value={3}>Quý 3 (Tháng 7 - Tháng 9)</option>
                <option value={4}>Quý 4 (Tháng 10 - Tháng 12)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">Chọn Năm:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-red-600"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    Năm {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={() => {
                  setSelectedYear(currentYear);
                  setSelectedQuarter(currentQuarter);
                }}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                Quý Hiện Tại (Q{currentQuarter})
              </button>
            </div>
          </div>
        )}

        {periodType === 'year' && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">Chọn Năm Báo Cáo:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-red-600"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    Năm {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={() => setSelectedYear(currentYear)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                Năm Nay ({currentYear})
              </button>
              <button
                onClick={() => setSelectedYear(currentYear - 1)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                Năm Trước ({currentYear - 1})
              </button>
            </div>
          </div>
        )}

        {periodType === 'custom' && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">Từ Ngày:</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">Đến Ngày:</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            {/* Quick Presets for Custom */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 mr-1">Chọn nhanh:</span>
              <button
                onClick={() => setQuickRange('today')}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-[11px] font-medium text-slate-700 cursor-pointer"
              >
                Hôm Nay
              </button>
              <button
                onClick={() => setQuickRange('7days')}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-[11px] font-medium text-slate-700 cursor-pointer"
              >
                7 Ngày Qua
              </button>
              <button
                onClick={() => setQuickRange('30days')}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-[11px] font-medium text-slate-700 cursor-pointer"
              >
                30 Ngày Qua
              </button>
              <button
                onClick={() => setQuickRange('thisMonth')}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-[11px] font-medium text-slate-700 cursor-pointer"
              >
                Tháng Này
              </button>
              <button
                onClick={() => setQuickRange('lastMonth')}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-[11px] font-medium text-slate-700 cursor-pointer"
              >
                Tháng Trước
              </button>
              <button
                onClick={() => setQuickRange('thisQuarter')}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-[11px] font-medium text-slate-700 cursor-pointer"
              >
                Quý Này
              </button>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tổng Thu Thực Tế ({periodLabel})
          </span>
          <p className="text-2xl font-black text-red-700 font-mono mt-2">
            {formatVND(totalRevenue)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Từ {filteredReceipts.length} giao dịch phiếu thu</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Giá Trị TB / Giao Dịch
          </span>
          <p className="text-2xl font-black text-emerald-700 font-mono mt-2">
            {formatVND(avgReceiptValue)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Trung bình mỗi lần đóng học phí</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tổng Giảm Giá & Ưu Đãi
          </span>
          <p className="text-2xl font-black text-amber-600 font-mono mt-2">
            {formatVND(totalDiscounts)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Chiết khấu & khuyến mãi</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Doanh Thu Gốc
          </span>
          <p className="text-2xl font-black text-slate-800 font-mono mt-2">
            {formatVND(totalOriginal)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Trước khi trừ ưu đãi</p>
        </div>
      </div>

      {/* Timeline Chart: Monthly Trend Overview (Year / All) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Diễn Biến Doanh Thu 12 Tháng ({periodType === 'year' ? `Năm ${selectedYear}` : `Năm ${currentYear}`})</h3>
            <p className="text-xs text-slate-500">So sánh nguồn thu thực tế giữa Cơ Sở 1 và Cơ Sở 2 qua từng tháng</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-amber-800">
              <span className="w-3 h-3 rounded-sm bg-amber-500"></span> Cơ Sở 1 (Phan Chu Trinh)
            </span>
            <span className="flex items-center gap-1.5 text-blue-700">
              <span className="w-3 h-3 rounded-sm bg-blue-600"></span> Cơ Sở 2 (Nơ Trang Long)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis
                stroke="#64748b"
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(val: any, name: any) => [
                  formatVND(Number(val)),
                  name === 'cn1' ? 'Cơ Sở 1' : name === 'cn2' ? 'Cơ Sở 2' : 'Tổng',
                ]}
                labelFormatter={(label, payload) => {
                  const item = payload?.[0]?.payload;
                  return item?.fullName || label;
                }}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '12px' }}
              />
              <Bar dataKey="cn1" fill="#f59e0b" name="cn1" radius={[4, 4, 0, 0]} stackId="revenue" />
              <Bar dataKey="cn2" fill="#2563eb" name="cn2" radius={[4, 4, 0, 0]} stackId="revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Payment Methods Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Cơ Cấu Hình Thức Thanh Toán ({periodLabel})</h3>
            <p className="text-xs text-slate-500">Tỷ lệ chuyển khoản VietQR vs Tiền mặt tại quầy</p>
          </div>

          <div className="h-60 w-full">
            {paymentMethodData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={4}
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatVND(Number(val)), '']}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '12px' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Không có dữ liệu thanh toán trong kỳ này
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {paymentMethodData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  ></span>
                  {item.name}
                </span>
                <span className="font-mono font-bold text-slate-900">{formatVND(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Martial Arts Discipline */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Doanh Thu Theo Bộ Môn Võ Thuật ({periodLabel})</h3>
            <p className="text-xs text-slate-500">Nguồn thu phân bổ theo các môn giảng dạy</p>
          </div>

          <div className="h-60 w-full">
            {disciplineRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={disciplineRevenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis
                    stroke="#64748b"
                    tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatVND(Number(val)), 'Doanh thu']}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '12px' }}
                  />
                  <Bar dataKey="amount" fill="#b91c1c" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Không có dữ liệu doanh thu bộ môn trong kỳ này
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {disciplineRevenueData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-slate-700">
                <span>{d.name}</span>
                <span className="font-mono font-bold text-red-700">{formatVND(d.amount)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Comparison Table: CN1 vs CN2 in Period */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Bảng Đối Chiếu 2 Chi Nhánh ({periodLabel})</h3>
            <p className="text-xs text-slate-500">So sánh kết quả vận hành & tài chính giữa 2 cơ sở</p>
          </div>
          <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
            Tổng Thu: {formatVND(cn1Total + cn2Total)}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Chỉ Số Vận Hành & Tài Chính</th>
                <th className="py-3 px-4">{branches.find(b => b.id === 'cn1')?.shortName || 'Cơ Sở 1 (Phan Chu Trinh)'}</th>
                <th className="py-3 px-4">{branches.find(b => b.id === 'cn2')?.shortName || 'Cơ Sở 2 (Nơ Trang Long)'}</th>
                <th className="py-3 px-4 font-bold text-red-700">Toàn Hệ Thống</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <tr>
                <td className="py-3 px-4 font-medium text-slate-800">Tổng doanh thu thực tế trong kỳ</td>
                <td className="py-3 px-4 font-mono font-bold text-amber-800">{formatVND(cn1Total)}</td>
                <td className="py-3 px-4 font-mono font-bold text-blue-700">{formatVND(cn2Total)}</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-700">{formatVND(cn1Total + cn2Total)}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-800">Số lượng phiếu thu phát hành</td>
                <td className="py-3 px-4 font-mono text-slate-700">{cn1ReceiptsInPeriod.length} phiếu</td>
                <td className="py-3 px-4 font-mono text-slate-700">{cn2ReceiptsInPeriod.length} phiếu</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{cn1ReceiptsInPeriod.length + cn2ReceiptsInPeriod.length} phiếu</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-800">Giá trị thu trung bình / phiếu</td>
                <td className="py-3 px-4 font-mono text-slate-700">
                  {cn1ReceiptsInPeriod.length > 0 ? formatVND(Math.round(cn1Total / cn1ReceiptsInPeriod.length)) : '0đ'}
                </td>
                <td className="py-3 px-4 font-mono text-slate-700">
                  {cn2ReceiptsInPeriod.length > 0 ? formatVND(Math.round(cn2Total / cn2ReceiptsInPeriod.length)) : '0đ'}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900">
                  {cn1ReceiptsInPeriod.length + cn2ReceiptsInPeriod.length > 0
                    ? formatVND(Math.round((cn1Total + cn2Total) / (cn1ReceiptsInPeriod.length + cn2ReceiptsInPeriod.length)))
                    : '0đ'}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-800">Tổng số học viên trực thuộc cơ sở</td>
                <td className="py-3 px-4 font-mono text-slate-700">{students.filter(s => s.branchId === 'cn1').length} học viên</td>
                <td className="py-3 px-4 font-mono text-slate-700">{students.filter(s => s.branchId === 'cn2').length} học viên</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{students.length} học viên</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Filtered Receipts Table Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Danh Sách Phiếu Thu Trong Kỳ Lọc ({periodLabel})</h3>
            <p className="text-xs text-slate-500">Hiển thị các giao dịch học phí khớp với thời gian và chi nhánh đang chọn</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            {filteredReceipts.length} giao dịch
          </span>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
              <tr>
                <th className="py-2.5 px-3">Mã Phiếu</th>
                <th className="py-2.5 px-3">Học Viên</th>
                <th className="py-2.5 px-3">Cơ Sở</th>
                <th className="py-2.5 px-3">Gói Học Phí</th>
                <th className="py-2.5 px-3">Ngày Thu</th>
                <th className="py-2.5 px-3">Hình Thức</th>
                <th className="py-2.5 px-3 text-right">Thực Thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Không có phiếu thu nào khớp với bộ lọc thời gian này.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">{r.receiptCode}</td>
                    <td className="py-2 px-3">
                      <p className="font-bold text-slate-900">{r.studentName}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{r.studentCode}</span>
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          r.branchId === 'cn1' ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'
                        }`}
                      >
                        {r.branchId === 'cn1' ? 'Cơ Sở 1' : 'Cơ Sở 2'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-700">{r.packageName}</td>
                    <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{formatDate(r.paymentDate)}</td>
                    <td className="py-2 px-3">
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
                    <td className="py-2 px-3 text-right font-mono font-black text-red-700">
                      {formatVND(r.finalAmount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
