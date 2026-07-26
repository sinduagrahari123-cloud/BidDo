import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import useAuthStore from '../../store/authStore';
import useSocket from '../../hooks/useSocket';
import PendingApprovals from '../../components/auction/PendingApprovals';
import OrganizerControls from '../../components/auction/OrganizerControls';
import BidderControls from '../../components/auction/BidderControls';
import LiveDashboard from '../../components/auction/LiveDashboard';
import VoteModal from '../../components/auction/VoteModal';
import CommentBox from '../../components/comments/CommentBox';
import ParticipantPanel from '../../components/auction/ParticipantPanel';

function AuctionRoomPage() {
  const { roomCode } = useParams();
  const [auction, setAuction] = useState(null);
  const [activeVote, setActiveVote] = useState(null);

  const [error, setError] = useState('');
  const user = useAuthStore((state) => state.user);

  const fetchAuction = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/auction/room/${roomCode}`);
      setAuction(res.data.auction);
    } catch (err) {
      console.log("error message", err.message);
      setError((prev) => (prev ? prev : 'Auction not found'));
    }
  }, [roomCode]);

  useEffect(() => {
    fetchAuction();
  }, [fetchAuction]);

  const socket = useSocket(auction?.roomCode, {
    new_bid: () => fetchAuction(),
    bid_finalized: () => fetchAuction(),
    item_nominated: () => fetchAuction(),
    item_unsold: () => fetchAuction(),
    auction_started: () => fetchAuction(),
    auction_paused: () => fetchAuction(),
    auction_resumed: () => fetchAuction(),
    auction_ended: () => fetchAuction(),
    user_joined: () => fetchAuction(),
    vote_requested: (data) => setActiveVote(data),
    vote_completed: () => { setActiveVote(null); fetchAuction(); },
  });

  if (error) return <p className="text-red-500 p-4">{error}</p>;
  if (!auction) return <p className="p-4">Loading...</p>;
  if (!user) return <p className="p-4">Loading your session...</p>;  // ADD THIS
  console.log('DEBUG — user._id:', user?._id, 'organizer._id:', auction.organizer?._id);
  console.log('DEBUG — match:', user?._id?.toString() === auction.organizer?._id?.toString());
  console.log('DEBUG — full user object:', JSON.stringify(user));
  const isOrganizer = auction.organizer?._id?.toString() === user?._id?.toString();
  const currentMember = auction.members.find(
    (m) => m.userId?._id?.toString() === user?._id?.toString()
  );
  const myRole = isOrganizer ? 'organizer' : currentMember?.role;
  const isApproved = currentMember?.status === 'approved';
  const isRejected = currentMember?.status === 'rejected';

  return (
    <div className="min-h-screen bg-[#050816] text-white relative overflow-hidden ">
      <h1 className="text-2xl font-bold">{auction.title}</h1>
      <p className="text-sm text-gray-600 mb-4">Room Code: {auction.roomCode}</p>

      {isOrganizer && <PendingApprovals auctionId={auction._id} />}

      {currentMember && currentMember.status === 'pending' && (
        <p className="mt-2">Waiting for organizer approval...</p>
      )}
      {isRejected && (
        <p className="mt-2 text-red-500">Your request to join as {myRole} was denied.</p>
      )}

      {auction.status === 'waiting' && (
        <>
          {isOrganizer ? (
            <OrganizerControls auction={auction} refreshAuction={fetchAuction} />
          ) : (
            <p className="mt-2">Waiting for organizer to start the auction...</p>
          )}
        </>
      )}

      {auction.status === 'paused' && (
        <div className="mt-2">
          <p>Auction is currently paused.</p>
          {isOrganizer && <OrganizerControls auction={auction} refreshAuction={fetchAuction} />}
        </div>
      )}

      {auction.status === 'active' && (
        <>
          {isOrganizer && <OrganizerControls auction={auction} refreshAuction={fetchAuction} />}
          {myRole === 'bidder' && isApproved && (
            <BidderControls auction={auction} socket={socket} currentMember={currentMember} />
          )}
          {myRole === 'participant' && isApproved && <ParticipantPanel auction={auction} />}
          {myRole === 'viewer' && <p className="mt-2">Watching live.</p>}
          <LiveDashboard auction={auction} refreshTrigger={auction.currentBid?.amount} />
          <CommentBox auction={auction} socket={socket} />
        </>
      )}

      {auction.status === 'completed' && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Auction Completed</h2>
          <LiveDashboard auction={auction} refreshTrigger={auction.status} />
        </div>
      )}

      {activeVote && myRole === 'bidder' && (
        <VoteModal vote={activeVote} onResolved={() => setActiveVote(null)} />
      )}
    </div>
  );
}

export default AuctionRoomPage;
