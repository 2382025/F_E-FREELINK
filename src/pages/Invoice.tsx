import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../utils/AuthProvider";
import axios from "../utils/AxiosInstance";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Tipe data untuk Invoice
type InvoiceType = {
  id: number;
  amount: number;
  payment_status: string;
  issue_date: string;
  project_id: number;
  client_id: number;
  created_at: string;
  updated_at: string;
  project: {
    id: number;
    project_name: string;
  } | null;
  client: {
    client_name: string;
  } | null;
};

// Fungsi untuk mengambil daftar invoice dari backend
const fetchInvoiceList = async (token: string | null) => {
  return await axios.get<InvoiceType[]>("/api/invoice", {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Format tanggal menjadi format yang lebih mudah dibaca
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

// Komponen untuk menampilkan informasi invoice
const InvoiceCard = ({ invoice }: { invoice: InvoiceType }) => {
  console.log("Rendering card for invoice:", invoice.id, "Client:", invoice.client?.client_name);
  
  const navigate = useNavigate();

  const handleViewInvoice = () => {
    navigate(`/invoice/${invoice.id}`);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4 hover:shadow-lg transition-shadow duration-200 flex items-start">
      <div className="flex-grow ml-4">
        <h2 className="text-lg font-semibold mb-1">
          {invoice.project ? invoice.project.project_name : "Unnamed Project"}
        </h2>
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Client:</span> {invoice.client?.client_name || "No Client"}
        </p>
        <p className="text-sm text-gray-600 mb-2">
        <span className="font-medium">Amount:</span> ${invoice.amount}
      
        </p>
        <p className="text-sm text-gray-600 mb-2">
         <span className="font-medium">Status:</span> {(invoice.payment_status)}
        </p>
        <p className="text-sm text-gray-600">
        <span className="font-medium">Issue Date:</span> {formatDate(invoice.issue_date)}
        </p>
      </div>
      <button
        onClick={handleViewInvoice}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm ml-auto mt-2"
      >
        View
      </button>
    </div>
  );
};

// Komponen utama untuk menampilkan daftar invoice
const InvoicePage = () => {
  const { getToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoiceList"],
    queryFn: async () => {
      const response = await fetchInvoiceList(getToken());
      console.log("API Response:", response);
      return response;
    }
  });

  if (isLoading) {
    return <div className="p-4 text-center">Loading invoices...</div>;
  }

  if (isError) {
    return <div className="p-4 text-center text-red-500">Failed to load invoice data!</div>;
  }

  const invoices = data?.data || [];
  console.log("Invoices to display:", invoices);

  // Filter invoices berdasarkan search term
  const filteredInvoices = invoices.filter(invoice =>
    (invoice.project?.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (invoice.client?.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    invoice.payment_status.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log("Invoice data:", invoices);

  const handleAddInvoice = () => {
    navigate("/add-invoice"); // Navigasi ke halaman Add Invoice
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={handleAddInvoice}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add
        </button>

        <div className="relative">
          <input
            type="text"
            placeholder="Search Invoice"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414l1.293-1.293 1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586l-1.293-1.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {filteredInvoices.map((invoice) => (
        <InvoiceCard key={invoice.id} invoice={invoice} />
      ))}
    </div>
  );
};

export default InvoicePage;
