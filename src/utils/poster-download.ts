import QRCode from "qrcode";
import type { PaymentType, Template } from "@/types/PaymentForm";
import { roundRectLeft } from "@/lib/helpers";

interface DisplayValues {
  primaryValue: string;
  secondaryValue: string;
  qrData: string;
}

interface PosterDownloadParams {
  posterRef: React.RefObject<HTMLDivElement | null>;
  selectedTemplate: Template;
  selectedColor: string;
  paymentType: PaymentType;
  showName: boolean;
  showQrCode: boolean;
  title: string;
  fontScale: number;
  displayValues: DisplayValues;
}

const getPrimaryValueLabel = (paymentType: PaymentType) => {
  switch (paymentType) {
    case "SEND_MONEY":
      return "PHONE NUMBER";
    case "PAYBILL":
      return "PAYBILL NUMBER";
    case "TILL_NUMBER":
      return "TILL NUMBER";
    default:
      return "PHONE NUMBER";
  }
};

const getSecondaryValueLabel = (
  paymentType: PaymentType,
  showName: boolean
) => {
  switch (paymentType) {
    case "SEND_MONEY":
      return showName ? "NAME" : "";
    case "PAYBILL":
      return "ACCOUNT NUMBER";
    case "TILL_NUMBER":
      return "";
    default:
      return "";
  }
};

