import React, { useState, useEffect } from 'react';
import { Equipment, UserProfile, AppNotification, PerformanceStats, UserRole, MaintenanceLog, Department } from './types';
import { 
  initialEquipment, mockUsers, initialNotifications, initialPerformanceStats 
} from './data/mockData';
import { exportToExcel, exportToPDF } from './utils/exportUtils';
import { downloadUserManualDocx } from './utils/docxGenerator';
import {
  loadEquipmentFromFirestore,
  saveEquipmentToFirestore,
  deleteEquipmentFromFirestore,
  loadNotificationsFromFirestore,
  saveNotificationToFirestore,
  markAllNotificationsAsReadInFirestore,
  loadStatsFromFirestore,
  loadUsersFromFirestore,
  saveUserToFirestore,
  deleteUserFromFirestore,
  loadDepartmentsFromFirestore,
  saveDepartmentToFirestore,
  deleteDepartmentFromFirestore
} from './lib/firebase';

import Dashboard from './components/Dashboard';
import EquipmentList from './components/EquipmentList';
import EquipmentDetail from './components/EquipmentDetail';
import MaintenanceForm from './components/MaintenanceForm';
import NotificationCenter from './components/NotificationCenter';
import AddEquipmentForm from './components/AddEquipmentForm';
import Login from './components/Login';
import UserManagement from './components/UserManagement';

import { 
  Bell, User, ShieldCheck, HelpCircle, FileText, Download, QrCode, Sparkles, Check, Info, AlertTriangle, X, LogOut
} from 'lucide-react';

