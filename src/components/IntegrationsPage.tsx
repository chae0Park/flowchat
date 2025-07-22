import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Zap, 
  Check, 
  Settings, 
  ExternalLink,
  Sun,
  Moon,
  Github,
  FileText,
  Calendar,
  Trello,
  Slack,
  Figma
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'development' | 'productivity' | 'design' | 'communication';
  isConnected: boolean;
  features: string[];
  setupUrl?: string;
}

const IntegrationsPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'github',
      name: 'GitHub',
      description: '코드 저장소와 연동하여 커밋, 이슈, PR 알림을 받아보세요',
      icon: <Github className="w-6 h-6" />,
      category: 'development',
      isConnected: true,
      features: ['커밋 알림', '이슈 추적', 'PR 리뷰', '브랜치 상태'],
      setupUrl: 'https://github.com/apps/flowtalk'
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: '구글 드라이브 파일을 쉽게 공유하고 협업하세요',
      icon: <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-green-500 rounded"></div>,
      category: 'productivity',
      isConnected: false,
      features: ['파일 공유', '실시간 편집', '권한 관리', '버전 관리']
    },
    {
      id: 'notion',
      name: 'Notion',
      description: '노션 페이지와 데이터베이스를 FlowTalk에서 바로 확인하세요',
      icon: <div className="w-6 h-6 bg-black dark:bg-white rounded"></div>,
      category: 'productivity',
      isConnected: true,
      features: ['페이지 링크', '데이터베이스 동기화', '업데이트 알림', '템플릿 공유']
    },
    {
      id: 'trello',
      name: 'Trello',
      description: '트렐로 보드의 카드 움직임과 업데이트를 실시간으로 확인하세요',
      icon: <Trello className="w-6 h-6 text-blue-600" />,
      category: 'productivity',
      isConnected: false,
      features: ['카드 업데이트', '보드 알림', '마감일 알림', '멤버 할당']
    },
    {
      id: 'figma',
      name: 'Figma',
      description: '디자인 파일의 변경사항과 댓글을 실시간으로 받아보세요',
      icon: <Figma className="w-6 h-6 text-purple-600" />,
      category: 'design',
      isConnected: false,
      features: ['디자인 업데이트', '댓글 알림', '버전 관리', '프로토타입 공유']
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: '구글 캘린더 일정을 FlowTalk 캘린더와 동기화하세요',
      icon: <Calendar className="w-6 h-6 text-blue-600" />,
      category: 'productivity',
      isConnected: false,
      features: ['일정 동기화', '회의 알림', '참석자 관리', '회의실 예약']
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Slack 워크스페이스와 메시지를 동기화하세요',
      icon: <Slack className="w-6 h-6 text-purple-600" />,
      category: 'communication',
      isConnected: false,
      features: ['메시지 동기화', '채널 연동', '파일 공유', '알림 설정']
    },
    {
      id: 'jira',
      name: 'Jira',
      description: '지라 이슈와 프로젝트 진행상황을 추적하세요',
      icon: <div className="w-6 h-6 bg-blue-600 rounded"></div>,
      category: 'development',
      isConnected: false,
      features: ['이슈 추적', '스프린트 관리', '진행률 확인', '할당 알림']
    }
  ]);

  const categories = [
    { id: 'all', label: '전체', count: integrations.length },
    { id: 'development', label: '개발', count: integrations.filter(i => i.category === 'development').length },
    { id: 'productivity', label: '생산성', count: integrations.filter(i => i.category === 'productivity').length },
    { id: 'design', label: '디자인', count: integrations.filter(i => i.category === 'design').length },
    { id: 'communication', label: '커뮤니케이션', count: integrations.filter(i => i.category === 'communication').length }
  ];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { ...integration, isConnected: !integration.isConnected }
        : integration
    ));
  };

  const connectedCount = integrations.filter(i => i.isConnected).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/workspace')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">연동 관리</h1>
              <p className="text-gray-600 dark:text-gray-400">외부 서비스와 FlowTalk을 연결하여 생산성을 높이세요</p>
            </div>
          </div>
          <div className="ml-auto">
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-gray-900 dark:text-white" /> : <Moon className="w-5 h-5 text-gray-900 dark:text-white" />}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">연결된 서비스</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{connectedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">사용 가능한 서비스</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{integrations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">활성 알림</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="서비스 검색..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">카테고리</h3>
              <div className="space-y-1">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${
                      selectedCategory === category.id
                        ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>{category.label}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{category.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredIntegrations.map(integration => (
                <div key={integration.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        {integration.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{integration.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            integration.isConnected
                              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {integration.isConnected ? '연결됨' : '연결 안됨'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {integration.setupUrl && (
                      <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {integration.description}
                  </p>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">주요 기능</h4>
                    <div className="flex flex-wrap gap-1">
                      {integration.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleIntegration(integration.id)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        integration.isConnected
                          ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
                          : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800'
                      }`}
                    >
                      {integration.isConnected ? '연결 해제' : '연결하기'}
                    </button>
                    {integration.isConnected && (
                      <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredIntegrations.length === 0 && (
              <div className="text-center py-12">
                <Zap className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">검색 결과가 없습니다.</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">다른 키워드로 검색해보세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;