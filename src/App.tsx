import "./App.css";
import { Routes, Route } from "react-router-dom";
import Toast from "./components/ui/Toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routes, type AppRoute } from "@common/routes";
import { CartProvider } from "./context";
import React, { type ReactNode, type FC } from "react";

const queryClient = new QueryClient();

interface LayoutWrapperProps {
  children: ReactNode;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Toast />
        <Routes>
          {routes.map(({ path, element, layout }: AppRoute) => {
            const Wrapper: FC<LayoutWrapperProps> =
              layout || (({ children }) => <>{children}</>);
            return (
              <Route
                key={path}
                path={path}
                element={<Wrapper>{element}</Wrapper>}
              />
            );
          })}
        </Routes>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
