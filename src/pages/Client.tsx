import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../utils/AuthProvider";
import axios from "../utils/AxiosInstance";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

// Tipe data untuk Client
type ClientType = {
  id: number;
  client_name: string;
  email: string | null;
  phone_no: string | null;
  company: string | null;
};

// Fungsi untuk mengambil daftar client
const fetchClientList = async (token: string | null) => {
  return await axios.get<ClientType[]>("/api/client", {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Komponen untuk menampilkan informasi client
const ClientCard = ({ client }: { client: ClientType }) => {
  const navigate = useNavigate(); // Inisialisasi useNavigate untuk navigasi

  const handleViewClient = () => {
    navigate(`/client/${client.id}`);  // Navigasi ke halaman View Client
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4 hover:shadow-lg transition-shadow duration-200 flex items-start">
      <div className="flex-grow ml-4">
        <h2 className="text-lg font-semibold mb-1">{client.client_name || "Unnamed Client"}</h2>
        <p className="text-sm text-gray-600 mb-2">Email: {client.email || "Not provided"}</p>
        <p className="text-sm text-gray-600 mb-2">Phone: {client.phone_no || "Not provided"}</p>
        <p className="text-sm text-gray-600 mb-2">Company: {client.company || "Not specified"}</p>
      </div>
      <button
        onClick={handleViewClient}  // Navigasi ke halaman View Client
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm ml-auto mt-2"
      >
        View
      </button>
    </div>
  );
};

// Komponen utama untuk menampilkan daftar client
const Client = () => {
  const { getToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate(); // Inisialisasi useNavigate untuk navigasi

  const { data, isLoading, isError } = useQuery({
    queryKey: ["clientList"],
    queryFn: () => fetchClientList(getToken())
  });

  if (isLoading) {
    return <div className="p-4 text-center">Loading clients...</div>;
  }

  if (isError) {
    return <div className="p-4 text-center text-red-500">Failed to load client data!</div>;
  }

  const clients = data?.data || [];

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone_no && client.phone_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddClient = () => {
    navigate("/add-client");  // Navigasi ke halaman Add Client
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={handleAddClient}  // Menambahkan event handler untuk navigasi
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
            placeholder="Search Client"
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

      {filteredClients.map((client) => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  );
};

export default Client;
