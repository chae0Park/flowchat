import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  MessageCircle, 
  User, 
  FileText, 
  Calendar,
  Hash,
  Clock,
  Sun,
  Moon
} from 'lucide-react';

const SearchPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  const navigate = useNavigate();
  const { searchMessages, channels } = useChat();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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
  const filters = [
    { id: 'all', label: '전체', icon: Search },
    { id: 'messages', label: '메시지', icon: MessageCircle },
    { id: 'files', label: '파일', icon: FileText },
    { id: 'users', label: '사용자', icon: User },
    { id: 'channels', label: '채널', icon: Hash }
  ];

  const mockUsers = [
    { id: '1', name: '김민수', email: 'kim@example.com', avatar: '김', status: 'online' },
    { id: '2', name: '이지혜', email: 'lee@example.com', avatar: '이', status: 'online' },
    { id: '3', name: '박준호', email: 'park@example.com', avatar: '박', status: 'offline' },
    { id: '4', name: '최유진', email: 'choi@example.com', avatar: '최', status: 'online' }
  ];

  const mockFiles = [
    { id: '1', name: '프로젝트_계획서.pdf', size: 2048000, type: 'pdf', channel: '일반', user: '김민수', date: '2024-01-15' },
    { id: '2', name: '디자인_시안.png', size: 1024000, type: 'image', channel: '디자인', user: '최유진', date: '2024-01-14' },
    { id: '3', name: '회의록.docx', size: 512000, type: 'document', channel: '일반', user: '이지혜', date: '2024-01-13' }
  ];

  useEffect(() => {
    if (query.trim()) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        performSearch();
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [query, activeFilter]);

  const performSearch = () => {
    let searchResults: any[] = [];

    if (activeFilter === 'all' || activeFilter === 'messages') {
      const messages = searchMessages(query);
      searchResults.push(...messages.map(msg => ({ ...msg, type: 'message' })));
    }

    if (activeFilter === 'all' || activeFilter === 'users') {
      const users = mockUsers.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );
      searchResults.push(...users.map(user => ({ ...user, type: 'user' })));
    }

    if (activeFilter === 'all' || activeFilter === 'channels') {
      const filteredChannels = channels.filter(channel =>
        channel.name.toLowerCase().includes(query.toLowerCase())
      );
      searchResults.push(...filteredChannels.map(channel => ({ ...channel, type: 'channel' })));
    }

    if (activeFilter === 'all' || activeFilter === 'files') {
      const files = mockFiles.filter(file =>
        file.name.toLowerCase().includes(query.toLowerCase())
      );
      searchResults.push(...files.map(file => ({ ...file, type: 'file' })));
    }

    setResults(searchResults);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderResult = (result: any) => {
    switch (result.type) {
      case 'message':
        return (
          <div key={result.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {result.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-800 dark:text-white">{result.user}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{result.timestamp}</span>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">메시지</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{result.content}</p>
              </div>
            </div>
          </div>
        );

      case 'user':
        return (
          <div key={result.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {result.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 dark:text-white">{result.name}</span>
                  <span className={`w-2 h-2 rounded-full ${result.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">사용자</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{result.email}</p>
              </div>
            </div>
          </div>
        );

      case 'channel':
        return (
          <div key={result.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <Hash className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 dark:text-white">{result.name}</span>
                  <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">채널</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{result.type === 'channel' ? '공개 채널' : '비공개 채널'}</p>
              </div>
            </div>
          </div>
        );

      case 'file':
        return (
          <div key={result.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 dark:text-white">{result.name}</span>
                  <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">파일</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {formatFileSize(result.size)} • {result.user} • #{result.channel}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>
          <div className="flex items-center gap-3">
            <Search className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">검색</h1>
              <p className="text-gray-600 dark:text-gray-400">메시지, 파일, 사용자를 검색하세요</p>
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

        {/* Search Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색어를 입력하세요..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeFilter === filter.id
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <filter.icon className="w-4 h-4" />
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {isSearching ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">검색 중...</p>
            </div>
          ) : query.trim() && results.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">검색 결과가 없습니다.</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">다른 키워드로 검색해보세요.</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  총 {results.length}개의 결과를 찾았습니다
                </span>
              </div>
              {results.map(renderResult)}
            </>
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">검색어를 입력해주세요</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">메시지, 파일, 사용자, 채널을 검색할 수 있습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;