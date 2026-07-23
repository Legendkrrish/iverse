"use client";

import { useEffect, useState } from "react";
import { getReportData } from "@/app/actions/report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IndianRupee,
  ReceiptText,
  FileText,
  Package,
  Printer,
  Calendar,
  ArrowUpRight,
  ShieldAlert,
  ShoppingBag,
} from "lucide-react";

export default function ReportsPage() {
  const [period, setPeriod] = useState<string>("month");
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);

  const fetchReports = async (p: string) => {
    setLoading(true);
    try {
      const res = await getReportData(p);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(period);
  }, [period]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track GST sales, Non-GST sales, tax calculations, and inventory health.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint} className="rounded-xl glass">
            <Printer className="mr-2 h-4 w-4" /> Print Summary
          </Button>
        </div>
      </div>

      {/* Period Filter Buttons */}
      <div className="flex items-center gap-2 border-b border-border/50 pb-4">
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mr-2">
          <Calendar className="h-4 w-4" /> Period:
        </span>
        {[
          { label: "Today", value: "today" },
          { label: "Last 7 Days", value: "week" },
          { label: "This Month", value: "month" },
          { label: "All Time", value: "all" },
        ].map((item) => (
          <Button
            key={item.value}
            variant={period === item.value ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(item.value)}
            className="rounded-xl transition-all"
          >
            {item.label}
          </Button>
        ))}
      </div>

      {loading || !data ? (
        <div className="glass-panel p-12 text-center text-muted-foreground rounded-2xl animate-pulse">
          Loading report metrics...
        </div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Revenue */}
            <Card className="glass-panel hover:-translate-y-1 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <IndianRupee className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold">
                  ₹{data.summary.grandTotalSales.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {data.summary.totalInvoices} total invoices
                </p>
              </CardContent>
            </Card>

            {/* GST Sales */}
            <Card className="glass-panel hover:-translate-y-1 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">TAX Invoice (GST) Sales</CardTitle>
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <ReceiptText className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                  ₹{data.summary.totalGstSales.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.summary.gstInvoiceCount} GST invoices generated
                </p>
              </CardContent>
            </Card>

            {/* Non-GST Sales */}
            <Card className="glass-panel hover:-translate-y-1 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Non-GST Invoice Sales</CardTitle>
                <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                  ₹{data.summary.totalNonGstSales.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.summary.nonGstInvoiceCount} Non-GST invoices generated
                </p>
              </CardContent>
            </Card>

            {/* Tax Collected */}
            <Card className="glass-panel hover:-translate-y-1 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total GST Collected</CardTitle>
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  ₹{data.summary.totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  CGST: ₹{data.summary.totalCgst.toFixed(2)} | SGST: ₹{data.summary.totalSgst.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tax Breakdown & Inventory Health Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Tax Breakdown Card */}
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ReceiptText className="h-5 w-5 text-primary" /> GST Tax Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Total Taxable Value</span>
                  <span className="font-semibold">
                    ₹{data.summary.totalTaxable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Central GST (CGST)</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{data.summary.totalCgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">State GST (SGST)</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{data.summary.totalSgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 font-bold text-lg">
                  <span>Total Tax Payable</span>
                  <span className="text-primary">
                    ₹{data.summary.totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Health Card */}
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" /> Inventory Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">GST Inventory Stock</span>
                  <span className="font-semibold">{data.inventory.totalGstStock} Units</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Non-GST Inventory Stock</span>
                  <span className="font-semibold">{data.inventory.totalNonGstStock} Units</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Total Valuation (MRP)</span>
                  <span className="font-semibold text-primary">
                    ₹{data.inventory.totalInventoryValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 font-semibold">
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <ShieldAlert className="h-4 w-4" /> Low Stock Items
                  </span>
                  <Badge variant="outline" className="border-amber-500 text-amber-600 font-mono">
                    {data.inventory.lowStockCount} Products
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Invoices Table */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border/50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold tracking-tight">Recent Invoices</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Showing latest transactions for the selected period.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto w-full">
              <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Invoice No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Taxable (₹)</TableHead>
                  <TableHead className="text-right">GST (₹)</TableHead>
                  <TableHead className="text-right">Grand Total (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                      No invoices found for this period.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.recentInvoices.map((inv: any) => (
                    <TableRow key={inv.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-mono font-bold">{inv.invoiceNumber}</TableCell>
                      <TableCell>{inv.date}</TableCell>
                      <TableCell>
                        <Badge
                          variant={inv.type === "GST" ? "default" : "secondary"}
                          className="font-semibold"
                        >
                          {inv.type === "GST" ? "TAX INVOICE" : "NON-GST"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{inv.customerName}</div>
                          <div className="text-xs text-muted-foreground">{inv.customerPhone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{inv.paymentMode}</TableCell>
                      <TableCell className="text-right font-mono">
                        ₹{inv.taxableAmount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ₹{(inv.cgst + inv.sgst).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono text-primary">
                        ₹{inv.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
