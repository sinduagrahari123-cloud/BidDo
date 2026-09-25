import { useState } from 'react';
import useAuthStore from '../../store/authStore';


function BidderControls({
  auction,
  socket,
  currentMember
}) {

  const [
    amount,
    setAmount
  ] = useState('');


  const [
    error,
    setError
  ] = useState('');


  const user =
    useAuthStore(
      (state) => state.user
    );


  const minRequired =
    auction.currentBid?.amount > 0
      ? auction.currentBid.amount
      : auction.currentItem?.basePrice || 0;


  const placeBid =
    (bidAmount) => {

      setError('');


      if (
        !bidAmount ||
        bidAmount <= minRequired
      ) {

        setError(
          `Bid must be higher than ₹${minRequired}`
        );

        return;
      }


      if (
        bidAmount >
        currentMember?.remainingPurse
      ) {

        setError(
          'Bid exceeds your remaining purse'
        );

        return;
      }


      socket.emit(
        'place_bid',
        {
          roomCode:
            auction.roomCode,

          amount:
            bidAmount,

          bidderId:
            user._id
        }
      );


      setAmount('');
    };


  // ==================================================
  // QUICK BID AMOUNTS
  // ==================================================
  const quickAmounts = [
    100,
    500,
    1000,
    5000,
    10000,
    20000,
    50000,
    100000,
    200000,
    1000000
  ];


  if (
    !auction.currentItem
  ) {

    return (
      <p className="mt-2">
        Waiting for the organizer
        to nominate an item...
      </p>
    );
  }


  return (

    <div className="border rounded p-4 mt-3">

      <h2 className="font-semibold mb-2">
        {auction.currentItem.name}
      </h2>


      <p className="text-sm text-gray-600">
        Current Bid: ₹
        {minRequired}
      </p>


      <p className="text-sm mb-3">
        Your Remaining Purse:
        {' '}
        ₹
        {currentMember?.remainingPurse}
      </p>


      {/* ==================================================
          QUICK BID BUTTONS
          ================================================== */}
      <div className="flex gap-2 flex-wrap mb-3">

        {
          quickAmounts.map(
            (inc) => {

              let buttonClass =
                '';


              if (
                inc >= 1000000
              ) {

                buttonClass =
                  'bg-rose-600 hover:bg-rose-700 text-white border-rose-500';

              } else if (
                inc >= 200000
              ) {

                buttonClass =
                  'bg-fuchsia-600 hover:bg-fuchsia-700 text-white border-fuchsia-500';

              } else if (
                inc >= 100000
              ) {

                buttonClass =
                  'bg-purple-600 hover:bg-purple-700 text-white border-purple-500';

              } else if (
                inc >= 50000
              ) {

                buttonClass =
                  'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500';

              } else if (
                inc >= 20000
              ) {

                buttonClass =
                  'bg-blue-600 hover:bg-blue-700 text-white border-blue-500';

              } else if (
                inc >= 10000
              ) {

                buttonClass =
                  'bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-500';

              } else {

                buttonClass =
                  'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300';
              }


              return (

                <button
                  key={
                    inc
                  }
                  onClick={() =>
                    placeBid(
                      minRequired +
                      inc
                    )
                  }
                  className={
                    `px-3 py-2 rounded-lg text-sm font-bold transition-all shadow-sm border ${buttonClass}`
                  }
                >

                  +₹
                  {inc.toLocaleString(
                    'en-IN'
                  )}

                </button>

              );
            }
          )
        }

      </div>


      {/* CUSTOM BID */}
      <div className="flex gap-2">

        <input
          type="number"
          placeholder="Custom amount"
          value={
            amount
          }
          onChange={(e) =>
            setAmount(
              e.target.value
            )
          }
          className="border p-2 rounded flex-1"
        />


        <button
          onClick={() =>
            placeBid(
              Number(amount)
            )
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Place Bid
        </button>

      </div>


      {
        error && (

          <p className="text-red-500 text-sm mt-2">
            {error}
          </p>

        )
      }

    </div>
  );
}


export default BidderControls;