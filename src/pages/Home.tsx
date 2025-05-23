import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../utils/AuthProvider";
import axios from "../utils/AxiosInstance";

interface Project {
  id: number;
  project_name: string;
  project_status: string;
  client_id: number;
  due_date: string;
  created_at: Date;
  updated_at: Date;
}

interface Invoice {
  id: number;
  project_id: number;
  client_id: number;
  amount: number;
  payment_status: string;
  payment_method: string;
  issue_date: string;
  created_at: Date;
  updated_at: Date;
}

interface Client {
  id: number;
  client_name: string;
  email: string;
  phone: string;
  created_at: Date;
  updated_at: Date;
}

const fetchDashboardData = async (token: string | null) => {
  const [projectsRes, invoicesRes, clientsRes] = await Promise.all([
    axios.get<Project[]>("/api/project", {
      headers: { Authorization: `Bearer ${token}` }
    }),
    axios.get<Invoice[]>("/api/invoice", {
      headers: { Authorization: `Bearer ${token}` }
    }),
    axios.get<Client[]>("/api/client", {
      headers: { Authorization: `Bearer ${token}` }
    })
  ]);

  return {
    projects: projectsRes.data,
    invoices: invoicesRes.data,
    clients: clientsRes.data
  };
};

const Home = () => {
  const { getToken } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: () => fetchDashboardData(getToken()),
    retry: false
  });

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-blue-600 text-xl mb-2">Loading...</div>
          <div className="text-gray-500">Please wait while we fetch your data</div>
        </div>
      </div>
    );
  }

  if (isError) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch data";
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{errorMessage}</span>
          <p className="mt-2 text-sm">
            Please check:
            <ul className="list-disc list-inside ml-4">
              <li>Backend server is running</li>
              <li>You are logged in with valid credentials</li>
              <li>Your authentication token is valid</li>
            </ul>
          </p>
        </div>
      </div>
    );
  }

  const { projects = [], invoices = [], clients = [] } = data || {};

  // Calculate project statistics
  const projectStats = {
    done: projects.filter(p => 
      p?.project_status?.toUpperCase().includes('DONE') ||
      p?.project_status?.toUpperCase() === 'COMPLETED'
    ).length,
    inProgress: projects.filter(p => 
      p?.project_status?.toUpperCase().includes('PROGRESS') ||
      p?.project_status?.toUpperCase() === 'IN PROGRESS' ||
      p?.project_status?.toUpperCase() === 'INPROGRESS' ||
      p?.project_status?.toUpperCase() === 'ON PROGRESS'
    ).length,
    pending: projects.filter(p => 
      p?.project_status?.toUpperCase().includes('PENDING') ||
      p?.project_status?.toUpperCase() === 'WAITING'
    ).length
  };

  // Calculate invoice statistics
  const invoiceStats = {
    paid: invoices.filter(i => i?.payment_status?.toUpperCase() === 'PAID').length,
    unpaid: invoices.filter(i => i?.payment_status?.toUpperCase() === 'UNPAID').length,
    overdue: invoices.filter(i => i?.payment_status?.toUpperCase() === 'OVERDUE').length
  };

  // Calculate total income
  const totalIncome = invoices
    .filter(i => i?.payment_status?.toUpperCase() === 'PAID')
    .reduce((sum, invoice) => sum + (Number(invoice?.amount) || 0), 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Welcome Back!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Stats Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Your Projects</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Done</span>
              </div>
              <span>{projectStats.done}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>In Progress</span>
              </div>
              <span>{projectStats.inProgress}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Pending</span>
              </div>
              <span>{projectStats.pending}</span>
            </div>
          </div>
        </div>

        {/* Total Client Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Total Client</h2>
          <div className="flex items-center gap-4">
            <div className="text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-4xl font-bold">{clients.length}</span>
          </div>
        </div>

        {/* Invoice Stats Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Invoice</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Paid</span>
              </div>
              <span>{invoiceStats.paid}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Unpaid</span>
              </div>
              <span>{invoiceStats.unpaid}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Overdue</span>
              </div>
              <span>{invoiceStats.overdue}</span>
            </div>
          </div>
        </div>

        {/* Income Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Income</h2>
          <div className="flex items-center gap-4">
            <div className="text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-4xl font-bold">${totalIncome.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
