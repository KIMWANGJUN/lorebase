// src/lib/imageUtils.js

/**
 * 지원되는 이미지 형식 검증
 * @param {File} file - 업로드할 파일
 * @returns {boolean} 지원 형식 여부
 */
export const validateImageFormat = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return allowedTypes.includes(file.type);
};

/**
 * 파일 크기 검증 (1MB 이하)
 * @param {File} file - 업로드할 파일
 * @returns {boolean} 크기 제한 통과 여부
 */
export const validateImageSize = (file) => {
  const maxSize = 1024 * 1024; // 1MB
  return file.size <= maxSize;
};

/**
 * 이미지를 512x512px로 리사이징 (파일 크기 최적화 포함)
 * @param {File} file - 원본 이미지 파일
 * @param {number} targetSize - 목표 크기 (기본값: 512)
 * @returns {Promise<Blob>} 리사이징된 이미지 Blob
 */
export const resizeImage = (file, targetSize = 512) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    let objectURL = null;

    img.onload = () => {
      try {
        // Canvas 크기 설정
        canvas.width = targetSize;
        canvas.height = targetSize;

        // 이미지를 정사각형으로 크롭하여 그리기
        const minDimension = Math.min(img.width, img.height);
        const offsetX = (img.width - minDimension) / 2;
        const offsetY = (img.height - minDimension) / 2;

        // 고품질 렌더링 설정
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
          img,
          offsetX, offsetY, minDimension, minDimension, // 소스 영역
          0, 0, targetSize, targetSize // 대상 영역
        );

        // 파일 크기 최적화를 위한 품질 조정
        let quality = 0.8;
        
        // 원본 파일 크기에 따라 품질 동적 조정
        if (file.size > 500 * 1024) { // 500KB 이상
          quality = 0.7;
        } else if (file.size > 200 * 1024) { // 200KB 이상
          quality = 0.75;
        }

        // Canvas를 Blob으로 변환
        canvas.toBlob(
          (blob) => {
            // Object URL 정리
            if (objectURL) {
              URL.revokeObjectURL(objectURL);
            }
            
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('이미지 리사이징에 실패했습니다.'));
            }
          },
          'image/jpeg',
          quality
        );
      } catch (error) {
        // Object URL 정리
        if (objectURL) {
          URL.revokeObjectURL(objectURL);
        }
        reject(new Error('이미지 처리 중 오류가 발생했습니다.'));
      }
    };

    img.onerror = () => {
      if (objectURL) {
        URL.revokeObjectURL(objectURL);
      }
      reject(new Error('이미지 로드에 실패했습니다.'));
    };

    // 파일을 이미지로 로드
    objectURL = URL.createObjectURL(file);
    img.src = objectURL;
  });
};

/**
 * 종합 이미지 유효성 검사
 * @param {File} file - 검사할 파일
 * @returns {object} 검사 결과와 오류 메시지
 */
export const validateImage = (file) => {
  if (!file) {
    return {
      isValid: false,
      error: '파일이 선택되지 않았습니다.'
    };
  }

  if (!validateImageFormat(file)) {
    return {
      isValid: false,
      error: 'JPEG, PNG, WebP 형식의 이미지만 업로드 가능합니다.'
    };
  }

  if (!validateImageSize(file)) {
    return {
      isValid: false,
      error: '파일 크기는 1MB 이하여야 합니다.'
    };
  }

  return { isValid: true, error: null };
};

/**
 * 이미지 MIME 타입 검증 (더블 체크)
 * @param {File} file - 검사할 파일
 * @returns {Promise<boolean>} 실제 이미지 파일 여부
 */
export const validateImageMimeType = (file) => {
  return new Promise((resolve) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const uint = new Uint8Array(e.target.result);
      let bytes = [];
      uint.forEach((byte) => {
        bytes.push(byte.toString(16));
      });
      const hex = bytes.join('').toUpperCase();
      
      // 이미지 파일 시그니처 검사
      const isJPEG = hex.startsWith('FFD8');
      const isPNG = hex.startsWith('89504E47');
      const isWebP = hex.includes('57454250');
      
      resolve(isJPEG || isPNG || isWebP);
    };
    fileReader.readAsArrayBuffer(file.slice(0, 8));
  });
};
