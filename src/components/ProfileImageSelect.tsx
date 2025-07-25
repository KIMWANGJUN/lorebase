'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/form/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/data-display/avatar';
import { Check, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileImageSelectProps {
  currentImageUrl?: string;
  onImageSelect: (imageUrl: string) => void;
  disabled?: boolean;
}

// 사용 가능한 프로필 이미지 목록
const AVAILABLE_PROFILE_IMAGES = [
  {
    id: 'malamute',
    name: '말라뮤트',
    url: '/assets/images/malamute-icon.webp',
    isDefault: true
  },
  {
    id: 'dog-1',
    name: '강아지 1',
    url: '/assets/images/dog-1.webp',
    isDefault: false
  },
  {
    id: 'dog-2',
    name: '강아지 2',
    url: '/assets/images/dog-2.webp',
    isDefault: false
  },
  {
    id: 'cat-1',
    name: '고양이 1',
    url: '/assets/images/cat-1.webp',
    isDefault: false
  },
  {
    id: 'cat-2',
    name: '고양이 2',
    url: '/assets/images/cat-2.webp',
    isDefault: false
  },
  // 관리자가 추가할 수 있는 더 많은 이미지들...
];

export default function ProfileImageSelect({ 
  currentImageUrl, 
  onImageSelect, 
  disabled = false 
}: ProfileImageSelectProps) {
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string>(
    currentImageUrl || AVAILABLE_PROFILE_IMAGES[0].url
  );

  const handleImageSelect = (imageUrl: string) => {
    if (disabled) return;
    
    setSelectedImage(imageUrl);
    onImageSelect(imageUrl);
    toast({
      title: '성공',
      description: '프로필 이미지가 선택되었습니다.',
    });
  };

  return (
    <div className="space-y-6">
      {/* 현재 선택된 이미지 미리보기 */}
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={selectedImage} alt="프로필 이미지" />
          <AvatarFallback>
            <User className="w-12 h-12" />
          </AvatarFallback>
        </Avatar>
        <h3 className="text-lg font-medium">현재 선택된 프로필 이미지</h3>
      </div>

      {/* 프로필 이미지 선택 그리드 */}
      <div className="space-y-4">
        <h4 className="text-base font-medium">프로필 이미지 선택</h4>
        <div className="grid grid-cols-4 gap-4">
          {AVAILABLE_PROFILE_IMAGES.map((image) => (
            <div
              key={image.id}
              className={`relative cursor-pointer transition-all duration-200 ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
              onClick={() => handleImageSelect(image.url)}
            >
              <div
                className={`relative border-2 rounded-lg overflow-hidden ${
                  selectedImage === image.url
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Avatar className="w-full h-16">
                  <AvatarImage src={image.url} alt={image.name} />
                  <AvatarFallback>
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                
                {selectedImage === image.url && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-blue-600" />
                  </div>
                )}
                
                {image.isDefault && (
                  <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                    기본
                  </div>
                )}
              </div>
              
              <p className="text-xs text-center mt-1 text-gray-600">
                {image.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 text-center">
          위의 프로필 이미지들 중 하나를 선택해주세요. 
          {disabled && ' 현재 수정이 제한되어 있습니다.'}
        </p>
      </div>
    </div>
  );
}
