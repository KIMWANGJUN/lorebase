// src/components/shared/AdBanner.tsx
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Star, Sparkles } from 'lucide-react';

interface AdBannerProps {
  position: 'left' | 'right';
}

const AdBanner: React.FC<AdBannerProps> = ({ position }) => {
  const ads = [
    {
      title: "Unity Pro 할인",
      content: "게임 개발의 새로운 차원을 경험하세요",
      image: "/api/placeholder/300/250",
      link: "#",
      color: "from-blue-500/20 to-purple-500/20"
    },
    {
      title: "Unreal Engine 5",
      content: "차세대 게임 엔진으로 창작의 한계를 뛰어넘으세요",
      image: "/api/placeholder/300/250", 
      link: "#",
      color: "from-purple-500/20 to-pink-500/20"
    },
    {
      title: "무료 에셋 팩",
      content: "고품질 3D 모델과 텍스처를 무료로 다운로드",
      image: "/api/placeholder/300/250",
      link: "#",
      color: "from-green-500/20 to-blue-500/20"
    }
  ];

  const currentAd = ads[position === 'left' ? 0 : 1];

  return (
    <div className="sticky top-20 space-y-4">
      <Card className="watercolor-card watercolor-hover overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${currentAd.color}`}></div>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-watercolor-primary" />
            <span className="text-xs text-watercolor-muted">SPONSORED</span>
          </div>
          <h3 className="font-bold text-watercolor-text mb-2">{currentAd.title}</h3>
          <div className="bg-gradient-to-br from-watercolor-surface to-watercolor-primary/5 rounded-lg p-4 mb-3">
            <div className="h-32 bg-gradient-to-br from-watercolor-primary/10 to-watercolor-accent/10 rounded flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-watercolor-primary" />
            </div>
          </div>
          <p className="text-sm text-watercolor-muted mb-3">{currentAd.content}</p>
          <button className="w-full bg-gradient-to-r from-watercolor-primary to-watercolor-accent text-white py-2 px-4 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            자세히 보기
            <ExternalLink className="h-4 w-4" />
          </button>
        </CardContent>
      </Card>

      {/* 추가 광고 */}
      <Card className="watercolor-card p-4">
        <div className="text-center">
          <div className="h-24 bg-gradient-to-br from-watercolor-secondary/10 to-watercolor-accent/10 rounded-lg flex items-center justify-center mb-3">
            <span className="text-sm text-watercolor-muted">광고 영역</span>
          </div>
          <button className="text-xs text-watercolor-primary hover:underline">
            광고 문의
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AdBanner;
