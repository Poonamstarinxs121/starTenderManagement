import api from '../config/api';

export interface Company {
  id: number;
  name: string;
  address: string;
  website: string;
  gst_number: string;
  cin_number: string;
  created_at: string;
  updated_at: string;
}

export const companyService = {
  // Get all companies
  getAll: async () => {
    const response = await api.get<Company[]>('/companies');
    return response.data;
  },

  // Get company by ID
  getById: async (id: number) => {
    const response = await api.get<Company>(`/companies/${id}`);
    return response.data;
  },

  // Create new company
  create: async (company: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post<Company>('/companies', company);
    return response.data;
  },

  // Update company
  update: async (id: number, company: Partial<Company>) => {
    const response = await api.put<Company>(`/companies/${id}`, company);
    return response.data;
  },

  // Delete company
  delete: async (id: number) => {
    await api.delete(`/companies/${id}`);
  }
}; 