import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, Department } from '../types';
import { 
  Users, UserPlus, Key, Trash2, Shield, Lock, User, 
  CheckCircle, AlertCircle, Eye, EyeOff, Edit, Plus, Hospital, Save, Settings,
  Camera, Image, X
} from 'lucide-react';

interface UserManagementProps {
  currentUser: UserProfile;
  users: UserProfile[];
  onAddUser: (user: UserProfile) => Promise<void>;
  onUpdateUser: (user: UserProfile) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  onToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  departments: Department[];
  onAddDepartment: (name: string) => Promise<void>;
  onUpdateDepartment: (dept: Department) => Promise<void>;
  onDeleteDepartment: (id: string) => Promise<void>;
}

const PRESET_AVATARS = [
  { id: 'doc-m1', name: 'Bác sĩ Nam 1', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=120' },
  { id: 'doc-f1', name: 'Bác sĩ Nữ 1', url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=120' },
  { id: 'nurse-f1', name: 'Điều dưỡng Nữ', url: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=120' },
  { id: 'doc-m2', name: 'Bác sĩ Nam 2', url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=120' },
  { id: 'nurse-f2', name: 'Điều dưỡng Lâm Sàng', url: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=120' },
  { id: 'tech-m1', name: 'Kỹ thuật viên', url: 'https://images.unsplash.com/photo-1631217818202-90f4e77aa6ad?auto=format&fit=crop&q=80&w=120' },
];

const shrinkImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 120;
        const MAX_HEIGHT = 120;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export default function UserManagement({
  currentUser,
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onToast,
  departments,
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment
}: UserManagementProps) {
  // Tabs
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'change-password' | 'departments'>('list');
  
  // Create User Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('123');
  const [newRole, setNewRole] = useState<UserRole>('User');
  const [newDept, setNewDept] = useState('');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Department administration inline editing states
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editDeptName, setEditDeptName] = useState('');

  // Allowed departments inline editing states
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserDept, setEditUserDept] = useState<string>('');
  const [editUserAllowedDepts, setEditUserAllowedDepts] = useState<string[]>([]);

  // Avatar Editing States
  const [editingAvatarUserId, setEditingAvatarUserId] = useState<string | null>(null);
  const [avatarUrlInput, setAvatarUrlInput] = useState<string>('');
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  // Synchronize newDept when departments load
  useEffect(() => {
    if (departments.length > 0 && !newDept) {
      setNewDept(departments[0].name);
    }
  }, [departments, newDept]);

  // Self Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPasswordSelf, setNewPasswordSelf] = useState('');
  const [confirmPasswordSelf, setConfirmPasswordSelf] = useState('');
  const [isChangingSelf, setIsChangingSelf] = useState(false);

  // Admin changing other user's password state
  const [selectedUserForPass, setSelectedUserForPass] = useState<string>('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [isChangingAdmin, setIsChangingAdmin] = useState(false);

  // Toggle reveal passwords
  const [showPassMap, setShowPassMap] = useState<Record<string, boolean>>({});

  const togglePassReveal = (userId: string) => {
    setShowPassMap(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUsername.trim() || !newPassword.trim()) {
      onToast('Vui lòng điền đầy đủ các trường thông tin!', 'error');
      return;
    }

    const normUsername = newUsername.trim().toLowerCase();

    // Check duplicate
    if (users.some(u => u.username?.toLowerCase() === normUsername)) {
      onToast('Tên đăng nhập này đã tồn tại trong hệ thống!', 'error');
      return;
    }

    setIsSubmittingNew(true);
    try {
      const newUser: UserProfile = {
        id: `U-${Date.now()}`,
        name: newName.trim(),
        username: normUsername,
        email: `${normUsername}@bvbaothang.org`,
        role: newRole,
        department: newRole === 'Admin' ? 'Tất cả các khoa' : newDept,
        password: newPassword,
        avatarUrl: newRole === 'Admin' 
          ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=120'
          : newRole === 'Technician'
            ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=120'
            : 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=120'
      };

      await onAddUser(newUser);
      onToast(`Đã đăng ký tài khoản thành công cho ${newUser.name}!`, 'success');
      
      // Reset form
      setNewName('');
      setNewUsername('');
      setNewPassword('123');
      setShowAddForm(false);
    } catch (err) {
      onToast('Lỗi khi đăng ký tài khoản lên Firestore', 'error');
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const handleSelfPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordSelf) {
      onToast('Mật khẩu mới không được để trống!', 'error');
      return;
    }
    if (newPasswordSelf !== confirmPasswordSelf) {
      onToast('Mật khẩu xác nhận không trùng khớp!', 'error');
      return;
    }

    setIsChangingSelf(true);
    try {
      const updatedUser: UserProfile = {
        ...currentUser,
        password: newPasswordSelf
      };
      await onUpdateUser(updatedUser);
      onToast('Đã đổi mật khẩu của bạn thành công!', 'success');
      
      setOldPassword('');
      setNewPasswordSelf('');
      setConfirmPasswordSelf('');
    } catch (err) {
      onToast('Lỗi hệ thống khi cập nhật mật khẩu.', 'error');
    } finally {
      setIsChangingSelf(false);
    }
  };

  const handleAdminChangeUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPass) {
      onToast('Vui lòng chọn người dùng cần đổi mật khẩu!', 'error');
      return;
    }
    if (!adminNewPassword) {
      onToast('Vui lòng nhập mật khẩu mới!', 'error');
      return;
    }

    const targetUser = users.find(u => u.id === selectedUserForPass);
    if (!targetUser) return;

    setIsChangingAdmin(true);
    try {
      const updatedUser: UserProfile = {
        ...targetUser,
        password: adminNewPassword
      };
      await onUpdateUser(updatedUser);
      onToast(`Đã thay đổi mật khẩu cho tài khoản "${targetUser.name}" thành công!`, 'success');
      
      setAdminNewPassword('');
      setSelectedUserForPass('');
    } catch (err) {
      onToast('Lỗi khi cập nhật mật khẩu người dùng.', 'error');
    } finally {
      setIsChangingAdmin(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (userId === currentUser.id) {
      onToast('Bạn không thể xóa tài khoản chính mình đang đăng nhập!', 'error');
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của "${userName}"?`)) {
      try {
        await onDeleteUser(userId);
        onToast(`Đã xóa tài khoản ${userName} thành công.`, 'info');
      } catch (err) {
        onToast('Lỗi khi xóa tài khoản khỏi Firestore.', 'error');
      }
    }
  };

  const isAdmin = currentUser.role === 'Admin';

  return (
    <div className="space-y-6">
      
      {/* Tab Selectors */}
      <div className="flex gap-2 border-b border-slate-100 pb-px">
        <button
          type="button"
          id="btn-subtab-user-list"
          onClick={() => setActiveSubTab('list')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'list' 
              ? 'border-indigo-600 text-indigo-600 font-extrabold' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={15} />
          {isAdmin ? 'Quản lý Người sử dụng & Đăng ký' : 'Danh sách Người sử dụng'}
        </button>
        <button
          type="button"
          id="btn-subtab-change-pass"
          onClick={() => setActiveSubTab('change-password')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'change-password' 
              ? 'border-indigo-600 text-indigo-600 font-extrabold' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Key size={15} />
          Đổi mật khẩu
        </button>
        {isAdmin && (
          <button
            type="button"
            id="btn-subtab-departments"
            onClick={() => setActiveSubTab('departments')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'departments' 
                ? 'border-indigo-600 text-indigo-600 font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Hospital size={15} />
            Quản lý Khoa Lâm Sàng
          </button>
        )}
      </div>

      {/* SUB-TAB 1: USER LIST & ADMIN REGISTRATION */}
      {activeSubTab === 'list' && (
        <div className="space-y-4">
          
          {/* Header summary & admin quick action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Thành viên và phân quyền nội bộ</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tổng cộng {users.length} tài khoản nhân sự thuộc các khoa phòng Bệnh viện Đa khoa Bảo Thắng.
              </p>
            </div>
            
            {isAdmin && (
              <button
                type="button"
                id="btn-trigger-add-user"
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-3.5 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer self-start sm:self-center"
              >
                {showAddForm ? 'Đóng form' : 'Đăng ký tài khoản mới'}
                <UserPlus size={15} />
              </button>
            )}
          </div>

          {/* ADD NEW USER FORM (Admin only) */}
          {isAdmin && showAddForm && (
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-inner max-w-2xl animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                <UserPlus className="text-indigo-600" size={18} />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Form đăng ký tài khoản cho cán bộ / nhân sự mới</h4>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                      Họ và Tên Cán bộ
                    </label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Ví dụ: ĐD Nguyễn Văn Hải"
                      className="w-full bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                      Tên đăng nhập (Username)
                    </label>
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Ví dụ: hai_nurse (viết liền không dấu)"
                      className="w-full bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                      Mật khẩu khởi tạo
                    </label>
                    <input
                      type="text"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mặc định: 123"
                      className="w-full bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                      Vai trò phân quyền
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                      className="w-full bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none"
                    >
                      <option value="User">Điều dưỡng viên (User)</option>
                      <option value="Technician">Kỹ thuật viên (Technician)</option>
                      <option value="Admin">Quản trị viên (Admin)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                      Khoa trực thuộc
                    </label>
                    <select
                      disabled={newRole === 'Admin'}
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none disabled:bg-slate-200"
                    >
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold text-slate-600 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingNew}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    {isSubmittingNew ? 'Đang lưu...' : 'Thêm mới cán bộ'}
                    <Plus size={14} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* USER LIST CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map(user => {
              const showPass = showPassMap[user.id] || false;
              const isUserSelf = user.id === currentUser.id;
              
              return (
                <div 
                  key={user.id} 
                  className={`bg-white p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                    isUserSelf ? 'border-indigo-400 ring-1 ring-indigo-100 shadow-sm' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* User Avatar */}
                    <div className="relative group shrink-0">
                      <img
                        src={user.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=120'}
                        alt={user.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-150 shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                      {(isAdmin || isUserSelf) && (
                        <button
                          type="button"
                          onClick={() => {
                            if (editingAvatarUserId === user.id) {
                              setEditingAvatarUserId(null);
                            } else {
                              setEditingAvatarUserId(user.id);
                              setAvatarUrlInput(user.avatarUrl || '');
                            }
                          }}
                          className="absolute -bottom-1 -right-1 bg-indigo-600 hover:bg-indigo-700 text-white p-1 rounded-lg shadow-sm border border-white cursor-pointer transition-colors"
                          title="Thay đổi ảnh đại diện"
                        >
                          <Camera size={11} />
                        </button>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-extrabold text-slate-800 truncate" title={user.name}>
                          {user.name}
                        </h4>
                        {isUserSelf && (
                          <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded uppercase">Bạn</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          user.role === 'Admin' ? 'bg-indigo-50 text-indigo-700' :
                          user.role === 'Technician' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {user.role === 'Admin' ? 'Admin' : user.role === 'Technician' ? 'Kỹ thuật viên' : 'Điều dưỡng'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">•</span>
                        <span className="text-[10px] text-slate-500 font-semibold truncate">
                          {user.department || 'Cơ sở Bảo Thắng'}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-500 font-bold pt-1.5 border-t border-slate-50">
                        Quyền xem/sử dụng: {' '}
                        {user.allowedDepartments && user.allowedDepartments.length > 0 ? (
                          user.allowedDepartments.includes('Tất cả các khoa') ? (
                            <span className="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">Tất cả các khoa</span>
                          ) : (
                            <span className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[200px] inline-block align-middle font-medium">
                              {user.allowedDepartments.join(', ')}
                            </span>
                          )
                        ) : (
                          <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">{user.department || 'Không có'}</span>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-400 font-medium font-mono space-y-0.5 pt-1.5">
                        <div>Tài khoản: <span className="font-bold text-slate-600">{user.username || 'N/A'}</span></div>
                        <div>Email: <span className="text-slate-500">{user.email}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Avatar Edit Form */}
                  {editingAvatarUserId === user.id && (
                    <div className="bg-indigo-50/40 p-3.5 rounded-xl border border-indigo-100 space-y-3.5 text-left animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between border-b border-indigo-100 pb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Image size={13} className="text-indigo-600 animate-pulse" />
                          <h5 className="text-[10px] font-extrabold uppercase text-indigo-800 tracking-wider">Cấu hình ảnh đại diện</h5>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingAvatarUserId(null)}
                          className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>

                      {/* Presets List */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-500 font-bold block">1. Chọn từ ảnh mẫu ngành y:</span>
                        <div className="grid grid-cols-6 gap-1.5">
                          {PRESET_AVATARS.map(preset => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => {
                                setAvatarUrlInput(preset.url);
                              }}
                              className={`relative rounded-lg overflow-hidden border-2 aspect-square cursor-pointer transition-all ${
                                avatarUrlInput === preset.url 
                                  ? 'border-indigo-600 ring-2 ring-indigo-150 scale-105 shadow-xs' 
                                  : 'border-slate-200 hover:border-slate-400'
                              }`}
                              title={preset.name}
                            >
                              <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              {avatarUrlInput === preset.url && (
                                <div className="absolute inset-0 bg-indigo-600/25 flex items-center justify-center">
                                  <CheckCircle size={12} className="text-white fill-indigo-600" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* File Upload (Base64) */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-500 font-bold block">2. Tải ảnh từ thiết bị của bạn:</span>
                        <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-dashed border-slate-300 rounded-lg text-[10px] font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-500 cursor-pointer transition-colors shadow-xs">
                          <Camera size={12} className="text-slate-400" />
                          <span>Chọn tệp ảnh từ máy tính / điện thoại</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  onToast('Đang nén và tối ưu hóa ảnh...', 'info');
                                  const base64Str = await shrinkImage(file);
                                  setAvatarUrlInput(base64Str);
                                  onToast('Đã xử lý ảnh thành công!', 'success');
                                } catch (err) {
                                  onToast('Không thể xử lý ảnh này, vui lòng thử lại.', 'error');
                                }
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* Raw URL Input */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-500 font-bold block">3. Hoặc liên kết ảnh trực tiếp:</span>
                        <input
                          type="url"
                          value={avatarUrlInput}
                          onChange={(e) => setAvatarUrlInput(e.target.value)}
                          placeholder="https://example.com/avatar.png"
                          className="w-full bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-lg py-1 px-2 text-[10px] text-slate-700 font-mono focus:outline-none"
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-1.5 justify-end pt-1.5 border-t border-indigo-100">
                        {user.avatarUrl && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm('Bạn có chắc muốn xóa ảnh đại diện này để dùng mặc định?')) {
                                setIsSavingAvatar(true);
                                try {
                                  const updatedUser: UserProfile = {
                                    ...user,
                                    avatarUrl: ''
                                  };
                                  await onUpdateUser(updatedUser);
                                  onToast('Đã xóa ảnh đại diện thành công.', 'info');
                                  setEditingAvatarUserId(null);
                                } catch (err) {
                                  onToast('Lỗi khi xóa ảnh đại diện.', 'error');
                                } finally {
                                  setIsSavingAvatar(false);
                                }
                              }
                            }}
                            className="mr-auto px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[10px] cursor-pointer transition-colors"
                          >
                            Xóa ảnh
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditingAvatarUserId(null)}
                          className="px-2.5 py-1.5 bg-slate-150 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-[10px] cursor-pointer transition-colors"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          disabled={isSavingAvatar}
                          onClick={async () => {
                            setIsSavingAvatar(true);
                            try {
                              const updatedUser: UserProfile = {
                                ...user,
                                avatarUrl: avatarUrlInput.trim()
                              };
                              await onUpdateUser(updatedUser);
                              onToast('Đã cập nhật ảnh đại diện mới thành công!', 'success');
                              setEditingAvatarUserId(null);
                            } catch (err) {
                              onToast('Lỗi khi lưu ảnh đại diện.', 'error');
                            } finally {
                              setIsSavingAvatar(false);
                            }
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] cursor-pointer transition-colors flex items-center gap-1 shadow-xs"
                        >
                          {isSavingAvatar ? 'Đang lưu...' : 'Lưu thay đổi'}
                          <CheckCircle size={10} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Password viewer & admin controls */}
                  <div className="bg-slate-50 p-2.5 rounded-xl flex flex-col gap-2.5 border border-slate-100">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <Lock size={13} className="text-slate-400" />
                        <span className="text-slate-500 font-medium">Mật khẩu:</span>
                        <span className="font-mono font-bold text-slate-700">
                          {showPass ? (user.password || '123') : '••••••••'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Show/Hide password toggle */}
                        <button
                          type="button"
                          onClick={() => togglePassReveal(user.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200/50 transition-colors cursor-pointer"
                          title={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>

                        {/* Admin edit permissions */}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              if (editingUserId === user.id) {
                                setEditingUserId(null);
                              } else {
                                setEditingUserId(user.id);
                                setEditUserDept(user.department || 'Tất cả các khoa');
                                setEditUserAllowedDepts(user.allowedDepartments || (user.department ? [user.department] : []));
                              }
                            }}
                            className={`p-1.5 rounded transition-colors cursor-pointer ${
                              editingUserId === user.id 
                                ? 'text-indigo-600 bg-indigo-50' 
                                : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                            }`}
                            title="Chỉnh sửa phân quyền khoa phòng"
                          >
                            <Settings size={14} />
                          </button>
                        )}

                        {/* Admin delete account */}
                        {isAdmin && !isUserSelf && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Xóa tài khoản vĩnh viễn"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline Permissions Editor */}
                    {editingUserId === user.id && (
                      <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-3.5 text-xs text-left animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-1.5 border-b border-slate-150 pb-1.5">
                          <Shield size={14} className="text-indigo-600 animate-pulse" />
                          <h5 className="text-[10px] font-extrabold uppercase text-slate-700 tracking-wider">Cấu hình khoa cho {user.name}</h5>
                        </div>
                        
                        {/* Primary Department */}
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Khoa trực thuộc chính</label>
                          <select
                            value={editUserDept}
                            onChange={(e) => setEditUserDept(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800"
                          >
                            <option value="Tất cả các khoa">Tất cả các khoa</option>
                            {departments.map(d => (
                              <option key={d.id} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Allowed Departments Checklist */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Khoa được quyền xem & sử dụng thiết bị
                          </label>
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                            {/* Option All */}
                            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 text-[11px]">
                              <input
                                type="checkbox"
                                checked={editUserAllowedDepts.includes('Tất cả các khoa')}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditUserAllowedDepts(['Tất cả các khoa']);
                                  } else {
                                    setEditUserAllowedDepts(editUserDept && editUserDept !== 'Tất cả các khoa' ? [editUserDept] : []);
                                  }
                                }}
                                className="accent-indigo-600 rounded"
                              />
                              <span>Cho phép xem tất cả các khoa</span>
                            </label>
                            
                            <div className="border-t border-slate-200 my-1"></div>
                            
                            {departments.map(d => {
                              const isChecked = editUserAllowedDepts.includes(d.name) || editUserAllowedDepts.includes('Tất cả các khoa');
                              const isDisabled = editUserAllowedDepts.includes('Tất cả các khoa');
                              return (
                                <label key={d.id} className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900 text-[11px]">
                                  <input
                                    type="checkbox"
                                    disabled={isDisabled}
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setEditUserAllowedDepts(prev => [...prev.filter(item => item !== 'Tất cả các khoa'), d.name]);
                                      } else {
                                        setEditUserAllowedDepts(prev => prev.filter(item => item !== d.name));
                                      }
                                    }}
                                    className="accent-indigo-600 rounded disabled:opacity-50"
                                  />
                                  <span className={isDisabled ? 'text-slate-400 font-medium' : 'font-medium'}>{d.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-150">
                          <button
                            type="button"
                            onClick={() => setEditingUserId(null)}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold text-slate-600 transition-colors"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const updatedUser: UserProfile = {
                                  ...user,
                                  department: editUserDept,
                                  allowedDepartments: editUserAllowedDepts
                                };
                                await onUpdateUser(updatedUser);
                                onToast(`Đã thiết lập quyền hạn thành công cho cán bộ "${user.name}"!`, 'success');
                                setEditingUserId(null);
                              } catch (err) {
                                onToast('Gặp lỗi khi lưu phân quyền cán bộ.', 'error');
                              }
                            }}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                          >
                            <Save size={13} />
                            Lưu cấu hình
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* SUB-TAB 2: PASSWORD CHANGE PANEL */}
      {activeSubTab === 'change-password' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Box 1: Change my own password */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Key className="text-indigo-600" size={18} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Đổi mật khẩu tài khoản của bạn</h3>
            </div>

            <form onSubmit={handleSelfPasswordChange} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                  Tài khoản hiện tại
                </label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold font-mono">
                  {currentUser.username} ({currentUser.name})
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  value={newPasswordSelf}
                  onChange={(e) => setNewPasswordSelf(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-lg py-2.5 px-3 text-xs text-slate-800 transition-all focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  value={confirmPasswordSelf}
                  onChange={(e) => setConfirmPasswordSelf(e.target.value)}
                  placeholder="Xác nhận lại mật khẩu mới"
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-lg py-2.5 px-3 text-xs text-slate-800 transition-all focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingSelf}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                Xác nhận đổi mật khẩu chính mình
              </button>
            </form>
          </div>

          {/* Box 2: Admin password editor for OTHER users */}
          {isAdmin ? (
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Shield className="text-amber-600" size={18} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700">Quyền quản trị viên: Thiết lập mật khẩu cán bộ</h3>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex gap-2.5 text-[11px] text-amber-800 leading-relaxed">
                <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Quyền tối cao:</strong> Với vai trò <strong>Quản trị viên</strong>, bạn có quyền thay đổi mật khẩu của chính bạn và bất kỳ người sử dụng nào trong viện mà không cần nhập lại mật khẩu cũ.
                </p>
              </div>

              <form onSubmit={handleAdminChangeUserPassword} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                    Chọn tài khoản cán bộ cần thay đổi
                  </label>
                  <select
                    value={selectedUserForPass}
                    onChange={(e) => setSelectedUserForPass(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-lg py-2.5 px-3 text-xs text-slate-800 transition-all focus:outline-none font-medium"
                  >
                    <option value="">-- Click để chọn tài khoản nhân sự --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.username} - {u.role === 'Admin' ? 'Quản trị' : u.role === 'Technician' ? 'Kỹ thuật' : u.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                    Mật khẩu mới thay thế
                  </label>
                  <input
                    type="text"
                    required
                    value={adminNewPassword}
                    onChange={(e) => setAdminNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới gán cho tài khoản trên"
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-lg py-2.5 px-3 text-xs text-slate-800 transition-all focus:outline-none font-mono font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingAdmin}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  Ghi đè mật khẩu mới của cán bộ
                </button>
              </form>
            </div>
          ) : (
            <div className="lg:col-span-6 bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
              <Shield className="text-slate-300 mb-2" size={36} />
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phân khu quản lý bị ẩn</h4>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1 leading-relaxed">
                Chỉ tài khoản Admin (Quản trị viên) mới có quyền truy cập bảng quản trị đè mật khẩu của nhân viên các Khoa lâm sàng khác.
              </p>
            </div>
          )}

        </div>
      )}

      {/* SUB-TAB 3: DEPARTMENTS MANAGEMENT PANEL (Admin only) */}
      {isAdmin && activeSubTab === 'departments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 font-sans tracking-tight">Danh mục Khoa Phòng Lâm Sàng</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Quản lý, thêm, sửa đổi, hoặc xóa bỏ danh xưng các khoa lâm sàng trong Bệnh viện Đa khoa Bảo Thắng.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Column 1: Add Department */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 space-y-4 h-fit">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Plus className="text-indigo-600" size={18} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Thêm khoa mới</h3>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const inputElement = document.getElementById('new-dept-name-input') as HTMLInputElement;
                const inputVal = inputElement?.value || '';
                if (!inputVal.trim()) {
                  onToast('Tên khoa không được bỏ trống!', 'error');
                  return;
                }
                if (departments.some(d => d.name.toLowerCase() === inputVal.trim().toLowerCase())) {
                  onToast('Khoa này đã tồn tại trong danh mục!', 'error');
                  return;
                }
                try {
                  await onAddDepartment(inputVal.trim());
                  if (inputElement) inputElement.value = '';
                } catch (err) {
                  onToast('Lỗi hệ thống khi thêm khoa mới.', 'error');
                }
              }} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                    Tên khoa mới cần gán
                  </label>
                  <input
                    id="new-dept-name-input"
                    type="text"
                    required
                    placeholder="Ví dụ: Khoa Cấp Cứu Ngoại"
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-lg py-2.5 px-3 text-xs text-slate-800 transition-all focus:outline-none"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={15} />
                  Thêm mới Khoa phòng
                </button>
              </form>
            </div>

            {/* Column 2: Department List with Inline Edit */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Hospital className="text-indigo-600" size={18} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Danh sách khoa phòng & Tương tác</h3>
              </div>

              <div className="space-y-2">
                {departments.map(dept => {
                  const isEditing = editingDeptId === dept.id;
                  return (
                    <div 
                      key={dept.id}
                      className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-150 rounded-xl transition-all"
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            type="text"
                            value={editDeptName}
                            onChange={(e) => setEditDeptName(e.target.value)}
                            className="flex-1 bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              if (!editDeptName.trim()) {
                                onToast('Tên khoa không được trống!', 'error');
                                return;
                              }
                              try {
                                await onUpdateDepartment({ id: dept.id, name: editDeptName.trim() });
                                setEditingDeptId(null);
                              } catch (err) {
                                onToast('Gặp lỗi khi lưu tên khoa mới.', 'error');
                              }
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Lưu
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingDeptId(null)}
                            className="bg-slate-300 hover:bg-slate-400 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                            <span className="text-xs font-bold text-slate-800">{dept.name}</span>
                            <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-200/50 px-1.5 py-0.5 rounded tracking-wider">
                              {dept.id}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDeptId(dept.id);
                                setEditDeptName(dept.name);
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-indigo-50 transition-colors cursor-pointer"
                              title="Sửa tên khoa"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (window.confirm(`Bạn có chắc chắn muốn xóa khoa "${dept.name}" khỏi hệ thống?`)) {
                                  try {
                                    await onDeleteDepartment(dept.id);
                                  } catch (err) {
                                    onToast('Gặp lỗi khi xóa khoa.', 'error');
                                  }
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Xóa khoa"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
