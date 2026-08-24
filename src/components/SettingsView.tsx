import React, { useState, useEffect } from 'react';
import {
  FeePackage,
  Branch,
  Discipline,
  ClubConfig,
  UserAccount,
  UserRole,
  BranchId,
} from '../types';
import { formatVND } from '../utils/formatters';
import { StorageService } from '../utils/storage';
import { ClubLogo } from './ClubLogo';
import {
  Settings,
  DollarSign,
  Building,
  Save,
  RotateCcw,
  Download,
  Upload,
  Plus,
  Edit2,
  Trash2,
  Check,
  Shield,
  CreditCard,
  QrCode,
  Sparkles,
  Phone,
  FileText,
  Users,
  UserCheck,
  KeyRound,
  Lock,
  Unlock,
  AlertCircle,
  X,
  Swords,
  Flame,
  Zap,
  ShieldAlert,
  Award,
  Trophy,
  Sword,
  Activity,
  Dumbbell,
  Target,
} from 'lucide-react';

interface SettingsViewProps {
  config: ClubConfig;
  packages: FeePackage[];
  branches: Branch[];
  disciplines: Discipline[];
  users: UserAccount[];
  onSaveConfig: (config: ClubConfig) => void;
  onSavePackages: (packages: FeePackage[]) => void;
  onSaveDisciplines: (disciplines: Discipline[]) => void;
  onSaveUsers: (users: UserAccount[]) => void;
  onResetData: () => void;
  onReloadAllData: () => void;
}

const COLOR_PRESETS = [
  { id: 'from-red-600 to-orange-500', name: 'Đỏ Lửa Boxing', preview: 'bg-gradient-to-r from-red-600 to-orange-500' },
  { id: 'from-amber-500 to-yellow-600', name: 'Vàng Hổ Phách', preview: 'bg-gradient-to-r from-amber-500 to-yellow-600' },
  { id: 'from-rose-600 to-red-700', name: 'Đỏ Thẫm Muay Thai', preview: 'bg-gradient-to-r from-rose-600 to-red-700' },
  { id: 'from-blue-600 to-sky-500', name: 'Xanh Vovinam', preview: 'bg-gradient-to-r from-blue-600 to-sky-500' },
  { id: 'from-indigo-600 to-blue-500', name: 'Xanh Chàm Taekwondo', preview: 'bg-gradient-to-r from-indigo-600 to-blue-500' },
  { id: 'from-emerald-600 to-teal-500', name: 'Xanh Ngọc Cổ Truyền', preview: 'bg-gradient-to-r from-emerald-600 to-teal-500' },
  { id: 'from-purple-600 to-indigo-500', name: 'Tím Thể Lực & Gym', preview: 'bg-gradient-to-r from-purple-600 to-indigo-500' },
  { id: 'from-slate-800 to-slate-950', name: 'Đen Huyền Bí MMA/BJJ', preview: 'bg-gradient-to-r from-slate-800 to-slate-950' },
  { id: 'from-pink-600 to-rose-500', name: 'Hồng Năng Động', preview: 'bg-gradient-to-r from-pink-600 to-rose-500' },
  { id: 'from-cyan-600 to-blue-600', name: 'Xanh Biển Karate', preview: 'bg-gradient-to-r from-cyan-600 to-blue-600' },
];

const ICON_PRESETS = [
  { id: 'Flame', label: 'Ngọn Lửa (Boxing / Chiến Đấu)', icon: Flame },
  { id: 'Zap', label: 'Tia Chớp (Kickboxing / Tốc Độ)', icon: Zap },
  { id: 'ShieldAlert', label: 'Khiên Đối Kháng (Muay Thai)', icon: ShieldAlert },
  { id: 'Award', label: 'Huy Chương (Vovinam / Võ Đạo)', icon: Award },
  { id: 'Trophy', label: 'Cúp Vô Địch (Taekwondo / Thi Đấu)', icon: Trophy },
  { id: 'Sword', label: 'Kiếm Thuật (Võ Cổ Truyền / Binh Khí)', icon: Sword },
  { id: 'Activity', label: 'Nhịp Tim (Thể Lực / Cardio)', icon: Activity },
  { id: 'Dumbbell', label: 'Tạ Tay (Gym & Sức Mạnh)', icon: Dumbbell },
  { id: 'Target', label: 'Hồng Tâm (Kỹ Thuật Chuẩn Xác)', icon: Target },
  { id: 'Swords', label: 'Song Kiếm (Đối Kháng Tổng Hợp / MMA)', icon: Swords },
];

