import { jsPDF } from 'jspdf';
import { Equipment } from '../types';

/**
 * Exports equipment data to a CSV file readable directly in Microsoft Excel with full Vietnamese support.
 */
export function exportToExcel(equipmentList: Equipment[]) {
  // Column Headers - fully detailed separate cells
  const headers = [
    'Mã thiết bị',
    'Tên thiết bị',
    'Số seri',
    'Khoa lâm sàng trực thuộc',
    'Ngày sản xuất',
    'Ngày đưa vào sử dụng',
    'Tình trạng',
    'Phần trăm pin (%)',
    'Ngày sạc gần nhất',
    'Ngày cần sạc tiếp theo',
    'Ngày bảo trì tiếp theo',
    'Ngày kiểm định tiếp theo',
    'Tổng thời gian sử dụng (phút)',
    'Người sử dụng hiện tại'
  ];

  // Map rows
  const rows = equipmentList.map(eq => {
    let statusVi = '';
    switch (eq.status) {
      case 'Ready': statusVi = 'Sẵn sàng'; break;
      case 'InUse': statusVi = 'Đang sử dụng'; break;
      case 'Maintenance': statusVi = 'Đang bảo trì'; break;
      case 'Faulty': statusVi = 'Đang hỏng'; break;
      case 'ChargingRequired': statusVi = 'Cần sạc pin'; break;
      default: statusVi = eq.status;
    }

    return [
      eq.id,
      eq.name,
      eq.serial,
      eq.department || 'Chưa phân khoa',
      eq.manufactureDate,
      eq.firstUseDate,
      statusVi,
      eq.batteryLevel,
      eq.lastChargedDate,
      eq.nextChargeDueDate,
      eq.nextMaintenanceDate,
      eq.nextInspectionDate || 'Chưa lập lịch',
      eq.totalUsageMinutes,
      eq.currentUser || 'Không có'
    ];
  });

  // Convert array to CSV string
  // 'sep=,' forces MS Excel to open and parse the comma separator on all international systems instantly
  const csvContent = [
    'sep=,',
    headers.join(','),
    ...rows.map(row => row.map(val => {
      // Escape commas and double quotes to prevent column leaking
      const stringVal = String(val ?? '');
      if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    }).join(','))
  ].join('\n');

  // Add UTF-8 BOM to ensure MS Excel opens Vietnamese accents perfectly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Báo_cáo_trang_thiết_bị_Bảo_Thắng_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates a clean PDF document using a Canvas layout to support perfect Vietnamese rendering,
 * and downloads it as a professional report.
 */
export function exportToPDF(equipmentList: Equipment[], reportTitle = 'BÁO CÁO THỐNG KÊ TRANG THIẾT BỊ Y TẾ') {
  // Create a temporary container div offscreen
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#1e293b';
  container.style.fontFamily = '"Inter", sans-serif';
  container.style.padding = '40px';
  container.style.boxSizing = 'border-box';

  const dateStr = new Date().toLocaleDateString('vi-VN', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  // Build high-quality HTML report
  container.innerHTML = `
    <div style="border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 25px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h2 style="margin: 0; font-size: 16px; color: #0f172a; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">BỆNH VIỆN ĐA KHOA BẢO THẮNG</h2>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">Hệ thống Quản lý Thiết bị & Lý lịch Bảo trì</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 500;">Ngày xuất: ${dateStr}</p>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #0284c7; font-weight: 600;">Mã BC: RP-${Math.floor(100000 + Math.random() * 900000)}</p>
        </div>
      </div>
    </div>

    <h1 style="text-align: center; color: #0f172a; font-size: 22px; font-weight: 800; margin-bottom: 30px; letter-spacing: -0.5px;">${reportTitle}</h1>

    <div style="display: flex; justify-content: space-between; margin-bottom: 25px; background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
      <div style="text-align: center; flex: 1; border-right: 1px solid #e2e8f0;">
        <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; display: block;">Tổng Thiết Bị</span>
        <strong style="font-size: 20px; color: #0f172a; display: block; margin-top: 5px;">${equipmentList.length}</strong>
      </div>
      <div style="text-align: center; flex: 1; border-right: 1px solid #e2e8f0;">
        <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; display: block;">Sẵn Sàng</span>
        <strong style="font-size: 20px; color: #16a34a; display: block; margin-top: 5px;">${equipmentList.filter(e => e.status === 'Ready').length}</strong>
      </div>
      <div style="text-align: center; flex: 1; border-right: 1px solid #e2e8f0;">
        <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; display: block;">Đang Sử Dụng</span>
        <strong style="font-size: 20px; color: #2563eb; display: block; margin-top: 5px;">${equipmentList.filter(e => e.status === 'InUse').length}</strong>
      </div>
      <div style="text-align: center; flex: 1;">
        <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; display: block;">Bảo Trì / Lỗi</span>
        <strong style="font-size: 20px; color: #dc2626; display: block; margin-top: 5px;">${equipmentList.filter(e => e.status === 'Maintenance' || e.status === 'Faulty').length}</strong>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 11px;">
      <thead>
        <tr style="background-color: #0f172a; color: #ffffff; text-align: left;">
          <th style="padding: 10px 8px; border: 1px solid #334155;">Mã Máy</th>
          <th style="padding: 10px 8px; border: 1px solid #334155;">Tên Thiết Bị</th>
          <th style="padding: 10px 8px; border: 1px solid #334155;">Số Seri</th>
          <th style="padding: 10px 8px; border: 1px solid #334155;">Đưa Vào SD</th>
          <th style="padding: 10px 8px; border: 1px solid #334155;">Trạng Thái</th>
          <th style="padding: 10px 8px; border: 1px solid #334155; text-align: right;">Tổng Giờ SD</th>
        </tr>
      </thead>
      <tbody>
        ${equipmentList.map(eq => {
          let statusVi = '';
          let statusColor = '';
          switch (eq.status) {
            case 'Ready': statusVi = 'Sẵn sàng'; statusColor = '#16a34a'; break;
            case 'InUse': statusVi = 'Đang sử dụng'; statusColor = '#2563eb'; break;
            case 'Maintenance': statusVi = 'Bảo trì'; statusColor = '#ea580c'; break;
            case 'Faulty': statusVi = 'Hỏng'; statusColor = '#dc2626'; break;
            case 'ChargingRequired': statusVi = 'Cần sạc pin'; statusColor = '#854d0e'; break;
            default: statusVi = eq.status; statusColor = '#64748b';
          }
          const totalHours = (eq.totalUsageMinutes / 60).toFixed(1);
          return `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">${eq.id}</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0; max-width: 250px; font-weight: 500;">${eq.name}</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0; color: #475569;">${eq.serial}</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0; color: #475569;">${eq.firstUseDate}</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">
                <span style="color: ${statusColor}; font-weight: 600;">● ${statusVi}</span>
              </td>
              <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; font-weight: 500;">${totalHours} giờ</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <div style="margin-top: 40px; display: flex; justify-content: space-between;">
      <div style="text-align: center; width: 250px;">
        <p style="margin: 0; font-size: 11px; color: #64748b;">Trưởng Phòng Vật Tư - Thiết Bị</p>
        <div style="height: 60px;"></div>
        <p style="margin: 0; font-size: 12px; font-weight: 700; color: #0f172a;">(Ký và ghi rõ họ tên)</p>
      </div>
      <div style="text-align: center; width: 250px;">
        <p style="margin: 0; font-size: 11px; color: #64748b;">Người Lập Báo Cáo</p>
        <div style="height: 60px;"></div>
        <p style="margin: 0; font-size: 12px; font-weight: 700; color: #0f172a;">Dược sĩ Nguyễn Văn An</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  // We convert HTML to an image by drawing onto canvas using SVG foreignObject, or a very lightweight and reliable native canvas method.
  // Standard html2canvas can be heavy or have async loading issues. An elegant SVG foreignObject is fast, modern, natively supported by all browsers, and handles accents beautifully!
  const width = 800;
  const height = container.scrollHeight + 50;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: sans-serif; background: white; padding: 30px; box-sizing: border-box; width: 100%; height: 100%;">
          ${container.innerHTML}
        </div>
      </foreignObject>
    </svg>
  `;

  const img = new Image();
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);

      // Convert canvas to base64
      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      // Create PDF
      // A4 is 595.28 x 841.89 points. Our aspect ratio will be preserved
      const pdfWidth = 595;
      const pdfHeight = (height * pdfWidth) / width;

      const pdf = new jsPDF('p', 'pt', [pdfWidth, pdfHeight]);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bao_cao_trang_thiet_bi_${new Date().toISOString().split('T')[0]}.pdf`);
    }

    // Cleanup
    document.body.removeChild(container);
    URL.revokeObjectURL(url);
  };

  img.src = url;
}
