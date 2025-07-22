import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageCircle, 
  FileText, 
  Activity,
  Clock,
  Hash,
  Sun,
  Moon
} from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
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
  const periods = [
    { id: 'day', label: '오늘' },
    { id: 'week', label: '이번 주' },
    { id: 'month', label: '이번 달' },
    { id: 'quarter', label: '분기' }
  ];

  const stats = {
    totalMessages: 1247,
    activeUsers: 12,
    filesShared: 89,
    channelsActive: 8,
    avgResponseTime: '2.3분',
    peakHour: '14:00-15:00'
  };

  const messageData = [
    { day: '월', messages: 180 },
    { day: '화', messages: 220 },
    { day: '수', messages: 190 },
    { day: '목', messages: 250 },
    { day: '금', messages: 280 },
    { day: '토', messages: 120 },
    { day: '일', messages: 95 }
  ];

  const channelActivity = [
    { name: '일반', messages: 450, members: 12, growth: '+12%' },
    { name: '개발', messages: 320, members: 8, growth: '+8%' },
    { name: '디자인', messages: 180, members: 4, growth: '+15%' },
    { name: '마케팅', messages: 150, members: 6, growth: '+5%' },
    { name: '잡담', messages: 147, members: 12, growth: '-2%' }
  ];

  const topEmojis = [
    { emoji: '👍', count: 89, name: '좋아요' },
    { emoji: '😊', count: 67, name: '웃음' },
    { emoji: '🎉', count: 45, name: '축하' },
    { emoji: '❤️', count: 34, name: '하트' },
    { emoji: '🔥', count: 28, name: '불' }
  ];

  const activeUsers = [
    { name: '김민수', messages: 156, avatar: '김', status: 'online' },
    { name: '이지혜', messages: 134, avatar: '이', status: 'online' },
    { name: '박준호', messages: 98, avatar: '박', status: 'offline' },
    { name: '최유진', messages: 87, avatar: '최', status: 'online' },
    { name: '데모 사용자', messages: 45, avatar: '데', status: 'online' }
  ];

  const getMaxMessages = () => Math.max(...messageData.map(d => d.messages));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">분석 대시보드</h1>
              <p className="text-gray-600 dark:text-gray-400">팀 활동과 커뮤니케이션 현황을 확인하세요</p>
            </div>
          </div>
          <div className="ml-auto">
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors mr-2"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-gray-900 dark:text-white" /> : <Moon className="w-5 h-5 text-gray-900 dark:text-white" />}
            </button>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {periods.map(period => (
                <option key={period.id} value={period.id}>{period.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">총 메시지</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMessages.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">활성 사용자</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">공유된 파일</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.filesShared}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Hash className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">활성 채널</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.channelsActive}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">평균 응답시간</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgResponseTime}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">피크 시간</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.peakHour}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Message Activity Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">메시지 활동</h3>
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span>+12% 증가</span>
              </div>
            </div>
            <div className="space-y-4">
              {messageData.map((data, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 text-sm text-gray-600 dark:text-gray-400 font-medium">{data.day}</div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative">
                    <div
                      className="bg-indigo-500 dark:bg-indigo-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(data.messages / getMaxMessages()) * 100}%` }}
                    />
                  </div>
                  <div className="w-12 text-sm text-gray-900 dark:text-white font-medium text-right">
                    {data.messages}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Emojis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">인기 이모지</h3>
            <div className="space-y-4">
              {topEmojis.map((emoji, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 flex items-center justify-center text-2xl">
                    {emoji.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{emoji.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{emoji.count}회</span>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-yellow-500 dark:bg-yellow-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(emoji.count / topEmojis[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Channel Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">채널별 활동</h3>
            <div className="space-y-4">
              {channelActivity.map((channel, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded flex items-center justify-center">
                      <Hash className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{channel.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{channel.members}명 참여</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-white">{channel.messages}개</div>
                    <div className={`text-sm ${
                      channel.growth.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {channel.growth}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">활성 사용자</h3>
            <div className="space-y-4">
              {activeUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {user.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {user.name}
                        <span className={`w-2 h-2 rounded-full ${
                          user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{user.messages}개 메시지</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-indigo-500 dark:bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${(user.messages / activeUsers[0].messages) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;