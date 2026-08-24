import React, { useState, useRef, useEffect } from 'react';
import { BranchFilter, Branch, TabType, UserAccount, ClubConfig } from '../types';
import { ClubLogo } from './ClubLogo';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  CalendarCheck,
  Clock,
  BarChart3,
  Settings,
  Plus,
  MapPin,
  Sun,
  Moon,
  LogOut,
  KeyRound,
  UserCheck,
  ChevronDown,
  User,
  Shield,
} from 'lucide-react';

interface NavbarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  branchFilter: BranchFilter;
  onChangeBranchFilter: (filter: BranchFilter) => void;
  branches?: Branch[];
  config?: ClubConfig;
  alertCount?: number;
  onQuickAddStudent: () => void;
  onQuickPayment: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
  onOpenChangePassword?: () => void;
  onSwitchUser?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  branchFilter,
  onChangeBranchFilter,
  branches,
  config,
  alertCount = 0,
  onQuickAddStudent,
  onQuickPayment,
  theme = 'light',
  onToggleTheme,
  currentUser,
  onLogout,
  onOpenChangePassword,
  onSwitchUser,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard },
    { id: 'students', label: 'Học Viên', icon: Users, badge: alertCount },
    { id: 'tuition', label: 'Thu Học Phí', icon: CreditCard },
    { id: 'attendance', label: 'Điểm Danh', icon: CalendarCheck },
    { id: 'classes', label: 'Lớp & Ca Tập', icon: Clock },
    { id: 'reports', label: 'Báo Cáo', icon: BarChart3 },
    { id: 'settings', label: 'Cài Đặt & Users', icon: Settings },
  ];

  const isLight = theme === 'light';

  const roleLabel =
    currentUser?.role === 'admin'
      ? 'Quản Trị Viên'
      : currentUser?.role === 'cashier'
      ? currentUser.branchId === 'cn1'
        ? 'Thu Ngân CN1'
        : 'Thu Ngân CN2'
      : 'HLV';

  const roleBadgeColor =
    currentUser?.role === 'admin'
      ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
      : currentUser?.role === 'cashier'
      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors shadow-md ${
      isLight 
        ? 'bg-white/95 border-slate-200 shadow-slate-900/5 text-slate-800' 
        : 'bg-slate-950/95 border-slate-800 text-white'
    }`}>
      {/* Top Bar with Brand & Branch Selector & Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onChangeTab('dashboard')}>
            <ClubLogo size="md" className="border border-amber-500/30 shadow-md" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-black text-base tracking-tight uppercase font-sans ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {config?.clubName || 'CLB NGÔI SAO GIA ĐỊNH'}
                </span>
              </div>
              <p className={`text-[11px] font-medium hidden sm:block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {config?.slogan || 'Hệ thống Quản lý Học phí & Học viên 2 Chi Nhánh'}
              </p>
            </div>
          </div>

          {/* Branch Switcher Pill Selector */}
          <div className={`hidden md:flex items-center p-1 rounded-xl border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <button
              onClick={() => onChangeBranchFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                branchFilter === 'all'
                  ? 'bg-red-700 text-white shadow-sm'
                  : isLight ? 'text-slate-600 hover:text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tất Cả {branches && branches.length > 0 ? `${branches.length} ` : '2 '}Chi Nhánh
            </button>
            {branches && branches.length > 0 ? (
              branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => onChangeBranchFilter(b.id as BranchFilter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    branchFilter === b.id
                      ? 'bg-red-700 text-white shadow-sm'
                      : isLight ? 'text-slate-600 hover:text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  title={b.address || b.name}
                >
                  <MapPin className="w-3 h-3" />
                  {b.shortName || b.name}
                </button>
              ))
            ) : (
              <>
                <button
                  onClick={() => onChangeBranchFilter('cn1')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    branchFilter === 'cn1'
                      ? 'bg-red-700 text-white shadow-sm'
                      : isLight ? 'text-slate-600 hover:text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  Cơ Sở 1 (Phan Đăng Lưu)
                </button>
                <button
                  onClick={() => onChangeBranchFilter('cn2')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    branchFilter === 'cn2'
                      ? 'bg-red-700 text-white shadow-sm'
                      : isLight ? 'text-slate-600 hover:text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  Cơ Sở 2 (Nguyễn Văn Đậu)
                </button>
              </>
            )}
          </div>

          {/* Quick Action Buttons, Theme Switcher & User Profile */}
          <div className="flex items-center gap-2">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                title={isLight ? 'Chuyển sang Giao diện Tối' : 'Chuyển sang Giao diện Sáng'}
                className={`p-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer flex items-center justify-center ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' 
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-amber-400'
                }`}
              >
                {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={onQuickPayment}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">+ Thu Học Phí</span>
            </button>
            <button
              onClick={onQuickAddStudent}
              className={`flex items-center gap-1.5 px-3 py-2 font-bold rounded-xl text-xs transition-colors border cursor-pointer ${
                isLight 
                  ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900' 
                  : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
              }`}
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Thêm Học Viên</span>
            </button>

            {/* Current User Profile Pill & Dropdown */}
            {currentUser && (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-800'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-white'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg ${currentUser.avatarColor || 'bg-red-600'} text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs`}>
                    {currentUser.fullName.split(' ').pop()?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden xl:block text-left text-xs leading-tight">
                    <div className="font-bold truncate max-w-[110px]">{currentUser.fullName}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{roleLabel}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl border p-2 z-50 animate-fadeIn ${
                    isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
                  }`}>
                    {/* User Info Header */}
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{currentUser.fullName}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${roleBadgeColor}`}>
                          {roleLabel}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        @{currentUser.username}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="truncate">
                          {currentUser.branchId === 'all'
                            ? `Toàn quyền ${branches?.length || 2} Chi Nhánh`
                            : branches?.find((b) => b.id === currentUser.branchId)?.shortName ||
                              branches?.find((b) => b.id === currentUser.branchId)?.name ||
                              (currentUser.branchId === 'cn1' ? 'Cơ Sở 1' : 'Cơ Sở 2')}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-1 space-y-1 text-xs">
                      {onOpenChangePassword && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            onOpenChangePassword();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer font-medium"
                        >
                          <KeyRound className="w-4 h-4 text-amber-500" />
                          <span>Đổi Mật Khẩu</span>
                        </button>
                      )}

                      {onSwitchUser && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            onSwitchUser();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer font-medium"
                        >
                          <UserCheck className="w-4 h-4 text-blue-500" />
                          <span>Chuyển Tài Khoản</span>
                        </button>
                      )}

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      {onLogout && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left cursor-pointer font-bold"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Đăng Xuất</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className={`border-t ${isLight ? 'border-slate-200/80 bg-slate-50/80' : 'border-slate-800/80 bg-slate-950/60'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1.5 no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onChangeTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? isLight
                        ? 'bg-red-700 text-white shadow-xs'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? (isLight ? 'text-white' : 'text-amber-400') : (isLight ? 'text-slate-500' : 'text-slate-500')}`} />
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

