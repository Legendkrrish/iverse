import { getProducts } from "@/app/actions/product";
import { InventoryClient } from "./components/InventoryClient";

export default async function InventoryPage({
  searchParams
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const params = await searchParams;
  const inventoryType = params.type || "GST";
  const products = await getProducts(inventoryType);
  
  return (
    <InventoryClient initialProducts={products} inventoryType={inventoryType} />
  );
}
