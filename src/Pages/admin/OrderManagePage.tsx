import Loading from "@/components/layout/Loading";
import BaseModal from "@/components/ui/BaseModal";
import { formatDate } from "@/helper/utils";
import type { IOrder } from "@/models/type";
import { getOrders, updateOrderStatus } from "@/services/api";
import { useEffect, useState } from "react";

export default function OrderManagePageComponent() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  useEffect(() => {
    getOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const handleStatusUpdate = async (orderId: number, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } catch (error) {
      console.error("Update status failed", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusBadge = (status: string) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
              <p className="text-gray-600">Manage and track all customer orders</p>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
              <span className="text-sm text-gray-500">Total Orders:</span>
              <span className="ml-2 text-lg font-semibold text-blue-600">{orders.length}</span>
            </div>
          </div>
        </div>

        {/* Orders Table Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-xl font-semibold text-gray-800">Order List</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">#{order.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {order.shipping_name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{order.shipping_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-green-600">{order.total_amount}₫</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {order.order_items?.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        ) || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(order.status)}
                        <select
                          value={order.status}
                          disabled={
                            order.status === "completed" || order.status === "cancelled"
                          }
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            if (
                              newStatus === "completed" ||
                              newStatus === "cancelled"
                            ) {
                              setSelectedOrder(order);
                              setPendingStatus(newStatus);
                              setIsModalOpen(true);
                            } else {
                              handleStatusUpdate(order.id, newStatus);
                            }
                          }}
                          className="ml-2 text-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {["pending", "completed", "cancelled"].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {(order.order_items ?? []).map((item) => (
                          <div key={item.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <p className="font-medium text-gray-900 text-sm">
                              {item.products?.name}
                            </p>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-gray-600">
                                Qty: {item.quantity}
                              </span>
                              <span className="text-xs font-medium text-gray-700">
                                {item.price}₫
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {orders.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new order.</p>
          </div>
        )}
      </div>

      <BaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Status Change"
        size="sm"
      >
        <div className="p-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Confirm Status Change</h3>
          <p className="text-gray-700 mb-6">
            Are you sure you want to change the status of order{" "}
            <strong className="text-blue-600">#{selectedOrder?.id}</strong> to{" "}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(pendingStatus || '')}`}>
              {pendingStatus}
            </span>?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedOrder && pendingStatus) {
                  handleStatusUpdate(selectedOrder.id, pendingStatus);
                  setIsModalOpen(false);
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
            >
              Confirm Change
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
