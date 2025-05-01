import { UseMutateFunction } from "@tanstack/react-query";
import { useState } from "react";

interface ClientFormData {
  client_name: string;
  email: string;
  phone_no: string;
  company: string;
}

interface ClientFormProps {
  onSubmit: UseMutateFunction<any, Error, ClientFormData, unknown>;
  initialData?: ClientFormData;
  showDeleteButton?: boolean;
  onDelete?: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, initialData, showDeleteButton, onDelete }) => {
  const [formData, setFormData] = useState<ClientFormData>({
    client_name: initialData?.client_name || "",
    email: initialData?.email || "",
    phone_no: initialData?.phone_no || "",
    company: initialData?.company || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="relative">
      <h2 className="text-2xl font-bold mb-6 mt-10">
        {initialData ? "Edit Client" : "Add Client"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Client Name</label>
          <input
            type="text"
            name="client_name"
            value={formData.client_name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="text"
            name="phone_no"
            value={formData.phone_no}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Company</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {initialData ? "Update Client" : "Add Client"}
          </button>
          {showDeleteButton && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-1" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
//change
export default ClientForm;
