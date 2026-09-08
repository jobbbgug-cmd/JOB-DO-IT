'use client';

import { useState, useEffect } from 'react';
import './CreateTaskModal.css';

interface EditTaskModalProps {
  task: any | null;
  onClose: () => void;
  companyCode?: string;
  onTaskUpdated?: () => void;
}

interface Employee {
  id: string;
  name: string;
}

export default function EditTaskModal({ task, onClose, companyCode, onTaskUpdated }: EditTaskModalProps) {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'all' | 'self'>('all');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [type, setType] = useState<'routine' | 'urgent'>('routine');
  const [priority, setPriority] = useState<string>('normal');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [notification, setNotification] = useState<'none' | 'once' | 'repeat'>('none');
  const [attachments, setAttachments] = useState<(File | { url: string; name: string; isExisting: boolean })[]>([]);
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reminderDate, setReminderDate] = useState<string>('');
  const [reminderTime, setReminderTime] = useState<string>('09:00');
  const [repeatFrequency, setRepeatFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [repeatTime, setRepeatTime] = useState<string>('09:00');
  const [resetCard, setResetCard] = useState<boolean>(true);
  const [selectedDays, setSelectedDays] = useState<number[]>([4]);
  const [selectedMonthDay, setSelectedMonthDay] = useState<number>(15);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [showReminderDatePicker, setShowReminderDatePicker] = useState(false);
  const [reminderPickerDate, setReminderPickerDate] = useState(new Date());

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

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), day);

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(newDate);
      setSelectedEndDate(null);
    } else if (newDate < selectedStartDate) {
      setSelectedStartDate(newDate);
    } else {
      setSelectedEndDate(newDate);
    }
  };

  const handleDoneDatePicker = () => {
    if (selectedStartDate && selectedEndDate) {
      const start = selectedStartDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
      const end = selectedEndDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
      setDateRange({ start, end });
      setShowDatePicker(false);
    }
  };

  useEffect(() => {
    if (task) {
      console.log('Task loaded:', task);
      console.log('Task attachments:', task.attachments);

      setTaskName(task.title || '');
      setDescription(task.description || '');
      const taskAssignees = task?.assignees && Array.isArray(task.assignees) ? task.assignees : (task?.assignee ? [task.assignee] : []);
      setAssignees(taskAssignees);
      setType(task.lane || 'routine');

      // Map DB priority values to UI values
      const dbToPriorityMap: { [key: string]: string } = {
        'urgent': 'critical',
        'high': 'high',
        'medium': 'normal',
        'low': 'low',
      };
      const uiPriority = dbToPriorityMap[task.priority] || 'normal';
      setPriority(uiPriority);

      // Load date range from task
      if (task.startDate && task.endDate) {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);
        const start = startDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
        const end = endDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
        setDateRange({ start, end });
        setSelectedStartDate(startDate);
        setSelectedEndDate(endDate);
      }

      // Load notification settings from task
      if (task.notification) {
        setNotification(task.notification);
        if (task.notification === 'once') {
          setReminderDate(task.reminderDate || '');
          setReminderTime(task.reminderTime || '09:00');
        }
        if (task.notification === 'repeat') {
          setRepeatFrequency(task.repeatFrequency || 'daily');
          setSelectedDays(task.selectedDays || [4]);
          setSelectedMonthDay(task.selectedMonthDay || 15);
          setRepeatTime(task.repeatTime || '09:00');
          setResetCard(task.resetCard !== false);
        }
      }

      // Load existing attachments from task
      if (task.attachments && Array.isArray(task.attachments) && task.attachments.length > 0) {
        console.log('Processing attachments:', task.attachments);
        const loadAttachments = async () => {
          const attachmentData = await Promise.all(
            task.attachments.map(async (attId: string) => {
              try {
                const res = await fetch(`/api/attachments/${attId}`);
                if (res.ok) {
                  const data = await res.json();
                  return {
                    url: data.dataUrl,
                    name: data.fileName,
                    isExisting: true,
                    id: attId,
                  };
                }
              } catch (error) {
                console.error('Failed to fetch attachment:', error);
              }
              return {
                url: '',
                name: attId,
                isExisting: true,
                id: attId,
              };
            })
          );
          console.log('Loaded attachments:', attachmentData);
          setAttachments(attachmentData as any);
        };
        loadAttachments();
      } else {
        console.log('No attachments found');
        setAttachments([]);
      }
    }
  }, [task]);

  useEffect(() => {
    if (companyCode) {
      fetchEmployees();
    }
  }, [companyCode]);

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

  const handleUpdateTask = async () => {
    if (!task?.id || !taskName.trim()) {
      console.error('Missing required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const priorityMap: { [key: string]: string } = {
        'critical': 'urgent',
        'high': 'high',
        'normal': 'medium',
        'low': 'low',
        'later': 'low',
      };

      // Prepare FormData for attachments
      const formData = new FormData();
      formData.append('title', taskName);
      formData.append('description', description);
      formData.append('lane', type);
      formData.append('priority', priorityMap[priority] || 'medium');
      formData.append('assignees', JSON.stringify(visibility === 'self' ? [task.createdBy] : assignees));

      // Add date range
      if (dateRange?.start) {
        formData.append('startDate', dateRange.start);
      }
      if (dateRange?.end) {
        formData.append('endDate', dateRange.end);
      }

      // Add notification settings
      formData.append('notification', notification);
      if (notification === 'once' && reminderDate) {
        formData.append('reminderDate', reminderDate);
        formData.append('reminderTime', reminderTime);
      }
      if (notification === 'repeat') {
        formData.append('repeatFrequency', repeatFrequency);
        formData.append('selectedDays', JSON.stringify(selectedDays));
        formData.append('selectedMonthDay', String(selectedMonthDay));
        formData.append('repeatTime', repeatTime);
        formData.append('resetCard', String(resetCard));
      }

      // Add new attachments (not existing ones)
      const newAttachments = attachments.filter((att: any) => att instanceof File);
      newAttachments.forEach((file: File) => {
        formData.append('attachments', file);
      });

      // Add deleted attachment IDs to remove from DB
      if (deletedAttachmentIds.length > 0) {
        formData.append('deletedAttachmentIds', JSON.stringify(deletedAttachmentIds));
      }

      const response = await fetch(`/api/tasks/edit/${task.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
        onTaskUpdated?.();
        setTimeout(() => handleClose(), 500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsSubmitting(false);
    }
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

  if (!task) return null;

  const isFormValid = taskName.trim().length > 0;

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) handleClose();
    }}>
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

        <h1 style={{ paddingRight: '40px' }}>แก้ไขงาน</h1>

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
          <div className="prio-picker" role="group" aria-label="ผู้ถืองาน">
            {employees.map((emp) => {
              const colors = ['#5B7FB0', '#E4572E', '#0E9384', '#C98A0E', '#D2504F'];
              const colorIndex = emp.id.charCodeAt(0) % colors.length;
              const bgColor = colors[colorIndex];
              const isSelected = assignees.includes(emp.id);
              return (
                <button
                  key={emp.id}
                  type="button"
                  className={`prio-chip ${isSelected ? 'on' : ''}`}
                  style={{ '--prio': bgColor } as any}
                  onClick={() => handleAssigneeToggle(emp.id)}
                >
                  <span className="d"></span>
                  {emp.name}
                </button>
              );
            })}
          </div>

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
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="date-trigger"
              aria-haspopup="dialog"
              aria-expanded={showDatePicker}
              data-state={showDatePicker ? 'open' : 'closed'}
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar date-trigger-icon" aria-hidden="true">
                <path d="M8 2v4"></path>
                <path d="M16 2v4"></path>
                <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                <path d="M3 10h18"></path>
              </svg>
              <span className="date-trigger-ph">
                {dateRange ? `${dateRange.start} - ${dateRange.end}` : 'เลือกช่วงวันที่ทำงาน'}
              </span>
            </button>

            {showDatePicker && (
              <div className="date-picker-popup" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000, marginTop: '0.5rem' }}>
                <div className="date-picker-header">
                  <button
                    type="button"
                    className="date-picker-nav"
                    onClick={() => setPickerDate(new Date(pickerDate.getFullYear(), pickerDate.getMonth() - 1))}
                  >
                    ◀
                  </button>
                  <span className="date-picker-month">
                    {pickerDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    type="button"
                    className="date-picker-nav"
                    onClick={() => setPickerDate(new Date(pickerDate.getFullYear(), pickerDate.getMonth() + 1))}
                  >
                    ▶
                  </button>
                </div>

                <div className="date-picker-weekdays">
                  {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => (
                    <div key={day} className="date-picker-weekday">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="date-picker-days">
                  {Array.from({ length: getFirstDayOfMonth(pickerDate) }).map((_, i) => (
                    <div key={`empty-${i}`} className="date-picker-day empty"></div>
                  ))}
                  {Array.from({ length: getDaysInMonth(pickerDate) }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), day);
                    const isToday =
                      date.toDateString() === new Date().toDateString();
                    const isStartDate =
                      selectedStartDate && date.toDateString() === selectedStartDate.toDateString();
                    const isEndDate =
                      selectedEndDate && date.toDateString() === selectedEndDate.toDateString();
                    const isInRange =
                      selectedStartDate &&
                      selectedEndDate &&
                      date > selectedStartDate &&
                      date < selectedEndDate;

                    return (
                      <button
                        key={day}
                        type="button"
                        className={`date-picker-day ${isToday ? 'today' : ''} ${
                          isStartDate || isEndDate ? 'selected' : ''
                        } ${isInRange ? 'in-range' : ''}`}
                        onClick={() => handleDateClick(day)}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                <div className="date-picker-footer">
                  <button
                    type="button"
                    className="date-picker-btn clear"
                    onClick={() => {
                      setSelectedStartDate(null);
                      setSelectedEndDate(null);
                    }}
                  >
                    ล้าง
                  </button>
                  <button
                    type="button"
                    className="date-picker-btn done"
                    onClick={handleDoneDatePicker}
                    disabled={!selectedStartDate || !selectedEndDate}
                  >
                    เสร็จ
                  </button>
                </div>
              </div>
            )}
          </div>
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
                <div style={{ position: 'relative', flex: 1, backgroundColor: '#1e293b', borderRadius: '0.375rem', padding: '0.5rem' }}>
                  <button
                    type="button"
                    className="date-trigger"
                    aria-haspopup="dialog"
                    aria-expanded={showReminderDatePicker}
                    data-state={showReminderDatePicker ? 'open' : 'closed'}
                    onClick={() => setShowReminderDatePicker(!showReminderDatePicker)}
                    style={{ minHeight: '44px', display: 'flex', alignItems: 'center', backgroundColor: '#2d3748', border: 'none', width: '100%' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar date-trigger-icon" aria-hidden="true">
                      <path d="M8 2v4"></path>
                      <path d="M16 2v4"></path>
                      <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                      <path d="M3 10h18"></path>
                    </svg>
                    <span>{reminderDate || new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </button>

                  {showReminderDatePicker && (
                    <div className="date-picker-popup" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000, marginTop: '0.5rem' }}>
                      <div className="date-picker-header">
                        <button
                          type="button"
                          className="date-picker-nav"
                          onClick={() => setReminderPickerDate(new Date(reminderPickerDate.getFullYear(), reminderPickerDate.getMonth() - 1))}
                        >
                          ◀
                        </button>
                        <span className="date-picker-month">
                          {reminderPickerDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                        </span>
                        <button
                          type="button"
                          className="date-picker-nav"
                          onClick={() => setReminderPickerDate(new Date(reminderPickerDate.getFullYear(), reminderPickerDate.getMonth() + 1))}
                        >
                          ▶
                        </button>
                      </div>

                      <div className="date-picker-weekdays">
                        {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => (
                          <div key={day} className="date-picker-weekday">
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="date-picker-days">
                        {Array.from({ length: getFirstDayOfMonth(reminderPickerDate) }).map((_, i) => (
                          <div key={`empty-${i}`} className="date-picker-day empty"></div>
                        ))}
                        {Array.from({ length: getDaysInMonth(reminderPickerDate) }).map((_, i) => {
                          const day = i + 1;
                          const date = new Date(reminderPickerDate.getFullYear(), reminderPickerDate.getMonth(), day);
                          const isToday = date.toDateString() === new Date().toDateString();
                          const isSelected = reminderDate && date.toDateString() === new Date(reminderDate).toDateString();

                          return (
                            <button
                              key={day}
                              type="button"
                              className={`date-picker-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                              onClick={() => {
                                setReminderDate(date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }));
                                setShowReminderDatePicker(false);
                              }}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <input
                  type="time"
                  className="set-input"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  style={{ flex: 1, minWidth: '80px' }}
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
                <div className="prio-picker day-picker" role="group" aria-label="วันในสัปดาห์" style={{ marginTop: '0.5rem' }}>
                  {daysOfWeek.map((day) => (
                    <button
                      key={day.index}
                      type="button"
                      className={`prio-chip ${selectedDays.includes(day.index) ? 'on' : ''}`}
                      title={day.full}
                      onClick={() => handleDayToggle(day.index)}
                    >
                      {day.short}
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
                <span className="muted-note" style={{ color: '#9ca3af', fontSize: '0.75rem', flexShrink: 0 }}>เวลา</span>
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
          {attachments.length > 0 && (
            <div style={{ marginBottom: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem', paddingBottom: '0.5rem' }}>
              {attachments.map((file, idx) => {
                const isFile = file instanceof File;
                const fileName = isFile ? (file as File).name : (file as any).name;
                const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
                
                const getFileIcon = (ext: string) => {
                  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'].includes(ext)) return '🖼️';
                  if (['mp4', 'webm', 'quicktime', 'mov'].includes(ext)) return '🎬';
                  if (['pdf'].includes(ext)) return '📄';
                  if (['txt', 'csv'].includes(ext)) return '📝';
                  if (['xls', 'xlsx'].includes(ext)) return '📊';
                  if (['doc', 'docx'].includes(ext)) return '📋';
                  if (['ppt', 'pptx'].includes(ext)) return '🎯';
                  if (['zip'].includes(ext)) return '📦';
                  return '📎';
                };

                return (
                  <div
                    key={`${fileName}-${idx}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.375rem 0.5rem',
                      backgroundColor: '#2d3748',
                      border: '1px solid #4B5563',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      color: '#e2e8f0',
                      position: 'relative',
                      justifyContent: 'space-between',
                                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2d3748'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 0 }}>
                      <span style={{ fontSize: '1rem', flexShrink: 0 }}>{getFileIcon(fileExt)}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {fileName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const deletedFile = attachments[idx];
                        if (deletedFile && !(deletedFile instanceof File) && (deletedFile as any).isExisting) {
                          const fileId = (deletedFile as any).url.split('/').pop() || '';
                          setDeletedAttachmentIds([...deletedAttachmentIds, fileId]);
                        }
                        setAttachments(attachments.filter((_, i) => i !== idx));
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        padding: '0 0.25rem',
                        flexShrink: 0,
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="ลบไฟล์"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <label className="attach-btn" title="เพิ่มรูป วิดีโอ หรือเอกสาร">
            <span className="attach-plus">+</span>
            เพิ่มไฟล์
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime,application/pdf,text/plain,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip,application/x-zip-compressed"
              multiple
              hidden
              onChange={(e) => setAttachments([...attachments, ...Array.from(e.target.files || [])])}
            />
          </label>
          <p className="note" style={{ margin: '6px 0px 0px' }}>รูป วิดีโอ และเอกสาร (Excel, Word, PowerPoint, PDF, ZIP) ไฟล์ละไม่เกิน 10 MB</p>
        </div>

        <button
          className="btn-primary"
          disabled={!isFormValid || isSubmitting}
          onClick={handleUpdateTask}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isSubmitting ? 0.6 : 1 }}
        >
          {isSubmitting ? (
            <>
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⌛</span> บันทึก...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5"></path>
              </svg> บันทึกการแก้ไข
            </>
          )}
        </button>

        {showSuccessToast && (
          <div
            style={{
              position: 'fixed',
              bottom: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#10b981',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              zIndex: 1000,
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            ✓ บันทึกสำเร็จ
          </div>
        )}

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
