import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, Grid, List, Star, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ShoppingPage = ({ onBack }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();

  const categories = [
    { id: 'all', name: 'All Categories', count: 8567 },
    { id: 'electronics', name: 'Electronics', count: 1234 },
    { id: 'fashion', name: 'Fashion', count: 2567 },
    { id: 'home', name: 'Home & Living', count: 1890 },
    { id: 'books', name: 'Books', count: 876 },
    { id: 'sports', name: 'Sports & Outdoors', count: 654 },
    { id: 'beauty', name: 'Beauty & Health', count: 432 }
  ];

  const products = [
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      price: 119.99,
      originalPrice: 199.99,
      discount: 40,
      rating: 4.5,
      reviews: 128,
      image: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'electronics',
      seller: 'TechGear Pro',
      inStock: true
    },
    {
      id: '2',
      name: 'Designer Leather Handbag',
      price: 149.99,
      originalPrice: 299.99,
      discount: 50,
      rating: 4.8,
      reviews: 89,
      image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'fashion',
      seller: 'Fashion House',
      inStock: true
    },
    {
      id: '3',
      name: 'Smart Fitness Watch',
      price: 174.99,
      originalPrice: 249.99,
      discount: 30,
      rating: 4.3,
      reviews: 256,
      image: 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'electronics',
      seller: 'FitTech Solutions',
      inStock: true
    },
    {
      id: '4',
      name: 'Premium Coffee Maker',
      price: 159.99,
      originalPrice: 399.99,
      discount: 60,
      rating: 4.6,
      reviews: 167,
      image: 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'home',
      seller: 'Kitchen Essentials',
      inStock: true
    },
    {
      id: '5',
      name: 'Organic Cotton T-Shirt Set',
      price: 29.99,
      originalPrice: 59.99,
      discount: 50,
      rating: 4.4,
      reviews: 94,
      image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'fashion',
      seller: 'EcoWear',
      inStock: true
    },
    {
      id: '6',
      name: 'Bluetooth Speaker',
      price: 79.99,
      originalPrice: 129.99,
      discount: 38,
      rating: 4.2,
      reviews: 203,
      image: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'electronics',
      seller: 'AudioMax',
      inStock: true
    }
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-[#FF4C4C] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">Shop Clearance Deals</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-[#FF4C4C] text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{category.name}</span>
                      <span className="text-sm opacity-75">({category.count})</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Range</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                    />
                  </div>
                  <button className="w-full bg-[#FF4C4C] text-white py-2 rounded-lg hover:bg-[#FF4C4C]/90 transition-colors">
                    Apply Filter
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Controls */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest</option>
                  </select>
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-[#FF4C4C] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      <Grid className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-[#FF4C4C] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      <List className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  {viewMode === 'grid' ? (
                    <>
                      <div className="relative aspect-square">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 bg-[#FF4C4C] text-white px-2 py-1 text-sm font-medium rounded">
                          -{product.discount}%
                        </div>
                        <button className="absolute top-3 left-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                          <Heart className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">by {product.seller}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(product.rating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">({product.reviews})</span>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-gray-400 line-through text-sm">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                          <span className="text-[#FF4C4C] font-semibold text-lg">
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
                    </>
                  ) : (
                    <div className="flex gap-4 p-4">
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute top-2 right-2 bg-[#FF4C4C] text-white px-2 py-1 text-xs font-medium rounded">
                          -{product.discount}%
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">by {product.seller}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(product.rating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">({product.reviews})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 line-through text-sm">
                              ${product.originalPrice.toFixed(2)}
                            </span>
                            <span className="text-[#FF4C4C] font-semibold text-lg">
                              ${product.price.toFixed(2)}
                            </span>
                          </div>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center">
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Previous
                </button>
                {[1, 2, 3, 4, 5].map((page) => (
                  <button
                    key={page}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      page === 1
                        ? 'bg-[#FF4C4C] text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingPage;