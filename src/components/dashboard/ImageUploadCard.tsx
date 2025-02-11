import React, { useState } from "react";
import { Card } from "../ui/card";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadCardProps {
  onImageSelect: (file: File) => void;
  selectedImage?: string;
  onRemove?: () => void;
}

const ImageUploadCard = ({
  onImageSelect,
  selectedImage,
  onRemove,
}: ImageUploadCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      onImageSelect(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="image-upload"
        onChange={handleFileSelect}
      />
      <label
        htmlFor="image-upload"
        className="block"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card
          className={cn(
            "relative overflow-hidden rounded-2xl transition-all duration-300",
            "aspect-square w-full max-w-md mx-auto",
            !selectedImage &&
              "border-2 border-dashed border-purple-300/20 bg-[#13111C]",
          )}
        >
          {selectedImage ? (
            <>
              <img
                src={selectedImage}
                alt="Selected"
                className="w-full h-full object-cover rounded-2xl"
              />
              {(isHovered || onRemove) && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onRemove?.();
                  }}
                  className="absolute top-2 right-2 p-2 rounded-full bg-purple-600 text-white
                           hover:bg-purple-700 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 bg-[#13111C]">
              <ImagePlus className="w-8 h-8 mb-2 text-purple-400" />
              <p className="text-purple-200/60 text-center">
                Drop an image or click to upload
              </p>
            </div>
          )}
        </Card>
      </label>
    </div>
  );
};

export default ImageUploadCard;
