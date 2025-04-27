import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../utils/AuthProvider";
import axios from "../utils/AxiosInstance";
import { useState } from "react";
import { useNavigate } from "react-router-dom";  

// Tambahkan id di NoteType
type NoteType = {
  id: number;
  title: string;
  content: string;
};

const fetchNoteList = async (token: string | null) => {
  return await axios.get<NoteType[]>("/api/note", {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Tambahkan props onViewClick untuk tombol View
const NoteCard = ({ id, title, content, onViewClick }: NoteType & { onViewClick: (id: number) => void }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4 hover:shadow-lg transition-shadow duration-200 flex items-start">
      <div className="flex-grow ml-4">
        <h2 className="text-lg font-semibold mb-1">{title || "Untitled Note"}</h2>
        <p className="text-sm text-gray-600 mb-2">{content || "No content available."}</p>
      </div>
      <button
        onClick={() => onViewClick(id)}  // Panggil function saat klik
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm"
      >
        View
      </button>
    </div>
  );
};

const Note = () => {
  const { getToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["noteList"],
    queryFn: () => fetchNoteList(getToken())
  });

  if (isLoading) {
    return <div className="p-4 text-center">Loading notes...</div>;
  }

  if (isError) {
    return <div className="p-4 text-center text-red-500">Failed to load notes!</div>;
  }

  const notes = data?.data || [];

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNote = () => {
    navigate("/add-note");
  };

  // Fungsi handleViewNote diarahkan ke note detail
  const handleViewNote = (id: number) => {
    navigate(`/note/${id}`); // Sesuaikan dengan route yang ada di App.tsx
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={handleAddNote}
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
            placeholder="Search Note"
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

      {filteredNotes.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No notes found. {searchTerm ? "Try a different search term." : "Create a new note to get started!"}
        </div>
      ) : (
        filteredNotes.map((note) => (
          <NoteCard
            key={note.id}
            id={note.id}
            title={note.title}
            content={note.content}
            onViewClick={handleViewNote}  // Kirim handleViewNote ke NoteCard
          />
        ))
      )}
    </div>
  );
};

export default Note;