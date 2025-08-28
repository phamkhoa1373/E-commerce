import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductsManagePage from "@pages/admin/ProductsManagePage";
import OrderManagePage from "@pages/admin/OrderManagePage";
import HistoryActionsPage from "@/Pages/admin/HistoryActionsPage";

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "history">(
    "products"
  );

  return (
    <div className="flex h-screen">
      <div className="bg-gray-800 text-white flex flex-col w-44">
        <div className="p-4 text-2xl font-bold border-b border-gray-700">
          Admin Panel
        </div>
        <nav className="flex flex-col mt-4 flex-grow">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-3 text-left hover:bg-gray-700 ${
              activeTab === "products" ? "bg-gray-700 font-semibold" : ""
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-3 text-left hover:bg-gray-700 ${
              activeTab === "orders" ? "bg-gray-700 font-semibold" : ""
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-3 text-left hover:bg-gray-700 ${
              activeTab === "history" ? "bg-gray-700 font-semibold" : ""
            }`}
          >
            History actions
          </button>
        </nav>

        {/* Logout button */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          className="px-4 py-3 text-left hover:bg-red-600 transition-colors duration-200 mt-auto mb-4 flex items-center gap-2 text-red-400 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
        </button>
      </div>

      <div className="flex-1 p-6 bg-gray-50 overflow-auto">
        {activeTab === "products" && <ProductsManagePage />}
        {activeTab === "orders" && <OrderManagePage />}
        {activeTab === "history" && <HistoryActionsPage />}
      </div>
    </div>
  );
}
