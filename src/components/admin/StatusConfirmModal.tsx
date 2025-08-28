import React from "react";
import BaseModal from "../ui/BaseModal";

interface StatusConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  currentStatus: boolean;
}

export default function StatusConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
  currentStatus,
}: StatusConfirmModalProps) {
  const newStatus = !currentStatus;
  const actionText = newStatus ? "Activate" : "Deactivate";
  const statusText = newStatus ? "active" : "inactive";
  
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Confirm ${actionText} Product`}
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className={`w-3 h-3 rounded-full ${currentStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            Current status: <span className="font-semibold">{currentStatus ? 'Active' : 'Inactive'}</span>
          </span>
        </div>
        
        <p className="text-gray-600">
          Are you sure you want to {actionText.toLowerCase()} product "
          <span className="font-semibold">{productName}</span>"?
        </p>
        
        <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
          This will change the product status to <span className="font-semibold">{statusText}</span>.
          {newStatus 
            ? " Active products will be visible to customers and available for purchase."
            : " Inactive products will be hidden from customers and unavailable for purchase."
          }
        </p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white rounded-md transition-colors ${
              newStatus 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {actionText}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}