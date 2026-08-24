import React, { useState } from 'react';
import { UserAccount } from '../types';
import { ClubLogo } from './ClubLogo';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface LoginScreenProps {
  users: UserAccount[];
  onLogin: (user: UserAccount) => void;
  theme?: 'light' | 'dark';
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin, theme = 'light' }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Vui lòng nhập tên đăng nhập hoặc số điện thoại');
      return;
    }

    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu');
      return;
    }

    const matchedUser = users.find(
      (u) =>
        (u.username.toLowerCase() === username.trim().toLowerCase() ||
          u.phone === username.trim() ||
          u.email?.toLowerCase() === username.trim().toLowerCase())
    );

    if (!matchedUser) {
      setErrorMessage('Tài khoản không tồn tại trên hệ thống!');
      return;
    }

    if (!matchedUser.isActive) {
      setErrorMessage('Tài khoản này đang bị khóa tạm thời. Vui lòng liên hệ Quản trị viên!');
      return;
    }

    // Check password (default is '123' or whatever set in user)
    const validPassword = matchedUser.password || '123';
    if (password !== validPassword) {
      setErrorMessage('Mật khẩu không chính xác! Vui lòng thử lại.');
      return;
    }

    // Success login
    const updatedUser: UserAccount = {
      ...matchedUser,
      lastLogin: new Date().toLocaleString('vi-VN'),
    };
    onLogin(updatedUser);
  };

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 transition-colors font-sans relative overflow-hidden ${
      isLight ? 'bg-slate-900' : 'bg-slate-950 text-white'
    }`}>
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-700/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 my-6">
        
        {/* Left Side: Brand Greeting & Club Info */}
        <div className="lg:col-span-5 bg-gradient-to-br from-red-950/80 via-slate-900/90 to-slate-950/90 border border-red-500/20 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none">
            <ClubLogo size={220} />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <ClubLogo size="md" className="border border-amber-500/40 shadow-lg" />
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold block">
                  HỆ THỐNG NỘI BỘ
                </span>
                <h1 className="text-lg font-black text-white uppercase tracking-tight font-sans">
                  CLB NGÔI SAO GIA ĐỊNH
                </h1>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                Quản Lý Học Phí & Học Viên 2 Chi Nhánh
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Nền tảng kiểm soát chuyên sâu: điểm danh ca tập, tự động xuất mã VietQR từng cơ sở, quản lý biên lai và nhắc học phí Zalo/SMS.
              </p>
            </div>

            {/* Branch Cards Brief */}
            <div className="space-y-2 pt-2">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-white">Chi Nhánh 1 (Phan Đăng Lưu)</div>
                  <div className="text-[11px] text-slate-400">2A Phan Đăng Lưu, P.14, Bình Thạnh</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-white">Chi Nhánh 2 (Nguyễn Văn Đậu)</div>
                  <div className="text-[11px] text-slate-400">45 Nguyễn Văn Đậu, P.6, Bình Thạnh</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between text-[11px] text-slate-400">
            <span>© 2026 CLB Ngôi Sao Gia Định</span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Hệ Thống Trực Tuyến
            </span>
          </div>
        </div>

        {/* Right Side: Login Form & Quick Roles Selector */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Đăng Nhập Hệ Thống
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Nhập thông tin tài khoản nhân viên được cấp để truy cập
              </p>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tên Đăng Nhập / Số Điện Thoại
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin hoặc tn_cn1, hlv_tuan..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600 dark:focus:ring-red-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Mật Khẩu
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Mặc định: <span className="font-mono font-bold text-amber-700 dark:text-amber-400">123</span>
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600 dark:focus:ring-red-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember checkbox & info */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Hỗ trợ 24/7: 1900 6868
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-800 hover:to-amber-700 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-red-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Đăng Nhập Vào Hệ Thống</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Account security & login note */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Quy định bảo mật & phân quyền đăng nhập</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Nhân viên vui lòng nhập đúng tên đăng nhập và mật khẩu cá nhân được cấp. Nếu chưa có tài khoản hoặc quên mật khẩu, vui lòng liên hệ trực tiếp <strong>Quản Trị Viên (Admin)</strong> để được cấp lại.
              </p>
            </div>

          </div>

          <div className="pt-4 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Dữ liệu lưu trữ an toàn & mã hóa theo phân quyền chi nhánh</span>
          </div>

        </div>

      </div>
    </div>
  );
};
