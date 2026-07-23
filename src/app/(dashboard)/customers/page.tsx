import { getCustomers } from "@/app/actions/customer";
import { CustomerClient } from "./components/CustomerClient";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <CustomerClient initialCustomers={customers} />
  );
}
