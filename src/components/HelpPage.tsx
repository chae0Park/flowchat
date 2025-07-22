import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Mail,
  Phone,
  ExternalLink,
  Sun,
  Moon
} from 'lucide-react';

const HelpPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  const categories = [
    { id: 'all', label: '전체', icon: HelpCircle },
    { id: 'getting-started', label: '시작하기', icon: Users },
    { id: 'messaging', label: '메시징', icon: MessageCircle },
    { id: 'files', label: '파일 관리', icon: FileText },
    { id: 'settings', label: '설정', icon: Settings },
    { id: 'automation', label: '자동화', icon: Zap }
  ];

  const faqs = [
    {
      id: '1',
      category: 'getting-started',
      question: 'FlowTalk을 처음 시작하는 방법은?',
      answer: '회원가입 후 워크스페이스를 생성하거나 초대받은 워크스페이스에 참여하세요. 프로필을 설정하고 팀원들과 첫 메시지를 나눠보세요.',
      popular: true
    },
    {
      id: '2',
      category: 'messaging',
      question: '메시지에 파일을 첨부하는 방법은?',
      answer: '메시지 입력창 옆의 📎 버튼을 클릭하거나 파일을 드래그 앤 드롭으로 첨부할 수 있습니다. 이미지, 문서, 동영상 등 다양한 형식을 지원합니다.',
      popular: true
    },
    {
      id: '3',
      category: 'messaging',
      question: '메시지에 이모지 반응을 추가하는 방법은?',
      answer: '메시지에 마우스를 올리면 나타나는 ➕ 버튼을 클릭하거나, 기존 이모지 반응을 클릭하여 추가/제거할 수 있습니다.',
      popular: false
    },
    {
      id: '4',
      category: 'files',
      question: '공유된 파일을 어떻게 찾을 수 있나요?',
      answer: '상단의 검색 기능을 사용하거나, 각 채널의 파일 탭에서 해당 채널에 공유된 모든 파일을 확인할 수 있습니다.',
      popular: true
    },
    {
      id: '5',
      category: 'settings',
      question: '알림 설정을 변경하는 방법은?',
      answer: '사용자 설정 > 알림에서 데스크톱 알림, 이메일 알림, 소리 알림 등을 개별적으로 설정할 수 있습니다.',
      popular: false
    },
    {
      id: '6',
      category: 'automation',
      question: '워크플로우 자동화는 어떻게 설정하나요?',
      answer: '워크플로우 페이지에서 트리거(메시지, 파일 업로드, 일정 등)와 액션(메시지 전송, 알림 등)을 조합하여 자동화 규칙을 만들 수 있습니다.',
      popular: false
    },
    {
      id: '7',
      category: 'getting-started',
      question: '팀원을 워크스페이스에 초대하는 방법은?',
      answer: '워크스페이스 설정 > 멤버에서 이메일 주소를 입력하여 팀원을 초대할 수 있습니다. 초대 링크를 생성하여 공유하는 것도 가능합니다.',
      popular: true
    },
    {
      id: '8',
      category: 'messaging',
      question: '채널과 다이렉트 메시지의 차이점은?',
      answer: '채널은 여러 명이 참여하는 공개/비공개 대화방이고, 다이렉트 메시지는 1:1 또는 소규모 그룹 간의 개인적인 대화입니다.',
      popular: false
    }
  ];

  const tutorials = [
    {
      id: '1',
      title: 'FlowTalk 시작하기',
      description: '처음 사용자를 위한 기본 가이드',
      duration: '5분',
      steps: 8
    },
    {
      id: '2',
      title: '효과적인 채널 관리',
      description: '채널을 생성하고 관리하는 방법',
      duration: '7분',
      steps: 12
    },
    {
      id: '3',
      title: '파일 공유와 협업',
      description: '파일을 공유하고 함께 작업하는 방법',
      duration: '6분',
      steps: 10
    },
    {
      id: '4',
      title: '워크플로우 자동화 활용',
      description: '반복 작업을 자동화하는 방법',
      duration: '10분',
      steps: 15
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularFaqs = faqs.filter(faq => faq.popular);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>
          <div className="flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">도움말 센터</h1>
              <p className="text-gray-600 dark:text-gray-400">FlowTalk 사용법과 문제 해결 방법을 찾아보세요</p>
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
              placeholder="궁금한 내용을 검색해보세요..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">카테고리</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => {
                      if (category.id === 'all') {
                        setSelectedCategory(category.id);
                      } else {
                        navigate(`/help/${category.id}`);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                      selectedCategory === category.id
                        ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <category.icon className="w-4 h-4" />
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">문의하기</h3>
              <div className="space-y-3">
                <a
                  onClick={() => navigate('/contact')}
                  className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors"
                >
                  <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">이메일 문의</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">support@flowtalk.com</div>
                  </div>
                </a>
                
                <a
                  onClick={() => navigate('/contact')}
                  className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors"
                >
                  <Phone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">전화 문의</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">1588-1234</div>
                  </div>
                </a>
                
                <a
                  onClick={() => navigate('/contact')}
                  className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">라이브 채팅</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">실시간 상담</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Popular FAQs */}
            {selectedCategory === 'all' && searchQuery === '' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">인기 질문</h3>
                <div className="space-y-3">
                  {popularFaqs.map(faq => (
                    <div key={faq.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">{faq.question}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{faq.answer}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tutorials */}
            {selectedCategory === 'all' && searchQuery === '' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">튜토리얼</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tutorials.map(tutorial => (
                    <div key={tutorial.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">{tutorial.title}</h4>
                        <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{tutorial.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{tutorial.duration}</span>
                        <span>{tutorial.steps}단계</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Results */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {searchQuery ? `"${searchQuery}" 검색 결과` : '자주 묻는 질문'}
                </h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredFaqs.length}개 결과
                </span>
              </div>
              
              {filteredFaqs.length > 0 ? (
                <div className="space-y-4">
                  {filteredFaqs.map(faq => (
                    <div key={faq.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">{faq.question}</h4>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{faq.answer}</p>
                          </div>
                          {faq.popular && (
                            <span className="ml-3 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-xs rounded-full">
                              인기
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <HelpCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">검색 결과가 없습니다.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">다른 키워드로 검색해보거나 문의하기를 이용해주세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;