const renderDisciplineIcon = (iconName: string, className = 'w-5 h-5') => {
  switch (iconName) {
    case 'Flame':
      return <Flame className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'ShieldAlert':
      return <ShieldAlert className={className} />;
    case 'Award':
      return <Award className={className} />;
    case 'Trophy':
      return <Trophy className={className} />;
    case 'Sword':
      return <Sword className={className} />;
    case 'Activity':
      return <Activity className={className} />;
    case 'Dumbbell':
      return <Dumbbell className={className} />;
    case 'Target':
      return <Target className={className} />;
    case 'Swords':
    default:
      return <Swords className={className} />;
  }
};

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  packages,
  branches,
  disciplines,
  users,
  onSaveConfig,
  onSavePackages,
  onSaveDisciplines,
  onSaveUsers,
  onResetData,
  onReloadAllData,
}) => {
  const [activeTab, setActiveTab] = useState<'packages' | 'disciplines' | 'branches' | 'identity' | 'users' | 'backup'>('packages');

  // Club identity edit state
  const [clubName, setClubName] = useState(config.clubName || 'CLB NGÔI SAO GIA ĐỊNH');
  const [slogan, setSlogan] = useState(config.slogan || 'Rèn Luyện Ý Chí - Khỏe Mạnh Thể Chất - Tinh Thần Thượng Võ');
  const [hotline, setHotline] = useState(config.hotline || '1900 6868 - 0907 888 111');
  const [reminderTemplate, setReminderTemplate] = useState(config.defaultReminderTemplate || '');

  // Branch and state
  const [editedBranches, setEditedBranches] = useState<Branch[]>(branches);
  const [editedPackages, setEditedPackages] = useState<FeePackage[]>(packages);
  const [editedDisciplines, setEditedDisciplines] = useState<Discipline[]>(disciplines);
  const [userList, setUserList] = useState<UserAccount[]>(users);

  // Sync state when props change
  useEffect(() => {
    setEditedBranches(branches);
  }, [branches]);

  useEffect(() => {
    setEditedPackages(packages);
  }, [packages]);

  useEffect(() => {
    setEditedDisciplines(disciplines);
  }, [disciplines]);

  useEffect(() => {
    setUserList(users);
  }, [users]);

  useEffect(() => {
    setClubName(config.clubName || 'CLB NGÔI SAO GIA ĐỊNH');
    setSlogan(config.slogan || 'Rèn Luyện Ý Chí - Khỏe Mạnh Thể Chất - Tinh Thần Thượng Võ');
    setHotline(config.hotline || '1900 6868 - 0907 888 111');
    setReminderTemplate(config.defaultReminderTemplate || '');
  }, [config]);

  // User modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [userFullName, setUserFullName] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('cashier');
  const [userBranchId, setUserBranchId] = useState<BranchId | 'all'>('cn1');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userAvatarColor, setUserAvatarColor] = useState('bg-blue-600');
  const [userIsActive, setUserIsActive] = useState(true);
  const [userModalError, setUserModalError] = useState('');

  // New package modal state
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<FeePackage | null>(null);

  // Discipline modal state
  const [showDisciplineModal, setShowDisciplineModal] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);
  const [discName, setDiscName] = useState('');
  const [discShortCode, setDiscShortCode] = useState('');
  const [discColor, setDiscColor] = useState('from-red-600 to-orange-500');
  const [discIconName, setDiscIconName] = useState('Flame');
  const [discModalError, setDiscModalError] = useState('');

  // Package Form State
  const [pkgName, setPkgName] = useState('');
  const [pkgType, setPkgType] = useState<FeePackage['type']>('monthly');
  const [pkgPrice, setPkgPrice] = useState(800000);
  const [pkgDuration, setPkgDuration] = useState(1);
  const [pkgSessions, setPkgSessions] = useState<number | undefined>(undefined);
  const [pkgDisciplineId, setPkgDisciplineId] = useState(disciplines[0]?.id || 'boxing');
  const [pkgBranchAvailability, setPkgBranchAvailability] = useState<'all' | 'cn1' | 'cn2'>('all');
  const [pkgDesc, setPkgDesc] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Open add package
  const handleOpenAddPkg = () => {
    setEditingPkg(null);
    setPkgName('');
    setPkgType('monthly');
    setPkgPrice(800000);
    setPkgDuration(1);
    setPkgSessions(undefined);
    setPkgDisciplineId(disciplines[0]?.id || 'boxing');
    setPkgBranchAvailability('all');
    setPkgDesc('');
    setShowPkgModal(true);
  };

  // Open edit package
  const handleOpenEditPkg = (pkg: FeePackage) => {
    setEditingPkg(pkg);
    setPkgName(pkg.name);
    setPkgType(pkg.type);
    setPkgPrice(pkg.price);
    setPkgDuration(pkg.durationMonths || 1);
    setPkgSessions(pkg.sessionCount);
    setPkgDisciplineId(pkg.disciplineId);
    setPkgBranchAvailability(pkg.branchAvailability);
    setPkgDesc(pkg.description || '');
    setShowPkgModal(true);
  };

  // Handle Save Package
  const handleSavePackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgName.trim()) return;

    const saved: FeePackage = {
      id: editingPkg?.id || `pkg-${Date.now()}`,
      name: pkgName.trim(),
      type: pkgType,
      price: pkgPrice,
      durationMonths: pkgDuration,
      sessionCount: pkgType === 'sessions' || pkgType === 'pt' ? (pkgSessions || 10) : undefined,
      disciplineId: pkgDisciplineId,
      branchAvailability: pkgBranchAvailability,
      description: pkgDesc.trim() || undefined,
    };

    let updated: FeePackage[];
    if (editingPkg) {
      updated = editedPackages.map((p) => (p.id === editingPkg.id ? saved : p));
    } else {
      updated = [...editedPackages, saved];
    }

    setEditedPackages(updated);
    onSavePackages(updated);
    setShowPkgModal(false);
  };

  const handleDeletePackage = (pkgId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa gói học phí này?')) {
      const updated = editedPackages.filter((p) => p.id !== pkgId);
      setEditedPackages(updated);
      onSavePackages(updated);
    }
  };

  // -------------------------------------------------------------
  // DISCIPLINE CRUD HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddDiscipline = () => {
    setEditingDiscipline(null);
    setDiscName('');
    setDiscShortCode('');
    setDiscColor('from-red-600 to-orange-500');
    setDiscIconName('Flame');
    setDiscModalError('');
    setShowDisciplineModal(true);
  };

  const handleOpenEditDiscipline = (disc: Discipline) => {
    setEditingDiscipline(disc);
    setDiscName(disc.name);
    setDiscShortCode(disc.shortCode);
    setDiscColor(disc.color || 'from-red-600 to-orange-500');
    setDiscIconName(disc.iconName || 'Flame');
    setDiscModalError('');
    setShowDisciplineModal(true);
  };

  const handleSaveDisciplineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDiscModalError('');

    if (!discName.trim()) {
      setDiscModalError('Vui lòng nhập tên bộ môn!');
      return;
    }

    if (!discShortCode.trim()) {
      setDiscModalError('Vui lòng nhập mã viết tắt (ví dụ: BOX, KB, MMA, BJJ...)!');
      return;
    }

    // Auto generate ID if new
    let discId = editingDiscipline?.id;
    if (!discId) {
      const baseId = discShortCode.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      discId = baseId || `disc-${Date.now()}`;
      // Check duplicate ID
      if (editedDisciplines.some((d) => d.id === discId)) {
        discId = `${discId}-${Date.now().toString().slice(-4)}`;
      }
    }

    const saved: Discipline = {
      id: discId,
      name: discName.trim(),
      shortCode: discShortCode.trim().toUpperCase(),
      color: discColor,
      iconName: discIconName,
    };

    let updated: Discipline[];
    if (editingDiscipline) {
      updated = editedDisciplines.map((d) => (d.id === editingDiscipline.id ? saved : d));
    } else {
      updated = [...editedDisciplines, saved];
    }

    setEditedDisciplines(updated);
    onSaveDisciplines(updated);
    setShowDisciplineModal(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDeleteDiscipline = (discId: string) => {
    const disc = editedDisciplines.find((d) => d.id === discId);
    if (!disc) return;

    if (editedDisciplines.length <= 1) {
      alert('Hệ thống cần duy trì ít nhất 1 bộ môn!');
      return;
    }

    const packageCount = editedPackages.filter((p) => p.disciplineId === discId).length;
    let confirmMsg = `Bạn có chắc chắn muốn xóa bộ môn "${disc.name}"?`;
    if (packageCount > 0) {
      confirmMsg += `\nLưu ý: Hiện có ${packageCount} gói học phí đang gắn với bộ môn này.`;
    }

    if (confirm(confirmMsg)) {
      const updated = editedDisciplines.filter((d) => d.id !== discId);
      setEditedDisciplines(updated);
      onSaveDisciplines(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  // Save Branch configs
  const handleSaveBranchSettings = () => {
    const newConfig: ClubConfig = {
      ...config,
      branches: editedBranches,
    };
    onSaveConfig(newConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // User Management Handlers
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserFullName('');
    setUserUsername('');
    setUserPassword('123');
    setUserRole('cashier');
    setUserBranchId('cn1');
    setUserPhone('');
    setUserEmail('');
    setUserAvatarColor('bg-blue-600');
    setUserIsActive(true);
    setUserModalError('');
    setShowUserModal(true);
  };

  const handleOpenEditUser = (u: UserAccount) => {
    setEditingUser(u);
    setUserFullName(u.fullName);
    setUserUsername(u.username);
    setUserPassword(u.password || '123');
    setUserRole(u.role);
    setUserBranchId(u.branchId);
    setUserPhone(u.phone || '');
    setUserEmail(u.email || '');
    setUserAvatarColor(u.avatarColor || 'bg-blue-600');
    setUserIsActive(u.isActive);
    setUserModalError('');
    setShowUserModal(true);
  };

  const handleSaveUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserModalError('');

    if (!userFullName.trim()) {
      setUserModalError('Vui lòng nhập họ và tên nhân viên!');
      return;
    }

    if (!userUsername.trim()) {
      setUserModalError('Vui lòng nhập tên đăng nhập!');
      return;
    }

    // Check duplicate username
    const isDup = userList.some(
      (u) => u.username.toLowerCase() === userUsername.trim().toLowerCase() && u.id !== editingUser?.id
    );
    if (isDup) {
      setUserModalError('Tên đăng nhập này đã tồn tại! Vui lòng chọn tên khác.');
      return;
    }

    const saved: UserAccount = {
      id: editingUser?.id || `user-${Date.now()}`,
      fullName: userFullName.trim(),
      username: userUsername.trim().toLowerCase(),
      password: userPassword.trim() || '123',
      role: userRole,
      branchId: userBranchId,
      phone: userPhone.trim() || undefined,
      email: userEmail.trim() || undefined,
      avatarColor: userAvatarColor,
      isActive: userIsActive,
      lastLogin: editingUser?.lastLogin,
      createdAt: editingUser?.createdAt || new Date().toISOString().split('T')[0],
    };

    let updated: UserAccount[];
    if (editingUser) {
      updated = userList.map((u) => (u.id === editingUser.id ? saved : u));
    } else {
      updated = [...userList, saved];
    }

    setUserList(updated);
    onSaveUsers(updated);
    setShowUserModal(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleToggleUserStatus = (user: UserAccount) => {
    const updated = userList.map((u) =>
      u.id === user.id ? { ...u, isActive: !u.isActive } : u
    );
    setUserList(updated);
    onSaveUsers(updated);
  };

  const handleResetUserPassword = (user: UserAccount) => {
    if (confirm(`Đặt lại mật khẩu cho tài khoản "${user.fullName}" về mặc định "123"?`)) {
      const updated = userList.map((u) =>
        u.id === user.id ? { ...u, password: '123' } : u
      );
      setUserList(updated);
      onSaveUsers(updated);
      alert(`Đã đặt lại mật khẩu cho tài khoản ${user.username} thành "123" thành công!`);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (userList.length <= 1) {
      alert('Không thể xóa tài khoản duy nhất còn lại trong hệ thống!');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản nhân viên này?')) {
      const updated = userList.filter((u) => u.id !== userId);
      setUserList(updated);
      onSaveUsers(updated);
    }
  };

  // Save Club Identity & Branding
  const handleSaveClubIdentity = () => {
    const newConfig: ClubConfig = {
      ...config,
      clubName,
      slogan,
      hotline,
      defaultReminderTemplate: reminderTemplate,
      branches: editedBranches,
    };
    onSaveConfig(newConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Export JSON Backup
  const handleDownloadBackup = () => {
    const jsonStr = StorageService.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_NgoiSaoGiaDinh_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = StorageService.importBackup(content);
        if (success) {
          alert('Đã phục hồi dữ liệu từ file backup thành công!');
          onReloadAllData();
        } else {
          alert('Lỗi: File sao lưu không đúng định dạng JSON.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-700 shadow-xs">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Cài Đặt Hệ Thống & Bảng Giá</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Cấu hình thông tin 2 chi nhánh, tài khoản VietQR, bảng giá học phí và sao lưu dữ liệu.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold animate-in fade-in shadow-xs">
            <Check className="w-4 h-4 text-emerald-600" /> Đã lưu thành công!
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-6 rounded-t-2xl overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveTab('packages')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'packages'
              ? 'border-red-700 text-red-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Bảng Giá & Gói Học Phí ({editedPackages.length})
        </button>
        <button
          onClick={() => setActiveTab('disciplines')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'disciplines'
              ? 'border-red-700 text-red-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          Quản Lý Bộ Môn ({editedDisciplines.length})
        </button>
        <button
          onClick={() => setActiveTab('branches')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'branches'
              ? 'border-red-700 text-red-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Cấu Hình 2 Chi Nhánh & STK VietQR
        </button>
        <button
          onClick={() => setActiveTab('identity')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'identity'
              ? 'border-red-700 text-red-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Logo & Thương Hiệu CLB
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'border-red-700 text-red-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Tài Khoản & Phân Quyền ({userList.length})
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'backup'
              ? 'border-red-700 text-red-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Sao Lưu & Phục Hồi Dữ Liệu
        </button>
      </div>

      {/* TAB 1: PACKAGES */}
      {activeTab === 'packages' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Danh Sách Gói Học Phí Đang Áp Dụng</h3>
              <p className="text-xs text-slate-500">Các gói học theo tháng, quý, năm, gói buổi hoặc kèm riêng PT 1-1.</p>
            </div>
            <button
              onClick={handleOpenAddPkg}
              className="flex items-center gap-1.5 px-4 py-2 bg-linear-to-r from-red-700 to-amber-600 hover:from-red-800 hover:to-amber-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Thêm Gói Học Phí Mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {editedPackages.map((pkg) => {
              const discipline = editedDisciplines.find((d) => d.id === pkg.disciplineId);

              return (
                <div
                  key={pkg.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-red-300 hover:bg-red-50/20 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                        {pkg.type === 'monthly' && 'Theo Tháng'}
                        {pkg.type === 'quarterly' && 'Gói 3 Tháng'}
                        {pkg.type === 'biannual' && 'Gói 6 Tháng'}
                        {pkg.type === 'yearly' && 'Gói 1 Năm VIP'}
                        {pkg.type === 'sessions' && 'Thẻ Buổi Lượt'}
                        {pkg.type === 'pt' && 'Kèm Riêng 1-1 (PT)'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditPkg(pkg)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base mt-2.5">{pkg.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{discipline?.name || 'Võ Thuật'}</p>

                    {pkg.description && (
                      <p className="text-xs text-slate-600 mt-2 bg-white p-2.5 rounded-lg border border-slate-200 italic">
                        {pkg.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500">Đơn giá áp dụng:</span>
                      <p className="text-lg font-black text-red-700 font-mono">
                        {formatVND(pkg.price)}
                      </p>
                    </div>
                    <div className="text-right text-xs text-slate-600 font-semibold">
                      {pkg.sessionCount ? (
                        <span className="font-bold text-emerald-700">{pkg.sessionCount} buổi tập</span>
                      ) : (
                        <span>Thời hạn {pkg.durationMonths} tháng</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: DISCIPLINES MANAGEMENT */}
      {activeTab === 'disciplines' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-lg">Danh Sách Bộ Môn Tập Luyện ({editedDisciplines.length})</h3>
                <span className="px-2.5 py-0.5 text-xs font-bold text-red-800 bg-red-100 rounded-full border border-red-200">
                  Tùy Chỉnh Động
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Thêm, sửa tên, mã viết tắt, màu nhận diện hoặc xóa bộ môn võ thuật / thể thao theo nhu cầu đào tạo của CLB.
              </p>
            </div>

            <button
              onClick={handleOpenAddDiscipline}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-800 hover:to-amber-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-red-700/20"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Bộ Môn Mới</span>
            </button>
          </div>

          {/* Disciplines Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {editedDisciplines.map((disc) => {
              const packageCount = editedPackages.filter((p) => p.disciplineId === disc.id).length;
              const gradientClass = disc.color || 'from-red-600 to-orange-500';

              return (
                <div
                  key={disc.id}
                  className="bg-slate-50/80 hover:bg-white border border-slate-200 hover:border-red-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      {/* ShortCode Badge & Gradient Chip */}
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradientClass} text-white flex items-center justify-center shadow-sm shrink-0`}
                        >
                          {renderDisciplineIcon(disc.iconName || 'Flame', 'w-5 h-5')}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900 text-white shadow-xs">
                              {disc.shortCode}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">ID: {disc.id}</span>
                          </div>
                          <h4 className="font-black text-slate-900 text-base mt-1 group-hover:text-red-700 transition-colors">
                            {disc.name}
                          </h4>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditDiscipline(disc)}
                          className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa bộ môn"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDiscipline(disc.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa bộ môn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white border border-slate-200/80 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Màu nhận diện:</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${gradientClass} shadow-xs`} />
                          <span className="font-semibold text-slate-700 text-[11px]">
                            {COLOR_PRESETS.find((c) => c.id === disc.color)?.name || 'Tùy chỉnh'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Gói học phí áp dụng:</span>
                        <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                          {packageCount} gói học phí
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Áp dụng trên cả 2 chi nhánh</span>
                    <button
                      onClick={() => handleOpenEditDiscipline(disc)}
                      className="font-bold text-red-700 hover:underline cursor-pointer"
                    >
                      Sửa chi tiết &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick add guide */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Mẹo quản lý bộ môn:</span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Khi thêm mới bộ môn (như <em>Jiu-Jitsu / BJJ, Võ Cổ Truyền, Karate, Vovinam, Gym Thể Lực</em>), bộ môn này sẽ ngay lập tức xuất hiện trong danh sách khi tiếp nhận võ sinh mới, tạo lớp học và tạo gói học phí tương ứng.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BRANCH CONFIGURATION */}
      {activeTab === 'branches' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Thông Tin 2 Chi Nhánh & STK Ngân Hàng</h3>
              <p className="text-xs text-slate-500">Dùng để in trên phiếu thu và tự động tạo mã VietQR cho học viên chuyển khoản.</p>
            </div>
            <button
              onClick={handleSaveBranchSettings}
              className="flex items-center gap-1.5 px-4 py-2 bg-linear-to-r from-red-700 to-amber-600 hover:from-red-800 hover:to-amber-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" />
              Lưu Thông Tin Cả 2 Chi Nhánh
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {editedBranches.map((branch, idx) => (
              <div
                key={branch.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs"
              >
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <span className="px-2.5 py-1 bg-red-100 text-red-800 font-bold text-xs rounded-lg border border-red-200">
                    {branch.id === 'cn1' ? 'CƠ SỞ 1' : 'CƠ SỞ 2'}
                  </span>
                  <h4 className="font-bold text-slate-900 text-base">{branch.name || branch.shortName}</h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tên Chi Nhánh (Đầy Đủ)</label>
                    <input
                      type="text"
                      value={branch.name}
                      onChange={(e) => {
                        const next = [...editedBranches];
                        next[idx].name = e.target.value;
                        setEditedBranches(next);
                      }}
                      placeholder="Ví dụ: Cơ Sở 1 - Phan Đăng Lưu"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 font-semibold shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tên Hiển Thị Rút Gọn (Thanh Điều Hướng & Thẻ)</label>
                    <input
                      type="text"
                      value={branch.shortName}
                      onChange={(e) => {
                        const next = [...editedBranches];
                        next[idx].shortName = e.target.value;
                        setEditedBranches(next);
                      }}
                      placeholder="Ví dụ: CS1 (Phan Đăng Lưu)"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 font-semibold shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Địa Chỉ Chi Nhánh</label>
                    <input
                      type="text"
                      value={branch.address}
                      onChange={(e) => {
                        const next = [...editedBranches];
                        next[idx].address = e.target.value;
                        setEditedBranches(next);
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 shadow-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Hotline Liên Hệ</label>
                      <input
                        type="text"
                        value={branch.phone}
                        onChange={(e) => {
                          const next = [...editedBranches];
                          next[idx].phone = e.target.value;
                          setEditedBranches(next);
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 font-mono font-bold shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">HLV Trưởng / Quản Lý</label>
                      <input
                        type="text"
                        value={branch.manager}
                        onChange={(e) => {
                          const next = [...editedBranches];
                          next[idx].manager = e.target.value;
                          setEditedBranches(next);
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Bank info */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 mt-2 shadow-xs">
                    <p className="font-bold text-red-700 text-xs flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" /> Thông Tin Ngân Hàng VietQR ({branch.shortName})
                    </p>

                    <div>
                      <label className="block text-slate-500 text-[11px] mb-0.5 font-medium">Tên Ngân Hàng</label>
                      <input
                        type="text"
                        value={branch.bankName}
                        onChange={(e) => {
                          const next = [...editedBranches];
                          next[idx].bankName = e.target.value;
                          setEditedBranches(next);
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-500 text-[11px] mb-0.5 font-medium">Số Tài Khoản</label>
                        <input
                          type="text"
                          value={branch.bankAccount}
                          onChange={(e) => {
                            const next = [...editedBranches];
                            next[idx].bankAccount = e.target.value;
                            setEditedBranches(next);
                          }}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs text-red-700 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 text-[11px] mb-0.5 font-medium">Mã BIN Ngân Hàng</label>
                        <input
                          type="text"
                          value={branch.bankBin}
                          onChange={(e) => {
                            const next = [...editedBranches];
                            next[idx].bankBin = e.target.value;
                            setEditedBranches(next);
                          }}
                          placeholder="970422 (MB), 970436 (VCB)..."
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-500 text-[11px] mb-0.5 font-medium">Tên Chủ Tài Khoản</label>
                      <input
                        type="text"
                        value={branch.bankOwner}
                        onChange={(e) => {
                          const next = [...editedBranches];
                          next[idx].bankOwner = e.target.value;
                          setEditedBranches(next);
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: IDENTITY & LOGO */}
      {activeTab === 'identity' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Thương Hiệu & Logo CLB Ngôi Sao Gia Định</h3>
              <p className="text-xs text-slate-500">
                Logo chính thức, tên pháp lý và thông tin xuất trên biên lai thu học phí.
              </p>
            </div>
            <button
              onClick={handleSaveClubIdentity}
              className="flex items-center gap-1.5 px-4 py-2 bg-linear-to-r from-red-700 to-amber-600 hover:from-red-800 hover:to-amber-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" />
              Lưu Thông Tin Thương Hiệu
            </button>
          </div>

          {/* Logo Showcase Banner */}
          <div className="bg-linear-to-r from-red-900 via-red-800 to-amber-900 border border-red-950/20 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-md">
            <div className="p-2 bg-white rounded-2xl border border-amber-300 shadow-xl shrink-0">
              <ClubLogo size={110} className="shadow-xs" />
            </div>

            <div className="space-y-2 text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" /> Logo Chính Thức Đã Kích Hoạt
              </div>
              <h4 className="text-xl font-black text-white uppercase tracking-tight">
                CLB NGÔI SAO GIA ĐỊNH
              </h4>
              <p className="text-xs text-red-100">
                Biểu tượng Ngôi Sao Vàng và Găng Đấu Quyền Anh (GSD) được tích hợp tự động vào thanh tiêu đề (Navbar), Phiếu thu học phí in ấn, Thẻ học viên và Mã VietQR chuyển khoản.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 justify-center md:justify-start">
                <a
                  href="/logo.svg"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs px-3 py-1.5 rounded-lg bg-white text-red-900 hover:bg-amber-50 font-bold border border-white/40 transition-colors inline-flex items-center gap-1 shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" /> Mở File Logo Vector (.svg)
                </a>
              </div>
            </div>
          </div>

          {/* Identity Form Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Tên Câu Lạc Bộ (Đầy đủ)</label>
              <input
                type="text"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold shadow-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Hotline Tổng Đài</label>
              <input
                type="text"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold shadow-xs"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-bold text-slate-700">Khẩu Hiệu / Slogan</label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 shadow-xs"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-bold text-slate-700">Mẫu Tin Nhắn Nhắc Học Phí Zalo/SMS Mặc Định</label>
              <textarea
                rows={3}
                value={reminderTemplate}
                onChange={(e) => setReminderTemplate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 text-xs leading-relaxed shadow-xs"
              />
              <p className="text-[11px] text-slate-500">
                Các biến tự động: [HO_TEN], [MA_HV], [CHI_NHANH], [NGAY_HET_HAN], [KY_HAN], [STK], [NGAN_HANG], [CHU_TK]
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Quản Lý Dữ Liệu & Sao Lưu An Toàn</h3>
            <p className="text-xs text-slate-500">
              Xuất toàn bộ cơ sở dữ liệu học viên, phiếu thu, điểm danh và lịch sử thành file JSON để lưu trữ hoặc chuyển đổi thiết bị.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Download Backup */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
                <Download className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Tải File Sao Lưu (Backup JSON)</h4>
              <p className="text-xs text-slate-500">
                Tạo 1 bản lưu đầy đủ học viên, doanh thu, gói học và phiếu thu của 2 cơ sở.
              </p>
              <button
                onClick={handleDownloadBackup}
                className="w-full py-2.5 bg-linear-to-r from-red-700 to-amber-600 hover:from-red-800 hover:to-amber-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
              >
                Tải Xuống File Backup
              </button>
            </div>

            {/* Upload Backup */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Phục Hồi Từ File JSON</h4>
              <p className="text-xs text-slate-500">
                Nhập dữ liệu đã sao lưu trước đó vào hệ thống quản lý.
              </p>
              <label className="block w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs text-center transition-colors cursor-pointer shadow-sm">
                <span>Chọn File Phục Hồi (.json)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Reset Demo Data */}
            <div className="bg-slate-50 border border-red-200 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-700">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Khôi Phục Dữ Liệu Gốc</h4>
              <p className="text-xs text-slate-500">
                Xóa và nạp lại toàn bộ dữ liệu mẫu chuẩn của CLB Ngôi Sao Gia Định.
              </p>
              <button
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn khôi phục về dữ liệu mẫu ban đầu? Toàn bộ thay đổi gần nhất sẽ được làm mới.')) {
                    onResetData();
                  }
                }}
                className="w-full py-2.5 bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 hover:border-red-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
              >
                Làm Mới Dữ Liệu Mẫu
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TAB: USERS & PERMISSIONS */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Danh Sách Tài Khoản & Phân Quyền Nhân Viên</h3>
              <p className="text-xs text-slate-500">
                Quản lý quyền truy cập cho Quản trị viên, Thu ngân 2 chi nhánh và Huấn luyện viên.
              </p>
            </div>
            <button
              onClick={handleOpenAddUser}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-800 hover:to-amber-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              Thêm Tài Khoản Mới
            </button>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Nhân Viên / Họ Tên</th>
                  <th className="py-3.5 px-3">Tên Đăng Nhập</th>
                  <th className="py-3.5 px-3">Vai Trò & Quyền Hạn</th>
                  <th className="py-3.5 px-3">Chi Nhánh Phụ Trách</th>
                  <th className="py-3.5 px-3">Số Điện Thoại / Email</th>
                  <th className="py-3.5 px-3">Trạng Thái</th>
                  <th className="py-3.5 px-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {userList.map((u) => {
                  const roleLabel =
                    u.role === 'admin'
                      ? 'Quản Trị Viên (Full)'
                      : u.role === 'cashier'
                      ? 'Thu Ngân & Lễ Tân'
                      : u.role === 'coach'
                      ? 'Huấn Luyện Viên'
                      : 'Quản Lý';

                  const roleBadge =
                    u.role === 'admin'
                      ? 'bg-red-100 text-red-800 border-red-200'
                      : u.role === 'cashier'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                  const branchName =
                    u.branchId === 'all'
                      ? 'Tất cả 2 Chi Nhánh'
                      : u.branchId === 'cn1'
                      ? 'Cơ Sở 1 (Phan Đăng Lưu)'
                      : 'Cơ Sở 2 (Nguyễn Văn Đậu)';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl ${u.avatarColor || 'bg-blue-600'} text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}>
                            {u.fullName.split(' ').pop()?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{u.fullName}</div>
                            <div className="text-[10px] text-slate-400">Tạo: {u.createdAt || '2025-01-01'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          @{u.username}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${roleBadge}`}>
                          {roleLabel}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-slate-700 flex items-center gap-1 text-[11px]">
                          <Building className="w-3 h-3 text-slate-400 shrink-0" />
                          {branchName}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-slate-700">{u.phone || '—'}</div>
                        {u.email && <div className="text-[10px] text-slate-400">{u.email}</div>}
                      </td>

                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(u)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            u.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                          title="Bấm để khóa / mở khóa tài khoản"
                        >
                          {u.isActive ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          {u.isActive ? 'Đang Hoạt Động' : 'Đã Khóa'}
                        </button>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleResetUserPassword(u)}
                            title="Đặt lại mật khẩu về mặc định (123)"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-amber-50 hover:text-amber-700 text-slate-500 cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditUser(u)}
                            title="Chỉnh sửa thông tin"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 hover:text-slate-900 text-slate-500 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id)}
                            title="Xóa tài khoản"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-700 text-slate-500 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5 text-amber-800 text-xs">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Mẹo Quản Trị:</span> Mật khẩu mặc định sau khi tạo mới hoặc reset là <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300">123</strong>. Nhân viên có thể tự đổi mật khẩu cá nhân bất kỳ lúc nào tại menu góc phải trên thanh điều hướng.
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADD / EDIT PACKAGE */}
      {showPkgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-6">
            
            <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-red-900 via-red-800 to-amber-900 text-white border-b border-red-950/20">
              <h3 className="font-bold text-white text-base">
                {editingPkg ? 'Chỉnh Sửa Gói Học Phí' : 'Thêm Gói Học Phí Mới'}
              </h3>
              <button
                onClick={() => setShowPkgModal(false)}
                className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePackageSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Gói Học Phí <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pkgName}
                  onChange={(e) => setPkgName(e.target.value)}
                  placeholder="Ví dụ: Gói 3 Tháng (Boxing/Kickboxing)"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-red-700 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Loại Gói
                  </label>
                  <select
                    value={pkgType}
                    onChange={(e) => setPkgType(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-red-700 shadow-xs"
                  >
                    <option value="monthly">Theo 1 Tháng</option>
                    <option value="quarterly">Gói 3 Tháng</option>
                    <option value="biannual">Gói 6 Tháng</option>
                    <option value="yearly">Gói 1 Năm VIP</option>
                    <option value="sessions">Thẻ Buổi / Vé Lượt</option>
                    <option value="pt">Kèm Riêng 1-1 (PT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Đơn Giá Học Phí (VNĐ) <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={pkgPrice}
                    onChange={(e) => setPkgPrice(Number(e.target.value))}
                    step={50000}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-mono font-bold focus:ring-2 focus:ring-red-700 shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bộ Môn Áp Dụng
                  </label>
                  <select
                    value={pkgDisciplineId}
                    onChange={(e) => setPkgDisciplineId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-red-700 shadow-xs"
                  >
                    {editedDisciplines.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Áp Dụng Cho Cơ Sở
                  </label>
                  <select
                    value={pkgBranchAvailability}
                    onChange={(e) => setPkgBranchAvailability(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-red-700 shadow-xs"
                  >
                    <option value="all">Tất cả 2 Chi Nhánh</option>
                    <option value="cn1">Chỉ Chi Nhánh 1</option>
                    <option value="cn2">Chỉ Chi Nhánh 2</option>
                  </select>
                </div>
              </div>

              {(pkgType === 'sessions' || pkgType === 'pt') ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số Buổi Tập Được Cộng
                  </label>
                  <input
                    type="number"
                    value={pkgSessions || 10}
                    onChange={(e) => setPkgSessions(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-mono font-bold focus:ring-2 focus:ring-red-700 shadow-xs"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thời Gian Hiệu Lực (Số tháng)
                  </label>
                  <input
                    type="number"
                    value={pkgDuration}
                    onChange={(e) => setPkgDuration(Number(e.target.value))}
                    min={1}
                    max={24}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-mono font-bold focus:ring-2 focus:ring-red-700 shadow-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mô Tả & Quà Tặng Kèm Theo
                </label>
                <textarea
                  value={pkgDesc}
                  onChange={(e) => setPkgDesc(e.target.value)}
                  rows={2}
                  placeholder="Ví dụ: Tặng 1 áo CLB + 1 đôi băng quấn tay chuyên dụng..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:ring-2 focus:ring-red-700 shadow-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPkgModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-300 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-linear-to-r from-red-700 to-amber-600 hover:from-red-800 hover:to-amber-700 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Lưu Gói Học Phí
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL ADD / EDIT USER */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-6">
            
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-900 via-red-800 to-amber-900 text-white border-b border-red-950/20">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  {editingUser ? 'Chỉnh Sửa Tài Khoản Nhân Viên' : 'Thêm Tài Khoản Nhân Viên Mới'}
                </h3>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {userModalError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{userModalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUserSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ Và Tên <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userFullName}
                    onChange={(e) => setUserFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-red-700 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên Đăng Nhập <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userUsername}
                    onChange={(e) => setUserUsername(e.target.value)}
                    placeholder="Ví dụ: tn_cn1, hlv_nam..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-mono font-bold focus:ring-2 focus:ring-red-700 shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mật Khẩu Đăng Nhập
                  </label>
                  <input
                    type="text"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="Mặc định: 123"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-mono font-bold focus:ring-2 focus:ring-red-700 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vai Trò & Quyền Hạn
                  </label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as UserRole)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-red-700 shadow-xs"
                  >
                    <option value="admin">Quản Trị Viên (Toàn Quyền)</option>
                    <option value="cashier">Thu Ngân & Lễ Tân</option>
                    <option value="coach">Huấn Luyện Viên</option>
                    <option value="manager">Quản Lý Cơ Sở</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chi Nhánh Phụ Trách
                  </label>
                  <select
                    value={userBranchId}
                    onChange={(e) => setUserBranchId(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-red-700 shadow-xs"
                  >
                    <option value="all">Cả 2 Chi Nhánh</option>
                    <option value="cn1">Chi Nhánh 1 (Phan Đăng Lưu)</option>
                    <option value="cn2">Chi Nhánh 2 (Nguyễn Văn Đậu)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="0907..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-mono shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Liên Hệ
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="nhanvien@ngoisaogiadinh.vn"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Màu Avatar Đại Diện
                  </label>
                  <select
                    value={userAvatarColor}
                    onChange={(e) => setUserAvatarColor(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium shadow-xs"
                  >
                    <option value="bg-red-600">Đỏ Đậm (Admin)</option>
                    <option value="bg-amber-600">Vàng Cam (Thu Ngân)</option>
                    <option value="bg-blue-600">Xanh Dương (Kế Toán)</option>
                    <option value="bg-emerald-600">Xanh Lá (HLV)</option>
                    <option value="bg-purple-600">Tím (Quản Lý)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 select-none">
                  <input
                    type="checkbox"
                    checked={userIsActive}
                    onChange={(e) => setUserIsActive(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>Tài khoản được phép đăng nhập (Đang Hoạt Động)</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-300 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-800 hover:to-amber-700 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {editingUser ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL ADD / EDIT DISCIPLINE */}
      {showDisciplineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-900 via-red-800 to-amber-900 text-white border-b border-red-950/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <Swords className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {editingDiscipline ? 'Chỉnh Sửa Bộ Môn' : 'Thêm Bộ Môn Mới'}
                  </h3>
                  <p className="text-[11px] text-red-200">
                    Cấu hình tên, mã viết tắt, màu chủ đạo và biểu tượng nhận diện
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDisciplineModal(false)}
                className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDisciplineSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {discModalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{discModalError}</span>
                </div>
              )}

              {/* Name & ShortCode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên Bộ Môn <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={discName}
                    onChange={(e) => setDiscName(e.target.value)}
                    placeholder="Ví dụ: Jiu-Jitsu / BJJ, Võ Cổ Truyền, MMA..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-red-700 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã Viết Tắt <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={discShortCode}
                    onChange={(e) => setDiscShortCode(e.target.value.toUpperCase())}
                    placeholder="BJJ, MMA, KB..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-mono font-black uppercase focus:ring-2 focus:ring-red-700 shadow-xs"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Xem trước hiển thị thực tế:
                </span>
                <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${discColor} text-white flex items-center justify-center shadow-sm shrink-0`}
                  >
                    {renderDisciplineIcon(discIconName, 'w-6 h-6')}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900 text-white">
                        {discShortCode || 'CODE'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">Bộ môn thi đấu & tập luyện</span>
                    </div>
                    <div className="font-black text-slate-900 text-base mt-0.5">
                      {discName || 'Tên Bộ Môn Mới'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Gradient Presets */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Chọn Màu Gradient Nhận Diện Chủ Đạo
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {COLOR_PRESETS.map((color) => {
                    const isSelected = discColor === color.id;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setDiscColor(color.id)}
                        className={`p-2 rounded-xl border text-left transition-all flex flex-col items-start gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'border-red-600 ring-2 ring-red-600/30 bg-red-50/40'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="w-full flex items-center justify-between">
                          <div className={`w-6 h-6 rounded-lg ${color.preview} shadow-xs shrink-0`} />
                          {isSelected && <Check className="w-3.5 h-3.5 text-red-600" />}
                        </div>
                        <span className="text-[10px] font-bold text-slate-800 leading-tight">
                          {color.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Icon Presets */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Chọn Biểu Tượng Nhận Diện
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {ICON_PRESETS.map((item) => {
                    const isSelected = discIconName === item.id;
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setDiscIconName(item.id)}
                        className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-red-600 bg-red-50 text-red-700 font-bold ring-2 ring-red-600/30'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                        <span className="text-[10px] leading-tight line-clamp-1">{item.label.split('(')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDisciplineModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-300 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-800 hover:to-amber-700 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {editingDiscipline ? 'Lưu Thay Đổi Bộ Môn' : 'Thêm Bộ Môn Ngay'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
