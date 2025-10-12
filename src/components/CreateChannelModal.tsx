import React, { useState } from 'react';
import { X, Hash, User, Lock, Globe, Search } from 'lucide-react';
import { useUsers } from '../hooks/useUsers'; // ✅ React Query 훅
//import { useChatStore } from '../stores/chatStore';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'channel' | 'dm';
  onCreateChannel?: (channelData: { name: string; description: string; isPrivate: boolean }) => void;
  onStartDM?: (userId: string) => void;
}

const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  isOpen,
  onClose,
  type,
  onCreateChannel,
  onStartDM,
}) => {
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ React Query + Zustand 기반 실제 유저 데이터 패칭
  const { users, isLoading } = useUsers(searchQuery);

  // ✅ Zustand store 내 DM 생성 함수
  //const { startDirectMessage } = useChatStore();

  const handleCreateChannel = () => {
    if (channelName.trim() && onCreateChannel) {
      onCreateChannel({
        name: channelName.trim(),
        description: channelDescription.trim(),
        isPrivate,
      });
      resetForm();
      onClose();
    }
  };

  const handleStartDM = (userId: string) => {
    if (onStartDM) {
      onStartDM(userId);
    } 
    // else {
    //   startDirectMessage(userId);
    // }
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setChannelName('');
    setChannelDescription('');
    setIsPrivate(false);
    setSearchQuery('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {type === 'channel' ? '새 채널 만들기' : '다이렉트 메시지 시작'}
          </h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ---------------------- 채널 생성 ---------------------- */}
        {type === 'channel' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">채널 이름</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="예: 마케팅-팀"
                  maxLength={21}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                소문자, 숫자, 하이픈만 사용 가능 (최대 21자)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">설명 (선택사항)</label>
              <textarea
                value={channelDescription}
                onChange={(e) => setChannelDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="이 채널의 용도를 설명해주세요"
              />
            </div>

            {/* 공개 / 비공개 선택 */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">채널 공개 설정</label>

              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="privacy"
                    checked={!isPrivate}
                    onChange={() => setIsPrivate(false)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-900">공개 채널</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      워크스페이스의 모든 멤버가 참여할 수 있습니다
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="privacy"
                    checked={isPrivate}
                    onChange={() => setIsPrivate(true)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-gray-900">비공개 채널</span>
                    </div>
                    <p className="text-sm text-gray-600">초대받은 멤버만 참여할 수 있습니다</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCreateChannel}
                disabled={!channelName.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                채널 만들기
              </button>
            </div>
          </div>
        ) : (
          /* ---------------------- 다이렉트 메시지 ---------------------- */
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                메시지를 보낼 사람을 선택하세요
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="이름이나 이메일로 검색..."
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {isLoading ? (
                <p className="text-center text-gray-500">로딩 중...</p>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleStartDM(user.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {user.avatar || user.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{user.name}</span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <User className="w-4 h-4 text-gray-400" />
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">검색 결과가 없습니다</p>
                  <p className="text-sm text-gray-500">다른 이름이나 이메일로 검색해보세요</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleClose}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateChannelModal;
