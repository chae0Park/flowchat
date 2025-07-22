import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Zap, 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  MessageCircle, 
  FileText, 
  Users, 
  Calendar,
  ArrowRight,
  Edit,
  Trash2,
  Copy,
  Sun,
  Moon
} from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'message' | 'file' | 'schedule' | 'user_join';
    condition: string;
  };
  actions: {
    type: 'send_message' | 'create_channel' | 'notify_user' | 'archive_file';
    target: string;
    message?: string;
  }[];
  isActive: boolean;
  lastRun?: string;
  runCount: number;
}

const WorkflowPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

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
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: '1',
      name: '새 멤버 환영 메시지',
      description: '새로운 팀원이 워크스페이스에 참여할 때 자동으로 환영 메시지를 전송합니다.',
      trigger: {
        type: 'user_join',
        condition: '새 사용자가 워크스페이스에 참여'
      },
      actions: [
        {
          type: 'send_message',
          target: '#일반',
          message: '🎉 새로운 팀원 {user}님을 환영합니다! 함께 즐겁게 일해요!'
        }
      ],
      isActive: true,
      lastRun: '2024-01-15T10:30:00Z',
      runCount: 12
    },
    {
      id: '2',
      name: '일일 스탠드업 알림',
      description: '매일 오전 9시에 팀원들에게 스탠드업 미팅 알림을 보냅니다.',
      trigger: {
        type: 'schedule',
        condition: '매일 09:00'
      },
      actions: [
        {
          type: 'send_message',
          target: '#일반',
          message: '🌅 좋은 아침입니다! 오늘의 스탠드업 미팅 시간입니다. 어제 한 일, 오늘 할 일, 이슈사항을 공유해주세요!'
        }
      ],
      isActive: true,
      lastRun: '2024-01-15T09:00:00Z',
      runCount: 45
    },
    {
      id: '3',
      name: '중요 파일 백업',
      description: 'PDF 파일이 업로드되면 자동으로 백업 채널에 복사합니다.',
      trigger: {
        type: 'file',
        condition: 'PDF 파일 업로드'
      },
      actions: [
        {
          type: 'archive_file',
          target: '#백업',
          message: '중요 문서가 백업되었습니다.'
        }
      ],
      isActive: false,
      lastRun: '2024-01-14T16:20:00Z',
      runCount: 8
    }
  ]);

  const triggerTypes = [
    { id: 'message', label: '메시지', icon: MessageCircle, description: '특정 키워드가 포함된 메시지' },
    { id: 'file', label: '파일 업로드', icon: FileText, description: '파일이 업로드될 때' },
    { id: 'user_join', label: '사용자 참여', icon: Users, description: '새 사용자가 참여할 때' },
    { id: 'schedule', label: '일정', icon: Calendar, description: '특정 시간에 실행' }
  ];

  const actionTypes = [
    { id: 'send_message', label: '메시지 전송', icon: MessageCircle },
    { id: 'create_channel', label: '채널 생성', icon: Plus },
    { id: 'notify_user', label: '사용자 알림', icon: Users },
    { id: 'archive_file', label: '파일 보관', icon: FileText }
  ];

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === id 
        ? { ...workflow, isActive: !workflow.isActive }
        : workflow
    ));
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows(prev => prev.filter(workflow => workflow.id !== id));
  };

  const duplicateWorkflow = (id: string) => {
    const workflow = workflows.find(w => w.id === id);
    if (workflow) {
      const newWorkflow = {
        ...workflow,
        id: Date.now().toString(),
        name: `${workflow.name} (복사본)`,
        isActive: false,
        runCount: 0,
        lastRun: undefined
      };
      setWorkflows(prev => [newWorkflow, ...prev]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTriggerIcon = (type: string) => {
    const triggerType = triggerTypes.find(t => t.id === type);
    return triggerType?.icon || Zap;
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
            <Zap className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">워크플로우 자동화</h1>
              <p className="text-gray-600 dark:text-gray-400">반복 작업을 자동화하여 생산성을 높이세요</p>
            </div>
          </div>
          <div className="ml-auto">
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors mr-2"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-gray-900 dark:text-white" /> : <Moon className="w-5 h-5 text-gray-900 dark:text-white" />}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              워크플로우 만들기
            </button>
          </div>
        </div>

        {/* Workflow Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">총 워크플로우</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{workflows.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">활성 워크플로우</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {workflows.filter(w => w.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">총 실행 횟수</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {workflows.reduce((sum, w) => sum + w.runCount, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">오늘 실행</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
              </div>
            </div>
          </div>
        </div>

        {/* Workflows List */}
        <div className="space-y-6">
          {workflows.map(workflow => {
            const TriggerIcon = getTriggerIcon(workflow.trigger.type);
            
            return (
              <div key={workflow.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      workflow.isActive ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <TriggerIcon className={`w-6 h-6 ${
                        workflow.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{workflow.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          workflow.isActive 
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {workflow.isActive ? '활성' : '비활성'}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{workflow.description}</p>
                      
                      {/* Workflow Flow */}
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg">
                          <TriggerIcon className="w-4 h-4" />
                          <span>{workflow.trigger.condition}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg">
                          <MessageCircle className="w-4 h-4" />
                          <span>{workflow.actions.length}개 액션</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleWorkflow(workflow.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        workflow.isActive
                          ? 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900'
                          : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900'
                      }`}
                    >
                      {workflow.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => duplicateWorkflow(workflow.id)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteWorkflow(workflow.id)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Workflow Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      <span>{workflow.runCount}회 실행</span>
                    </div>
                    {workflow.lastRun && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>마지막 실행: {formatDate(workflow.lastRun)}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedWorkflow(selectedWorkflow === workflow.id ? null : workflow.id)}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium transition-colors"
                  >
                    {selectedWorkflow === workflow.id ? '접기' : '자세히 보기'}
                  </button>
                </div>

                {/* Expanded Details */}
                {selectedWorkflow === workflow.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">트리거</h4>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <TriggerIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="font-medium text-blue-900 dark:text-blue-300">
                              {triggerTypes.find(t => t.id === workflow.trigger.type)?.label}
                            </span>
                          </div>
                          <p className="text-sm text-blue-700 dark:text-blue-300">{workflow.trigger.condition}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">액션</h4>
                        <div className="space-y-2">
                          {workflow.actions.map((action, index) => (
                            <div key={index} className="p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <MessageCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                <span className="font-medium text-purple-900 dark:text-purple-300">
                                  {actionTypes.find(a => a.id === action.type)?.label}
                                </span>
                              </div>
                              <p className="text-sm text-purple-700 dark:text-purple-300">
                                대상: {action.target}
                              </p>
                              {action.message && (
                                <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                                  "{action.message}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Create Workflow Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">새 워크플로우 만들기</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">워크플로우 이름</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="워크플로우 이름을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">설명</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="워크플로우에 대한 설명을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">트리거 선택</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {triggerTypes.map(trigger => (
                      <div key={trigger.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900 cursor-pointer transition-all">
                        <div className="flex items-center gap-3 mb-2">
                          <trigger.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          <span className="font-medium text-gray-900 dark:text-white">{trigger.label}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{trigger.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">액션 선택</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {actionTypes.map(action => (
                      <div key={action.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900 cursor-pointer transition-all">
                        <div className="flex items-center gap-3">
                          <action.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <span className="font-medium text-gray-900 dark:text-white">{action.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                >
                  워크플로우 만들기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowPage;