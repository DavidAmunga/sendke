import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckIcon,
  GithubIcon,
  LockIcon,
  QrCodeIcon,
  InfoIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { ColorPicker } from "@/components/ui/color-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import templates from "@/data/templates.json";
import { BsTwitterX } from "react-icons/bs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { PaymentForm, PaymentType, Template } from "@/types/PaymentForm";
import { FORM_DEFAULT_VALUES, formSchema } from "@/schemas/form";
import { PosterPreview } from "@/components/poster-preview";
import { downloadPoster } from "@/utils/poster-download";
import {
  formatAccountNumber,
  formatBusinessNumber,
  formatPhoneNumber,
} from "@/lib/helpers";

export const Route = createFileRoute("/")({
  component: Home,
});

interface HomeProps {
  formDefaults?: Partial<PaymentForm>;
}

export function Home({ formDefaults }: HomeProps = {}) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);

  const mergedDefaults = { ...FORM_DEFAULT_VALUES, ...formDefaults };

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<PaymentForm>({
    resolver: zodResolver(formSchema),
    defaultValues: mergedDefaults,
    mode: "onChange",
  });

  const {
    paymentType,
    phoneNumber,
    paybillNumber,
    accountNumber,
    tillNumber,
    name,
    selectedColor,
    showName,
    showQrCode,
    title,
    fontScale = 1.0,
  } = useWatch({
    control,
    defaultValue: mergedDefaults,
  });

  const colorOptions = [
    { name: "Green", value: "#16a34a", class: "bg-green-600" },
    { name: "Rose", value: "#be123c", class: "bg-rose-700" },
    { name: "Yellow", value: "#F7C50C", class: "bg-[#F7C50C]" },
    { name: "Blue", value: "#1B398E", class: "bg-blue-800" },
  ];

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
          secondaryValue: formatAccountNumber(accountNumber || "123456"),
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
    await downloadPoster({
      posterRef,
      selectedTemplate,
      selectedColor: selectedColor || "#16a34a",
      paymentType: paymentType || "SEND_MONEY",
      showName: showName || false,
      showQrCode: showQrCode || false,
      title: title || "SEND MONEY",
      fontScale: fontScale || 1.0,
      displayValues,
    });
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
                                autoComplete="off"
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
                                autoComplete="off"
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
                                autoComplete="off"
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
                                autoComplete="off"
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
                                  field.onChange(formatAccountNumber(value));
                                }}
                                autoComplete="off"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Font Size: {Math.round(fontScale * 100)}%
                  </label>
                  <Controller
                    name="fontScale"
                    control={control}
                    render={({ field }) => (
                      <Slider
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        min={0.7}
                        max={1.8}
                        step={0.1}
                        className="w-full"
                      />
                    )}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>70%</span>
                    <span>100%</span>
                    <span>180%</span>
                  </div>
                </div>
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
        <PosterPreview
          ref={posterRef}
          selectedTemplate={selectedTemplate}
          paymentType={paymentType || "SEND_MONEY"}
          selectedColor={selectedColor || "#16a34a"}
          showName={showName || false}
          showQrCode={showQrCode || false}
          title={title || "SEND MONEY"}
          fontScale={fontScale || 1.0}
          displayValues={displayValues}
          templates={templates}
          onTemplateSelect={setSelectedTemplate}
        />
      </div>

      {/* Twitter CTA for Template Contributions */}
      <div className="w-full py-4 bg-gray-50 border-t border-gray-100 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center sm:justify-between">
          <div className="flex items-center mb-3 sm:mb-0">
            <BsTwitterX className="w-4 h-4 mr-2" />
            <span className="font-medium text-gray-700">
              Have a business that needs a template?
            </span>
          </div>
          <a
            href="https://x.com/davidamunga_"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            <BsTwitterX className="w-4 h-4 mr-2 text-white" />
            Tweet @davidamunga_ to suggest new templates
          </a>
        </div>
      </div>
    </div>
  );
}
