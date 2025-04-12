import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Company {
  id: number;
  name: string;
  address: string;
  website: string;
  gst_number: string;
  cin_number: string;
  contact_person: string;
  email: string;
  phone: string;
}

export const CompanyList: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/companies');
      setCompanies(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this company?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5001/api/companies/${id}`);
      setCompanies(companies.filter(company => company.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete company');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {companies.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No companies found. Add your first company!
        </div>
      ) : (
        companies.map(company => (
          <div key={company.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{company.name}</h3>
                {company.address && (
                  <p className="mt-1 text-gray-600">{company.address}</p>
                )}
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">GST Number</p>
                    <p className="font-medium">{company.gst_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">CIN Number</p>
                    <p className="font-medium">{company.cin_number}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {company.contact_person && (
                    <div>
                      <p className="text-sm text-gray-500">Contact Person</p>
                      <p className="font-medium">{company.contact_person}</p>
                    </div>
                  )}
                  {company.email && (
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{company.email}</p>
                    </div>
                  )}
                  {company.phone && (
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{company.phone}</p>
                    </div>
                  )}
                  {company.website && (
                    <div>
                      <p className="text-sm text-gray-500">Website</p>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(company.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}; 