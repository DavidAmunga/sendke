import { useRef } from "react";
import { Button } from "./components/ui/button";
import { CheckIcon, GithubIcon, LockIcon } from "lucide-react";
import { motion } from "motion/react";
import { ColorPicker } from "./components/ui/color-picker";
import { Checkbox } from "./components/ui/checkbox";
import { Input } from "./components/ui/input";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define zod schema for validation
const formSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  name: z.string().optional(),
  selectedColor: z.string(),
  showName: z.boolean(),
  header: z.string().min(1, "Header cannot be empty")
}).refine((data) => {
  // If showName is true, name must not be empty
  if (data.showName) {
    return data.name && data.name.trim().length > 0;
  }
  return true;
}, {
  message: "Name is required when 'Show Name' is enabled",
  path: ["name"]
});

// Define form type
interface FormValues {
  phoneNumber: string;
  name: string;
  selectedColor: string;
  showName: boolean;
  header: string;
}

function App() {
  const posterRef = useRef<HTMLDivElement>(null);
  
  // Setup react-hook-form with zod resolver
  const { control, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
      name: "",
      selectedColor: "#16a34a", // Default green-600
      showName: true,
      header: "SEND MONEY"
    },
    mode: "onChange" // Validate on change for immediate feedback
  });

  // Watch values for preview
  const phoneNumber = watch("phoneNumber");
  const name = watch("name");
  const selectedColor = watch("selectedColor");
  const showName = watch("showName");
  const header = watch("header");

  const colorOptions = [
    { name: "Green", value: "#16a34a", class: "bg-green-600" },
    { name: "Rose", value: "#be123c", class: "bg-rose-700" },
    { name: "Yellow", value: "#F7C50C", class: "bg-[#F7C50C]" },
    { name: "Blue", value: "#155DFC", class: "bg-blue-700" },
  ];

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    const match = numbers.match(/^(\d{4})(\d{3})(\d{3})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
    return value;
  };

  const onSubmit = handleSubmit(async () => {
    await handleDownload();
  });

  const handleDownload = async () => {
    if (!posterRef.current) return;

    try {
      // Ensure Inter font is loaded before drawing
      await document.fonts.load("bold 120px Inter");

      // Create canvas with 16:9 aspect ratio
      const canvas = document.createElement("canvas");
      const width = 1200;
      const height = 675;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Unable to get canvas context");
        return;
      }

      // Colors
      const mainColor = selectedColor; // Use the selected color
      const borderColor = "#1a2335";
      const whiteColor = "#ffffff";

      // Define dimensions
      const borderSize = 8;
      
      // Adjust heights based on whether name is shown
      const sectionCount = showName ? 3 : 2;
      const sectionHeight = height / sectionCount;

      // Draw outer border
      ctx.fillStyle = borderColor;
      ctx.fillRect(0, 0, width, height);

      // Draw top section (colored with header)
      ctx.fillStyle = mainColor;
      ctx.fillRect(
        borderSize,
        borderSize,
        width - 2 * borderSize,
        sectionHeight - borderSize
      );

      // Draw middle section (white with phone number)
      ctx.fillStyle = whiteColor;
      ctx.fillRect(
        borderSize,
        sectionHeight + borderSize,
        width - 2 * borderSize,
        showName ? sectionHeight - 2 * borderSize : height - sectionHeight - 2 * borderSize
      );

      // Draw bottom section (colored with name) only if name is shown
      if (showName) {
        ctx.fillStyle = mainColor;
        ctx.fillRect(
          borderSize,
          2 * sectionHeight + borderSize,
          width - 2 * borderSize,
          sectionHeight - 2 * borderSize
        );
      }

      // Set text properties
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Draw header text with Inter font
      ctx.fillStyle = whiteColor;
      ctx.font = "bold 120px Inter, sans-serif";
      ctx.fillText(header.toUpperCase(), width / 2, sectionHeight / 2);

      // Draw phone number with Inter font
      ctx.fillStyle = "#000000";
      ctx.font = "bold 130px Inter, sans-serif";
      ctx.fillText(phoneNumber, width / 2, showName ? height / 2 : (sectionHeight + (height - sectionHeight) / 2));

      // Draw name with Inter font (only if name is shown)
      if (showName) {
        ctx.fillStyle = whiteColor;
        ctx.font = "bold 120px Inter, sans-serif";
        ctx.fillText(name, width / 2, height - sectionHeight / 2);
      }

      // Generate download link
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `send-ke-${phoneNumber.replace(/\s/g, "")}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 overflow-x-hidden relative">
      {/* Dotted background pattern */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(#3b82f6 0.5px, transparent 0.5px), radial-gradient(#3b82f6 0.5px, #f3f4f6 0.5px)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 10px 10px",
          opacity: 0.1,
        }}
      ></div>

      {/* Header - Only for small screens */}
      <header className="w-full py-4 px-4 sm:px-6 lg:px-8 bg-white shadow-sm md:hidden relative z-10">
        <div className="max-w-7xl mx-auto flex-col justify-center flex  items-center">
          <h1 className="text-2xl font-display sm:text-3xl font-bold text-green-600">
            send.ke
          </h1>
          <h3 className="text-md  font-display text-gray-800 mt-2 max-w-md">
            Your Phone Number 🤝 Payment Poster
          </h3>
        </div>
      </header>

      {/* Main Content - Side by Side Layout */}
      <main className="flex-1 flex flex-col md:flex-row px-4 py-6 sm:py-8 md:py-0 sm:px-6 lg:px-8 gap-8 relative z-10">
        {/* Left Column - App Info */}
        <div className="w-full md:w-1/2 flex flex-col justify-center md:py-12 md:px-8">
          {/* Header for medium screens and up - now in left column */}
          <div className="hidden md:block mb-8">
            <h1 className="text-4xl font-display font-bold text-green-600">
              send.ke
            </h1>
            <h3 className="text-lg font-display text-gray-800 mt-2 max-w-md">
              Your Phone Number 🤝 Payment Poster
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

          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl  font-bold text-gray-900 mb-4">
              Make Your Payment Poster
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="header"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Header Text
                </label>
                <Controller
                  name="header"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="header"
                      type="text"
                      value={field.value}
                      onChange={field.onChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold"
                      placeholder="SEND MONEY"
                    />
                  )}
                />
                {errors.header && (
                  <p className="mt-1 text-sm text-red-500">{errors.header.message}</p>
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
                      value={field.value}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
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
                  <p className="mt-1 text-sm text-red-500">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2 mb-2">
                <Controller
                  name="showName"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="showName"
                      checked={field.value}
                      onCheckedChange={(checked) => {
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

              {showName && (
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
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.value.toUpperCase());
                        }}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold"
                        placeholder="JOHN DOE"
                      />
                    )}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                  )}
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
                  type="submit"
                  disabled={!isValid}
                  className="w-full bg-gray-800 text-white text-xl font-bold py-8 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  DOWNLOAD
                </Button>
              </motion.div>
            </form>
          </div>

          <div className="text-center text-gray-500 mt-2 text-sm">
            Download It, Share It , Stick it anywhere !
          </div>
        </div>

        {/* Right Column - Poster Preview */}
        <div className="w-full md:w-1/2 flex items-center justify-center md:py-12">
          <div className="w-full max-w-lg">
            <div
              id="poster"
              ref={posterRef}
              className="grid grid-rows-3 bg-white w-full aspect-video rounded-lg shadow-lg overflow-hidden border-8 border-gray-800"
              style={{
                gridTemplateRows: showName ? "1fr 1fr 1fr" : "1fr 1fr",
              }}
            >
              {/* Send Money Header */}
              <div
                className="flex items-center justify-center px-4 sm:px-6"
                style={{ backgroundColor: selectedColor }}
              >
                <h2 className="text-2xl sm:text-2xl md:text-2xl lg:text-4xl leading-tight select-none font-bold text-white text-center">
                  {header}
                </h2>
              </div>

              {/* Phone Number Display */}
              <div
                className="bg-white flex items-center justify-center px-4 sm:px-6"
                style={{
                  borderTop: "8px solid #1a2335",
                  borderBottom: showName ? "8px solid #1a2335" : "none",
                }}
              >
                <div className="w-full text-2xl sm:text-2xl md:text-2xl lg:text-4xl leading-tight font-bold text-center">
                  {phoneNumber || "0712 345 678"}
                </div>
              </div>

              {/* Name Display - conditional rendering */}
              {showName && (
                <div
                  className="flex items-center justify-center px-4 sm:px-6"
                  style={{ backgroundColor: selectedColor }}
                >
                  <div className="w-full text-2xl sm:text-2xl md:text-2xl lg:text-4xl leading-tight font-bold text-white text-center">
                    {name || "JOHN DOE"}
                  </div>
                </div>
              )}
            </div>
            <p className="text-center text-gray-500 mt-2 text-sm">
              Preview of your poster
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 border-t border-gray-200 mt-8 bg-white relative z-10">
        <div className="max-w-7xl mx-auto flex justify-center items-center">
          <p className="text-sm text-gray-600">
            Made with ❤️ by{" "}
            <a
              href="https://davidamunga.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              David Amunga
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
