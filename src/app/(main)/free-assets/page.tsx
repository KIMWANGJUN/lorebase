// src/app/(main)/free-assets/page.tsx
"use client";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockAssetInfos } from '@/lib/mockData';
import type { AssetInfo } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Compass, ExternalLink, Image as ImageIcon, Music, Box, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const assetTypeIcons = {
  Texture: <ImageIcon className="h-5 w-5 mr-2 text-orange-500" />,
  Model: <Box className="h-5 w-5 mr-2 text-sky-500" />,
  Sound: <Music className="h-5 w-5 mr-2 text-lime-500" />,
  Plugin: <Box className="h-5 w-5 mr-2 text-purple-500" />, // Using Box for Plugin too
  Other: <Box className="h-5 w-5 mr-2 text-gray-500" />,
};

const AssetTypeIcon = ({ type }: { type: AssetInfo['type'] }) => {
  return assetTypeIcons[type] || assetTypeIcons['Other'];
};

export default function FreeAssetsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const { isAdmin } = useAuth();

  const filteredAssets = mockAssetInfos.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || asset.type.toLowerCase() === selectedType.toLowerCase();
    return asset.isFree && matchesSearch && matchesType;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <section className="text-center py-12 mb-10 bg-gradient-to-r from-secondary to-teal-600 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold font-headline text-primary-foreground">무료 에셋 정보</h1>
        <p className="text-lg text-primary-foreground/90 mt-2">게임 개발에 유용한 무료 에셋들을 찾아보세요.</p>
      </section>

      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="에셋 검색..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="모든 타입" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 타입</SelectItem>
            <SelectItem value="Texture"><ImageIcon className="inline-block h-4 w-4 mr-2" /> 텍스쳐</SelectItem>
            <SelectItem value="Model"><Box className="inline-block h-4 w-4 mr-2" /> 모델</SelectItem>
            <SelectItem value="Sound"><Music className="inline-block h-4 w-4 mr-2" /> 사운드</SelectItem>
            <SelectItem value="Plugin"><Box className="inline-block h-4 w-4 mr-2" /> 플러그인</SelectItem>
            <SelectItem value="Other"><Box className="inline-block h-4 w-4 mr-2" /> 기타</SelectItem>
          </SelectContent>
        </Select>
        {isAdmin && (
          <Button className="w-full md:w-auto bg-gradient-to-r from-green-500 to-teal-500 text-white">
            <PlusCircle className="mr-2 h-5 w-5" /> 새 에셋 추가
          </Button>
        )}
      </div>

      {filteredAssets.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
              <Image 
                src={asset.imageUrl || `https://placehold.co/400x300.png?text=${asset.type}`}
                alt={asset.name} 
                width={400} 
                height={225} 
                className="w-full h-40 object-cover"
                data-ai-hint={`${asset.type.toLowerCase()} digital asset`}
              />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-headline text-lg">{asset.name}</CardTitle>
                  <AssetTypeIcon type={asset.type} />
                </div>
                <CardDescription>
                  {asset.updateFrequency ? `${asset.updateFrequency} 업데이트` : '정기 업데이트'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{asset.description}</p>
                 {asset.tags && asset.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {asset.tags.map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-2">
                <Button asChild className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  <a href={asset.siteUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> 사이트 방문
                  </a>
                </Button>
                 {isAdmin && (
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="mr-2 h-4 w-4" /> 수정
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1">
                      <Trash2 className="mr-2 h-4 w-4" /> 삭제
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
         <div className="text-center py-12">
          <Compass className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">일치하는 무료 에셋 정보가 없습니다.</p>
          <p className="text-sm text-muted-foreground mt-1">검색어나 필터를 변경해보세요.</p>
        </div>
      )}
    </div>
  );
}
