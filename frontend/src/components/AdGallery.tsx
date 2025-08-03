import React, { useState } from 'react';
import { AdGalleryProps } from '../types';

const AdGallery: React.FC<AdGalleryProps> = ({
  ads,
  onDownload,
  onShare,
  onRegenerate,
  loading = false
}) => {
  const [selectedAds, setSelectedAds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const toggleAdSelection = (jobId: string) => {
    const newSelected = new Set(selectedAds);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedAds(newSelected);
  };

  const selectAll = () => {
    if (selectedAds.size === ads.length) {
      setSelectedAds(new Set());
    } else {
      setSelectedAds(new Set(ads.map(ad => ad.job_id)));
    }
  };

  const downloadSelected = () => {
    ads.filter(ad => selectedAds.has(ad.job_id))
       .forEach(ad => onDownload(ad));
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (ads.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-dark-text-primary">
            Generated Ads ({ads.length})
          </h2>
          
          {ads.length > 0 && (
            <button
              onClick={selectAll}
              className="btn-ghost text-sm"
            >
              {selectedAds.size === ads.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {selectedAds.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-dark-text-secondary">
                {selectedAds.size} selected
              </span>
              <button
                onClick={downloadSelected}
                className="btn-secondary text-sm"
              >
                📥 Download Selected
              </button>
            </div>
          )}

          {/* View mode toggle */}
          <div className="flex items-center bg-dark-surface rounded-lg p-1 border border-dark-border">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                viewMode === 'grid'
                  ? 'bg-accent-cyan text-dark-bg'
                  : 'text-dark-text-secondary hover:text-dark-text-primary'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                viewMode === 'list'
                  ? 'bg-accent-cyan text-dark-bg'
                  : 'text-dark-text-secondary hover:text-dark-text-primary'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Ad grid/list */}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
      }>
        {ads.map((ad) => (
          <AdCard
            key={ad.job_id}
            ad={ad}
            isSelected={selectedAds.has(ad.job_id)}
            onSelect={() => toggleAdSelection(ad.job_id)}
            onDownload={() => onDownload(ad)}
            onShare={() => onShare(ad)}
            onRegenerate={() => onRegenerate(ad)}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
};

// Individual Ad Card Component
interface AdCardProps {
  ad: any;
  isSelected: boolean;
  onSelect: () => void;
  onDownload: () => void;
  onShare: () => void;
  onRegenerate: () => void;
  viewMode: 'grid' | 'list';
}

const AdCard: React.FC<AdCardProps> = ({
  ad,
  isSelected,
  onSelect,
  onDownload,
  onShare,
  onRegenerate,
  viewMode
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getStatusDisplay = () => {
    switch (ad.status) {
      case 'processing':
        return (
          <div className="flex items-center text-accent-cyan text-sm">
            <div className="animate-spin w-4 h-4 border-2 border-accent-cyan border-t-transparent rounded-full mr-2"></div>
            Processing...
          </div>
        );
      case 'failed':
        return <span className="status-badge status-failed">Failed</span>;
      case 'completed':
      default:
        return <span className="status-badge status-completed">Ready</span>;
    }
  };

  if (viewMode === 'list') {
    return (
      <div className={`card p-4 ${isSelected ? 'ring-2 ring-accent-cyan' : ''}`}>
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-4 h-4 text-accent-cyan bg-dark-surface border-dark-border rounded"
          />
          
          <div className="w-20 h-20 flex-shrink-0">
            {ad.status === 'completed' && !imageError ? (
              <img
                src={ad.image_url}
                alt="Generated ad"
                className="w-full h-full object-cover rounded-lg"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-dark-border rounded-lg flex items-center justify-center">
                📊
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-dark-text-primary">
                  Ad #{ad.job_id.slice(-6)}
                </h4>
                <p className="text-sm text-dark-text-muted">
                  Created {new Date(ad.created_at).toLocaleDateString()}
                </p>
              </div>
              {getStatusDisplay()}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {ad.status === 'completed' && (
              <>
                <button
                  onClick={onDownload}
                  className="btn-ghost text-sm"
                  title="Download"
                >
                  📥
                </button>
                <button
                  onClick={onShare}
                  className="btn-ghost text-sm"
                  title="Share"
                >
                  📤
                </button>
              </>
            )}
            <button
              onClick={onRegenerate}
              className="btn-ghost text-sm"
              title="Regenerate"
            >
              🔄
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`image-card ${isSelected ? 'ring-2 ring-accent-cyan' : ''}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="absolute top-3 left-3 w-4 h-4 text-accent-cyan bg-dark-surface border-dark-border rounded z-10"
        />

        {ad.status === 'completed' && !imageError ? (
          <div className="relative">
            <img
              src={ad.image_url}
              alt="Generated ad"
              className="w-full h-48 object-cover rounded-xl"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            
            {/* Overlay actions */}
            <div className="image-overlay">
              <div className="flex space-x-3">
                <button
                  onClick={onDownload}
                  className="btn-primary"
                  title="Download"
                >
                  📥 Download
                </button>
                <button
                  onClick={onShare}
                  className="btn-secondary"
                  title="Share"
                >
                  📤 Share
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-48 bg-dark-border rounded-xl flex items-center justify-center">
            {ad.status === 'processing' ? (
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-accent-cyan">Generating...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl text-dark-text-muted mb-2">📊</div>
                <p className="text-sm text-dark-text-muted">Image Error</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-dark-text-primary">
            Ad #{ad.job_id.slice(-6)}
          </h4>
          {getStatusDisplay()}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-dark-text-muted">
            {new Date(ad.created_at).toLocaleDateString()}
          </span>
          <button
            onClick={onRegenerate}
            className="btn-ghost text-sm"
            title="Regenerate this ad"
          >
            🔄 Regenerate
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading skeleton component
const LoadingSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="skeleton h-8 w-48 rounded-lg"></div>
      <div className="skeleton h-10 w-32 rounded-lg"></div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="card p-4">
          <div className="skeleton h-48 w-full rounded-xl mb-4"></div>
          <div className="skeleton h-4 w-3/4 rounded mb-2"></div>
          <div className="skeleton h-4 w-1/2 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

// Empty state component
const EmptyState: React.FC = () => (
  <div className="text-center py-16">
    <div className="text-6xl mb-4">🎨</div>
    <h3 className="text-xl font-semibold text-dark-text-primary mb-2">
      No ads generated yet
    </h3>
    <p className="text-dark-text-secondary max-w-md mx-auto">
      Once you generate ads from your campaign ideas, they'll appear here. 
      You can then download, share, or regenerate them as needed.
    </p>
  </div>
);

export default AdGallery;
