import React, { useState } from 'react';
import { UserAccount } from '../types';
import { Lock, KeyRound, Check, X, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface ChangePasswordModalProps {
  user: UserAccount;
  onClose: () => void;
  onSave: (updatedUser: UserAccount) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  user,
  onClose,
  onSave,
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const currentPass = user.password || '123';
    if (oldPassword !== currentPass) {
      setError('Mật khẩu hiện tại không chính xác!');
      return;
    }

    if (!newPassword || newPassword.length < 3) {
      setError('Mật khẩu mới phải có tối thiểu 3 ký tự!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    const updatedUser: UserAccount = {
      ...user,
      password: newPassword,
    };

    onSave(updatedUser);
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Đổi Mật Khẩu
              </h3>
              <p className="text-xs text-slate-500">Tài khoản: {user.fullName} (@{user.username})</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Đổi Mật Khẩu Thành Công!</h4>
            <p className="text-xs text-slate-500">Mật khẩu mới đã được cập nhật an toàn.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Mật Khẩu Hiện Tại
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Mật Khẩu Mới
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Xác Nhận Mật Khẩu Mới
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
              >
                {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</span>
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Lưu Mật Khẩu
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
