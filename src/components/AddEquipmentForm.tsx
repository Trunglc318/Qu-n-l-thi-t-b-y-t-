import React, { useState } from 'react';
import { Equipment, EquipmentStatus, Department } from '../types';
import { X, CheckCircle, HelpCircle } from 'lucide-react';

interface AddEquipmentFormProps {
  onClose: () => void;
  onSubmit: (equipment: Equipment) => void;
  departments: Department[];
}

export default function AddEquipmentForm({ onClose, onSubmit, departments }: AddEquipmentFormProps) {
  const [id, setId] = useState(`MT-${Math.floor(100 + Math.random() * 900)}`);
  const [name, setName] = useState('');
  const [serial, setSerial] = useState('');
  const [manufactureDate, setManufactureDate] = useState('2025-01-10');
  const [firstUseDate, setFirstUseDate] = useState('2025-03-15');
  const [status, setStatus] = useState<EquipmentStatus>('Ready');
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [department, setDepartment] = useState<string>(departments[0]?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !serial.trim() || !id.trim()) return;

    // Calculate dates based on first use
    const lastChargedDate = firstUseDate;
    
    // 30 days later for charging
    const chargeDateObj = new Date(firstUseDate);
    chargeDateObj.setDate(chargeDateObj.getDate() + 30);
    const nextChargeDueDate = chargeDateObj.toISOString().split('T')[0];

    // 180 days later for maintenance
    const maintDateObj = new Date(firstUseDate);
    maintDateObj.setDate(maintDateObj.getDate() + 180);
    const nextMaintenanceDate = maintDateObj.toISOString().split('T')[0];

    onSubmit({
      id: id.toUpperCase().trim(),
      name: name.trim(),
      serial: serial.trim(),
      manufactureDate,
      firstUseDate,
      status,
      batteryLevel,
      lastChargedDate,
      nextChargeDueDate,
      nextMaintenanceDate,
      totalUsageMinutes: 0,
      maintenanceLogs: [],
      usageLogs: [],
      department
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Khai Báo Thiết Bị Mới</h3>
            <p className="text-xs text-slate-500 mt-0.5">Thêm máy móc vào danh sách quản lý Khoa phòng</p>
          </div>
          <button 
            id="btn-close-add-form"
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-800 flex-1 bg-slate-50/50">
          
          {/* ID & Serial */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1.5">Mã thiết bị (Định danh)</label>
              <input
                id="input-add-id"
                type="text"
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="VD: MT-101, SA-003..."
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 text-slate-800 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1.5">Số Serial (S/N)</label>
              <input
                id="input-add-serial"
                type="text"
                required
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                placeholder="VD: SN-1234567..."
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 text-slate-800 font-mono"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1.5">Tên máy / Thiết bị y tế</label>
            <input
              id="input-add-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Máy đo điện tim Fukuda 12 kênh"
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium"
            />
          </div>

          {/* Manufacture & First Use Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1.5">Ngày tháng năm sản xuất</label>
              <input
                id="input-add-mfg"
                type="date"
                required
                value={manufactureDate}
                onChange={(e) => setManufactureDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1.5">Ngày bắt đầu sử dụng</label>
              <input
                id="input-add-firstuse"
                type="date"
                required
                value={firstUseDate}
                onChange={(e) => setFirstUseDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
          </div>

          {/* Status & Battery */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1.5">Tình trạng ban đầu</label>
              <select
                id="input-add-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as EquipmentStatus)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 text-slate-800"
              >
                <option value="Ready">Sẵn sàng sử dụng</option>
                <option value="InUse">Đang vận hành</option>
                <option value="Maintenance">Đang bảo trì định kỳ</option>
                <option value="Faulty">Lỗi kỹ thuật / Hỏng</option>
                <option value="ChargingRequired">Yêu cầu sạc pin</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1.5">Dung lượng pin ban đầu (%)</label>
              <input
                id="input-add-battery"
                type="number"
                min="0"
                max="100"
                required
                value={batteryLevel}
                onChange={(e) => setBatteryLevel(Number(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 text-slate-800 font-mono"
              />
            </div>
          </div>

          {/* Department Selection */}
          <div>
            <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1.5">Khoa lâm sàng trực thuộc</label>
            <select
              id="input-add-department"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium"
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Automatic calculation disclaimer */}
          <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-lg flex gap-2.5">
            <HelpCircle size={18} className="text-indigo-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-indigo-700 leading-relaxed">
              <strong>Hệ thống tự động hóa:</strong> Dựa trên ngày đưa vào sử dụng, lịch trình bảo trì 6 tháng và cảnh báo sạc pin định kỳ hằng tháng sẽ tự động được lên lịch chi tiết.
            </p>
          </div>

          {/* Form Actions */}
          <div className="border-t border-slate-100 pt-4 flex gap-3 justify-end bg-white -mx-6 -mb-6 p-5 rounded-b-2xl">
            <button
              type="button"
              id="btn-cancel-add"
              onClick={onClose}
              className="px-4 py-2 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-semibold cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              id="btn-submit-add"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
            >
              Khai báo máy
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
