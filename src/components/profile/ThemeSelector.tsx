'use client';

import React from 'react';
import { useThemeCustomization } from '@/contexts/ThemeCustomizationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/form/radio-group';
import { Label } from '@/components/ui/form/label';

const ThemeSelector = () => {
  const { theme, setTheme } = useThemeCustomization();

  return (
    <Card>
      <CardHeader>
        <CardTitle>배경 테마 설정</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={theme} onValueChange={(value) => setTheme(value as 'default' | 'wood')}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="default" id="default-theme" />
            <Label htmlFor="default-theme">기본</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="wood" id="wood-theme" />
            <Label htmlFor="wood-theme">나무 질감</Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default ThemeSelector;
