import React, { useState } from 'react';

export interface Variant {
  id: string;
  name: string;
  color?: string;
  storage?: string;
  price: number;
  mrp: number;
  image: string;
  images?: string[];
  stock?: number;
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariant: Variant;
  onVariantChange: (variant: Variant) => void;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariant,
  onVariantChange,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>(selectedVariant.color || '');
  const [showColorDropdown, setShowColorDropdown] = useState(false);

  // Get unique colors from variants
  const colors = Array.from(new Set(variants.map(v => v.color).filter(Boolean))) as string[];
  
  // Filter variants by selected color
  const variantsForColor = selectedColor 
    ? variants.filter(v => v.color === selectedColor)
    : variants;

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setShowColorDropdown(false);
    // Auto-select first variant of this color
    const firstVariantOfColor = variants.find(v => v.color === color);
    if (firstVariantOfColor) {
      onVariantChange(firstVariantOfColor);
    }
  };

  const handleVariantSelect = (variant: Variant) => {
    onVariantChange(variant);
  };

  return (
    <div className="mb-8 space-y-6">
      {/* Color Selector Dropdown */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Choose a Color</h3>
        <div className="relative">
          <button
            onClick={() => setShowColorDropdown(!showColorDropdown)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-left font-medium text-gray-900 hover:border-primary transition-all flex justify-between items-center"
          >
            <span>{selectedColor || 'Select Color'}</span>
            <span className={`transform transition-transform ${showColorDropdown ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {/* Dropdown Menu */}
          {showColorDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 border-2 border-gray-300 bg-white rounded-lg shadow-lg z-10">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    selectedColor === color ? 'bg-primary/10 font-semibold text-primary' : ''
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Storage/Variant Selector */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Choose Storage</h3>
        <div className="flex gap-3 flex-wrap">
          {variantsForColor.map((variant) => (
            <button
              key={variant.id}
              onClick={() => handleVariantSelect(variant)}
              className={`px-6 py-3 border-2 rounded-lg font-medium transition-all ${
                selectedVariant.id === variant.id
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-300 text-gray-900 hover:border-primary'
              }`}
            >
              {variant.storage}
            </button>
          ))}
        </div>

        {/* Price Display */}
        {selectedVariant && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-baseline">
              <span className="text-gray-600">Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">₹{selectedVariant.price.toLocaleString()}</span>
                <span className="text-sm text-gray-500 line-through">₹{selectedVariant.mrp.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
