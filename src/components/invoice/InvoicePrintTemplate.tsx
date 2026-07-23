"use client";

import React from "react";

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  paymentMode: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerGst?: string;
  items: Array<{
    name: string;
    brand?: string | null;
    modelNumber?: string | null;
    storage?: string | null;
    imei1?: string | null;
    serialNumber?: string | null;
    hsnCode?: string;
    qty: number;
    mrp: number;
    discount: number;
    gst: number;
  }>;
  subTotal: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  roundOff: number;
  grandTotal: number;
  notes?: string;
  storeSettings?: {
    storeName?: string;
    address?: string;
    mobiles?: string;
    email?: string;
    gstin?: string;
    bankName?: string;
    accountNumber?: string;
    ifsc?: string;
    accountName?: string;
    upiId?: string;
  };
  type: "GST" | "NON_GST";
}

export const InvoicePrintTemplate = React.forwardRef<HTMLDivElement, { data: InvoiceData }>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        id="printable-invoice"
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "28px 32px",
          backgroundColor: "#ffffff",
          color: "#000000",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          boxSizing: "border-box",
          margin: "0 auto",
          border: "1px solid #e5e7eb"
        }}
      >
        {/* Logo + Store Name + Invoice Heading */}
        <div style={{ textAlign: "center", marginBottom: "12px", paddingBottom: "10px", borderBottom: "2px solid #000000" }}>
          <img
            src="/logo.png"
            alt="iVerse Logo"
            style={{ height: "95px", width: "auto", objectFit: "contain", marginBottom: "6px" }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <h2 style={{ fontSize: "20px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "3px", color: "#000000", margin: "6px 0 0 0" }}>
            {data.type === "GST" ? "TAX INVOICE" : "INVOICE"}
          </h2>
        </div>

        {/* Store Details + Invoice Meta */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "10px", marginBottom: "12px", borderBottom: "1px solid #d1d5db" }}>
          <div>
            <p style={{ fontSize: "11px", color: "#374151", margin: "0 0 1px 0" }}>{data.storeSettings?.address || "Company Bagh Road, Behind Govt. Hospital, Alwar, Rajasthan - 301001"}</p>
            <p style={{ fontSize: "11px", color: "#374151", margin: "0 0 1px 0" }}>Mob: {data.storeSettings?.mobiles || "9462359499, 9079757323, 9024434685"}</p>
            <p style={{ fontSize: "11px", color: "#374151", margin: "0 0 1px 0" }}>Email: {data.storeSettings?.email || "iversestore01@gmail.com"}</p>
            {data.type === "GST" && <p style={{ fontSize: "11px", fontWeight: "700", color: "#000000", margin: "3px 0 0 0" }}>GSTIN: {data.storeSettings?.gstin || "08IYBPS5424R2ZH"}</p>}
          </div>

          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "13px", fontWeight: "700", margin: 0 }}>
              Invoice No: <span style={{ fontFamily: "monospace", fontSize: "13px" }}>{data.invoiceNumber}</span>
            </p>
            <p style={{ fontSize: "11px", color: "#374151", margin: "3px 0 0 0" }}>Date: {data.invoiceDate}</p>
            <p style={{ fontSize: "11px", color: "#374151", margin: "2px 0 0 0" }}>Payment: {data.paymentMode.toUpperCase()}</p>
          </div>
        </div>

        {/* Customer Info Box */}
        <div style={{ border: "1px solid #000000", borderRadius: "4px", padding: "10px", marginBottom: "14px", fontSize: "11px", display: "flex", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontWeight: "700", color: "#6b7280", textTransform: "uppercase", fontSize: "9px", margin: "0 0 2px 0" }}>Customer Details:</p>
            <p style={{ fontSize: "13px", fontWeight: "700", margin: 0, color: "#000000" }}>{data.customerName || "Walk-in Customer"}</p>
            <p style={{ color: "#374151", margin: "2px 0 0 0" }}>{data.customerAddress || "Address Not Provided"}</p>
            <p style={{ fontWeight: "600", margin: "3px 0 0 0", color: "#000000" }}>Phone: {data.customerPhone || "N/A"}</p>
          </div>
          {data.type === "GST" && (
            <div style={{ textAlign: "right" }}>
              <p style={{ fontWeight: "700", color: "#6b7280", textTransform: "uppercase", fontSize: "9px", margin: "0 0 2px 0" }}>Customer GSTIN:</p>
              <p style={{ fontSize: "13px", fontFamily: "monospace", fontWeight: "700", margin: 0, color: "#000000" }}>{data.customerGst || "N/A"}</p>
              <p style={{ color: "#374151", margin: "2px 0 0 0" }}>Place of Supply: Rajasthan (08)</p>
            </div>
          )}
        </div>

        {/* Items Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000000", fontSize: "11px", marginBottom: "14px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6", borderBottom: "1px solid #000000", textAlign: "left" }}>
              <th style={{ border: "1px solid #000000", padding: "5px", width: "24px", textAlign: "center" }}>#</th>
              <th style={{ border: "1px solid #000000", padding: "5px" }}>Item Description</th>
              {data.type === "GST" && <th style={{ border: "1px solid #000000", padding: "5px", width: "50px", textAlign: "center" }}>HSN</th>}
              <th style={{ border: "1px solid #000000", padding: "5px", width: "32px", textAlign: "center" }}>Qty</th>
              <th style={{ border: "1px solid #000000", padding: "5px", width: "70px", textAlign: "right" }}>Price (₹)</th>
              <th style={{ border: "1px solid #000000", padding: "5px", width: "55px", textAlign: "right" }}>Disc (₹)</th>
              {data.type === "GST" && <th style={{ border: "1px solid #000000", padding: "5px", width: "70px", textAlign: "right" }}>Taxable (₹)</th>}
              {data.type === "GST" && <th style={{ border: "1px solid #000000", padding: "5px", width: "40px", textAlign: "center" }}>GST</th>}
              <th style={{ border: "1px solid #000000", padding: "5px", width: "80px", textAlign: "right" }}>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => {
              const discountedMrp = (item.mrp || 0) - (item.discount || 0);
              const taxable = discountedMrp / (1 + ((item.gst || 0) / 100));
              const total = discountedMrp * (item.qty || 1);

              return (
                <tr key={idx} style={{ borderBottom: "1px solid #d1d5db", verticalAlign: "top" }}>
                  <td style={{ border: "1px solid #000000", padding: "5px", textAlign: "center" }}>{idx + 1}</td>
                  <td style={{ border: "1px solid #000000", padding: "5px" }}>
                    <div style={{ fontWeight: "700", fontSize: "12px", color: "#000000" }}>{item.name || "Product"}</div>
                    {item.storage && <div style={{ fontSize: "10px", color: "#374151", fontWeight: "600" }}>{item.storage}</div>}
                    {item.imei1 && <div style={{ fontSize: "10px", fontFamily: "monospace", fontWeight: "700", color: "#000000" }}>IMEI: {item.imei1}</div>}
                    {item.modelNumber && <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#374151" }}>Model: {item.modelNumber}</div>}
                    {item.serialNumber && <div style={{ fontSize: "10px", fontFamily: "monospace", fontWeight: "700", color: "#000000" }}>Serial No: {item.serialNumber}</div>}
                  </td>
                  {data.type === "GST" && <td style={{ border: "1px solid #000000", padding: "5px", textAlign: "center", fontFamily: "monospace" }}>{item.hsnCode || "8517"}</td>}
                  <td style={{ border: "1px solid #000000", padding: "5px", textAlign: "center", fontWeight: "700" }}>{item.qty}</td>
                  <td style={{ border: "1px solid #000000", padding: "5px", textAlign: "right" }}>{item.mrp.toFixed(2)}</td>
                  <td style={{ border: "1px solid #000000", padding: "5px", textAlign: "right" }}>{(item.discount || 0).toFixed(2)}</td>
                  {data.type === "GST" && <td style={{ border: "1px solid #000000", padding: "5px", textAlign: "right" }}>{(taxable * item.qty).toFixed(2)}</td>}
                  {data.type === "GST" && <td style={{ border: "1px solid #000000", padding: "5px", textAlign: "center" }}>{item.gst}%</td>}
                  <td style={{ border: "1px solid #000000", padding: "5px", textAlign: "right", fontWeight: "900" }}>{total.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Bottom Section: Terms/Bank + Totals */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontSize: "11px", borderBottom: "1px solid #000000", paddingBottom: "10px", marginBottom: "10px" }}>
          <div style={{ width: "58%", paddingRight: "12px" }}>
            {data.type === "GST" ? (
              <div style={{ border: "1px solid #000000", padding: "8px", borderRadius: "4px", backgroundColor: "#f9fafb", fontSize: "10px" }}>
                <p style={{ fontWeight: "700", margin: "0 0 4px 0", textTransform: "uppercase" }}>Bank Details for Payment:</p>
                <p style={{ margin: "1px 0" }}>Bank: {data.storeSettings?.bankName || "HDFC Bank Ltd"} | A/C: {data.storeSettings?.accountNumber || "50200012345678"}</p>
                <p style={{ margin: "1px 0" }}>IFSC: {data.storeSettings?.ifsc || "HDFC0001234"} | Account Name: {data.storeSettings?.accountName || "iVerse Store"}</p>
                <p style={{ margin: "1px 0", fontWeight: "700", color: "#000000" }}>UPI ID: {data.storeSettings?.upiId || "iverse@hdfcbank"}</p>
              </div>
            ) : (
              <div style={{ border: "1px solid #000000", padding: "6px 8px", borderRadius: "4px", backgroundColor: "#f9fafb" }}>
                <p style={{ fontWeight: "900", fontSize: "10px", textTransform: "uppercase", borderBottom: "1px solid #000000", paddingBottom: "2px", margin: "0 0 4px 0", color: "#000000" }}>
                  WARRANTY TERMS & CONDITIONS
                </p>
                <ol style={{ paddingLeft: "14px", margin: 0, fontSize: "8.5px", lineHeight: "1.25", color: "#1f2937" }}>
                  <li><strong>Warranty Period:</strong> Valid only for 15 days from purchase date.</li>
                  <li><strong>Water & Damage:</strong> No coverage for liquid, drops, cracks, or physical damage.</li>
                  <li><strong>Display:</strong> No warranty on display, touch, dead pixels, or lines.</li>
                  <li><strong>Repair Only:</strong> Only repair for manufacturing faults. No returns/replacement.</li>
                  <li><strong>Original Invoice:</strong> Original invoice mandatory for warranty claims.</li>
                  <li><strong>Warranty Void:</strong> Void if opened/repaired by unauthorized technicians.</li>
                  <li><strong>Software:</strong> No coverage for OS failures, jailbreaks, or user software errors.</li>
                  <li><strong>Accessories:</strong> Charger, cable, accessories carry no warranty unless noted.</li>
                  <li><strong>Repair Time:</strong> Repairs take 2–7 working days depending on parts availability.</li>
                  <li><strong>Refurbished Items:</strong> Used/Refurbished items cover functional defects only.</li>
                  <li><strong>Final Decision:</strong> Approval/rejection authority rests solely with iVerse Store.</li>
                </ol>
              </div>
            )}
          </div>

          <div style={{ width: "40%", textAlign: "right" }}>
            {data.type === "GST" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
                  <span>Taxable Amount:</span>
                  <span>₹{data.taxableAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
                  <span>CGST:</span>
                  <span>₹{data.cgst.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
                  <span>SGST:</span>
                  <span>₹{data.sgst.toFixed(2)}</span>
                </div>
              </>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
              <span>Round Off:</span>
              <span>{data.roundOff >= 0 ? "+" : "-"} ₹{Math.abs(data.roundOff).toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "900", borderTop: "2px solid #000000", borderBottom: "2px solid #000000", padding: "4px 0", marginTop: "4px", backgroundColor: "#f3f4f6" }}>
              <span>Total Amount:</span>
              <span>₹{data.grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Optional Note / Remarks */}
        {data.notes && data.notes.trim().length > 0 && (
          <div style={{ marginTop: "6px", marginBottom: "8px", padding: "6px 8px", border: "1px dashed #000000", borderRadius: "4px", backgroundColor: "#fafafa", fontSize: "10.5px" }}>
            <span style={{ fontWeight: "700", color: "#000000" }}>Note / Remarks: </span>
            <span style={{ color: "#374151" }}>{data.notes}</span>
          </div>
        )}

        {/* Signatures */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: "11px", paddingTop: "14px" }}>
          <div>
            <p style={{ color: "#6b7280", margin: 0 }}>Customer Signature</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontWeight: "700", margin: "0 0 24px 0" }}>For iVerse Store</p>
            <p style={{ color: "#6b7280", margin: 0 }}>(Authorized Signatory)</p>
          </div>
        </div>
      </div>
    );
  }
);

InvoicePrintTemplate.displayName = "InvoicePrintTemplate";
