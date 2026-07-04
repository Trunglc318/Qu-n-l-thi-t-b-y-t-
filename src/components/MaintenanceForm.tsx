import React, { useState, useRef } from 'react';
import { MaintenanceLog } from '../types';
import { X, Camera, Upload, CheckCircle, ShieldAlert } from 'lucide-react';
import { mockImages } from '../data/mockData';

interface MaintenanceFormProps {
  equipmentId: string;
  equipmentName: string;
  onClose: () => void;
  onSubmit: (log: Omit<MaintenanceLog, 'id'>) => void;
}

export default function MaintenanceForm({ equipmentId, equipmentName, onClose, onSubmit }: MaintenanceFormProps) {
  const [description, setDescription] = useState('');
  const [technicianName, setTechnicianName] = useState('Trần Quốc Bình');
  const [cost, setCost] = useState('1500000');
  const [statusBefore, setStatusBefore] = useState('Bám bụi bẩn, hệ thống lọc khí bị tắc nghẽn');
  const [statusAfter, setStatusAfter] = useState('Đã vệ sinh sạch sẽ, thay màng lọc mới, hiệu chuẩn cảm biến');
  
  const [photoBefore, setPhotoBefore] = useState<string>(mockImages.before1);
  const [photoAfter, setPhotoAfter] = useState<string>(mockImages.after1);

  const fileInputBeforeRef = useRef<HTMLInputElement>(null);
  const fileInputAfterRef = useRef<HTMLInputElement>(null);

  // Convert uploaded image to base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (type === 'before') setPhotoBefore(reader.result);
          else setPhotoAfter(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const generateMockPhoto = (type: 'before' | 'after') => {
    // Generate simulated canvas image to capture state
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw background
      ctx.fillStyle = type === 'before' ? '#fee2e2' : '#dcfce7';
      ctx.fillRect(0, 0, 300, 200);
      
      // Draw text
      ctx.fillStyle = type === 'before' ? '#991b1b' : '#166534';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(type === 'before' ? 'TRẠNG THÁI TRƯỚC BẢO TRÌ' : 'TRẠNG THÁI SAU BẢO TRÌ', 150, 70);
      
      ctx.fillStyle = type === 'before' ? '#7f1d1d' : '#14532d';
      ctx.font = '11px sans-serif';
      ctx.fillText(type === 'before' ? 'Lỗi thiết bị / Cần sửa chữa' : 'Đã sửa chữa hoàn tất', 150, 110);
      ctx.fillText(`Mã máy: ${equipmentId} - ${new Date().toLocaleDateString('vi-VN')}`, 150, 140);

      const base64 = canvas.toDataURL('image/jpeg');
      if (type === 'before') setPhotoBefore(base64);
      else setPhotoAfter(base64);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    onSubmit({
      equipmentId,
      technicianName,
      maintenanceDate: new Date().toISOString().split('T')[0],
      description,
      cost: Number(cost) || 0,
      statusBefore,
      statusAfter,
      photoBefore,
      photoAfter
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Ghi Nhận Lịch Trình Bảo Trì</h3>
            <p className="text-xs text-slate-500 mt-0.5">Thiết bị: <span className="font-bold text-indigo-600">{equipmentName} ({equipmentId})</span></p>
          </div>
          <button 
            id="btn-close-maintenance-form"
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-800 flex-1 bg-slate-50/50">
          
          {/* Tech & Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1.5">Kỹ thuật viên thực hiện</label>
              <input
                id="input-tech-name"
                type="text"
                required
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1.5">Chi phí bảo trì (đ)</label>
              <input
                id="input-cost"
                type="number"
                required
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1.5">Nội dung bảo trì chi tiết</label>
            <textarea
              id="input-description"
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Kiểm tra cảm biến, thay dầu bôi trơn trục pittông đẩy..."
              className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 text-slate-800"
            ></textarea>
          </div>

          {/* Status logs */}
          <div className="space-y-3">
            <div>
              <label className="block text-red-600 font-bold uppercase tracking-wider mb-1">Mô tả trạng thái trước sửa chữa</label>
              <input
                id="input-status-before"
                type="text"
                required
                value={statusBefore}
                onChange={(e) => setStatusBefore(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-emerald-600 font-bold uppercase tracking-wider mb-1">Mô tả trạng thái sau sửa chữa</label>
              <input
                id="input-status-after"
                type="text"
                required
                value={statusAfter}
                onChange={(e) => setStatusAfter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
          </div>

          {/* Photos capture / upload (Before & After) */}
          <div className="border-t border-slate-200 pt-4 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Hình Ảnh Trước & Sau Bảo Trì (Hỗ trợ Admin kiểm định)</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Photo Before */}
              <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
                <span className="font-bold text-red-600 block">ẢNH TRƯỚC BẢO TRÌ</span>
                
                {photoBefore ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group">
                    <img src={photoBefore} alt="Before" className="w-full h-32 object-contain" referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      id="btn-remove-photo-before"
                      onClick={() => setPhotoBefore('')}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-sm hover:bg-red-700 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 h-32 rounded-lg flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                    <Camera size={24} className="mb-1" />
                    <span className="text-[10px]">Chưa có hình ảnh</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    type="button"
                    id="btn-upload-file-before"
                    onClick={() => fileInputBeforeRef.current?.click()}
                    className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 py-1.5 rounded-md font-semibold text-[10px] text-slate-600 cursor-pointer"
                  >
                    <Upload size={12} />
                    Tải ảnh
                  </button>
                  <button
                    type="button"
                    id="btn-mock-photo-before"
                    onClick={() => generateMockPhoto('before')}
                    className="flex items-center justify-center gap-1 bg-indigo-50 hover:bg-indigo-100 py-1.5 rounded-md font-semibold text-[10px] text-indigo-600 cursor-pointer"
                  >
                    Mô phỏng lỗi
                  </button>
                  <input
                    type="file"
                    ref={fileInputBeforeRef}
                    onChange={(e) => handleImageUpload(e, 'before')}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Photo After */}
              <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
                <span className="font-bold text-emerald-600 block">ẢNH SAU BẢO TRÌ</span>
                
                {photoAfter ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group">
                    <img src={photoAfter} alt="After" className="w-full h-32 object-contain" referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      id="btn-remove-photo-after"
                      onClick={() => setPhotoAfter('')}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-sm hover:bg-red-700 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 h-32 rounded-lg flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                    <Camera size={24} className="mb-1" />
                    <span className="text-[10px]">Chưa có hình ảnh</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    type="button"
                    id="btn-upload-file-after"
                    onClick={() => fileInputAfterRef.current?.click()}
                    className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 py-1.5 rounded-md font-semibold text-[10px] text-slate-600 cursor-pointer"
                  >
                    <Upload size={12} />
                    Tải ảnh
                  </button>
                  <button
                    type="button"
                    id="btn-mock-photo-after"
                    onClick={() => generateMockPhoto('after')}
                    className="flex items-center justify-center gap-1 bg-indigo-50 hover:bg-indigo-100 py-1.5 rounded-md font-semibold text-[10px] text-indigo-600 cursor-pointer"
                  >
                    Mô phỏng tốt
                  </button>
                  <input
                    type="file"
                    ref={fileInputAfterRef}
                    onChange={(e) => handleImageUpload(e, 'after')}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t border-slate-100 pt-4 flex gap-3 justify-end bg-white -mx-6 -mb-6 p-5 rounded-b-2xl">
            <button
              type="button"
              id="btn-cancel-maintenance"
              onClick={onClose}
              className="px-4 py-2 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-semibold cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              id="btn-submit-maintenance"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
            >
              Lưu lý lịch bảo trì
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
