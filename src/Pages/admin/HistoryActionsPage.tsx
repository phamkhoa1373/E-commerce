import React, { useEffect, useState } from "react";
import { getHistory } from "@/services/api";
import type { IHistoryItem } from "@/models/type";
import Loading from "@/components/layout/Loading";

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
    return <Loading />;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">History Actions</h2>
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border py-1">ID</th>
            <th className="border py-1">User</th>
            <th className="border py-1">Product</th>
            <th className="border py-1">Action</th>
            <th className="border py-1">Details</th>
            <th className="border py-1">Time</th>
          </tr>
        </thead>
        <tbody>
          {historyList.length === 0 ? (
            <tr>
              <td colSpan={6} className="border py-4 text-center text-gray-500">
                No history data available
              </td>
            </tr>
          ) : (
            historyList.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="border py-1 text-center">{index + 1}</td>
                <td className="border py-1">{item.user_id}</td>
                <td className="border py-1">{item.products?.name || "N/A"}</td>
                <td className="border py-1">
                  <span
                    className={`px-2 py-1 rounded text-white text-xs ${
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
                <td className="border py-1">
                  <div className="max-w-xs">
                    <details className="group">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800 text-xs">
                        View Details
                      </summary>
                      <div className="mt-1 p-2 bg-gray-100 rounded text-xs">
                        <pre className="whitespace-pre-wrap break-words">
                          {JSON.stringify(item.history.details, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </td>
                  <td className="border py-1 text-gray-600">
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
