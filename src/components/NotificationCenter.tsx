import React from 'react';
import { AppNotification } from '../types';
import { Bell, X, Check, Battery, ShieldAlert, AlertTriangle, Info } from 'lucide-react';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectEquipment: (id: string) => void;
}

export default function NotificationCenter({
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectEquipment
}: NotificationCenterProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'battery':
        return (
          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
            <Battery size={16} className="animate-bounce" />
          </div>
        );
      case 'maintenance':
        return (
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <ShieldAlert size={16} />
          </div>
        );
      case 'usage':
        return (
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Info size={16} />
          </div>
        );
      default:
        return (
          <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
            <AlertTriangle size={16} />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-slate-100 animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell size={20} className="text-slate-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-slate-900">Trung tâm thông báo đẩy</h3>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              id="btn-mark-all-read"
              onClick={onMarkAllAsRead}
              className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold hover:underline cursor-pointer"
            >
              Đánh dấu đã đọc hết
            </button>
          )}
          <button
            id="btn-close-notification-panel"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (notif.equipmentId) {
                  onSelectEquipment(notif.equipmentId);
                  onClose();
                }
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex gap-3 relative ${
                notif.read 
                  ? 'bg-white border-slate-100 hover:border-slate-200 opacity-75' 
                  : 'bg-white border-indigo-100 shadow-xs hover:border-indigo-200 scale-[1.01]'
              }`}
            >
              {/* Left icon */}
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>

              {/* Message */}
              <div className="text-xs space-y-1 pr-6">
                <div className="flex items-center gap-2">
                  <h4 className={`font-bold ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</h4>
                  {!notif.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                  )}
                </div>
                <p className="text-slate-500 leading-relaxed text-[11px]">{notif.message}</p>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {new Date(notif.createdAt).toLocaleTimeString('vi-VN')} - {new Date(notif.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>

              {/* Action buttons on notification card */}
              <div className="absolute right-3 top-3 flex flex-col gap-1.5">
                {!notif.read && (
                  <button
                    id={`btn-read-notif-${notif.id}`}
                    type="button"
                    title="Đánh dấu đã đọc"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notif.id);
                    }}
                    className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-full cursor-pointer transition-colors"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-400">
            <Bell size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-xs">Không có thông báo mới nào</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-400 text-center font-medium uppercase tracking-wider">
        Bệnh viện Đa khoa Bảo Thắng • Thiết bị an toàn
      </div>

    </div>
  );
}
