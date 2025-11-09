import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductBySlug, createOrder } from '../api/productApi';
import { VariantSelector, Variant } from '../components/VariantSelector';
import { EMIPlanSelector, EMIPlan } from '../components/EMIPlanSelector';

interface Specification {
  key: string;
  value: string;
}

interface DownpaymentOption {
  id: string;
  amount: number;
  label: string;
}

interface Product {
  _id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  variants: Variant[];
  emiPlans: EMIPlan[];
  specifications?: Specification[];
  downpaymentOptions?: DownpaymentOption[];
}

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<EMIPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [selectedDownpayment, setSelectedDownpayment] = useState<DownpaymentOption | null>(null);
  const [mainImage, setMainImage] = useState<string>('');
  const [showSpecs, setShowSpecs] = useState(false);

  // Helper function to calculate monthly payment
  const calculateMonthlyPayment = (): number => {
    if (!selectedPlan || !selectedVariant) return 0;
    
    // If monthlyPayment is already set, use it
    if (selectedPlan.monthlyPayment) return selectedPlan.monthlyPayment;
    
    // Otherwise calculate it
    const loanAmount = selectedVariant.price - (selectedDownpayment?.amount || 0);
    const monthlyRate = selectedPlan.interestRate / 12 / 100;
    
    if (monthlyRate === 0) {
      return Math.round(loanAmount / selectedPlan.tenure);
    }
    
    const numerator = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, selectedPlan.tenure);
    const denominator = Math.pow(1 + monthlyRate, selectedPlan.tenure) - 1;
    return Math.round(numerator / denominator);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (slug) {
          const data = await getProductBySlug(slug);
          setProduct(data);
          if (data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
            setMainImage(data.variants[0].image);
          }
          if (data.emiPlans.length > 0) {
            setSelectedPlan(data.emiPlans[0]);
          }
          if (data.downpaymentOptions && data.downpaymentOptions.length > 0) {
            setSelectedDownpayment(data.downpaymentOptions[0]);
          }
        }
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Recalculate EMI when downpayment changes
  useEffect(() => {
    if (selectedPlan && selectedVariant && selectedDownpayment) {
      // Trigger recalculation by setting the plan again
      setSelectedPlan({ ...selectedPlan });
    }
  }, [selectedDownpayment]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product || !selectedVariant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const handleProceed = () => {
    if (!selectedPlan || !selectedVariant) return;
    
    // Check if variant is out of stock
    if ((selectedVariant.stock || 0) === 0) {
      alert('This variant is out of stock. Please select a different variant.');
      return;
    }
    
    setShowSuccess(true);
  };

  if (orderComplete && selectedPlan) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-8">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            {/* Success Header */}
            <div className="bg-teal-50 border-b border-teal-200 p-6 text-center">
              <div className="mb-3 flex justify-center">
                <div className="bg-teal-100 p-3 rounded-full">
                  <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-teal-900">Order Confirmed</h1>
              <p className="text-teal-700 text-sm mt-1">Your EMI plan is activated</p>
            </div>

            {/* Success Content */}
            <div className="p-6">
              {/* Order Details */}
              <div className="mb-6 space-y-3 border-b pb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Product</p>
                  <p className="font-semibold text-gray-800">{product?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Variant</p>
                  <p className="text-gray-700">{selectedVariant.color} - {selectedVariant.storage}GB</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">EMI Plan</p>
                  <p className="text-gray-700">{selectedPlan.tenure} months</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Monthly Payment</p>
                  <p className="text-lg font-bold text-teal-600">₹{calculateMonthlyPayment().toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-teal-600 text-white font-semibold py-2.5 rounded hover:bg-teal-700 transition-colors text-sm"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-100 text-gray-700 font-semibold py-2.5 rounded hover:bg-gray-200 transition-colors text-sm"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess && selectedPlan) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
          {/* Success Modal */}
          <div className="bg-white rounded-lg shadow-lg p-6 w-full border border-gray-200">
            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-1 text-center">Confirm Your Order</h2>
            <p className="text-gray-600 text-sm mb-6 text-center">Review your selection before completing</p>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded p-4 mb-6 space-y-3 text-sm">
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-600">Product</span>
                <span className="font-semibold text-gray-800">{product.name}</span>
              </div>
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-600">Variant</span>
                <span className="font-semibold text-gray-800">
                  {selectedVariant.color} - {selectedVariant.storage}GB
                </span>
              </div>
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-600">Price</span>
                <span className="font-semibold text-gray-800">₹{selectedVariant.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-600">EMI Tenure</span>
                <span className="font-semibold text-gray-800">{selectedPlan.tenure} Months</span>
              </div>
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-600">Monthly EMI</span>
                <span className="font-bold text-teal-600">₹{calculateMonthlyPayment().toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="font-semibold text-gray-800">Total Amount</span>
                <span className="text-lg font-bold text-teal-600">₹{(selectedPlan.tenure * calculateMonthlyPayment()).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSuccess(false)}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 rounded hover:bg-gray-200 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    if (!selectedPlan || !selectedVariant || !product) {
                      alert('Please select all options');
                      return;
                    }
                    
                    setOrderLoading(true);
                    console.log('Creating order...');
                    console.log('Selected variant:', selectedVariant);
                    console.log('Selected plan:', selectedPlan);
                    console.log('Product:', product);
                    
                    // Calculate monthly payment
                    const monthlyPayment = calculateMonthlyPayment();
                    
                    const orderData = {
                      productId: product._id,
                      productName: product.name,
                      variantId: selectedVariant.id,
                      variantColor: selectedVariant.color,
                      variantStorage: selectedVariant.storage,
                      variantPrice: selectedVariant.price,
                      emiPlanId: selectedPlan.id,
                      emiTenure: selectedPlan.tenure,
                      monthlyPayment: monthlyPayment,
                      interestRate: selectedPlan.interestRate,
                      cashback: selectedPlan.cashback || 0,
                    };
                    
                    console.log('Order data being sent:', orderData);
                    const response = await createOrder(orderData);
                    
                    console.log('Order response:', response);
                    
                    // Show success card if order was created
                    if (response && response.order) {
                      console.log('Order created successfully, showing success card');
                      
                      // Refresh product data to get updated stock
                      if (slug) {
                        const updatedProduct = await getProductBySlug(slug);
                        setProduct(updatedProduct);
                        const updatedVariant = updatedProduct.variants.find((v: Variant) => v.id === selectedVariant.id);
                        if (updatedVariant) {
                          setSelectedVariant(updatedVariant);
                        }
                      }
                      
                      setOrderComplete(true);
                    }
                  } catch (error: any) {
                    console.error('Order error:', error);
                    const errorMessage = error.response?.data?.error || error.message || 'Failed to save order. Please try again.';
                    alert(errorMessage);
                  } finally {
                    setOrderLoading(false);
                  }
                }}
                disabled={orderLoading}
                className="flex-1 bg-teal-600 text-white font-semibold py-2.5 rounded hover:bg-teal-700 transition-colors disabled:opacity-50 text-sm"
              >
                {orderLoading ? 'Processing...' : 'Confirm & Buy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">resolv
      {/* Breadcrumb */}
      <div className="border-b border-gray-100 px-4 py-3 bg-gray-50">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-gray-500">
          <button
            onClick={() => navigate('/')}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Home
          </button>
          <span>/</span>
          <span>Smartphones</span>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Top Section - Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mb-8">
          {/* Left Column - Thumbnails */}
          <div className="md:col-span-1 flex md:flex-col flex-row md:justify-start justify-center gap-1.5 overflow-x-auto md:overflow-visible">
            {selectedVariant.images && selectedVariant.images.length > 0 ? (
              selectedVariant.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`w-12 h-14 md:w-14 md:h-16 border rounded-md overflow-hidden transition-all flex-shrink-0 flex items-center justify-center ${
                    mainImage === img 
                      ? 'border-teal-600 border-2 shadow-sm bg-white' 
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                  }`}
                >
                  <img
                    src={img}
                    alt={`view ${idx + 1}`}
                    className="w-full h-full object-contain p-1"
                  />
                </button>
              ))
            ) : (
              <div className="w-12 h-14 md:w-14 md:h-16 border-2 rounded-md overflow-hidden border-teal-600 flex items-center justify-center bg-white">
                <img
                  src={selectedVariant.image}
                  alt="product"
                  className="w-full h-full object-contain p-1"
                />
              </div>
            )}
          </div>

          {/* Middle Column - Main Image */}
          <div className="md:col-span-5">
            <div className="bg-gray-50 rounded-lg p-8 w-full h-[500px] flex items-center justify-center">
              <img
                src={mainImage || selectedVariant.image}
                alt={selectedVariant.name}
                className="max-h-[450px] w-auto object-contain"
              />
            </div>
          </div>

          {/* Right Column - Product Info and Purchase */}
          <div className="md:col-span-6 space-y-5">
            {/* Product Info */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-sm text-gray-600">
                {selectedVariant.color && `Color: ${selectedVariant.color}`}
                {selectedVariant.storage && ` • Storage: ${selectedVariant.storage}GB`}
              </p>
            </div>

            {/* Price */}
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold text-teal-600">₹{selectedVariant.price.toLocaleString()}</span>
                <span className="text-lg text-gray-400 line-through">₹{selectedVariant.mrp.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-gray-600">{product.description}</p>
                {selectedVariant.stock !== undefined && (
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    selectedVariant.stock === 0 
                      ? 'bg-red-100 text-red-700' 
                      : selectedVariant.stock <= 3 
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                  }`}>
                    {selectedVariant.stock === 0 
                      ? 'Out of Stock' 
                      : selectedVariant.stock <= 3 
                        ? `Only ${selectedVariant.stock} left`
                        : `${selectedVariant.stock} in stock`}
                  </span>
                )}
              </div>
            </div>

            {/* Downpayment Options */}
            {product.downpaymentOptions && product.downpaymentOptions.length > 0 && (
              <div className="pt-2 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Choose a Downpayment</h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.downpaymentOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedDownpayment(option)}
                      className={`py-2.5 px-3 rounded text-sm font-semibold transition-colors ${
                        selectedDownpayment?.id === option.id
                          ? 'bg-teal-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:border-teal-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Variant Selector */}
            <div className="pt-2 border-t border-gray-200">
              <VariantSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onVariantChange={(variant) => {
                  const colorMatchVariant = product.variants.find(
                    v => v.color === variant.color && v.images && v.images.length > 0
                  );
                  
                  const imagesToUse = (variant.images && variant.images.length > 0) 
                    ? variant.images 
                    : (colorMatchVariant?.images || [variant.image]);
                  
                  setSelectedVariant({
                    ...variant,
                    images: imagesToUse
                  });
                  setMainImage(imagesToUse[0] || variant.image);
                }}
              />
            </div>

            {/* EMI Plans */}
            <div className="pt-2 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Choose EMI Tenure</h3>
              <EMIPlanSelector
                plans={product.emiPlans}
                selectedPlan={selectedPlan}
                onPlanChange={setSelectedPlan}
                variantPrice={selectedVariant.price}
                downpayment={selectedDownpayment?.amount || 0}
              />
            </div>

            {/* CTA Button */}
            <button
              onClick={handleProceed}
              disabled={!selectedVariant || (selectedVariant.stock || 0) === 0}
              className={`w-full font-bold py-3.5 rounded transition-colors ${
                !selectedVariant || (selectedVariant.stock || 0) === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {!selectedVariant 
                ? 'Select Variant' 
                : (selectedVariant.stock || 0) === 0 
                  ? 'Out of Stock' 
                  : selectedPlan 
                    ? `Buy on ₹${(selectedPlan.monthlyPayment || 0).toLocaleString('en-IN')}/month` 
                    : 'Select Plan'}
            </button>

            {/* Out of Stock Warning */}
            {selectedVariant && (selectedVariant.stock || 0) === 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-700 font-semibold">⚠️ This variant is currently out of stock</p>
                <p className="text-xs text-red-600 mt-1">Please select a different variant or check back later</p>
              </div>
            )}

            {/* Low Stock Warning */}
            {selectedVariant && (selectedVariant.stock || 0) > 0 && (selectedVariant.stock || 0) <= 3 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm text-yellow-700 font-semibold">⚡ Only {selectedVariant.stock} units left!</p>
                <p className="text-xs text-yellow-600 mt-1">Order now before it's gone</p>
              </div>
            )}

            {/* Seller Info */}
            <p className="text-xs text-gray-600 text-center">
              Sold by: <span className="text-blue-600">Balaji Infocom</span>
            </p>

            {/* Shipping Details */}
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-green-700 font-semibold text-xs">🚚 Free Shipping</span>
              </div>
              <p className="text-xs text-gray-600">Dispatch in less than 48 hours and delivery in 3-7 working days after dispatch.</p>
            </div>
          </div>
        </div>

        {/* Bottom Section - Product Specifications on LEFT, Benefits on RIGHT */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Product Specifications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
                <button
                  onClick={() => setShowSpecs(!showSpecs)}
                  className="text-teal-600 font-semibold text-sm hover:underline"
                >
                  {showSpecs ? 'View less' : 'View all'}
                </button>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <ul className="space-y-3">
                  {(showSpecs ? product.specifications : product.specifications.slice(0, 6)).map((spec, idx) => (
                    <li key={idx} className="flex gap-3 text-sm">
                      <span className="text-gray-600 min-w-[150px]">• {spec.key}:</span>
                      <span className="text-gray-800">{spec.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column - Why Buy This */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Buy This?</h2>
              <div className="bg-gradient-to-br from-teal-50 to-white border border-gray-200 rounded-lg p-6">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-teal-600 text-xl">✓</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">Zero Cost EMI Available</h3>
                      <p className="text-xs text-gray-600">Pay in easy installments with 0% interest on select plans</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-teal-600 text-xl">✓</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">Fast Delivery</h3>
                      <p className="text-xs text-gray-600">Get your product delivered within 3-7 working days</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-teal-600 text-xl">✓</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">Genuine Products</h3>
                      <p className="text-xs text-gray-600">100% authentic products with manufacturer warranty</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-teal-600 text-xl">✓</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">Cashback Offers</h3>
                      <p className="text-xs text-gray-600">Get up to ₹1500 cashback on longer tenure plans</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
