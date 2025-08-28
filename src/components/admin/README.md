# StatusConfirmModal

Modal xác nhận để Active/UnActive sản phẩm sử dụng BaseModal.tsx.

## Tính năng

- Hiển thị trạng thái hiện tại của sản phẩm (Active/Inactive)
- Xác nhận trước khi thay đổi trạng thái
- Giao diện trực quan với màu sắc phù hợp
- Responsive design
- Tự động đóng sau khi xác nhận

## Props

```typescript
interface StatusConfirmModalProps {
  isOpen: boolean;           // Trạng thái hiển thị modal
  onClose: () => void;       // Callback khi đóng modal
  onConfirm: () => void;     // Callback khi xác nhận thay đổi
  productName: string;       // Tên sản phẩm
  currentStatus: boolean;    // Trạng thái hiện tại (true = Active, false = Inactive)
}
```

## Cách sử dụng

### 1. Import component

```typescript
import StatusConfirmModal from "./StatusConfirmModal";
```

### 2. Sử dụng trong component

```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);

const handleStatusChange = (product: IProduct) => {
  setSelectedProduct(product);
  setIsModalOpen(true);
};

const handleConfirmStatusChange = () => {
  if (selectedProduct) {
    // Gọi API để thay đổi trạng thái
    updateProductStatus(selectedProduct.id, !selectedProduct.status);
  }
};

const handleCloseModal = () => {
  setIsModalOpen(false);
  setSelectedProduct(null);
};

// Trong JSX
<StatusConfirmModal
  isOpen={isModalOpen}
  onClose={handleCloseModal}
  onConfirm={handleConfirmStatusChange}
  productName={selectedProduct?.name || ""}
  currentStatus={selectedProduct?.status || false}
/>
```

### 3. Tích hợp với API

```typescript
const updateProductStatus = async (productId: number, newStatus: boolean) => {
  try {
    const response = await fetch(`/api/products/${productId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });
    
    if (response.ok) {
      // Cập nhật state hoặc refetch data
      refetchProducts();
      toast.success(`Product ${newStatus ? 'activated' : 'deactivated'} successfully`);
    }
  } catch (error) {
    console.error('Error updating product status:', error);
    toast.error('Failed to update product status');
  }
};
```

## Ví dụ hoàn chỉnh

Xem file `StatusConfirmModalDemo.tsx` để có ví dụ hoàn chỉnh về cách sử dụng.

## Styling

Modal sử dụng Tailwind CSS và có thể tùy chỉnh thông qua:

- `size` prop trong BaseModal (sm, md, lg, xl)
- CSS classes trong component
- Tailwind config

## Lưu ý

- Modal tự động đóng sau khi gọi `onConfirm`
- Trạng thái `currentStatus` phải là boolean
- Component sử dụng `BaseModal` làm foundation
- Responsive và accessible