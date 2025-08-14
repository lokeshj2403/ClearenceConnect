import React from 'react';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Emily Richardson',
      role: 'Fashion Retailer',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      text: 'Clearance Connect has been a game-changer for our seasonal inventory management. We\'ve recovered over 60% of our costs on last season\'s collection that would have otherwise sat in our warehouse.',
      rating: 5
    },
    {
      name: 'David Chen',
      role: 'Electronics Distributor',
      image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100',
      text: 'The dashboard makes it incredibly easy to manage our clearance inventory. We\'ve been able to move products that had been sitting for months within days of listing them on ClearStock.',
      rating: 5
    },
    {
      name: 'Jasmine Williams',
      role: 'Bargain Shopper',
      image: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=100',
      text: 'I\'ve found incredible deals on ClearStock that I couldn\'t find anywhere else. The quality of products is excellent, and I love knowing I\'m helping reduce waste while saving money.',
      rating: 5
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what businesses and shoppers
            are saying about Clearance Connect.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "{testimonial.text}"
              </p>
              <div className="flex text-yellow-400">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;