import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Trophy, X, Compass, Coffee, Users, Award, Camera, Star, Sparkles } from 'lucide-react';

const THEME = {
  primary: '#3B82F6',
  accent: '#F97316',
  success: '#10B981',
  border: '#E5E7EB',
  text: '#111827',
  textMuted: '#6B7280',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6'
};

// Travel badges organized by categories
const badgeCategories = {
  exploration: {
    name: '탐험',
    icon: Compass,
    color: THEME.primary,
    badges: [
      { id: 1, name: '도시 탐험가', description: '새로운 도시 10곳 방문', progress: 8, total: 10, earned: false, rarity: 'common' },
      { id: 2, name: '랜드마크 수집가', description: '유명 랜드마크 20곳 방문', progress: 15, total: 20, earned: false, rarity: 'rare' },
      { id: 3, name: '숨은 명소 발견자', description: '숨겨진 장소 5곳 발견', progress: 5, total: 5, earned: true, rarity: 'epic' },
      { id: 4, name: '거리 예술 애호가', description: '스트리트 아트 30개 촬영', progress: 22, total: 30, earned: false, rarity: 'common' }
    ]
  },
  dining: {
    name: '맛집',
    icon: Coffee,
    color: THEME.accent,
    badges: [
      { id: 5, name: '로컬 푸드 전문가', description: '현지 음식 25종 시도', progress: 25, total: 25, earned: true, rarity: 'rare' },
      { id: 6, name: '미식가', description: '파인다이닝 10곳 방문', progress: 7, total: 10, earned: false, rarity: 'epic' },
      { id: 7, name: '길거리 음식 마니아', description: '길거리 음식 50개 시도', progress: 43, total: 50, earned: false, rarity: 'common' },
      { id: 8, name: '카페 호핑', description: '특색 있는 카페 15곳 방문', progress: 15, total: 15, earned: true, rarity: 'common' }
    ]
  },
  social: {
    name: '소셜',
    icon: Users,
    color: THEME.success,
    badges: [
      { id: 9, name: '여행 인플루언서', description: '인스타그램 팔로워 1000명', progress: 784, total: 1000, earned: false, rarity: 'epic' },
      { id: 10, name: '친구 추천왕', description: '친구 20명 앱에 초대', progress: 20, total: 20, earned: true, rarity: 'rare' },
      { id: 11, name: '소셜 나비', description: '여행 모임 50회 참가', progress: 35, total: 50, earned: false, rarity: 'common' },
      { id: 12, name: '포토그래퍼', description: '여행 사진 1000장 업로드', progress: 850, total: 1000, earned: false, rarity: 'rare' }
    ]
  },
  achievement: {
    name: '업적',
    icon: Trophy,
    color: '#F59E0B',
    badges: [
      { id: 13, name: '얼리 어답터', description: '앱 첫 10명 가입자', progress: 10, total: 10, earned: true, rarity: 'legendary' },
      { id: 14, name: '연속 방문자', description: '30일 연속 앱 접속', progress: 23, total: 30, earned: false, rarity: 'rare' },
      { id: 15, name: '완벽주의자', description: '프로필 100% 완성', progress: 95, total: 100, earned: false, rarity: 'epic' },
      { id: 16, name: '베타 테스터', description: '버그 리포트 5회', progress: 3, total: 5, earned: false, rarity: 'rare' }
    ]
  }
};

const rarityColors = {
  common: '#6B7280',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B'
};

