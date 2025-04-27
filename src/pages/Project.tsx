import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../utils/AuthProvider";
import axios from "../utils/AxiosInstance";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type ProjectType = {
  id: number;
  project_name: string;
  due_date: string;
  project_status: string;
  client: {
    client_name: string;
  } | null;
};

const fetchProjectList = async (token: string | null) => {
  return await axios.get<ProjectType[]>("/api/project", {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Komponen untuk menampilkan ikon project berdasarkan nama project
const ProjectIcon = ({ name }: { name: string }) => {
  // Pilih ikon berdasarkan kata kunci dalam nama project
  const getProjectIcon = () => {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes("website") || nameLower.includes("web")) {
      return (
        <div className="w-16 h-16 bg-blue-100 rounded-md flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else if (nameLower.includes("logo") || nameLower.includes("design")) {
      return (
        <div className="w-16 h-16 bg-amber-100 rounded-md flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
          </svg>
        </div>
      );
    } else if (nameLower.includes("ui") || nameLower.includes("ux") || nameLower.includes("commerce")) {
      return (
        <div className="w-16 h-16 bg-purple-100 rounded-md flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z" clipRule="evenodd" />
            <path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z" />
          </svg>
        </div>
      );
    }
  };

  return getProjectIcon();
};

// Komponen untuk status badge dengan warna berbeda berdasarkan status
const StatusBadge = ({ status }: { status: string }) => {
  let bgColor = "bg-gray-200";
  let textColor = "text-gray-800";
  let icon = null;

  const statusLower = status.toLowerCase();
  
  if (statusLower === "done" || statusLower === "completed") {
    bgColor = "bg-green-100";
    textColor = "text-green-800";
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    );
  } else if (statusLower === "in progress" || statusLower === "ongoing") {
    bgColor = "bg-blue-100";
    textColor = "text-blue-800";
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    );
  } else if (statusLower === "pending" || statusLower === "late") {
    bgColor = "bg-red-100";
    textColor = "text-red-800";
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    );
  } else if (statusLower === "pending") {
    bgColor = "bg-yellow-100";
    textColor = "text-yellow-800";
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    );
  }

  return (
    <div className={`flex items-center ${bgColor} ${textColor} px-3 py-1 rounded-full text-sm`}>
      {icon}
      {status}
    </div>
  );
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

const ProjectCard = ({ project }: { project: ProjectType }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4 hover:shadow-lg transition-shadow duration-200 flex items-start">
      <ProjectIcon name={project.project_name} />
      
      <div className="flex-grow ml-4">
        <h2 className="text-lg font-semibold mb-1">{project.project_name || "Unnamed Project"}</h2>
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Client:</span> {project.client ? project.client.client_name : "No client assigned"}
        </p>
        <p className="text-sm text-gray-600 mb-3">
          <span className="font-medium">Due Date:</span> {formatDate(project.due_date)}
        </p>
        <StatusBadge status={project.project_status || "Unknown"} />
      </div>
      
      <button 
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm"
        onClick={() => navigate(`/project/${project.id}`)}
      >
        View
      </button>
    </div>
  );
};

const Project = () => {
  const { getToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ["projectList"],
    queryFn: () => fetchProjectList(getToken())
  });

  if (isLoading) {
    return <div className="p-4 text-center">Loading projects...</div>;
  }

  if (isError) {
    return <div className="p-4 text-center text-red-500">Failed to load projects!</div>;
  }

  const projects = data?.data || [];
  
  // Filter projects berdasarkan search term
  const filteredProjects = projects.filter(project => 
    project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.client?.client_name && project.client.client_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddProject = () => {
    navigate("/add-project");  // Navigasi ke halaman Add project
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={handleAddProject}  // Menambahkan event handler untuk navigasi
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
            placeholder="Search Project"
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
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        
        {filteredProjects.length === 0 && (
          <div className="text-center p-8 text-gray-500">
            {searchTerm ? "No projects match your search" : "No projects found"}
          </div>
        )}
      </div>
    </div>
  );
};

export default Project;