"use server";

import prisma from "@/lib/prisma";

export async function getDashboardMetrics() {
  const now = new Date();

  // 1. Today's start date
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 2. This month's start date
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Today's Invoices
  const todayInvoices = await prisma.invoice.findMany({
    where: { date: { gte: startOfToday } },
  });
  const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  // Monthly Invoices
  const monthlyInvoices = await prisma.invoice.findMany({
    where: { date: { gte: startOfMonth } },
  });

  const monthlyRevenue = monthlyInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  const gstMonthlyInvoices = monthlyInvoices.filter((i) => i.type === "GST");
  const nonGstMonthlyInvoices = monthlyInvoices.filter((i) => i.type === "NON_GST");

  const gstMonthlySales = gstMonthlyInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const nonGstMonthlySales = nonGstMonthlyInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  // Total Customers
  const totalCustomers = await prisma.customer.count();

  // Total Products & Low Stock Alerts
  const products = await prisma.product.findMany({
    include: {
      items: {
        where: { status: "IN_STOCK" },
      },
    },
  });

  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => p.items.length <= p.minStock).length;

  // Monthly Chart Data (Last 7 Days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString("en-US", { weekday: "short" });
    const dateStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dateEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

    return { dayStr, dateStart, dateEnd };
  });

  const allInvoicesLast7Days = await prisma.invoice.findMany({
    where: {
      date: { gte: last7Days[0].dateStart },
    },
  });

  const chartData = last7Days.map(({ dayStr, dateStart, dateEnd }) => {
    const dayInvoices = allInvoicesLast7Days.filter(
      (inv) => inv.date >= dateStart && inv.date <= dateEnd
    );
    const gstSales = dayInvoices
      .filter((inv) => inv.type === "GST")
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const nonGstSales = dayInvoices
      .filter((inv) => inv.type === "NON_GST")
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    return {
      name: dayStr,
      GST: gstSales,
      "Non-GST": nonGstSales,
    };
  });

  return {
    todaySales,
    monthlyRevenue,
    gstMonthlySales,
    gstMonthlyCount: gstMonthlyInvoices.length,
    nonGstMonthlySales,
    nonGstMonthlyCount: nonGstMonthlyInvoices.length,
    totalCustomers,
    totalProducts,
    lowStockCount,
    chartData,
  };
}
