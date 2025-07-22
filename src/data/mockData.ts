// Mock data organized for database structure

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: string;
  role: 'owner' | 'admin' | 'member';
  createdAt: string;
  lastActive: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: {
      desktop: boolean;
      email: boolean;
      sounds: boolean;
      mentions: boolean;
    };
  };
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  domain: string;
  visibility: 'public' | 'private';
  ownerId: string;
  createdAt: string;
  settings: {
    allowChannelCreation: 'all' | 'admin' | 'owner';
    allowMemberInvite: 'all' | 'admin' | 'owner';
  };
}

export interface Channel {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  type: 'channel' | 'dm';
  visibility: 'public' | 'private';
  createdBy: string;
  createdAt: string;
  members: string[];
  unreadCount: number;
}

export interface Message {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  timestamp: string;
  editedAt?: string;
  reactions: Reaction[];
  files: FileAttachment[];
  replyTo?: string;
  type: 'message' | 'system';
}

export interface Reaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface FileAttachment {
  id: string;
  messageId: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Poll {
  id: string;
  workspaceId: string;
  channelId?: string;
  title: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  allowMultiple: boolean;
  options: PollOption[];
}

export interface PollOption {
  id: string;
  pollId: string;
  text: string;
  votes: PollVote[];
}

export interface PollVote {
  id: string;
  optionId: string;
  userId: string;
  createdAt: string;
}

export interface Event {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  duration?: string;
  location?: string;
  createdBy: string;
  createdAt: string;
  attendees: string[];
  type: 'meeting' | 'deadline' | 'event';
}

export interface Workflow {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  runCount: number;
  lastRun?: string;
}

export interface WorkflowTrigger {
  type: 'message' | 'file' | 'schedule' | 'user_join';
  condition: string;
  parameters: Record<string, any>;
}

export interface WorkflowAction {
  type: 'send_message' | 'create_channel' | 'notify_user' | 'archive_file';
  target: string;
  parameters: Record<string, any>;
}

// Mock data instances
export const mockUsers: User[] = [
  {
    id: '1',
    name: '김민수',
    email: 'kim@example.com',
    avatar: '김',
    status: '온라인',
    role: 'owner',
    createdAt: '2024-01-01T00:00:00Z',
    lastActive: '2024-01-15T10:30:00Z',
    preferences: {
      theme: 'light',
      language: 'ko',
      notifications: {
        desktop: true,
        email: false,
        sounds: true,
        mentions: true
      }
    }
  },
  {
    id: '2',
    name: '이지혜',
    email: 'lee@example.com',
    avatar: '이',
    status: '온라인',
    role: 'admin',
    createdAt: '2024-01-02T00:00:00Z',
    lastActive: '2024-01-15T10:25:00Z',
    preferences: {
      theme: 'dark',
      language: 'ko',
      notifications: {
        desktop: true,
        email: true,
        sounds: false,
        mentions: true
      }
    }
  },
  {
    id: '3',
    name: '박준호',
    email: 'park@example.com',
    avatar: '박',
    status: '오프라인',
    role: 'member',
    createdAt: '2024-01-03T00:00:00Z',
    lastActive: '2024-01-14T18:00:00Z',
    preferences: {
      theme: 'auto',
      language: 'ko',
      notifications: {
        desktop: false,
        email: false,
        sounds: true,
        mentions: true
      }
    }
  },
  {
    id: '4',
    name: '최유진',
    email: 'choi@example.com',
    avatar: '최',
    status: '온라인',
    role: 'member',
    createdAt: '2024-01-04T00:00:00Z',
    lastActive: '2024-01-15T09:45:00Z',
    preferences: {
      theme: 'light',
      language: 'ko',
      notifications: {
        desktop: true,
        email: false,
        sounds: true,
        mentions: true
      }
    }
  },
  {
    id: 'demo',
    name: '데모 사용자',
    email: 'demo@flowtalk.com',
    avatar: '데',
    status: 'FlowTalk 체험 중 🚀',
    role: 'member',
    createdAt: '2024-01-15T00:00:00Z',
    lastActive: '2024-01-15T10:30:00Z',
    preferences: {
      theme: 'light',
      language: 'ko',
      notifications: {
        desktop: true,
        email: false,
        sounds: true,
        mentions: true
      }
    }
  }
];

export const mockWorkspaces: Workspace[] = [
  {
    id: 'ws1',
    name: '스타트업 팀',
    description: 'FlowTalk을 사용하는 스타트업 팀의 워크스페이스입니다.',
    domain: 'startup-team',
    visibility: 'private',
    ownerId: '1',
    createdAt: '2024-01-01T00:00:00Z',
    settings: {
      allowChannelCreation: 'admin',
      allowMemberInvite: 'admin'
    }
  }
];

export const mockChannels: Channel[] = [
  {
    id: 'general',
    workspaceId: 'ws1',
    name: '일반',
    description: '팀 전체 공지사항과 일반적인 대화',
    type: 'channel',
    visibility: 'public',
    createdBy: '1',
    createdAt: '2024-01-01T00:00:00Z',
    members: ['1', '2', '3', '4', 'demo'],
    unreadCount: 0
  },
  {
    id: 'dev',
    workspaceId: 'ws1',
    name: '개발',
    description: '개발 관련 논의',
    type: 'channel',
    visibility: 'private',
    createdBy: '1',
    createdAt: '2024-01-01T00:00:00Z',
    members: ['1', '2', '3'],
    unreadCount: 3
  },
  {
    id: 'design',
    workspaceId: 'ws1',
    name: '디자인',
    description: 'UI/UX 디자인 논의',
    type: 'channel',
    visibility: 'private',
    createdBy: '2',
    createdAt: '2024-01-01T00:00:00Z',
    members: ['2', '4'],
    unreadCount: 0
  },
  {
    id: 'random',
    workspaceId: 'ws1',
    name: '잡담',
    description: '자유로운 대화',
    type: 'channel',
    visibility: 'public',
    createdBy: '1',
    createdAt: '2024-01-01T00:00:00Z',
    members: ['1', '2', '3', '4', 'demo'],
    unreadCount: 1
  },
  {
    id: 'dm1',
    workspaceId: 'ws1',
    name: '이지혜',
    type: 'dm',
    visibility: 'private',
    createdBy: '1',
    createdAt: '2024-01-05T00:00:00Z',
    members: ['1', '2'],
    unreadCount: 0
  },
  {
    id: 'dm2',
    workspaceId: 'ws1',
    name: '박준호',
    type: 'dm',
    visibility: 'private',
    createdBy: '1',
    createdAt: '2024-01-06T00:00:00Z',
    members: ['1', '3'],
    unreadCount: 2
  },
  {
    id: 'dm3',
    workspaceId: 'ws1',
    name: '최유진',
    type: 'dm',
    visibility: 'private',
    createdBy: '1',
    createdAt: '2024-01-07T00:00:00Z',
    members: ['1', '4'],
    unreadCount: 0
  }
];

export const mockMessages: Message[] = [
  {
    id: '1',
    channelId: 'general',
    userId: '1',
    content: '안녕하세요! 새로운 프로젝트 관련해서 오늘 회의 어떠세요?',
    timestamp: '2024-01-15T14:30:00Z',
    reactions: [
      { id: 'r1', messageId: '1', userId: '2', emoji: '👍', createdAt: '2024-01-15T14:31:00Z' },
      { id: 'r2', messageId: '1', userId: '3', emoji: '👍', createdAt: '2024-01-15T14:32:00Z' },
      { id: 'r3', messageId: '1', userId: '4', emoji: '👏', createdAt: '2024-01-15T14:33:00Z' }
    ],
    files: [],
    type: 'message'
  },
  {
    id: '2',
    channelId: 'general',
    userId: '2',
    content: '좋아요! 오후 3시에 회의실에서 만나요. 자료도 미리 준비해 올게요 📊',
    timestamp: '2024-01-15T14:32:00Z',
    reactions: [
      { id: 'r4', messageId: '2', userId: '1', emoji: '✅', createdAt: '2024-01-15T14:33:00Z' },
      { id: 'r5', messageId: '2', userId: '3', emoji: '✅', createdAt: '2024-01-15T14:34:00Z' }
    ],
    files: [],
    type: 'message'
  },
  {
    id: '3',
    channelId: 'general',
    userId: '3',
    content: '저도 참석할게요! 개발 진행 상황 공유드릴 부분이 있어서요.',
    timestamp: '2024-01-15T14:35:00Z',
    reactions: [],
    files: [],
    type: 'message'
  },
  {
    id: '4',
    channelId: 'general',
    userId: '4',
    content: 'UI 디자인 업데이트 완료했습니다! 확인해 주세요 🎨',
    timestamp: '2024-01-15T14:38:00Z',
    reactions: [
      { id: 'r6', messageId: '4', userId: '1', emoji: '🎉', createdAt: '2024-01-15T14:39:00Z' },
      { id: 'r7', messageId: '4', userId: '2', emoji: '🎉', createdAt: '2024-01-15T14:40:00Z' },
      { id: 'r8', messageId: '4', userId: '3', emoji: '👀', createdAt: '2024-01-15T14:41:00Z' }
    ],
    files: [
      {
        id: 'f1',
        messageId: '4',
        name: 'ui-design-v2.png',
        size: 2048000,
        type: 'image/png',
        url: '/mock/ui-design-v2.png',
        uploadedBy: '4',
        uploadedAt: '2024-01-15T14:38:00Z'
      }
    ],
    type: 'message'
  }
];

export const mockPolls: Poll[] = [
  {
    id: '1',
    workspaceId: 'ws1',
    channelId: 'general',
    title: '다음 팀 빌딩 활동은 무엇이 좋을까요?',
    description: '팀원들의 의견을 듣고 싶습니다!',
    createdBy: '1',
    createdAt: '2024-01-15T10:00:00Z',
    expiresAt: '2024-01-20T23:59:59Z',
    isActive: true,
    allowMultiple: false,
    options: [
      {
        id: 'o1',
        pollId: '1',
        text: '볼링',
        votes: [
          { id: 'v1', optionId: 'o1', userId: '1', createdAt: '2024-01-15T10:05:00Z' },
          { id: 'v2', optionId: 'o1', userId: '2', createdAt: '2024-01-15T10:10:00Z' },
          { id: 'v3', optionId: 'o1', userId: '3', createdAt: '2024-01-15T10:15:00Z' }
        ]
      },
      {
        id: 'o2',
        pollId: '1',
        text: '노래방',
        votes: [
          { id: 'v4', optionId: 'o2', userId: '4', createdAt: '2024-01-15T10:20:00Z' }
        ]
      },
      {
        id: 'o3',
        pollId: '1',
        text: '방탈출',
        votes: [
          { id: 'v5', optionId: 'o3', userId: '2', createdAt: '2024-01-15T10:25:00Z' },
          { id: 'v6', optionId: 'o3', userId: '4', createdAt: '2024-01-15T10:30:00Z' }
        ]
      }
    ]
  }
];

export const mockEvents: Event[] = [
  {
    id: '1',
    workspaceId: 'ws1',
    title: '팀 회의',
    description: '주간 진행 상황 공유 및 다음 주 계획 논의',
    date: '2024-01-15',
    time: '14:00',
    duration: '1시간',
    location: '회의실 A',
    createdBy: '1',
    createdAt: '2024-01-10T00:00:00Z',
    attendees: ['1', '2', '3'],
    type: 'meeting'
  },
  {
    id: '2',
    workspaceId: 'ws1',
    title: '프로젝트 마감',
    description: 'MVP 개발 완료 마감일',
    date: '2024-01-18',
    time: '18:00',
    createdBy: '1',
    createdAt: '2024-01-10T00:00:00Z',
    attendees: ['1', '3'],
    type: 'deadline'
  }
];

export const mockWorkflows: Workflow[] = [
  {
    id: '1',
    workspaceId: 'ws1',
    name: '새 멤버 환영 메시지',
    description: '새로운 팀원이 워크스페이스에 참여할 때 자동으로 환영 메시지를 전송합니다.',
    createdBy: '1',
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true,
    trigger: {
      type: 'user_join',
      condition: '새 사용자가 워크스페이스에 참여',
      parameters: { workspaceId: 'ws1' }
    },
    actions: [
      {
        type: 'send_message',
        target: 'general',
        parameters: { message: '🎉 새로운 팀원 {user}님을 환영합니다! 함께 즐겁게 일해요!' }
      }
    ],
    runCount: 12,
    lastRun: '2024-01-15T10:30:00Z'
  }
];

// Database schema for reference
export const databaseSchema = {
  users: {
    primaryKey: 'id',
    indexes: ['email', 'workspaceId'],
    relationships: {
      workspaces: 'many-to-many',
      messages: 'one-to-many',
      reactions: 'one-to-many'
    }
  },
  workspaces: {
    primaryKey: 'id',
    indexes: ['domain', 'ownerId'],
    relationships: {
      users: 'many-to-many',
      channels: 'one-to-many',
      polls: 'one-to-many'
    }
  },
  channels: {
    primaryKey: 'id',
    indexes: ['workspaceId', 'type'],
    relationships: {
      workspace: 'many-to-one',
      messages: 'one-to-many',
      users: 'many-to-many'
    }
  },
  messages: {
    primaryKey: 'id',
    indexes: ['channelId', 'userId', 'timestamp'],
    relationships: {
      channel: 'many-to-one',
      user: 'many-to-one',
      reactions: 'one-to-many',
      files: 'one-to-many'
    }
  },
  polls: {
    primaryKey: 'id',
    indexes: ['workspaceId', 'createdBy'],
    relationships: {
      workspace: 'many-to-one',
      options: 'one-to-many'
    }
  },
  events: {
    primaryKey: 'id',
    indexes: ['workspaceId', 'date'],
    relationships: {
      workspace: 'many-to-one',
      attendees: 'many-to-many'
    }
  },
  workflows: {
    primaryKey: 'id',
    indexes: ['workspaceId', 'isActive'],
    relationships: {
      workspace: 'many-to-one'
    }
  }
};