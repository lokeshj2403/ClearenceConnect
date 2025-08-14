import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Eye, Package, TrendingUp, DollarSign, ShoppingCart, Upload, X, Star } from 'lucide-react';

const SellerDashboard = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSold: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    originalPrice: '',
    salePrice: '',
    category: '',
    stock: '',
    clearanceReason: '',
    condition: 'new',
    images: [],
    video: null
  });

  const categories = [
    'Electronics & Technology',
    'Fashion & Apparel', 
    'Home & Living',
    'Health & Beauty',
    'Sports & Outdoors',
    'Books & Media',
    'Automotive',
    'Industrial Equipment',
    'Food & Beverages',
    'Toys & Games'
  ];

  const clearanceReasons = [
    { value: 'overstock', label: 'Overstock' },
    { value: 'seasonal', label: 'Seasonal' },
    { value: 'discontinued', label: 'Discontinued' },
    { value: 'damaged_packaging', label: 'Damaged Packaging' },
    { value: 'return', label: 'Return' },
    { value: 'other', label: 'Other' }
  ];

  // Fetch seller data on component mount
  useEffect(() => {
    fetchSellerData();
  }, []);

  const fetchSellerData = async () => {
    try {
      // Fetch seller dashboard data
      const dashboardResponse = await fetch('/api/sellers/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        setStats(dashboardData.data.stats);
      }

      // Fetch seller products
      const productsResponse = await fetch('/api/sellers/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData.data.products);
      }

      // Fetch transaction history
      const transactionsResponse = await fetch('/api/sellers/transactions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching seller data:', error);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newProduct.images.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewProduct(prev => ({
          ...prev,
          images: [...prev.images, { file, url: e.target.result }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewProduct(prev => ({
          ...prev,
          video: { file, url: e.target.result }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeVideo = () => {
    setNewProduct(prev => ({
      ...prev,
      video: null
    }));
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    
    if (newProduct.images.length === 0) {
      alert('At least one image is required');
      return;
    }

    try {
      const formData = new FormData();
      
      // Add product data
      Object.keys(newProduct).forEach(key => {
        if (key !== 'images' && key !== 'video') {
          formData.append(key, newProduct[key]);
        }
      });

      // Add images
      newProduct.images.forEach((image, index) => {
        formData.append('images', image.file);
      });

      // Add video if exists
      if (newProduct.video) {
        formData.append('video', newProduct.video.file);
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        alert('Product added successfully!');
        setShowAddProduct(false);
        setNewProduct({
          name: '',
          description: '',
          originalPrice: '',
          salePrice: '',
          category: '',
          stock: '',
          clearanceReason: '',
          condition: 'new',
          images: [],
          video: null
        });
        fetchSellerData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          alert('Product deleted successfully!');
          fetchSellerData(); // Refresh data
        } else {
          const error = await response.json();
          alert(`Error: ${error.message}`);
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      }
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sold</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSold}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue?.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-[#FF4C4C]" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="p-6">
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.productName}</p>
                    <p className="text-sm text-gray-600">Order #{transaction.orderId}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">₹{transaction.amount}</p>
                    <p className="text-sm text-gray-600">{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No transactions yet</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">My Products</h3>
        <button
          onClick={() => setShowAddProduct(true)}
          className="bg-[#FF4C4C] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#FF4C4C]/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="aspect-square relative">
              <img
                src={product.images[0]?.url || '/placeholder-image.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => handleDeleteProduct(product._id)}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-2">{product.name}</h4>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-400 line-through text-sm">₹{product.originalPrice}</span>
                <span className="text-[#FF4C4C] font-semibold">₹{product.salePrice}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Stock: {product.stock?.quantity || 0}</span>
                <span>Sold: {product.analytics?.purchases || 0}</span>
              </div>
              <div className="mt-2">
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No products added yet</p>
          <button
            onClick={() => setShowAddProduct(true)}
            className="mt-4 bg-[#FF4C4C] text-white px-6 py-2 rounded-lg hover:bg-[#FF4C4C]/90 transition-colors"
          >
            Add Your First Product
          </button>
        </div>
      )}
    </div>
  );

  const renderTransactions = () => (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{transaction.orderId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.productName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{transaction.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );

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
            <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'transactions', label: 'Transactions', icon: DollarSign }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#FF4C4C] text-[#FF4C4C]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'transactions' && renderTransactions()}
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Add New Product</h3>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitProduct} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price *
                  </label>
                  <input
                    type="number"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({...newProduct, originalPrice: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Price *
                  </label>
                  <input
                    type="number"
                    value={newProduct.salePrice}
                    onChange={(e) => setNewProduct({...newProduct, salePrice: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clearance Reason *
                  </label>
                  <select
                    value={newProduct.clearanceReason}
                    onChange={(e) => setNewProduct({...newProduct, clearanceReason: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                    required
                  >
                    <option value="">Select Reason</option>
                    {clearanceReasons.map((reason) => (
                      <option key={reason.value} value={reason.value}>{reason.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                  rows={4}
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images * (Max 5 images)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="images"
                  />
                  <label htmlFor="images" className="cursor-pointer text-[#FF4C4C] hover:text-[#FF4C4C]/80">
                    Click to upload images
                  </label>
                </div>
                
                {newProduct.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {newProduct.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image.url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Video (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video"
                  />
                  <label htmlFor="video" className="cursor-pointer text-[#FF4C4C] hover:text-[#FF4C4C]/80">
                    Click to upload video
                  </label>
                </div>
                
                {newProduct.video && (
                  <div className="mt-4 relative">
                    <video
                      src={newProduct.video.url}
                      className="w-full h-48 object-cover rounded-lg"
                      controls
                    />
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#FF4C4C] text-white rounded-lg hover:bg-[#FF4C4C]/90 transition-colors"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;