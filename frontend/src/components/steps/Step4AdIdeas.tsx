import React, { useState } from 'react';
import { Lightbulb, ArrowRight, ArrowLeft, Loader2, Settings, CheckCircle } from 'lucide-react';
import { WizardData } from '../AdGenerationWizard';
import { apiService, AdIdea, AdCustomizationOptions, GenerateIdeasRequest } from '../../services/api';

interface Step4Props {
  data: WizardData;
  onNext: (data: WizardData) => void;
  onPrev: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const Step4AdIdeas: React.FC<Step4Props> = ({ data, onNext, onPrev, isLoading, setIsLoading }) => {
  const [adIdeas, setAdIdeas] = useState<AdIdea[]>([]);
  const [customizationOptions, setCustomizationOptions] = useState<AdCustomizationOptions>({});

  const handleChange = (field: keyof AdCustomizationOptions, value: any) => {
    setCustomizationOptions(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!data.sessionId) return;
    setIsLoading(true);
    try {
      const requestData: GenerateIdeasRequest = {
        session_id: data.sessionId,
        customization: customizationOptions
      };
      const response = await apiService.generateIdeas(requestData);
      setAdIdeas(response.ideas);
      onNext({
        selectedIdeas: response.ideas
      });
    } catch (error) {
      console.error('Error generating ad ideas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Ad Creation Ideas</h3>
        <p className="text-gray-600">
          Here are the inspired ad ideas that align with your preferences and research.
        </p>
      </div>

      <div className="space-y-6">
        {adIdeas.length === 0 ? (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="btn-primary px-8 py-3 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Ideas...</span>
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4" />
                <span>Generate Ideas</span>
              </>
            )}
          </button>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {adIdeas.map((idea) => (
              <div key={idea.id} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{idea.name}</h4>
                <p className="text-sm text-gray-700 mb-2">{idea.description}</p>
                <div className="flex flex-wrap gap-2">
                  {idea.key_elements.map((element, index) => (
                    <span
                      key={index}
                      className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                      {element}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Customization Options */}
        {!isLoading && adIdeas.length > 0 && (
          <div className="space-y-4">
            <form className="card p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Customization Options (Experimental)
              </h4>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <input
                      type="checkbox"
                      checked={customizationOptions.include_text}
                      onChange={(e) => handleChange('include_text', e.target.checked)}
                      className="form-checkbox h-5 w-5 text-primary-600 rounded"
                    />
                    <span className="ml-2">Include Text Content</span>
                  </label>
                  {customizationOptions.include_text && (
                    <input
                      type="text"
                      value={customizationOptions.text_content || ''}
                      onChange={(e) => handleChange('text_content', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="Enter your custom text..."
                    />
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    Preferred Theme
                  </label>
                  <select
                    value={customizationOptions.preferred_theme || ''}
                    onChange={(e) => handleChange('preferred_theme', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  >
                    <option value="">Select a theme</option>
                    <option value="cartoonish">Cartoonish</option>
                    <option value="realistic">Realistic</option>
                    <option value="anime">Anime</option>
                    <option value="surreal">Surreal</option>
                    <option value="abstract">Abstract</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    Avoid Elements
                  </label>
                  <input
                    type="text"
                    value={customizationOptions.avoid_elements?.join(', ') || ''}
                    onChange={(e) => handleChange('avoid_elements', e.target.value.split(',').map(el => el.trim()))}
                    placeholder="Separated by commas, e.g., cars, dogs"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>
            </form>
          </div>
        )}
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
          type="button"
          onClick={() => {
            if (adIdeas.length > 0) {
              onNext({ selectedIdeas: adIdeas });
            } else {
              handleSubmit();
            }
          }}
          disabled={isLoading}
          className="btn-primary px-8 py-3 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : adIdeas.length > 0 ? (
            <>
              <ArrowRight className="w-5 h-5" />
              <span>Proceed to Ad Generation</span>
            </>
          ) : (
            <>
              <Lightbulb className="w-5 h-5" />
              <span>Generate Ideas</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Step4AdIdeas;
