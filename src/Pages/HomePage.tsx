import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { getProducts, getCategories } from "@/services/api";
import Loading from "../components/layout/Loading";
import type { ICategory, IProduct } from "@/models/type";

function HomePage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const newArrivals = products.slice(0, 8);
  const featuredProducts = products.slice(0, 5);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="h-[90vh] bg-[url(https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg)] bg-opacity-40 bg-cover bg-center bg-no-repeat flex items-center justify-center text-white text-center px-4">
          {" "}
          <div className="max-w-4xl">
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="relative z-10 max-w-4xl">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 ">
                Discover Your
                <span className="block text-yellow-300">Perfect Style</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90 ">
                Explore our curated collection of premium products at unbeatable
                prices
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={"/products"}>
                  <button className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100">
                    Shop Now
                  </button>
                </Link>
                <button className="border-2 border-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Shop by Category */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Shop by Category
              </h2>
              <p className="text-lg text-gray-600">
                Browse through our diverse range of categories
              </p>
            </div>

            <div className="flex flex-wrap justify-center pb-4 gap-7">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products/category/${category.id}`}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer min-w-64 block"
                >
                  <div className="h-48 bg-gray-200 rounded-t-xl overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {category.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  New Arrivals
                </h2>
                <p className="text-lg text-gray-600">
                  Fresh products just landed
                </p>
              </div>
              <Link to={"/products"}>
                <button className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-2 text-2xl">
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-6 pb-4">
              {newArrivals.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow w-72 flex-shrink-0 block"
                >
                  <div className="h-64 bg-gray-200 rounded-t-xl overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h3>

                    <div className="flex items-center mb-2">
                      <div className="flex"></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-gray-900">
                          đ{product.price}
                        </span>
                      </div>
                      <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-lg text-gray-600">
                Hand-picked favorites that our customers love
              </p>
            </div>

            <div className="flex overflow-x-auto gap-8 pb-4">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow w-72 flex-shrink-0 block"
                >
                  <div className="h-64 bg-gray-200 rounded-t-xl overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h3>

                    <div className="flex items-center mb-2">
                      <div className="flex"></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-gray-900">
                          đ{product.price}
                        </span>
                      </div>
                      <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default HomePage;
