"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const brand = (formData.get("brand") as string)?.trim() || null;
  const category = (formData.get("category") as string)?.trim() || null;
  const productType = (formData.get("productType") as string) || "Accessories";
  const inventoryType = (formData.get("inventoryType") as string) || "GST"; // GST or NON_GST
  const sku = (formData.get("sku") as string)?.trim() || null;
  const barcode = (formData.get("barcode") as string)?.trim() || null;
  const hsnCode = (formData.get("hsnCode") as string)?.trim() || "8517";

  const purchasePrice = parseFloat(formData.get("purchasePrice") as string) || 0;
  const mrp = parseFloat(formData.get("mrp") as string) || 0;
  const gstPercentage = parseFloat(formData.get("gstPercentage") as string) || 0;
  const minStock = parseInt(formData.get("minStock") as string) || 5;

  // Fields for specific items
  const imei1 = (formData.get("imei1") as string)?.trim() || null;
  const imei2 = (formData.get("imei2") as string)?.trim() || null;
  const serialNumber = (formData.get("serialNumber") as string)?.trim() || null;
  const color = (formData.get("color") as string)?.trim() || null;
  const storage = (formData.get("storage") as string)?.trim() || null;
  const batteryHealth = (formData.get("batteryHealth") as string)?.trim() || null;
  const modelNumber = (formData.get("modelNumber") as string)?.trim() || null;
  const initialStockQuantity = parseInt(formData.get("stock") as string) || 0;

  if (!name || name.trim().length === 0) {
    return { success: false, error: "Product name is required" };
  }

  try {
    // 1. Create Product Template
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        brand,
        category,
        productType,
        inventoryType,
        sku,
        barcode,
        hsnCode,
        purchasePrice,
        mrp,
        gstPercentage: inventoryType === "NON_GST" ? 0 : gstPercentage,
        minStock,
      },
    });

    // 2. Create physical stock items
    if (imei1 || serialNumber || initialStockQuantity > 0) {
      if (imei1 || serialNumber) {
        await prisma.inventoryItem.create({
          data: {
            productId: product.id,
            imei1,
            imei2,
            serialNumber,
            color,
            storage,
            batteryHealth,
            modelNumber,
            status: "IN_STOCK",
          },
        });
      } else {
        const itemsToCreate = Array.from({ length: Math.max(1, initialStockQuantity) }).map(() => ({
          productId: product.id,
          status: "IN_STOCK",
        }));
        await prisma.inventoryItem.createMany({
          data: itemsToCreate,
        });
      }
    }

    revalidatePath("/inventory");
    return { success: true, inventoryType };
  } catch (e: any) {
    console.error("Error creating product:", e);
    return { success: false, error: e.message || "Failed to create product" };
  }
}

