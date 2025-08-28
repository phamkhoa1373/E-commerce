import CreateUpdateModal from "@/components/admin/CreateUpdateModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import StatusConfirmModal from "@/components/admin/StatusConfirmModal";
import Loading from "@/components/layout/Loading";
import type { ICategory, IProduct } from "@/models/type";
import {
  addProduct,
  deleteProduct,
  getCategories,
  getProducts,
  toggleProductStatus,
  updateProduct,
} from "@/services/api";
import { useEffect, useMemo, useState } from "react";

export default function ProductsManagePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<IProduct | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [productToToggleStatus, setProductToToggleStatus] = useState<IProduct | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [sortOption, setSortOption] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState<number | "all">(
    "all"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<number | "all">("all");
  const [products, setProducts] = useState<IProduct[]>([]);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  function getWeekRangeText(selectedMonth: string, week: number) {
    if (!selectedMonth || !week) return "";
    const [year, month] = selectedMonth.split("-").map(Number);

    const firstDayOfMonth = new Date(year, month - 1, 1);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate((week - 1) * 7 + 1);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    // Format dd/mm
    const format = (d: Date) =>
      `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

    return `${format(startDate)} - ${format(endDate)}`;
  }

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
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const categoryNameById = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: IProduct) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (product: IProduct) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete.id);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts();
    }
  };

  const handleSubmit = async (
    formData: Partial<IProduct>,
    imageFile?: File
  ) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData, imageFile);
      } else {
        await addProduct(formData, imageFile);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Failed to submit product:", error);
    }
  };

  // Filter + Sort + Pagination
  const filteredProducts = (products || [])
    // search
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    // category
    .filter(
      (p) => selectedCategory === "all" || p.categoryId === selectedCategory
    )
    // month
    .filter((p) => {
      if (!selectedMonth) return true;
      if (!p.addedAt) return false; // Nếu không có ngày tạo thì bỏ qua
      const productDate = new Date(p.addedAt);
      const [year, month] = selectedMonth.split("-").map(Number);
      return (
        productDate.getFullYear() === year &&
        productDate.getMonth() + 1 === month
      );
    })
    // week
    .filter((p) => {
      if (selectedWeek === "all" || !selectedMonth) return true;
      if (!p.addedAt) return false;
      const productDate = new Date(p.addedAt);
      const weekNumber = Math.floor((productDate.getDate() - 1) / 7) + 1;
      return weekNumber === selectedWeek;
    })
    // sort
    .sort((a, b) => {
      switch (sortOption) {
        case "az":
          return a.name.localeCompare(b.name);
        case "za":
          return b.name.localeCompare(a.name);
        case "low-high":
          return a.price - b.price;
        case "high-low":
          return b.price - a.price;
        default:
          return b.id - a.id;
      }
    });

  const handleToggleStatus = (product: IProduct) => {
    // Không cho phép mở modal nếu đang trong quá trình cập nhật
    if (isUpdatingStatus) return;
    
    setProductToToggleStatus(product);
    setIsStatusModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (productToToggleStatus) {
      try {
        setIsUpdatingStatus(true);
        await toggleProductStatus(productToToggleStatus.id, !productToToggleStatus.status);
        fetchProducts();
        // Đóng modal sau khi thành công
        handleCloseStatusModal();
      } catch (error) {
        console.error("Failed to update status:", error);
        // Có thể thêm toast notification ở đây
        // Modal vẫn mở để user có thể thử lại
      } finally {
        setIsUpdatingStatus(false);
      }
    }
  };

  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    setProductToToggleStatus(null);
    setIsUpdatingStatus(false); // Reset trạng thái khi đóng modal
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortOption, selectedMonth, selectedWeek]);

  if (!products.length || !categories.length) {
    return <Loading />;
  }

  return (
    <div className="px-6 h-screen flex flex-col">
      {/* Header - cố định */}
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Product management
        </h1>

        {/* Filters Section */}
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Searching product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            {/* Chọn tháng */}
            <div className="min-w-48">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              />
            </div>

            {/* Chọn tuần */}
            <div className="min-w-48">
              <select
                value={selectedWeek}
                onChange={(e) =>
                  setSelectedWeek(
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="all">All weeks</option>
                {Array.from({ length: 5 }, (_, i) => {
                  const week = i + 1;
                  return (
                    <option key={week} value={week}>
                      Week {week}{" "}
                      {selectedMonth &&
                        `(${getWeekRangeText(selectedMonth, week)})`}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="min-w-48">
              <select
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-48">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="default">Default</option>
                <option value="az">Name A → Z</option>
                <option value="za">Name Z → A</option>
                <option value="low-high">Price: Low → High</option>
                <option value="high-low">Price: High → Low</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleAdd}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                + Add Product
              </button>
            </div>
          </div>

          {/* Filter summary */}
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
            {selectedCategory !== "all" && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                Category: {categoryNameById.get(selectedCategory as number)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Table Container - có thể scroll */}
      <div className="flex-1 min-h-0 bg-white rounded-lg shadow-md border overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Fixed Header */}
          <div className="flex-shrink-0 bg-gray-50 border-b">
            <table className="w-full table-fixed">
              <thead>
                <tr>
                  <th
                    className="px-4 py-3 text-left font-semibold text-gray-700"
                    style={{ width: "80px" }}
                  >
                    ID
                  </th>
                  <th
                    className="px-1 py-3 text-left font-semibold text-gray-700"
                    style={{ width: "240px" }}
                  >
                    Name product
                  </th>
                  <th
                    className="px-2 py-3 text-left font-semibold text-gray-700"
                    style={{ width: "140px" }}
                  >
                    Category
                  </th>
                  <th
                    className="px-1 py-3 text-left font-semibold text-gray-700"
                    style={{ width: "100px" }}
                  >
                    Created At
                  </th>
                  <th
                    className="px-1 py-3 text-left font-semibold text-gray-700"
                    style={{ width: "140px" }}
                  >
                    Price
                  </th>
                  <th
                    className="px-1 py-3 text-left font-semibold text-gray-700"
                    style={{ width: "80px" }}
                  >
                    Stock
                  </th>
                  <th
                    className="px-4 py-3 text-left font-semibold text-gray-700"
                    style={{ width: "100px" }}
                  >
                    Image
                  </th>
                  <th
                    className="px-1 py-3 text-left font-semibold text-gray-700"
                    style={{ width: "100px" }}
                  >
                    Status
                  </th>
                  <th
                    className="px-1 py-3 text-left font-semibold text-gray-700"
                    style={{ width: "160px" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full table-fixed">
              <tbody className="divide-y divide-gray-200">
                {currentProducts.map((p, index) => (
                  <tr
                    key={p.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td
                      className="px-4 py-3 text-left truncate"
                      style={{ width: "80px" }}
                    >
                      {p.id}
                    </td>
                    <td
                      className="px-1 py-3 font-medium text-left truncate"
                      style={{ width: "240px" }}
                    >
                      {p.name}
                    </td>
                    <td
                      className="px-4 py-3 text-left truncate"
                      style={{ width: "140px" }}
                    >
                      {p.categoryId != null
                        ? categoryNameById.get(p.categoryId) || "—"
                        : "—"}
                    </td>
                    <td
                      className="px-4 py-3 text-left truncate"
                      style={{ width: "100px" }}
                    >
                      {p.addedAt
                        ? new Date(p.addedAt).toLocaleDateString("vi-VN")
                        : "—"}
                    </td>
                    <td
                      className="px-4 py-3 font-semibold text-green-600 text-left truncate"
                      style={{ width: "140px" }}
                    >
                      {p.price.toLocaleString()}đ
                    </td>
                    <td
                      className="px-4 py-3 text-left truncate"
                      style={{ width: "100px" }}
                    >
                      {p.stock}
                    </td>
                    <td className="px-1 py-3" style={{ width: "80px" }}>
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded border"
                      />
                    </td>
                    <td
                      className="px-4 py-3 text-left"
                      style={{ width: "100px" }}
                    >
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium  ${
                          p.status
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.status ? "Active" : "Unactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ width: "160px" }}>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          disabled={isUpdatingStatus}
                          className={`px-3 py-1 rounded text-sm text-white transition-colors ${
                            p.status
                              ? "bg-gray-500 hover:bg-gray-600"
                              : "bg-green-500 hover:bg-green-600"
                          } ${
                            isUpdatingStatus 
                              ? "opacity-50 cursor-not-allowed" 
                              : "hover:shadow-md"
                          }`}
                        >
                          {isUpdatingStatus ? (
                            <span className="flex items-center gap-1">
                              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                <circle 
                                  className="opacity-25" 
                                  cx="12" 
                                  cy="12" 
                                  r="10" 
                                  stroke="currentColor" 
                                  strokeWidth="4"
                                />
                                <path 
                                  className="opacity-75" 
                                  fill="currentColor" 
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Updating...
                            </span>
                          ) : (
                            p.status ? "Disable" : "Enable"
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(p)}
                          className="px-3 py-1 bg-amber-500 text-white rounded text-sm hover:bg-amber-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          className="w-16 h-16 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3"
                          />
                        </svg>
                        <span className="text-lg">No products found</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex-shrink-0 mt-4 flex justify-center items-center gap-2 bg-white p-4 rounded-lg shadow-sm">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ‹ Trước
          </button>

          {[...Array(Math.min(5, totalPages))].map((_, index) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = index + 1;
            } else if (currentPage <= 3) {
              pageNum = index + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + index;
            } else {
              pageNum = currentPage - 2 + index;
            }

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-2 rounded transition-colors ${
                  currentPage === pageNum
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sau ›
          </button>
        </div>
      )}

      <CreateUpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit product" : "Add new product"}
        onSubmit={handleSubmit}
        selectedProduct={editingProduct ?? undefined}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        productName={productToDelete?.name || ""}
      />

      <StatusConfirmModal
        isOpen={isStatusModalOpen}
        onClose={handleCloseStatusModal}
        onConfirm={handleConfirmStatusChange}
        productName={productToToggleStatus?.name || ""}
        currentStatus={productToToggleStatus?.status || false}
        isUpdating={isUpdatingStatus}
      />
    </div>
  );
}
