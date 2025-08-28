import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/api";
import type { IProduct } from "@/models/type";

export default function useProducts(categoryId?: number) {
  return useQuery<IProduct[], Error>({
    queryKey: ["products", categoryId],
    queryFn: () => getProducts(categoryId),
    enabled: true,
  });
}
