import React, { useEffect, useState } from "react";
import { getHistory } from "@/services/api";
import type { IHistoryItem } from "@/models/type";

const HistoryActionsPage: React.FC = () => {
  const [historyList, setHistoryList] = useState<IHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getHistory();
        setHistoryList(data);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6">History actions</h2>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="border p-3">ID</th>
              <th className="border p-3">User</th>
              <th className="border p-3">Product</th>
              <th className="border p-3">Action</th>
              <th className="border p-3">Details</th>
              <th className="border p-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {historyList.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No history data available
                </td>
              </tr>
            ) : (
              historyList.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border p-3 text-center">{index + 1}</td>
                  <td className="border p-3">{item.user_id}</td>
                  <td className="border p-3">{item.products?.name || "N/A"}</td>
                  <td className="border p-3">
                    <span
                      className={`px-3 py-1 rounded text-white text-sm ${
                        item.history.action === "create"
                          ? "bg-green-500"
                          : item.history.action === "update"
                          ? "bg-yellow-500"
                          : item.history.action === "delete"
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                    >
                      {item.history.action}
                    </span>
                  </td>
                  <td className="border p-3">
                    <div className="max-w-xs overflow-x-auto">
                      <pre className="text-xs bg-gray-100 p-2 rounded">
                        {JSON.stringify(item.history.details, null, 2)}
                      </pre>
                    </div>
                  </td>
                  <td className="border p-3 text-gray-600">
                    {new Date(item.created_at).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryActionsPage;