export async function getProducts(inventoryTypeFilter?: string) {
  try {
    const whereCondition = inventoryTypeFilter ? { inventoryType: inventoryTypeFilter } : {};

    const products = await prisma.product.findMany({
      where: whereCondition,
      include: {
        items: {
          where: { status: "IN_STOCK" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return products.map(p => ({
      ...p,
      stock: p.items.length
    }));
  } catch (e) {
    console.error("Error fetching products:", e);
    return [];
  }
}

export async function updateProduct(id: string, formData: FormData) {
  if (!id) return { success: false, error: "Product ID required" };

  const name = formData.get("name") as string;
  const brand = formData.get("brand") as string;
  const sku = formData.get("sku") as string;
  const barcode = formData.get("barcode") as string;
  const hsnCode = formData.get("hsnCode") as string;
  const mrp = parseFloat(formData.get("mrp") as string) || 0;
  const purchasePrice = parseFloat(formData.get("purchasePrice") as string) || 0;
  const gstPercentage = parseFloat(formData.get("gstPercentage") as string) || 0;
  const minStock = parseInt(formData.get("minStock") as string) || 5;
  const addStockQty = parseInt(formData.get("addStockQty") as string) || 0;

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        brand: brand || null,
        sku: sku || null,
        barcode: barcode || null,
        hsnCode: hsnCode || null,
        mrp,
        purchasePrice,
        gstPercentage,
        minStock,
      },
    });

    if (addStockQty > 0) {
      const itemsToCreate = Array.from({ length: addStockQty }).map(() => ({
        productId: id,
        status: "IN_STOCK",
      }));
      await prisma.inventoryItem.createMany({
        data: itemsToCreate,
      });
    }

    revalidatePath("/inventory");
    revalidatePath("/reports");
    revalidatePath("/");
    return { success: true, product: updated };
  } catch (e: any) {
    console.error("Failed to update product:", e);
    return { success: false, error: e.message || "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  if (!id) return { success: false, error: "Product ID required" };

  try {
    // 1. Delete associated in-stock inventory items that haven't been sold
    await prisma.inventoryItem.deleteMany({
      where: { productId: id, status: "IN_STOCK" },
    });

    // 2. Delete product record
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/inventory");
    revalidatePath("/reports");
    revalidatePath("/");
    return { success: true };
  } catch (e: any) {
    console.error("Failed to delete product:", e);
    return { success: false, error: e.message || "Failed to delete product" };
  }
}

export async function searchInventoryItems(query: string, invoiceType: "GST" | "NON_GST" = "GST") {
  if (!query || query.trim().length === 0) return [];

  const searchTerm = query.trim();

  // 1. Find Products strictly by inventoryType ("GST" vs "NON_GST")
  const products = await prisma.product.findMany({
    where: {
      inventoryType: invoiceType,
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { brand: { contains: searchTerm, mode: "insensitive" } },
        { sku: { contains: searchTerm, mode: "insensitive" } },
        { barcode: { contains: searchTerm, mode: "insensitive" } },
      ]
    },
    include: {
      items: {
        where: { status: "IN_STOCK" }
      }
    },
    take: 10
  });

  // 2. Find InventoryItems strictly by inventoryType
  const inventoryItems = await prisma.inventoryItem.findMany({
    where: {
      status: "IN_STOCK",
      product: {
        inventoryType: invoiceType
      },
      OR: [
        { imei1: { contains: searchTerm, mode: "insensitive" } },
        { imei2: { contains: searchTerm, mode: "insensitive" } },
        { serialNumber: { contains: searchTerm, mode: "insensitive" } },
      ]
    },
    include: {
      product: true
    },
    take: 10
  });

  const results: Array<{
    id: string;
    inventoryItemId?: string;
    displayName: string;
    name: string;
    brand: string | null;
    modelNumber?: string | null;
    productType: string;
    mrp: number;
    gstPercentage: number;
    hsnCode: string | null;
    imei1?: string | null;
    imei2?: string | null;
    serialNumber?: string | null;
    storage?: string | null;
    color?: string | null;
  }> = [];

  // Format Specific Items (IMEI / Serial Number) according to exact prompt rules
  for (const item of inventoryItems) {
    const isPhone = item.product.productType === "iPhone" || item.product.productType === "Android Phone" || item.product.category?.toLowerCase().includes("phone");
    let displayTitle = item.product.name;
    let detailsString = "";

    if (isPhone) {
      // Requirement 4: Phone Product Details (Brand, Model, Storage, IMEI)
      if (item.storage) detailsString += `${item.storage}`;
      if (item.imei1) detailsString += `${detailsString ? " | " : ""}IMEI: ${item.imei1}`;
    } else {
      // Requirement 5: Accessories Details (Brand, Model, Serial Number)
      if (item.modelNumber) detailsString += `Model: ${item.modelNumber}`;
      if (item.serialNumber) detailsString += `${detailsString ? " | " : ""}Serial No: ${item.serialNumber}`;
    }

    const fullDisplayName = detailsString ? `${displayTitle} (${detailsString})` : displayTitle;

    results.push({
      id: item.product.id,
      inventoryItemId: item.id,
      displayName: fullDisplayName,
      name: item.product.name,
      brand: item.product.brand,
      modelNumber: item.modelNumber,
      productType: item.product.productType,
      mrp: item.product.mrp,
      gstPercentage: invoiceType === "NON_GST" ? 0 : item.product.gstPercentage,
      hsnCode: item.product.hsnCode,
      imei1: item.imei1,
      imei2: item.imei2,
      serialNumber: item.serialNumber,
      storage: item.storage,
      color: item.color,
    });
  }

  // Add General Products
  for (const p of products) {
    if (!results.some(r => r.id === p.id && !r.inventoryItemId)) {
      results.push({
        id: p.id,
        displayName: `${p.name} (In Stock: ${p.items.length})`,
        name: p.name,
        brand: p.brand,
        productType: p.productType,
        mrp: p.mrp,
        gstPercentage: invoiceType === "NON_GST" ? 0 : p.gstPercentage,
        hsnCode: p.hsnCode,
      });
    }
  }

  return results;
}
