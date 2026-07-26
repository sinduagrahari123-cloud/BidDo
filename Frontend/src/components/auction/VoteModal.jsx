import { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

function VoteModal({ vote, onResolved }) {
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleVote = async (decision) => {
    try {
      await axiosInstance.post('/vote/cast', { voteId: vote.voteId, decision });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cast vote');
    }
  };

  if (submitted) {
    return <p className="text-sm text-gray-500">Waiting for other bidders...</p>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 max-w-sm w-full">
        <h2 className="font-semibold mb-2">
          {vote.type === 'undo' ? 'Undo Last Bid?' : 'Increase Everyone\'s Purse?'}
        </h2>
        <p className="text-sm mb-4">
          {vote.type === 'undo'
            ? 'The organizer wants to undo the last bid. Do you agree?'
            : `The organizer wants to increase everyone's purse by ₹${vote.amount}. Do you agree?`}
        </p>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex gap-2">
          <button onClick={() => handleVote('agree')} className="bg-blue-600 text-white px-4 py-2 rounded flex-1">
            Agree
          </button>
          <button onClick={() => handleVote('reject')} className="bg-red-600 text-white px-4 py-2 rounded flex-1">
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export default VoteModal;