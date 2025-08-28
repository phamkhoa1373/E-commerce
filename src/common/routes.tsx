import HomePage from "../Pages/HomePage";
import ProductsPage from "../Pages/ProductsPage";
import ProductDetailPage from "../Pages/ProductDetailPage";
import LoginPage from "../Pages/LoginPage";
import RegisterPage from "../Pages/RegisterPage";
import CartPage from "../Pages/CartPage";
import CheckoutPage from "@/Pages/CheckOutPage";
import Layout from "@components/layout/Layout";
import type { FC, ReactNode } from "react";
import AdminPage from "@/components/layout/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

export interface AppRoute {
  path: string;
  element: ReactNode;
  layout?: FC<{ children: ReactNode }>;
}

export const routes = [
  {
    path: "/",
    element: <HomePage />,
    layout: Layout,
  },
  {
    path: "/products",
    element: <ProductsPage />,
    layout: Layout,
  },
  {
    path: "/products/:id",
    element: <ProductDetailPage />,
    layout: Layout,
  },
  {
    path: "/products/category/:categoryId",
    element: <ProductsPage />,
    layout: Layout,
  },
  {
    path: "/login",
    element: <LoginPage />,
    layout: Layout,
  },
  {
    path: "/register",
    element: <RegisterPage />,
    layout: Layout,
  },
  {
    path: "/cart",
    element: (
      <ProtectedRoute allowedRoles={["user"]}>
        <CartPage />
      </ProtectedRoute>
    ),
    layout: Layout,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/checkout",
    element: (
      <ProtectedRoute allowedRoles={["user"]}>
        <CheckoutPage />
      </ProtectedRoute>
    ),
    layout: Layout,
  },
];
