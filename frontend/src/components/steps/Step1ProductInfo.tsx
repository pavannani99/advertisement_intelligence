import React, { useState } from 'react';
import { Building2, Package, Target, MapPin, Users, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { WizardData } from '../AdGenerationWizard';
import { ProductInfoRequest, apiService } from '../../services/api';

interface Step1Props {
  data: WizardData;
  onNext: (data: WizardData) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const Step1ProductInfo: React.FC<Step1Props> = ({ data, onNext, isLoading, setIsLoading }) => {
  const [formData, setFormData] = useState<ProductInfoRequest>({
    product_name: data.productInfo?.product_name || '',
    product_type: data.productInfo?.product_type || '',
    company_name: data.productInfo?.company_name || '',
    advertising_focus: data.productInfo?.advertising_focus || 'product',
    offer_details: data.productInfo?.offer_details || '',
    business_type: data.productInfo?.business_type || '',
    business_location: data.productInfo?.business_location || '',
    target_location: data.productInfo?.target_location || '',
    target_demographic: data.productInfo?.target_demographic || '',
    target_age_group: data.productInfo?.target_age_group || '',
  });

  const [errors, setErrors] = useState<Partial<ProductInfoRequest>>({});

  const validateForm = () => {
    const newErrors: Partial<ProductInfoRequest> = {};
    
    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required';
    }
    
    if (!formData.product_type.trim()) {
      newErrors.product_type = 'Product type is required';
    }
    
    if (formData.advertising_focus === 'offer' && !formData.offer_details?.trim()) {
      newErrors.offer_details = 'Offer details are required when focus is offer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await apiService.submitProductInfo(formData);
      onNext({
        sessionId: response.session_id,
        productInfo: formData,
      });
    } catch (error) {
      console.error('Error submitting product info:', error);
      // Handle error - could show toast notification
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProductInfoRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your product</h3>
        <p className="text-gray-600">
          Provide basic information about your product and target audience to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Company Name - Required */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4 mr-2 text-primary-600" />
              Company Name *
            </label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                errors.company_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., TechCorp, Fashion Boutique"
            />
            {errors.company_name && (
              <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
            )}
          </div>

          {/* Product Type - Required */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Package className="w-4 h-4 mr-2 text-primary-600" />
              Product Type *
            </label>
            <input
              type="text"
              value={formData.product_type}
              onChange={(e) => handleInputChange('product_type', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                errors.product_type ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Smartphone, Clothing, Software"
            />
            {errors.product_type && (
              <p className="mt-1 text-sm text-red-600">{errors.product_type}</p>
            )}
          </div>

          {/* Product Name - Optional */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Package className="w-4 h-4 mr-2 text-gray-400" />
              Product Name
            </label>
            <input
              type="text"
              value={formData.product_name}
              onChange={(e) => handleInputChange('product_name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="e.g., iPhone 15, Summer Collection"
            />
          </div>

          {/* Advertising Focus */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Target className="w-4 h-4 mr-2 text-primary-600" />
              Advertising Focus
            </label>
            <select
              value={formData.advertising_focus}
              onChange={(e) => handleInputChange('advertising_focus', e.target.value as 'company' | 'product' | 'offer')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            >
              <option value="company">Company Brand</option>
              <option value="product">Specific Product</option>
              <option value="offer">Special Offer</option>
            </select>
          </div>

          {/* Offer Details - Show only if focus is offer */}
          {formData.advertising_focus === 'offer' && (
            <div className="md:col-span-2">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Target className="w-4 h-4 mr-2 text-primary-600" />
                Offer Details *
              </label>
              <textarea
                value={formData.offer_details}
                onChange={(e) => handleInputChange('offer_details', e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.offer_details ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe your special offer, discount, or promotion..."
              />
              {errors.offer_details && (
                <p className="mt-1 text-sm text-red-600">{errors.offer_details}</p>
              )}
            </div>
          )}

          {/* Business Type */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4 mr-2 text-gray-400" />
              Business Type
            </label>
            <select
              value={formData.business_type}
              onChange={(e) => handleInputChange('business_type', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            >
              <option value="">Select business type</option>
              <option value="e-commerce">E-commerce</option>
              <option value="retail">Retail</option>
              <option value="saas">SaaS/Software</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="finance">Finance</option>
              <option value="food">Food & Beverage</option>
              <option value="travel">Travel & Tourism</option>
              <option value="real-estate">Real Estate</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Business Location */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              Business Location
            </label>
            <input
              type="text"
              value={formData.business_location}
              onChange={(e) => handleInputChange('business_location', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="e.g., New York, USA"
            />
          </div>

          {/* Target Location */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              Target Location
            </label>
            <input
              type="text"
              value={formData.target_location}
              onChange={(e) => handleInputChange('target_location', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="e.g., Global, North America, Urban areas"
            />
          </div>

          {/* Target Demographic */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 mr-2 text-gray-400" />
              Target Demographic
            </label>
            <input
              type="text"
              value={formData.target_demographic}
              onChange={(e) => handleInputChange('target_demographic', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="e.g., Tech enthusiasts, Working professionals"
            />
          </div>

          {/* Target Age Group */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              Target Age Group
            </label>
            <select
              value={formData.target_age_group}
              onChange={(e) => handleInputChange('target_age_group', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            >
              <option value="">Select age group</option>
              <option value="13-17">13-17 (Gen Z Teens)</option>
              <option value="18-24">18-24 (Gen Z Young Adults)</option>
              <option value="25-34">25-34 (Millennials)</option>
              <option value="35-44">35-44 (Gen X)</option>
              <option value="45-54">45-54 (Gen X)</option>
              <option value="55-64">55-64 (Baby Boomers)</option>
              <option value="65+">65+ (Seniors)</option>
              <option value="all">All Age Groups</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary px-8 py-3 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Continue to Research</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step1ProductInfo;
