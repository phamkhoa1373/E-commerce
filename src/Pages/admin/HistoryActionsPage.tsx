import React, { useEffect, useState } from "react";
import { getHistory } from "@/services/api";
import type { IHistoryItem } from "@/models/type";
import Loading from "@/components/layout/Loading";
import { formatDate } from "@/helper/utils";

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
    <div className="px-6 h-screen flex flex-col">
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          History Actions
        </h1>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-md border overflow-auto">
        <div className="p-6 ">
          <div className="overflow-auto ">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border py-3 px-4 text-left font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="border py-3 px-4 text-left font-semibold text-gray-700">
                    User
                  </th>
                  <th className="border py-3 px-4 text-left font-semibold text-gray-700">
                    Product
                  </th>
                  <th className="border py-3 px-4 text-left font-semibold text-gray-700">
                    Action
                  </th>
                  <th className="border py-3 px-4 text-left font-semibold text-gray-700">
                    Details
                  </th>
                  <th className="border py-3 px-4 text-left font-semibold text-gray-700">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {historyList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="border py-8 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center overflow-y-auto">
                        <p className="text-lg font-medium">
                          No history data available
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  historyList.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="border py-3 px-4 text-center font-medium text-gray-700">
                        {index + 1}
                      </td>
                      <td className="border py-3 px-4">
                        <span className="font-medium text-gray-900">
                          #{item.user_id}
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
                            <div className="mt-2 p-3 bg-gray-50 rounded border text-xs overflow-auto">
                              <pre className="whitespace-pre-wrap text-gray-700 text-left">
                                {JSON.stringify(item.history.details, null, 2)}
                              </pre>
                            </div>
                          </details>
                        </div>
                      </td>
                      <td className="border py-3 px-4 text-gray-600">
                        <div className="text-sm">
                          <div className="font-medium">
                            {formatDate(item.created_at)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryActionsPage;