export const downloadPoster = async (params: PosterDownloadParams) => {
  const {
    posterRef,
    selectedTemplate,
    selectedColor,
    paymentType,
    showName,
    showQrCode,
    title,
    fontScale,
    displayValues,
  } = params;

  if (!posterRef.current) return;

  try {
    // Ensure Inter font is loaded before drawing
    await document.fonts.load("bold 120px Inter");

    // Create canvas with dimensions from selected template
    const canvas = document.createElement("canvas");
    const width = selectedTemplate.size.width;
    const height = selectedTemplate.size.height;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Unable to get canvas context");
      return;
    }

    // Colors
    const mainColor = selectedColor || "#16a34a";
    const borderColor = "#1a2335";
    const whiteColor = "#ffffff";
    const blackColor = "#000000";

    const borderSize = 8;

    // Adjust heights based on payment type and name display
    const hasSecondarySection =
      (paymentType === "SEND_MONEY" && showName) || paymentType === "PAYBILL";
    const hasBlackSections = paymentType === "PAYBILL"; // Only Paybill gets black sections

    // Calculate section heights with black dividers
    let mainSectionHeight, blackSectionHeight;

    if (hasBlackSections) {
      // Paybill with black sections
      mainSectionHeight = height * 0.27;
      blackSectionHeight = height * 0.12;
    } else {
      // Send Money or Till Number without black sections
      mainSectionHeight = hasSecondarySection ? height / 3 : height / 2;
      blackSectionHeight = 0;
    }

    // Calculate QR code space if enabled
    const qrCodeSize = showQrCode ? width * 0.25 : 0;

    // Draw outer border
    ctx.fillStyle = borderColor;
    ctx.fillRect(0, 0, width, height);

    let currentY = borderSize;

    // Draw top section (colored with header)
    ctx.fillStyle = mainColor;
    ctx.fillRect(
      borderSize,
      currentY,
      width - 2 * borderSize,
      mainSectionHeight
    );
    currentY += mainSectionHeight;

    // Draw first black section (primary value label) - only for Paybill
    if (hasBlackSections) {
      ctx.fillStyle = blackColor;
      ctx.fillRect(
        borderSize,
        currentY,
        width - 2 * borderSize,
        blackSectionHeight
      );
      currentY += blackSectionHeight;
    }

    // Draw middle section (white with primary value)
    ctx.fillStyle = whiteColor;
    ctx.fillRect(
      borderSize,
      currentY,
      width - 2 * borderSize,
      mainSectionHeight
    );
    currentY += mainSectionHeight;

    // Draw second black section and bottom section if there's a secondary value
    if (hasSecondarySection) {
      // Draw second black section (secondary value label) - only for Paybill
      if (hasBlackSections) {
        ctx.fillStyle = blackColor;
        ctx.fillRect(
          borderSize,
          currentY,
          width - 2 * borderSize,
          blackSectionHeight
        );
        currentY += blackSectionHeight;
      }

      // Draw bottom section (colored with secondary value)
      ctx.fillStyle = mainColor;
      ctx.fillRect(
        borderSize,
        currentY,
        width - 2 * borderSize,
        mainSectionHeight
      );
    }

    // Draw horizontal borders for non-Paybill payment types
    if (!hasBlackSections) {
      const borderThickness = 15;
      ctx.fillStyle = borderColor;

      // Reset currentY for border drawing
      let borderCurrentY = borderSize + mainSectionHeight;

      // Draw top border of middle section
      ctx.fillRect(
        borderSize,
        borderCurrentY - borderThickness / 2,
        width - 2 * borderSize,
        borderThickness
      );

      // Draw bottom border of middle section if there's a secondary section
      if (hasSecondarySection) {
        borderCurrentY += mainSectionHeight;
        ctx.fillRect(
          borderSize,
          borderCurrentY - borderThickness / 2,
          width - 2 * borderSize,
          borderThickness
        );
      }
    }

    // Set text properties
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Adjust font sizes based on template dimensions and font scale
    const titleFontSize = Math.round(Math.min(width, height) * 0.1 * fontScale);
    const phoneFontSize = Math.round(
      Math.min(width, height) * 0.11 * fontScale
    );
    const nameFontSize = Math.round(Math.min(width, height) * 0.1 * fontScale);
    const labelFontSize = Math.round(titleFontSize * 0.75); // Increased from 0.5 to 0.75 of title font

    // Calculate section centers dynamically
    let currentYForText = borderSize;

    // Title section center
    const titleSectionCenter = currentYForText + mainSectionHeight / 2;
    currentYForText += mainSectionHeight;

    // First black section center (only for Paybill)
    let firstBlackSectionCenter = 0;
    if (hasBlackSections) {
      firstBlackSectionCenter = currentYForText + blackSectionHeight / 2;
      currentYForText += blackSectionHeight;
    }

    // Primary value section center
    const primaryValueSectionCenter = currentYForText + mainSectionHeight / 2;
    currentYForText += mainSectionHeight;

    // Second black section center (only for Paybill with secondary section)
    let secondBlackSectionCenter = 0;
    if (hasSecondarySection && hasBlackSections) {
      secondBlackSectionCenter = currentYForText + blackSectionHeight / 2;
      currentYForText += blackSectionHeight;
    }

    // Secondary value section center
    const secondaryValueSectionCenter = hasSecondarySection
      ? currentYForText + mainSectionHeight / 2
      : 0;

    // Draw Title text with Inter font
    ctx.fillStyle = whiteColor;
    ctx.font = `bold ${titleFontSize}px Inter, sans-serif`;
    ctx.fillText(
      (title || "SEND MONEY").toUpperCase(),
      showQrCode ? (width - qrCodeSize) / 2 : width / 2,
      titleSectionCenter
    );

    // Draw first black section label (primary value label) - only for Paybill
    if (hasBlackSections) {
      ctx.fillStyle = whiteColor;
      ctx.font = `bold ${labelFontSize}px Inter, sans-serif`;
      ctx.fillText(
        getPrimaryValueLabel(paymentType),
        showQrCode ? (width - qrCodeSize) / 2 : width / 2, // Center horizontally
        firstBlackSectionCenter
      );
    }

    // Draw primary value (phone/paybill/till) with Inter font
    ctx.fillStyle = "#000000";
    ctx.font = `bold ${phoneFontSize}px Inter, sans-serif`;
    ctx.fillText(
      displayValues.primaryValue,
      showQrCode ? (width - qrCodeSize) / 2 : width / 2,
      primaryValueSectionCenter
    );

    // Draw second black section label and secondary value if needed
    if (hasSecondarySection && displayValues.secondaryValue) {
      // Draw second black section label (secondary value label) - only for Paybill
      if (hasBlackSections) {
        ctx.fillStyle = whiteColor;
        ctx.font = `bold ${labelFontSize}px Inter, sans-serif`;
        ctx.fillText(
          getSecondaryValueLabel(paymentType, showName),
          showQrCode ? (width - qrCodeSize) / 2 : width / 2, // Center horizontally
          secondBlackSectionCenter
        );
      }

      // Draw secondary value (name/account) with Inter font
      ctx.fillStyle = whiteColor; // White text on colored background
      ctx.font = `bold ${nameFontSize}px Inter, sans-serif`;
      ctx.fillText(
        displayValues.secondaryValue,
        showQrCode ? (width - qrCodeSize) / 2 : width / 2,
        secondaryValueSectionCenter
      );
    }

    // Draw QR code if enabled
    if (showQrCode && displayValues.primaryValue) {
      // Get QR code data based on payment type
      const qrCodeData = displayValues.qrData;
      const qrSize = Math.min(height - 2 * borderSize, qrCodeSize) * 0.8;

      // Calculate QR container dimensions
      const qrContainerWidth = width / 3;
      const containerHeight = qrSize * 1.4;
      const containerWidth = qrContainerWidth - 40;

      // Position container at the far right of the page
      const rightPadding = 0; // Small padding from right edge
      const containerX = width - containerWidth - rightPadding;
      const containerY = height / 2 - containerHeight / 2;

      // Calculate center position for QR code within the container
      const qrX = containerX + (containerWidth - qrSize) / 2;
      const qrY = containerY + (containerHeight - qrSize) / 2;

      // Add shadow effect (draw shadow before the shape)
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.15)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = -3;
      ctx.shadowOffsetY = 3;

      // Draw white background for QR code with rounded left corners
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      roundRectLeft(
        ctx,
        containerX,
        containerY,
        containerWidth,
        containerHeight,
        15 // corner radius
      );
      ctx.closePath();
      ctx.fill();

      // Reset shadow
      ctx.restore();

      // Add border to QR container
      ctx.strokeStyle = "#E5E7EB"; // Light gray border
      ctx.lineWidth = 1;
      ctx.beginPath();
      roundRectLeft(
        ctx,
        containerX,
        containerY,
        containerWidth,
        containerHeight,
        15
      );
      ctx.closePath();
      ctx.stroke();

      // Create a proper QR code using the QRCode library
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = qrSize;
      tempCanvas.height = qrSize;

      // Use QRCode.toCanvas to generate a real QR code on the temp canvas
      await new Promise<void>((resolve) => {
        QRCode.toCanvas(
          tempCanvas,
          qrCodeData,
          {
            width: qrSize,
            margin: 0,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
            errorCorrectionLevel: "H",
          },
          (error: Error | null | undefined) => {
            if (error) console.error("Error generating QR code:", error);
            resolve();
          }
        );
      });

      // Draw QR code canvas onto main canvas
      ctx.drawImage(tempCanvas, qrX, qrY, qrSize, qrSize);

      // Add "SCAN WITH M-PESA" text above QR code
      ctx.fillStyle = "#000000";
      ctx.font = `bold ${Math.round(titleFontSize * 0.25)}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(
        "SCAN WITH M-PESA",
        containerX + containerWidth / 2,
        containerY + 20
      );
    }

    // Generate download link
    const dataUrl = canvas.toDataURL("image/png", 1.0);
    const link = document.createElement("a");
    const filenameValue = displayValues.primaryValue.replace(/\s/g, "");
    link.download = `send-ke-${paymentType.toLowerCase()}-${filenameValue}-${
      selectedTemplate.slug
    }.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error generating image:", error);
  }
};
