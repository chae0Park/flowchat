// src/components/AuthPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MessageCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  
  const {
    login,
    signup,
    loginDemo,
    isLoading,
    loginError,
    signupError,
    demoLoginError,
  } = useAuth();
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) { // 로그인 탭일 때 isLogin true
        await login({ email: formData.email, password: formData.password });
      } else { // 아닐땐 : 회원가입 

        if (formData.password !== formData.confirmPassword) {
          throw new Error('비밀번호가 일치하지 않습니다.');
        }
        await signup({ 
          name: formData.name, 
          email: formData.email, 
          password: formData.password 
        });

      }
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || '오류가 발생했습니다.';
      setError(errorMessage);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    try {
      await loginDemo();
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || '데모 로그인에 실패했습니다.';
      setError(errorMessage);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Display the most relevant error
  const displayError = error || loginError?.message || signupError?.message || demoLoginError?.message;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 mt-4 flex items-center gap-2 text-white hover:text-white/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>돌아가기</span>
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 text-white mb-4">
            <MessageCircle className="w-10 h-10" />
            <h1 className="text-4xl font-bold">FlowTalk</h1>
          </div>
          <p className="text-white/80 text-lg">
            {isLogin ? '다시 만나서 반가워요!' : '새로운 여정을 시작해보세요!'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
          <div className="mb-6">
            <div className="flex bg-gray-100 rounded-full p-1">
              <button
                onClick={() => {
                  setIsLogin(true); 
                  setError('');
                }}
                className={`flex-1 py-3 px-4 rounded-full font-semibold transition-all ${
                  isLogin 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                로그인
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                className={`flex-1 py-3 px-4 rounded-full font-semibold transition-all ${
                  !isLogin 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                회원가입
              </button>
            </div>
          </div>

          {/* 회원가입& 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="이름을 입력하세요"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="이메일을 입력하세요"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pr-12"
                  placeholder="비밀번호를 입력하세요"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="비밀번호를 다시 입력하세요"
                  required={!isLogin}
                />
              </div>
            )}

            {displayError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                {displayError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>처리 중...</span>
                </div>
              ) : (
                isLogin ? '로그인' : '회원가입'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500">또는</span>
              </div>
            </div>
            <button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="mt-4 w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>🚀</span>
                  <span>데모로 체험하기</span>
                </>
              )}
            </button>
          </div>

          {isLogin && (
            <div className="mt-6 text-center">
              <button 
                className="text-indigo-600 hover:text-indigo-800 transition-colors font-medium" 
                onClick={() => navigate('/password-recovery')}
              >
                비밀번호를 잊으셨나요?
              </button>
            </div>
          )}

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="ml-2 text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
              >
                {isLogin ? '회원가입' : '로그인'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;