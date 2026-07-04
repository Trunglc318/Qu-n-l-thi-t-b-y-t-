import React, { useState, useEffect } from 'react';
import { Equipment, PerformanceStats } from '../types';
import { Play, Pause, Zap, CheckCircle, Activity, ShieldAlert, Award } from 'lucide-react';

interface DashboardProps {
  equipment: Equipment[];
  stats: PerformanceStats[];
  onAddLog: (message: string) => void;
}

export default function Dashboard({ equipment, stats: initialStats, onAddLog }: DashboardProps) {
  const [stats, setStats] = useState<PerformanceStats[]>(initialStats);
  const [isLive, setIsLive] = useState(false);
  const [activeTab, setActiveTab] = useState<'uptime' | 'hours'>('uptime');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Stats calculation
  const totalCount = equipment.length;
  const readyCount = equipment.filter(e => e.status === 'Ready').length;
  const inUseCount = equipment.filter(e => e.status === 'InUse').length;
  const maintenanceCount = equipment.filter(e => e.status === 'Maintenance').length;
  const faultyCount = equipment.filter(e => e.status === 'Faulty').length;
  const chargingCount = equipment.filter(e => e.status === 'ChargingRequired').length;

  const averageUptime = (stats.reduce((acc, s) => acc + s.uptimeRate, 0) / stats.length).toFixed(1);
  const totalActiveHours = stats.reduce((acc, s) => acc + s.activeHours, 0).toFixed(1);

  // Live simulation effect
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setStats(prevStats => {
        const last = prevStats[prevStats.length - 1];
        // Simulate minor updates in live stats
        const deltaUptime = (Math.random() - 0.4) * 1.5; // Slightly upwards bias
        const newUptime = Math.min(100, Math.max(80, Number((last.uptimeRate + deltaUptime).toFixed(1))));
        const newHours = Number((last.activeHours + Math.random() * 0.5).toFixed(1));

        const updatedStats = [...prevStats];
        updatedStats[updatedStats.length - 1] = {
          ...last,
          uptimeRate: newUptime,
          activeHours: newHours
        };

        if (Math.random() > 0.8) {
          onAddLog(`[Giám sát] Máy thở SV300 tăng hiệu suất vận hành lên ${newUptime}%`);
        }

        return updatedStats;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isLive, onAddLog]);

  // SVG Chart Dimensions & Computations
  const chartHeight = 220;
  const chartWidth = 600;
  const paddingX = 40;
  const paddingY = 30;

  const maxVal = activeTab === 'uptime' ? 100 : Math.max(...stats.map(s => s.activeHours)) * 1.15;
  const minVal = activeTab === 'uptime' ? 80 : 0;

  const points = stats.map((s, i) => {
    const x = paddingX + (i * (chartWidth - 2 * paddingX)) / (stats.length - 1);
    const value = activeTab === 'uptime' ? s.uptimeRate : s.activeHours;
    const y = chartHeight - paddingY - ((value - minVal) * (chartHeight - 2 * paddingY)) / (maxVal - minVal);
    return { x, y, value, label: s.date };
  });

  // SVG Path generation
  let pathD = '';
  let areaD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;
  }

  return (
    <div id="dashboard-tab" className="space-y-6">
      {/* Real-time Simulator Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-5 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-700">
        <div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
            <span className="text-xs font-mono tracking-wider uppercase text-slate-300">Hệ Thống Giám Sát Thời Gian Thực</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold font-sans tracking-tight mt-1 text-white">Bảng Điều Khiển Thiết Bị Y Tế</h1>
          <p className="text-xs text-slate-400 mt-1">Kết nối dữ liệu vận hành Khoa phòng, tự động gửi cảnh báo & thống kê hiệu suất.</p>
        </div>
        <button
          id="btn-live-toggle"
          onClick={() => {
            setIsLive(!isLive);
            onAddLog(isLive ? "Tắt chế độ giám sát thời gian thực." : "Kích hoạt giám sát thời gian thực thành công.");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all shadow-md ${
            isLive 
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-900/20' 
              : 'bg-white hover:bg-slate-50 text-slate-900'
          }`}
        >
          {isLive ? <Pause size={16} /> : <Play size={16} />}
          {isLive ? 'Đang giám sát Live' : 'Bật giám sát Live'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Tổng thiết bị</span>
            <Activity size={18} className="text-slate-500" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalCount}</h3>
            <span className="text-[11px] text-slate-500 font-mono">Đang hoạt động tốt</span>
          </div>
        </div>

        {/* Ready */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-center text-emerald-500">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Sẵn sàng sử dụng</span>
            <CheckCircle size={18} />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{readyCount}</h3>
            <span className="text-[11px] text-emerald-600 font-semibold">● {((readyCount/totalCount)*100 || 0).toFixed(0)}% tổng kho</span>
          </div>
        </div>

        {/* In Use */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-center text-blue-500">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Đang vận hành</span>
            <Zap size={18} />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{inUseCount}</h3>
            <span className="text-[11px] text-blue-600 font-semibold">Đang liên kết BN</span>
          </div>
        </div>

        {/* Battery warnings */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-center text-amber-500">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Yêu cầu sạc pin</span>
            <Award size={18} className="rotate-180" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{chargingCount}</h3>
            <span className="text-[11px] text-amber-700 font-semibold">Cần cắm nguồn</span>
          </div>
        </div>

        {/* Faulty & Maintenance */}
        <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-center text-red-500">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Bảo trì / Lỗi</span>
            <ShieldAlert size={18} />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{maintenanceCount + faultyCount}</h3>
            <span className="text-[11px] text-red-600 font-semibold">
              {maintenanceCount} Đang bảo trì | {faultyCount} Hỏng
            </span>
          </div>
        </div>
      </div>

      {/* Real-time performance chart and widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Custom SVG Interactive Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-xs border border-slate-100">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Biểu Đồ Hiệu Suất Thiết Bị (Real-time)</h2>
              <p className="text-xs text-slate-500">Tổng quan tuần lễ từ 28/06 đến nay</p>
            </div>
            <div className="flex bg-slate-100 p-0.5 rounded-lg">
              <button
                id="tab-chart-uptime"
                onClick={() => setActiveTab('uptime')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'uptime' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Uptime (%)
              </button>
              <button
                id="tab-chart-hours"
                onClick={() => setActiveTab('hours')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'hours' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Giờ Vận Hành
              </button>
            </div>
          </div>

          {/* Interactive Custom SVG Chart Container */}
          <div className="relative pt-4">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-auto overflow-visible select-none"
            >
              {/* Grid Lines */}
              {[0, 1, 2, 3, 4].map((grid, idx) => {
                const y = paddingY + (idx * (chartHeight - 2 * paddingY)) / 4;
                const gridVal = activeTab === 'uptime' 
                  ? (100 - idx * 5).toFixed(0) // 100% to 80%
                  : (maxVal - (idx * maxVal) / 4).toFixed(1);
                return (
                  <g key={grid} className="opacity-40">
                    <line 
                      x1={paddingX} 
                      y1={y} 
                      x2={chartWidth - paddingX} 
                      y2={y} 
                      stroke="#cbd5e1" 
                      strokeDasharray="4 4" 
                      strokeWidth={1}
                    />
                    <text 
                      x={paddingX - 8} 
                      y={y + 3} 
                      fill="#64748b" 
                      fontSize="9" 
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {gridVal}{activeTab === 'uptime' ? '%' : ''}
                    </text>
                  </g>
                );
              })}

              {/* Area and Line for Uptime */}
              {activeTab === 'uptime' && points.length > 0 && (
                <>
                  {/* Gradient Fill */}
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={areaD} fill="url(#chartGrad)" />
                  <path d={pathD} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}

              {/* Bar Chart for Operating Hours */}
              {activeTab === 'hours' && points.map((p, i) => {
                const barWidth = 24;
                const barHeight = chartHeight - paddingY - p.y;
                const x = p.x - barWidth / 2;
                return (
                  <rect
                    key={i}
                    x={x}
                    y={p.y}
                    width={barWidth}
                    height={Math.max(2, barHeight)}
                    rx={3}
                    fill={hoveredIndex === i ? '#2563eb' : '#3b82f6'}
                    className="transition-colors duration-150 cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}

              {/* X Axis Labels */}
              {points.map((p, i) => (
                <text
                  key={i}
                  x={p.x}
                  y={chartHeight - 10}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight="500"
                >
                  {p.label}
                </text>
              ))}

              {/* Data Points / Interactive Tooltips for Line Chart */}
              {activeTab === 'uptime' && points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredIndex === i ? 6 : 4}
                    fill={hoveredIndex === i ? '#4f46e5' : '#ffffff'}
                    stroke="#4f46e5"
                    strokeWidth={2}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  {hoveredIndex === i && (
                    <g className="drop-shadow-sm pointer-events-none">
                      <rect
                        x={p.x - 45}
                        y={p.y - 35}
                        width="90"
                        height="24"
                        rx="4"
                        fill="#0f172a"
                      />
                      <text
                        x={p.x}
                        y={p.y - 20}
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {p.value}% Uptime
                      </text>
                    </g>
                  )}
                </g>
              ))}

              {/* Interactive Tooltips for Bar Chart */}
              {activeTab === 'hours' && points.map((p, i) => hoveredIndex === i && (
                <g key={`t-${i}`} className="drop-shadow-sm pointer-events-none">
                  <rect
                    x={p.x - 45}
                    y={p.y - 35}
                    width="90"
                    height="24"
                    rx="4"
                    fill="#0f172a"
                  />
                  <text
                    x={p.x}
                    y={p.y - 20}
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {p.value} giờ SD
                  </text>
                </g>
              ))}
            </svg>
            
            {/* Live indicator bubble */}
            {isLive && (
              <div className="absolute top-2 right-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>DATA STREAM LIVE</span>
              </div>
            )}
          </div>
        </div>

        {/* Operational Health Widget */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Chỉ số Hoạt Động (KPi)</h2>
            <p className="text-xs text-slate-500 mb-4">Các tham số hiệu chỉnh thời gian thực</p>

            <div className="space-y-4">
              {/* Uptime Circle / Parameter */}
              <div>
                <div className="flex justify-between items-center mb-1 text-xs font-semibold">
                  <span className="text-slate-600">Hiệu Suất Phân Bổ (Uptime)</span>
                  <span className="text-indigo-600">{averageUptime}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-500" 
                    style={{ width: `${averageUptime}%` }}
                  ></div>
                </div>
              </div>

              {/* Charging compliance */}
              <div>
                <div className="flex justify-between items-center mb-1 text-xs font-semibold">
                  <span className="text-slate-600">Hoàn thành sạc định kỳ</span>
                  <span className="text-emerald-600">
                    {totalCount > 0 ? (((totalCount - chargingCount) / totalCount) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-500" 
                    style={{ width: `${totalCount > 0 ? ((totalCount - chargingCount) / totalCount) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Maintenance schedule coverage */}
              <div>
                <div className="flex justify-between items-center mb-1 text-xs font-semibold">
                  <span className="text-slate-600">Tuân thủ lịch bảo trì</span>
                  <span className="text-amber-600">
                    {totalCount > 0 ? (((totalCount - faultyCount) / totalCount) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full transition-all duration-500" 
                    style={{ width: `${totalCount > 0 ? ((totalCount - faultyCount) / totalCount) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 -mx-5 -mb-5 p-5 rounded-b-xl flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Award size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Bảo Thắng Đạt Kỷ Lục Vận Hành</p>
              <p className="text-[10px] text-slate-500">Tỷ lệ sự cố &lt; 2% trên tổng số máy thở định kỳ.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
