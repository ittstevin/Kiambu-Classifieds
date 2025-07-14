import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ReportModal = ({ isOpen, onClose, type, targetId, targetName }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = {
    ad: [
      'Inappropriate content',
      'Spam or misleading',
      'Fake or counterfeit',
      'Wrong category',
      'Duplicate listing',
      'Price manipulation',
      'Other'
    ],
    user: [
      'Harassment or abuse',
      'Fake account',
      'Scam or fraud',
      'Spam behavior',
      'Inappropriate behavior',
      'Other'
    ]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason) {
      alert('Please select a reason');
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = type === 'ad' 
        ? `/api/ads/${targetId}/report`
        : `/api/users/${targetId}/report`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          reason,
          description,
          adId: type === 'ad' ? targetId : undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Report submitted successfully. Thank you for helping keep our community safe.');
        onClose();
        setReason('');
        setDescription('');
      } else {
        alert(data.error || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Report {type === 'ad' ? 'Ad' : 'User'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">
            You are reporting: <span className="font-semibold">{targetName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for report *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a reason</option>
              {reportReasons[type].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional details (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Please provide more details about your report..."
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/1000 characters
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Reports are reviewed by our moderation team. 
              False reports may result in account suspension.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !reason}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal; 