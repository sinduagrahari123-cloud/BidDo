import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import FinalizeControls from './FinalizeControls';

function OrganizerControls({ auction, refreshAuction }) {
  const [items, setItems] = useState([]);
  const [purseAmount, setPurseAmount] = useState('');
  const [error, setError] = useState('');

  const fetchItems = async () => {
    try {
      const res = await axiosInstance.get(`/dashboard/${auction._id}/items`);
      setItems(res.data.items);
    } catch (err) {
      setError('Failed to load items');
    }
  };

  useEffect(() => {
    fetchItems();
  }, [auction._id, auction.currentItem]);

  const handleStart = async () => {
    try {
      await axiosInstance.post('/auction/start', { auctionId: auction._id });
      refreshAuction();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start auction');
    }
  };

  const handlePause = async () => {
    try {
      await axiosInstance.post('/auction/pause', { auctionId: auction._id });
      refreshAuction();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to pause auction');
    }
  };

  const handleResume = async () => {
    try {
      await axiosInstance.post('/auction/resume', { auctionId: auction._id });
      refreshAuction();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resume auction');
    }
  };

  const handleEnd = async () => {
    if (!window.confirm('End the auction? This cannot be undone.')) return;
    try {
      await axiosInstance.post('/auction/end', { auctionId: auction._id });
      refreshAuction();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to end auction');
    }
  };

  const handleNominate = async (itemId) => {
    try {
      await axiosInstance.post('/item/nominate', { auctionId: auction._id, itemId });
      fetchItems();
      refreshAuction();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to nominate item');
    }
  };

  const handleMarkUnsold = async () => {
    try {
      await axiosInstance.post('/item/mark-unsold', { auctionId: auction._id });
      fetchItems();
      refreshAuction();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark unsold');
    }
  };

  const handleRequestUndo = async () => {
  try {
    await axiosInstance.post('/vote/request', {
      auctionId: auction._id,
      type: 'undo',
      targetMemberId: auction.currentBid.bidderId,
      amount: auction.currentBid.amount,
    });
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to request undo vote');
  }
};

const handleRequestPurseIncrease = async () => {
  try {
    await axiosInstance.post('/vote/request', {
      auctionId: auction._id,
      type: 'purseIncrease',
      amount: Number(purseAmount),
    });
    setPurseAmount('');
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to request purse increase');
  }
};


  const nominatable = items.filter(
    (item) =>
      item.status === 'pending' ||
      (item.status === 'unsold' && auction.settings.allowReauction)
  );

  const hasBid = auction.currentBid?.amount > 0;

  return (
    <div className="border rounded p-4 mt-3">
      <h2 className="font-semibold mb-3">Organizer Controls</h2>
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {auction.status === 'waiting' && (
        <button onClick={handleStart} className="bg-green-600 text-white px-4 py-2 rounded mb-3">
          Start Auction
        </button>
      )}

      {auction.status === 'active' && (
        <button onClick={handlePause} className="bg-yellow-500 text-white px-4 py-2 rounded mr-2 mb-3">
          Pause
        </button>
      )}
      {auction.status === 'paused' && (
        <button onClick={handleResume} className="bg-green-600 text-white px-4 py-2 rounded mr-2 mb-3">
          Resume
        </button>
      )}
      {(auction.status === 'active' || auction.status === 'paused') && (
        <button onClick={handleEnd} className="bg-red-600 text-white px-4 py-2 rounded mb-3">
          End Auction
        </button>
      )}

      {auction.status === 'active' && (
        <>
          {auction.currentItem ? (
            <div>
              <p className="text-sm mb-2">
                Active item: {auction.currentItem.name} (Base ₹{auction.currentItem.basePrice})
              </p>
              {hasBid ? (
                <FinalizeControls auction={auction} refreshAuction={() => { fetchItems(); refreshAuction(); }} />
              ) : (
                <button onClick={handleMarkUnsold} className="bg-yellow-600 text-white px-3 py-1 rounded text-sm">
                  Mark Unsold
                </button>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-medium mb-2">Nominate an item:</h3>
              {nominatable.length === 0 && <p className="text-sm text-gray-500">No items available</p>}
              {nominatable.map((item) => (
                <div key={item._id} className="flex items-center justify-between py-1">
                  <span>{item.name} (₹{item.basePrice})</span>
                  <button
                    onClick={() => handleNominate(item._id)}
                    className="bg-blue-600 text-white text-sm px-3 py-1 rounded"
                  >
                    Nominate
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {auction.status === 'active' && auction.currentBid?.amount > 0 && (
  <button onClick={handleRequestUndo} className="bg-orange-500 text-white text-sm px-3 py-1 rounded mt-2">
    Request Undo Last Bid
  </button>
)}

<div className="mt-3 flex gap-2 items-center">
  <input
    type="number"
    placeholder="Purse increase amount"
    value={purseAmount}
    onChange={(e) => setPurseAmount(e.target.value)}
    className="border p-1 rounded text-sm w-40"
  />
  <button onClick={handleRequestPurseIncrease} className="bg-purple-600 text-white text-sm px-3 py-1 rounded">
    Request Purse Increase for All
  </button>
</div>
    </div>
  );
}

export default OrganizerControls;
