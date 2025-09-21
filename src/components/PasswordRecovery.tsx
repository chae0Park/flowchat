import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Mail, CheckCircle, Sun, Moon } from 'lucide-react';

const PasswordRecovery: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      //todo: Simulate API call -> Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSuccess(true);
    } catch (err) {
      setError('비밀번호 재설정 이메일 전송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">이메일을 확인하세요</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              <strong>{email}</strong>로 비밀번호 재설정 링크를 보내드렸습니다.
              이메일을 확인하고 링크를 클릭하여 새 비밀번호를 설정하세요.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/auth')}
                className="w-full bg-indigo-600 dark:bg-indigo-700 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
              >
                로그인으로 돌아가기
              </button>
              <button
                onClick={() => setIsSuccess(false)}
                className="w-full text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
              >
                다른 이메일로 재시도
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>로그인으로 돌아가기</span>
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-2 text-white hover:text-white/80 transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 text-white mb-4">
            <MessageCircle className="w-10 h-10" />
            <h1 className="text-4xl font-bold">FlowTalk</h1>
          </div>
          <p className="text-white/80 text-lg">비밀번호를 잊으셨나요?</p>
        </div>

        {/* Recovery Form */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">비밀번호 재설정</h2>
            <p className="text-gray-600 dark:text-gray-400">
              가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                이메일 주소
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="이메일을 입력하세요"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>전송 중...</span>
                </div>
              ) : (
                '재설정 링크 보내기'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              이메일이 오지 않나요?{' '}
              <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors font-medium">
                스팸함을 확인
              </button>
              하거나{' '}
              <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors font-medium">
                고객지원에 문의
              </button>
              하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordRecovery;