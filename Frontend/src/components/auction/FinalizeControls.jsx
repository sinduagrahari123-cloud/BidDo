import { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

function FinalizeControls({ auction, refreshAuction }) {
  const [error, setError] = useState('');

  const handleFinalize = async () => {
    try {
      await axiosInstance.post('/auction/finalize', {
        auctionId: auction._id,
        bidderId: auction.currentBid.bidderId,
        amount: auction.currentBid.amount,
      });
      refreshAuction();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to finalize bid');
    }
  };

  return (
    <div className="mt-2">
      <p className="text-sm mb-2">
        Highest bid: ₹{auction.currentBid?.amount} — finalize sale?
      </p>
      <button onClick={handleFinalize} className="bg-green-600 text-white px-4 py-2 rounded text-sm">
        Finalize Sale
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}

export default FinalizeControls;