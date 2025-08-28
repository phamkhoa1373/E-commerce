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
    return (
      <div className="px-6 h-screen flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading history data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 h-screen flex flex-col">
      {/* Header - cố định */}
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          History Actions
        </h1>
      </div>

      {/* Content Container */}
      <div className="flex-1 bg-white rounded-lg shadow-md border overflow-hidden">
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              System Activity Log
            </h2>
            <p className="text-gray-500 text-sm">
              Track all user actions and system changes
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border py-3 px-4 text-left font-semibold text-gray-700">ID</th>
                  <th className="border py-3 px-4 text-left font-semibold text-gray-700">Username</th>
                  <th className="border py-3 px-4 text-left font-semibold text-gray-700">Product</th>
                  <th className="border py-3 px-4 text-left font-semibold text-gray-700">Action</th>
                  <th className="border py-3 px-4 text-left font-semibold text-gray-700">Details</th>
                  <th className="border py-3 px-4 text-left font-semibold text-gray-700">Time</th>
                </tr>
              </thead>
              <tbody>
                {historyList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="border py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium">No history data available</p>
                        <p className="text-sm">Actions will appear here once users interact with the system</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  historyList.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="border py-3 px-4 text-center font-medium text-gray-700">
                        {index + 1}
                      </td>
                      <td className="border py-3 px-4">
                        <span className="font-medium text-gray-900">
                          {item.username || `User #${item.user_id}`}
                        </span>
                      </td>
                      <td className="border py-3 px-4">
                        <span className="font-medium text-gray-900">
                          {item.products?.name || "N/A"}
                        </span>
                      </td>
                      <td className="border py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-white text-xs font-medium uppercase tracking-wide ${
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
                      <td className="border py-3 px-4">
                        <div className="max-w-xs">
                          <details className="group">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium text-sm">
                              View Details
                            </summary>
                            <div className="mt-2 p-3 bg-gray-50 rounded border text-xs">
                              <pre className="whitespace-pre-wrap text-gray-700">
                                {JSON.stringify(item.history.details, null, 2)}
                              </pre>
                            </div>
                          </details>
                        </div>
                      </td>
                      <td className="border py-3 px-4 text-gray-600">
                        <div className="text-sm">
                          <div className="font-medium">
                            {new Date(item.created_at).toLocaleDateString("vi-VN")}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(item.created_at).toLocaleTimeString("vi-VN")}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          {historyList.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Total actions: <strong className="text-gray-900">{historyList.length}</strong></span>
                <span>Last updated: <strong className="text-gray-900">
                  {new Date().toLocaleString("vi-VN")}
                </strong></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryActionsPage;
