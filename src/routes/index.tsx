import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckIcon,
  GithubIcon,
  LockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  QrCodeIcon,
  InfoIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { ColorPicker } from "@/components/ui/color-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import templates from "@/data/templates.json";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { QRCodeSVG } from "qrcode.react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import QRCode from "qrcode";

// Define payment types
type PaymentType = "SEND_MONEY" | "PAYBILL" | "TILL_NUMBER";

// Define zod schema for validation
const formSchema = z
  .object({
    paymentType: z.enum(["SEND_MONEY", "PAYBILL", "TILL_NUMBER"]),
    phoneNumber: z.string().optional(),
    paybillNumber: z.string().optional(),
    accountNumber: z.string().optional(),
    tillNumber: z.string().optional(),
    name: z.string().optional(),
    selectedColor: z.string(),
    showName: z.boolean(),
    showQrCode: z.boolean(),
    title: z.string().min(1, "Title cannot be empty"),
  })
  .refine(
    (data) => {
      // Validation based on payment type
      if (data.paymentType === "SEND_MONEY") {
        if (
          !data.phoneNumber ||
          data.phoneNumber.replace(/\s/g, "").length < 10
        ) {
          return false;
        }
        // If showName is true, name must not be empty
        if (data.showName && (!data.name || data.name.trim().length === 0)) {
          return false;
        }
      } else if (data.paymentType === "PAYBILL") {
        if (!data.paybillNumber || data.paybillNumber.trim().length === 0) {
          return false;
        }
        if (!data.accountNumber || data.accountNumber.trim().length === 0) {
          return false;
        }
      } else if (data.paymentType === "TILL_NUMBER") {
        if (!data.tillNumber || data.tillNumber.trim().length === 0) {
          return false;
        }
      }
      return true;
    },
    {
      message:
        "Please fill in all required fields for the selected payment type",
      path: ["phoneNumber"], // This will be overridden by specific field validation
    }
  );

