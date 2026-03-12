import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScheduleItem } from '../../hooks/useScheduleApi';

interface ScheduleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleItem | null;
  onSave: (schedule: ScheduleItem) => void;
}

const ScheduleEditModal: React.FC<ScheduleEditModalProps> = ({
  isOpen,
  onClose,
  schedule,
  onSave
}) => {
  const { t } = useTranslation();
  const [editedSchedule, setEditedSchedule] = useState<ScheduleItem | null>(null);

  useEffect(() => {
    if (schedule) {
      setEditedSchedule({ 
        ...schedule,
        googleApiData: schedule.googleApiData || schedule.title || '',
        remarks: schedule.remarks || ''
      });
    }
  }, [schedule]);

  // 시간 유효성 검사 함수
  const isValidTime = (time: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  // 시간 범위 검사 함수
  const isValidTimeRange = (startTime: string, endTime: string): boolean => {
    if (!isValidTime(startTime) || !isValidTime(endTime)) return false;
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return startMinutes < endMinutes;
  };

  const handleSave = () => {
    if (!editedSchedule) return;

    // 시간 유효성 검사
    if (!isValidTime(editedSchedule.startTime)) {
      alert(t('invalidTimeFormat'));
      return;
    }
    
    if (!isValidTime(editedSchedule.endTime)) {
      alert(t('invalidTimeFormat'));
      return;
    }
    
    if (!isValidTimeRange(editedSchedule.startTime, editedSchedule.endTime)) {
      alert(t('endTimeAfterStart'));
      return;
    }

    onSave(editedSchedule);
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen || !editedSchedule) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-md mx-4">
        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
          📝 {t('editSchedule')}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('startTime')}
            </label>
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
              <select
                value={editedSchedule.startTime ? editedSchedule.startTime.split(':')[0] : '00'}
                onChange={(e) => {
                  const hour = e.target.value;
                  const minute = editedSchedule.startTime ? editedSchedule.startTime.split(':')[1] || '00' : '00';
                  setEditedSchedule({...editedSchedule, startTime: `${hour}:${minute}`});
                }}
                className="px-2 py-2 border-0 focus:outline-none bg-transparent"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i.toString().padStart(2, '0')}>
                    {i.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              <span className="px-1 py-2 text-gray-500">:</span>
              <select
                value={editedSchedule.startTime ? editedSchedule.startTime.split(':')[1] : '00'}
                onChange={(e) => {
                  const minute = e.target.value;
                  const hour = editedSchedule.startTime ? editedSchedule.startTime.split(':')[0] || '00' : '00';
                  setEditedSchedule({...editedSchedule, startTime: `${hour}:${minute}`});
                }}
                className="px-2 py-2 border-0 focus:outline-none bg-transparent"
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const minute = i * 5;
                  return (
                    <option key={minute} value={minute.toString().padStart(2, '0')}>
                      {minute.toString().padStart(2, '0')}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('endTime')}
            </label>
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
              <select
                value={editedSchedule.endTime ? editedSchedule.endTime.split(':')[0] : '00'}
                onChange={(e) => {
                  const hour = e.target.value;
                  const minute = editedSchedule.endTime ? editedSchedule.endTime.split(':')[1] || '00' : '00';
                  setEditedSchedule({...editedSchedule, endTime: `${hour}:${minute}`});
                }}
                className="px-2 py-2 border-0 focus:outline-none bg-transparent"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i.toString().padStart(2, '0')}>
                    {i.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              <span className="px-1 py-2 text-gray-500">:</span>
              <select
                value={editedSchedule.endTime ? editedSchedule.endTime.split(':')[1] : '00'}
                onChange={(e) => {
                  const minute = e.target.value;
                  const hour = editedSchedule.endTime ? editedSchedule.endTime.split(':')[0] || '00' : '00';
                  setEditedSchedule({...editedSchedule, endTime: `${hour}:${minute}`});
                }}
                className="px-2 py-2 border-0 focus:outline-none bg-transparent"
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const minute = i * 5;
                  return (
                    <option key={minute} value={minute.toString().padStart(2, '0')}>
                      {minute.toString().padStart(2, '0')}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('placeActivity')}
            </label>
            <input
              type="text"
              value={editedSchedule.googleApiData}
              onChange={(e) => setEditedSchedule({...editedSchedule, googleApiData: e.target.value, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder={t('placePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('memo')}
            </label>
            <input
              type="text"
              value={editedSchedule.remarks}
              onChange={(e) => setEditedSchedule({...editedSchedule, remarks: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder={t('memoPlaceholder')}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleEditModal;