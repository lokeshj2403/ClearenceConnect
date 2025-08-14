import React from 'react';
import { Store, Users, MapPin } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              About Clearance Connect
            </h2>
            <p className="text-gray-700 mb-4">
              Clearance Connect was founded in 2024 with a simple mission: to create a
              win-win marketplace that helps businesses recover value from
              excess inventory while offering shoppers incredible deals on
              quality products.
            </p>
            <p className="text-gray-700 mb-4">
              Our team of retail and e-commerce experts has built a platform
              that makes it easy for businesses of all sizes to list and sell
              their clearance items, overstock, returns, and end-of-season
              products.
            </p>
            <p className="text-gray-700 mb-6">
              We're committed to sustainability and reducing waste in the retail
              supply chain. By giving products a second chance to find a home,
              we're helping to create a more circular economy.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <Store className="h-6 w-6 text-[#FF4C4C]" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">5,000+</h4>
                  <p className="text-sm text-gray-600">Registered Sellers</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">250,000+</h4>
                  <p className="text-sm text-gray-600">Happy Customers</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                  <MapPin className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">12</h4>
                  <p className="text-sm text-gray-600">States Served</p>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow-md">
            <img
              src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Clearance Connect Team"
              className="w-full h-96 object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;