import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import FinalizeControls from './FinalizeControls';


function OrganizerControls({
  auction,
  refreshAuction
}) {

  const [items, setItems] =
    useState([]);

  const [purseAmount, setPurseAmount] =
    useState('');

  const [error, setError] =
    useState('');


  const [
    showManualParticipants,
    setShowManualParticipants
  ] = useState(false);


  const [
    manualNames,
    setManualNames
  ] = useState('');


  const [
    manualBasePrice,
    setManualBasePrice
  ] = useState('');


  const [
    manualSaving,
    setManualSaving
  ] = useState(false);


  const [
    settingsSaving,
    setSettingsSaving
  ] = useState(false);


  const fetchItems = async () => {

    try {

      const res =
        await axiosInstance.get(
          `/dashboard/${auction._id}/items`
        );


      setItems(
        res.data.items
      );

    } catch (err) {

      setError(
        'Failed to load items'
      );
    }
  };


  useEffect(() => {

    fetchItems();

  }, [
    auction._id,
    auction.currentItem
  ]);


  // ==================================================
  // MANUAL PARTICIPANTS
  // ==================================================
  const handleAddManualParticipants =
    async () => {

      setError('');


      const names =
        manualNames
          .split(/\r?\n|,/)
          .map(
            (name) =>
              name.trim()
          )
          .filter(Boolean);


      if (
        names.length === 0
      ) {

        setError(
          'Enter participant names first.'
        );

        return;
      }


      if (
        names.length > 500
      ) {

        setError(
          `Maximum 500 participants can be added at once. You entered ${names.length}.`
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

        setManualSaving(
          true
        );


        const res =
          await axiosInstance.post(
            '/item/bulk-create-manual',
            {
              auctionId:
                auction._id,

              names,

              basePrice:
                Number(
                  manualBasePrice
                )
            }
          );


        setManualNames('');


        await fetchItems();


        await refreshAuction();


        setShowManualParticipants(
          false
        );


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

        setManualSaving(
          false
        );
      }
    };


  // ==================================================
  // CHANGE AUCTION SETTINGS
  // ==================================================
  const handleSettingChange =
    async (
      key,
      value
    ) => {

      setError('');


      try {

        setSettingsSaving(
          true
        );


        await axiosInstance.put(
          '/auction/settings',
          {
            auctionId:
              auction._id,

            [key]:
              value
          }
        );


        await refreshAuction();


      } catch (err) {

        setError(
          err.response?.data?.message ||
          'Failed to update auction setting'
        );

      } finally {

        setSettingsSaving(
          false
        );
      }
    };


  const handleStart =
    async () => {

      try {

        await axiosInstance.post(
          '/auction/start',
          {
            auctionId:
              auction._id
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


  const handlePause =
    async () => {

      try {

        await axiosInstance.post(
          '/auction/pause',
          {
            auctionId:
              auction._id
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


  const handleResume =
    async () => {

      try {

        await axiosInstance.post(
          '/auction/resume',
          {
            auctionId:
              auction._id
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


  const handleEnd =
    async () => {

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
            auctionId:
              auction._id
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


  const handleNominate =
    async (
      itemId
    ) => {

      try {

        await axiosInstance.post(
          '/item/nominate',
          {
            auctionId:
              auction._id,

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


  const handleMarkUnsold =
    async () => {

      try {

        await axiosInstance.post(
          '/item/mark-unsold',
          {
            auctionId:
              auction._id
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


  const handleRequestUndo =
    async () => {

      try {

        await axiosInstance.post(
          '/vote/request',
          {
            auctionId:
              auction._id,

            type:
              'undo',

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
            auctionId:
              auction._id,

            type:
              'purseIncrease',

            amount:
              Number(
                purseAmount
              )
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


  const nominatable =
    items.filter(
      (item) =>
        item.status === 'pending' ||
        (
          item.status === 'unsold' &&
          auction.settings.allowReauction
        )
    );


  const hasBid =
    auction.currentBid?.amount > 0;


  const manualParticipantCount =
    manualNames
      .split(/\r?\n|,/)
      .map(
        (n) =>
          n.trim()
      )
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
          AUCTION SETTINGS
          ================================================== */}
      {
        (
          auction.status === 'waiting' ||
          auction.status === 'active' ||
          auction.status === 'paused'
        ) && (

          <div className="mb-4 border border-slate-200 rounded-lg p-3 bg-slate-50">

            <h3 className="font-semibold text-slate-800 mb-3">
              Auction Settings
            </h3>


            {/* RANDOM NOMINATION */}
            <label className="flex items-center justify-between gap-3 text-sm text-slate-700 mb-3">

              <span>
                Random nomination
              </span>


              <button
                type="button"
                disabled={
                  settingsSaving
                }
                onClick={() =>
                  handleSettingChange(
                    'randomNominationEnabled',
                    !auction.settings.randomNominationEnabled
                  )
                }
                className={
                  `px-4 py-1.5 rounded-full text-xs font-bold transition ${
                    auction.settings.randomNominationEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-300 text-slate-700'
                  }`
                }
              >

                {
                  auction.settings.randomNominationEnabled
                    ? 'ON'
                    : 'OFF'
                }

              </button>

            </label>


            {/* TIMER */}
            <label className="flex items-center justify-between gap-3 text-sm text-slate-700">

              <span>
                30 second bid timer
              </span>


              <button
                type="button"
                disabled={
                  settingsSaving
                }
                onClick={() =>
                  handleSettingChange(
                    'bidTimerEnabled',
                    !auction.settings.bidTimerEnabled
                  )
                }
                className={
                  `px-4 py-1.5 rounded-full text-xs font-bold transition ${
                    auction.settings.bidTimerEnabled
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-300 text-slate-700'
                  }`
                }
              >

                {
                  auction.settings.bidTimerEnabled
                    ? 'ON'
                    : 'OFF'
                }

              </button>

            </label>


            <p className="text-xs text-slate-500 mt-2">
              Both settings can be changed while the auction is running.
              The timer resets to 30 seconds after every successful bid.
            </p>

          </div>
        )
      }


      {/* ==================================================
          MANUAL PARTICIPANTS
          ================================================== */}
      {
        auction.status === 'waiting' && (

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

              {
                showManualParticipants
                  ? 'Hide'
                  : 'Add'
              }

              {' '}
              Manual Participants

            </button>


            {
              showManualParticipants && (

                <div className="mt-3 space-y-3">

                  <p className="text-xs text-gray-600">

                    Add up to 500 players without
                    requiring them to create an account
                    or log in.

                    Enter one name per line
                    (commas are also supported).

                  </p>


                  <textarea
                    value={
                      manualNames
                    }
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
                    /500 names

                  </div>


                  <button
                    type="button"
                    disabled={
                      manualSaving
                    }
                    onClick={
                      handleAddManualParticipants
                    }
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm"
                  >

                    {
                      manualSaving
                        ? 'Adding...'
                        : 'Add Participants'
                    }

                  </button>

                </div>
              )
            }

          </div>
        )
      }


      {/* START */}
      {
        auction.status === 'waiting' && (

          <button
            onClick={
              handleStart
            }
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mb-3"
          >
            Start Auction
          </button>

        )
      }


      {/* PAUSE */}
      {
        auction.status === 'active' && (

          <button
            onClick={
              handlePause
            }
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded mr-2 mb-3"
          >
            Pause
          </button>

        )
      }


      {/* RESUME */}
      {
        auction.status === 'paused' && (

          <button
            onClick={
              handleResume
            }
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mr-2 mb-3"
          >
            Resume
          </button>

        )
      }


      {/* END */}
      {
        (
          auction.status === 'active' ||
          auction.status === 'paused'
        ) && (

          <button
            onClick={
              handleEnd
            }
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded mb-3"
          >
            End Auction
          </button>

        )
      }


      {/* ==================================================
          ACTIVE AUCTION
          ================================================== */}
      {
        auction.status === 'active' && (

          <>

            {
              auction.currentItem ? (

                <div>

                  <p className="text-sm mb-2">

                    Active item:
                    {' '}
                    {auction.currentItem.name}

                    {' '}
                    (Base ₹
                    {auction.currentItem.basePrice})

                  </p>


                  {
                    hasBid ? (

                      <FinalizeControls
                        auction={
                          auction
                        }
                        refreshAuction={() => {
                          fetchItems();
                          refreshAuction();
                        }}
                      />

                    ) : (

                      <button
                        onClick={
                          handleMarkUnsold
                        }
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Mark Unsold
                      </button>

                    )
                  }

                </div>

              ) : (

                <div>

                  <h3 className="text-sm font-medium mb-2">
                    Nominate an item:
                  </h3>


                  {
                    nominatable.length === 0 && (

                      <p className="text-sm text-gray-500">
                        No items available
                      </p>

                    )
                  }


                  {
                    nominatable.map(
                      (item) => (

                        <div
                          key={
                            item._id
                          }
                          className="flex items-center justify-between py-1"
                        >

                          <span>
                            {item.name}
                            {' '}
                            (₹
                            {item.basePrice})
                          </span>


                          <button
                            onClick={() =>
                              handleNominate(
                                item._id
                              )
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
                          >
                            Nominate
                          </button>

                        </div>

                      )
                    )
                  }

                </div>
              )
            }

          </>

        )
      }


      {/* UNDO */}
      {
        auction.status === 'active' &&
        auction.currentBid?.amount > 0 && (

          <button
            onClick={
              handleRequestUndo
            }
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 rounded mt-2"
          >
            Request Undo Last Bid
          </button>

        )
      }


      {/* PURSE */}
      <div className="mt-3 flex gap-2 items-center">

        <input
          type="number"
          placeholder="Purse increase amount"
          value={
            purseAmount
          }
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
          className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1 rounded"
        >
          Request Purse Increase for All
        </button>

      </div>

    </div>
  );
}


export default OrganizerControls;