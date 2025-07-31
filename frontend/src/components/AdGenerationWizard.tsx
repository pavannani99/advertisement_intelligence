import React, { useState } from 'react';
import { CheckCircle, Circle, ArrowRight, ArrowLeft } from 'lucide-react';
import Step1ProductInfo from './steps/Step1ProductInfo';
import Step2Research from './steps/Step2Research';
import Step3ResearchSummary from './steps/Step3ResearchSummary';
import Step4AdIdeas from './steps/Step4AdIdeas';
import Step5AdGeneration from './steps/Step5AdGeneration';
import { ProductInfoRequest, ResearchResponse, AdIdea } from '../services/api';

export interface WizardData {
  sessionId?: string;
  productInfo?: ProductInfoRequest;
  researchData?: ResearchResponse;
  selectedIdeas?: AdIdea[];
  companyWebsite?: string;
}

const steps = [
  { id: 1, name: 'Product Info', description: 'Basic product details' },
  { id: 2, name: 'Research', description: 'Market & trend analysis' },
  { id: 3, name: 'Summary', description: 'Research insights' },
  { id: 4, name: 'Ad Ideas', description: 'Creative concepts' },
  { id: 5, name: 'Generation', description: 'Create ads' },
];

const AdGenerationWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateWizardData = (newData: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-200 ${
                currentStep > step.id
                  ? 'bg-green-500 border-green-500 text-white'
                  : currentStep === step.id
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.name}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1ProductInfo
            data={wizardData}
            onNext={(data) => {
              updateWizardData(data);
              nextStep();
            }}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        );
      case 2:
        return (
          <Step2Research
            data={wizardData}
            onNext={(data) => {
              updateWizardData(data);
              nextStep();
            }}
            onPrev={prevStep}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        );
      case 3:
        return (
          <Step3ResearchSummary
            data={wizardData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <Step4AdIdeas
            data={wizardData}
            onNext={(data) => {
              updateWizardData(data);
              nextStep();
            }}
            onPrev={prevStep}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        );
      case 5:
        return (
          <Step5AdGeneration
            data={wizardData}
            onPrev={prevStep}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
            AI Advertisement Generator
          </h2>
          <p className="text-gray-600 text-center">
            Create compelling ads in 4 simple steps with AI-powered insights
          </p>
        </div>

        {renderStepIndicator()}
        
        <div className="min-h-96">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default AdGenerationWizard;
