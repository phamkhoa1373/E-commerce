export interface IProduct {
  id: number;
  name: string;
  price: number;
  categoryId?: number;
  addedAt?: string;
  image: string;
  description: string;
  stock: number;
  status: boolean;
}

export interface ICategory {
  id: number;
  name: string;
  products: number;
  description: string;
  image: string;
}

export interface IRegisterResponse {
  detail?: string;
  message?: string;
}

export interface INavigate {
  (path: string): void;
}

export interface ICartItem {
  products: IProduct;
  id: number;
  product_id: number;
  quantity: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  session: {
    access_token: string;
  };
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
}

export interface RegisterResponse {
  detail?: string;
}

export interface AddToCartRequest {
  user_id: string;
  product_id: number;
  quantity: number;
}

export interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  user_id: string;
  shipping_name: string;
  shipping_address: string;
  shipping_phone: string;
  items: OrderItem[];
}

export interface CreateOrderResponse {
  message: string;
  order_id: number;
}

export interface ICartContextType {
  cartCount: number;
  setCartCount: (count: number) => void;
  incrementCartCount: (value?: number) => void;
}

export interface IOrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  products: {
    id: number;
    name: string;
    image: string;
  };
}

export interface IOrder {
  id: number;
  user_id: string;
  total_amount: number;
  shipping_name: string;
  shipping_address: string;
  shipping_phone: string;
  status: string;
  created_at: string;
  order_items: IOrderItem[];
}

export interface HistoryDetails {
  [key: string]: string | number | boolean | object | null;
}

export interface IHistoryItem {
  id: number;
  user_id: string;
  username: string;
  product_id: number;
  history: {
    action: "create" | "update" | "delete" | "status_change";
    details: HistoryDetails;
  };
  created_at: string;
  products?: {
    name: string;
  };
}
