// src/components/ProfileImageUpload.jsx

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Camera, Trash2, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { uploadProfileImage, deleteProfileImage } from '@/lib/profileImageUpload';
import { cn } from '@/lib/utils';

/**
 * 프로필 이미지 업로드 컴포넌트
 * @param {object} props - 컴포넌트 props
 * @param {object} props.user - 현재 사용자 객체
 * @param {function} props.onImageUpdate - 이미지 업데이트 성공 시 콜백
 * @param {boolean} props.disabled - 컴포넌트 비활성화 여부
 */
const ProfileImageUpload = ({ user, onImageUpdate, disabled = false }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  // 컴포넌트 언마운트 시 미리보기 URL 정리
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  /**
   * 미리보기 이미지 정리
   */
  const clearPreview = useCallback(() => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
    }
  }, [previewImage]);

  /**
   * 파일 선택 처리
   * @param {Event} event - 파일 input change 이벤트
   */
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    await processFile(file);
  };

  /**
   * 드래그 앤 드롭 처리
   */
  const handleDrop = async (event) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  /**
   * 파일 처리 공통 로직
   * @param {File} file - 처리할 파일
   */
  const processFile = async (file) => {
    if (!file || !user || disabled) return;

    // 이전 미리보기 정리
    clearPreview();

    // 기본 검증
    if (!file.type.startsWith('image/')) {
      toast({
        title: "오류",
        description: "이미지 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    // 미리보기 생성
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 진행률 콜백 함수
      const onProgress = (progress) => {
        setUploadProgress(progress);
      };

      // 이미지 업로드
      const downloadURL = await uploadProfileImage(file, user.id, onProgress);

      // 성공 알림
      toast({
        title: "성공",
        description: "프로필 이미지가 업데이트되었습니다.",
        action: <CheckCircle className="h-4 w-4" />,
      });

      // 부모 컴포넌트에 업데이트 알림
      if (onImageUpdate) {
        onImageUpdate(downloadURL);
      }

      // 미리보기 유지 (성공 시에는 새 이미지가 로드될 때까지)
      setTimeout(() => {
        clearPreview();
      }, 2000);

    } catch (error) {
      console.error('업로드 오류:', error);
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
        action: <AlertCircle className="h-4 w-4" />,
      });
      
      // 미리보기 제거
      clearPreview();
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      
      // 파일 input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * 프로필 이미지 삭제 처리
   */
  const handleDeleteImage = async () => {
    if (!user || !user.avatar || disabled) return;

    setIsUploading(true);

    try {
      await deleteProfileImage(user.id);

      toast({
        title: "성공",
        description: "프로필 이미지가 삭제되었습니다.",
        action: <CheckCircle className="h-4 w-4" />,
      });

      // 부모 컴포넌트에 업데이트 알림
      if (onImageUpdate) {
        onImageUpdate(null);
      }

    } catch (error) {
      console.error('삭제 오류:', error);
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
        action: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * 파일 선택 버튼 클릭
   */
  const handleUploadClick = () => {
    if (fileInputRef.current && !disabled && !isUploading) {
      fileInputRef.current.click();
    }
  };

  // 표시할 이미지 URL (미리보기 > 사용자 아바타 > 기본값)
  const displayImageUrl = previewImage || user?.avatar || null;

  return (
    <div className="space-y-4">
      {/* 프로필 이미지 표시 영역 */}
      <div className="flex flex-col items-center space-y-4">
        <div 
          className={cn(
            "relative cursor-pointer transition-all duration-200",
            dragOver && "scale-105",
            disabled && "cursor-not-allowed opacity-50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleUploadClick}
        >
          <Avatar className={cn(
            "w-32 h-32 border-4 shadow-lg transition-all duration-200",
            dragOver ? "border-primary border-dashed" : "border-border",
            !disabled && "hover:shadow-xl hover:scale-105"
          )}>
            <AvatarImage
              src={displayImageUrl}
              alt={`${user?.nickname || '사용자'}의 프로필`}
              className="object-cover"
            />
            <AvatarFallback className="text-2xl bg-muted text-muted-foreground">
              {user?.nickname?.substring(0, 2).toUpperCase() || '사용자'}
            </AvatarFallback>
          </Avatar>

          {/* 업로드 중 오버레이 */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="text-center text-white">
                <Loader className="w-6 h-6 animate-spin mx-auto mb-1" />
                <span className="text-xs font-medium">{uploadProgress}%</span>
              </div>
            </div>
          )}

          {/* 드래그 오버 오버레이 */}
          {dragOver && !isUploading && (
            <div className="absolute inset-0 bg-primary/20 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
          )}
        </div>

        {/* 업로드 진행률 바 */}
        {isUploading && (
          <div className="w-full max-w-xs">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-1">
              프로필 이미지 업로드 중...
            </p>
          </div>
        )}

        {/* 드래그 앤 드롭 안내 */}
        {!isUploading && !disabled && (
          <p className="text-xs text-muted-foreground text-center">
            클릭하거나 이미지를 드래그해서 업로드하세요
          </p>
        )}
      </div>

      {/* 버튼 영역 */}
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button
          onClick={handleUploadClick}
          disabled={isUploading || disabled}
          variant="outline"
          size="sm"
          className="border-border text-muted-foreground hover:bg-muted/50 hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
        >
          <Camera className="w-4 h-4 mr-2" />
          {user?.avatar ? '이미지 변경' : '이미지 업로드'}
        </Button>

        {user?.avatar && (
          <Button
            onClick={handleDeleteImage}
            disabled={isUploading || disabled}
            variant="outline"
            size="sm"
            className="border-border text-muted-foreground hover:bg-muted/50 hover:border-destructive hover:text-destructive transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            이미지 삭제
          </Button>
        )}
      </div>

      {/* 숨겨진 파일 input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading || disabled}
      />

      {/* 안내 텍스트 */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP 형식 | 최대 1MB | 자동으로 512x512px로 리사이징됩니다
        </p>
        {disabled && (
          <p className="text-xs text-destructive mt-1">
            현재 이미지 업로드가 비활성화되어 있습니다
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileImageUpload;