// Define form type
interface FormValues {
  paymentType: PaymentType;
  phoneNumber?: string;
  paybillNumber?: string;
  accountNumber?: string;
  tillNumber?: string;
  name?: string;
  selectedColor: string;
  showName: boolean;
  showQrCode: boolean;
  title: string;
}

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const posterRef = useRef<HTMLDivElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentType: "SEND_MONEY",
      phoneNumber: "",
      paybillNumber: "",
      accountNumber: "",
      tillNumber: "",
      name: "",
      selectedColor: "#16a34a",
      showName: true,
      showQrCode: true,
      title: "SEND MONEY",
    },
    mode: "onChange",
  });

  const paymentType = watch("paymentType");
  const phoneNumber = watch("phoneNumber");
  const paybillNumber = watch("paybillNumber");
  const accountNumber = watch("accountNumber");
  const tillNumber = watch("tillNumber");
  const name = watch("name");
  const selectedColor = watch("selectedColor");
  const showName = watch("showName");
  const showQrCode = watch("showQrCode");
  const title = watch("title");

  const colorOptions = [
    { name: "Green", value: "#16a34a", class: "bg-green-600" },
    { name: "Rose", value: "#be123c", class: "bg-rose-700" },
    { name: "Yellow", value: "#F7C50C", class: "bg-[#F7C50C]" },
    { name: "Blue", value: "#1B398E", class: "bg-blue-800" },
  ];

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    const match = numbers.match(/^(\d{4})(\d{3})(\d{3})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
    return value;
  };

  const formatBusinessNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length === 0) return "";

    // Format numbers into groups of 3-4 digits
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      // Split into two groups of 3
      return numbers.replace(/(\d{3})(\d{1,3})/, "$1 $2");
    } else if (numbers.length <= 7) {
      // Split into 3 + 4
      return numbers.replace(/(\d{3})(\d{1,4})/, "$1 $2");
    } else if (numbers.length <= 8) {
      // Split into 4 + 4
      return numbers.replace(/(\d{4})(\d{1,4})/, "$1 $2");
    } else if (numbers.length <= 9) {
      // Split into 3 + 3 + 3
      return numbers.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1 $2 $3");
    } else {
      // For longer numbers, split into 3 + 3 + 4
      return numbers.replace(/(\d{3})(\d{3})(\d{1,4})/, "$1 $2 $3");
    }
  };

  const formatAccountNumber = (value: string): string => {
    // Check if the value contains only numbers (and possibly spaces)
    const numbersOnly = value.replace(/\s/g, "");
    if (!/^\d+$/.test(numbersOnly)) {
      // If it contains non-numeric characters, return as-is
      return value;
    }

    // Format numeric account numbers in groups of 4
    const numbers = numbersOnly.replace(/\D/g, "");
    return numbers.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  // Get current display values based on payment type
  const getCurrentDisplayValues = () => {
    switch (paymentType) {
      case "SEND_MONEY":
        return {
          primaryValue: phoneNumber || "0712 345 678",
          secondaryValue: name || "JOHN DOE",
          qrData: `SM|${(phoneNumber || "0712345678").replace(/\s/g, "")}`,
        };
      case "PAYBILL":
        return {
          primaryValue: formatBusinessNumber(paybillNumber || "123456"),
          secondaryValue: formatBusinessNumber(accountNumber || "123456"),
          qrData: `PB|${(paybillNumber || "123456").replace(/\s/g, "")}|${(accountNumber || "123456").replace(/\s/g, "")}`,
        };
      case "TILL_NUMBER":
        return {
          primaryValue: formatBusinessNumber(tillNumber || "123456"),
          secondaryValue: "",
          qrData: `BG|${(tillNumber || "123456").replace(/\s/g, "")}`,
        };
      default:
        return {
          primaryValue: phoneNumber || "0712 345 678",
          secondaryValue: name || "JOHN DOE",
          qrData: `SM|${(phoneNumber || "0712345678").replace(/\s/g, "")}`,
        };
    }
  };

  const displayValues = getCurrentDisplayValues();

  const onSubmit = handleSubmit(async () => {
    await handleDownload();
  });

  const handleDownload = async () => {
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
      const mainColor = selectedColor;
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

      // Set text properties
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Adjust font sizes based on template dimensions
      const titleFontSize = Math.round(Math.min(width, height) * 0.1);
      const phoneFontSize = Math.round(Math.min(width, height) * 0.11);
      const nameFontSize = Math.round(Math.min(width, height) * 0.1);
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
        title.toUpperCase(),
        showQrCode ? (width - qrCodeSize) / 2 : width / 2,
        titleSectionCenter
      );

      // Draw first black section label (primary value label) - only for Paybill
      if (hasBlackSections) {
        ctx.fillStyle = whiteColor;
        ctx.font = `bold ${labelFontSize}px Inter, sans-serif`;
        ctx.fillText(
          getPrimaryValueLabel(),
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
            getSecondaryValueLabel(),
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

  const getPaymentTypeText = () => {
    switch (paymentType) {
      case "SEND_MONEY":
        return "Phone Number";
      case "PAYBILL":
        return "Paybill";
      case "TILL_NUMBER":
        return "Till Number";
      default:
        return "Phone Number";
    }
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
    <div className="flex flex-col bg-gray-100">
      <div className="flex-1 flex flex-col md:flex-row px-4 py-4 sm:py-8 md:py-0 sm:px-6 lg:px-8 gap-8 relative z-10">
        {/* Left Column - App Info */}
        <div className="w-full md:w-1/2 flex flex-col justify-center md:py-12 md:px-8">
          {/* Header for medium screens and up - now in left column */}
          <div className="hidden md:block mb-8">
            <h1 className="text-4xl font-display font-bold text-green-600">
              send.ke
            </h1>
            <h3 className="text-lg font-display text-gray-800 mt-2 max-w-md">
              Your {getPaymentTypeText()} 🤝 Payment Poster
            </h3>
          </div>

          {/* App features */}
          <div className="flex flex-row gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm px-3 py-2 flex items-center border border-green-100 hover:border-green-400 cursor-pointer">
              <CheckIcon className="w-5 h-5 text-green-600 mr-1" />
              <span className="text-sm text-gray-700">100% Free</span>
            </div>
            <div className="bg-white rounded-lg shadow-sm px-3 py-2 flex items-center border border-blue-100 hover:border-blue-400 cursor-pointer">
              <LockIcon className="w-5 h-5 text-blue-600 mr-1" />
              <span className="text-sm text-gray-700">Works Offline</span>
            </div>
            <div className="bg-white rounded-lg shadow-sm px-3 py-2 flex items-center border border-purple-100 hover:border-purple-400 cursor-pointer">
              <GithubIcon className="w-5 h-5 text-purple-600 mr-1" />
              <a
                href="https://github.com/DavidAmunga/sendke"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                Open Source
              </a>
            </div>
          </div>

          <Card className="">
            <CardTitle className="px-6 text-xl  font-bold text-gray-900">
              Make Your Payment Poster
            </CardTitle>

            <CardContent>
              <Controller
                name="paymentType"
                control={control}
                render={({ field }) => (
                  <Tabs
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value as PaymentType);
                      setValue(
                        "title",
                        value.replaceAll(" ", "").replaceAll("_", " ")
                      );
                      setValue("showQrCode", value !== "PAYBILL");
                    }}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger
                        value="SEND_MONEY"
                        className="text-xs sm:text-sm"
                      >
                        Send Money
                      </TabsTrigger>
                      <TabsTrigger
                        value="PAYBILL"
                        className="text-xs sm:text-sm"
                      >
                        Paybill
                      </TabsTrigger>
                      <TabsTrigger
                        value="TILL_NUMBER"
                        className="text-xs sm:text-sm"
                      >
                        Till Number
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="SEND_MONEY" className="space-y-4">
                      <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                          <label
                            htmlFor="title"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Title Text
                          </label>
                          <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                              <Input
                                id="title"
                                type="text"
                                value={field.value}
                                onChange={field.onChange}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold"
                                placeholder="SEND MONEY"
                              />
                            )}
                          />
                          {errors.title && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.title.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Phone Number
                          </label>
                          <Controller
                            name="phoneNumber"
                            control={control}
                            render={({ field }) => (
                              <Input
                                id="phone"
                                type="text"
                                value={field.value || ""}
                                onChange={(e) => {
                                  const value = e.target.value.replace(
                                    /\D/g,
                                    ""
                                  );
                                  if (value.length <= 10) {
                                    field.onChange(formatPhoneNumber(value));
                                  }
                                }}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold"
                                placeholder="0712 345 678"
                              />
                            )}
                          />
                          {errors.phoneNumber && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.phoneNumber.message}
                            </p>
                          )}
                        </div>
                      </form>
                    </TabsContent>

                    <TabsContent value="PAYBILL" className="space-y-4">
                      <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                          <label
                            htmlFor="title"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Title Text
                          </label>
                          <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                              <Input
                                id="title"
                                type="text"
                                value={field.value}
                                onChange={field.onChange}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold"
                                placeholder="SEND MONEY"
                              />
                            )}
                          />
                          {errors.title && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.title.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="paybill"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Paybill Number
                          </label>
                          <Controller
                            name="paybillNumber"
                            control={control}
                            render={({ field }) => (
                              <Input
                                id="paybill"
                                type="text"
                                value={field.value || ""}
                                onChange={(e) => {
                                  const value = e.target.value.replace(
                                    /\D/g,
                                    ""
                                  );
                                  if (value.length <= 10) {
                                    field.onChange(formatBusinessNumber(value));
                                  }
                                }}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold"
                                placeholder="123 456"
                              />
                            )}
                          />
                          {errors.paybillNumber && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.paybillNumber.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="account"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Account Number
                          </label>
                          <Controller
                            name="accountNumber"
                            control={control}
                            render={({ field }) => (
                              <Input
                                id="account"
                                type="text"
                                value={field.value || ""}
                                onChange={(e) => {
                                  const value = e.target.value.replace(
                                    /\D/g,
                                    ""
                                  );
                                  if (value.length <= 10) {
                                    field.onChange(formatBusinessNumber(value));
                                  }
                                }}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold"
                                placeholder="123 456"
                              />
                            )}
                          />
                          {errors.accountNumber && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.accountNumber.message}
                            </p>
                          )}
                        </div>
                      </form>
                    </TabsContent>

                    <TabsContent value="TILL_NUMBER" className="space-y-4">
                      <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                          <label
                            htmlFor="title"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Title Text
                          </label>
                          <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                              <Input
                                id="title"
                                type="text"
                                value={field.value}
                                onChange={field.onChange}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold"
                                placeholder="SEND MONEY"
                              />
                            )}
                          />
                          {errors.title && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.title.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="till"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Till Number
                          </label>
                          <Controller
                            name="tillNumber"
                            control={control}
                            render={({ field }) => (
                              <Input
                                id="till"
                                type="text"
                                value={field.value || ""}
                                onChange={(e) => {
                                  const value = e.target.value.replace(
                                    /\D/g,
                                    ""
                                  );
                                  if (value.length <= 10) {
                                    field.onChange(formatBusinessNumber(value));
                                  }
                                }}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold"
                                placeholder="123 456"
                              />
                            )}
                          />
                          {errors.tillNumber && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.tillNumber.message}
                            </p>
                          )}
                        </div>
                      </form>
                    </TabsContent>
                  </Tabs>
                )}
              />

              {/* Common Options Outside Tabs */}
              <div className="space-y-4 mt-6">
                {paymentType === "SEND_MONEY" && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Controller
                      name="showName"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="showName"
                          checked={field.value}
                          onCheckedChange={(checked: boolean) => {
                            field.onChange(checked);
                          }}
                        />
                      )}
                    />
                    <label
                      htmlFor="showName"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Show Name Field
                    </label>
                  </div>
                )}

                {paymentType === "SEND_MONEY" && showName && (
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Your Name
                    </label>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="name"
                          type="text"
                          value={field.value || ""}
                          onChange={(e) => {
                            field.onChange(e.target.value.toUpperCase());
                          }}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold"
                          placeholder="JOHN DOE"
                        />
                      )}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                )}

                {paymentType !== "PAYBILL" && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Controller
                      name="showQrCode"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="showQrCode"
                          checked={field.value}
                          onCheckedChange={(checked: boolean) => {
                            field.onChange(checked);
                          }}
                        />
                      )}
                    />
                    <label
                      htmlFor="showQrCode"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                    >
                      <QrCodeIcon className="h-4 w-4 mr-1 text-gray-600" />
                      Show M-PESA QR Code
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-3 w-3 ml-1 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>
                              When scanned with M-PESA app, this QR code will
                              pre-fill your phone number in the payment screen.
                              Format: SM|phonenumber
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </label>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Poster Color
                  </label>
                  <div className="flex items-center space-x-4">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`size-8 rounded-full border-2 flex items-center justify-center ${
                          selectedColor === color.value
                            ? "border-gray-800"
                            : "border-transparent"
                        } ${color.class}`}
                        onClick={() => setValue("selectedColor", color.value)}
                        aria-label={`Select ${color.name} color`}
                      >
                        {selectedColor === color.value && (
                          <CheckIcon className="h-5 w-5 text-white" />
                        )}
                      </button>
                    ))}
                    <div className="flex items-center">
                      <Controller
                        name="selectedColor"
                        control={control}
                        render={({ field }) => (
                          <ColorPicker
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                            className="size-8 rounded-full"
                          />
                        )}
                      />
                      <span className="ml-2 text-xs text-gray-500">Custom</span>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <motion.div
                  whileHover={{
                    scale: 1.05,
                    transition: {
                      duration: 0.2,
                    },
                  }}
                >
                  <Button
                    onClick={handleDownload}
                    disabled={!isValid}
                    className="w-full bg-gray-800 text-white text-xl font-bold py-8 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    DOWNLOAD
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-gray-500 mt-2 text-sm">
            Download It, Share It , Stick it anywhere !
          </div>
        </div>

        {/* Right Column - Poster Preview */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center md:py-12 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
          <div className="w-full max-w-lg">
            <div
              id="poster"
              ref={posterRef}
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
                  className={`text-2xl sm:text-2xl md:text-2xl lg:text-4xl leading-tight select-none font-bold text-white text-center ${showQrCode ? "mr-[25%]" : ""}`}
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
                      className={`w-1/2 text-sm sm:text-base md:text-lg font-bold text-white text-center ${showQrCode ? "mr-[25%]" : ""}`}
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
                  className={`w-full text-2xl sm:text-2xl md:text-2xl lg:text-4xl leading-tight font-bold text-center ${showQrCode ? "mr-[25%]" : ""}`}
                >
                  {displayValues.primaryValue}
                </div>
              </div>

              {/* Second Black Section - Only for Paybill */}
              {paymentType === "PAYBILL" && (
                <div className="bg-black flex items-center justify-center px-4 py-2">
                  <div
                    className={`w-1/2 text-sm sm:text-base md:text-lg font-bold text-white text-center ${showQrCode ? "mr-[25%]" : ""}`}
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
                    className={`w-full text-2xl sm:text-2xl md:text-2xl lg:text-4xl leading-tight font-bold text-center ${showQrCode ? "mr-[25%]" : ""}`}
                  >
                    {displayValues.secondaryValue}
                  </div>
                </div>
              )}

              {/* QR Code Display - conditional rendering */}
              {showQrCode && (
                <div className="w-1/3 absolute right-0 top-0 bottom-0 flex flex-col  justify-center bg-transparent">
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

          {/* Template Selector */}
          <div className="w-full max-w-lg mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
              Select Template Size
              <span className="ml-2 text-xs text-gray-500 italic">
                (scroll horizontally to see more)
              </span>
            </h3>
            <div className="relative w-full rounded-xl overflow-hidden">
              {/* Left scroll indicator */}
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-100 to-transparent z-10 pointer-events-none flex items-center justify-start pl-1">
                <ChevronLeftIcon className="h-6 w-6 text-gray-500 animate-pulse" />
              </div>

              {/* Right scroll indicator */}
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-100 to-transparent z-10 pointer-events-none flex items-center justify-end pr-1">
                <ChevronRightIcon className="h-6 w-6 text-gray-500 animate-pulse" />
              </div>

              <ScrollArea className="w-full h-[170px] rounded-lg">
                <div className="flex space-x-4 px-8 py-1 min-w-max">
                  {templates.map((template) => (
                    <div
                      key={template.slug}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-3 rounded-lg cursor-pointer transition-all w-[160px] h-[150px] flex flex-col ${
                        selectedTemplate.slug === template.slug
                          ? "bg-gray-800 text-white ring-2 ring-green-500"
                          : "bg-white hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="font-medium truncate">
                        {template.name}
                      </div>
                      <div className="text-xs mt-1 line-clamp-2 flex-grow">
                        {template.description}
                      </div>
                      <div
                        className={`text-xs mt-1 font-semibold ${
                          selectedTemplate.slug === template.slug
                            ? "text-green-300"
                            : "text-green-600"
                        }`}
                      >
                        {template.size.label}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          selectedTemplate.slug === template.slug
                            ? "text-gray-300"
                            : "text-gray-500"
                        }`}
                      >
                        {template.size.width}×{template.size.height}px
                      </div>
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>

      {/* Twitter CTA for Template Contributions */}
      <div className="w-full py-4 bg-blue-50 border-t border-blue-100 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center sm:justify-between">
          <div className="flex items-center mb-3 sm:mb-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-500 mr-2"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
              <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
            </svg>
            <span className="font-medium text-gray-700">
              Have a business that needs a template?
            </span>
          </div>
          <a
            href="https://x.com/davidamunga_"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
            </svg>
            Tweet @davidamunga_ to suggest new templates
          </a>
        </div>
      </div>
    </div>
  );
}

// Helper function to draw the path for a rounded rectangle with left corners rounded
function roundRectLeft(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;

  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
}
