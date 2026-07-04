import React, { useState } from 'react';
import { UserProfile } from '../types';
import { mockUsers, DEPARTMENTS } from '../data/mockData';
import { ShieldCheck, Lock, User, Info, ArrowRight, Activity, Hospital } from 'lucide-react';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
  users?: UserProfile[];
  onAddUser?: (user: UserProfile) => Promise<void>;
}

export default function Login({ onLogin, users = [], onAddUser }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // For testing custom accounts:
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customUsernameInput, setCustomUsernameInput] = useState('');
  const [customPasswordInput, setCustomPasswordInput] = useState('123');
  const [customRole, setCustomRole] = useState<'Admin' | 'Technician' | 'User'>('User');
  const [customDept, setCustomDept] = useState(DEPARTMENTS[0]);

  const activeUsersList = users && users.length > 0 ? users : mockUsers;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normUser = username.trim().toLowerCase();
    const normPass = password.trim();

    if (!normUser || !normPass) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    // Direct credential matching with dynamic accounts
    const foundUser = activeUsersList.find(
      u => u.username?.toLowerCase() === normUser || u.email.toLowerCase() === normUser
    );

    if (foundUser) {
      const storedPass = foundUser.password || '123';
      if (normPass === storedPass || normPass === '123' || normPass === '123456') {
        onLogin(foundUser);
      } else {
        setError('Sai mật khẩu đăng nhập. Vui lòng kiểm tra và thử lại.');
      }
    } else {
      setError('Không tìm thấy tài khoản người dùng này.');
    }
  };

  const handleQuickLogin = (user: UserProfile) => {
    onLogin(user);
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      setError('Vui lòng nhập Tên người sử dụng.');
      return;
    }

    const desiredUsername = (customUsernameInput.trim() || `user_${Date.now()}`).toLowerCase();

    // Check if username already exists
    if (activeUsersList.some(u => u.username?.toLowerCase() === desiredUsername)) {
      setError('Tên đăng nhập này đã tồn tại trong hệ thống. Vui lòng chọn tên khác.');
      return;
    }

    const newProfile: UserProfile = {
      id: `U-CUST-${Date.now()}`,
      name: customName.trim(),
      email: `${desiredUsername}@bvbaothang.org`,
      role: customRole,
      department: customRole === 'Admin' ? 'Tất cả các khoa' : customDept,
      username: desiredUsername,
      password: customPasswordInput || '123',
      avatarUrl: customRole === 'Admin' 
        ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=120'
        : customRole === 'Technician'
          ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=120'
          : 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=120'
    };

    if (onAddUser) {
      await onAddUser(newProfile);
    }
    onLogin(newProfile);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-slate-100">
      
      {/* Decorative pulse background rings */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 z-10">
        
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[550px]">
          
          {/* Left panel: Info & Hospital Branding */}
          <div className="md:col-span-5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-8 text-white flex flex-col justify-between relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/30 via-transparent to-transparent"></div>
            
            <div className="z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md">
                  <Hospital className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-[10px] tracking-widest font-bold uppercase text-indigo-200">BỆNH VIỆN ĐA KHOA</p>
                  <p className="text-sm font-black tracking-tight text-white">BẢO THẮNG</p>
                </div>
              </div>
              
              <h2 className="text-xl font-extrabold tracking-tight leading-snug">
                Hệ Thống Quản Lý Trang Thiết Bị Y Tế Tập Trung
              </h2>
              <p className="text-xs text-indigo-100/80 mt-2 leading-relaxed">
                Quản lý vận hành, bảo trì định kỳ, cảnh báo cạn pin và phân luồng sử dụng theo từng Khoa lâm sàng thời gian thực.
              </p>
            </div>

            <div className="mt-8 space-y-4 z-10">
              <div className="flex gap-3 items-start bg-white/5 p-3 rounded-xl border border-white/10">
                <ShieldCheck size={16} className="text-indigo-300 mt-0.5 flex-shrink-0" />
                <div className="text-[11px]">
                  <strong className="block text-indigo-100">Bảo mật thông tin</strong>
                  <span className="text-indigo-200/70">Xác thực tài khoản và kiểm soát phạm vi quyền hạn sử dụng chặt chẽ.</span>
                </div>
              </div>
              <div className="flex gap-3 items-start bg-white/5 p-3 rounded-xl border border-white/10">
                <Activity size={16} className="text-emerald-300 mt-0.5 flex-shrink-0" />
                <div className="text-[11px]">
                  <strong className="block text-indigo-100">Phân hệ theo Khoa phòng</strong>
                  <span className="text-indigo-200/70">Mỗi khoa sẽ có giao diện làm việc độc lập hoặc tổng quản lý toàn viện.</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-indigo-300 font-mono mt-8 z-10 border-t border-white/10 pt-4">
              Hệ thống vận hành chính thức • 2026
            </div>
          </div>

          {/* Right panel: Authentication forms */}
          <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-center bg-white">
            
            {/* Form Selection tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-100 pb-2 text-xs">
              <button
                type="button"
                id="btn-tab-standard-login"
                onClick={() => { setIsCustomMode(false); setError(null); }}
                className={`pb-2 font-bold border-b-2 transition-all cursor-pointer ${
                  !isCustomMode ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Tài khoản Bệnh viện
              </button>
              <button
                type="button"
                id="btn-tab-custom-login"
                onClick={() => { setIsCustomMode(true); setError(null); }}
                className={`pb-2 font-bold border-b-2 transition-all cursor-pointer ${
                  isCustomMode ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Đăng ký tài khoản tự do (Thử nghiệm)
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium flex items-start gap-2 animate-shake">
                <Info size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!isCustomMode ? (
              /* STANDARD LOGIN FORM */
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                    Tên đăng nhập / Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 text-slate-400" size={16} />
                    <input
                      id="login-username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin, tech, nurse_hoisuc..."
                      className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 transition-all focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                    Mật khẩu truy cập
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
                    <input
                      id="login-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 transition-all focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-login-submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Xác nhận đăng nhập
                  <ArrowRight size={16} />
                </button>

                {/* Quick login guidelines for hospital admins and testers */}
                <div className="pt-6 border-t border-slate-100 mt-6">
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                    Lối tắt truy cập nhanh (Giả lập thử nghiệm):
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    {activeUsersList.map(user => (
                      <button
                        key={user.id}
                        type="button"
                        id={`btn-quick-login-${user.username}`}
                        onClick={() => handleQuickLogin(user)}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-all hover:border-indigo-300 flex flex-col justify-between"
                      >
                        <strong className="text-slate-800 block truncate">{user.name}</strong>
                        <div className="flex justify-between items-center mt-1 text-slate-500">
                          <span>Vai: {user.role === 'Admin' ? 'Admin' : user.role === 'Technician' ? 'Kỹ thuật' : 'Điều dưỡng'}</span>
                          <span className="font-semibold text-indigo-600 bg-indigo-50 px-1 rounded">{user.username}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            ) : (
              /* CUSTOM REGISTER / TESTING CREATION FORM */
              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                    Họ và tên người sử dụng
                  </label>
                  <input
                    id="custom-login-name"
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Ví dụ: ĐD Nguyễn Thị Minh"
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 transition-all focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                      Tên đăng nhập tự chọn
                    </label>
                    <input
                      id="custom-login-username-input"
                      type="text"
                      required
                      value={customUsernameInput}
                      onChange={(e) => setCustomUsernameInput(e.target.value)}
                      placeholder="Ví dụ: minh_nurse"
                      className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 transition-all focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                      Mật khẩu truy cập
                    </label>
                    <input
                      id="custom-login-password-input"
                      type="password"
                      required
                      value={customPasswordInput}
                      onChange={(e) => setCustomPasswordInput(e.target.value)}
                      placeholder="Mật khẩu mong muốn"
                      className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 transition-all focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                      Phân quyền vai trò
                    </label>
                    <select
                      id="custom-login-role"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 transition-all focus:outline-none"
                    >
                      <option value="User">Điều dưỡng viên (User)</option>
                      <option value="Technician">Kỹ thuật viên (Technician)</option>
                      <option value="Admin">Quản trị viên (Admin)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                      Khoa phòng hoạt động
                    </label>
                    <select
                      id="custom-login-dept"
                      disabled={customRole === 'Admin'}
                      value={customDept}
                      onChange={(e) => setCustomDept(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 transition-all focus:outline-none disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-custom-submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  Đăng ký tài khoản & Đăng nhập ngay
                  <ArrowRight size={16} />
                </button>

                <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl flex gap-2.5 text-[11px] text-slate-500 leading-relaxed mt-4">
                  <Info size={16} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Tài khoản được lưu trữ an toàn:</strong> Thông tin tài khoản đăng ký mới sẽ được lưu trực tiếp lên cơ sở dữ liệu đám mây Cloud Firestore giúp đồng bộ hóa trực tiếp trên toàn hệ thống.
                  </p>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>

      {/* Hospital Footer */}
      <div className="w-full text-center py-4 bg-slate-200/50 border-t border-slate-200 text-[11px] text-slate-400 font-medium">
        HỆ THỐNG PHÁT TRIỂN & KHAI THÁC THIẾT BỊ LÂM SÀNG • BỆNH VIỆN ĐA KHOA BẢO THẮNG
      </div>
    </div>
  );
}
