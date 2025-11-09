import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../api/productApi';

interface Product {
  _id: string;
  slug: string;
  name: string;
  category: string;
  variants: Array<{
    id: string;
    name: string;
    price: number;
    mrp: number;
    image: string;
    stock?: number;
  }>;
}

export const ProductListing: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const defaultVariant = product.variants[0];
              const discount = Math.round(((defaultVariant.mrp - defaultVariant.price) / defaultVariant.mrp) * 100);
              const isIPhone17Pro = product.name.includes('iPhone 17 Pro');
              const isSamsungS24 = product.name.includes('Samsung S24 Ultra');
              const isOutOfStock = (defaultVariant.stock || 0) === 0;
  
              const imageUrl = isIPhone17Pro 
                ? "https://images.snapmint.com/product_assets/images/001/154/792/large/open-uri20251021-2855301-1lwknri?1761017541"
                : isSamsungS24
                ? "https://imgs.search.brave.com/AXtpn5dD77jLltjU1DGVp6gk5M857A1MKb3HeWUW5AI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9maXJz/dGh1Yi5pbi9wdWJs/aWMvdXBsb2Fkcy9h/bGwvQXcwcVBvem04/YzdoWlR4dnl2d1dL/VUxXOHBMQVZ6N2xr/bXVIbTF2Mi53ZWJw"
                : defaultVariant.image;
              
              return (
                <div
                  key={product._id}
                  onClick={() => !isOutOfStock && navigate(`/products/${product.slug}`)}
                  className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 text-left cursor-pointer"
                >
                  {/* Image Container */}
                  <div className="relative bg-gray-50 overflow-hidden flex items-center justify-center" style={{ aspectRatio: '1', minHeight: '280px' }}>
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="max-h-[240px] w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Out of Stock Badge */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-lg">
                          OUT OF STOCK
                        </div>
                      </div>
                    )}
                    
                    {/* Discount Badge */}
                    {!isOutOfStock && discount > 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-2.5 py-1 rounded text-xs font-bold">
                        {discount}% OFF
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-4">
                    <h2 className="font-semibold text-gray-900 mb-1 text-sm line-clamp-2">
                      {product.name}
                    </h2>
                    
                    <p className="text-xs text-gray-600 mb-3">{product.category}</p>

                    {/* Price Section */}
                    <div className="mb-3 pb-3 border-b border-gray-100">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          ₹{defaultVariant.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          ₹{defaultVariant.mrp.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* EMI Info */}
                    <p className="text-xs text-teal-600 font-semibold mb-3">
                      {isOutOfStock ? (
                        <span className="text-red-600">Currently Unavailable</span>
                      ) : (
                        'EMI from ₹5,000/month'
                      )}
                    </p>

                    {/* CTA Button */}
                    <div 
                      className={`w-full font-semibold py-2.5 rounded text-sm transition-colors text-center ${
                        isOutOfStock 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-teal-600 hover:bg-teal-700 text-white'
                      }`}
                    >
                      {isOutOfStock ? 'Out of Stock' : 'Shop Now'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
