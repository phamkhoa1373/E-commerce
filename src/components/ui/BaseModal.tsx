import React, { isValidElement, useEffect, type ReactNode } from "react";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: "w-4/12",
  md: "w-6/12",
  lg: "w-8/12",
  xl: "w-10/12",
};

export default function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
}: BaseModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 w-full h-full top-0 left-0 bg-black bg-opacity-50 flex justify-center items-center p-5">
      <div
        className={`bg-white ${sizeClasses[size]} h-fit flex flex-col p-5 gap-3 rounded-lg relative`}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
            aria-label="Close modal"
          >
            ×
          </button>
        )}

        {isValidElement(title) ? (
          title
        ) : (
          <div className="pr-8">
            <h2 className="text-2xl font-semibold">{title}</h2>
          </div>
        )}

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
