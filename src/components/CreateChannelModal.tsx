import React, { useState } from 'react';
import { X, Hash, Lock, Users, Globe } from 'lucide-react';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateChannelModal: React.FC<CreateChannelModalProps> = ({ isOpen, onClose }) => {
  const [channelData, setChannelData] = useState({
    name: '',
    description: '',
    type: 'public' as 'public' | 'private',
    members: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);

  const availableMembers = [
    { id: '1', name: '김민수', avatar: '김' },
    { id: '2', name: '이지혜', avatar: '이' },
    { id: '3', name: '박준호', avatar: '박' },
    { id: '4', name: '최유진', avatar: '최' }
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Channel created:', channelData);
      onClose();
      // Reset form
      setChannelData({
        name: '',
        description: '',
        type: 'public',
        members: []
      });
    } catch (error) {
      console.error('Failed to create channel:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMember = (memberId: string) => {
    setChannelData(prev => ({
      ...prev,
      members: prev.members.includes(memberId)
        ? prev.members.filter(id => id !== memberId)
        : [...prev.members, memberId]
    }));
  };

  const formatChannelName = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
              <Hash className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">새 채널 만들기</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">팀원들과 소통할 새로운 채널을 생성하세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Channel Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              채널 유형
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="type"
                  value="public"
                  checked={channelData.type === 'public'}
                  onChange={(e) => setChannelData({...channelData, type: e.target.value as 'public' | 'private'})}
                  className="mt-1"
                />
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">공개 채널</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">워크스페이스의 모든 멤버가 참여할 수 있습니다</div>
                  </div>
                </div>
              </label>
              
              <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="type"
                  value="private"
                  checked={channelData.type === 'private'}
                  onChange={(e) => setChannelData({...channelData, type: e.target.value as 'public' | 'private'})}
                  className="mt-1"
                />
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">비공개 채널</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">초대받은 멤버만 참여할 수 있습니다</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Channel Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              채널 이름
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={channelData.name}
                onChange={(e) => setChannelData({...channelData, name: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="채널 이름을 입력하세요"
                required
              />
            </div>
            {channelData.name && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                URL: #{formatChannelName(channelData.name)}
              </p>
            )}
          </div>

          {/* Channel Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              설명 (선택사항)
            </label>
            <textarea
              value={channelData.description}
              onChange={(e) => setChannelData({...channelData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="이 채널의 목적을 설명해주세요"
            />
          </div>

          {/* Member Selection for Private Channels */}
          {channelData.type === 'private' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                초대할 멤버 선택
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableMembers.map(member => (
                  <label
                    key={member.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={channelData.members.includes(member.id)}
                      onChange={() => toggleMember(member.id)}
                      className="rounded"
                    />
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {member.avatar}
                    </div>
                    <span className="text-gray-900 dark:text-white">{member.name}</span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {channelData.members.length}명 선택됨
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading || !channelData.name.trim()}
              className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>생성 중...</span>
                </div>
              ) : (
                '채널 만들기'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChannelModal