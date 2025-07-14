import React, { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

const UserRating = ({ userId, currentUser, adId, onRatingSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [transactionType, setTransactionType] = useState('buy');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRatings, setUserRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [showRatingForm, setShowRatingForm] = useState(false);

  useEffect(() => {
    fetchUserRatings();
  }, [userId]);

  const fetchUserRatings = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/ratings`);
      const data = await response.json();
      
      if (data.success) {
        setUserRatings(data.data.ratings);
        setAverageRating(data.data.averageRating);
        setTotalRatings(data.data.totalRatings);
      }
    } catch (error) {
      console.error('Error fetching user ratings:', error);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Please login to submit a rating');
      return;
    }

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/users/${userId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          rating,
          comment,
          adId,
          transactionType
        })
      });

      const data = await response.json();

      if (data.success) {
        setRating(0);
        setComment('');
        setShowRatingForm(false);
        fetchUserRatings();
        if (onRatingSubmit) onRatingSubmit(data.data);
        alert('Rating submitted successfully!');
      } else {
        alert(data.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canRate = currentUser && currentUser.id !== userId;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* User Rating Summary */}
      <div className="flex items-center mb-4">
        <div className="flex items-center">
          {[...Array(5)].map((_, index) => (
            <StarIcon
              key={index}
              className={`h-5 w-5 ${
                index < Math.round(averageRating)
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <div className="ml-3">
          <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
          <span className="text-gray-500 ml-1">({totalRatings} ratings)</span>
        </div>
      </div>

      {/* Rating Form */}
      {canRate && (
        <div className="mb-6">
          {!showRatingForm ? (
            <button
              onClick={() => setShowRatingForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Rate this user
            </button>
          ) : (
            <form onSubmit={handleRatingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type
                </label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="buy">I bought from this seller</option>
                  <option value="sell">I sold to this buyer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      className="focus:outline-none"
                    >
                      {star <= (hover || rating) ? (
                        <StarIcon className="h-6 w-6 text-yellow-400" />
                      ) : (
                        <StarOutlineIcon className="h-6 w-6 text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your experience with this user..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {comment.length}/500 characters
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRatingForm(false);
                    setRating(0);
                    setComment('');
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Recent Ratings */}
      {userRatings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Reviews</h3>
          <div className="space-y-4">
            {userRatings.slice(0, 5).map((rating, index) => (
              <div key={index} className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, starIndex) => (
                      <StarIcon
                        key={starIndex}
                        className={`h-4 w-4 ${
                          starIndex < rating.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {rating.transactionType === 'buy' ? 'Bought' : 'Sold'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {rating.comment && (
                  <p className="text-gray-700 text-sm">{rating.comment}</p>
                )}
                {rating.ad && (
                  <p className="text-xs text-gray-500 mt-1">
                    Re: {rating.ad.title}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRating; 