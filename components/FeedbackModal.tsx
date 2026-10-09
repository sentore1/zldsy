/**
 * Customer Feedback Modal
 * Collect ratings and reviews after job completion
 */

import React, { useState } from 'react';
import { X, Star, ThumbsUp, ThumbsDown, Send, CheckCircle } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FeedbackData) => Promise<void>;
  jobId: string;
  serviceName: string;
  jobNumber?: string;
}

export interface FeedbackData {
  job_id: string;
  rating: number;
  service_quality_rating?: number;
  staff_professionalism_rating?: number;
  timeliness_rating?: number;
  value_for_money_rating?: number;
  review_title?: string;
  review_text?: string;
  would_recommend?: boolean;
}

export function FeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  jobId,
  serviceName,
  jobNumber,
}: FeedbackModalProps) {
  const [step, setStep] = useState<'rating' | 'details' | 'success'>('rating');
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FeedbackData>({
    job_id: jobId,
    rating: 0,
    service_quality_rating: 0,
    staff_professionalism_rating: 0,
    timeliness_rating: 0,
    value_for_money_rating: 0,
    review_title: '',
    review_text: '',
    would_recommend: undefined,
  });

  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async () => {
    if (formData.rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      setStep('success');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      // Reset form
      setFormData({
        job_id: jobId,
        rating: 0,
        service_quality_rating: 0,
        staff_professionalism_rating: 0,
        timeliness_rating: 0,
        value_for_money_rating: 0,
        review_title: '',
        review_text: '',
        would_recommend: undefined,
      });
      setStep('rating');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-500 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold">
            {step === 'success' ? 'Thank You!' : 'Rate Your Service'}
          </h2>
          <button onClick={handleClose} className="text-white hover:text-gray-200 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Feedback Submitted!
              </h3>
              <p className="text-gray-600 mb-6">
                Thank you for sharing your experience. Your feedback helps us improve our services.
              </p>
              <button
                onClick={handleClose}
                className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium"
              >
                Close
              </button>
            </div>
          )}

          {/* Rating Step */}
          {step === 'rating' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  How was your experience?
                </h3>
                <p className="text-gray-600 mb-1">Service: {serviceName}</p>
                {jobNumber && (
                  <p className="text-sm text-gray-500">Job #{jobNumber}</p>
                )}
              </div>

              {/* Overall Rating */}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Overall Rating *
                </p>
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className="w-12 h-12"
                        fill={star <= (hoverRating || formData.rating) ? '#FBBF24' : 'none'}
                        stroke={star <= (hoverRating || formData.rating) ? '#FBBF24' : '#D1D5DB'}
                        strokeWidth={2}
                      />
                    </button>
                  ))}
                </div>
                {formData.rating > 0 && (
                  <p className="text-sm font-medium text-gray-600">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][formData.rating]}
                  </p>
                )}
              </div>

              {/* Detailed Ratings */}
              {formData.rating > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Rate Different Aspects (Optional)
                  </p>

                  <RatingInput
                    label="Service Quality"
                    value={formData.service_quality_rating || 0}
                    onChange={(value) => setFormData({ ...formData, service_quality_rating: value })}
                  />

                  <RatingInput
                    label="Staff Professionalism"
                    value={formData.staff_professionalism_rating || 0}
                    onChange={(value) => setFormData({ ...formData, staff_professionalism_rating: value })}
                  />

                  <RatingInput
                    label="Timeliness"
                    value={formData.timeliness_rating || 0}
                    onChange={(value) => setFormData({ ...formData, timeliness_rating: value })}
                  />

                  <RatingInput
                    label="Value for Money"
                    value={formData.value_for_money_rating || 0}
                    onChange={(value) => setFormData({ ...formData, value_for_money_rating: value })}
                  />
                </div>
              )}

              {/* Would Recommend */}
              {formData.rating > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-3 text-center">
                    Would you recommend our services?
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, would_recommend: true })}
                      className={`flex-1 max-w-[200px] p-4 rounded-lg border-2 transition ${
                        formData.would_recommend === true
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <ThumbsUp
                        className={`w-8 h-8 mx-auto mb-2 ${
                          formData.would_recommend === true ? 'text-green-600' : 'text-gray-400'
                        }`}
                      />
                      <p className="font-medium text-gray-900">Yes</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, would_recommend: false })}
                      className={`flex-1 max-w-[200px] p-4 rounded-lg border-2 transition ${
                        formData.would_recommend === false
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <ThumbsDown
                        className={`w-8 h-8 mx-auto mb-2 ${
                          formData.would_recommend === false ? 'text-red-600' : 'text-gray-400'
                        }`}
                      />
                      <p className="font-medium text-gray-900">No</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Maybe Later
                </button>
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  disabled={formData.rating === 0}
                  className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Details Step */}
          {step === 'details' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex justify-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-6 h-6"
                      fill={star <= formData.rating ? '#FBBF24' : 'none'}
                      stroke={star <= formData.rating ? '#FBBF24' : '#D1D5DB'}
                    />
                  ))}
                </div>
                <p className="text-gray-600">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][formData.rating]} Experience
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title (Optional)
                </label>
                <input
                  type="text"
                  value={formData.review_title || ''}
                  onChange={(e) => setFormData({ ...formData, review_title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  placeholder="Summarize your experience in a few words"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  value={formData.review_text || ''}
                  onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-none"
                  rows={5}
                  placeholder="Tell us about your experience. What did you like? What could be improved?"
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 text-right mt-1">
                  {(formData.review_text || '').length}/1000
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Your review may be displayed publicly to help other customers. 
                  Your name will be partially hidden for privacy.
                </p>
              </div>

              {/* Navigation */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('rating')}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Feedback
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component for detailed rating inputs
function RatingInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700 flex-1">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className="w-6 h-6"
              fill={star <= (hover || value) ? '#FBBF24' : 'none'}
              stroke={star <= (hover || value) ? '#FBBF24' : '#D1D5DB'}
              strokeWidth={2}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
