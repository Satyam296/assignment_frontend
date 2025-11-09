import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://assignment-backend-1-84be.onrender.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = async () => {
  const response = await apiClient.get('/api/products');
  return response.data;
};

export const getProductBySlug = async (slug: string) => {
  const response = await apiClient.get(`/api/products/${slug}`);
  return response.data;
};

export const createOrder = async (orderData: {
  productId: string;
  productName: string;
  variantId: string;
  variantColor?: string;
  variantStorage?: string;
  variantPrice: number;
  emiPlanId: string;
  emiTenure: number;
  monthlyPayment: number;
  interestRate: number;
  cashback?: number;
}) => {
  const response = await apiClient.post('/api/orders', orderData);
  return response.data;
};

export const getAllOrders = async () => {
  const response = await apiClient.get('/api/orders');
  return response.data;
};

export const getOrderById = async (id: string) => {
  const response = await apiClient.get(`/api/orders/${id}`);
  return response.data;
};

