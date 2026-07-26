import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

function PendingApprovals({ auctionId }) {
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');

  const fetchAuction = async () => {
    try {
      const res = await axiosInstance.get(`/dashboard/${auctionId}`);
      setMembers(res.data.auction.members);
    } catch (err) {
      setError('Failed to load pending requests');
    }
  };

  useEffect(() => {
    fetchAuction();
  }, [auctionId]);

  const handleRoleChange = (memberId, newRole) => {
    setMembers((prev) =>
      prev.map((m) => (m._id === memberId ? { ...m, role: newRole } : m))
    );
  };

  const handleBasePriceChange = (memberId, newPrice) => {
    setMembers((prev) =>
      prev.map((m) => (m._id === memberId ? { ...m, basePrice: newPrice } : m))
    );
  };

  const handleDecision = async (member, status) => {
    try {
      await axiosInstance.put('/auction/approve', {
        auctionId,
        memberId: member._id,
        role: member.role,
        status,
        basePrice: member.role === 'participant' ? member.basePrice : undefined,
      });
      fetchAuction();
    } catch (err) {
      setError('Failed to update member');
    }
  };

  const pending = members.filter((m) => m.status === 'pending');

  return (
    <div className="border rounded p-4 mt-3">
      <h2 className="font-semibold mb-3">Pending Requests</h2>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {pending.length === 0 && <p className="text-gray-500 text-sm">No pending requests</p>}

      {pending.map((member) => (
        <div key={member._id} className="flex items-center flex-wrap gap-2 py-2 border-b">
          <span>{member.userId?.name}</span>
          <select
            value={member.role}
            onChange={(e) => handleRoleChange(member._id, e.target.value)}
            className="border p-1 rounded text-sm"
          >
            <option value="viewer">Viewer</option>
            <option value="participant">Participant</option>
            <option value="bidder">Bidder</option>
          </select>

          {member.role === 'bidder' && member.teamName && (
            <span className="text-xs text-gray-500">Team: {member.teamName}</span>
          )}

          {member.role === 'participant' && (
            <input
              type="number"
              value={member.basePrice || 0}
              onChange={(e) => handleBasePriceChange(member._id, Number(e.target.value))}
              className="border p-1 rounded text-sm w-24"
              placeholder="Base price"
            />
          )}

          <button
            onClick={() => handleDecision(member, 'approved')}
            className="bg-blue-600 text-white text-sm px-3 py-1 rounded"
          >
            Approve
          </button>
          <button
            onClick={() => handleDecision(member, 'rejected')}
            className="bg-red-600 text-white text-sm px-3 py-1 rounded"
          >
            Deny
          </button>
        </div>
      ))}
    </div>
  );
}

export default PendingApprovals;