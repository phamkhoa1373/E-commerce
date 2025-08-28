import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ShoppingCart,
  ArrowLeft,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { getProductById, getProducts } from "../services/api";
import Loading from "../components/layout/Loading";
import type { IProduct } from "@/models/type";
import { useCart } from "@/hooks/";

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex] = useState(0);
  const { setCurrentCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        const productData = await getProductById(parseInt(id));
        setProduct(productData);

        const allProducts = await getProducts();
        const related = allProducts
          .filter(
            (p) =>
              p.categoryId === productData.categoryId && p.id !== productData.id
          )
          .slice(0, 4);
        setRelatedProducts(related);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (action: "increase" | "decrease") => {
    if (!product) return;

    if (action === "increase" && quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    } else if (action === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;
    const userId = user ? user.id : null;
    if (!userId) {
      toast.warning("Please login to add to cart");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          product_id: product.id,
          quantity: quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          "Failed to add to cart: " + (data.detail || "Unknown error")
        );
      } else {
        toast.success(`Added ${quantity} item(s) to cart successfully!`);
        setCurrentCart((prev) => {
          const productID = prev.find((item) => item.product_id === product.id);
          if (productID) {
            return prev.map((item) =>
              item.product_id === product.id
                ? {
                    ...item,
                    quantity: item.quantity + quantity,
                  }
                : item
            );
          }
          return [
            ...prev,
            {
              id: product.id,
              product_id: product.id,
              quantity,
              products: product,
            },
          ];
        });
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product not found
          </h2>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const productImages = [
    product.image,
    product.image,
    product.image,
    product.image,
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-blue-600">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-blue-600">
            Products
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-xl overflow-hidden shadow-lg">
              <img
                src={productImages[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 text-left">
              {product.name}
            </h1>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-gray-900">
                đ{product.price}
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 text-left">
                Description
              </h3>
              <p className="text-gray-600 leading-relaxed text-left">
                {product.description}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 text-left">
                Quantity
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange("decrease")}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange("increase")}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  • {product.stock} in stock
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Free Shipping
                  </div>
                  <div className="text-gray-600">On orders over đ50</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Warranty</div>
                  <div className="text-gray-600">2 year coverage</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <RotateCcw className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Returns</div>
                  <div className="text-gray-600">30-day policy</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold ${
                  product.stock === 0
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            You might also like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                to={`/products/${relatedProduct.id}`}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow group"
              >
                <div className="h-48 bg-gray-200 rounded-t-xl overflow-hidden">
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {relatedProduct.name}
                  </h3>
                  <div className="flex items-center mb-2"></div>
                  <span className="text-lg font-bold text-gray-900">
                    đ{relatedProduct.price}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
