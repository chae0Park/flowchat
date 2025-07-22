import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  HelpCircle, 
  Search, 
  MessageCircle, 
  FileText, 
  Users, 
  Settings, 
  Zap,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';

const HelpCategoryPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
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

  const categoryData = {
    'getting-started': {
      title: '시작하기',
      icon: Users,
      description: 'FlowTalk을 처음 사용하는 분들을 위한 가이드',
      articles: [
        {
          id: '1',
          title: 'FlowTalk 계정 만들기',
          description: '새 계정을 생성하고 프로필을 설정하는 방법',
          readTime: '3분',
          difficulty: 'beginner'
        },
        {
          id: '2',
          title: '워크스페이스 생성 및 설정',
          description: '팀을 위한 워크스페이스를 만들고 기본 설정하기',
          readTime: '5분',
          difficulty: 'beginner'
        },
        {
          id: '3',
          title: '팀원 초대하기',
          description: '이메일이나 링크를 통해 팀원들을 워크스페이스에 초대하는 방법',
          readTime: '4분',
          difficulty: 'beginner'
        },
        {
          id: '4',
          title: '첫 번째 채널 만들기',
          description: '공개 및 비공개 채널을 생성하고 관리하는 방법',
          readTime: '6분',
          difficulty: 'beginner'
        },
        {
          id: '5',
          title: '프로필 설정 완료하기',
          description: '프로필 사진, 상태 메시지, 알림 설정 등 개인 설정 가이드',
          readTime: '4분',
          difficulty: 'beginner'
        }
      ]
    },
    'messaging': {
      title: '메시징',
      icon: MessageCircle,
      description: '메시지 전송, 반응, 스레드 등 커뮤니케이션 기능',
      articles: [
        {
          id: '1',
          title: '메시지 작성 및 전송',
          description: '기본적인 메시지 작성법과 서식 사용하기',
          readTime: '3분',
          difficulty: 'beginner'
        },
        {
          id: '2',
          title: '이모지 반응 사용하기',
          description: '메시지에 이모지로 반응하고 커스텀 이모지 추가하기',
          readTime: '2분',
          difficulty: 'beginner'
        },
        {
          id: '3',
          title: '멘션과 알림',
          description: '@멘션을 사용해 특정 사용자나 그룹에게 알림 보내기',
          readTime: '4분',
          difficulty: 'intermediate'
        },
        {
          id: '4',
          title: '메시지 편집 및 삭제',
          description: '보낸 메시지를 수정하거나 삭제하는 방법',
          readTime: '3분',
          difficulty: 'beginner'
        },
        {
          id: '5',
          title: '스레드 대화',
          description: '메시지에 답글을 달아 스레드 형태로 대화하기',
          readTime: '5분',
          difficulty: 'intermediate'
        }
      ]
    },
    'files': {
      title: '파일 관리',
      icon: FileText,
      description: '파일 업로드, 공유, 관리 방법',
      articles: [
        {
          id: '1',
          title: '파일 업로드하기',
          description: '드래그 앤 드롭이나 버튼을 통해 파일 업로드하기',
          readTime: '3분',
          difficulty: 'beginner'
        },
        {
          id: '2',
          title: '이미지 미리보기',
          description: '업로드된 이미지를 채팅에서 바로 확인하기',
          readTime: '2분',
          difficulty: 'beginner'
        },
        {
          id: '3',
          title: '파일 검색 및 필터링',
          description: '업로드된 파일을 빠르게 찾는 방법',
          readTime: '4분',
          difficulty: 'intermediate'
        },
        {
          id: '4',
          title: '파일 권한 관리',
          description: '파일 접근 권한을 설정하고 관리하기',
          readTime: '6분',
          difficulty: 'advanced'
        },
        {
          id: '5',
          title: '외부 클라우드 연동',
          description: 'Google Drive, Dropbox 등과 연동하여 파일 관리하기',
          readTime: '8분',
          difficulty: 'advanced'
        }
      ]
    },
    'settings': {
      title: '설정',
      icon: Settings,
      description: '계정, 워크스페이스, 알림 설정 관리',
      articles: [
        {
          id: '1',
          title: '계정 설정 변경',
          description: '프로필 정보, 비밀번호, 이메일 변경하기',
          readTime: '4분',
          difficulty: 'beginner'
        },
        {
          id: '2',
          title: '알림 설정 관리',
          description: '데스크톱, 이메일, 모바일 알림 설정하기',
          readTime: '5분',
          difficulty: 'intermediate'
        },
        {
          id: '3',
          title: '테마 및 외관 설정',
          description: '다크모드, 폰트 크기, 색상 테마 변경하기',
          readTime: '3분',
          difficulty: 'beginner'
        },
        {
          id: '4',
          title: '워크스페이스 관리',
          description: '워크스페이스 설정, 멤버 관리, 권한 설정',
          readTime: '8분',
          difficulty: 'advanced'
        },
        {
          id: '5',
          title: '개인정보 및 보안',
          description: '2단계 인증, 로그인 기록, 데이터 다운로드',
          readTime: '6분',
          difficulty: 'intermediate'
        }
      ]
    },
    'automation': {
      title: '자동화',
      icon: Zap,
      description: '워크플로우 자동화 및 봇 설정',
      articles: [
        {
          id: '1',
          title: '워크플로우 기본 개념',
          description: '자동화 워크플로우의 기본 개념과 구성 요소 이해하기',
          readTime: '6분',
          difficulty: 'intermediate'
        },
        {
          id: '2',
          title: '첫 번째 워크플로우 만들기',
          description: '간단한 환영 메시지 자동화 워크플로우 생성하기',
          readTime: '8분',
          difficulty: 'intermediate'
        },
        {
          id: '3',
          title: '트리거와 액션 설정',
          description: '다양한 트리거 조건과 실행할 액션 설정하기',
          readTime: '10분',
          difficulty: 'advanced'
        },
        {
          id: '4',
          title: '조건부 워크플로우',
          description: '복잡한 조건을 가진 고급 워크플로우 만들기',
          readTime: '12분',
          difficulty: 'advanced'
        },
        {
          id: '5',
          title: '외부 서비스 연동',
          description: 'GitHub, Trello 등 외부 서비스와 연동한 자동화',
          readTime: '15분',
          difficulty: 'advanced'
        }
      ]
    }
  };

  const currentCategory = categoryData[category as keyof typeof categoryData];

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <HelpCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">페이지를 찾을 수 없습니다</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">요청하신 도움말 카테고리가 존재하지 않습니다.</p>
          <button
            onClick={() => navigate('/help')}
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            도움말 홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const filteredArticles = currentCategory.articles.filter(article =>
    searchQuery === '' ||
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'intermediate':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
      case 'advanced':
        return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '초급';
      case 'intermediate':
        return '중급';
      case 'advanced':
        return '고급';
      default:
        return '기본';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/help')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>
          <div className="flex items-center gap-3">
            <currentCategory.icon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{currentCategory.title}</h1>
              <p className="text-gray-600 dark:text-gray-400">{currentCategory.description}</p>
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

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이 카테고리에서 검색..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Articles */}
        <div className="space-y-4">
          {filteredArticles.map(article => (
            <div key={article.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{article.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(article.difficulty)}`}>
                      {getDifficultyLabel(article.difficulty)}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">{article.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>읽는 시간: {article.readTime}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-1" />
              </div>
            </div>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">검색 결과가 없습니다.</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">다른 키워드로 검색해보세요.</p>
          </div>
        )}

        {/* Back to Help */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/help')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            도움말 홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpCategoryPage;