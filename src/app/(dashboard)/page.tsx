import { getDashboardMetrics } from "@/app/actions/dashboard";
import { getStoreSettings } from "@/app/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  IndianRupee, 
  Users, 
  Package, 
  AlertTriangle, 
  TrendingUp,
  ReceiptText,
  FileText
} from "lucide-react";
import { DashboardCharts } from "./components/DashboardCharts";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [metrics, settings] = await Promise.all([
    getDashboardMetrics(),
    getStoreSettings(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header with Store Logo & Synced DB Store Address */}
      <div className="flex items-center gap-4">
        <img src="/logo.png" alt="iVerse Store" className="h-14 w-auto object-contain" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{settings.storeName}</h1>
          <p className="text-muted-foreground mt-1">
            {settings.address} — <span className="font-mono text-foreground font-semibold">{settings.mobiles}</span>
          </p>
        </div>
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Today's Sales */}
        <Card className="glass-panel hover:-translate-y-1 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <IndianRupee className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ₹{metrics.todaySales.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Live today from database
            </p>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="glass-panel hover:-translate-y-1 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{metrics.monthlyRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current calendar month
            </p>
          </CardContent>
        </Card>

        {/* GST Sales */}
        <Card className="glass-panel hover:-translate-y-1 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GST Sales (Month)</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <ReceiptText className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ₹{metrics.gstMonthlySales.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.gstMonthlyCount} TAX Invoices generated
            </p>
          </CardContent>
        </Card>

        {/* Non-GST Sales */}
        <Card className="glass-panel hover:-translate-y-1 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non-GST Invoice Sales</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              ₹{metrics.nonGstMonthlySales.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.nonGstMonthlyCount} Non-GST Invoices generated
            </p>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="glass-panel hover:-translate-y-1 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered customer profiles
            </p>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card className="glass-panel hover:-translate-y-1 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active product templates
            </p>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="glass-panel border-destructive/20 hover:-translate-y-1 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Low Stock Alerts</CardTitle>
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center animate-pulse">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.lowStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Products at or below min stock threshold
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Sales Chart Section */}
      <DashboardCharts chartData={metrics.chartData} />
    </div>
  );
}
