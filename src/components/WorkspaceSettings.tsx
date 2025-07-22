import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InviteMembersModal from './InviteMembersModal';
import CreateChannelModal from './CreateChannelModal';
import { 
  ArrowLeft, 
  Users, 
  Settings, 
  Shield, 
  Zap, 
  Upload,
  Plus,
  Edit,
  Trash2,
  MessageCircle,
  Crown,
  UserPlus,
  Search,
  Sun,
  Moon
} from 'lucide-react';

const WorkspaceSettings: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [workspaceSettings, setWorkspaceSettings] = useState({
    name: '스타트업 팀',
    description: 'FlowTalk을 사용하는 스타트업 팀의 워크스페이스입니다.',
    domain: 'startup-team',
    visibility: 'private'
  });

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

  const [members] = useState([
    { id: '1', name: '김민수', email: 'kim@example.com', role: 'owner', avatar: '김', online: true },
    { id: '2', name: '이지혜', email: 'lee@example.com', role: 'admin', avatar: '이', online: true },
    { id: '3', name: '박준호', email: 'park@example.com', role: 'member', avatar: '박', online: false },
    { id: '4', name: '최유진', email: 'choi@example.com', role: 'member', avatar: '최', online: true }
  ]);

  const [channels] = useState([
    { id: '1', name: '일반', members: 4, type: 'public' },
    { id: '2', name: '개발', members: 3, type: 'private' },
    { id: '3', name: '디자인', members: 2, type: 'private' },
    { id: '4', name: '잡담', members: 4, type: 'public' }
  ]);

  const tabs = [
    { id: 'general', label: '일반', icon: Settings },
    { id: 'members', label: '멤버', icon: Users },
    { id: 'channels', label: '채널', icon: MessageCircle },
    { id: 'permissions', label: '권한', icon: Shield },
    { id: 'integrations', label: '연동', icon: Zap }
  ];

  const handleSave = () => {
    console.log('Workspace settings saved:', workspaceSettings);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl mb-4">
                  🚀
                </div>
                <label className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Upload className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  워크스페이스 이름
                </label>
                <input
                  type="text"
                  value={workspaceSettings.name}
                  onChange={(e) => setWorkspaceSettings({...workspaceSettings, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  도메인
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={workspaceSettings.domain}
                    onChange={(e) => setWorkspaceSettings({...workspaceSettings, domain: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg text-gray-600 dark:text-gray-300">
                    .flowtalk.com
                  </span>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  설명
                </label>
                <textarea
                  value={workspaceSettings.description}
                  onChange={(e) => setWorkspaceSettings({...workspaceSettings, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  공개 설정
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="private"
                      checked={workspaceSettings.visibility === 'private'}
                      onChange={(e) => setWorkspaceSettings({...workspaceSettings, visibility: e.target.value})}
                      className="mr-2"
                    />
                    <span className="text-gray-900 dark:text-white">비공개 - 초대받은 사용자만 참여 가능</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="public"
                      checked={workspaceSettings.visibility === 'public'}
                      onChange={(e) => setWorkspaceSettings({...workspaceSettings, visibility: e.target.value})}
                      className="mr-2"
                    />
                    <span className="text-gray-900 dark:text-white">공개 - 누구나 참여 가능</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'members':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">멤버 관리</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">워크스페이스 멤버를 초대하고 관리하세요</p>
              </div>
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                멤버 초대
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="멤버 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {member.avatar}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2 text-gray-900 dark:text-white">
                        {member.name}
                        {member.role === 'owner' && <Crown className="w-4 h-4 text-yellow-500" />}
                        <span className={`w-2 h-2 rounded-full ${member.online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{member.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      disabled={member.role === 'owner'}
                    >
                      <option value="owner">소유자</option>
                      <option value="admin">관리자</option>
                      <option value="member">멤버</option>
                    </select>
                    {member.role !== 'owner' && (
                      <button className="p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'channels':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">채널 관리</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">워크스페이스의 채널을 생성하고 관리하세요</p>
              </div>
              <button
                onClick={() => setShowCreateChannelModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                채널 생성
              </button>
            </div>
            
            <div className="space-y-3">
              {channels.map(channel => (
                <div key={channel.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                      <span className="text-indigo-600 dark:text-indigo-400">#</span>
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2 text-gray-900 dark:text-white">
                        {channel.name}
                        {channel.type === 'private' && (
                          <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">비공개</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{channel.members}명의 멤버</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'permissions':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">권한 설정</h3>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="font-medium mb-2 text-gray-900 dark:text-white">채널 생성 권한</div>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="radio" name="channel-create" className="mr-2" />
                      <span className="text-gray-900 dark:text-white">모든 멤버</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="channel-create" className="mr-2" defaultChecked />
                      <span className="text-gray-900 dark:text-white">관리자 이상</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="channel-create" className="mr-2" />
                      <span className="text-gray-900 dark:text-white">소유자만</span>
                    </label>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="font-medium mb-2 text-gray-900 dark:text-white">멤버 초대 권한</div>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="radio" name="member-invite" className="mr-2" />
                      <span className="text-gray-900 dark:text-white">모든 멤버</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="member-invite" className="mr-2" defaultChecked />
                      <span className="text-gray-900 dark:text-white">관리자 이상</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="member-invite" className="mr-2" />
                      <span className="text-gray-900 dark:text-white">소유자만</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'integrations':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">연동 관리</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'GitHub', desc: '코드 저장소와 연동', icon: '🐙', connected: true },
                  { name: 'Google Drive', desc: '파일 공유 및 협업', icon: '📁', connected: false },
                  { name: 'Notion', desc: '문서 관리 및 공유', icon: '📝', connected: true },
                  { name: 'Trello', desc: '프로젝트 관리', icon: '📋', connected: false }
                ].map((integration) => (
                  <div key={integration.name} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{integration.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{integration.desc}</div>
                        </div>
                      </div>
                      <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          integration.connected
                            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
                            : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800'
                        }`}
                      >
                        {integration.connected ? '연결 해제' : '연결'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/integrations')}
                  className="px-6 py-3 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                >
                  모든 연동 서비스 보기
                </button>
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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
              🚀
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">워크스페이스 설정</h1>
              <p className="text-gray-600 dark:text-gray-400">팀과 워크스페이스를 관리하세요</p>
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

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border-r-2 border-indigo-500'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              {renderTabContent()}
              
              {(activeTab === 'general' || activeTab === 'permissions') && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-4">
                    <button
                      onClick={handleSave}
                      className="px-6 py-3 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <InviteMembersModal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)} 
      />
      <CreateChannelModal 
        isOpen={showCreateChannelModal} 
        onClose={() => setShowCreateChannelModal(false)} 
      />
    </div>
  );
};

export default WorkspaceSettings;