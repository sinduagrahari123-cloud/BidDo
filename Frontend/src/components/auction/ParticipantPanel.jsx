import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import useAuthStore from '../../store/authStore';

function ParticipantPanel({ auction }) {
  const [myItem, setMyItem] = useState(null);
  const user = useAuthStore((state) => state.user);

  const currentMember = auction.members.find(
    (m) => m.userId?._id?.toString() === user?._id?.toString()
  );

  useEffect(() => {
    const fetchMyItem = async () => {
      if (!currentMember?.linkedItemId) return;
      try {
        const res = await axiosInstance.get(`/dashboard/${auction._id}/items`);
        const item = res.data.items.find((i) => i._id === currentMember.linkedItemId);
        setMyItem(item);
      } catch (err) {
        console.log('Failed to load your item status');
      }
    };
    fetchMyItem();
  }, [auction._id, auction.currentItem, currentMember?.linkedItemId]);

  const isUpForBidding = auction.currentItem?._id === currentMember?.linkedItemId;

  const buyerMember = auction.members.find(
  (m) => m.userId?._id?.toString() === myItem?.soldTo?.toString()
);


  return (
    <div className="border rounded p-4 mt-3">
      <h2 className="font-semibold mb-2">Your Status</h2>

      {isUpForBidding && (
        <p className="text-green-600 font-medium">
          You're currently up for bidding! Current bid: ₹{auction.currentBid?.amount || auction.currentItem?.basePrice}
        </p>
      )}

      {!isUpForBidding && myItem?.status === 'sold' && (
  <p>
    You were sold to {buyerMember?.teamName || buyerMember?.userId?.name || 'a team'} for ₹{myItem.soldAmount}.
  </p>
)}

      {!isUpForBidding && myItem?.status === 'unsold' && (
        <p>You went unsold in the last round.</p>
      )}

      {!isUpForBidding && myItem?.status === 'pending' && (
        <p>Waiting to be nominated by the organizer.</p>
      )}

      
    </div>
  );
}

export default ParticipantPanel;