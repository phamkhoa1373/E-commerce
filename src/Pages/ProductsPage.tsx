import React, { useState } from "react";
import { ShoppingCart, Filter } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getCategories, getProducts } from "../services/api";
import Loading from "../components/layout/Loading";
import type { ICategory, IProduct } from "@/models/type";
import { useQuery } from "@tanstack/react-query";

function ProductsPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    categoryId ? parseInt(categoryId) : null
  );
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState("name-asc");
  const { data: products = [], isLoading: loadingProducts } = useQuery<
    IProduct[]
  >({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  const { data: categories = [], isLoading: loadingCategories } = useQuery<
    ICategory[]
  >({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  if (loadingProducts || loadingCategories) {
    return <Loading />;
  }

  const categoryOptions = [{ id: null, name: "All" }, ...categories];

  // Filter products
  const filteredProducts = products
    .filter((product) => product.status === true)
    .filter(
      (product) =>
        selectedCategoryId === null || product.categoryId === selectedCategoryId
    )
    .filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            All Products
          </h1>
          <p className="text-lg text-gray-600">
            Discover our complete collection
          </p>
        </div>

        <div className="flex flex-col-reverse lg:flex-row-reverse gap-8">
          {/* Products Grid - Right Side */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => (
                <Link
                  key={index}
                  to={`/products/${product.id}`}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow block"
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

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No products found matching your criteria
                </p>
              </div>
            )}
          </div>

          {/* Filters - Left Side */}
          <div className="w-full lg:w-80">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5" />
                <h3 className="text-xl font-bold text-gray-900">Filters</h3>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategoryId || ""}
                onChange={(e) =>
                  setSelectedCategoryId(
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categoryOptions.map((category) => (
                  <option key={category.id || "all"} value={category.id || ""}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Price Range
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-evenly">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([parseInt(e.target.value), priceRange[1]])
                      }
                      className="w-20 px-2 py-1 border rounded text-sm"
                      placeholder="Min"
                    />
                    <p className="font-bold">~</p>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], parseInt(e.target.value)])
                      }
                      className="w-20 px-2 py-1 border rounded text-sm"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              {/* Sort By Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="name-asc">A to Z</option>
                  <option value="name-desc">Z to A</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              <button
                onClick={() => {
                  setSelectedCategoryId(null); // Thay đổi từ 'All' thành null
                  setPriceRange([0, 500]);
                  setSortBy("name-asc");
                }}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
