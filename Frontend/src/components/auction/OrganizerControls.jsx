import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import FinalizeControls from './FinalizeControls';

function OrganizerControls({ auction, refreshAuction }) {

  const [items, setItems] = useState([]);
  const [purseAmount, setPurseAmount] = useState('');
  const [error, setError] = useState('');

  // ======================================================
  // NEW: Manual participants states
  // ======================================================
  const [showManualParticipants, setShowManualParticipants] =
    useState(false);

  const [manualNames, setManualNames] = useState('');

  const [manualBasePrice, setManualBasePrice] =
    useState('');

  const [manualSaving, setManualSaving] =
    useState(false);


  const fetchItems = async () => {
    try {

      const res =
        await axiosInstance.get(
          `/dashboard/${auction._id}/items`
        );

      setItems(res.data.items);

    } catch (err) {

      setError(
        'Failed to load items'
      );
    }
  };


  useEffect(() => {
    fetchItems();
  }, [auction._id, auction.currentItem]);


  const handleStart = async () => {

    try {

      await axiosInstance.post(
        '/auction/start',
        {
          auctionId: auction._id
        }
      );

      refreshAuction();

    } catch (err) {

      setError(
        err.response?.data?.message ||
        'Failed to start auction'
      );
    }
  };


  // ======================================================
  // NEW: ADD MANUAL PARTICIPANTS
  // ======================================================
  const handleAddManualParticipants = async () => {

    setError('');

    /*
      Supports:

      Player 1
      Player 2
      Player 3

      OR

      Player 1, Player 2, Player 3
    */
    const names = manualNames
      .split(/\r?\n|,/)
      .map((name) => name.trim())
      .filter(Boolean);


    if (names.length === 0) {

      setError(
        'Enter participant names first.'
      );

      return;
    }


    if (names.length > 130) {

      setError(
        `Maximum 130 participants can be added at once. You entered ${names.length}.`
      );

      return;
    }


    if (
      manualBasePrice === '' ||
      Number(manualBasePrice) < 0
    ) {

      setError(
        'Enter a valid common base price.'
      );

      return;
    }


    try {

      setManualSaving(true);


      const res =
        await axiosInstance.post(
          '/item/bulk-create-manual',
          {
            auctionId: auction._id,
            names: names,
            basePrice:
              Number(manualBasePrice)
          }
        );


      // Clear input
      setManualNames('');


      // Refresh item list
      await fetchItems();


      // Refresh auction
      refreshAuction();


      // Close form
      setShowManualParticipants(false);


      setError('');


      window.alert(
        res.data.message
      );


    } catch (err) {

      setError(
        err.response?.data?.message ||
        'Failed to add manual participants'
      );

    } finally {

      setManualSaving(false);
    }
  };


  const handlePause = async () => {

    try {

      await axiosInstance.post(
        '/auction/pause',
        {
          auctionId: auction._id
        }
      );

      refreshAuction();

    } catch (err) {

      setError(
        err.response?.data?.message ||
        'Failed to pause auction'
      );
    }
  };


  const handleResume = async () => {

    try {

      await axiosInstance.post(
        '/auction/resume',
        {
          auctionId: auction._id
        }
      );

      refreshAuction();

    } catch (err) {

      setError(
        err.response?.data?.message ||
        'Failed to resume auction'
      );
    }
  };


  const handleEnd = async () => {

    if (
      !window.confirm(
        'End the auction? This cannot be undone.'
      )
    ) {
      return;
    }


    try {

      await axiosInstance.post(
        '/auction/end',
        {
          auctionId: auction._id
        }
      );

      refreshAuction();

    } catch (err) {

      setError(
        err.response?.data?.message ||
        'Failed to end auction'
      );
    }
  };


  const handleNominate = async (itemId) => {

    try {

      await axiosInstance.post(
        '/item/nominate',
        {
          auctionId: auction._id,
          itemId
        }
      );

      fetchItems();
      refreshAuction();

    } catch (err) {

      setError(
        err.response?.data?.message ||
        'Failed to nominate item'
      );
    }
  };


  const handleMarkUnsold = async () => {

    try {

      await axiosInstance.post(
        '/item/mark-unsold',
        {
          auctionId: auction._id
        }
      );

      fetchItems();
      refreshAuction();

    } catch (err) {

      setError(
        err.response?.data?.message ||
        'Failed to mark unsold'
      );
    }
  };


  const handleRequestUndo = async () => {

    try {

      await axiosInstance.post(
        '/vote/request',
        {
          auctionId: auction._id,
          type: 'undo',
          targetMemberId:
            auction.currentBid.bidderId,
          amount:
            auction.currentBid.amount
        }
      );

    } catch (err) {

      setError(
        err.response?.data?.message ||
        'Failed to request undo vote'
      );
    }
  };


  const handleRequestPurseIncrease =
    async () => {

      try {

        await axiosInstance.post(
          '/vote/request',
          {
            auctionId: auction._id,
            type: 'purseIncrease',
            amount:
              Number(purseAmount)
          }
        );

        setPurseAmount('');

      } catch (err) {

        setError(
          err.response?.data?.message ||
          'Failed to request purse increase'
        );
      }
    };


  const nominatable = items.filter(
    (item) =>
      item.status === 'pending' ||
      (
        item.status === 'unsold' &&
        auction.settings.allowReauction
      )
  );


  const hasBid =
    auction.currentBid?.amount > 0;


  // Count entered names
  const manualParticipantCount =
    manualNames
      .split(/\r?\n|,/)
      .map((name) => name.trim())
      .filter(Boolean)
      .length;


  return (

    <div className="border rounded p-4 mt-3">

      <h2 className="font-semibold mb-3">
        Organizer Controls
      </h2>


      {error && (
        <p className="text-red-500 text-sm mb-2">
          {error}
        </p>
      )}


      {/* ==================================================
          WAITING STATE
          ================================================== */}
      {auction.status === 'waiting' && (
        <>

          {/* ==================================================
              MANUAL PARTICIPANTS
              ================================================== */}
          <div className="mb-4 border rounded-lg p-3 bg-gray-50">

            <button
              type="button"
              onClick={() =>
                setShowManualParticipants(
                  !showManualParticipants
                )
              }
              className="font-medium text-blue-700"
            >

              {showManualParticipants
                ? 'Hide'
                : 'Add'} Manual Participants

            </button>


            {showManualParticipants && (

              <div className="mt-3 space-y-3">

                <p className="text-xs text-gray-600">

                  Add up to 130 players without
                  requiring them to create an account
                  or log in.

                  Enter one name per line.
                  Commas are also supported.

                </p>


                <textarea

                  value={manualNames}

                  onChange={(e) =>
                    setManualNames(
                      e.target.value
                    )
                  }

                  rows={8}

                  placeholder={
                    "Player 1\nPlayer 2\nPlayer 3\n..."
                  }

                  className="border p-2 rounded w-full text-sm text-gray-900"

                />


                <div className="flex items-center gap-2">

                  <input

                    type="number"

                    min="0"

                    value={
                      manualBasePrice
                    }

                    onChange={(e) =>
                      setManualBasePrice(
                        e.target.value
                      )
                    }

                    placeholder="Common base price"

                    className="border p-2 rounded text-sm text-gray-900 flex-1"

                  />

                  <span className="text-sm text-gray-600">
                    ₹
                  </span>

                </div>


                <div className="text-xs text-gray-500">

                  {manualParticipantCount}
                  /130 names

                </div>


                <button

                  type="button"

                  disabled={manualSaving}

                  onClick={
                    handleAddManualParticipants
                  }

                  className="bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm"

                >

                  {manualSaving
                    ? 'Adding...'
                    : 'Add Participants'}

                </button>

              </div>
            )}

          </div>


          {/* ==================================================
              START AUCTION
              ================================================== */}
          <button
            onClick={handleStart}
            className="bg-green-600 text-white px-4 py-2 rounded mb-3"
          >
            Start Auction
          </button>

        </>
      )}


      {/* ==================================================
          PAUSE
          ================================================== */}
      {auction.status === 'active' && (

        <button
          onClick={handlePause}
          className="bg-yellow-500 text-white px-4 py-2 rounded mr-2 mb-3"
        >
          Pause
        </button>

      )}


      {/* ==================================================
          RESUME
          ================================================== */}
      {auction.status === 'paused' && (

        <button
          onClick={handleResume}
          className="bg-green-600 text-white px-4 py-2 rounded mr-2 mb-3"
        >
          Resume
        </button>

      )}


      {/* ==================================================
          END AUCTION
          ================================================== */}
      {
        (
          auction.status === 'active' ||
          auction.status === 'paused'
        ) && (

          <button
            onClick={handleEnd}
            className="bg-red-600 text-white px-4 py-2 rounded mb-3"
          >
            End Auction
          </button>

        )
      }


      {/* ==================================================
          ACTIVE AUCTION
          ================================================== */}
      {auction.status === 'active' && (

        <>

          {auction.currentItem ? (

            <div>

              <p className="text-sm mb-2">

                Active item:
                {' '}
                {auction.currentItem.name}

                {' '}
                (Base ₹
                {auction.currentItem.basePrice})

              </p>


              {hasBid ? (

                <FinalizeControls
                  auction={auction}
                  refreshAuction={() => {
                    fetchItems();
                    refreshAuction();
                  }}
                />

              ) : (

                <button
                  onClick={handleMarkUnsold}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                >
                  Mark Unsold
                </button>

              )}

            </div>

          ) : (

            <div>

              <h3 className="text-sm font-medium mb-2">
                Nominate an item:
              </h3>


              {nominatable.length === 0 && (

                <p className="text-sm text-gray-500">
                  No items available
                </p>

              )}


              {nominatable.map((item) => (

                <div
                  key={item._id}
                  className="flex items-center justify-between py-1"
                >

                  <span>

                    {item.name}
                    {' '}
                    (₹{item.basePrice})

                  </span>


                  <button
                    onClick={() =>
                      handleNominate(item._id)
                    }
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


      {/* ==================================================
          UNDO BID
          ================================================== */}
      {
        auction.status === 'active' &&
        auction.currentBid?.amount > 0 && (

          <button
            onClick={handleRequestUndo}
            className="bg-orange-500 text-white text-sm px-3 py-1 rounded mt-2"
          >
            Request Undo Last Bid
          </button>

        )
      }


      {/* ==================================================
          PURSE INCREASE
          ================================================== */}
      <div className="mt-3 flex gap-2 items-center">

        <input
          type="number"
          placeholder="Purse increase amount"
          value={purseAmount}
          onChange={(e) =>
            setPurseAmount(
              e.target.value
            )
          }
          className="border p-1 rounded text-sm w-40"
        />


        <button
          onClick={
            handleRequestPurseIncrease
          }
          className="bg-purple-600 text-white text-sm px-3 py-1 rounded"
        >
          Request Purse Increase for All
        </button>

      </div>

    </div>
  );
}


export default OrganizerControls;