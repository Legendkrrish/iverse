import { getCustomers } from "@/app/actions/customer";
import { CustomerClient } from "./components/CustomerClient";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <CustomerClient initialCustomers={customers} />
  );
}
