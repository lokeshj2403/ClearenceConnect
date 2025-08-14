import React from 'react';
import { Store, ShoppingBag, Truck, CheckCircle } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Store,
      title: 'For Businesses',
      description: 'Register your business, list your excess inventory, set your prices, and start selling immediately.',
      features: [
        'Easy inventory management',
        'Secure payment processing',
        'Detailed analytics dashboard'
      ],
      buttonText: 'Start Selling',
      buttonColor: 'bg-[#FF4C4C]'
    },
    {
      icon: ShoppingBag,
      title: 'For Shoppers',
      description: 'Browse thousands of discounted products from trusted businesses and save up to 80% off retail prices.',
      features: [
        'Verified seller ratings',
        'Secure checkout process',
        'Customer protection guarantee'
      ],
      buttonText: 'Start Shopping',
      buttonColor: 'bg-[#FF4C4C]'
    },
    {
      icon: Truck,
      title: 'Fulfillment & Support',
      description: 'We handle the logistics, customer service, and payment processing to make the experience seamless.',
      features: [
        'Integrated shipping solutions',
        '24/7 customer support',
        'Dispute resolution services'
      ],
      buttonText: 'Learn More',
      buttonColor: 'bg-[#FF4C4C]'
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How Clearance Connect Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform connects businesses with excess inventory to customers
            looking for great deals. Here's how it works:
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <step.icon className="h-8 w-8 text-[#FF4C4C]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {step.description}
              </p>
              <ul className="text-left text-gray-600 space-y-2 mb-6">
                {step.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-[#FF4C4C] mt-0.5 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className={`${step.buttonColor} text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity`}>
                {step.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;