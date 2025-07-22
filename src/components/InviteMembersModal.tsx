import React, { useState } from 'react';
import { X, Mail, Copy, Users, Plus, Check, Sun, Moon } from 'lucide-react';

interface InviteMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteMembersModal: React.FC<InviteMembersModalProps> = ({ isOpen, onClose }) => {
  const [inviteMethod, setInviteMethod] = useState<'email' | 'link'>('email');
  const [emails, setEmails] = useState(['']);
  const [inviteLink] = useState('https://flowtalk.com/invite/startup-team-abc123');
  const [linkCopied, setLinkCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const addEmailField = () => {
    setEmails([...emails, '']);
  };

  const removeEmailField = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleSendInvites = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      const validEmails = emails.filter(email => email.trim());
      setSuccessMessage(`${validEmails.length}명에게 초대 이메일을 보냈습니다.`);
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to send invites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">멤버 초대</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">새로운 팀원을 워크스페이스에 초대하세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Check className="w-5 h-5" />
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {/* Invite Method Tabs */}
        <div className="mb-6">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setInviteMethod('email')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                inviteMethod === 'email'
                  ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              이메일로 초대
            </button>
            <button
              onClick={() => setInviteMethod('link')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                inviteMethod === 'link'
                  ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              <Copy className="w-4 h-4 inline mr-2" />
              링크 공유
            </button>
          </div>
        </div>

        {/* Email Invite */}
        {inviteMethod === 'email' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                이메일 주소
              </label>
              <div className="space-y-2">
                {emails.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="이메일을 입력하세요"
                    />
                    {emails.length > 1 && (
                      <button
                        onClick={() => removeEmailField(index)}
                        className="p-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addEmailField}
                className="mt-2 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                이메일 추가
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                초대 메시지 (선택사항)
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="팀원들에게 보낼 개인적인 메시지를 작성하세요"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSendInvites}
                disabled={isLoading || !emails.some(email => email.trim())}
                className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>전송 중...</span>
                  </div>
                ) : (
                  '초대 보내기'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Link Invite */}
        {inviteMethod === 'link' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                초대 링크
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={copyInviteLink}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    linkCopied
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800'
                  }`}
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-4 h-4 inline mr-1" />
                      복사됨
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 inline mr-1" />
                      복사
                    </>
                  )}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                이 링크를 공유하면 누구나 워크스페이스에 참여할 수 있습니다.
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">보안 주의사항</h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• 이 링크를 가진 누구나 워크스페이스에 참여할 수 있습니다</li>
                <li>• 필요시 언제든지 새 링크를 생성할 수 있습니다</li>
                <li>• 신뢰할 수 있는 사람들과만 공유하세요</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                닫기
              </button>
              <button className="flex-1 px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
                새 링크 생성
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteMembersModal;