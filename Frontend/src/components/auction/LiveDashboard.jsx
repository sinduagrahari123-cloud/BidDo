import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';



function LiveDashboard({ auction, refreshTrigger }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get(`/dashboard/${auction._id}/items`);
      setItems(res.data.items);
    } catch (err) {
      setError('Failed to load dashboard');
    }
  };

  useEffect(() => {
    fetchData();
  }, [auction._id, refreshTrigger]);

  const bidders = auction.members.filter((m) => m.role === 'bidder' && m.status === 'approved');
  const participants = auction.members.filter((m) => m.role === 'participant' && m.status === 'approved');
  const soldItems = items.filter((item) => item.status === 'sold');
  const unsoldItems = items.filter((item) => item.status === 'unsold');

  const teamName = (member) => member?.teamName || member?.userId?.name || 'Unknown';

  const getBuyer = (item) =>
    auction.members.find((m) => m.userId?._id?.toString() === item.soldTo?.toString());

  return (
  <div className="mt-8 space-y-6">
    {error && <p className="text-red-500 text-sm">{error}</p>}

    {/* ACTIVE ITEM */}
    {auction.currentItem && (
      <div className="auction-hero relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6 flex flex-col items-center text-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/15 blur-[90px]" />
        </div>

        <img
          src={auction.currentItem.imageUrl || "/default-item.png"}
          alt={auction.currentItem.name}
          className="relative z-10 w-32 h-32 md:w-36 md:h-36 rounded-full object-cover border-4 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,.35)] mb-4"
        />

        <h2 className="relative z-10 text-2xl md:text-3xl font-extrabold tracking-wide text-white">
          {auction.currentItem.name}
        </h2>

        <p className="mt-2 text-slate-400">
          Base ₹{auction.currentItem.basePrice}
        </p>

        <p className="mt-4 text-3xl md:text-4xl font-black text-blue-400">
          ₹
          {auction.currentBid?.amount > 0
            ? auction.currentBid.amount
            : auction.currentItem.basePrice}
        </p>

        <span className="mt-3 rounded-full border border-green-500/30 bg-green-500/20 px-4 py-1 text-xs font-semibold text-green-400">
          ● LIVE AUCTION
        </span>
      </div>
    )}

    {/* DASHBOARD GRID */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

      {/* TEAMS PANEL */}
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl p-5 transition-all duration-300 hover:border-blue-400/40">
        <h2 className="text-xl font-bold tracking-wide text-white mb-4">
          Teams
        </h2>

        {bidders.length === 0 && (
          <p className="text-sm text-slate-400">No teams yet</p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {bidders.map((bidder) => {
            const boughtItems = soldItems.filter(
              (item) =>
                item.soldTo?.toString() === bidder.userId?._id?.toString()
            );

            return (
              <div
                key={bidder._id}
                className="rounded-2xl border border-white/10 bg-black/20 p-3 transition-all duration-300 hover:scale-[1.02] hover:border-blue-400/40"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={bidder.userId?.avatar?.url || "/default-item.png"}
                    alt={teamName(bidder)}
                    className="w-10 h-10 rounded-full object-cover"
                  />

                  <span className="flex-1 font-semibold text-white">
                    {teamName(bidder)}
                  </span>

                  <span className="text-sm font-semibold text-green-400">
                    ₹{bidder.remainingPurse}
                  </span>
                </div>

                {boughtItems.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No players yet
                  </p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {boughtItems.map((item) => (
                      <li
                        key={item._id}
                        className="flex items-center gap-2"
                      >
                        <img
                          src={item.imageUrl || "/default-item.png"}
                          alt={item.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />

                        <span className="flex-1">
                          {item.name}
                        </span>

                        <span className="text-slate-400">
                          ₹{item.soldAmount}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SOLD PLAYERS */}
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl p-5 transition-all duration-300 hover:border-blue-400/40">
        <h2 className="text-xl font-bold tracking-wide text-white mb-4">
          Sold Players
        </h2>

        {soldItems.length === 0 && (
          <p className="text-sm text-slate-400">
            No sales yet
          </p>
        )}

        <ul className="space-y-2 text-sm">
          {soldItems.map((item) => {
            const buyer = getBuyer(item);

            return (
              <li
                key={item._id}
                className="flex items-center gap-3 border-b border-white/10 pb-2"
              >
                <img
                  src={item.imageUrl || "/default-item.png"}
                  alt={item.name}
                  className="w-8 h-8 rounded-full object-cover"
                />

                <span className="flex-1">
                  {item.name}
                </span>

                <span className="text-slate-400">
                  {teamName(buyer)} — ₹{item.soldAmount}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* UNSOLD PLAYERS */}
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl p-5 transition-all duration-300 hover:border-blue-400/40">
        <h2 className="text-xl font-bold tracking-wide text-white mb-4">
          Unsold Players
        </h2>

        {unsoldItems.length === 0 && (
          <p className="text-sm text-slate-400">
            None yet
          </p>
        )}

        <ul className="space-y-2 text-sm">
          {unsoldItems.map((item) => (
            <li
              key={item._id}
              className="flex items-center gap-3 border-b border-white/10 pb-2"
            >
              <img
                src={item.imageUrl || "/default-item.png"}
                alt={item.name}
                className="w-8 h-8 rounded-full object-cover"
              />

              <span>{item.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* PARTICIPANTS */}
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl p-5 transition-all duration-300 hover:border-blue-400/40">
        <h2 className="text-xl font-bold tracking-wide text-white mb-4">
          Participants
        </h2>

        {participants.length === 0 && (
          <p className="text-sm text-slate-400">
            No participants
          </p>
        )}

        <ul className="space-y-2 text-sm">
          {participants.map((p) => (
            <li
              key={p._id}
              className="flex items-center gap-3 border-b border-white/10 pb-2"
            >
              <img
                src={p.userId?.avatar?.url || "/default-item.png"}
                alt={p.userId?.name}
                className="w-8 h-8 rounded-full object-cover"
              />

              <span>{p.userId?.name}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  </div>
);
}

export default LiveDashboard;