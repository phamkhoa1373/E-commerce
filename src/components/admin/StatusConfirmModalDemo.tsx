import React, { useState } from "react";
import StatusConfirmModal from "./StatusConfirmModal";
import { IProduct } from "../../models/type";

// Demo component để minh họa cách sử dụng StatusConfirmModal
export default function StatusConfirmModalDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Mock data cho demo
  const mockProduct: IProduct = {
    id: 1,
    name: "iPhone 15 Pro",
    price: 999,
    image: "/iphone.jpg",
    description: "Latest iPhone model",
    stock: 50,
    status: true, // true = Active, false = Inactive
    categoryId: 1,
    addedAt: "2024-01-01"
  };

  const handleStatusChange = (product: IProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (selectedProduct) {
      try {
        setIsUpdating(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log(`Changing status for product: ${selectedProduct.name}`);
        console.log(`New status will be: ${!selectedProduct.status}`);
        
        // Sau khi API thành công, bạn có thể cập nhật state hoặc refetch data
        // Ví dụ: refetchProducts() hoặc updateProductStatus(selectedProduct.id, !selectedProduct.status)
        
        // Đóng modal sau khi thành công
        handleCloseModal();
      } catch (error) {
        console.error('Error updating status:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setIsUpdating(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Product Status Management Demo</h1>
      
      {/* Product Card */}
      <div className="border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{mockProduct.name}</h3>
            <p className="text-gray-600">${mockProduct.price}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-3 h-3 rounded-full ${mockProduct.status ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-sm font-medium ${mockProduct.status ? 'text-green-600' : 'text-red-600'}`}>
                {mockProduct.status ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => handleStatusChange(mockProduct)}
            className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
              mockProduct.status 
                ? 'bg-orange-600 hover:bg-orange-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {mockProduct.status ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">How to use:</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Click the Activate/Deactivate button to open the confirmation modal</li>
          <li>• The modal shows current status and what will happen after the change</li>
          <li>• Confirm the action to change the product status</li>
          <li>• The modal automatically closes after confirmation</li>
        </ul>
      </div>

      {/* Status Confirm Modal */}
      {selectedProduct && (
        <StatusConfirmModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmStatusChange}
          productName={selectedProduct.name}
          currentStatus={selectedProduct.status}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
}