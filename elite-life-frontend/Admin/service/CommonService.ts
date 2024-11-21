import axios from "axios";

// Tạo một phiên bản Axios cho JSON data
export const http = axios.create({
  baseURL: '/api',
  headers: {
    "Content-type": "application/json",
  }
});

// Tạo một phiên bản Axios cho multipart/form-data
export const httpFormData = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'multipart/form-data',
  }
});

export const httpDownload = axios.create({
  baseURL: '/api',
  headers: {
    "Content-type": "application/json",
  },
  responseType: 'blob'
});