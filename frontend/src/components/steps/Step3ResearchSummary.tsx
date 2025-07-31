import React from 'react';
import { TrendingUp, Palette, Eye, Target, ArrowRight, ArrowLeft, Star, BarChart3 } from 'lucide-react';
import { WizardData } from '../AdGenerationWizard';

interface Step3Props {
  data: WizardData;
  onNext: () => void;
  onPrev: () => void;
}

const Step3ResearchSummary: React.FC<Step3Props> = ({ data, onNext, onPrev }) => {
  const researchData = data.researchData;

  if (!researchData) {
    return (
      <div className="animate-fade-in text-center py-12">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Research Data Available</h3>
          <p className="text-gray-600">
            Research was skipped. You can proceed to generate ad ideas or go back to conduct research.
          </p>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={onPrev}
            className="btn-secondary px-6 py-3 flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back to Research</span>
          </button>
          
          <button
            onClick={onNext}
            className="btn-primary px-8 py-3 flex items-center space-x-2"
          >
            <span>Continue to Ad Ideas</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const summary = researchData.summary;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Research Summary</h3>
        <p className="text-gray-600">
          Here's what we discovered about your market and industry trends
        </p>
      </div>

      <div className="space-y-6">
        {/* Product Insights */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <Target className="w-5 h-5 text-primary-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Product Insights</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(summary.product_insights).map(([key, value]) => (
              <div key={key} className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 capitalize mb-1">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="text-gray-900">{String(value)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trending in Category */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Trending in Your Category</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {summary.trending_in_category.map((trend, index) => (
              <span
                key={index}
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {trend}
              </span>
            ))}
          </div>
        </div>

        {/* Trending Themes */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <Eye className="w-5 h-5 text-purple-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Popular Marketing Themes</h4>
          </div>
          <div className="grid gap-4">
            {summary.trending_themes.map((theme, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-gray-900">{theme.theme}</h5>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium text-gray-600">
                      {Math.round(theme.popularity_score * 100)}% popularity
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{theme.description}</p>
                <div className="flex flex-wrap gap-2">
                  {theme.examples.map((example, exIndex) => (
                    <span
                      key={exIndex}
                      className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Color Trends */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <Palette className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Color Trends</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {summary.color_trends.map((color, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-6 h-6 rounded-full border-2 border-gray-200"
                  style={{ backgroundColor: color.toLowerCase() }}
                />
                <span className="text-sm text-gray-700 capitalize">{color}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Style Recommendations */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 text-orange-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Style Recommendations</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {summary.style_recommendations.map((style, index) => (
              <div key={index} className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                <p className="text-orange-800 font-medium">{style}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Competitor Insights */}
        {summary.competitor_insights && (
          <div className="card p-6">
            <div className="flex items-center mb-4">
              <Target className="w-5 h-5 text-red-600 mr-2" />
              <h4 className="text-lg font-semibold text-gray-900">Competitor Insights</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(summary.competitor_insights).map(([key, value]) => (
                <div key={key} className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <p className="text-sm font-medium text-red-700 capitalize mb-1">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="text-red-900">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
        <div className="flex items-start">
          <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-lg font-semibold text-blue-900 mb-2">Ready for Ad Creation</h4>
            <p className="text-blue-800 text-sm">
              Based on this research, we'll now generate personalized ad ideas that align with current trends
              and your target audience preferences. These insights will help create more effective and engaging advertisements.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          className="btn-secondary px-6 py-3 flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        
        <button
          onClick={onNext}
          className="btn-primary px-8 py-3 flex items-center space-x-2"
        >
          <span>Generate Ad Ideas</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Step3ResearchSummary;
