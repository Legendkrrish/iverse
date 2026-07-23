"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { searchInventoryItems } from "@/app/actions/product";
import { Loader2 } from "lucide-react";

interface ProductSearchResult {
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
}

interface ProductSearchInputProps {
  value: string;
  invoiceType?: "GST" | "NON_GST";
  onChange: (value: string) => void;
  onSelectProduct: (product: ProductSearchResult) => void;
  placeholder?: string;
}

export function ProductSearchInput({
  value,
  invoiceType = "GST",
  onChange,
  onSelectProduct,
  placeholder = "Search product, IMEI, serial..."
}: ProductSearchInputProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 1 && isOpen) {
        setIsLoading(true);
        try {
          const res = await searchInventoryItems(query, invoiceType);
          setResults(res);
        } catch (error) {
          console.error("Failed to search inventory", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen, invoiceType]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="h-9 border-none bg-black/5 dark:bg-white/5 pr-8"
        />
        {isLoading && (
          <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-60 overflow-y-auto glass-panel p-1 rounded-xl shadow-xl border border-border bg-background text-foreground">
          {results.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onSelectProduct(item);
                setQuery(item.displayName);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex flex-col gap-0.5 cursor-pointer"
            >
              <div className="font-medium flex justify-between items-center">
                <span>{item.displayName}</span>
                <span className="text-xs font-semibold text-primary">₹{item.mrp}</span>
              </div>
              <div className="text-[11px] text-muted-foreground flex gap-3 flex-wrap">
                {item.storage && <span>{item.storage}</span>}
                {item.color && <span>{item.color}</span>}
                {invoiceType === "GST" && item.gstPercentage > 0 && <span>GST: {item.gstPercentage}%</span>}
                {invoiceType === "GST" && item.hsnCode && <span>HSN: {item.hsnCode}</span>}
                <span className="capitalize text-xs font-medium text-blue-600 dark:text-blue-400">
                  [{invoiceType} Inventory]
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
