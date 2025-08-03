import React, { useState } from 'react';
import { Globe, Search, ArrowRight, ArrowLeft, Loader2, Link, Plus, X } from 'lucide-react';
import { WizardData } from '../AdGenerationWizard';
import { ResearchRequest, apiService } from '../../services/api';

interface Step2Props {
  data: WizardData;
  onNext: (data: WizardData) => void;
  onPrev: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const Step2Research: React.FC<Step2Props> = ({ data, onNext, onPrev, isLoading, setIsLoading }) => {
  const [formData, setFormData] = useState({
    company_website: data.companyWebsite || '',
    additional_sources: [] as string[],
  });
  const [newSource, setNewSource] = useState('');

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const addAdditionalSource = () => {
    if (newSource.trim() && isValidUrl(newSource.trim())) {
      setFormData(prev => ({
        ...prev,
        additional_sources: [...prev.additional_sources, newSource.trim()]
      }));
      setNewSource('');
    }
  };

  const removeSource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additional_sources: prev.additional_sources.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data.sessionId) {
      console.error('No session ID available');
      return;
    }

    setIsLoading(true);
    try {
      const requestData: ResearchRequest = {
        session_id: data.sessionId,
        company_website: formData.company_website || undefined,
        additional_sources: formData.additional_sources.length > 0 ? formData.additional_sources : undefined,
      };

      const response = await apiService.conductResearch(requestData);
      onNext({
        researchData: response,
        companyWebsite: formData.company_website,
      });
    } catch (error) {
      console.error('Error conducting research:', error);
      // Handle error - could show toast notification
    } finally {
      setIsLoading(false);
    }
  };

  const skipResearch = () => {
    onNext({
      companyWebsite: formData.company_website,
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Research & Analysis</h3>
        <p className="text-gray-600">
          Help us understand your market better by providing your website and additional sources
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Website */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <Globe className="w-5 h-5 text-primary-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Company Website</h4>
            <span className="ml-2 text-sm text-gray-500">(Highly Recommended)</span>
          </div>
          <p className="text-gray-600 mb-4">
            We'll analyze your website to understand your brand, products, and messaging for better ad generation.
          </p>
          <input
            type="url"
            value={formData.company_website}
            onChange={(e) => setFormData(prev => ({ ...prev, company_website: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="https://yourcompany.com"
          />
        </div>

        {/* Additional Sources */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <Link className="w-5 h-5 text-primary-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Additional Sources</h4>
            <span className="ml-2 text-sm text-gray-500">(Optional)</span>
          </div>
          <p className="text-gray-600 mb-4">
            Add competitor websites, industry reports, or other relevant sources for deeper insights.
          </p>
          
          {/* Add new source */}
          <div className="flex gap-2 mb-4">
            <input
              type="url"
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="https://competitor.com or https://industry-report.com"
            />
            <button
              type="button"
              onClick={addAdditionalSource}
              disabled={!newSource.trim() || !isValidUrl(newSource.trim())}
              className="btn-secondary px-4 py-2 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </button>
          </div>

          {/* List of added sources */}
          {formData.additional_sources.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-700">Added Sources:</h5>
              {formData.additional_sources.map((source, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="text-sm text-gray-700 truncate flex-1 mr-2">{source}</span>
                  <button
                    type="button"
                    onClick={() => removeSource(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Research Benefits */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <Search className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h4 className="text-lg font-semibold text-blue-900 mb-2">What we'll research for you:</h4>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Current trends in your product category</li>
                <li>• Popular marketing themes and styles in your industry</li>
                <li>• Color trends and visual preferences for your target demographic</li>
                <li>• Competitor analysis and market positioning insights</li>
                <li>• Social media trends relevant to your business</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onPrev}
            className="btn-secondary px-6 py-3 flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={skipResearch}
              className="btn-secondary px-6 py-3"
              disabled={isLoading}
            >
              Skip Research
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary px-8 py-3 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Researching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Start Research</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Step2Research;
