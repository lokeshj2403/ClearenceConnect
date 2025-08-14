import React from 'react';
import { Recycle, DollarSign, Store, Tag, Shield, TrendingUp } from 'lucide-react';

const Benefits = () => {
  const benefits = [
    {
      icon: Recycle,
      title: 'Reduce Waste',
      description: 'Help prevent perfectly good products from ending up in landfills by giving them a second chance in the market.',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: DollarSign,
      title: 'Recover Costs',
      description: 'Businesses can recoup investments on slow-moving or excess inventory instead of taking a complete loss.',
      color: 'text-[#FF4C4C]',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Store,
      title: 'Expand Reach',
      description: 'Connect with new customers beyond your usual market and increase brand exposure to bargain hunters.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Tag,
      title: 'Amazing Deals',
      description: 'Shoppers can access premium products at significantly reduced prices, often 40-80% off retail value.',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    },
    {
      icon: Shield,
      title: 'Verified Quality',
      description: 'All products are inspected and verified to ensure they meet our quality standards before listing.',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      icon: TrendingUp,
      title: 'Business Insights',
      description: 'Access detailed analytics on your inventory performance and customer demographics to optimize your strategy.',
      color: 'text-teal-600',
      bgColor: 'bg-teal-100'
    }
  ];

  return (
    <section id="benefits" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Benefits for Everyone
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform creates value for businesses, shoppers, and the environment.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 ${benefit.bgColor} rounded-full flex items-center justify-center mb-4`}>
                <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;