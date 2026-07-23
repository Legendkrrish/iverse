"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface CreateInvoiceParams {
  invoiceNumber: string;
  type: "GST" | "NON_GST";
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerGst?: string;
  paymentMode: string;
  items: Array<{
    productId?: string;
    inventoryItemId?: string;
    name: string;
    qty: number;
    mrp: number;
    discount: number;
    gst: number;
  }>;
  subTotal: number;
  discount?: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  roundOff: number;
  grandTotal: number;
  notes?: string;
}

export async function saveInvoice(params: CreateInvoiceParams) {
  try {
    // 1. Find or create Customer if mobile number is provided
    let customerId: string | undefined = undefined;
    if (params.customerPhone && params.customerPhone.trim().length > 0) {
      let customer = await prisma.customer.findFirst({
        where: { mobile: params.customerPhone.trim() }
      });

      if (!customer && params.customerName) {
        customer = await prisma.customer.create({
          data: {
            name: params.customerName,
            mobile: params.customerPhone,
            address: params.customerAddress,
            gstNumber: params.customerGst
          }
        });
      }
      if (customer) {
        customerId = customer.id;
      }
    }

    // 2. Create Invoice Record
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: params.invoiceNumber,
        type: params.type,
        customerId: customerId || null,
        paymentMode: params.paymentMode,
        subTotal: params.subTotal,
        discount: params.discount || 0,
        taxableAmount: params.taxableAmount,
        cgst: params.cgst,
        sgst: params.sgst,
        totalAmount: params.grandTotal,
        roundOff: params.roundOff,
        notes: params.notes || null,
        status: "COMPLETED",
        items: {
          create: params.items.map(item => ({
            quantity: item.qty,
            rate: item.mrp - item.discount,
            gstPercentage: item.gst,
            discount: item.discount,
            amount: (item.mrp - item.discount) * item.qty
          }))
        }
      }
    });

    // 3. Auto-Deduct Inventory Stock by marking specific InventoryItems as SOLD
    for (const item of params.items) {
      if (item.inventoryItemId) {
        await prisma.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: {
            status: "SOLD",
            invoiceItemId: invoice.id // link to sale
          }
        });
      }
    }

    revalidatePath("/inventory");
    revalidatePath("/reports");
    revalidatePath("/");

    return { success: true, invoiceId: invoice.id };
  } catch (error: any) {
    console.error("Failed to save invoice", error);
    return { success: false, error: error.message || "Failed to save invoice" };
  }
}
