import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  Clock, 
  Check,
  X,
  Edit,
  Trash2,
  Vote,
  Sun,
  Moon
} from 'lucide-react';

interface Poll {
  id: string;
  title: string;
  description?: string;
  options: { id: string; text: string; votes: number; voters: string[] }[];
  creator: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  allowMultiple: boolean;
  totalVotes: number;
}

const PollsPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    options: ['', ''],
    allowMultiple: false,
    expiresAt: ''
  });

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
  const [polls, setPolls] = useState<Poll[]>([
    {
      id: '1',
      title: '다음 팀 빌딩 활동은 무엇이 좋을까요?',
      description: '팀원들의 의견을 듣고 싶습니다!',
      options: [
        { id: '1', text: '볼링', votes: 5, voters: ['김민수', '이지혜', '박준호', '최유진', '데모 사용자'] },
        { id: '2', text: '노래방', votes: 3, voters: ['김민수', '이지혜', '박준호'] },
        { id: '3', text: '방탈출', votes: 7, voters: ['김민수', '이지혜', '박준호', '최유진', '데모 사용자', '김민수', '이지혜'] },
        { id: '4', text: '보드게임 카페', votes: 2, voters: ['최유진', '데모 사용자'] }
      ],
      creator: '김민수',
      createdAt: '2024-01-15T10:00:00Z',
      expiresAt: '2024-01-20T23:59:59Z',
      isActive: true,
      allowMultiple: false,
      totalVotes: 17
    },
    {
      id: '2',
      title: '새로운 프로젝트 이름 투표',
      options: [
        { id: '1', text: 'FlowSync', votes: 4, voters: ['김민수', '이지혜', '박준호', '최유진'] },
        { id: '2', text: 'TeamFlow', votes: 6, voters: ['김민수', '이지혜', '박준호', '최유진', '데모 사용자', '김민수'] },
        { id: '3', text: 'WorkWave', votes: 2, voters: ['최유진', '데모 사용자'] }
      ],
      creator: '이지혜',
      createdAt: '2024-01-14T14:30:00Z',
      isActive: true,
      allowMultiple: false,
      totalVotes: 12
    },
    {
      id: '3',
      title: '점심 메뉴 추천 (복수 선택 가능)',
      options: [
        { id: '1', text: '한식', votes: 8, voters: ['김민수', '이지혜', '박준호', '최유진', '데모 사용자', '김민수', '이지혜', '박준호'] },
        { id: '2', text: '중식', votes: 5, voters: ['김민수', '이지혜', '박준호', '최유진', '데모 사용자'] },
        { id: '3', text: '일식', votes: 3, voters: ['최유진', '데모 사용자', '김민수'] },
        { id: '4', text: '양식', votes: 4, voters: ['이지혜', '박준호', '최유진', '데모 사용자'] }
      ],
      creator: '박준호',
      createdAt: '2024-01-13T11:00:00Z',
      expiresAt: '2024-01-16T18:00:00Z',
      isActive: false,
      allowMultiple: true,
      totalVotes: 20
    }
  ]);

  const addOption = () => {
    setNewPoll(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }));
  };

  const createPoll = () => {
    const poll: Poll = {
      id: Date.now().toString(),
      title: newPoll.title,
      description: newPoll.description,
      options: newPoll.options
        .filter(option => option.trim())
        .map((option, index) => ({
          id: (index + 1).toString(),
          text: option,
          votes: 0,
          voters: []
        })),
      creator: '데모 사용자',
      createdAt: new Date().toISOString(),
      expiresAt: newPoll.expiresAt || undefined,
      isActive: true,
      allowMultiple: newPoll.allowMultiple,
      totalVotes: 0
    };

    setPolls(prev => [poll, ...prev]);
    setNewPoll({
      title: '',
      description: '',
      options: ['', ''],
      allowMultiple: false,
      expiresAt: ''
    });
    setShowCreateModal(false);
  };

  const vote = (pollId: string, optionId: string) => {
    setPolls(prev => prev.map(poll => {
      if (poll.id === pollId) {
        const updatedOptions = poll.options.map(option => {
          if (option.id === optionId) {
            const hasVoted = option.voters.includes('데모 사용자');
            if (hasVoted) {
              return {
                ...option,
                votes: option.votes - 1,
                voters: option.voters.filter(voter => voter !== '데모 사용자')
              };
            } else {
              return {
                ...option,
                votes: option.votes + 1,
                voters: [...option.voters, '데모 사용자']
              };
            }
          }
          return option;
        });

        const totalVotes = updatedOptions.reduce((sum, option) => sum + option.votes, 0);

        return {
          ...poll,
          options: updatedOptions,
          totalVotes
        };
      }
      return poll;
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVotePercentage = (votes: number, total: number) => {
    return total > 0 ? Math.round((votes / total) * 100) : 0;
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
            <Vote className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">투표</h1>
              <p className="text-gray-600 dark:text-gray-400">팀원들의 의견을 수집하고 결정하세요</p>
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
              투표 만들기
            </button>
          </div>
        </div>

        {/* Polls List */}
        <div className="space-y-6">
          {polls.map(poll => (
            <div key={poll.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{poll.title}</h3>
                    {!poll.isActive && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                        종료됨
                      </span>
                    )}
                    {poll.allowMultiple && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs rounded-full">
                        복수 선택
                      </span>
                    )}
                  </div>
                  {poll.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{poll.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{poll.creator}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(poll.createdAt)}</span>
                    </div>
                    {poll.expiresAt && (
                      <div className="flex items-center gap-1">
                        <span>마감: {formatDate(poll.expiresAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Poll Options */}
              <div className="space-y-3">
                {poll.options.map(option => {
                  const percentage = getVotePercentage(option.votes, poll.totalVotes);
                  const hasVoted = option.voters.includes('데모 사용자');

                  return (
                    <div key={option.id} className="relative">
                      <button
                        onClick={() => poll.isActive && vote(poll.id, option.id)}
                        disabled={!poll.isActive}
                        className={`w-full p-4 border rounded-lg text-left transition-all ${
                          poll.isActive 
                            ? 'hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900 cursor-pointer' 
                            : 'cursor-not-allowed'
                        } ${
                          hasVoted 
                            ? 'border-indigo-500 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900' 
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              hasVoted 
                                ? 'border-indigo-500 dark:border-indigo-600 bg-indigo-500 dark:bg-indigo-600' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {hasVoted && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{option.text}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{option.votes}표</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{percentage}%</span>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-indigo-500 dark:bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        
                        {/* Voters */}
                        {option.voters.length > 0 && (
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            투표자: {option.voters.slice(0, 3).join(', ')}
                            {option.voters.length > 3 && ` 외 ${option.voters.length - 3}명`}
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Poll Stats */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>총 {poll.totalVotes}표</span>
                  <span>
                    {poll.isActive ? '진행 중' : '투표 종료'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Poll Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">새 투표 만들기</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">제목</label>
                  <input
                    type="text"
                    value={newPoll.title}
                    onChange={(e) => setNewPoll(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="투표 제목을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">설명 (선택사항)</label>
                  <textarea
                    value={newPoll.description}
                    onChange={(e) => setNewPoll(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="투표에 대한 설명을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">선택지</label>
                  <div className="space-y-2">
                    {newPoll.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder={`선택지 ${index + 1}`}
                        />
                        {newPoll.options.length > 2 && (
                          <button
                            onClick={() => removeOption(index)}
                            className="p-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addOption}
                    className="mt-2 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    선택지 추가
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">마감일 (선택사항)</label>
                  <input
                    type="datetime-local"
                    value={newPoll.expiresAt}
                    onChange={(e) => setNewPoll(prev => ({ ...prev, expiresAt: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowMultiple"
                    checked={newPoll.allowMultiple}
                    onChange={(e) => setNewPoll(prev => ({ ...prev, allowMultiple: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="allowMultiple" className="text-sm text-gray-700 dark:text-gray-300">
                    복수 선택 허용
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={createPoll}
                  disabled={!newPoll.title.trim() || newPoll.options.filter(opt => opt.trim()).length < 2}
                  className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  투표 만들기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PollsPage;