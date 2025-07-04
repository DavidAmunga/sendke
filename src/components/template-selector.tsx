import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Template } from "@/types/Template";

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplate: Template;
  onTemplateSelect: (template: Template) => void;
}

export function TemplateSelector({
  templates,
  selectedTemplate,
  onTemplateSelect,
}: TemplateSelectorProps) {
  return (
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
                onClick={() => onTemplateSelect(template)}
                className={`p-3 rounded-lg cursor-pointer transition-all w-[160px] h-[150px] flex flex-col ${
                  selectedTemplate.slug === template.slug
                    ? "bg-gray-800 text-white ring-2 ring-green-500"
                    : "bg-white hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <div className="font-medium truncate">{template.name}</div>
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
  );
}
