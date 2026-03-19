import axios from 'axios';
import config from '../config';
import { getIdToken } from './auth';

const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (reqConfig) => {
  try {
    const token = await getIdToken();
    reqConfig.headers.Authorization = token;
  } catch {
    // Not authenticated
  }
  return reqConfig;
});

// Products
export const createProduct = (data) => api.post('/products', data);
export const listProducts = () => api.get('/products');
export const getProduct = (id) => api.get(`/products/${id}`);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Warranties
export const createWarranty = (data) => api.post('/warranties', data);
export const listWarranties = () => api.get('/warranties');
export const getWarranty = (id) => api.get(`/warranties/${id}`);
export const updateWarranty = (id, data) => api.put(`/warranties/${id}`, data);
export const deleteWarranty = (id) => api.delete(`/warranties/${id}`);

// Service History
export const createServiceRecord = (data) => api.post('/service-history', data);
export const listServiceHistory = (productId) => {
  const params = productId ? { product_id: productId } : {};
  return api.get('/service-history', { params });
};
export const getServiceRecord = (id) => api.get(`/service-history/${id}`);
export const updateServiceRecord = (id, data) => api.put(`/service-history/${id}`, data);
export const deleteServiceRecord = (id) => api.delete(`/service-history/${id}`);

// Documents
export const getUploadUrl = (data) => api.post('/documents/upload-url', data);
export const getDownloadUrl = (key) => api.get(`/documents/download-url/${encodeURIComponent(key)}`);
export const deleteDocument = (key) => api.delete(`/documents/${encodeURIComponent(key)}`);

// Upload file through Lambda (no CORS issues - goes through API Gateway)
export const uploadFileToS3 = async (file, warrantyId) => {
  // Read file as base64
  const base64Data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]; // Remove data:...;base64, prefix
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Upload through Lambda endpoint
  const { data } = await api.post('/documents/upload', {
    filename: file.name,
    file_size: file.size,
    file_data: base64Data,
    warranty_id: warrantyId,
  });

  return data.s3_key;
};

export default api;
