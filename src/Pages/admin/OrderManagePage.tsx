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
    <Loading />;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Order List</h2>
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border py-1">Order ID</th>
            <th className="border py-1">Customer</th>
            <th className="border py-1">Total</th>
            <th className="border py-1">Quantity</th>
            <th className="border py-1">Status</th>
            <th className="border py-1">Created At</th>
            <th className="border py-1">Details</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="border py-1">{order.id}</td>
              <td className="border py-1">{order.shipping_name}</td>
              <td className="border py-1">{order.total_amount}đ</td>
              <td className="border py-1">
                {order.order_items?.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                ) || 0}
              </td>
              <td className="border py-1">
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
                  className="border rounded px-1"
                >
                  {["pending", "completed", "cancelled"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
              <td className="border py-1">{formatDate(order.created_at)}</td>
              <td className="border py-1">
                <ul className="space-y-1">
                  {(order.order_items ?? []).map((item) => (
                    <li key={item.id}>
                      <p className="font-medium text-left">
                        {item.products?.name}
                      </p>
                      <p className="text-gray-600 text-sm text-left">
                        Quantity: {item.quantity} - Price: {item.price}₫
                      </p>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <BaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Status Change"
        size="sm"
      >
        <p className="text-gray-700 mb-4">
          Are you sure you want to change the status of order{" "}
          <strong>#{selectedOrder?.id}</strong> to{" "}
          <span className="text-red-600 font-semibold">{pendingStatus}</span>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
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
