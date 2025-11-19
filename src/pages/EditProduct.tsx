import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://assignment-backend-2-tt6x.onrender.com/api');

interface Variant {
  id: string;
  name: string;
  color?: string;
  storage?: string;
  price: number;
  mrp: number;
  image: string;
  stock: number;
  availableEmiPlans?: string[];
}

interface EMIPlan {
  id: string;
  tenure: number;
  interestRate: number;
  cashback?: number;
  mutualFundName?: string;
}

interface Specification {
  key: string;
  value: string;
}

export const EditProduct: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Product basic info
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  
  // Variants
  const [variants, setVariants] = useState<Variant[]>([]);
  
  // EMI Plans
  const [emiPlans, setEmiPlans] = useState<EMIPlan[]>([]);
  
  // Specifications
  const [specifications, setSpecifications] = useState<Specification[]>([{ key: '', value: '' }]);
  
  useEffect(() => {
    fetchProduct();
  }, [id]);
  
  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      const product = response.data.find((p: any) => p.id === id || p._id === id);
      
      if (!product) {
        alert('Product not found');
        navigate('/admin');
        return;
      }
      
      setName(product.name);
      setSlug(product.slug);
      setCategory(product.category);
      setDescription(product.description || '');
      
      // FORCE all variants to have undefined availableEmiPlans so ALL checkboxes show as CHECKED
      const initializedVariants = (product.variants || []).map((v: Variant) => ({
        ...v,
        availableEmiPlans: undefined  // Force undefined = all checkboxes CHECKED
      }));
      
      setVariants(initializedVariants);
      setEmiPlans(product.emiPlans || []);
      setSpecifications(product.specifications?.length > 0 ? product.specifications : [{ key: '', value: '' }]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Failed to load product');
      navigate('/admin');
    }
  };
  
  // Add Variant
  const addVariant = () => {
    setVariants([...variants, {
      id: `v${Date.now()}`,
      name: '',
      color: '',
      storage: '',
      price: 0,
      mrp: 0,
      image: '',
      stock: 10
    }]);
  };
  
  // Remove Variant
  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };
  
  // Update Variant
  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };
  
  // Add EMI Plan
  const addEMIPlan = () => {
    setEmiPlans([...emiPlans, {
      id: `p${Date.now()}`,
      tenure: 6,
      interestRate: 1.73,
      cashback: 500,
      mutualFundName: 'HDFC Bank'
    }]);
  };
  
  // Remove EMI Plan
  const removeEMIPlan = (index: number) => {
    if (emiPlans.length > 1) {
      setEmiPlans(emiPlans.filter((_, i) => i !== index));
    }
  };
  
  // Update EMI Plan
  const updateEMIPlan = (index: number, field: keyof EMIPlan, value: any) => {
    const updated = [...emiPlans];
    updated[index] = { ...updated[index], [field]: value };
    setEmiPlans(updated);
  };
  
  // Add Specification
  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };
  
  // Remove Specification
  const removeSpecification = (index: number) => {
    if (specifications.length > 1) {
      setSpecifications(specifications.filter((_, i) => i !== index));
    }
  };
  
  // Update Specification
  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...specifications];
    updated[index] = { ...updated[index], [field]: value };
    setSpecifications(updated);
  };
  
  // Submit product update
  const handleSubmit = async () => {
    try {
      setSaving(true);
      
      // Validate
      if (!name || !slug || !category) {
        alert('Please fill in required fields: Name, Slug, Category');
        setSaving(false);
        return;
      }
      
      if (variants.length === 0) {
        alert('Please add at least one variant');
        setSaving(false);
        return;
      }
      
      if (emiPlans.length === 0) {
        alert('Please add at least one EMI plan');
        setSaving(false);
        return;
      }
      
      // Update variant names and convert undefined availableEmiPlans to all plan IDs
      const processedVariants = variants.map(v => ({
        ...v,
        name: `${v.color} ${v.storage}`,
        // If undefined (all checked), convert to array of all plan IDs
        availableEmiPlans: v.availableEmiPlans === undefined 
          ? emiPlans.map(p => p.id) 
          : v.availableEmiPlans
      }));
      
      const productData = {
        name,
        slug,
        category,
        description,
        variants: processedVariants,
        emiPlans,
        specifications: specifications.filter(s => s.key && s.value),
        downpaymentOptions: []
      };
      
      console.log('💾 Saving product with variants:', processedVariants.map(v => ({
        name: v.name,
        availableEmiPlans: v.availableEmiPlans
      })));
      
      await axios.put(`${API_BASE_URL}/products/${id}`, productData);
      
      alert('Product updated successfully!');
      navigate('/admin');
    } catch (error: any) {
      console.error('Error updating product:', error);
      alert(error.response?.data?.error || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-sm text-gray-600">Modify product details, variants, and EMI plans</p>
            </div>
            <button 
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Slug *</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
        
        {/* Variants */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Variants</h2>
            <button
              onClick={addVariant}
              className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors text-sm font-semibold"
            >
              + Add Variant
            </button>
          </div>
          
          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div key={index} className="border border-gray-200 rounded p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-700">Variant {index + 1}</h3>
                  {variants.length > 1 && (
                    <button
                      onClick={() => removeVariant(index)}
                      className="text-red-600 hover:text-red-700 text-sm font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Color</label>
                    <input
                      type="text"
                      value={variant.color}
                      onChange={(e) => updateVariant(index, 'color', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Storage</label>
                    <input
                      type="text"
                      value={variant.storage}
                      onChange={(e) => updateVariant(index, 'storage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Stock</label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">MRP (₹)</label>
                    <input
                      type="number"
                      value={variant.mrp}
                      onChange={(e) => updateVariant(index, 'mrp', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Image URL</label>
                    <input
                      type="text"
                      value={variant.image}
                      onChange={(e) => updateVariant(index, 'image', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                  
                  {/* EMI Plans Selection for this Variant */}
                  {emiPlans.length > 0 && (
                    <div className="md:col-span-3 mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        🎯 Available EMI Plans for This Variant
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {emiPlans.map((plan) => {
                          // If availableEmiPlans is undefined/null, default to all checked
                          // If it's an empty array, that means user unchecked everything (show none)
                          // If it has values, check if this plan is in the array
                          const isChecked = variant.availableEmiPlans === undefined 
                            ? true 
                            : variant.availableEmiPlans.includes(plan.id);
                          
                          return (
                            <label key={plan.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  // If currently undefined (all selected), initialize with all plan IDs
                                  const currentPlans = variant.availableEmiPlans === undefined 
                                    ? emiPlans.map(p => p.id)  // Start with all IDs
                                    : variant.availableEmiPlans;
                                  
                                  const newPlans = e.target.checked
                                    ? [...currentPlans, plan.id]
                                    : currentPlans.filter(id => id !== plan.id);
                                  
                                  updateVariant(index, 'availableEmiPlans', newPlans);
                                }}
                                className="w-4 h-4 text-teal-600 rounded"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {plan.tenure} months @ {plan.interestRate}%
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      <p className="text-xs font-semibold text-blue-700 mt-2">
                        ✅ CHECKED = Plan will be visible to customers<br/>
                        ❌ UNCHECKED = Plan will be hidden for this variant
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* EMI Plans */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">EMI Plans</h2>
            <button
              onClick={addEMIPlan}
              className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors text-sm font-semibold"
            >
              + Add EMI Plan
            </button>
          </div>
          
          <div className="space-y-4">
            {emiPlans.map((plan, index) => (
              <div key={index} className="border border-gray-200 rounded p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-700">Plan {index + 1}</h3>
                  {emiPlans.length > 1 && (
                    <button
                      onClick={() => removeEMIPlan(index)}
                      className="text-red-600 hover:text-red-700 text-sm font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tenure (Months)</label>
                    <select
                      value={plan.tenure}
                      onChange={(e) => updateEMIPlan(index, 'tenure', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    >
                      <option value={3}>3 Months</option>
                      <option value={6}>6 Months</option>
                      <option value={9}>9 Months</option>
                      <option value={12}>12 Months</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={plan.interestRate}
                      onChange={(e) => updateEMIPlan(index, 'interestRate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Cashback (₹)</label>
                    <input
                      type="number"
                      value={plan.cashback || 0}
                      onChange={(e) => updateEMIPlan(index, 'cashback', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Bank/Fund Name</label>
                    <input
                      type="text"
                      value={plan.mutualFundName || ''}
                      onChange={(e) => updateEMIPlan(index, 'mutualFundName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Specifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Specifications</h2>
            <button
              onClick={addSpecification}
              className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors text-sm font-semibold"
            >
              + Add Specification
            </button>
          </div>
          
          <div className="space-y-3">
            {specifications.map((spec, index) => (
              <div key={index} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={spec.key}
                  onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                  placeholder="Key (e.g., Storage)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                  placeholder="Value (e.g., 256 GB)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
                {specifications.length > 1 && (
                  <button
                    onClick={() => removeSpecification(index)}
                    className="text-red-600 hover:text-red-700 text-sm font-semibold"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="px-8 bg-gray-100 text-gray-700 font-bold py-3 rounded hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
