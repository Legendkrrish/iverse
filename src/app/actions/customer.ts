"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCustomers(query?: string) {
  const where = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { mobile: { contains: query, mode: "insensitive" as const } },
          { gstNumber: { contains: query, mode: "insensitive" as const } },
          { address: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const customers = await prisma.customer.findMany({
    where,
    include: {
      invoices: {
        select: {
          id: true,
          invoiceNumber: true,
          date: true,
          type: true,
          totalAmount: true,
          paymentMode: true,
          notes: true,
        },
        orderBy: { date: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return customers.map((c) => ({
    ...c,
    invoiceCount: c.invoices.length,
    totalSpent: c.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
  }));
}

export async function createCustomer(formData: FormData) {
  const name = formData.get("name") as string;
  const mobile = formData.get("mobile") as string;
  const address = formData.get("address") as string;
  const state = formData.get("state") as string;
  const pinCode = formData.get("pinCode") as string;
  const gstNumber = formData.get("gstNumber") as string;

  if (!name || name.trim().length === 0) {
    return { success: false, error: "Customer name is required" };
  }

  try {
    const customer = await prisma.customer.create({
      data: {
        name,
        mobile: mobile || null,
        address: address || null,
        state: state || null,
        pinCode: pinCode || null,
        gstNumber: gstNumber || null,
      },
    });

    revalidatePath("/customers");
    return { success: true, customer };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to create customer" };
  }
}

export async function updateCustomer(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const mobile = formData.get("mobile") as string;
  const address = formData.get("address") as string;
  const state = formData.get("state") as string;
  const pinCode = formData.get("pinCode") as string;
  const gstNumber = formData.get("gstNumber") as string;

  if (!id) return { success: false, error: "Customer ID is required" };
  if (!name || name.trim().length === 0) {
    return { success: false, error: "Customer name is required" };
  }

  try {
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        mobile: mobile || null,
        address: address || null,
        state: state || null,
        pinCode: pinCode || null,
        gstNumber: gstNumber || null,
      },
    });

    revalidatePath("/customers");
    return { success: true, customer };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to update customer" };
  }
}

export async function deleteCustomer(id: string) {
  if (!id) return { success: false, error: "Customer ID is required" };

  try {
    // Unlink customer from invoices first to avoid foreign key constraint error
    await prisma.invoice.updateMany({
      where: { customerId: id },
      data: { customerId: null },
    });

    await prisma.customer.delete({
      where: { id },
    });

    revalidatePath("/customers");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to delete customer" };
  }
}

export async function getCustomerInvoices(customerId: string) {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { customerId },
      include: {
        customer: true,
        items: {
          include: {
            inventoryItem: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });
    return { success: true, invoices };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to fetch invoices" };
  }
}
