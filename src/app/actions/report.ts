"use server";

import prisma from "@/lib/prisma";

export async function getReportData(period: string = "month") {
  const now = new Date();
  let startDate: Date | undefined;

  if (period === "today") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === "week") {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === "year") {
    startDate = new Date(now.getFullYear(), 0, 1);
  }

  const whereClause = startDate ? { date: { gte: startDate } } : {};

  const invoices = await prisma.invoice.findMany({
    where: whereClause,
    include: {
      customer: true,
      items: true,
    },
    orderBy: { date: "desc" },
  });

  const gstInvoices = invoices.filter((i) => i.type === "GST");
  const nonGstInvoices = invoices.filter((i) => i.type === "NON_GST");

  const totalGstSales = gstInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalNonGstSales = nonGstInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const grandTotalSales = totalGstSales + totalNonGstSales;

  const totalCgst = gstInvoices.reduce((sum, i) => sum + i.cgst, 0);
  const totalSgst = gstInvoices.reduce((sum, i) => sum + i.sgst, 0);
  const totalTaxable = gstInvoices.reduce((sum, i) => sum + i.taxableAmount, 0);

  // Inventory stats
  const products = await prisma.product.findMany({
    include: {
      items: true,
    },
  });

  let totalGstStock = 0;
  let totalNonGstStock = 0;
  let totalInventoryValue = 0;
  let lowStockCount = 0;

  products.forEach((p) => {
    const inStockCount = p.items.filter((item) => item.status === "IN_STOCK").length;
    if (p.inventoryType === "GST") {
      totalGstStock += inStockCount;
    } else {
      totalNonGstStock += inStockCount;
    }
    totalInventoryValue += inStockCount * p.mrp;
    if (inStockCount <= p.minStock) {
      lowStockCount++;
    }
  });

  const soldItemsCount = await prisma.inventoryItem.count({
    where: { status: "SOLD" },
  });

  return {
    period,
    summary: {
      grandTotalSales,
      totalGstSales,
      totalNonGstSales,
      gstInvoiceCount: gstInvoices.length,
      nonGstInvoiceCount: nonGstInvoices.length,
      totalInvoices: invoices.length,
      totalTaxable,
      totalCgst,
      totalSgst,
      totalTax: totalCgst + totalSgst,
    },
    inventory: {
      totalGstStock,
      totalNonGstStock,
      totalStock: totalGstStock + totalNonGstStock,
      totalInventoryValue,
      lowStockCount,
      soldItemsCount,
    },
    recentInvoices: invoices.slice(0, 15).map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      date: inv.date.toISOString().split("T")[0],
      type: inv.type,
      customerName: inv.customer?.name || "Walk-in Customer",
      customerPhone: inv.customer?.mobile || "-",
      totalAmount: inv.totalAmount,
      taxableAmount: inv.taxableAmount,
      cgst: inv.cgst,
      sgst: inv.sgst,
      paymentMode: inv.paymentMode,
      itemCount: inv.items.length,
    })),
  };
}
