import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

function CreateAuctionForm() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pursePerTeam, setPursePerTeam] = useState('');
  const [maxTeamSize, setMaxTeamSize] = useState('');
  const [minBidAmount, setMinBidAmount] = useState('');
  const [allowReauction, setAllowReauction] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axiosInstance.post('/auction/create', {
        title,
        category,
        settings: {
          pursePerTeam: pursePerTeam || undefined,
          maxTeamSize: maxTeamSize || undefined,
          minBidAmount: minBidAmount || undefined,
          allowReauction,
        },
      });
      navigate(`/${res.data.auction.roomCode}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create auction');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <h1 className="text-xl font-semibold mb-2">Create Auction</h1>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Auction Title</label>
        <input
          type="text"
          placeholder="e.g. IPL Fantasy Auction"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <input
          type="text"
          placeholder="e.g. Cricket, Coding Contest"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-blue-600 hover:underline"
      >
        {showAdvanced ? 'Hide' : 'Show'} advanced settings
      </button>

      {showAdvanced && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purse Per Team</label>
            <input
              type="number"
              placeholder="Default: 1000"
              value={pursePerTeam}
              onChange={(e) => setPursePerTeam(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Team Size</label>
            <input
              type="number"
              placeholder="Default: 11"
              value={maxTeamSize}
              onChange={(e) => setMaxTeamSize(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Bid Amount</label>
            <input
              type="number"
              placeholder="Default: 10"
              value={minBidAmount}
              onChange={(e) => setMinBidAmount(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-full"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={allowReauction}
              onChange={(e) => setAllowReauction(e.target.checked)}
              className="rounded"
            />
            Allow re-auctioning unsold items
          </label>
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg w-full transition">
        Create Auction
      </button>
    </form>
  );
}

export default CreateAuctionForm;