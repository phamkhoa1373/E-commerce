import React, { useEffect, useState, type ReactNode } from "react";
import type { IProduct, ICategory } from "@/models/type";
import { getCategories, uploadImageToCloudinary } from "@/services/api";
import BaseModal from "@/components/ui/BaseModal";
import { toast } from "react-toastify";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  onSubmit: (formData: Partial<IProduct>, imageFile?: File) => void;
  selectedProduct?: IProduct;
};

export default function CreateUpdateModal({
  isOpen,
  onClose,
  title,
  onSubmit,
  selectedProduct,
}: ModalProps) {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [showExistingImage, setShowExistingImage] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          const data = await getCategories();
          setCategories(data);
        } catch (error) {
          console.error("Error fetching categories:", error);
        }
      };
      fetchCategories();
      setUploadedImageUrl("");
      setShowExistingImage(true);
    }
  }, [isOpen]);

  const handleImageUpload = async () => {
    const imageInput = document.querySelector(
      'input[name="image"]'
    ) as HTMLInputElement;
    const imageFile = imageInput?.files?.[0];

    if (!imageFile) {
      toast.warning("Please select an image first");
      return;
    }

    try {
      setIsUploading(true);
      const imageUrl = await uploadImageToCloudinary(imageFile);
      setUploadedImageUrl(imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData: Partial<IProduct> = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      price: parseFloat(
        (form.elements.namedItem("price") as HTMLInputElement).value
      ),
      stock: parseInt(
        (form.elements.namedItem("stock") as HTMLInputElement).value
      ),
      description: (form.elements.namedItem("description") as HTMLInputElement)
        .value,
      categoryId: parseInt(
        (form.elements.namedItem("categoryId") as HTMLSelectElement).value
      ),
      image: uploadedImageUrl || selectedProduct?.image,
    };
    onSubmit(formData);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          name="name"
          defaultValue={selectedProduct?.name || ""}
          placeholder="Product Name"
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          name="price"
          defaultValue={selectedProduct?.price || ""}
          placeholder="Price"
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          name="stock"
          defaultValue={selectedProduct?.stock || ""}
          placeholder="stock"
          className="border p-2 rounded"
          required
        />
        <select
          name="categoryId"
          defaultValue={selectedProduct?.categoryId || ""}
          className="border p-2 rounded"
          required
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <textarea
          name="description"
          defaultValue={selectedProduct?.description || ""}
          placeholder="Description"
          className="border p-2 rounded"
          rows={3}
        />
        {selectedProduct?.image && showExistingImage ? (
          <div className="relative w-36 h-36 mb-4">
            <img
              src={selectedProduct.image}
              alt="Current product"
              className="w-full h-full rounded"
            />
            <button
              type="button"
              onClick={() => setShowExistingImage(false)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <input
              type="file"
              name="image"
              accept="image/*"
              className="border p-2 rounded flex-1"
              required={!selectedProduct && !uploadedImageUrl}
            />
            <button
              type="button"
              onClick={handleImageUpload}
              disabled={isUploading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {isUploading ? "Uploading..." : "Upload Image"}
            </button>
          </div>
        )}
        {uploadedImageUrl && (
          <div className="text-green-600">✓ Image uploaded successfully</div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-500"
            disabled={!selectedProduct && !uploadedImageUrl}
          >
            {selectedProduct ? "Update" : "Add"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
