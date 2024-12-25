import { useState } from "react";
import { Button } from "./components/ui/button";
import html2canvas from "html2canvas";

function App() {
  const [phoneNumber, setPhoneNumber] = useState("0712 345 678");
  const [name, setName] = useState("JOHN DOE");

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const match = numbers.match(/^(\d{4})(\d{3})(\d{3})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setPhoneNumber(formatPhoneNumber(value));
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value.toUpperCase());
  };

  const isValid = () => {
    return (
      phoneNumber.replace(/\D/g, "").length === 10 && name.trim().length > 0
    );
  };

  const handleDownload = async () => {
    const poster = document.getElementById("poster");
    if (!poster) return;

    try {
      const canvas = await html2canvas(poster, {
        scale: 4, // Increase quality
        useCORS: true,
        backgroundColor: null,
        logging: false,
        width: 1920, // Fixed width for 16:9 aspect ratio
        height: 1080, // Fixed height for 16:9 aspect ratio
      });

      // Convert to high-quality PNG
      const image = canvas.toDataURL("image/png", 1.0);

      // Create download link
      const link = document.createElement("a");
      link.download = `send-ke-${phoneNumber.replace(/\s/g, "")}.png`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="h-full w-full">
        <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">send.ke</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-4 py-12 sm:px-6 lg:px-8 gap-6">
        <div className="w-full max-w-5xl mx-auto aspect-video">
          <div
            id="poster"
            className="grid grid-rows-3 bg-white w-full h-full rounded-lg shadow-lg overflow-hidden border-8 border-gray-800"
          >
            {/* Send Money Header */}
            <div className="bg-green-600 flex items-center justify-center px-6">
              <h2 className="text-[min(10vw,5rem)] leading-tight select-none font-bold text-white text-center">
                SEND MONEY
              </h2>
            </div>

            {/* Phone Number Input */}
            <div className="bg-white border-y-8 border-gray-800 flex items-center justify-center px-6">
              <input
                type="text"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="w-full text-[min(10vw,5rem)] leading-tight font-bold text-center border-none focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="Enter Phone Number"
              />
            </div>

            {/* Name Input */}
            <div className="bg-green-600 flex items-center justify-center px-6">
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                className="w-full text-[min(10vw,5rem)] leading-tight font-bold text-white text-center bg-transparent border-none focus:ring-2 focus:ring-white focus:outline-none placeholder-white"
                placeholder="Enter name"
              />
            </div>
          </div>
        </div>

        {/* Download Button */}
        <Button
          onClick={handleDownload}
          disabled={!isValid()}
          className="w-full bg-gray-800 text-white text-[min(5vw,2rem)] font-bold py-12 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          DOWNLOAD
        </Button>
      </main>
    </div>
  );
}

export default App;
