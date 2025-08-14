import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Eye, Star } from 'lucide-react';

const CustomerOrders = ({ onBack }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/users/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data.orders);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Package className="h-5 w-5 text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const response = await fetch(`/api/orders/${orderId}/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            reason: 'Customer requested cancellation'
          })
        });

        if (response.ok) {
          alert('Order cancelled successfully');
          fetchOrders(); // Refresh orders
        } else {
          const error = await response.json();
          alert(`Error: ${error.message}`);
        }
      } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Error cancelling order');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4C4C] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

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
              <span>Back</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <button
              onClick={onBack}
              className="bg-[#FF4C4C] text-white px-6 py-2 rounded-lg hover:bg-[#FF4C4C]/90 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-[#FF4C4C] hover:text-[#FF4C4C]/80 font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Items ({order.items.length})</h4>
                      <div className="space-y-2">
                        {order.items.slice(0, 2).map((item, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <img
                              src={item.image || '/placeholder-image.jpg'}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-sm text-gray-600">
                            +{order.items.length - 2} more items
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                      <div className="text-sm text-gray-600">
                        <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                        <p>{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                        <p>{order.shippingAddress.pincode}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Order Summary</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span>₹{order.subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping:</span>
                          <span>₹{order.shippingCost}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax:</span>
                          <span>₹{order.tax}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t">
                          <span>Total:</span>
                          <span>₹{order.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      {order.shipping?.trackingNumber && (
                        <p className="text-sm text-gray-600">
                          Tracking: <span className="font-medium">{order.shipping.trackingNumber}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {(order.status === 'pending' || order.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <button className="px-4 py-2 bg-[#FF4C4C] text-white rounded-lg hover:bg-[#FF4C4C]/90 transition-colors">
                          Rate & Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Order Details - #{selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status Timeline */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Order Timeline</h4>
                <div className="space-y-3">
                  {selectedOrder.timeline?.map((event, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#FF4C4C] rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{event.message}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Items Ordered</h4>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={item.image || '/placeholder-image.jpg'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{item.name}</h5>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-600">Price: ₹{item.price} each</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹{item.total}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                    <p>{selectedOrder.shippingAddress.email}</p>
                    <p>{selectedOrder.shippingAddress.phone}</p>
                    <p>{selectedOrder.shippingAddress.street}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                    <p>{selectedOrder.shippingAddress.pincode}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Payment Information</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Method: {selectedOrder.payment.method.toUpperCase()}</p>
                    <p>Status: {selectedOrder.payment.status}</p>
                    {selectedOrder.payment.transactionId && (
                      <p>Transaction ID: {selectedOrder.payment.transactionId}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;