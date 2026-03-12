import React, { useState, useEffect, useRef } from 'react';

interface TimeInputProps {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChange,
  placeholder = "시간",
  required = false,
  className = ""
}) => {
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const hoursRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);

  // value가 변경될 때 hours, minutes 업데이트
  useEffect(() => {
    if (value && value.includes(':')) {
      const [h, m] = value.split(':');
      setHours(h || '');
      setMinutes(m || '');
    } else if (value === '') {
      // 빈 문자열일 때만 초기화
      setHours('');
      setMinutes('');
    }
    // value가 없거나 ':'가 없으면 기존 값 유지
  }, [value]);

  // 시간 입력 처리 (0-23)
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, ''); // 숫자만 허용
    
    // 2자리 제한
    if (input.length > 2) {
      input = input.slice(0, 2);
    }
    
    // 23 초과 방지
    if (input.length === 2 && parseInt(input) > 23) {
      input = '23';
    }
    
    setHours(input);
    
    // 시간이 2자리가 되면 분 필드로 포커스
    if (input.length === 2 && minutesRef.current) {
      minutesRef.current.focus();
    }
    
    // 전체 시간 문자열 생성
    const timeString = input + (minutes ? ':' + minutes : '');
    onChange(timeString);
  };

  // 시간 필드 클릭 시 초기화
  const handleHoursClick = () => {
    setHours('');
    // 분이 있으면 ':' + minutes, 없으면 빈 문자열
    onChange(minutes ? ':' + minutes : '');
  };

  // 분 입력 처리 (0-59)
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, ''); // 숫자만 허용
    
    // 2자리 제한
    if (input.length > 2) {
      input = input.slice(0, 2);
    }
    
    // 59 초과 방지
    if (input.length === 2 && parseInt(input) > 59) {
      input = '59';
    }
    
    setMinutes(input);
    
    // 전체 시간 문자열 생성
    const timeString = (hours || '00') + ':' + input;
    onChange(timeString);
  };

  // 분 필드 클릭 시 초기화
  const handleMinutesClick = () => {
    setMinutes('');
    // 시간이 있으면 hours + ':', 없으면 빈 문자열
    onChange(hours ? hours + ':' : '');
  };

  // 백스페이스 처리
  const handleHoursKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && hours === '') {
      // 시간이 비어있으면 이전 필드로 포커스 (현재는 첫 번째 필드이므로 아무것도 하지 않음)
    }
  };

  const handleMinutesKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && minutes === '') {
      // 분이 비어있으면 시간 필드로 포커스
      if (hoursRef.current) {
        hoursRef.current.focus();
      }
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <input
        ref={hoursRef}
        type="text"
        value={hours}
        onChange={handleHoursChange}
        onClick={handleHoursClick}
        onKeyDown={handleHoursKeyDown}
        className="w-8 px-1 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center cursor-pointer"
        placeholder="00"
        maxLength={2}
        required={required}
      />
      <span className="text-gray-500 font-bold">:</span>
      <input
        ref={minutesRef}
        type="text"
        value={minutes}
        onChange={handleMinutesChange}
        onClick={handleMinutesClick}
        onKeyDown={handleMinutesKeyDown}
        className="w-8 px-1 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center cursor-pointer"
        placeholder="00"
        maxLength={2}
        required={required}
      />
    </div>
  );
};

export default TimeInput;
