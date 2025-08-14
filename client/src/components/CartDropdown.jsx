import React from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartDropdown = ({ onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-600">Add some items to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">
          Shopping Cart ({cartItems.reduce((total, item) => total + item.quantity, 0)})
        </h3>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {cartItems.map((item) => (
          <div key={item.id} className="p-4 border-b border-gray-100">
            <div className="flex gap-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-[#FF4C4C] font-medium">
                    ${item.price.toFixed(2)}
                  </span>
                  {item.originalPrice > item.price && (
                    <span className="text-sm text-gray-500 line-through">
                      ${item.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Subtotal</span>
          <span className="text-sm font-medium text-gray-900">
            ${getCartTotal().toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Shipping</span>
          <span className="text-sm font-medium text-gray-900">Free</span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2">
        <button className="w-full bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
          View Cart
        </button>
        <button className="w-full bg-[#FF4C4C] text-white py-2 rounded-lg font-medium hover:bg-[#FF4C4C]/90 transition-colors">
          Checkout
        </button>
      </div>
    </div>
  );
};

export default CartDropdown;