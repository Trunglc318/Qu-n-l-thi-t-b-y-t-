import React, { useState } from 'react';
import { Equipment, UserRole, EquipmentStatus } from '../types';
import { 
  X, Calendar, Battery, Shield, Play, Square, RefreshCw, 
  User, CheckCircle, FileText, AlertOctagon, Printer, QrCode 
} from 'lucide-react';

interface EquipmentDetailProps {
  equipment: Equipment;
  onClose: () => void;
  userRole: UserRole;
  currentUserName: string;
  onStartUse: (id: string, userName: string) => void;
  onStopUse: (id: string) => void;
  onCharge: (id: string) => void;
  onOpenMaintenanceForm: (id: string) => void;
  onDelete?: (id: string) => void;
  onUpdateEquipment: (equipment: Equipment) => void;
}

export default function EquipmentDetail({
  equipment,
  onClose,
  userRole,
  currentUserName,
  onStartUse,
  onStopUse,
  onCharge,
  onOpenMaintenanceForm,
  onDelete,
  onUpdateEquipment
}: EquipmentDetailProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'maintenance' | 'usage'>('info');

  // Inspection states
  const [isEditingInspection, setIsEditingInspection] = useState(false);
  const [tempInspectionDate, setTempInspectionDate] = useState(equipment.nextInspectionDate || '');

  // Log edit states
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editLogStartTime, setEditLogStartTime] = useState<string>('');
  const [editLogEndTime, setEditLogEndTime] = useState<string>('');
  const [editLogUser, setEditLogUser] = useState<string>('');

  const formatIsoToDatetimeLocal = (isoStr?: string) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleSaveEditLog = (logId: string) => {
    const updatedLogs = equipment.usageLogs.map(log => {
      if (log.id === logId) {
        const startIso = new Date(editLogStartTime).toISOString();
        const endIso = editLogEndTime ? new Date(editLogEndTime).toISOString() : undefined;
        let durationMin = undefined;
        if (endIso) {
          const diffMs = new Date(endIso).getTime() - new Date(startIso).getTime();
          durationMin = Math.max(0, Math.round(diffMs / 60000));
        }
        return {
          ...log,
          user: editLogUser.trim(),
          startTime: startIso,
          endTime: endIso,
          durationMinutes: durationMin
        };
      }
      return log;
    });

    const totalMinutes = updatedLogs.reduce((sum, log) => {
      return sum + (log.durationMinutes || 0);
    }, 0);

    const activeLog = updatedLogs.find(log => !log.endTime);
    const currentUsageStart = activeLog ? activeLog.startTime : undefined;
    const currentUser = activeLog ? activeLog.user : undefined;

    onUpdateEquipment({
      ...equipment,
      currentUser,
      currentUsageStart,
      totalUsageMinutes: totalMinutes,
      usageLogs: updatedLogs
    });

    setEditingLogId(null);
  };

  const formattedTotalHours = (equipment.totalUsageMinutes / 60).toFixed(1);

  // Generate QR Code URL using high-quality QR Server API
  // We embed the Equipment ID and essential metadata so that scanning it brings full clarity.
  const qrData = `EQ_TRACK_BVT:${equipment.id}|NAME:${encodeURIComponent(equipment.name)}|SN:${equipment.serial}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrData)}`;

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>In Mã QR - ${equipment.id}</title>
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; text-align: center; padding: 40px; color: #1e293b; }
              .card { border: 2px solid #e2e8f0; border-radius: 12px; padding: 30px; display: inline-block; max-width: 320px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
              .hospital { font-size: 11px; font-weight: bold; color: #0284c7; text-transform: uppercase; margin-bottom: 5px; }
              .title { font-size: 16px; font-weight: 800; margin: 10px 0; }
              .id { font-family: monospace; font-size: 14px; font-weight: bold; background: #f1f5f9; padding: 4px 10px; border-radius: 4px; display: inline-block; }
              .serial { font-size: 11px; color: #64748b; margin-top: 5px; }
              .qr { margin: 20px 0; }
              .footer { font-size: 9px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="hospital">Bệnh viện Đa khoa Bảo Thắng</div>
              <div class="id">${equipment.id}</div>
              <div class="title">${equipment.name}</div>
              <div class="qr">
                <img src="${qrCodeUrl}" width="180" height="180" alt="QR Code" />
              </div>
              <div class="serial">S/N: ${equipment.serial}</div>
              <div class="footer">QUÉT MÃ ĐỂ KIỂM TRA LÝ LỊCH BẢO TRÌ VẬN HÀNH</div>
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-start p-5 border-b border-slate-100 bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-800">
                {equipment.id}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                equipment.status === 'Ready' ? 'bg-emerald-100 text-emerald-800' :
                equipment.status === 'InUse' ? 'bg-blue-100 text-blue-800' :
                equipment.status === 'Maintenance' ? 'bg-amber-100 text-amber-800' :
                equipment.status === 'Faulty' ? 'bg-red-100 text-red-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {equipment.status === 'Ready' ? 'Sẵn sàng' :
                 equipment.status === 'InUse' ? 'Đang sử dụng' :
                 equipment.status === 'Maintenance' ? 'Bảo trì' :
                 equipment.status === 'Faulty' ? 'Hỏng' : 'Cần sạc pin'}
              </span>
            </div>
            <h2 className="text-base md:text-lg font-extrabold text-slate-900 mt-1">{equipment.name}</h2>
          </div>
          <button 
            id="btn-close-detail"
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 text-xs px-3 bg-white">
          <button
            id="tab-detail-info"
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Thông tin chi tiết
          </button>
          <button
            id="tab-detail-maintenance"
            onClick={() => setActiveTab('maintenance')}
            className={`py-3 px-4 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'maintenance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Lịch sử bảo trì ({equipment.maintenanceLogs.length})
          </button>
          <button
            id="tab-detail-usage"
            onClick={() => setActiveTab('usage')}
            className={`py-3 px-4 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'usage' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Nhật ký sử dụng ({equipment.usageLogs.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left: General Info Fields */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Số Seri</span>
                    <strong className="text-sm text-slate-800 font-mono">{equipment.serial}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Khoa lâm sàng sử dụng</span>
                    <strong className="text-sm text-indigo-700 font-bold">{equipment.department || 'Chưa phân khoa'}</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-50">
                    <span className="text-slate-400 block font-medium">Ngày sản xuất</span>
                    <strong className="text-sm text-slate-800">{equipment.manufactureDate}</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-50">
                    <span className="text-slate-400 block font-medium">Ngày đưa vào sử dụng</span>
                    <strong className="text-sm text-slate-800">{equipment.firstUseDate}</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-50 col-span-2">
                    <span className="text-slate-400 block font-medium">Tổng thời gian vận hành</span>
                    <strong className="text-sm text-slate-800">{formattedTotalHours} giờ</strong>
                  </div>
                </div>

                {/* Battery status and Charging reminders */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                    <Battery size={16} className="text-indigo-600" />
                    Quản lý nguồn & Pin (Định kỳ 1 tháng/lần)
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block">Dung lượng pin hiện tại</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                          <div 
                            className={`h-full rounded-full ${
                              equipment.batteryLevel <= 15 ? 'bg-red-500' : equipment.batteryLevel <= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${equipment.batteryLevel}%` }}
                          ></div>
                        </div>
                        <strong className="font-mono text-sm">{equipment.batteryLevel}%</strong>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Ngày sạc pin gần nhất</span>
                      <strong className="text-slate-800 mt-1 block">{equipment.lastChargedDate}</strong>
                    </div>
                    <div className="pt-2 border-t border-slate-50">
                      <span className="text-slate-400 block">Hạn sạc pin định kỳ kế tiếp</span>
                      <strong className={`block mt-1 ${
                        new Date(equipment.nextChargeDueDate) < new Date('2026-07-04')
                          ? 'text-red-600 font-extrabold animate-pulse'
                          : 'text-slate-800'
                      }`}>
                        {equipment.nextChargeDueDate} {new Date(equipment.nextChargeDueDate) < new Date('2026-07-04') && '(Quá hạn!)'}
                      </strong>
                    </div>
                    <div className="pt-2 border-t border-slate-50">
                      <span className="text-slate-400 block">Kế hoạch bảo trì tiếp theo</span>
                      <strong className="text-slate-800 mt-1 block">{equipment.nextMaintenanceDate}</strong>
                    </div>
                    <div className="pt-2 border-t border-slate-50 col-span-2">
                      <span className="text-slate-400 block font-bold text-indigo-700">Lịch nhắc kiểm định thiết bị</span>
                      <div className="flex items-center gap-2 mt-1">
                        {isEditingInspection ? (
                          <div className="flex items-center gap-2 w-full mt-1 bg-indigo-50/50 p-2 rounded border border-indigo-100">
                            <input
                              type="date"
                              value={tempInspectionDate}
                              onChange={(e) => setTempInspectionDate(e.target.value)}
                              className="bg-white border border-slate-200 rounded p-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateEquipment({
                                  ...equipment,
                                  nextInspectionDate: tempInspectionDate,
                                  lastInspectionDate: new Date().toISOString().split('T')[0]
                                });
                                setIsEditingInspection(false);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded text-[11px] font-bold cursor-pointer"
                            >
                              Lưu lịch
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsEditingInspection(false)}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2.5 py-1.5 rounded text-[11px] font-bold cursor-pointer"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <>
                            <strong className={`block text-xs ${
                              equipment.nextInspectionDate && new Date(equipment.nextInspectionDate) < new Date()
                                ? 'text-red-600 font-extrabold animate-pulse'
                                : 'text-slate-800'
                            }`}>
                              {equipment.nextInspectionDate || 'Chưa lập lịch'} {equipment.nextInspectionDate && new Date(equipment.nextInspectionDate) < new Date() && '(Quá hạn kiểm định!)'}
                            </strong>
                            <button
                              type="button"
                              onClick={() => {
                                setTempInspectionDate(equipment.nextInspectionDate || new Date().toISOString().split('T')[0]);
                                setIsEditingInspection(true);
                              }}
                              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer ml-auto bg-indigo-50 px-2 py-1 rounded"
                            >
                              Cập nhật lịch
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current use status block */}
                {equipment.status === 'InUse' && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                      <User size={18} />
                    </div>
                    <div className="text-xs">
                      <h4 className="font-bold text-blue-900">Thiết bị đang được sử dụng</h4>
                      <p className="text-blue-700 mt-0.5">Người sử dụng: <strong className="font-bold">{equipment.currentUser}</strong></p>
                      {equipment.currentUsageStart && (
                        <p className="text-blue-600 mt-0.5">Thời gian bắt đầu: <span className="font-mono">{new Date(equipment.currentUsageStart).toLocaleString('vi-VN')}</span></p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: QR Code and Action Center */}
              <div className="space-y-4">
                {/* QR Code */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">MÃ QR THIẾT BỊ</span>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 relative group">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code" 
                      width="130" 
                      height="130" 
                      className="rounded"
                    />
                  </div>
                  <button
                    id="btn-print-qr"
                    onClick={handlePrintQR}
                    className="mt-3 flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-bold hover:underline cursor-pointer"
                  >
                    <Printer size={14} />
                    In nhãn QR thiết bị
                  </button>
                </div>

                {/* Interactive Action Center */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-2.5">
                  <h4 className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">TÁC VỤ VẬN HÀNH</h4>
                  
                  {/* Start/Stop usage controls (Open to all roles for flexibility) */}
                  {equipment.status === 'Ready' && (
                    <button
                      id="btn-action-start-use"
                      onClick={() => onStartUse(equipment.id, currentUserName)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                    >
                      <Play size={14} />
                      Bắt đầu bàn giao sử dụng
                    </button>
                  )}

                  {equipment.status === 'InUse' && (
                    <button
                      id="btn-action-stop-use"
                      onClick={() => onStopUse(equipment.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                    >
                      <Square size={14} />
                      Nghiệm thu dừng sử dụng
                    </button>
                  )}

                  {/* Charge device */}
                  {(equipment.status === 'ChargingRequired' || equipment.batteryLevel <= 40) && (
                    <button
                      id="btn-action-charge"
                      onClick={() => onCharge(equipment.id)}
                      className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-indigo-200"
                    >
                      <RefreshCw size={14} />
                      Cắm sạc pin định kỳ (100%)
                    </button>
                  )}

                  {/* Maintain device */}
                  {(userRole === 'Admin' || userRole === 'Technician') && (
                    <button
                      id="btn-action-maintain"
                      onClick={() => onOpenMaintenanceForm(equipment.id)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                    >
                      <Shield size={14} />
                      Khởi tạo lịch trình bảo trì
                    </button>
                  )}

                  {/* Delete (Admin only) */}
                  {userRole === 'Admin' && onDelete && (
                    <button
                      id="btn-action-delete"
                      onClick={() => {
                        if (confirm('Bạn có chắc chắn muốn xóa thiết bị này khỏi danh sách quản lý?')) {
                          onDelete(equipment.id);
                        }
                      }}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      Xóa hồ sơ thiết bị
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Maintenance Logs (with images) */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              {equipment.maintenanceLogs.length > 0 ? (
                <div className="relative border-l-2 border-indigo-100 pl-5 ml-4 space-y-6 py-2">
                  {equipment.maintenanceLogs.map((log) => (
                    <div key={log.id} className="relative group">
                      {/* Timeline dot */}
                      <span className="absolute -left-[27px] top-1 bg-white border-2 border-indigo-600 rounded-full w-4 h-4 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                      </span>

                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
                        <div className="flex justify-between items-start text-xs">
                          <div>
                            <strong className="text-slate-800 text-sm">{log.description}</strong>
                            <p className="text-slate-400 mt-0.5">Kỹ thuật viên: <span className="font-bold text-slate-600">{log.technicianName}</span></p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-slate-500 block font-semibold">{log.maintenanceDate}</span>
                            <span className="text-indigo-600 font-bold block mt-0.5">{log.cost.toLocaleString('vi-VN')} đ</span>
                          </div>
                        </div>

                        {/* Status logs details */}
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <div>
                            <span className="text-red-500 font-bold">● Trạng thái trước bảo trì:</span>
                            <p className="text-slate-600 mt-0.5">{log.statusBefore}</p>
                          </div>
                          <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-3">
                            <span className="text-emerald-600 font-bold">● Trạng thái sau bảo trì:</span>
                            <p className="text-slate-600 mt-0.5">{log.statusAfter}</p>
                          </div>
                        </div>

                        {/* Maintenance Images before and after (ADMINS ONLY) */}
                        {userRole === 'Admin' && (log.photoBefore || log.photoAfter) && (
                          <div className="mt-4 pt-3 border-t border-slate-100">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">Hình ảnh giám sát trạng thái (Admin)</span>
                            <div className="grid grid-cols-2 gap-4">
                              {log.photoBefore && (
                                <div className="space-y-1">
                                  <span className="text-[10px] text-slate-500 font-medium">Ảnh trước bảo trì:</span>
                                  <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
                                    <img src={log.photoBefore} alt="Before Maintenance" className="w-full h-28 object-contain" referrerPolicy="no-referrer" />
                                  </div>
                                </div>
                              )}
                              {log.photoAfter && (
                                <div className="space-y-1">
                                  <span className="text-[10px] text-slate-500 font-medium">Ảnh sau bảo trì:</span>
                                  <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
                                    <img src={log.photoAfter} alt="After Maintenance" className="w-full h-28 object-contain" referrerPolicy="no-referrer" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white border border-slate-100 rounded-xl">
                  <CheckCircle className="mx-auto text-emerald-500 mb-2" size={32} />
                  <h4 className="text-slate-700 font-bold text-xs">Chưa ghi nhận bảo trì</h4>
                  <p className="text-slate-400 text-xs mt-1">Hồ sơ thiết bị chưa có ghi chép sửa chữa cơ học.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Usage History */}
          {activeTab === 'usage' && (
            <div className="space-y-4">
              {equipment.usageLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs bg-white rounded-xl overflow-hidden border border-slate-100">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] border-b border-slate-100">
                        <th className="p-3">Người sử dụng</th>
                        <th className="p-3">Thời điểm bắt đầu</th>
                        <th className="p-3">Thời điểm kết thúc</th>
                        <th className="p-3 text-right">Tổng giờ dùng</th>
                        <th className="p-3 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {equipment.usageLogs.map((log) => {
                        const isEditing = editingLogId === log.id;
                        return isEditing ? (
                          <tr key={log.id} className="bg-indigo-50/40">
                            <td className="p-2">
                              <input
                                type="text"
                                value={editLogUser}
                                onChange={(e) => setEditLogUser(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 text-slate-800"
                                placeholder="Người bàn giao"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="datetime-local"
                                value={editLogStartTime}
                                onChange={(e) => setEditLogStartTime(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-mono focus:ring-1 focus:ring-indigo-500 text-slate-800"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="datetime-local"
                                value={editLogEndTime}
                                onChange={(e) => setEditLogEndTime(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-mono focus:ring-1 focus:ring-indigo-500 text-slate-800"
                                placeholder="Chưa nghiệm thu"
                              />
                            </td>
                            <td className="p-2 text-right font-bold text-slate-500">-</td>
                            <td className="p-2 text-center">
                              <div className="flex gap-1 justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditLog(log.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                                >
                                  Lưu
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingLogId(null)}
                                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                                >
                                  Hủy
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <tr key={log.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-slate-900">{log.user}</td>
                            <td className="p-3 font-mono">{new Date(log.startTime).toLocaleString('vi-VN')}</td>
                            <td className="p-3 font-mono">
                              {log.endTime ? new Date(log.endTime).toLocaleString('vi-VN') : (
                                <span className="text-blue-600 font-bold animate-pulse">Đang dùng...</span>
                              )}
                            </td>
                            <td className="p-3 text-right font-bold">
                              {log.durationMinutes ? `${(log.durationMinutes / 60).toFixed(1)} h` : '-'}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingLogId(log.id);
                                  setEditLogUser(log.user);
                                  setEditLogStartTime(formatIsoToDatetimeLocal(log.startTime));
                                  setEditLogEndTime(formatIsoToDatetimeLocal(log.endTime));
                                }}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold hover:underline cursor-pointer bg-indigo-50 px-2 py-0.5 rounded"
                              >
                                Sửa giờ
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-white border border-slate-100 rounded-xl">
                  <FileText className="mx-auto text-slate-400 mb-2" size={32} />
                  <h4 className="text-slate-700 font-bold text-xs">Chưa có nhật ký sử dụng</h4>
                  <p className="text-slate-400 text-xs mt-1">Thiết bị chưa từng kích hoạt đo lường sử dụng.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
