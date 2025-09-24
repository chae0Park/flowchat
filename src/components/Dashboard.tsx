import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAuth } from '../hooks/useAuth'; 
import { useChat } from '../contexts/ChatContext';
import { 
  MessageCircle, 
  Hash, 
  User, 
  Settings, 
  Search, 
  Users, 
  Plus, 
  Paperclip, 
  Send,
  Menu,
  X,
  LogOut,
  Calendar,
  BarChart3,
  Vote,
  Sun,
  Moon,
  Zap
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const { logout } = useAuth();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { 
    messages, 
    channels, 
    currentChannel, 
    addMessage, 
    switchChannel, 
    toggleReaction 
  } = useChat();
  
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!isAuthenticated || !user) {
    return <p>로그인이 필요합니다.</p>;
  }

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() || selectedFiles.length > 0) {
      addMessage({
        user: user?.name || 'Unknown',
        avatar: user?.avatar || '?',
        content: message,
        reactions: [],
        files: selectedFiles.map(file => ({ 
          name: file.name, 
          size: file.size, 
          type: file.type 
        }))
      });

      setMessage('');
      setSelectedFiles([]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleChannelSwitch = (channelId: string) => {
    switchChannel(channelId);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const currentChannelData = channels.find(ch => ch.id === currentChannel);
  const currentChannelName = currentChannelData?.type === 'dm' 
    ? currentChannelData.name 
    : `# ${currentChannelData?.name}`;

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md"
      >
        {sidebarOpen ? <X className="w-6 h-6 text-gray-900 dark:text-white" /> : <Menu className="w-6 h-6 text-gray-900 dark:text-white" />}
      </button>

      {/* Sidebar */}
      <div className={`w-80 bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white flex flex-col shadow-2xl fixed lg:relative z-40 h-full transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Workspace Header */}
        <div className="p-6 border-b border-white/10 dark:border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-8 h-8" />
            <div>
              <div className="text-xl font-semibold">🚀 스타트업 팀</div>
              <div className="text-sm opacity-80 dark:opacity-70">FlowTalk</div>
            </div>
          </div>
          {/* 이 div 주변에 오면 커서 생기면서 설정페이지로 갈 수 있도록 */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-3 flex-1 cursor-pointer"
              onClick={() => navigate('/settings')}
            >
              <div className="w-8 h-8 rounded-full bg-white/20 dark:bg-white/30 flex items-center justify-center font-semibold">
                {user.avatar}
              </div>
              <div className="flex-1">
                {/* 🚨 이거 user.name 고쳐야함  */}
                <div className="font-medium">{user.name}</div>
                <div className="text-xs opacity-70 dark:opacity-60 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  온라인
                </div>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-1 hover:bg-white/10 dark:hover:bg-white/20 rounded transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={handleLogout}
              className="p-1 hover:bg-white/10 dark:hover:bg-white/20 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10 dark:border-white/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50 dark:text-white/40" />
            <input
              type="text"
              placeholder="검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 dark:bg-white/20 border border-white/20 dark:border-white/30 rounded-lg text-white placeholder-white/50 dark:placeholder-white/40 focus:bg-white/20 dark:focus:bg-white/30 focus:outline-none"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="mb-6">
            <div className="flex items-center justify-between px-6 mb-2">
              <div className="text-xs font-semibold opacity-70 dark:opacity-60 uppercase tracking-wide">
                채널
              </div>
              <button className="p-1 hover:bg-white/10 dark:hover:bg-white/20 rounded transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <ul>
              {channels.filter(ch => ch.type === 'channel').map(channel => (
                <li
                  key={channel.id}
                  onClick={() => handleChannelSwitch(channel.id)}
                  className={`px-6 py-2 cursor-pointer transition-all flex items-center gap-3 text-sm hover:bg-white/10 dark:hover:bg-white/20 ${
                    currentChannel === channel.id ? 'bg-white/20 border-r-2 border-white' : ''
                  }`}
                >
                  <Hash className="w-4 h-4" />
                  <span className="flex-1">{channel.name}</span>
                  {channel.unread > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {channel.unread}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between px-6 mb-2">
              <div className="text-xs font-semibold opacity-70 dark:opacity-60 uppercase tracking-wide">
                다이렉트 메시지
              </div>
              <button className="p-1 hover:bg-white/10 dark:hover:bg-white/20 rounded transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <ul>
              {channels.filter(ch => ch.type === 'dm').map(channel => (
                <li
                  key={channel.id}
                  onClick={() => handleChannelSwitch(channel.id)}
                  className={`px-6 py-2 cursor-pointer transition-all flex items-center gap-3 text-sm hover:bg-white/10 dark:hover:bg-white/20 ${
                    currentChannel === channel.id ? 'bg-white/20 border-r-2 border-white' : ''
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="flex-1">{channel.name}</span>
                  {channel.unread > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {channel.unread}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Settings */}
        <div className="p-4 border-t border-white/10 dark:border-white/20">
          <div className="space-y-1">
            <button 
              onClick={() => navigate('/settings')}
              className="w-full flex items-center gap-3 text-left hover:bg-white/10 dark:hover:bg-white/20 p-3 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>설정</span>
            </button>
            <button 
              onClick={() => navigate('/workspace')}
              className="w-full flex items-center gap-3 text-left hover:bg-white/10 dark:hover:bg-white/20 p-3 rounded-lg transition-colors"
            >
              <Users className="w-5 h-5" />
              <span>워크스페이스</span>
            </button>
            <button 
              onClick={() => navigate('/help')}
              className="w-full flex items-center gap-3 text-left hover:bg-white/10 dark:hover:bg-white/20 p-3 rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>도움말</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-lg font-semibold text-gray-800 dark:text-white">
                {currentChannelName}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {currentChannelData?.type === 'channel' 
                  ? '팀 전체 공지사항과 일반적인 대화' 
                  : '개인 메시지'}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/search')}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button 
              onClick={() => navigate('/calendar')}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button 
              onClick={() => navigate('/polls')}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Vote className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button 
              onClick={() => navigate('/analytics')}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button 
              onClick={() => navigate('/workflow')}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Zap className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesRef}
          className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 space-y-4"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="flex gap-3 p-3 rounded-xl hover:bg-indigo-50/50 dark:hover:bg-gray-800/50 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {msg.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-800 dark:text-white">{msg.user}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{msg.timestamp}</span>
                </div>
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed">{msg.content}</div>
                
                {msg.files && msg.files.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.files.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                        <span className="text-lg">📄</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{file.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</div>
                        </div>
                        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                          다운로드
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Reactions */}
                <div className="flex items-center gap-1 mt-2">
                  {msg.reactions.map((reaction) => (
                    <button
                      key={reaction.emoji}
                      onClick={() => toggleReaction(msg.id, reaction.emoji)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all ${
                        reaction.active 
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span>{reaction.emoji}</span>
                      <span className="text-xs">{reaction.count}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => toggleReaction(msg.id, '👍')}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-sm px-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Typing Indicator */}
        {isTyping && (
          <div className="px-6 py-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              누군가가 타이핑 중...
            </span>
          </div>
        )}

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">첨부된 파일:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
                  <span className="text-sm">📄</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{file.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-end gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setIsTyping(e.target.value.length > 0);
                }}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요..."
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-200 dark:border-gray-600 min-h-[44px] max-h-32 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                rows={1}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!message.trim() && selectedFiles.length === 0}
              className={`p-3 rounded-lg transition-all ${
                message.trim() || selectedFiles.length > 0
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;