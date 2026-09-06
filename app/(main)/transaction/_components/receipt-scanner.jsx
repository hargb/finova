"use client";

import { useEffect, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { scanReceipt } from "@/actions/transaction";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef(null);

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
  } = useFetch(scanReceipt);

  const handleReceiptScan = async (file) => {
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error(
        "Please upload a JPG, PNG, WEBP, HEIC, or HEIF receipt image."
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Receipt image must be smaller than 5MB.");
      return;
    }

    try {
      await scanReceiptFn(file);
    } catch (error) {
      console.error("Receipt scan failed:", error);
      toast.error("Failed to scan receipt. Please try again.");
    } finally {
      // Allows selecting the same file again.
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    if (!scannedData || scanReceiptLoading) return;

    if (scannedData.success === false) {
      toast.error(
        scannedData.error || "Unable to scan the receipt. Please try again."
      );
      return;
    }

    onScanComplete?.(scannedData);
    toast.success("Receipt scanned successfully.");
  }, [scannedData, scanReceiptLoading, onScanComplete]);

  return (
    <div className="flex w-full items-center gap-4">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        capture="environment"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            handleReceiptScan(file);
          }
        }}
      />

      <Button
        type="button"
        variant="outline"
        className="h-10 w-full bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 text-white transition-opacity hover:opacity-90 hover:text-white"
        onClick={() => fileInputRef.current?.click()}
        disabled={scanReceiptLoading}
        aria-label="Scan receipt with AI"
      >
        {scanReceiptLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Scanning Receipt...</span>
          </>
        ) : (
          <>
            <Camera className="mr-2 h-4 w-4" />
            <span>Scan Receipt with AI</span>
          </>
        )}
      </Button>
    </div>
  );
}