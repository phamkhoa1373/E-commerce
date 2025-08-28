import { CLOUDINARY_URL } from "@/common/constant";
import type {
  ICategory,
  IProduct,
  ICartItem,
  LoginResponse,
  LoginCredentials,
  RegisterCredentials,
  RegisterResponse,
  AddToCartRequest,
  CreateOrderRequest,
  CreateOrderResponse,
} from "@/models/type";
import axios, { type AxiosResponse } from "axios";

const API_BASE_URL = "http://localhost:8000";

export const login = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const res = await axios.post<LoginResponse>(
    `${API_BASE_URL}/auth/login`,
    credentials
  );
  return res.data;
};

export const register = async (
  credentials: RegisterCredentials
): Promise<{
  res: AxiosResponse<RegisterResponse>;
  data: RegisterResponse;
}> => {
  const res = await axios.post<RegisterResponse>(
    `${API_BASE_URL}/auth/register`,
    credentials
  );
  return { res, data: res.data };
};

export const getCategories = async (): Promise<ICategory[]> => {
  const res = await axios.get<ICategory[]>(`${API_BASE_URL}/categories`);
  return res.data;
};

export const getCategoryById = async (id: number): Promise<ICategory> => {
  const res = await axios.get<ICategory>(`${API_BASE_URL}/categories/${id}`);
  return res.data;
};

export const getProducts = async (
  categoryId?: number,
  month?: string,
  week?: number
): Promise<IProduct[]> => {
  try {
    const params = new URLSearchParams();
    if (categoryId) params.append("category_id", categoryId.toString());
    if (month) params.append("month", month);
    if (week) params.append("week", String(week));

    const url = `${API_BASE_URL}/products?${params.toString()}`;
    const res = await axios.get<IProduct[]>(url);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const getProductById = async (id: number): Promise<IProduct> => {
  const res = await axios.get<IProduct>(`${API_BASE_URL}/products/${id}`);
  return res.data;
};

export const getCart = async (userId: string): Promise<ICartItem[]> => {
  const res = await axios.get<ICartItem[]>(`${API_BASE_URL}/cart/${userId}`);
  return res.data;
};

export const addToCart = async (cartData: AddToCartRequest): Promise<void> => {
  await axios.post(`${API_BASE_URL}/cart/add`, cartData);
};

export const removeFromCart = async (
  userId: string,
  productId: number
): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/cart/${userId}/${productId}`);
};

export const clearCart = async (userId: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/cart/clear/${userId}`);
};

export const searchProducts = async (query: string): Promise<IProduct[]> => {
  if (!query.trim()) return [];
  const res = await axios.get<IProduct[]>(`${API_BASE_URL}/search?q=${query}`);
  return res.data;
};

export const createOrder = async (
  orderData: CreateOrderRequest
): Promise<CreateOrderResponse> => {
  const res = await axios.post<CreateOrderResponse>(
    `${API_BASE_URL}/checkout`,
    orderData
  );
  return res.data;
};

// ==== Admin CRUD Products ====
//  Upload ảnh lên Cloudinary
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ecommerce");

  const res = await axios.post(CLOUDINARY_URL, formData);

  return res.data.secure_url; // link ảnh trả về
};

export const addProduct = async (
  product: Partial<IProduct>,
  imageFile?: File
) => {
  let imageUrl = product.image;

  if (imageFile) {
    imageUrl = await uploadImageToCloudinary(imageFile);
  }

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const payload = { ...product, user_id: user.id };
  if (imageUrl !== undefined) {
    payload.image = imageUrl as string;
  }

  const res = await axios.post(`${API_BASE_URL}/products`, payload);

  return res.data;
};

//  Update Product
export const updateProduct = async (
  id: number,
  product: Partial<IProduct>,
  imageFile?: File
) => {
  let imageUrl = product.image;

  if (imageFile) {
    imageUrl = await uploadImageToCloudinary(imageFile);
  }

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const payload = { ...product, user_id: user.id };
  if (imageUrl !== undefined) {
    payload.image = imageUrl as string;
  }

  const res = await axios.put(`${API_BASE_URL}/products/${id}`, payload);

  return res.data;
};

//  Delete Product
export const deleteProduct = async (id: number) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const res = await axios.delete(`${API_BASE_URL}/products/${id}`, {
    data: { user_id: user.id },
  });
  return res.data;
};

export const toggleProductStatus = async (id: number, status: boolean) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const res = await fetch(`${API_BASE_URL}/products/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, user_id: user.id }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
};

export const getOrders = async () => {
  const res = await axios.get(`${API_BASE_URL}/orders`);
  console.log(res.data);
  return res.data;
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
};

export const getHistory = async () => {
  const response = await fetch(`${API_BASE_URL}/history`);
  if (!response.ok) {
    throw new Error("Failed to fetch history");
  }
  return response.json();
};
