import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCart, addToCart, removeFromCart, clearCart } from "@/services/api";
import type { ICartItem } from "@/models/type";

const CartPage: React.FC = () => {
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;
  const userId = user ? user.id : null;
  const [cartItems, setCartItems] = useState<ICartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const fetchCart = async () => {
    if (!userId) return;
    try {
      const data = await getCart(userId);
      setCartItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [userId]);

  const handleIncrease = async (item: ICartItem) => {
    if (!item.products) return;
    if (item.quantity >= (item.products.stock || 0)) return;

    await addToCart({
      user_id: userId!,
      product_id: item.product_id,
      quantity: 1,
    });
    fetchCart();
  };

  const handleDecrease = async (item: ICartItem) => {
    if (item.quantity <= 1) return;
    await removeFromCart(userId!, item.product_id);
    await addToCart({
      user_id: userId!,
      product_id: item.product_id,
      quantity: item.quantity - 1,
    });
    fetchCart();
  };

  const handleRemove = async (product_id: number) => {
    await removeFromCart(userId!, product_id);
    setSelectedItems((prev) => prev.filter((id) => id !== product_id)); // bỏ chọn nếu xoá
    fetchCart();
  };

  const handleClear = async () => {
    await clearCart(userId!);
    setSelectedItems([]);
    fetchCart();
  };

  const handleToggleSelect = (product_id: number) => {
    setSelectedItems((prev) =>
      prev.includes(product_id)
        ? prev.filter((id) => id !== product_id)
        : [...prev, product_id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.product_id));
    }
  };

  const getTotalPrice = () => {
    return cartItems
      .filter((item) => selectedItems.includes(item.product_id))
      .reduce(
        (total, item) => total + (item.products?.price || 0) * item.quantity,
        0
      );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-center">Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <Link to={"/products"}>
            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              Continue Shopping
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex items-center p-4 border-b bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedItems.length === cartItems.length}
                  onChange={handleSelectAll}
                  className="mr-2"
                />
                <span className="font-medium">Select All</span>
              </div>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border-b last:border-b-0 hover:bg-gray-50 flex gap-4 items-center"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.product_id)}
                    onChange={() => handleToggleSelect(item.product_id)}
                  />
                  <img
                    src={item.products?.image || "/placeholder-image.jpg"}
                    alt={item.products?.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-left">
                      {item.products?.name}
                    </h3>
                    <p className="text-lg font-bold text-blue-600 text-left">
                      đ{item.products?.price}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center bg-gray-100 rounded-lg">
                        <button
                          onClick={() => handleDecrease(item)}
                          className="w-8 h-8 text-gray-600 hover:text-red-500"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncrease(item)}
                          disabled={
                            item.quantity >= (item.products?.stock || 0)
                          }
                          className={`w-8 h-8 ${
                            item.quantity >= (item.products?.stock || 0)
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-600 hover:text-green-500"
                          }`}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(item.product_id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>

            <div className="mb-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span className="text-blue-600 text-right break-all">
                  <span className="text-black">Total: </span>đ{getTotalPrice()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {selectedItems.length > 0 ? (
                <Link
                  to="/checkout"
                  state={{ selectedItems }}
                  className="block"
                >
                  <button className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                    Checkout ({selectedItems.length})
                  </button>
                </Link>
              ) : (
                <button
                  className="w-full py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                  disabled
                >
                  Checkout (0)
                </button>
              )}

              <button
                onClick={handleClear}
                className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
