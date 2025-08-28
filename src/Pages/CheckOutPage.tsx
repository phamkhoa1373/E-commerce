import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Formik } from "formik";
import { type CreateOrderRequest, type ICartItem } from "@/models/type";
import { getCart, createOrder } from "@/services/api";
import { toast } from "react-toastify";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedItemsFromCart =
    (location.state as { selectedItems?: number[] })?.selectedItems || [];
  const [selectedItems] = useState<number[]>(selectedItemsFromCart);
  const [cartItems, setCartItems] = useState<ICartItem[]>([]);
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;
  const userId = user ? user.id : null;

  useEffect(() => {
    if (!userId) return;
    getCart(userId)
      .then(setCartItems)
      .catch((err) => console.error("Error fetching cart:", err));
  }, [userId]);

  const itemsToOrder = cartItems
    .filter((item) => selectedItems.includes(item.product_id))
    .map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products.price,
    }));

  const totalAmount = itemsToOrder.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const handleSubmit = async (
    values: CreateOrderRequest,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const cloneValue = { ...values };
      cloneValue.user_id = userId;
      cloneValue.items = itemsToOrder;
      await createOrder(cloneValue);
      toast.success("Order placed successfully!");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-4">Checkout</h2>

      {itemsToOrder.length === 0 ? (
        <p>No items selected for checkout.</p>
      ) : (
        <>
          {itemsToOrder.map((item) => {
            const product = cartItems.find(
              (p) => p.product_id === item.product_id
            )?.products;
            return (
              <div
                key={item.product_id}
                className="flex items-center mb-2 p-2 border rounded"
              >
                <img
                  src={product?.image}
                  alt={product?.name}
                  className="w-12 h-12 ml-2 object-cover rounded"
                />
                <span className="ml-2">
                  {product?.name} - {item.quantity} × {item.price}₫
                </span>
              </div>
            );
          })}

          <Formik
            initialValues={{
              shipping_name: "",
              shipping_address: "",
              shipping_phone: "",
              user_id: userId,
              items: itemsToOrder,
            }}
            validate={(values) => {
              const errors: {
                shipping_name?: string;
                shipping_address?: string;
                shipping_phone?: string;
              } = {};

              if (!values.shipping_name)
                errors.shipping_name = "Name is required";
              if (!values.shipping_address)
                errors.shipping_address = "Address is required";

              if (!values.shipping_phone) {
                errors.shipping_phone = "Phone number is required";
              } else if (!/^[0-9]{9,11}$/.test(values.shipping_phone)) {
                errors.shipping_phone = "Invalid phone number";
              }

              return errors;
            }}
            onSubmit={handleSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
            }) => (
              <form onSubmit={handleSubmit} className="mt-4">
                <label htmlFor="shipping_name" className="block mb-2 text-left">
                  Name of the person placing the order
                </label>
                <input
                  name="shipping_name"
                  className="border p-2 block mb-2 w-full"
                  placeholder="Recipient's name"
                  value={values.shipping_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.shipping_name && touched.shipping_name && (
                  <div className="text-red-500 text-sm mb-2 text-left">
                    {errors.shipping_name}
                  </div>
                )}

                <label
                  htmlFor="shipping_address"
                  className="block mb-2 text-left"
                >
                  Address
                </label>
                <input
                  name="shipping_address"
                  className="border p-2 block mb-2 w-full"
                  placeholder="Address"
                  value={values.shipping_address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.shipping_address && touched.shipping_address && (
                  <div className="text-red-500 text-sm mb-2 text-left">
                    {errors.shipping_address}
                  </div>
                )}

                <label
                  htmlFor="shipping_phone"
                  className="block mb-2 text-left"
                >
                  Phone number
                </label>
                <input
                  name="shipping_phone"
                  className="border p-2 block mb-2 w-full"
                  placeholder="Phone number"
                  value={values.shipping_phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.shipping_phone && touched.shipping_phone && (
                  <div className="text-red-500 text-sm mb-2 text-left">
                    {errors.shipping_phone}
                  </div>
                )}

                <div className="font-bold mb-4 text-left text-2xl">
                  Total: {totalAmount.toLocaleString()}₫
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 text-white rounded-lg font-semibold transition ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Checkout"}
                </button>
              </form>
            )}
          </Formik>
        </>
      )}
    </div>
  );
}
