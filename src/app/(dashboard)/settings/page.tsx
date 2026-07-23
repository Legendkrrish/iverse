"use client";

import { useEffect, useState } from "react";
import { getStoreSettings, updateStoreSettings } from "@/app/actions/settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, FileText, Building2, ShieldCheck, Save, CheckCircle2, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Store Details State
  const [storeName, setStoreName] = useState("iVerse Store");
  const [address, setAddress] = useState("Company Bagh Road, Behind Govt. Hospital, Alwar, Rajasthan - 301001");
  const [mobiles, setMobiles] = useState("9462359499, 9079757323, 9024434685");
  const [email, setEmail] = useState("iversestore01@gmail.com");
  const [gstin, setGstin] = useState("08IYBPS5424R2ZH");

  // Invoice Prefixes
  const [gstPrefix, setGstPrefix] = useState("TAX-2026-");
  const [nonGstPrefix, setNonGstPrefix] = useState("INV-NGST-");
  const [defaultPaymentMode, setDefaultPaymentMode] = useState("Cash");

  // Bank Info
  const [bankName, setBankName] = useState("HDFC Bank Ltd");
  const [accountNumber, setAccountNumber] = useState("50200012345678");
  const [ifsc, setIfsc] = useState("HDFC0001234");
  const [accountName, setAccountName] = useState("iVerse Store");
  const [upiId, setUpiId] = useState("iverse@hdfcbank");

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const data = await getStoreSettings();
        if (data) {
          setStoreName(data.storeName);
          setAddress(data.address);
          setMobiles(data.mobiles);
          setEmail(data.email);
          setGstin(data.gstin);
          setGstPrefix(data.gstPrefix);
          setNonGstPrefix(data.nonGstPrefix);
          setDefaultPaymentMode(data.defaultPaymentMode);
          setBankName(data.bankName);
          setAccountNumber(data.accountNumber);
          setIfsc(data.ifsc);
          setAccountName(data.accountName);
          setUpiId(data.upiId);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const settingsData = {
      storeName,
      address,
      mobiles,
      email,
      gstin,
      gstPrefix,
      nonGstPrefix,
      defaultPaymentMode,
      bankName,
      accountNumber,
      ifsc,
      accountName,
      upiId,
    };

    const res = await updateStoreSettings(settingsData);
    setIsSaving(false);

    if (res.success) {
      localStorage.setItem("iverse_settings", JSON.stringify(settingsData));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } else {
      alert(res.error || "Failed to save settings to database");
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading Store Settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure store profile, invoice prefixes, bank details, and warranty terms. (Database Synced)
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="rounded-xl bg-primary text-primary-foreground">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving to DB...
            </>
          ) : savedSuccess ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Saved!
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save All Settings
            </>
          )}
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" /> Settings saved to Database & synced across all invoices!
        </div>
      )}

      {/* 1. Store Profile */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" /> Store Information
          </CardTitle>
          <CardDescription>
            These details appear on printed TAX and Non-GST Invoices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label>GSTIN Number</Label>
              <Input
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="bg-background font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mobile Number(s)</Label>
              <Input
                value={mobiles}
                onChange={(e) => setMobiles(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label>Store Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Invoice Prefixes */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Invoice Configuration
          </CardTitle>
          <CardDescription>
            Set default prefixes and payment options for billing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>TAX Invoice Prefix</Label>
              <Input
                value={gstPrefix}
                onChange={(e) => setGstPrefix(e.target.value)}
                className="bg-background font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label>Non-GST Invoice Prefix</Label>
              <Input
                value={nonGstPrefix}
                onChange={(e) => setNonGstPrefix(e.target.value)}
                className="bg-background font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label>Default Payment Mode</Label>
              <Input
                value={defaultPaymentMode}
                onChange={(e) => setDefaultPaymentMode(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Bank Account Details */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Bank & UPI Details (TAX Invoice)
          </CardTitle>
          <CardDescription>
            These payment details appear exclusively on GST Tax Invoices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label>Account Name</Label>
              <Input
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="bg-background font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label>IFSC Code</Label>
              <Input
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value)}
                className="bg-background font-mono uppercase"
              />
            </div>

            <div className="space-y-2">
              <Label>UPI ID</Label>
              <Input
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="bg-background font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Warranty Terms Status */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Warranty Terms & Conditions (Non-GST)
          </CardTitle>
          <CardDescription>
            Configured with official 11-point warranty terms for Non-GST Invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs text-muted-foreground bg-muted/30 p-4 rounded-xl font-mono leading-relaxed">
            <p>1. Warranty Period: 15 days from purchase date.</p>
            <p>2. Water & Damage: No coverage for liquid, drops, scratches, or physical damage.</p>
            <p>3. Display: No warranty on screen, touch, dead pixels, or lines.</p>
            <p>4. Repair Only Policy: Only repair service provided. No return/replacement.</p>
            <p>5. Original Invoice Required for any warranty claim.</p>
            <p>6. Warranty Void if opened or repaired by unauthorized technicians.</p>
            <p>7. Software Issues: No coverage for OS failures or user modifications.</p>
            <p>8. Accessories: No warranty on charger, cable, box unless noted.</p>
            <p>9. Repair Time: 2–7 working days.</p>
            <p>10. Used/Refurbished: Covers functional defects only.</p>
            <p>11. Final Decision: Approval/rejection rests solely with iVerse Store.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg" className="rounded-xl bg-primary text-primary-foreground">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving to DB...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save All Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
