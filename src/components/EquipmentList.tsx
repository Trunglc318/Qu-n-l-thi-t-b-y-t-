import React, { useState, useEffect } from 'react';
import { Equipment, EquipmentStatus, UserRole, Department } from '../types';
import { Search, Filter, Calendar, Zap, AlertTriangle, Plus, QrCode, ArrowUpDown, Clock, CheckCircle, MapPin } from 'lucide-react';

interface EquipmentListProps {
  equipment: Equipment[];
  onSelect: (id: string) => void;
  onAddEquipment?: () => void;
  userRole: UserRole;
  userDepartment?: string;
  allowedDepartments?: string[];
  departments: Department[];
}

export default function EquipmentList({ 
  equipment, 
  onSelect, 
  onAddEquipment, 
  userRole, 
  userDepartment,
  allowedDepartments,
  departments
}: EquipmentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'totalUsage'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const isAllDeptsAllowed = !allowedDepartments || 
    allowedDepartments.includes('Tất cả các khoa') || 
    userRole === 'Admin' || 
    userDepartment === 'Phòng Vật Tư - TBYT';

  // Synchronize department filter on mount or when user changes
  useEffect(() => {
    if (userDepartment && !isAllDeptsAllowed) {
      setDepartmentFilter(userDepartment);
    } else {
      setDepartmentFilter('all');
    }
  }, [userDepartment, isAllDeptsAllowed]);

  // Filter logic
  const filteredEquipment = equipment.filter(eq => {
    // Check if user has permission to see this department
    if (!isAllDeptsAllowed) {
      if (!eq.department || !allowedDepartments?.includes(eq.department)) {
        return false;
      }
    }

    // Search matching: Code, Name, or Serial
    const matchesSearch = 
      eq.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.serial.toLowerCase().includes(searchTerm.toLowerCase());

    // Status matching
    const matchesStatus = statusFilter === 'all' || eq.status === statusFilter;

    // Department matching
    const matchesDepartment = departmentFilter === 'all' || eq.department === departmentFilter;

    // Date range matching (compared to firstUseDate)
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && eq.firstUseDate >= startDate;
    }
    if (endDate) {
      matchesDate = matchesDate && eq.firstUseDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesDepartment && matchesDate;
  });

  // Sort logic
  const sortedEquipment = [...filteredEquipment].sort((a, b) => {
    let valA: string | number = '';
    let valB: string | number = '';

    if (sortBy === 'id') {
      valA = a.id;
      valB = b.id;
    } else if (sortBy === 'name') {
      valA = a.name;
      valB = b.name;
    } else if (sortBy === 'totalUsage') {
      valA = a.totalUsageMinutes;
      valB = b.totalUsageMinutes;
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: 'id' | 'name' | 'totalUsage') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadge = (status: EquipmentStatus) => {
    switch (status) {
      case 'Ready':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Sẵn sàng
          </span>
        );
      case 'InUse':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Đang sử dụng
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Đang bảo trì
          </span>
        );
      case 'Faulty':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Đang hỏng
          </span>
        );
      case 'ChargingRequired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce"></span>
            Cần sạc pin
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters panel */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Text Search */}
          <div className="relative md:col-span-4">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              id="search-input"
              type="text"
              placeholder="Tìm theo Mã máy, Tên máy, Số seri..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800"
            />
          </div>

          {/* Status filter */}
          <div className="relative md:col-span-3">
            <select
              id="status-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none text-slate-800"
            >
              <option value="all">Tất cả tình trạng</option>
              <option value="Ready">Sẵn sàng sử dụng</option>
              <option value="InUse">Đang sử dụng</option>
              <option value="Maintenance">Đang bảo trì định kỳ</option>
              <option value="Faulty">Đang bị hỏng / sự cố</option>
              <option value="ChargingRequired">Yêu cầu sạc pin</option>
            </select>
            <Filter className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
          </div>

          {/* Department Filter */}
          <div className="relative md:col-span-3">
            <select
              id="department-filter-select"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none text-slate-800 font-medium"
            >
              <option value="all">Tất cả khoa phòng</option>
              {departments
                .filter(dept => isAllDeptsAllowed || allowedDepartments?.includes(dept.name))
                .map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
            </select>
            <MapPin className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
          </div>

          {/* Action button: Add Equipment */}
          <div className="md:col-span-2">
            {(userRole === 'Admin' && onAddEquipment) ? (
              <button
                id="btn-add-equipment"
                onClick={onAddEquipment}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs py-2.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Plus size={16} />
                Thêm máy mới
              </button>
            ) : (
              <div className="hidden md:block"></div>
            )}
          </div>
        </div>

        {/* Date Filter subpanel */}
        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Calendar size={14} />
            <span>Ngày đưa vào sử dụng:</span>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              id="filter-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
            />
            <span className="text-slate-400">đến</span>
            <input
              id="filter-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
            />
            {(startDate || endDate) && (
              <button
                id="btn-clear-date-filter"
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-red-500 hover:text-red-600 ml-2 font-medium"
              >
                Xóa lọc ngày
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sorting bar */}
      <div className="flex justify-between items-center px-2 text-xs text-slate-500">
        <span>Tìm thấy <strong>{sortedEquipment.length}</strong> thiết bị</span>
        <div className="flex gap-4">
          <button 
            id="sort-by-id"
            onClick={() => handleSort('id')} 
            className={`flex items-center gap-1 cursor-pointer hover:text-slate-800 ${sortBy === 'id' ? 'text-indigo-600 font-bold' : ''}`}
          >
            Mã máy <ArrowUpDown size={12} />
          </button>
          <button 
            id="sort-by-name"
            onClick={() => handleSort('name')} 
            className={`flex items-center gap-1 cursor-pointer hover:text-slate-800 ${sortBy === 'name' ? 'text-indigo-600 font-bold' : ''}`}
          >
            Tên máy <ArrowUpDown size={12} />
          </button>
          <button 
            id="sort-by-usage"
            onClick={() => handleSort('totalUsage')} 
            className={`flex items-center gap-1 cursor-pointer hover:text-slate-800 ${sortBy === 'totalUsage' ? 'text-indigo-600 font-bold' : ''}`}
          >
            Giờ sử dụng <ArrowUpDown size={12} />
          </button>
        </div>
      </div>

      {/* Responsive Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedEquipment.length > 0 ? (
          sortedEquipment.map(eq => (
            <div
              key={eq.id}
              onClick={() => onSelect(eq.id)}
              className="bg-white p-5 rounded-xl border border-slate-100 hover:border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-56"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
                      {eq.id}
                    </span>
                    {eq.department && (
                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-wider block">
                        {eq.department}
                      </span>
                    )}
                  </div>
                  {getStatusBadge(eq.status)}
                </div>

                <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {eq.name}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Số seri:</span>
                    <span className="font-semibold text-slate-700">{eq.serial}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thời gian đưa vào SD:</span>
                    <span className="text-slate-700">{eq.firstUseDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Dung lượng pin:</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            eq.batteryLevel <= 15 ? 'bg-red-500' : eq.batteryLevel <= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${eq.batteryLevel}%` }}
                        ></div>
                      </div>
                      <span className={`font-mono font-bold ${eq.batteryLevel <= 15 ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}>
                        {eq.batteryLevel}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card details */}
              <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock size={12} />
                  <span>{(eq.totalUsageMinutes / 60).toFixed(1)} giờ vận hành</span>
                </div>
                {eq.currentUser && (
                  <div className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-sm truncate max-w-[120px]">
                    Sử dụng: {eq.currentUser.split(' ').pop()}
                  </div>
                )}
                <div className="text-slate-300 group-hover:text-slate-600 transition-colors">
                  <QrCode size={16} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white border border-dashed border-slate-200 rounded-xl p-12 text-center">
            <AlertTriangle className="mx-auto text-amber-500 mb-2" size={32} />
            <h4 className="text-slate-800 font-bold text-sm">Không tìm thấy thiết bị nào</h4>
            <p className="text-slate-400 text-xs mt-1">Vui lòng điều chỉnh lại từ khóa hoặc bộ lọc của bạn.</p>
          </div>
        )}
      </div>
    </div>
  );
}
