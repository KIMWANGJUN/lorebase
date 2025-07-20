
// src/app/(main)/game-workshop/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { StarterProject } from '@/types';
import Image from 'next/image';
import { Search, Download, PlusCircle, Edit, Trash2, Compass, Sparkles, AppWindow, Box, PenTool } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
// In a real app, you would fetch this data from an API
// import { getStarterProjects } from '@/lib/workshopApi';

const engineIcons: { [key: string]: React.ReactElement } = {
  Unity: <Box className="h-5 w-5 mr-2 text-purple-400" />,
  Unreal: <AppWindow className="h-5 w-5 mr-2 text-sky-400" />,
  Godot: <PenTool className="h-5 w-5 mr-2 text-emerald-400" />,
  Other: <Box className="h-5 w-5 mr-2 text-gray-400" />,
};

const EngineIcon = ({ engine }: { engine: StarterProject['engine'] }) => {
  return engineIcons[engine] || engineIcons['Other'];
};

export default function GameWorkshopPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEngine, setSelectedEngine] = useState<string>('all');
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState<StarterProject[]>([]);

  // In a real app, you'd fetch the data
  // useEffect(() => {
  //   getStarterProjects().then(setProjects);
  // }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEngine = selectedEngine === 'all' || project.engine.toLowerCase() === selectedEngine.toLowerCase();
    return matchesSearch && matchesEngine;
  });

  const bannerImageUrl = "https://placehold.co/1920x800.webp";

  return (
    <div className="py-8 px-4">
      <section 
        className="text-center py-20 md:py-32 rounded-xl shadow-xl mb-10 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${bannerImageUrl})` }}
        data-ai-hint="magical workshop tools"
      >
        <div className="absolute inset-0 bg-black/70 rounded-xl z-0"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary-foreground drop-shadow-lg">게임 공방</h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mt-2 drop-shadow-sm">다양한 게임 엔진의 스타터 프로젝트를 탐색하고 개발을 시작하세요.</p>
        </div>
      </section>

      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="프로젝트 검색..."
            className="pl-10 w-full bg-card border-border focus:ring-accent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedEngine} onValueChange={setSelectedEngine}>
          <SelectTrigger className="w-full md:w-[180px] bg-card border-border text-foreground focus:ring-accent">
            <SelectValue placeholder="모든 엔진" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border text-popover-foreground">
            <SelectItem value="all">모든 엔진</SelectItem>
            <SelectItem value="Unity"><Box className="inline-block h-4 w-4 mr-2 text-purple-400" /> Unity</SelectItem>
            <SelectItem value="Unreal"><AppWindow className="inline-block h-4 w-4 mr-2 text-sky-400" /> Unreal</SelectItem>
            <SelectItem value="Godot"><PenTool className="inline-block h-4 w-4 mr-2 text-emerald-400" /> Godot</SelectItem>
            <SelectItem value="Other"><Box className="inline-block h-4 w-4 mr-2 text-gray-400" /> Other</SelectItem>
          </SelectContent>
        </Select>
        {isAdmin && (
          <Button className="w-full md:w-auto bg-gradient-to-r from-green-500 to-teal-500 text-primary-foreground hover:opacity-90 shadow-md">
            <PlusCircle className="mr-2 h-5 w-5" /> 새 프로젝트 추가
          </Button>
        )}
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 bg-card border-border hover:border-accent/70">
              <Image 
                src={project.imageUrl || `https://placehold.co/600x400.webp?text=${project.engine}`} 
                alt={project.name} 
                width={600} 
                height={300} 
                className="w-full h-48 object-cover"
                data-ai-hint={`${project.engine.toLowerCase()} game development`}
              />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-headline text-xl text-foreground">{project.name}</CardTitle>
                  <EngineIcon engine={project.engine} />
                </div>
                <CardDescription className="text-muted-foreground">v{project.version} - 최종 업데이트: {new Date(project.lastUpdatedAt).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
                {project.tags && project.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 text-xs bg-secondary/80 text-secondary-foreground rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-2">
                <Button asChild className="w-full bg-gradient-to-r from-secondary to-teal-600 text-primary-foreground hover:opacity-90 shadow-md">
                  <a href={project.downloadUrl} download>
                    <Download className="mr-2 h-4 w-4" /> 다운로드
                  </a>
                </Button>
                {isAdmin && (
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" className="flex-1 border-border text-muted-foreground hover:bg-muted/50 hover:border-accent">
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
          <p className="text-xl text-muted-foreground">일치하는 스타터 프로젝트가 없습니다.</p>
          <p className="text-sm text-muted-foreground mt-1">검색어나 필터를 변경해보세요.</p>
        </div>
      )}
    </div>
  );
}
