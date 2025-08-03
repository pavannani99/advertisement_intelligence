import React from 'react';
import { CampaignCardProps } from '../types';

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onEdit,
  onView,
  onGenerate
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = () => {
    switch (campaign.status) {
      case 'pending':
        return <span className="status-badge status-pending">Pending</span>;
      case 'ideas_generated':
        return <span className="status-badge status-processing">Ideas Ready</span>;
      case 'ads_generating':
        return <span className="status-badge status-processing">Generating Ads</span>;
      case 'completed':
        return <span className="status-badge status-completed">Completed</span>;
      case 'failed':
        return <span className="status-badge status-failed">Failed</span>;
      default:
        return <span className="status-badge status-pending">Unknown</span>;
    }
  };

  const getMainAction = () => {
    switch (campaign.status) {
      case 'pending':
        return (
          <button 
            onClick={() => onEdit(campaign)}
            className="btn-primary text-sm"
          >
            Continue Setup
          </button>
        );
      case 'ideas_generated':
        return (
          <button 
            onClick={() => onGenerate(campaign)}
            className="btn-primary text-sm"
          >
            Generate Ads
          </button>
        );
      case 'ads_generating':
        return (
          <button 
            onClick={() => onView(campaign)}
            className="btn-secondary text-sm"
          >
            View Progress
          </button>
        );
      case 'completed':
        return (
          <button 
            onClick={() => onView(campaign)}
            className="btn-primary text-sm"
          >
            View Results
          </button>
        );
      case 'failed':
        return (
          <button 
            onClick={() => onEdit(campaign)}
            className="btn-secondary text-sm"
          >
            Retry
          </button>
        );
      default:
        return (
          <button 
            onClick={() => onView(campaign)}
            className="btn-secondary text-sm"
          >
            View
          </button>
        );
    }
  };

  return (
    <div className="campaign-card group">
      {/* Thumbnail */}
      <div className="relative mb-4">
        {campaign.thumbnail_url ? (
          <img
            src={campaign.thumbnail_url}
            alt={campaign.name}
            className="w-full h-32 object-cover rounded-xl"
          />
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 rounded-xl flex items-center justify-center">
            <div className="text-4xl text-accent-cyan/50">📊</div>
          </div>
        )}
        
        {/* Status badge overlay */}
        <div className="absolute top-3 right-3">
          {getStatusBadge()}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-dark-text-primary group-hover:text-accent-cyan transition-colors">
            {campaign.name}
          </h3>
          <p className="text-sm text-dark-text-muted mt-1">
            Created {formatDate(campaign.created_at)}
          </p>
        </div>

        {/* Campaign details */}
        <div className="space-y-2">
          {campaign.product_info && (
            <div className="text-sm">
              <span className="text-dark-text-secondary">Product: </span>
              <span className="text-dark-text-primary">{campaign.product_info.product_name}</span>
            </div>
          )}
          
          {campaign.extracted_keywords && campaign.extracted_keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {campaign.extracted_keywords.slice(0, 3).map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-accent-cyan/10 text-accent-cyan text-xs rounded-lg border border-accent-cyan/20"
                >
                  {keyword}
                </span>
              ))}
              {campaign.extracted_keywords.length > 3 && (
                <span className="px-2 py-1 bg-dark-border text-dark-text-muted text-xs rounded-lg">
                  +{campaign.extracted_keywords.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-dark-border">
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(campaign)}
              className="btn-ghost text-xs"
              title="Edit campaign"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => onView(campaign)}
              className="btn-ghost text-xs"
              title="View details"
            >
              👁️ View
            </button>
          </div>
          
          <div>
            {getMainAction()}
          </div>
        </div>
      </div>

      {/* Progress indicator for generating ads */}
      {campaign.status === 'ads_generating' && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-dark-text-muted mb-2">
            <span>Generating ads...</span>
            <span>~2 min remaining</span>
          </div>
          <div className="w-full bg-dark-border rounded-full h-1">
            <div 
              className="bg-accent-cyan h-1 rounded-full transition-all duration-500"
              style={{ width: '65%' }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignCard;
