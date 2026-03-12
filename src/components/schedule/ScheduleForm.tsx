import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, MapPin, MessageSquare, Tag, Plus } from 'lucide-react';

interface ScheduleFormData {
  startTime: string;
  endTime: string;
  googleApiData: string;
  remarks: string;
  category: string;
}

interface ScheduleFormProps {
  onSubmit: (data: ScheduleFormData) => void;
  defaultValue?: Partial<ScheduleFormData>;
  defaultCategory?: string;
  compact?: boolean;
  className?: string;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  onSubmit,
  defaultValue = {},
  defaultCategory = '관광',
  compact = false,
  className = ''
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ScheduleFormData>({
    startTime: '',
    endTime: '',
    googleApiData: '',
    remarks: '',
    category: defaultCategory,
    ...defaultValue
  });

  const [errors, setErrors] = useState<Partial<ScheduleFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 기본값이 변경될 때 폼 데이터 업데이트
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...defaultValue,
      category: defaultCategory
    }));
  }, [defaultValue, defaultCategory]);

  // 시간 유효성 검사
  const validateTime = (time: string) => {
    if (!time) return t('enterTime');
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) return t('invalidTimeFormat');
    return '';
  };

  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors: Partial<ScheduleFormData> = {};
    
    const startTimeError = validateTime(formData.startTime);
    if (startTimeError) newErrors.startTime = startTimeError;
    
    const endTimeError = validateTime(formData.endTime);
    if (endTimeError) newErrors.endTime = endTimeError;
    
    if (!formData.googleApiData.trim()) {
      newErrors.googleApiData = t('enterPlaceActivity');
    }
    
    // 종료 시간이 시작 시간보다 늦은지 확인
    if (!startTimeError && !endTimeError && formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01 ${formData.startTime}`);
      const end = new Date(`2000-01-01 ${formData.endTime}`);
      if (end <= start) {
        newErrors.endTime = t('endTimeAfterStart');
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // 성공 시 폼 초기화
      setFormData({
        startTime: '',
        endTime: '',
        googleApiData: '',
        remarks: '',
        category: defaultCategory
      });
      setErrors({});
    } catch (error) {
      console.error('Schedule add failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 시간 입력 핸들러 (HH:MM 형식으로 자동 포맷팅 및 유효성 검사)
  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    // 숫자와 콜론만 허용
    let formatted = value.replace(/[^0-9:]/g, '');

    // 자동으로 콜론 추가 (2자리 입력 시)
    if (formatted.length === 2 && !formatted.includes(':')) {
      formatted = formatted + ':';
    }

    // 최대 5자리 (HH:MM)
    if (formatted.length <= 5) {
      // 시간과 분 유효성 검사
      if (formatted.includes(':')) {
        const [hours, minutes] = formatted.split(':');
        
        // 시간 제한 (0-23)
        let validHours = hours;
        if (hours.length === 2) {
          const hourNum = parseInt(hours, 10);
          if (hourNum > 23) {
            validHours = '23';
          }
        }
        
        // 분 제한 (0-59)
        let validMinutes = minutes || '';
        if (minutes && minutes.length === 2) {
          const minuteNum = parseInt(minutes, 10);
          if (minuteNum > 59) {
            validMinutes = '59';
          }
        }
        
        formatted = `${validHours}:${validMinutes}`;
      } else if (formatted.length === 2) {
        // 시간만 입력된 경우 (0-23 제한)
        const hourNum = parseInt(formatted, 10);
        if (hourNum > 23) {
          formatted = '23';
        }
      }
      
      setFormData(prev => ({ ...prev, [field]: formatted }));
    }
  };

  // 카테고리 옵션 - Home/Login 톤 유지
  const categories = [
    { value: '관광', label: t('tourism'), color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: '식사', label: t('dining'), color: 'bg-green-50 text-green-700 border-green-200' },
    { value: '쇼핑', label: t('shopping'), color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { value: '교통', label: t('transportation'), color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { value: '숙박', label: t('accommodation'), color: 'bg-pink-50 text-pink-700 border-pink-200' },
    { value: '문화시설', label: t('culturalFacility'), color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { value: '기타', label: t('etc'), color: 'bg-gray-50 text-gray-700 border-gray-200' }
  ];

  const selectedCategory = categories.find(cat => cat.value === formData.category);

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* 시간 입력 - Home/Login 톤 유지 */}
      <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Clock className="w-4 h-4 inline mr-1" />
            {t('startTime')}
          </label>
          <input
            type="text"
            value={formData.startTime}
            onChange={(e) => handleTimeChange('startTime', e.target.value)}
            placeholder="09:00"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
              errors.startTime ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.startTime && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.startTime}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Clock className="w-4 h-4 inline mr-1" />
            {t('endTime')}
          </label>
          <input
            type="text"
            value={formData.endTime}
            onChange={(e) => handleTimeChange('endTime', e.target.value)}
            placeholder="18:00"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
              errors.endTime ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.endTime && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.endTime}</p>
          )}
        </div>
      </div>

      {/* 장소/활동명 - Home/Login 톤 유지 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <MapPin className="w-4 h-4 inline mr-1" />
          {t('placeActivity')}
        </label>
        <input
          type="text"
          value={formData.googleApiData}
          onChange={(e) => setFormData(prev => ({ ...prev, googleApiData: e.target.value }))}
          placeholder={t('placePlaceholder')}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
            errors.googleApiData ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.googleApiData && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.googleApiData}</p>
        )}
      </div>

      {/* 카테고리 선택 - Home/Login 톤 유지 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <Tag className="w-4 h-4 inline mr-1" />
          {t('category')}
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                formData.category === category.value
                  ? category.color
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* 메모 - Home/Login 톤 유지 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <MessageSquare className="w-4 h-4 inline mr-1" />
          {t('memo')}
        </label>
        <textarea
          value={formData.remarks}
          onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
          placeholder={t('memoPlaceholder')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* 제출 버튼 - Home/Login 톤 유지 */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {isSubmitting ? t('loading') : t('addSchedule')}
        </button>
      </div>
    </form>
  );
};

export default ScheduleForm;