export default function App() {
  // Global States loaded from Firestore or mock data fallback
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(initialEquipment);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats[]>(initialPerformanceStats);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('bvt_is_logged_in') === 'true';
  });

  // Active User / Role selection
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const stored = localStorage.getItem('bvt_current_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return mockUsers[0];
      }
    }
    return mockUsers[0];
  });
  
  // Navigation tabs
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'equipment' | 'users'>('dashboard');
  
  // Detail views and modals
  const [selectedEqId, setSelectedEqId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMaintenanceFormId, setShowMaintenanceFormId] = useState<string | null>(null);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Toast / System alerting state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Helper to show custom feedback toasts
  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('bvt_is_logged_in', 'true');
    localStorage.setItem('bvt_current_user', JSON.stringify(user));
    showToast(`Chào mừng ${user.name} quay trở lại làm việc!`, 'success');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('bvt_is_logged_in');
    localStorage.removeItem('bvt_current_user');
    showToast('Đã đăng xuất tài khoản an toàn.', 'info');
  };

  const addSystemLog = (message: string) => {
    console.log(`[Báo cáo hệ thống] ${message}`);
  };

  // Load persistent data from Cloud Firestore on mount
  useEffect(() => {
    async function loadAllData() {
      try {
        const eqData = await loadEquipmentFromFirestore();
        setEquipmentList(eqData);

        const notifData = await loadNotificationsFromFirestore();
        setNotifications(notifData);

        const statsData = await loadStatsFromFirestore();
        setPerformanceStats(statsData);

        const usersData = await loadUsersFromFirestore();
        setUsersList(usersData);

        const deptData = await loadDepartmentsFromFirestore();
        setDepartments(deptData);
      } catch (err) {
        console.error('[Firebase] Error loading initial Firestore data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  const handleAddDepartment = async (name: string) => {
    const id = `DEP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newDept: Department = { id, name };
    await saveDepartmentToFirestore(newDept);
    setDepartments(prev => [...prev, newDept]);
    showToast(`Đã thêm khoa mới: ${name}`, 'success');
  };

  const handleUpdateDepartment = async (dept: Department) => {
    await saveDepartmentToFirestore(dept);
    setDepartments(prev => prev.map(d => d.id === dept.id ? dept : d));
    showToast(`Đã cập nhật khoa: ${dept.name}`, 'success');
  };

  const handleDeleteDepartment = async (id: string) => {
    await deleteDepartmentFromFirestore(id);
    setDepartments(prev => prev.filter(d => d.id !== id));
    showToast('Đã xóa khoa lâm sàng khỏi danh mục.', 'info');
  };

  // Background simulation: Battery depletion over time (every 12 seconds)
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setEquipmentList(prevList => {
        let alertTriggered = false;
        
        const updated = prevList.map(eq => {
          // Only deplete if status is InUse
          if (eq.status === 'InUse' && eq.batteryLevel > 0) {
            const nextLevel = Math.max(0, eq.batteryLevel - Math.floor(Math.random() * 3 + 1));
            
            // Trigger alert if crosses critical 15% threshold
            if (nextLevel <= 15 && eq.batteryLevel > 15) {
              alertTriggered = true;
              
              // Trigger a live push notification!
              const newNotif: AppNotification = {
                id: `N-DEP-${Date.now()}`,
                title: 'Cảnh báo sạc pin khẩn cấp',
                message: `Thiết bị ${eq.name} (${eq.id}) đang sử dụng sắp cạn pin (${nextLevel}%). Cần cắm sạc ngay định kỳ 1 lần/tháng.`,
                type: 'battery',
                equipmentId: eq.id,
                createdAt: new Date().toISOString(),
                read: false
              };
              
              setNotifications(prevNotifs => {
                const nextNotifs = [newNotif, ...prevNotifs];
                saveNotificationToFirestore(newNotif);
                return nextNotifs;
              });
            }
            const updatedEq = { ...eq, batteryLevel: nextLevel };
            saveEquipmentToFirestore(updatedEq);
            return updatedEq;
          }
          return eq;
        });

        if (alertTriggered) {
          showToast('Có cảnh báo pin yếu từ thiết bị đang vận hành!', 'warning');
          // Standard browser alert fallback if permitted
          if (Notification.permission === 'granted') {
            new Notification('Cảnh báo pin yếu - Bệnh viện Bảo Thắng', {
              body: 'Có thiết bị y tế sắp hết pin dưới 15%. Vui lòng kiểm tra.'
            });
          }
        }
        return updated;
      });
    }, 12000);

    return () => clearInterval(interval);
  }, [loading]);

  // Ask for notification permission once at boot
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Handlers for equipment logs
  const handleStartUse = (id: string, userName: string) => {
    setEquipmentList(prev => prev.map(eq => {
      if (eq.id === id) {
        showToast(`Bàn giao thiết bị ${eq.name} thành công.`, 'success');
        const updatedEq: Equipment = {
          ...eq,
          status: 'InUse',
          currentUser: userName,
          currentUsageStart: new Date().toISOString(),
          usageLogs: [
            {
              id: `UL-${Date.now()}`,
              equipmentId: eq.id,
              user: userName,
              startTime: new Date().toISOString()
            },
            ...eq.usageLogs
          ]
        };
        saveEquipmentToFirestore(updatedEq);
        return updatedEq;
      }
      return eq;
    }));
  };

  const handleStopUse = (id: string) => {
    setEquipmentList(prev => prev.map(eq => {
      if (eq.id === id) {
        const lastLog = eq.usageLogs[0];
        let durationMin = 30; // standard default if start was missing
        if (lastLog && lastLog.startTime) {
          const diffMs = Date.now() - new Date(lastLog.startTime).getTime();
          durationMin = Math.max(1, Math.round(diffMs / 60000));
        }

        const updatedLogs = [...eq.usageLogs];
        if (updatedLogs[0]) {
          updatedLogs[0] = {
            ...updatedLogs[0],
            endTime: new Date().toISOString(),
            durationMinutes: durationMin
          };
        }

        showToast(`Thu hồi thiết bị ${eq.name}. Đã cộng thêm ${durationMin} phút vào tổng vận hành.`, 'info');
        const updatedEq: Equipment = {
          ...eq,
          status: 'Ready',
          currentUser: undefined,
          currentUsageStart: undefined,
          totalUsageMinutes: eq.totalUsageMinutes + durationMin,
          usageLogs: updatedLogs
        };
        saveEquipmentToFirestore(updatedEq);
        return updatedEq;
      }
      return eq;
    }));
  };

  const handleChargeDevice = (id: string) => {
    setEquipmentList(prev => prev.map(eq => {
      if (eq.id === id) {
        // Compute next charge due date 30 days from now
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 30);
        const nextDateStr = nextDate.toISOString().split('T')[0];

        // Filter out charging alerts for this machine and save read state in DB
        setNotifications(prevNotifs => {
          const toRemove = prevNotifs.filter(n => n.equipmentId === id && n.type === 'battery');
          toRemove.forEach(n => saveNotificationToFirestore({ ...n, read: true }));
          return prevNotifs.filter(n => !(n.equipmentId === id && n.type === 'battery'));
        });

        showToast(`Đã cắm sạc pin cho máy ${eq.id}. Pin khôi phục về 100%.`, 'success');
        const updatedEq: Equipment = {
          ...eq,
          batteryLevel: 100,
          status: eq.status === 'ChargingRequired' ? 'Ready' : eq.status,
          lastChargedDate: new Date().toISOString().split('T')[0],
          nextChargeDueDate: nextDateStr
        };
        saveEquipmentToFirestore(updatedEq);
        return updatedEq;
      }
      return eq;
    }));
  };

  const handleAddMaintenanceLog = (logData: Omit<MaintenanceLog, 'id'>) => {
    const newId = `M-${Date.now()}`;
    const newLog: MaintenanceLog = {
      id: newId,
      ...logData
    };

    setEquipmentList(prev => prev.map(eq => {
      if (eq.id === logData.equipmentId) {
        // Set state to Ready after maintenance
        const nextMaint = new Date();
        nextMaint.setDate(nextMaint.getDate() + 180); // 6 months schedule

        // Remove active maintenance warning notification if present and mark read in DB
        setNotifications(prevNotifs => {
          const toRemove = prevNotifs.filter(n => n.equipmentId === eq.id && n.type === 'maintenance');
          toRemove.forEach(n => saveNotificationToFirestore({ ...n, read: true }));
          return prevNotifs.filter(n => !(n.equipmentId === eq.id && n.type === 'maintenance'));
        });

        showToast(`Lưu lý lịch bảo trì thành công cho máy ${eq.id}`, 'success');
        const updatedEq: Equipment = {
          ...eq,
          status: 'Ready',
          nextMaintenanceDate: nextMaint.toISOString().split('T')[0],
          maintenanceLogs: [newLog, ...eq.maintenanceLogs]
        };
        saveEquipmentToFirestore(updatedEq);
        return updatedEq;
      }
      return eq;
    }));

    setShowMaintenanceFormId(null);
  };

  const handleAddEquipment = (newEq: Equipment) => {
    setEquipmentList(prev => [newEq, ...prev]);
    saveEquipmentToFirestore(newEq);
    setShowAddForm(false);
    showToast(`Khai báo thành công thiết bị ${newEq.name}!`, 'success');
  };

  const handleDeleteEquipment = (id: string) => {
    setEquipmentList(prev => prev.filter(eq => eq.id !== id));
    deleteEquipmentFromFirestore(id);
    setSelectedEqId(null);
    showToast(`Đã xóa hồ sơ thiết bị ${id}`, 'info');
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        const updated = { ...n, read: true };
        saveNotificationToFirestore(updated);
        return updated;
      }
      return n;
    }));
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      markAllNotificationsAsReadInFirestore(prev);
      return updated;
    });
    showToast('Đã đánh dấu đọc toàn bộ thông báo.');
  };

  // Show login screen first if not authenticated
  if (!isLoggedIn) {
    return (
      <>
        {toast && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl border text-xs font-bold animate-in fade-in slide-in-from-top duration-300 bg-slate-900 text-white border-slate-800">
            <Sparkles size={16} className="text-amber-400" />
            <span>{toast.message}</span>
          </div>
        )}
        <Login 
          users={usersList} 
          onAddUser={async (newUser) => {
            await saveUserToFirestore(newUser);
            setUsersList(prev => {
              // Avoid duplicates if any
              const index = prev.findIndex(u => u.id === newUser.id);
              if (index >= 0) {
                const copy = [...prev];
                copy[index] = newUser;
                return copy;
              }
              return [...prev, newUser];
            });
          }} 
          onLogin={handleLogin} 
        />
      </>
    );
  }

  // Render high-contrast elegant medical loader if loading Firestore data
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
          <div className="text-center">
            <h2 className="text-sm font-bold text-slate-800">Đang đồng bộ hóa dữ liệu Cloud Firestore...</h2>
            <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Bệnh viện Đa khoa Bảo Thắng</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedEquipment = equipmentList.find(eq => eq.id === selectedEqId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Dynamic Toast Feedback Alert */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl border text-xs font-bold animate-in fade-in slide-in-from-top duration-300 bg-slate-900 text-white border-slate-800">
          <Sparkles size={16} className="text-amber-400" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-md shadow-indigo-200">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded tracking-wider">HOSPITAL</span>
                <span className="text-[10px] text-slate-400 font-bold">• BẢO THẮNG</span>
              </div>
              <h1 className="text-sm font-black text-slate-900 tracking-tight">Thiết Bị Vận Hành</h1>
            </div>
          </div>

          {/* Quick Universal QR Scanner simulator */}
          <div className="hidden sm:block flex-1 max-w-xs">
            <button
              id="header-btn-qr-scan"
              onClick={() => setShowQRScanner(true)}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 text-xs font-medium cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-2">
                <QrCode size={16} className="text-slate-600" />
                Quét mã máy nhanh...
              </span>
              <kbd className="bg-white text-[9px] px-1.5 py-0.5 rounded shadow-xs font-mono">SCAN</kbd>
            </button>
          </div>

          {/* Actions & Role Switcher */}
          <div className="flex items-center gap-4">
            
            {/* Notification bell */}
            <button
              id="header-btn-notification"
              onClick={() => setShowNotificationPanel(true)}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative cursor-pointer"
            >
              <Bell size={20} />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-rose-500 w-2.5 h-2.5 rounded-full animate-ping"></span>
              )}
            </button>

            {/* User Role Switcher Profile dropdown */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="text-right hidden md:block">
                <span className="text-xs font-bold block text-slate-800 leading-tight">{currentUser.name}</span>
                <div className="flex flex-col items-end gap-0.5 mt-0.5">
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    currentUser.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' :
                    currentUser.role === 'Technician' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {currentUser.role === 'Admin' ? 'Quản trị viên' : currentUser.role === 'Technician' ? 'Kỹ thuật viên' : 'Điều dưỡng viên'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold">{currentUser.department || 'Bệnh viện Bảo Thắng'}</span>
                </div>
              </div>
              
              <img 
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=120'} 
                alt={currentUser.name}
                className="w-10 h-10 rounded-xl object-cover border-2 border-slate-200"
                referrerPolicy="no-referrer"
              />

              <button
                id="btn-logout"
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                title="Đăng xuất khỏi hệ thống"
              >
                <LogOut size={18} />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col gap-6">
        
        {/* Mobile quick actions bar */}
        <div className="sm:hidden flex justify-between gap-2">
          <button
            id="mobile-btn-qr-scan"
            onClick={() => setShowQRScanner(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white text-xs font-semibold py-3 px-4 rounded-xl shadow-sm cursor-pointer"
          >
            <QrCode size={16} />
            Quét mã QR máy
          </button>
          
          <div className="flex bg-slate-200 p-0.5 rounded-xl">
            <button
              id="mobile-nav-dashboard"
              onClick={() => setCurrentTab('dashboard')}
              className={`px-2.5 py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${
                currentTab === 'dashboard' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
              }`}
            >
              Thống kê
            </button>
            <button
              id="mobile-nav-equipment"
              onClick={() => setCurrentTab('equipment')}
              className={`px-2.5 py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${
                currentTab === 'equipment' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
              }`}
            >
              Thiết bị
            </button>
            <button
              id="mobile-nav-users"
              onClick={() => setCurrentTab('users')}
              className={`px-2.5 py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${
                currentTab === 'users' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
              }`}
            >
              Cán bộ
            </button>
          </div>
        </div>

        {/* Desktop View Switcher Header Card */}
        <div className="hidden sm:flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          {/* Nav Tabs */}
          <div className="flex gap-2">
            <button
              id="desktop-nav-dashboard"
              onClick={() => setCurrentTab('dashboard')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currentTab === 'dashboard' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Bảng Thống Kê Hiệu Suất
            </button>
            <button
              id="desktop-nav-equipment"
              onClick={() => setCurrentTab('equipment')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currentTab === 'equipment' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Danh Mục Trang Thiết Bị
            </button>
            <button
              id="desktop-nav-users"
              onClick={() => setCurrentTab('users')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currentTab === 'users' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Cán bộ & Mật khẩu
            </button>
          </div>

          {/* PDF & Excel Reporting Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-download-word-manual"
              onClick={() => {
                downloadUserManualDocx();
                showToast('Đang tải tài liệu Hướng dẫn sử dụng Word...', 'success');
              }}
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold py-2 px-3.5 border border-amber-200 rounded-lg cursor-pointer transition-colors animate-bounce"
              title="Tải hướng dẫn vận hành dạng file Word chính thức"
            >
              <HelpCircle size={14} className="text-amber-600" />
              Tài liệu HDSD (Word)
            </button>
            <button
              id="btn-export-excel"
              onClick={() => {
                exportToExcel(equipmentList);
                showToast('Đang tạo báo cáo Excel...');
              }}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold py-2 px-3 border border-slate-200 rounded-lg cursor-pointer transition-colors"
            >
              <FileText size={14} className="text-emerald-600" />
              Xuất Excel
            </button>
            <button
              id="btn-export-pdf"
              onClick={() => {
                exportToPDF(equipmentList);
                showToast('Đang tự động biên soạn báo cáo PDF...');
              }}
              className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold py-2 px-3.5 border border-indigo-200 rounded-lg cursor-pointer transition-colors"
            >
              <Download size={14} />
              Báo cáo PDF Tự Động
            </button>
          </div>
        </div>

        {/* Tab content renderer */}
        {currentTab === 'dashboard' ? (
          <Dashboard 
            equipment={equipmentList} 
            stats={performanceStats} 
            onAddLog={addSystemLog} 
          />
        ) : currentTab === 'equipment' ? (
          <EquipmentList 
            equipment={equipmentList} 
            onSelect={setSelectedEqId} 
            onAddEquipment={() => setShowAddForm(true)}
            userRole={currentUser.role}
            userDepartment={currentUser.department}
            allowedDepartments={currentUser.allowedDepartments}
            departments={departments}
          />
        ) : (
          <UserManagement
            currentUser={currentUser}
            users={usersList}
            onAddUser={async (newUser) => {
              await saveUserToFirestore(newUser);
              setUsersList(prev => {
                const index = prev.findIndex(u => u.id === newUser.id);
                if (index >= 0) {
                  const copy = [...prev];
                  copy[index] = newUser;
                  return copy;
                }
                return [...prev, newUser];
              });
            }}
            onUpdateUser={async (updatedUser) => {
              await saveUserToFirestore(updatedUser);
              setUsersList(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
              // If updated user is the logged in user, update local storage and active session
              if (updatedUser.id === currentUser.id) {
                setCurrentUser(updatedUser);
                localStorage.setItem('bvt_current_user', JSON.stringify(updatedUser));
              }
            }}
            onDeleteUser={async (id) => {
              await deleteUserFromFirestore(id);
              setUsersList(prev => prev.filter(u => u.id !== id));
            }}
            onToast={(msg, type) => showToast(msg, type === 'error' ? 'warning' : type === 'info' ? 'info' : 'success')}
            departments={departments}
            onAddDepartment={handleAddDepartment}
            onUpdateDepartment={handleUpdateDepartment}
            onDeleteDepartment={handleDeleteDepartment}
          />
        )}

      </main>

      {/* Equipment details Modal */}
      {selectedEquipment && (
        <EquipmentDetail
          equipment={selectedEquipment}
          onClose={() => setSelectedEqId(null)}
          userRole={currentUser.role}
          currentUserName={currentUser.name}
          onStartUse={handleStartUse}
          onStopUse={handleStopUse}
          onCharge={handleChargeDevice}
          onOpenMaintenanceForm={(id) => setShowMaintenanceFormId(id)}
          onDelete={handleDeleteEquipment}
        />
      )}

      {/* Add new equipment Modal */}
      {showAddForm && (
        <AddEquipmentForm
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddEquipment}
          departments={departments}
        />
      )}

      {/* Maintenance Form Modal */}
      {showMaintenanceFormId && (
        <MaintenanceForm
          equipmentId={showMaintenanceFormId}
          equipmentName={equipmentList.find(e => e.id === showMaintenanceFormId)?.name || ''}
          onClose={() => setShowMaintenanceFormId(null)}
          onSubmit={handleAddMaintenanceLog}
        />
      )}

      {/* Slide-out notifications Drawer */}
      {showNotificationPanel && (
        <NotificationCenter
          notifications={notifications}
          onClose={() => setShowNotificationPanel(false)}
          onMarkAsRead={handleMarkNotificationAsRead}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          onSelectEquipment={setSelectedEqId}
        />
      )}

      {/* Universal QR Code scan Simulator Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-6 text-center space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-2">
              <span className="text-xs font-bold text-slate-800">Quét mã QR thiết bị</span>
              <button 
                id="btn-close-scanner"
                onClick={() => setShowQRScanner(false)} 
                className="p-1 hover:bg-slate-100 rounded-full cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Vui lòng chọn thiết bị dưới đây để giả lập hành vi quét nhãn QR vật lý trên thiết bị y tế:
            </p>

            <div className="space-y-2 text-left">
              {equipmentList.map(eq => (
                <button
                  key={eq.id}
                  id={`btn-scan-simulate-${eq.id}`}
                  onClick={() => {
                    setSelectedEqId(eq.id);
                    setShowQRScanner(false);
                    showToast(`Quét thành công máy ${eq.id}`, 'success');
                  }}
                  className="w-full bg-slate-50 hover:bg-slate-100 p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 text-xs text-left flex justify-between items-center transition-all cursor-pointer font-medium"
                >
                  <span className="truncate max-w-[200px]">{eq.name}</span>
                  <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                    {eq.id}
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-slate-50 p-3 rounded-lg text-[10px] text-slate-400 font-medium">
              NHÀ MÁY / KHOA PHÒNG BỆNH VIỆN BẢO THẮNG
            </div>
          </div>
        </div>
      )}

      {/* Footer Info bar */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12 text-slate-400 text-xs text-center font-medium">
        <p>© 2026 Bệnh viện Đa khoa Bảo Thắng. Tất cả các quyền được bảo lưu.</p>
        <p className="text-[10px] mt-1 text-slate-300">Hệ thống quản lý trang thiết bị lâm sàng • Phiên bản 1.2.0</p>
      </footer>

    </div>
  );
}
