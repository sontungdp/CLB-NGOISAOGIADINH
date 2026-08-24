import React, { useState } from 'react';
import { ClassSession, Branch, Discipline, Student, BranchFilter } from '../types';
import { Clock, Users, Plus, Edit2, Trash2, MapPin, Award, Check, X } from 'lucide-react';

interface ClassManagementProps {
  classes: ClassSession[];
  branches: Branch[];
  disciplines: Discipline[];
  students: Student[];
  branchFilter: BranchFilter;
  onSelectBranchFilter: (filter: BranchFilter) => void;
  onSaveClass: (classSession: ClassSession) => void;
  onDeleteClass: (classId: string) => void;
}

export const ClassManagement: React.FC<ClassManagementProps> = ({
  classes,
  branches,
  disciplines,
  students,
  branchFilter,
  onSelectBranchFilter,
  onSaveClass,
  onDeleteClass,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSession | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [branchId, setBranchId] = useState<'cn1' | 'cn2' | 'all'>('all');
  const [disciplineId, setDisciplineId] = useState('boxing');
  const [coachName, setCoachName] = useState('');
  const [timeSlot, setTimeSlot] = useState('18:00 - 19:30');
  const [scheduleDays, setScheduleDays] = useState<string[]>(['T2', 'T4', 'T6']);
  const [maxStudents, setMaxStudents] = useState(20);
  const [room, setRoom] = useState('Phòng Tập 1');

  const filteredClasses = classes.filter(
    (c) => branchFilter === 'all' || c.branchId === 'all' || c.branchId === branchFilter
  );

  const handleOpenAdd = () => {
    setEditingClass(null);
    setName('');
    setBranchId(branchFilter === 'cn2' ? 'cn2' : branchFilter === 'cn1' ? 'cn1' : 'all');
    setDisciplineId(disciplines[0]?.id || 'boxing');
    setCoachName('');
    setTimeSlot('18:00 - 19:30');
    setScheduleDays(['T2', 'T4', 'T6']);
    setMaxStudents(20);
    setRoom('Sàn Đấu A');
    setModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassSession) => {
    setEditingClass(cls);
    setName(cls.name);
    setBranchId(cls.branchId);
    setDisciplineId(cls.disciplineId);
    setCoachName(cls.coachName);
    setTimeSlot(cls.timeSlot);
    setScheduleDays(cls.scheduleDays);
    setMaxStudents(cls.maxStudents);
    setRoom(cls.room || '');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !coachName.trim()) return;

    const saved: ClassSession = {
      id: editingClass?.id || `cls-${Date.now()}`,
      name: name.trim(),
      branchId,
      disciplineId,
      coachName: coachName.trim(),
      timeSlot: timeSlot.trim(),
      scheduleDays,
      maxStudents,
      room: room.trim() || undefined,
    };

    onSaveClass(saved);
    setModalOpen(false);
  };

  const DAYS_OPTIONS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  const toggleDay = (day: string) => {
    if (scheduleDays.includes(day)) {
      setScheduleDays(scheduleDays.filter((d) => d !== day));
    } else {
      setScheduleDays([...scheduleDays, day]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-700">
              <Clock className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Quản Lý Lớp & Ca Tập Luyện</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Thời khóa biểu các lớp võ thuật, sàn đấu và HLV phụ trách tại 2 chi nhánh.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={branchFilter}
            onChange={(e) => onSelectBranchFilter(e.target.value as BranchFilter)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-red-600 focus:bg-white cursor-pointer font-medium"
          >
            <option value="all">🏢 Tất cả 2 Chi Nhánh</option>
            <option value="cn1">📍 Cơ Sở 1 (Phan Chu Trinh)</option>
            <option value="cn2">📍 Cơ Sở 2 (Nơ Trang Long)</option>
          </select>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Thêm Lớp Học Mới
          </button>
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((cls) => {
          const discipline = disciplines.find((d) => d.id === cls.disciplineId);
          const branch = branches.find((b) => b.id === cls.branchId);
          const enrolledCount = students.filter((s) => s.classId === cls.id).length;

          return (
            <div
              key={cls.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                      cls.branchId === 'all'
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : cls.branchId === 'cn1'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}
                  >
                    <MapPin className="w-3 h-3" />
                    {cls.branchId === 'all'
                      ? 'Cả 2 Chi Nhánh'
                      : branch?.shortName || (cls.branchId === 'cn1' ? 'Cơ Sở 1 (Phan Chu Trinh)' : 'Cơ Sở 2 (Nơ Trang Long)')}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cls)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteClass(cls.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base mt-2">{cls.name}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <p className="text-xs text-amber-800 font-medium">{discipline?.name || 'Võ Thuật'}</p>
                  {cls.disciplineId === 'nangkheiu' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-300">
                      <Award className="w-3 h-3 text-purple-600" />
                      Không thu phí (0đ)
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>HLV Phụ Trách:</span>
                    <span className="font-semibold text-slate-800">{cls.coachName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Giờ Tập Luyện:</span>
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {cls.timeSlot}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Phòng / Sàn:</span>
                    <span className="text-slate-700">{cls.room || 'Phòng chính'}</span>
                  </div>
                </div>

                {/* Days badges */}
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
                  {DAYS_OPTIONS.map((d) => (
                    <span
                      key={d}
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        cls.scheduleDays.includes(d)
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-50 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Capacity footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Sĩ số học viên:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {enrolledCount} / {cls.maxStudents} HV
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Class */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-6">
            
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">
                {editingClass ? 'Chỉnh Sửa Lớp & Ca Tập' : 'Tạo Lớp Học Mới'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên Lớp Học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Boxing Nâng Cao & Đối Kháng"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-red-600 focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cơ Sở / Chi Nhánh Áp Dụng
                  </label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value as 'cn1' | 'cn2' | 'all')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-red-600 focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="all">🏢 Cả 2 Chi Nhánh (Toàn Hệ Thống)</option>
                    <option value="cn1">📍 Cơ Sở 1 (2A Phan Chu Trinh)</option>
                    <option value="cn2">📍 Cơ Sở 2 (25A Nơ Trang Long)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bộ Môn
                  </label>
                  <select
                    value={disciplineId}
                    onChange={(e) => setDisciplineId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-red-600 focus:bg-white outline-none cursor-pointer"
                  >
                    {disciplines.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    HLV Phụ Trách <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={coachName}
                    onChange={(e) => setCoachName(e.target.value)}
                    placeholder="HLV Hoàng Long"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-red-600 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Khung Giờ Tập
                  </label>
                  <input
                    type="text"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    placeholder="18:00 - 19:30"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-red-600 focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Days selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Lịch Tập Các Ngày Trong Tuần
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OPTIONS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        scheduleDays.includes(day)
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                          : 'bg-slate-50 border border-slate-200 text-slate-600'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sĩ Số Tối Đa
                  </label>
                  <input
                    type="number"
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(Number(e.target.value))}
                    min={5}
                    max={50}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-red-600 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phòng / Sàn Tập
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="Sàn Đấu A - Lầu 1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-red-600 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Lưu Lớp Học
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
