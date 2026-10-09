/**
 * Service Tips Component
 * Display helpful maintenance tips based on service category
 */

import React, { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, Search, Star } from 'lucide-react';
import { ServiceTip, getTipsByCategory, getTipsForService } from '@/lib/constants/service-tips';

interface ServiceTipsProps {
  serviceCategory: string;
  variant?: 'full' | 'compact' | 'card';
  showSearch?: boolean;
  maxTips?: number;
}

export function ServiceTips({
  serviceCategory,
  variant = 'full',
  showSearch = false,
  maxTips,
}: ServiceTipsProps) {
  const [expandedTips, setExpandedTips] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const allTips = getTipsForService(serviceCategory);
  const displayTips = maxTips ? allTips.slice(0, maxTips) : allTips;

  const toggleTip = (tipId: string) => {
    const newExpanded = new Set(expandedTips);
    if (newExpanded.has(tipId)) {
      newExpanded.delete(tipId);
    } else {
      newExpanded.add(tipId);
    }
    setExpandedTips(newExpanded);
  };

  if (displayTips.length === 0) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Helpful Tips
        </h3>
        <ul className="space-y-2">
          {displayTips[0]?.tips.slice(0, 3).map((tip, idx) => (
            <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayTips.map((tip) => (
          <div
            key={tip.id}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition"
          >
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl">{tip.icon || '💡'}</span>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">{tip.title}</h3>
                <p className="text-sm text-gray-600">{tip.description}</p>
              </div>
            </div>
            <button
              onClick={() => toggleTip(tip.id)}
              className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              {expandedTips.has(tip.id) ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  View Tips ({tip.tips.length})
                </>
              )}
            </button>
            {expandedTips.has(tip.id) && (
              <ul className="mt-3 space-y-2 pt-3 border-t">
                {tip.tips.map((t, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-teal-600 mt-1">✓</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Full variant
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Lightbulb className="w-7 h-7 text-yellow-500" />
          Helpful Maintenance Tips
        </h2>
        {showSearch && (
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tips..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        {displayTips.map((tip) => (
          <div
            key={tip.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition"
          >
            <button
              onClick={() => toggleTip(tip.id)}
              className="w-full p-5 text-left flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-4 flex-1">
                <span className="text-4xl">{tip.icon || '💡'}</span>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1 flex items-center gap-2">
                    {tip.title}
                    {tip.priority === 1 && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </h3>
                  <p className="text-gray-600">{tip.description}</p>
                </div>
              </div>
              {expandedTips.has(tip.id) ? (
                <ChevronUp className="w-6 h-6 text-gray-400" />
              ) : (
                <ChevronDown className="w-6 h-6 text-gray-400" />
              )}
            </button>

            {expandedTips.has(tip.id) && (
              <div className="px-5 pb-5 bg-gray-50">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    {tip.tips.length} Tips:
                  </p>
                  <ul className="space-y-2">
                    {tip.tips.map((t, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="flex-1 pt-0.5">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Service Tips Banner
 * Quick tips display after service completion
 */
interface ServiceTipsBannerProps {
  serviceCategory: string;
  onViewAll?: () => void;
}

export function ServiceTipsBanner({ serviceCategory, onViewAll }: ServiceTipsBannerProps) {
  const tips = getTipsForService(serviceCategory);
  const mainTip = tips[0];

  if (!mainTip) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-yellow-900" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            💡 {mainTip.title}
          </h3>
          <p className="text-gray-700 mb-3">{mainTip.description}</p>
          <ul className="space-y-2 mb-4">
            {mainTip.tips.slice(0, 3).map((tip, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-yellow-600 font-bold">✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-sm font-medium text-teal-600 hover:text-teal-700 underline"
            >
              View all {tips.length} tip sections →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Tips Widget for Dashboard
 */
export function TipsWidget() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  
  // Get featured tips from all categories
  const featuredTips = [
    { icon: '🧹', tip: 'Vacuum carpets twice weekly to prevent dust buildup', category: 'Cleaning' },
    { icon: '🐛', tip: 'Store food in airtight containers to prevent pest access', category: 'Pest Control' },
    { icon: '🔧', tip: 'Check plumbing for leaks monthly to prevent water damage', category: 'Maintenance' },
    { icon: '🌱', tip: 'Water lawn early morning for best absorption', category: 'Landscaping' },
    { icon: '🔒', tip: 'Install deadbolt locks on all exterior doors', category: 'Security' },
  ];

  const currentTip = featuredTips[currentTipIndex];

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % featuredTips.length);
  };

  return (
    <div className="bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Tip of the Day
        </h3>
        <button
          onClick={nextTip}
          className="text-xs font-medium text-teal-600 hover:text-teal-700 px-3 py-1 bg-white rounded-full"
        >
          Next Tip →
        </button>
      </div>
      <div className="flex items-start gap-3">
        <span className="text-3xl">{currentTip.icon}</span>
        <div>
          <span className="inline-block px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-semibold rounded mb-2">
            {currentTip.category}
          </span>
          <p className="text-sm text-gray-700">{currentTip.tip}</p>
        </div>
      </div>
    </div>
  );
}
