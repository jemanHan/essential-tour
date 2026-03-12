import React, { useState } from 'react';
import TopBar from '../components/layout/TopBar';
import FloatingActionButton from '../components/layout/FloatingActionButton';
import ChatRoom from '../components/chat/ChatRoom';

interface TravelPost {
  id: string;
  title: string;
  author: string;
  date: string;
  destination: string;
  description: string;
  participants: number;
  maxParticipants: number;
  comments: Comment[];
  createdAt: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

const TogetherPage: React.FC = () => {
  const [posts, setPosts] = useState<TravelPost[]>([
    {
      id: '1',
      title: '서울 3박 4일 여행 함께하실 분!',
      author: '여행러버',
      date: '2025-01-15',
      destination: '서울',
      description: '경복궁, 남산타워, 홍대거리 등 서울 핫플레이스들을 함께 돌아보고 싶습니다. 20대 후반~30대 초반 분들과 함께하면 좋겠어요!',
      participants: 2,
      maxParticipants: 4,
      comments: [
        {
          id: '1',
          author: '여행초보',
          content: '저도 참여하고 싶어요! 언제부터 언제까지인가요?',
          createdAt: '2025-01-10'
        }
      ],
      createdAt: '2025-01-08'
    },
    {
      id: '2',
      title: '부산 해운대 맛집 투어',
      author: '맛집탐험가',
      date: '2025-01-20',
      destination: '부산',
      description: '부산 해운대 근처 맛집들을 함께 탐방해요. 해산물, 부산 전통 음식 등 다양한 맛을 경험해보세요!',
      participants: 1,
      maxParticipants: 3,
      comments: [],
      createdAt: '2025-01-09'
    }
  ]);

  const [selectedPost, setSelectedPost] = useState<TravelPost | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatRoom, setChatRoom] = useState<{
    roomId: string;
    roomName: string;
    participants: string[];
  } | null>(null);

  const handlePostClick = (post: TravelPost) => {
    setSelectedPost(post);
  };

  const handleCommentSubmit = (postId: string) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: '현재사용자',
      content: newComment,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, comments: [...post.comments, comment] }
        : post
    ));

    setNewComment('');
  };

  const handleJoinTrip = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, participants: Math.min(post.participants + 1, post.maxParticipants) }
        : post
    ));
    alert('여행에 참여 신청되었습니다!');
  };

  const handleStartChat = (post: TravelPost) => {
    setChatRoom({
      roomId: `room-${post.id}`,
      roomName: post.title,
      participants: [post.author, '나']
    });
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setChatRoom(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="inline-block bg-gray-200 rounded-lg px-4 py-2 text-sm font-medium">
            함께하기
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            함께 떠나는 여행
          </h1>
          <p className="text-gray-600">
            여행 계획을 공유하고 함께할 동반자를 찾아보세요!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽 - 게시물 목록 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">여행 모집</h2>
              
              <div className="space-y-4">
                {posts.map(post => (
                  <div 
                    key={post.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPost?.id === post.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePostClick(post)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{post.title}</h3>
                      <span className="text-sm text-gray-500">{post.date}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-2 text-sm text-gray-600">
                      <span>👤 {post.author}</span>
                      <span>📍 {post.destination}</span>
                      <span>👥 {post.participants}/{post.maxParticipants}명</span>
                    </div>
                    
                    <p className="text-gray-700 text-sm line-clamp-2">
                      {post.description}
                    </p>
                    
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-gray-500">
                        💬 {post.comments.length}개의 댓글
                      </span>
                      <span className="text-xs text-gray-500">
                        {post.createdAt}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽 - 상세 정보 */}
          <div className="lg:col-span-1">
            {selectedPost ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4 text-gray-800">
                  {selectedPost.title}
                </h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>👤 {selectedPost.author}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📍 {selectedPost.destination}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📅 {selectedPost.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>👥 {selectedPost.participants}/{selectedPost.maxParticipants}명</span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">
                  {selectedPost.description}
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleJoinTrip(selectedPost.id)}
                    disabled={selectedPost.participants >= selectedPost.maxParticipants}
                    className={`flex-1 py-2 px-4 rounded-lg text-white font-medium transition-colors ${
                      selectedPost.participants >= selectedPost.maxParticipants
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {selectedPost.participants >= selectedPost.maxParticipants 
                      ? '모집 완료' 
                      : '함께하기'
                    }
                  </button>
                  <button
                    onClick={() => handleStartChat(selectedPost)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    💬 채팅
                  </button>
                </div>
                
                {/* 댓글 섹션 */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 text-gray-800">댓글</h4>
                  
                  <div className="space-y-3 mb-4">
                    {selectedPost.comments.map(comment => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm text-gray-800">
                            {comment.author}
                          </span>
                          <span className="text-xs text-gray-500">
                            {comment.createdAt}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="댓글을 입력하세요..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleCommentSubmit(selectedPost.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      작성
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-500 text-center">
                  왼쪽에서 게시물을 선택해주세요
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <FloatingActionButton />
      
      {/* 채팅방 모달 */}
      {isChatOpen && chatRoom && (
        <ChatRoom
          roomId={chatRoom.roomId}
          roomName={chatRoom.roomName}
          participants={chatRoom.participants}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
};

export default TogetherPage;


