import { useState } from 'react';
import useAuthStore from '../../store/authStore';

function BidderControls({ auction, socket, currentMember }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const user = useAuthStore((state) => state.user);

  const minRequired = auction.currentBid?.amount > 0
    ? auction.currentBid.amount
    : auction.currentItem?.basePrice || 0;

  const placeBid = (bidAmount) => {
    setError('');
    if (!bidAmount || bidAmount <= minRequired) {
      setError(`Bid must be higher than ₹${minRequired}`);
      return;
    }
    if (bidAmount > currentMember?.remainingPurse) {
      setError('Bid exceeds your remaining purse');
      return;
    }
    socket.emit('place_bid', {
      roomCode: auction.roomCode,
      amount: bidAmount,
      bidderId: user._id,
    });
    setAmount('');
  };

  const quickAmounts = [100, 500, 1000, 5000, 10000];

  if (!auction.currentItem) {
    return <p className="mt-2">Waiting for the organizer to nominate an item...</p>;
  }

  return (
    <div className="border rounded p-4 mt-3">
      <h2 className="font-semibold mb-2">{auction.currentItem.name}</h2>
      <p className="text-sm text-gray-600">Current Bid: ₹{minRequired}</p>
      <p className="text-sm mb-3">Your Remaining Purse: ₹{currentMember?.remainingPurse}</p>

      <div className="flex gap-2 flex-wrap mb-3">
        {quickAmounts.map((inc) => (
          <button
            key={inc}
            onClick={() => placeBid(minRequired + inc)}
            className="bg-gray-200 hover:bg-gray-300 text-shadow-mist-950 px-3 py-1 rounded"
          >
            +₹{inc}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Custom amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <button
          onClick={() => placeBid(Number(amount))}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Place Bid
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}

export default BidderControls;