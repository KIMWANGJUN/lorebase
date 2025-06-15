// src/components/ProfileImageUpload.tsx
"use client";
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Camera, Trash2, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { uploadProfileImage, deleteProfileImage } from '@/lib/profileImageUpload';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

interface ProfileImageUploadProps {
  user: {
    uid?: string;
    id?: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
    avatar?: string;
    nickname?: string;
  } | null;
  onImageUpdate?: (newImageUrl: string | null) => void;
  disabled?: boolean;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  user,
  onImageUpdate,
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setError('로그인이 필요합니다.');
    } else {
      setError('');
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const clearPreview = useCallback(() => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
    }
  }, [previewImage]);

  const checkFirebaseAuth = async (): Promise<FirebaseUser | null> => {
    if (!auth) {
      console.warn('Firebase auth 인스턴스가 초기화되지 않았습니다.');
      return null;
    }

    if (auth.currentUser) {
      return auth.currentUser;
    }

    return new Promise<FirebaseUser | null>((resolve) => {
      if (!auth) {
        resolve(null);
        return;
      }

      const unsubscribe = onAuthStateChanged(
        auth,
        (fbAuthUser) => {
          unsubscribe();
          resolve(fbAuthUser);
        },
        (error) => {
          console.error('Firebase auth 상태 확인 중 오류:', error);
          unsubscribe();
          resolve(null);
        }
      );

      setTimeout(() => {
        unsubscribe();
        resolve(auth?.currentUser || null);
      }, 3000);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  const processFile = async (file: File) => {
    if (!file || !user || disabled) {
      if (!user) {
        setError('로그인이 필요합니다.');
      }
      return;
    }

    clearPreview();
    setError('');

    if (!file.type.startsWith('image/')) {
      const errorMsg = "이미지 파일만 업로드 가능합니다.";
      setError(errorMsg);
      toast({ title: "오류", description: errorMsg, variant: "destructive" });
      return;
    }

    if (file.size > 1024 * 1024) {
      const errorMsg = "파일 크기는 1MB 이하여야 합니다.";
      setError(errorMsg);
      toast({ title: "오류", description: errorMsg, variant: "destructive" });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const currentFbUser = await checkFirebaseAuth();

      if (!currentFbUser) {
        const firebaseLoginErrorMsg = 'Firebase 로그인이 필요합니다. 헤더의 로그인 버튼을 통해 Firebase에 로그인해주세요.';
        setError(firebaseLoginErrorMsg);
        toast({
          title: "Firebase 로그인 필요",
          description: "프로필 이미지 업로드를 위해서는 먼저 Firebase 로그인이 필요합니다.",
          variant: "destructive",
        });
        setIsUploading(false);
        clearPreview();
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const userIdForPath = user.id;
      if (!userIdForPath) {
        throw new Error('애플리케이션 사용자 ID를 찾을 수 없습니다.');
      }

      const onProgressCallback = (progress: number) => {
        setUploadProgress(progress);
      };

      const downloadURL = await uploadProfileImage(file, userIdForPath, onProgressCallback);

      toast({
        title: "성공",
        description: "프로필 이미지가 업데이트되었습니다.",
        action: <CheckCircle className="h-4 w-4" />,
      });

      if (onImageUpdate) {
        onImageUpdate(downloadURL);
      }

      setTimeout(() => {
        clearPreview();
      }, 2000);

    } catch (error: any) {
      console.error('업로드 오류:', error);
      const errorMsg = error.message || '이미지 업로드에 실패했습니다.';
      setError(errorMsg);
      toast({
        title: "오류",
        description: errorMsg,
        variant: "destructive",
        action: <AlertCircle className="h-4 w-4" />,
      });
      clearPreview();
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async () => {
    const userImage = user?.photoURL || user?.avatar;
    if (!user || !userImage || disabled) return;

    setIsUploading(true);
    setError('');

    try {
      const currentFbUser = await checkFirebaseAuth();

      if (!currentFbUser) {
        const firebaseLoginErrorMsg = 'Firebase 로그인이 필요합니다. 작업을 계속할 수 없습니다.';
        setError(firebaseLoginErrorMsg);
        toast({ 
          title: "Firebase 로그인 필요", 
          description: firebaseLoginErrorMsg, 
          variant: "destructive" 
        });
        setIsUploading(false);
        return;
      }

      const userIdForPath = user.id;
      if (!userIdForPath) {
        throw new Error('애플리케이션 사용자 ID를 찾을 수 없습니다.');
      }

      await deleteProfileImage(userIdForPath);

      toast({
        title: "성공",
        description: "프로필 이미지가 삭제되었습니다.",
        action: <CheckCircle className="h-4 w-4" />,
      });

      if (onImageUpdate) {
        onImageUpdate(null);
      }

    } catch (error: any) {
      console.error('삭제 오류:', error);
      const errorMsg = error.message || '이미지 삭제에 실패했습니다.';
      setError(errorMsg);
      toast({
        title: "오류",
        description: errorMsg,
        variant: "destructive",
        action: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current && !disabled && !isUploading && user) {
      fileInputRef.current.click();
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-destructive">로그인이 필요합니다.</p>
        <Button variant="outline" disabled>
          <Camera className="w-4 h-4 mr-2" />
          이미지 업로드
        </Button>
      </div>
    );
  }

  const displayImageUrl = previewImage || user?.photoURL || user?.avatar || null;
  const getUserDisplayName = () => user?.displayName || user?.nickname || '사용자';
  const getUserInitials = () => {
    const displayName = getUserDisplayName();
    return displayName.substring(0, 2).toUpperCase() || (user?.email?.substring(0, 2).toUpperCase() || 'U');
  };
  const hasCurrentImage = !!(user?.photoURL || user?.avatar);

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-md mb-4 text-sm">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            {error}
          </div>
        </div>
      )}
      <div className="flex flex-col items-center space-y-4">
        <div
          className={cn(
            "relative cursor-pointer transition-all duration-200",
            dragOver && "scale-105",
            disabled && "cursor-not-allowed opacity-50",
            !user && "cursor-not-allowed opacity-50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleUploadClick}
        >
          <Avatar className={cn(
            "w-32 h-32 border-4 shadow-lg transition-all duration-200",
            dragOver ? "border-primary border-dashed" : "border-border",
            !disabled && user && "hover:shadow-xl hover:scale-105"
          )}>
            <AvatarImage
              src={displayImageUrl || undefined}
              alt={`${getUserDisplayName()}의 프로필`}
              className="object-cover"
            />
            <AvatarFallback className="text-2xl bg-muted text-muted-foreground">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="text-center text-white">
                <Loader className="w-6 h-6 animate-spin mx-auto mb-1" />
                <span className="text-xs font-medium">{uploadProgress}%</span>
              </div>
            </div>
          )}
          {dragOver && !isUploading && user && (
            <div className="absolute inset-0 bg-primary/20 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
          )}
        </div>
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
        {!isUploading && !disabled && user && (
          <p className="text-xs text-muted-foreground text-center">
            클릭하거나 이미지를 드래그해서 업로드하세요
          </p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button
          onClick={handleUploadClick}
          disabled={isUploading || disabled || !user}
          variant="outline"
          size="sm"
          className="border-border text-muted-foreground hover:bg-muted/50 hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
        >
          <Camera className="w-4 h-4 mr-2" />
          {hasCurrentImage ? '이미지 변경' : '이미지 업로드'}
        </Button>
        {hasCurrentImage && (
          <Button
            onClick={handleDeleteImage}
            disabled={isUploading || disabled || !user}
            variant="outline"
            size="sm"
            className="border-border text-muted-foreground hover:bg-muted/50 hover:border-destructive hover:text-destructive transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            이미지 삭제
          </Button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading || disabled || !user}
      />
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP 형식 | 최대 1MB | 자동으로 512x512px로 리사이징됩니다
        </p>
        {disabled && (
          <p className="text-xs text-destructive mt-1">
            현재 이미지 업로드가 비활성화되어 있습니다
          </p>
        )}
        {!user && (
          <p className="text-xs text-destructive mt-1">
            프로필 이미지 업로드를 위해 로그인해주세요
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileImageUpload;
