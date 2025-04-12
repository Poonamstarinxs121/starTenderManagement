import React, { useState } from 'react';
import axios from 'axios';

interface CompanyData {
  company_id?: string;
  company_name: string;
  phoneno: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  pan: string;
  gst: string;
  company_type: 'OEM' | 'Regular';
  documents: {
    gst_certificate?: File;
    pan_card?: File;
    registration_certificate?: File;
  };
}

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-3 rounded-lg shadow-lg flex items-center z-50 max-w-md`}>
      <span className="mr-2">{type === 'success' ? '✓' : '⚠'}</span>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">×</button>
    </div>
  );
};

export const AddCompanyForm: React.FC = () => {
  const [formData, setFormData] = useState<CompanyData>({
    company_name: '',
    phoneno: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    pan: '',
    gst: '',
    company_type: 'OEM',
    documents: {}
  });

  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const validateForm = () => {
    if (!formData.company_name.trim()) throw new Error('Company name is required');
    if (!formData.phoneno.trim()) throw new Error('Phone number is required');
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) throw new Error('Invalid email format');
    if (!formData.pan.match(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)) throw new Error('Invalid PAN format');
    if (!formData.gst.match(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)) throw new Error('Invalid GST format');
    if (!formData.pincode.match(/^[0-9]{6}$/)) throw new Error('Invalid pincode format');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [name]: files[0]
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      validateForm();

      // Create FormData to handle file uploads
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'documents') {
          formDataToSend.append(key, value);
        }
      });

      // Append documents if they exist
      Object.entries(formData.documents).forEach(([key, file]) => {
        if (file) {
          formDataToSend.append(`documents.${key}`, file);
        }
      });

      const response = await axios.post('http://localhost:5001/api/companies', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setToastMessage('Company added successfully!');
      setToastType('success');
      setShowToast(true);

      // Reset form
      setFormData({
        company_name: '',
        phoneno: '',
        email: '',
        address: '',
        city: '',
        pincode: '',
        pan: '',
        gst: '',
        company_type: 'OEM',
        documents: {}
      });

      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
      fileInputs.forEach((input) => {
        input.value = '';
      });

    } catch (err) {
      let errorMessage = 'Failed to add company';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data.message || 'Server error occurred';
      }
      
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Add New Company (OEM)</h2>
      
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name *</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
              <input
                type="tel"
                name="phoneno"
                value={formData.phoneno}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Address Information</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{6}"
                  title="Please enter a valid 6-digit pincode"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Legal Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Legal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">PAN Number *</label>
              <input
                type="text"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                required
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                title="Please enter a valid PAN number (e.g., ABCDE1234F)"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">GST Number *</label>
              <input
                type="text"
                name="gst"
                value={formData.gst}
                onChange={handleChange}
                required
                pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
                title="Please enter a valid GST number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Document Upload */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Document Upload</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">GST Certificate</label>
              <input
                type="file"
                name="gst_certificate"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">PAN Card</label>
              <input
                type="file"
                name="pan_card"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Registration Certificate</label>
              <input
                type="file"
                name="registration_certificate"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => {
              setFormData({
                company_name: '',
                phoneno: '',
                email: '',
                address: '',
                city: '',
                pincode: '',
                pan: '',
                gst: '',
                company_type: 'OEM',
                documents: {}
              });
              // Reset file inputs
              const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
              fileInputs.forEach((input) => {
                input.value = '';
              });
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Company'}
          </button>
        </div>
      </form>
    </div>
  );
}; 