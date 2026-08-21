import React, { useState } from 'react';
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

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({
  receipts,
  students,
  branches,
  disciplines,
  packages,
  branchFilter,
  onSelectBranchFilter,
}) => {
  const [period, setPeriod] = useState<'all' | 'month' | 'quarter' | 'year'>('all');

  const filteredReceipts = receipts.filter((r) => {
    if (branchFilter !== 'all' && r.branchId !== branchFilter) return false;
    return true;
  });

  // Totals
  const totalRevenue = filteredReceipts.reduce((sum, r) => sum + r.finalAmount, 0);
  const totalDiscounts = filteredReceipts.reduce((sum, r) => sum + r.discount, 0);
  const totalOriginal = filteredReceipts.reduce((sum, r) => sum + r.originalAmount, 0);
  const avgReceiptValue = filteredReceipts.length > 0 ? totalRevenue / filteredReceipts.length : 0;

  // Branch breakdown
  const cn1Receipts = receipts.filter((r) => r.branchId === 'cn1');
  const cn2Receipts = receipts.filter((r) => r.branchId === 'cn2');
  const cn1Total = cn1Receipts.reduce((sum, r) => sum + r.finalAmount, 0);
  const cn2Total = cn2Receipts.reduce((sum, r) => sum + r.finalAmount, 0);

  // Method breakdown
  const transferTotal = filteredReceipts
    .filter((r) => r.paymentMethod === 'transfer')
    .reduce((sum, r) => sum + r.finalAmount, 0);
  const cashTotal = filteredReceipts
    .filter((r) => r.paymentMethod === 'cash')
    .reduce((sum, r) => sum + r.finalAmount, 0);
  const posTotal = filteredReceipts
    .filter((r) => r.paymentMethod === 'pos')
    .reduce((sum, r) => sum + r.finalAmount, 0);

  const paymentMethodData = [
    { name: 'Chuyển Khoản (VietQR)', value: transferTotal },
    { name: 'Tiền Mặt Tại Quầy', value: cashTotal },
    { name: 'Quẹt Thẻ POS', value: posTotal },
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

  // Export Financial Summary
  const handleExportSummary = () => {
    const headers = ['Hạng Mục', 'Cơ Sở 1 (Phan Đăng Lưu)', 'Cơ Sở 2 (Nguyễn Văn Đậu)', 'Tổng Toàn CLB'];
    const rows = [
      ['Tổng Doanh Thu Thực Thu', formatVND(cn1Total), formatVND(cn2Total), formatVND(cn1Total + cn2Total)],
      ['Số Phiếu Thu Đã Lập', cn1Receipts.length, cn2Receipts.length, cn1Receipts.length + cn2Receipts.length],
      ['Tổng Học Viên Đang Học', students.filter(s => s.branchId === 'cn1').length, students.filter(s => s.branchId === 'cn2').length, students.length],
    ];

    const filename = `Bao_Cao_Tai_Chinh_CLB_NgoiSaoGiaDinh_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCsv(filename, headers, rows);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-700">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Báo Cáo Tài Chính & Doanh Thu</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Phân tích số liệu học phí, cơ cấu nguồn thu và hiệu quả giữa 2 cơ sở.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={branchFilter}
            onChange={(e) => onSelectBranchFilter(e.target.value as BranchFilter)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-red-600 focus:bg-white cursor-pointer"
          >
            <option value="all">🏢 Toàn Hệ Thống (2 Cơ Sở)</option>
            <option value="cn1">📍 Cơ Sở 1 (Phan Đăng Lưu)</option>
            <option value="cn2">📍 Cơ Sở 2 (Nguyễn Văn Đậu)</option>
          </select>

          <button
            onClick={handleExportSummary}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" />
            Xuất Báo Cáo
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tổng Thu Thực Tế
          </span>
          <p className="text-2xl font-black text-red-700 font-mono mt-2">
            {formatVND(totalRevenue)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Từ {filteredReceipts.length} giao dịch</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Giá Trị TB / Giao Dịch
          </span>
          <p className="text-2xl font-black text-emerald-700 font-mono mt-2">
            {formatVND(avgReceiptValue)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Trung bình mỗi học viên đóng</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tổng Giảm Giá & Ưu Đãi
          </span>
          <p className="text-2xl font-black text-amber-600 font-mono mt-2">
            {formatVND(totalDiscounts)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Khuyến mãi cho học viên</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Doanh Thu Gốc
          </span>
          <p className="text-2xl font-black text-slate-800 font-mono mt-2">
            {formatVND(totalOriginal)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Trước khi chiết khấu</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Payment Methods Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Cơ Cấu Hình Thức Thanh Toán</h3>
            <p className="text-xs text-slate-500">Tỷ lệ chuyển khoản VietQR vs Tiền mặt vs POS</p>
          </div>

          <div className="h-60 w-full">
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
            <h3 className="font-bold text-slate-900 text-base">Doanh Thu Theo Bộ Môn Võ Thuật</h3>
            <p className="text-xs text-slate-500">Nguồn thu phân bổ theo các môn giảng dạy</p>
          </div>

          <div className="h-60 w-full">
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

      {/* Comparison Table: CN1 vs CN2 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Bảng Đối Chiếu 2 Chi Nhánh CLB Ngôi Sao Gia Định</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Chỉ Số So Sánh</th>
                <th className="py-3 px-4">Cơ Sở 1 (Phan Đăng Lưu)</th>
                <th className="py-3 px-4">Cơ Sở 2 (Nguyễn Văn Đậu)</th>
                <th className="py-3 px-4 font-bold text-red-700">Tổng Hệ Thống</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <tr>
                <td className="py-3 px-4 font-medium text-slate-800">Tổng doanh thu thực tế</td>
                <td className="py-3 px-4 font-mono font-bold text-amber-800">{formatVND(cn1Total)}</td>
                <td className="py-3 px-4 font-mono font-bold text-blue-700">{formatVND(cn2Total)}</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-700">{formatVND(cn1Total + cn2Total)}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-800">Số phiếu thu phát hành</td>
                <td className="py-3 px-4 font-mono text-slate-700">{cn1Receipts.length} phiếu</td>
                <td className="py-3 px-4 font-mono text-slate-700">{cn2Receipts.length} phiếu</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{cn1Receipts.length + cn2Receipts.length} phiếu</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-800">Tổng số lượng học viên</td>
                <td className="py-3 px-4 font-mono text-slate-700">{students.filter(s => s.branchId === 'cn1').length} học viên</td>
                <td className="py-3 px-4 font-mono text-slate-700">{students.filter(s => s.branchId === 'cn2').length} học viên</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{students.length} học viên</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