interface BadgePanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function BadgePanel({ isOpen, onToggle }: BadgePanelProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof badgeCategories>('exploration');

  const renderBadge = (badge: any) => {
    const Icon = badgeCategories[activeCategory].icon;
    const progressPercent = (badge.progress / badge.total) * 100;
    
    return (
      <Card 
        key={badge.id} 
        className="p-4 hover:shadow-md transition-shadow"
        style={{ borderColor: THEME.border }}
      >
        <div className="flex items-start gap-3">
          <div 
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              badge.earned ? 'ring-2 ring-offset-2' : 'opacity-60'
            }`}
            style={{ 
              backgroundColor: badge.earned ? badgeCategories[activeCategory].color + '20' : THEME.gray100
            }}
          >
            <Icon 
              className="w-6 h-6" 
              style={{ 
                color: badge.earned ? badgeCategories[activeCategory].color : THEME.textMuted 
              }} 
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {badge.name}
              </h4>
              <Badge 
                variant="outline" 
                className="text-xs ml-2"
                style={{ 
                  borderColor: rarityColors[badge.rarity as keyof typeof rarityColors],
                  color: rarityColors[badge.rarity as keyof typeof rarityColors]
                }}
              >
                {badge.rarity}
              </Badge>
            </div>
            
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              {badge.description}
            </p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">진행률</span>
                <span className="text-gray-900 font-medium">
                  {badge.progress}/{badge.total}
                </span>
              </div>
              <Progress 
                value={progressPercent} 
                className="h-2"
              />
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <>
      {/* Collapsed state - vertical button */}
      {!isOpen && (
        <div 
          className="fixed left-0 top-1/2 transform -translate-y-1/2 z-50 transition-all duration-300"
        >
          <Button
            onClick={onToggle}
            className="h-24 w-8 rounded-r-lg text-xs font-medium transform -rotate-90 origin-center"
            style={{ 
              backgroundColor: THEME.primary,
              writingMode: 'vertical-rl',
              textOrientation: 'mixed'
            }}
          >
            뱃지
          </Button>
        </div>
      )}

      {/* Expanded state - full panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
            onClick={onToggle}
          />
          
          {/* Panel */}
          <div 
            className="fixed left-0 top-0 h-full w-3/4 z-50 transition-transform duration-300 flex"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            {/* Panel Content */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div 
                className="h-16 px-6 border-b flex items-center justify-between"
                style={{ borderColor: THEME.border }}
              >
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6" style={{ color: THEME.primary }} />
                  <h2 className="text-xl font-bold text-gray-900">나의 뱃지</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* User Profile Section */}
              <div className="p-6 border-b" style={{ borderColor: THEME.border }}>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src="https://images.unsplash.com/photo-1704726135027-9c6f034cfa41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1c2VyJTIwcHJvZmlsZSUyMGF2YXRhcnxlbnwxfHx8fDE3NTc0ODgyMjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" />
                    <AvatarFallback className="bg-gray-100 text-gray-600">TH</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-gray-900">Travel Hero</h3>
                    <p className="text-sm text-gray-600">@travelhero</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-600">
                      <span>획득한 뱃지: {Object.values(badgeCategories).flat().map(cat => cat.badges).flat().filter(b => b.earned).length}</span>
                      <span>총 뱃지: {Object.values(badgeCategories).flat().map(cat => cat.badges).flat().length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badge Categories & Content */}
              <div className="flex-1 overflow-hidden">
                <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as keyof typeof badgeCategories)}>
                  <TabsList className="w-full h-auto p-2 bg-gray-50 rounded-none">
                    {Object.entries(badgeCategories).map(([key, category]) => {
                      const Icon = category.icon;
                      const earnedCount = category.badges.filter(b => b.earned).length;
                      const totalCount = category.badges.length;
                      
                      return (
                        <TabsTrigger 
                          key={key} 
                          value={key}
                          className="flex-1 flex flex-col items-center gap-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                        >
                          <Icon className="w-4 h-4" style={{ color: category.color }} />
                          <span className="text-xs font-medium">{category.name}</span>
                          <span className="text-xs text-gray-600">{earnedCount}/{totalCount}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                  
                  {Object.entries(badgeCategories).map(([key, category]) => (
                    <TabsContent key={key} value={key} className="p-6 overflow-y-auto max-h-[calc(100vh-300px)]">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                          <category.icon className="w-5 h-5" style={{ color: category.color }} />
                          <h3 className="font-bold text-gray-900">{category.name} 뱃지</h3>
                          <Badge variant="outline" className="text-xs">
                            {category.badges.filter(b => b.earned).length}/{category.badges.length}
                          </Badge>
                        </div>
                        
                        <div className="grid gap-4">
                          {category.badges.map(renderBadge)}
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
