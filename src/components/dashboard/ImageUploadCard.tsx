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
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>(
    { width: 0, height: 0 },
  );

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

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    setImageSize({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
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
            !selectedImage &&
              "border-2 border-dashed border-purple-300/20 bg-[#13111C]",
            selectedImage
              ? "inline-block"
              : "w-full aspect-square max-w-md mx-auto",
          )}
        >
          {selectedImage ? (
            <>
              <img
                src={selectedImage}
                alt="Selected"
                className="max-w-full h-auto object-contain rounded-2xl"
                onLoad={handleImageLoad}
              />
              {isHovered && onRemove && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onRemove?.();
                  }}
                  className="absolute top-2 right-2 p-2 rounded-full bg-purple-600/80 text-white
                           hover:bg-purple-700 transition-colors duration-200 opacity-0 hover:opacity-100"
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
      {selectedImage && imageSize.width > 0 && (
        <p className="mt-2 text-sm text-purple-200/60 text-center">
          {imageSize.width} × {imageSize.height}px
        </p>
      )}
    </div>
  );
};

export default ImageUploadCard;
