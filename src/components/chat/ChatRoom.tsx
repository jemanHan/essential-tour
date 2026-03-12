import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

interface ChatRoomProps {
  roomId: string;
  roomName: string;
  participants: string[];
  onClose: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId, roomName, participants, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      author: '시스템',
      content: `${roomName} 채팅방에 오신 것을 환영합니다!`,
      timestamp: new Date(),
      isOwn: false
    },
    {
      id: '2',
      author: '여행러버',
      content: '안녕하세요! 여행 계획에 대해 이야기해볼까요?',
      timestamp: new Date(Date.now() - 60000),
      isOwn: false
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      author: '나',
      content: newMessage,
      timestamp: new Date(),
      isOwn: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // 상대방 타이핑 시뮬레이션
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        author: '여행러버',
        content: getRandomReply(),
        timestamp: new Date(),
        isOwn: false
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  const getRandomReply = () => {
    const replies = [
      '좋은 아이디어네요!',
      '그곳도 꼭 가보고 싶어요!',
      '언제 출발할 예정인가요?',
      '예산은 어느 정도로 생각하고 계신가요?',
      '숙박은 미리 예약하셨나요?',
      '맛집 정보도 공유해주세요!'
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* 헤더 */}
        <div className="bg-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div>
            <h3 className="font-semibold">{roomName}</h3>
            <p className="text-sm opacity-90">
              참여자: {participants.join(', ')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-xl"
          >
            ✕
          </button>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isOwn
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {!message.isOwn && (
                  <div className="text-xs font-medium mb-1 text-gray-600">
                    {message.author}
                  </div>
                )}
                <div className="text-sm">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  message.isOwn ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                <div className="text-xs font-medium mb-1 text-gray-600">
                  여행러버
                </div>
                <div className="text-sm">입력 중...</div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;


