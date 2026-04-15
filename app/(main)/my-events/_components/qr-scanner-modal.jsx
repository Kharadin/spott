"use client";

import { useState, useEffect } from "react";
import { QrCode, Loader2 } from "lucide-react";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function QRScannerModal({ isOpen, onClose }) {
  const [scannerReady, setScannerReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null); // 1. Renamed state for clarity

  const { mutate: checkInAttendee } = useConvexMutation(
    api.registrations.checkInAttendee
  );

  const handleCheckIn = async (qrCode) => {
    try {
      const result = await checkInAttendee({ qrCode });

      if (result.success) {
        toast.success("✅ Check-in successful!");
        onClose();
      } else {
        toast.error(result.message || "Check-in unsuccessful");
      }
    } catch (err) { // 2. Renamed local variable to 'err'
      toast.error(err.message || "Check-in attempt failed");
    }
  };

  // Initialize QR Scanner
  useEffect(() => {
    let scanner = null;
    let mounted = true;

    const initScanner = async () => {
      if (!isOpen) return;

      await new Promise ((resolve) => setTimeout(resolve, 400));
    
      try {
          console.log("Initializing QR scanner...");

          try {
            await navigator.mediaDevices.getUserMedia({ video: true });
          } catch (permError) {
            console.error("Camera permission denied:", permError);
            setErrorMsg("Camera permission denied. Please enable camera access.");
            return;
          }

        // Dynamically import the library
        const { Html5QrcodeScanner } = await import("html5-qrcode");

        if (!mounted) return;

        // My: Use a more   exibe config
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          // This is the key: it tells the library to show both options
          supportedScanTypes: [0, 1], 
          // Move facingMode here so it doesn't lock the scanner type
          videoConstraints: {
            facingMode: "environment",
          },
        };
        console.log("Creating scanner instance...");

        scanner = new Html5QrcodeScanner("qr-reader", config, true);

        const onScanSuccess = (decodedText) => {
          console.log("QR Code detected:", decodedText);
          if (scanner) {
            scanner.clear().catch((err) => console.error(err));
          }
          handleCheckIn(decodedText);
        };

        const onScanError = (scanErr) => {
          // Only log actual errors, not "no QR code found" messages
          if (scanErr && !scanErr.includes("NotFoundException")) {
            console.debug("Scan error:", scanErr);
          }
        };

        scanner.render(onScanSuccess, onScanError);
        setScannerReady(true);
        setErrorMsg(null);
        console.log("Scanner rendered successfully");
      } catch (initErr) {
        console.error("Failed to initialize scanner:", initErr);
        setErrorMsg(`Failed to start camera: ${initErr.message}`);
        toast.error("Camera failed. Please use manual entry.");
      }
    };

    initScanner();

    return () => {
      mounted = false;
      if (scanner) {
        console.log("Cleaning up scanner...");
        scanner.clear().catch((err)=> console.error(err));
      }
      setScannerReady(false);
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-purple-500" />
            Check-In Attendee
          </DialogTitle>
          <DialogDescription>
            Scan QR code or enter ticket ID manually
          </DialogDescription>
        </DialogHeader>

        {errorMsg ? (
          <div className="text-red-500 text-sm">{errorMsg}</div>
        ) : (
          <>
            <div  
              id="qr-reader"
              className="w-full"
              style={{ minHeight: "350px" }}
            ></div>
            {!scannerReady && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Starting camera...
                </span>
              </div>
            )}
            <p className="text-sm text-muted-foreground text-center">
              {scannerReady
                ? "Position the QR code within the frame"
                : "Please allow camera access when prompted"}
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
