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

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Order Management
      </h2>

      <div className="bg-white rounded-lg shadow-sm border">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Order ID
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Customer
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Total
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Quantity
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Created At
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Details
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-medium text-blue-600">#{order.id}</span>
                </td>
                <td className="px-4 py-3">{order.shipping_name}</td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-green-600">
                    {order.total_amount}₫
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                    {order.order_items?.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    ) || 0}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.status}
                    </span>
                    <select
                      value={order.status}
                      disabled={
                        order.status === "completed" ||
                        order.status === "cancelled"
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
                      className="border rounded px-2 py-1 text-sm disabled:opacity-50"
                    >
                      {["pending", "completed", "cancelled"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(order.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-2">
                    {(order.order_items ?? []).map((item) => (
                      <div key={item.id} className="bg-gray-50 p-2 rounded">
                        <p className="font-medium text-sm">
                          {item.products?.name}
                        </p>
                        <p className="text-gray-600 text-xs">
                          Qty: {item.quantity} - Price: {item.price}₫
                        </p>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Status Change"
        size="sm"
      >
        <p className="text-gray-700 mb-4">
          Are you sure you want to change the status of order{" "}
          <strong className="text-blue-600">#{selectedOrder?.id}</strong> to{" "}
          <span className="text-red-600 font-semibold">{pendingStatus}</span>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Confirm
          </button>
        </div>
      </BaseModal>
    </div>
  );
}
