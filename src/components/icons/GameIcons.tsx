// src/components/icons/GameIcons.tsx
// For now, we'll rely on lucide-react icons passed as props or used directly.
// If specific SVG logos are needed, they can be added here.
// Example:
// export const UnityIcon = () => <Box className="h-5 w-5" />; // From lucide
// export const UnrealIcon = () => <AppWindow className="h-5 w-5" />; // From lucide
// export const GodotIcon = () => <PenTool className="h-5 w-5" />; // From lucide

// This file can be expanded if custom SVGs are required.
// For now, it serves as a placeholder for the concept.
import { Box, AppWindow, PenTool } from 'lucide-react';
import type { StarterProject } from '@/types';

export const GameEngineIcon = ({ engine, className }: { engine: StarterProject['engine'], className?: string }) => {
  const defaultClassName = "h-5 w-5";
  const combinedClassName = className ? `${defaultClassName} ${className}` : defaultClassName;

  switch (engine) {
    case 'Unity':
      return <Box className={`${combinedClassName} text-purple-500`} />;
    case 'Unreal':
      return <AppWindow className={`${combinedClassName} text-blue-500`} />;
    case 'Godot':
      return <PenTool className={`${combinedClassName} text-green-500`} />;
    default:
      return <Box className={`${combinedClassName} text-gray-500`} />;
  }
};
