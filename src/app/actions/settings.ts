"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface StoreSettingsData {
  storeName: string;
  address: string;
  mobiles: string;
  email: string;
  gstin: string;
  gstPrefix: string;
  nonGstPrefix: string;
  defaultPaymentMode: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  accountName: string;
  upiId: string;
}

const DEFAULT_SETTINGS: StoreSettingsData = {
  storeName: "iVerse Store",
  address: "Company Bagh Road, Behind Govt. Hospital, Alwar, Rajasthan - 301001",
  mobiles: "9462359499, 9079757323, 9024434685",
  email: "iversestore01@gmail.com",
  gstin: "08IYBPS5424R2ZH",
  gstPrefix: "TAX-2026-",
  nonGstPrefix: "INV-NGST-",
  defaultPaymentMode: "Cash",
  bankName: "HDFC Bank Ltd",
  accountNumber: "50200012345678",
  ifsc: "HDFC0001234",
  accountName: "iVerse Store",
  upiId: "iverse@hdfcbank",
};

export async function getStoreSettings(): Promise<StoreSettingsData> {
  try {
    let settings = await prisma.storeSetting.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.storeSetting.create({
        data: {
          id: "default",
          ...DEFAULT_SETTINGS,
        },
      });
    }

    return {
      storeName: settings.storeName,
      address: settings.address,
      mobiles: settings.mobiles,
      email: settings.email,
      gstin: settings.gstin,
      gstPrefix: settings.gstPrefix,
      nonGstPrefix: settings.nonGstPrefix,
      defaultPaymentMode: settings.defaultPaymentMode,
      bankName: settings.bankName,
      accountNumber: settings.accountNumber,
      ifsc: settings.ifsc,
      accountName: settings.accountName,
      upiId: settings.upiId,
    };
  } catch (e) {
    console.error("Error fetching store settings:", e);
    return DEFAULT_SETTINGS;
  }
}

export async function updateStoreSettings(data: StoreSettingsData) {
  try {
    const updated = await prisma.storeSetting.upsert({
      where: { id: "default" },
      update: { ...data },
      create: { id: "default", ...data },
    });

    revalidatePath("/settings");
    revalidatePath("/invoice/gst");
    revalidatePath("/invoice/chalan");
    revalidatePath("/");
    return { success: true, settings: updated };
  } catch (e: any) {
    console.error("Error updating store settings:", e);
    return { success: false, error: e.message || "Failed to update settings" };
  }
}
