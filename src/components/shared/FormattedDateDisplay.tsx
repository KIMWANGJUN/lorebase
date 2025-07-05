
// src/components/shared/FormattedDateDisplay.tsx
import React from 'react';
import { Timestamp } from 'firebase/firestore';

interface FormattedDateDisplayProps {
  dateString?: string;
  date?: Date | Timestamp;
  className?: string;
}

export default function FormattedDateDisplay({ 
  dateString, 
  date, 
  className = "" 
}: FormattedDateDisplayProps) {
  // 날짜 객체 생성
  const getDateObject = (): Date => {
    if (date) {
      if (date instanceof Timestamp) {
        return date.toDate();
      }
      if (date instanceof Date) {
        return date;
      }
    }
    
    if (dateString) {
      return new Date(dateString);
    }
    
    return new Date();
  };

  const formatDate = (): string => {
    try {
      const dateObj = getDateObject();
      
      if (isNaN(dateObj.getTime())) {
        return '날짜 없음';
      }

      const now = new Date();
      const diffInMs = now.getTime() - dateObj.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      // 상대적 시간 표시
      if (diffInMinutes < 1) {
        return '방금 전';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}분 전`;
      } else if (diffInHours < 24) {
        return `${diffInHours}시간 전`;
      } else if (diffInDays < 7) {
        return `${diffInDays}일 전`;
      } else {
        // 일주일 이후는 절대 시간
        return dateObj.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return '날짜 오류';
    }
  };

  return <span className={className}>{formatDate()}</span>;
}
