import React, { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter submission
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Stay Updated
        </h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Subscribe to our newsletter to receive the latest deals, seller
          announcements, and platform updates.
        </p>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF4C4C] focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="bg-[#FF4C4C] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#FF4C4C]/90 transition-colors"
            >
              Subscribe
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            By subscribing, you agree to receive marketing emails from
            Clearance Connect. You can unsubscribe at any time.
          </p>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;