import { useState, useEffect } from 'react';
import { companyService, Company } from '../services/companyService';

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all companies
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await companyService.getAll();
      setCompanies(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  // Create a new company
  const createCompany = async (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newCompany = await companyService.create(companyData);
      setCompanies(prev => [...prev, newCompany]);
      return newCompany;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create company');
      throw err;
    }
  };

  // Update a company
  const updateCompany = async (id: number, companyData: Partial<Company>) => {
    try {
      const updatedCompany = await companyService.update(id, companyData);
      setCompanies(prev => prev.map(company => 
        company.id === id ? updatedCompany : company
      ));
      return updatedCompany;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company');
      throw err;
    }
  };

  // Delete a company
  const deleteCompany = async (id: number) => {
    try {
      await companyService.delete(id);
      setCompanies(prev => prev.filter(company => company.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete company');
      throw err;
    }
  };

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  return {
    companies,
    loading,
    error,
    createCompany,
    updateCompany,
    deleteCompany,
    refreshCompanies: fetchCompanies
  };
}; 