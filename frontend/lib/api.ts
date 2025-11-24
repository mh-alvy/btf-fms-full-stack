import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/session')) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (username: string, password: string) =>
    api.post('/api/auth/login', { username, password }),
  logout: () => api.post('/api/auth/logout'),
  getSession: () => api.get('/api/auth/session'),
};

export const usersApi = {
  getAll: () => api.get('/api/users'),
  getById: (id: string) => api.get(`/api/users/${id}`),
  create: (data: any) => api.post('/api/users', data),
  update: (id: string, data: any) => api.put(`/api/users/${id}`, data),
  delete: (id: string) => api.delete(`/api/users/${id}`),
};

export const institutionsApi = {
  getAll: () => api.get('/api/institutions'),
  getById: (id: string) => api.get(`/api/institutions/${id}`),
  create: (data: any) => api.post('/api/institutions', data),
  update: (id: string, data: any) => api.put(`/api/institutions/${id}`, data),
  delete: (id: string) => api.delete(`/api/institutions/${id}`),
};

export const batchesApi = {
  getAll: () => api.get('/api/batches'),
  getById: (id: string) => api.get(`/api/batches/${id}`),
  create: (data: any) => api.post('/api/batches', data),
  update: (id: string, data: any) => api.put(`/api/batches/${id}`, data),
  delete: (id: string) => api.delete(`/api/batches/${id}`),
};

export const coursesApi = {
  getAll: () => api.get('/api/courses'),
  getById: (id: string) => api.get(`/api/courses/${id}`),
  create: (data: any) => api.post('/api/courses', data),
  update: (id: string, data: any) => api.put(`/api/courses/${id}`, data),
  delete: (id: string) => api.delete(`/api/courses/${id}`),
};

export const monthsApi = {
  getAll: () => api.get('/api/months'),
  getById: (id: string) => api.get(`/api/months/${id}`),
  create: (data: any) => api.post('/api/months', data),
  update: (id: string, data: any) => api.put(`/api/months/${id}`, data),
  delete: (id: string) => api.delete(`/api/months/${id}`),
};

export const studentsApi = {
  getAll: () => api.get('/api/students'),
  getById: (id: string) => api.get(`/api/students/${id}`),
  getByStudentId: (studentId: string) => api.get(`/api/students/byStudentId/${studentId}`),
  generateId: () => api.get('/api/students/generate-id'),
  create: (data: any) => api.post('/api/students', data),
  update: (id: string, data: any) => api.put(`/api/students/${id}`, data),
  delete: (id: string) => api.delete(`/api/students/${id}`),
  searchByName: (name: string) => api.get(`/api/students?name=${encodeURIComponent(name)}`),
  searchByStudentId: (studentId: string) => api.get(`/api/students?studentId=${encodeURIComponent(studentId)}`),
};

export const paymentsApi = {
  getAll: () => api.get('/api/payments'),
  getById: (id: string) => api.get(`/api/payments/${id}`),
  create: (data: any) => api.post('/api/payments', data),
  update: (id: string, data: any) => api.put(`/api/payments/${id}`, data),
  delete: (id: string) => api.delete(`/api/payments/${id}`),
  generateInvoice: () => api.get('/api/payments/generate-invoice'),
  getDiscounted: () => api.get('/api/payments?hasDiscount=true'),
  getPaidMonths: (studentId: string) => api.get(`/api/payments/student/${studentId}/paid-months`),
};

export const activitiesApi = {
  getAll: () => api.get('/api/activities'),
  create: (data: any) => api.post('/api/activities', data),
};

export const referenceOptionsApi = {
  getAll: () => api.get('/api/reference-options'),
  create: (data: any) => api.post('/api/reference-options', data),
  update: (id: string, data: any) => api.put(`/api/reference-options/${id}`, data),
  delete: (id: string) => api.delete(`/api/reference-options/${id}`),
};

export const receivedByOptionsApi = {
  getAll: () => api.get('/api/received-by-options'),
  create: (data: any) => api.post('/api/received-by-options', data),
  update: (id: string, data: any) => api.put(`/api/received-by-options/${id}`, data),
  delete: (id: string) => api.delete(`/api/received-by-options/${id}`),
};

export const invoicesApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    studentId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }) => api.get('/api/invoices', { params }),
  getById: (id: string) => api.get(`/api/invoices/${id}`),
  create: (data: {
    paymentId: string;
    dueDate?: string;
    notes?: string;
    emailToSend?: boolean;
  }) => api.post('/api/invoices', data),
  update: (id: string, data: {
    status?: string;
    dueDate?: string;
    notes?: string;
    paymentMethod?: string;
    reference?: string;
    receivedBy?: string;
  }) => api.put(`/api/invoices/${id}`, data),
  delete: (id: string) => api.delete(`/api/invoices/${id}`),
  getByStudent: (studentId: string, params?: {
    status?: string;
    fromDate?: string;
    toDate?: string;
  }) => api.get(`/api/invoices/student/${studentId}`, { params }),
  getOverdue: () => api.get('/api/invoices/overdue'),
  send: (id: string) => api.post(`/api/invoices/${id}/send`),
  cancel: (id: string) => api.post(`/api/invoices/${id}/cancel`),
};

export default api;
