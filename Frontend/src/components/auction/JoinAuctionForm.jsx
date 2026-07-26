import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

function JoinAuctionForm() {
  const [roomCode, setRoomCode] = useState('');
  const [desiredRole, setDesiredRole] = useState('viewer');
  const [teamName, setTeamName] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axiosInstance.post('/auction/join', {
        roomCode,
        desiredRole,
        teamName: desiredRole === 'bidder' ? teamName : undefined,
        basePrice: desiredRole === 'participant' ? basePrice : undefined,
      });
      navigate(`/${res.data.auction.roomCode}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join auction');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto">
      <input
        type="text"
        placeholder="Enter Room Code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        className="border p-2 rounded"
        required
      />

      <select
        value={desiredRole}
        onChange={(e) => setDesiredRole(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="viewer">Viewer (just watch)</option>
        <option value="participant">Participant</option>
        <option value="bidder">Bidder</option>
      </select>

      {desiredRole === 'bidder' && (
        <input
          type="text"
          placeholder="Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="border p-2 rounded"
        />
      )}

      {desiredRole === 'participant' && (
        <input
          type="number"
          placeholder="Your Base Price"
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          className="border p-2 rounded"
        />
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" className="bg-blue-600 text-white p-2 rounded">
        Join Auction
      </button>
    </form>
  );
}

export default JoinAuctionForm;