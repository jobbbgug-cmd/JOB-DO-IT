'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import './CreateTaskModal.css';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyCode?: string;
}

interface Employee {
  id: string;
  name: string;
}

export default function CreateTaskModal({ isOpen, onClose, companyCode }: CreateTaskModalProps) {
  const { user } = useAuthStore();
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'all' | 'self'>('all');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [type, setType] = useState<'routine' | 'urgent'>('routine');
  const [priority, setPriority] = useState<string>('normal');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [notification, setNotification] = useState<'none' | 'once' | 'repeat'>('none');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showEmpPicker, setShowEmpPicker] = useState(false);
  const [empSearchTerm, setEmpSearchTerm] = useState<string>('');
  const [reminderDate, setReminderDate] = useState<string>('');
  const [reminderTime, setReminderTime] = useState<string>('09:00');
  const [repeatFrequency, setRepeatFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [repeatTime, setRepeatTime] = useState<string>('09:00');
  const [resetCard, setResetCard] = useState<boolean>(true);
  const [selectedDays, setSelectedDays] = useState<number[]>([4]); // 4 = Thursday
  const [selectedMonthDay, setSelectedMonthDay] = useState<number>(15); // Default to 15th

  const daysOfWeek = [
    { index: 0, short: 'อา', full: 'อาทิตย์' },
    { index: 1, short: 'จ', full: 'จันทร์' },
    { index: 2, short: 'อ', full: 'อังคาร' },
    { index: 3, short: 'พ', full: 'พุธ' },
    { index: 4, short: 'พฤ', full: 'พฤหัสบดี' },
    { index: 5, short: 'ศ', full: 'ศุกร์' },
    { index: 6, short: 'ส', full: 'เสาร์' },
  ];

  const handleDayToggle = (dayIndex: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  useEffect(() => {
    if (isOpen && companyCode) {
      fetchEmployees();
    }
  }, [isOpen, companyCode]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`/api/employees/${companyCode}`);
      if (response.ok) {
        const data = await response.json();
        const transformed = data.map((emp: any) => ({
          id: emp.id || emp._id,
          name: emp.name,
        }));
        setEmployees(transformed);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleAssigneeToggle = (empId: string) => {
    setAssignees((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const handleClose = () => {
    setTaskName('');
    setDescription('');
    setVisibility('all');
    setAssignees([]);
    setType('routine');
    setPriority('normal');
    setDateRange(null);
    setNotification('none');
    setAttachments([]);
    onClose();
  };

  const handleCreateTask = () => {
    console.log({
      taskName,
      description,
      visibility,
      assignees,
      type,
      priority,
      dateRange,
      notification,
      attachments,
    });
    handleClose();
  };

  const isFormValid = taskName.trim().length > 0;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="panel" style={{ maxWidth: '500px' }}>
        <button
          className="icon-btn"
          aria-label="ปิด"
          title="ปิด"
          onClick={handleClose}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12"></path>
          </svg>
        </button>

        <h1 style={{ paddingRight: '40px' }}>กรอกงานแบบละเอียด</h1>
        <p className="lead">ระบุรายละเอียด กำหนดวัน และแนบไฟล์ให้ครบในครั้งเดียว</p>

        <div className="ai-fields">
          <div className="field">
            <label>ชื่องาน</label>
            <input
              className="set-input"
              placeholder="เช่น ออกแบบโปสเตอร์งานเปิดตัว"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />
          </div>

          <div className="field">
            <label>รายละเอียดงาน</label>
            <textarea
              className="set-input"
              placeholder="อธิบายเพิ่มเติม (ไม่บังคับ)"
              style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label>ใครเห็นงานนี้</label>
          <div className="seg" role="group" aria-label="การมองเห็น">
            <button
              type="button"
              className={visibility === 'all' ? 'on' : ''}
              onClick={() => setVisibility('all')}
            >
              ทุกคน
            </button>
            <button
              type="button"
              className={visibility === 'self' ? 'on' : ''}
              onClick={() => setVisibility('self')}
            >
              แค่ตัวเอง
            </button>
          </div>
        </div>

        <div className="field">
          <label>มอบหมายให้ <span className="field-hint">(เลือกได้หลายคน)</span></label>
          {visibility === 'self' ? (
            <p className="note" style={{ margin: 0, textAlign: 'center' }}>
              งานส่วนตัว — มอบให้ {user?.name} (ตัวคุณเอง)
            </p>
          ) : (
            <div className="emp-picker" style={{ position: 'relative' }}>
              <button
                type="button"
                className="emp-picker-trigger"
                aria-haspopup="listbox"
                aria-expanded={showEmpPicker}
                aria-label="มอบหมายงานให้"
                onClick={() => setShowEmpPicker(!showEmpPicker)}
              >
                {assignees.length > 0 ? (
                  <div className="emp-picker-avatars">
                    <div className="emp-avatars-group">
                      {employees
                        .filter((emp) => assignees.includes(emp.id))
                        .slice(0, 3)
                        .map((emp, idx) => {
                          const initials = emp.name.substring(0, 2).toUpperCase();
                          const colors = ['#5B7FB0', '#E4572E', '#0E9384', '#C98A0E', '#D2504F'];
                          const colorIndex = emp.id.charCodeAt(0) % colors.length;
                          const bgColor = colors[colorIndex];
                          return (
                            <div
                              key={emp.id}
                              className="emp-avatar-badge"
                              style={{
                                backgroundColor: bgColor,
                                marginLeft: idx > 0 ? '-0.5rem' : '0',
                              }}
                              title={emp.name}
                            >
                              {initials}
                            </div>
                          );
                        })}
                    </div>
                    <span className="emp-picker-count">{assignees.length} คน</span>
                  </div>
                ) : (
                  <span className="emp-picker-name muted">เลือกผู้รับงาน</span>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down emp-picker-caret" aria-hidden="true">
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </button>

              {showEmpPicker && (
                <div className="emp-picker-menu">
                  <input
                    type="text"
                    className="emp-picker-search"
                    placeholder="ค้นหาชื่อพนักงาน…"
                    value={empSearchTerm}
                    onChange={(e) => setEmpSearchTerm(e.target.value)}
                    autoComplete="off"
                  />
                  <div className="emp-picker-list" role="listbox" aria-multiselectable="true">
                    {employees.length === 0 ? (
                      <div className="emp-picker-empty">ไม่มีพนักงาน</div>
                    ) : (
                      employees
                        .filter((emp) =>
                          emp.name.toLowerCase().includes(empSearchTerm.toLowerCase())
                        )
                        .map((emp) => {
                          const isSelected = assignees.includes(emp.id);
                          const initials = emp.name.substring(0, 2).toUpperCase();
                          const colors = ['#5B7FB0', '#E4572E', '#0E9384', '#C98A0E', '#D2504F'];
                          const colorIndex = emp.id.charCodeAt(0) % colors.length;
                          const bgColor = colors[colorIndex];

                          return (
                            <button
                              key={emp.id}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              className={`emp-picker-opt ${isSelected ? 'sel' : ''}`}
                              onClick={() => handleAssigneeToggle(emp.id)}
                            >
                              <span className="emp-ava" style={{ backgroundColor: bgColor }}>
                                {initials}
                              </span>
                              <span className="emp-picker-name">{emp.name}</span>
                              {isSelected && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="emp-picker-check"
                                >
                                  <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                              )}
                            </button>
                          );
                        })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="field">
          <label>ประเภท</label>
          <div className="seg" role="group" aria-label="ประเภทงาน">
            <button
              type="button"
              data-lane="routine"
              className={type === 'routine' ? 'on' : ''}
              onClick={() => setType('routine')}
            >
              <span className="d"></span>รูทีน
            </button>
            <button
              type="button"
              data-lane="urgent"
              className={type === 'urgent' ? 'on' : ''}
              onClick={() => setType('urgent')}
            >
              <span className="d"></span>จิกปะทะ
            </button>
          </div>
        </div>

        <div className="field">
          <label>แท็กความสำคัญ</label>
          <div className="prio-picker" role="group" aria-label="แท็กความสำคัญ">
            {[
              { value: 'critical', label: 'ด่วนมาก', color: '#D2504F' },
              { value: 'high', label: 'ด่วน', color: '#E4572E' },
              { value: 'normal', label: 'ปกติ', color: '#0E9384' },
              { value: 'low', label: 'ไม่รีบ', color: '#5B7FB0' },
              { value: 'later', label: 'ทำเมื่อว่าง', color: '#8A8F98' },
            ].map((p) => {
              const isSelected = priority === p.value;
              const bgColor = isSelected ? `${p.color}26` : 'transparent';
              return (
                <button
                  key={p.value}
                  type="button"
                  className={`prio-chip ${isSelected ? 'on' : ''}`}
                  style={{
                    '--prio': p.color,
                    backgroundColor: bgColor,
                  } as React.CSSProperties}
                  onClick={() => setPriority(p.value)}
                >
                  <span className="d"></span>{p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="field">
          <label>ช่วงวันที่ทำงาน</label>
          <button
            type="button"
            className="set-input date-trigger"
            aria-haspopup="dialog"
            aria-expanded="false"
            data-state="closed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar date-trigger-icon" aria-hidden="true">
              <path d="M8 2v4"></path>
              <path d="M16 2v4"></path>
              <rect width="18" height="18" x="3" y="4" rx="2"></rect>
              <path d="M3 10h18"></path>
            </svg>
            <span className="date-trigger-ph">เลือกช่วงวันที่ทำงาน</span>
          </button>
        </div>

        <div className="field">
          <label>แจ้งเตือน / ทำซ้ำ</label>
          <div className="seg" role="group" aria-label="รูปแบบการแจ้งเตือน">
            <button
              type="button"
              className={notification === 'none' ? 'on' : ''}
              onClick={() => setNotification('none')}
            >
              ไม่เตือน
            </button>
            <button
              type="button"
              className={notification === 'once' ? 'on' : ''}
              onClick={() => setNotification('once')}
            >
              ครั้งเดียว
            </button>
            <button
              type="button"
              className={notification === 'repeat' ? 'on' : ''}
              onClick={() => setNotification('repeat')}
            >
              ทำซ้ำ
            </button>
          </div>

          {notification === 'once' ? (
            <>
              <div className="remind-row" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  className="set-input date-trigger"
                  aria-haspopup="dialog"
                  aria-expanded="false"
                  data-state="closed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar date-trigger-icon" aria-hidden="true">
                    <path d="M8 2v4"></path>
                    <path d="M16 2v4"></path>
                    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                    <path d="M3 10h18"></path>
                  </svg>
                  <span>{reminderDate || new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </button>
                <input
                  type="time"
                  className="set-input"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
              <p className="note" style={{ margin: '6px 0px 0px' }}>เวลานี้ผ่านไปแล้ว — บันทึกแล้วจะเตือนทันทีในรอบตรวจถัดไป (ทุก 5 นาที)</p>
            </>
          ) : notification === 'repeat' ? (
            <>
              <div className="seg" role="group" aria-label="ความถี่" style={{ marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className={repeatFrequency === 'daily' ? 'on' : ''}
                  onClick={() => setRepeatFrequency('daily')}
                >
                  ทุกวัน
                </button>
                <button
                  type="button"
                  className={repeatFrequency === 'weekly' ? 'on' : ''}
                  onClick={() => setRepeatFrequency('weekly')}
                >
                  ทุกสัปดาห์
                </button>
                <button
                  type="button"
                  className={repeatFrequency === 'monthly' ? 'on' : ''}
                  onClick={() => setRepeatFrequency('monthly')}
                >
                  ทุกเดือน
                </button>
              </div>

              {repeatFrequency === 'weekly' && (
                <div className="prio-picker" role="group" aria-label="วันในสัปดาห์" style={{ marginTop: '0.5rem' }}>
                  {daysOfWeek.map((day) => (
                    <button
                      key={day.index}
                      type="button"
                      className={`prio-chip ${selectedDays.includes(day.index) ? 'on' : ''}`}
                      title={day.full}
                      style={{ '--prio': '#0E9384' } as React.CSSProperties}
                      onClick={() => handleDayToggle(day.index)}
                    >
                      <span className="d"></span>{day.short}
                    </button>
                  ))}
                </div>
              )}

              {repeatFrequency === 'monthly' && (
                <div className="month-days" role="group" aria-label="วันที่ของเดือน" style={{ marginTop: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`month-day ${selectedMonthDay === day ? 'on' : ''}`}
                      onClick={() => setSelectedMonthDay(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}

              <div className="remind-row" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="muted-note" style={{ color: '#9ca3af', fontSize: '0.875rem', flexShrink: 0 }}>เวลา</span>
                <input
                  type="time"
                  className="set-input"
                  value={repeatTime}
                  onChange={(e) => setRepeatTime(e.target.value)}
                />
              </div>

              <label className="remind-check" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', cursor: 'pointer', color: '#d1d5db', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  checked={resetCard}
                  onChange={(e) => setResetCard(e.target.checked)}
                  style={{ cursor: 'pointer', accentColor: '#06b6d4' }}
                />
                ถึงรอบใหม่แล้วรีเซ็ตการ์ดกลับเป็น "งานทั้งหมด" 0%
              </label>

              <p className="note" style={{ margin: '6px 0px 0px' }}>
                {repeatFrequency === 'monthly'
                  ? 'เดือนไหนไม่มีวันที่ที่เลือก จะเตือนวันสุดท้ายของเดือนนั้นแทน'
                  : 'แจ้งทั้งกระดิ่งในแอปและอีเมลของผู้ถืองานทุกคน'}
              </p>
            </>
          ) : (
            <p className="note" style={{ margin: '6px 0px 0px' }}>ตั้งได้ทั้งเตือนครั้งเดียว หรือทำซ้ำ เช่น งานสรุปทุกวันศุกร์ 12:00</p>
          )}
        </div>

        <div className="field">
          <label>แนบไฟล์</label>
          <label className="attach-btn" title="เพิ่มรูป วิดีโอ หรือเอกสาร">
            <span className="attach-plus">+</span>
            เพิ่มไฟล์
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime,application/pdf,text/plain,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip,application/x-zip-compressed"
              multiple
              hidden
              onChange={(e) => setAttachments(Array.from(e.target.files || []))}
            />
          </label>
          <p className="note" style={{ margin: '6px 0px 0px' }}>รูป วิดีโอ และเอกสาร (Excel, Word, PowerPoint, PDF, ZIP) ไฟล์ละไม่เกิน 10 MB</p>
        </div>

        <button
          className="btn-primary"
          disabled={!isFormValid}
          onClick={handleCreateTask}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5"></path>
          </svg> สร้างงาน
        </button>
      </div>
    </div>
  );
}
