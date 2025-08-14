import React from 'react';
import { useCart } from '../context/CartContext';

const FeaturedDeals = () => {
  const { addToCart } = useCart();

  const products = [
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      price: 119.99,
      originalPrice: 199.99,
      discount: 40,
      image: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '2',
      name: 'Designer Leather Handbag',
      price: 149.99,
      originalPrice: 299.99,
      discount: 50,
      image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '3',
      name: 'Smart Fitness Watch',
      price: 174.99,
      originalPrice: 249.99,
      discount: 30,
      image: 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '4',
      name: 'Premium Coffee Maker',
      price: 159.99,
      originalPrice: 399.99,
      discount: 60,
      image: 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      discount: product.discount
    });
  };

  return (
    <section id="deals" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Featured Deals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative aspect-square">
                <img
                  src={product.image}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt={product.name}
                />
                <div className="absolute top-3 right-3 bg-[#FF4C4C] text-white px-2 py-1 text-sm font-medium rounded">
                  -{product.discount}%
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium mb-2">{product.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-gray-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-[#FF4C4C] font-semibold">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedDeals;