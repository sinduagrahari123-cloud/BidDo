import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import axiosInstance from '../../api/axiosInstance';

function CommentBox({ auction, socket }) {
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState('');
  const user = useAuthStore((state) => state.user);

useEffect(() => {
  console.log('Fetching comments for auction:', auction._id);
    const fetchComments = async () => {
      try {
        const res = await axiosInstance.get(`/dashboard/${auction._id}/comments`);

        console.log("comment api response",res.data)
        const formatted = res.data.comments.map((c) => ({
          commentId: c._id,
          userId: c.userId?._id,
          userName: c.userId?.name || 'Unknown',
          message: c.message,
          timestamp: c.createdAt,
        }));
        setComments(formatted);
      } catch (err) {
        console.error(err)
      }
    };
    fetchComments();
  }, [auction._id]);



  useEffect(() => {
    if (!socket) return;

    const handleNewComment = (data) => {
      setComments((prev) => [...prev, data]);
    };

    socket.on('new_comment', handleNewComment);
    return () => socket.off('new_comment', handleNewComment);
  }, [socket]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    socket.emit('send_comment', {
      roomCode: auction.roomCode,
      userId: user._id,
      message: message.trim(),
    });
    setMessage('');
  };

  return (
    <div className="border rounded p-4 mt-4">
      <h2 className="font-semibold mb-2">Live Chat</h2>

      <div className="h-48 overflow-y-auto border rounded p-2 mb-2 flex flex-col gap-1">
        {comments.length === 0 && <p className="text-sm text-gray-400">No messages yet</p>}
        {comments.map((c) => (
          <div key={c.commentId} className="text-sm">
            <span className="font-medium">{c.userId === user._id ? 'You' : c.userName}:</span> {c.message}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="border p-2 rounded flex-1 text-sm"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
          Send
        </button>
      </form>
    </div>
  );
}

export default CommentBox;