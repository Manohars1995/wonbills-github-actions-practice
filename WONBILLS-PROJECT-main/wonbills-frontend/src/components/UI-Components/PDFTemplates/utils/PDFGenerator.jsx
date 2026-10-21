import React, { useEffect, useCallback, useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { currencySymbols } from "../../../../shared/ConstData";
import { resolveInvoiceTemplate } from "../utils/resolveInvoiceTemplate";

/**
 * Convert image URL to base64 for PDF rendering
 * This solves CORS issues with external images in @react-pdf/renderer
 */
const imageUrlToBase64 = async (url) => {
  if (!url) return null;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn('Failed to fetch image:', url);
      return null;
    }
    
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => {
        console.error('Failed to convert image to base64');
        reject(null);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
};

const PDFGenerator = ({
  id,
  items,
  generateAndDownload = false,
  clientVendorDetails,
  currency,
  dueDate,
  templateKey
}) => {
  const [logoBase64, setLogoBase64] = useState(null);
  const [isLoadingLogo, setIsLoadingLogo] = useState(true);

  /* ---------------- NORMALIZE INPUTS ---------------- */
  const safeItems = useMemo(
    () => (Array.isArray(items) ? items : []),
    [items]
  );

  const safeClientVendor = clientVendorDetails || {};

  /* ---------------- DATE ---------------- */
  const formattedDueDate = useMemo(() => {
    return dueDate
      ? new Date(dueDate).toLocaleDateString("en-GB")
      : "";
  }, [dueDate]);

  /* ---------------- TOTALS ---------------- */
  const subtotal = useMemo(() => {
    return safeItems.reduce(
      (acc, item) =>
        acc + Number(item?.quantity || 0) * Number(item?.price || 0),
      0
    );
  }, [safeItems]);

  const total = subtotal;

  const currencySymbol =
    currencySymbols[currency] ||
    currencySymbols["INR"] ||
    currencySymbols["USD"];

  /* ---------------- CONVERT LOGO TO BASE64 ---------------- */
  useEffect(() => {
    const convertLogo = async () => {
      const logoUrl = safeClientVendor?.company_logo;
      
      if (logoUrl) {
        setIsLoadingLogo(true);
        try {
          const base64 = await imageUrlToBase64(logoUrl);
          setLogoBase64(base64);
        } catch (error) {
          console.error('Logo conversion failed:', error);
          setLogoBase64(null);
        } finally {
          setIsLoadingLogo(false);
        }
      } else {
        setLogoBase64(null);
        setIsLoadingLogo(false);
      }
    };

    convertLogo();
  }, [safeClientVendor?.company_logo]);

  /* ---------------- DOWNLOAD ---------------- */
  const downloadPdf = useCallback(
    (url) => {
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice_${id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    },
    [id]
  );

  /* ---------------- GENERATE PDF ---------------- */
  const generatePdf = useCallback(async () => {
    if (!safeItems.length) return; // Prevent empty crash

    // Don't generate if logo is still loading
    if (safeClientVendor?.company_logo && isLoadingLogo) {
      return;
    }

    const InvoiceTemplate = resolveInvoiceTemplate(templateKey);

    try {
      const blob = await pdf(
        <InvoiceTemplate
          Data={safeItems}               //  ALWAYS ARRAY
          subtotal={subtotal}
          total={total}
          clientDetails={{
            client_name: safeClientVendor?.client_name,
            billing_address: safeClientVendor?.billing_address,
            company_name: safeClientVendor?.company_details?.company_name
          }}
          invoiceDetails={{
            id,
            date: new Date().toLocaleDateString(),
            dueDate: formattedDueDate
          }}
          logoUrl={logoBase64}  // Use base64 instead of URL
          currencyPreferency={currencySymbol}
        />
      ).toBlob();

      if (generateAndDownload) {
        const url = URL.createObjectURL(blob);
        downloadPdf(url);
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  }, [
    id,
    safeItems,
    subtotal,
    total,
    currencySymbol,
    safeClientVendor,
    formattedDueDate,
    generateAndDownload,
    templateKey,
    downloadPdf,
    logoBase64,
    isLoadingLogo
  ]);

  /* ---------------- RUN ---------------- */
  useEffect(() => {
    // Only generate PDF after logo is loaded (or if there's no logo)
    if (!isLoadingLogo) {
      generatePdf();
    }
  }, [generatePdf, isLoadingLogo]);

  return null;
};

export default PDFGenerator;