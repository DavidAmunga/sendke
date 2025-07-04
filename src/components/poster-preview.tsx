import { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { PaymentType, Template } from "@/types/PaymentForm";
import { TemplateSelector } from "./template-selector";

interface DisplayValues {
  primaryValue: string;
  secondaryValue: string;
  qrData: string;
}

interface PosterPreviewProps {
  selectedTemplate: Template;
  paymentType: PaymentType;
  selectedColor: string;
  showName: boolean;
  showQrCode: boolean;
  title: string;
  fontScale: number;
  displayValues: DisplayValues;
  templates: Template[];
  onTemplateSelect: (template: Template) => void;
}

export const PosterPreview = forwardRef<HTMLDivElement, PosterPreviewProps>(
  (
    {
      selectedTemplate,
      paymentType,
      selectedColor,
      showName,
      showQrCode,
      title,
      fontScale,
      displayValues,
      templates,
      onTemplateSelect,
    },
    ref
  ) => {
    // Calculate dynamic font size classes based on fontScale
    const getDynamicFontSize = () => {
      if (fontScale <= 0.8) return "text-lg sm:text-lg md:text-xl lg:text-2xl";
      if (fontScale <= 0.9) return "text-xl sm:text-xl md:text-2xl lg:text-3xl";
      if (fontScale <= 1.1)
        return "text-2xl sm:text-2xl md:text-2xl lg:text-4xl"; // default
      if (fontScale <= 1.3)
        return "text-3xl sm:text-3xl md:text-4xl lg:text-5xl";
      if (fontScale <= 1.5)
        return "text-4xl sm:text-4xl md:text-5xl lg:text-6xl";
      return "text-5xl sm:text-5xl md:text-6xl lg:text-7xl";
    };

    // Calculate dynamic label font size (smaller than main text)
    const getDynamicLabelFontSize = () => {
      if (fontScale <= 0.8) return "text-xs sm:text-sm md:text-base lg:text-lg";
      if (fontScale <= 0.9) return "text-sm sm:text-base md:text-lg lg:text-xl";
      if (fontScale <= 1.1) return "text-sm sm:text-base md:text-lg lg:text-xl"; // default
      if (fontScale <= 1.3)
        return "text-base sm:text-lg md:text-xl lg:text-2xl";
      if (fontScale <= 1.5) return "text-lg sm:text-xl md:text-2xl lg:text-3xl";
      return "text-xl sm:text-2xl md:text-3xl lg:text-4xl";
    };

    const getPrimaryValueLabel = () => {
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

    const getSecondaryValueLabel = () => {
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

    return (
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center md:py-12 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
        <div className="w-full max-w-lg">
          <div
            id="poster"
            ref={ref}
            className="grid bg-white w-full rounded-lg shadow-lg overflow-hidden border-8 border-gray-800 relative"
            style={{
              gridTemplateRows:
                paymentType === "PAYBILL"
                  ? "3fr 1.2fr 3fr 1.2fr 3fr"
                  : paymentType === "SEND_MONEY" && showName
                    ? "1fr 1fr 1fr"
                    : "1fr 1fr",
              aspectRatio: `${selectedTemplate.size.width} / ${selectedTemplate.size.height}`,
              maxHeight: "400px",
            }}
          >
            {/* Title */}
            <div
              className="flex items-center justify-center px-4 sm:px-6"
              style={{ backgroundColor: selectedColor }}
            >
              <h2
                className={`${getDynamicFontSize()} leading-tight select-none font-bold text-white text-center ${showQrCode ? "mr-[25%]" : ""}`}
              >
                {title}
              </h2>
            </div>

            {/* Conditional Black Sections - Only for Paybill */}
            {paymentType === "PAYBILL" && (
              <>
                {/* First Black Section - Primary Value Label */}
                <div className="bg-black flex items-center justify-center px-4 py-2">
                  <div
                    className={`w-1/2 ${getDynamicLabelFontSize()} font-bold text-white text-center ${showQrCode ? "mr-[25%]" : ""}`}
                  >
                    {getPrimaryValueLabel()}
                  </div>
                </div>
              </>
            )}

            {/* Primary Value Display (Phone/Paybill/Till) */}
            <div
              className="bg-white flex items-center justify-center px-4 sm:px-6"
              style={{
                borderTop:
                  paymentType !== "PAYBILL" ? "8px solid #1a2335" : "none",
                borderBottom:
                  paymentType !== "PAYBILL" &&
                  paymentType === "SEND_MONEY" &&
                  showName
                    ? "8px solid #1a2335"
                    : "none",
              }}
            >
              <div
                className={`w-full ${getDynamicFontSize()} leading-tight font-bold text-center ${showQrCode ? "mr-[25%]" : ""}`}
              >
                {displayValues.primaryValue}
              </div>
            </div>

            {/* Second Black Section - Only for Paybill */}
            {paymentType === "PAYBILL" && (
              <div className="bg-black flex items-center justify-center px-4 py-2">
                <div
                  className={`w-1/2 ${getDynamicLabelFontSize()} font-bold text-white text-center ${showQrCode ? "mr-[25%]" : ""}`}
                >
                  {getSecondaryValueLabel()}
                </div>
              </div>
            )}

            {/* Secondary Value Display - conditional rendering */}
            {((paymentType === "SEND_MONEY" && showName) ||
              paymentType === "PAYBILL") && (
              <div
                className={`flex items-center justify-center px-4 sm:px-6 text-white`}
                style={{
                  backgroundColor: selectedColor,
                }}
              >
                <div
                  className={`w-full ${getDynamicFontSize()} leading-tight font-bold text-center ${showQrCode ? "mr-[25%]" : ""}`}
                >
                  {displayValues.secondaryValue}
                </div>
              </div>
            )}

            {/* QR Code Display - conditional rendering */}
            {showQrCode && (
              <div className="w-1/3 absolute right-0 top-0 bottom-0 flex flex-col justify-center bg-transparent">
                <div className="bg-white p-3 flex items-center flex-col rounded-l-lg shadow-lg border">
                  <span className="text-xs text-center font-bold uppercase tracking-wider mb-1">
                    Scan with M-PESA
                  </span>
                  <QRCodeSVG
                    value={displayValues.qrData}
                    size={110}
                    level="H"
                    fgColor="#000000"
                    bgColor={"#ffffff"}
                    includeMargin={false}
                    className=""
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-start justify-center text-center mt-2">
          <p className="font-handwriting text-2xl text-gray-600 z-10">
            Preview of your poster
          </p>
        </div>

        <TemplateSelector
          templates={templates}
          selectedTemplate={selectedTemplate}
          onTemplateSelect={onTemplateSelect}
        />
      </div>
    );
  }
);

PosterPreview.displayName = "PosterPreview";
