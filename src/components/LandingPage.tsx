// src/components/LandingPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
//import { useAuthStore } from '../stores/authStore';
import { ArrowRight, MessageCircle, Search, Upload, Link, Phone, Zap } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const navigate = useNavigate();
  const { loginDemo } = useAuth();

  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    const observeElements = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      }, { threshold: 0.1 });

      elements.forEach(element => {
        observer.observe(element);
      });
    };

    observeElements();
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    try {
      await loginDemo();
      navigate('/dashboard');
    } catch (error) {
      console.error('Demo login failed:', error);
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg dark:bg-gray-900/95">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 text-3xl font-bold">
              <MessageCircle className="w-8 h-8" />
              <span>FlowTalk</span>
            </div>
            <ul className="hidden md:flex items-center gap-8">
              <li><a href="#features" onClick={(e) => handleSmoothScroll(e, 'features')} className="text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 font-medium transition-colors">기능</a></li>
              <li><a href="#target" onClick={(e) => handleSmoothScroll(e, 'target')} className="text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 font-medium transition-colors">타깃</a></li>
              <li><a href="#contact" onClick={(e) => handleSmoothScroll(e, 'contact')} className="text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 font-medium transition-colors">문의</a></li>
              <li>
                <button 
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors text-xl"
                >
                  {isDarkMode ? '☀️' : '🌙'}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 dark:from-blue-700/30 dark:to-purple-700/30"></div>
        <div className="max-w-6xl mx-auto px-5 relative z-10">
          <h1 className="text-6xl font-bold mb-4 animate-fade-in-up">FlowTalk</h1>
          <p className="text-2xl mb-8 opacity-90 animate-fade-in-up animation-delay-200">
            일도 대화도, 자연스럽게 연결하다
          </p>
          <p className="text-lg max-w-2xl mx-auto mb-12 opacity-80 animate-fade-in-up animation-delay-400">
            슬랙의 강력한 협업 기능은 그대로, 더 친근하고 감성적인 디자인으로 
            MZ세대를 위한 차세대 협업 메신저입니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-600">
            <button 
              onClick={handleGetStarted}
              className="bg-white dark:bg-gray-100 text-indigo-600 dark:text-indigo-700 px-10 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              무료로 시작하기
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={handleDemoLogin}
              disabled={isDemoLoading}
              className="bg-white/20 dark:bg-white/10 text-white px-10 py-4 rounded-full font-semibold text-lg border-2 border-white/30 dark:border-white/20 hover:bg-white/30 dark:hover:bg-white/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isDemoLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white dark:border-gray-200 border-t-transparent rounded-full animate-spin"></div>
                  <span>로딩 중...</span>
                </>
              ) : (
                <>
                  데모 보기
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white animate-on-scroll">
            주요 기능
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {[
              { emoji: '💬', title: '채널 기반 소통', desc: '공개/비공개 채널로 주제별 커뮤니케이션이 가능합니다. 팀원들과 체계적으로 소통하세요.' },
              { icon: Search, emoji: '🔍', title: '강력한 검색 기능', desc: '메시지, 파일, 링크 등 모든 정보에 대한 빠르고 정확한 검색을 제공합니다.' },
              { icon: Upload, emoji: '📁', title: '파일 공유', desc: '이미지, 문서, 동영상 등 다양한 형식의 파일을 쉽게 전송하고 미리보기할 수 있습니다.' },
              { icon: Link, emoji: '🔗', title: '외부 앱 연동', desc: '구글 드라이브, 깃허브, 노션, 트렐로 등 다양한 앱과 완벽하게 통합됩니다.' },
              { icon: Phone, emoji: '📞', title: '음성/화상통화', desc: '팀원들과 실시간으로 소통할 수 있는 고품질 음성/화상통화 기능을 제공합니다.' },
              { icon: Zap, emoji: '🤖', title: '워크플로우 자동화', desc: '반복적인 작업을 자동화하여 생산성을 높이고 시간을 절약하세요.' }
            ].map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all border border-indigo-100 dark:border-gray-700 animate-on-scroll">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{feature.emoji}</span>
                  {/* <feature.icon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" /> */}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Section */}
      <section id="target" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white animate-on-scroll">
            누구를 위한 FlowTalk인가요?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {[
              { emoji: '🚀', title: 'MZ 스타트업', desc: '자유롭고 직관적인 툴을 선호하는 스타트업 팀을 위한 감성적인 UI와 깔끔한 작업공간을 제공합니다.' },
              { emoji: '🎓', title: '대학생 스터디', desc: '가벼운 협업이 필요한 학생들을 위한 투표 기능, 캘린더 연동, 귀여운 테마를 지원합니다.' },
              { emoji: '💼', title: '프리랜서 & 1인팀', desc: '고객과의 원활한 커뮤니케이션을 위한 포트폴리오 링크 공유와 클라이언트 전용 채널 기능을 제공합니다.' },
              { emoji: '🏢', title: '비IT 일반팀', desc: '쉬운 사용성과 문서 공유 중심의 온보딩 챗봇, 간편한 UI로 누구나 쉽게 사용할 수 있습니다.' }
            ].map((target, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-2xl text-center shadow-lg hover:-translate-y-1 transition-all animate-on-scroll">
                <span className="text-5xl mb-4 block">{target.emoji}</span>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">{target.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{target.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white text-center">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-4xl font-bold mb-4">지금 바로 시작해볼까요?</h2>
          <p className="text-xl mb-8 opacity-90">
            팀워크를 새롭게 연결하는 FlowTalk과 함께 더 나은 협업을 경험해보세요.
          </p>
          <button 
            onClick={handleGetStarted}
            className="bg-white dark:bg-gray-100 text-indigo-600 dark:text-indigo-700 px-10 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 mx-auto"
          >
            무료 체험 시작하기
            <ArrowRight className="w-5 h-5" />
          </button>
          <button 
            onClick={handleDemoLogin}
            disabled={isDemoLoading}
            className="bg-white/20 dark:bg-white/10 text-white px-8 py-3 rounded-full font-semibold border-2 border-white/30 dark:border-white/20 hover:bg-white/30 dark:hover:bg-white/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 mx-auto mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isDemoLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white dark:border-gray-200 border-t-transparent rounded-full animate-spin"></div>
                <span>로딩 중...</span>
              </>
            ) : (
              <>
                또는 데모로 체험하기
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-800 dark:bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 dark:text-indigo-300 mb-4">
                <MessageCircle className="w-6 h-6" />
                <h3 className="text-xl">FlowTalk</h3>
              </div>
              <p className="text-gray-400 dark:text-gray-300 mb-2">일도 대화도, 자연스럽게 연결하다</p>
              <p className="text-gray-400 dark:text-gray-300">모두를 위한 협업의 시작</p>
            </div>
            <div>
              <h3 className="text-xl mb-4 text-indigo-400 dark:text-indigo-300">기능</h3>
              <p className="text-gray-400 dark:text-gray-300 mb-2"><a href="#" className="hover:text-indigo-400 dark:hover:text-indigo-300">채널 기반 소통</a></p>
              <p className="text-gray-400 dark:text-gray-300 mb-2"><a href="#" className="hover:text-indigo-400 dark:hover:text-indigo-300">파일 공유</a></p>
              <p className="text-gray-400 dark:text-gray-300 mb-2"><a href="#" className="hover:text-indigo-400 dark:hover:text-indigo-300">외부 앱 연동</a></p>
              <p className="text-gray-400 dark:text-gray-300"><a href="#" className="hover:text-indigo-400 dark:hover:text-indigo-300">워크플로우 자동화</a></p>
            </div>
            <div>
              <h3 className="text-xl mb-4 text-indigo-400 dark:text-indigo-300">고객 지원</h3>
              <p className="text-gray-400 dark:text-gray-300 mb-2"><a href="#" className="hover:text-indigo-400 dark:hover:text-indigo-300">도움말 센터</a></p>
              <p className="text-gray-400 dark:text-gray-300 mb-2"><a href="#" className="hover:text-indigo-400 dark:hover:text-indigo-300">문의하기</a></p>
              <p className="text-gray-400 dark:text-gray-300"><a href="#" className="hover:text-indigo-400 dark:hover:text-indigo-300">커뮤니티</a></p>
            </div>
            <div>
              <h3 className="text-xl mb-4 text-indigo-400 dark:text-indigo-300">회사</h3>
              <p className="text-gray-400 dark:text-gray-300 mb-2"><a href="#" className="hover:text-indigo-400 dark:hover:text-indigo-300">회사 소개</a></p>
              <p className="text-gray-400 dark:text-gray-300 mb-2"><a href="#" className="hover:text-indigo-400 dark:hover:text-indigo-300">채용 정보</a></p>
              <p className="text-gray-400 dark:text-gray-300"><a href="#" className="hover:text-indigo-400 dark:hover:text-indigo-300">개인정보처리방침</a></p>
            </div>
          </div>
          <div className="border-t border-gray-700 dark:border-gray-600 pt-8 text-center text-gray-400 dark:text-gray-300">
            <p>&copy; 2025 FlowTalk. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease;
        }
        
        .animate-on-scroll.animate-fade-in-up {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;