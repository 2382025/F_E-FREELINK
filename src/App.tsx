import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from "react-router-dom";
import BaseLayout from "./layouts/BaseLayout";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Note from "./pages/Note";
import AddNote from "./pages/AddNote";
import NoteDetail from "./pages/NoteDetail";
import EditNote from "./pages/EditNote";
import Project from "./pages/Project";
import ProjectDetail from "./pages/ProjectDetail";
import EditProject from "./pages/EditProject";
import AddProject from "./pages/AddProject";
import Client from "./pages/Client";
import ClientDetail from "./pages/ClientDetail";
import EditClient from "./pages/EditClient";
import AddClient from "./pages/AddClient";
import Invoice from "./pages/Invoice";
import InvoiceDetail from "./pages/InvoiceDetail";
import EditInvoice from "./pages/EditInvoice";
import AddInvoice from "./pages/AddInvoice";
import PrivateRoute from "./utils/PrivateRoute";
import PublicRoute from "./utils/PublicRoute";
import { AuthProvider } from "./utils/AuthProvider";

const queryClient = new QueryClient();

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path="/" element={<BaseLayout />}>
          <Route
            path="login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
        </Route>
        <Route path="/" element={<RootLayout />}>
          <Route
            index
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="notes"
            element={
              <PrivateRoute>
                <Note />
              </PrivateRoute>
            }
          />
          <Route
            path="add-note"
            element={
              <PrivateRoute>
                <AddNote />
              </PrivateRoute>
            }
          />
          <Route
            path="note/:id"
            element={
              <PrivateRoute>
                <NoteDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="edit-note/:id"
            element={
              <PrivateRoute>
                <EditNote />
              </PrivateRoute>
            }
          />
          <Route
            path="projects"
            element={
              <PrivateRoute>
                <Project />
              </PrivateRoute>
            }
          />
          <Route
            path="project/:id"
            element={
              <PrivateRoute>
                <ProjectDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="edit-project/:id"
            element={
              <PrivateRoute>
                <EditProject />
              </PrivateRoute>
            }
          />
          <Route
            path="add-project"
            element={
              <PrivateRoute>
                <AddProject />
              </PrivateRoute>
            }
          />
          <Route
            path="clients"
            element={
              <PrivateRoute>
                <Client />
              </PrivateRoute>
            }
          />
          <Route
            path="client/:id"
            element={
              <PrivateRoute>
                <ClientDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="edit-client/:id"
            element={
              <PrivateRoute>
                <EditClient />
              </PrivateRoute>
            }
          />
          <Route
            path="add-client"
            element={
              <PrivateRoute>
                <AddClient />
              </PrivateRoute>
            }
          />
          <Route
            path="invoices"
            element={
              <PrivateRoute>
                <Invoice />
              </PrivateRoute>
            }
          />
          <Route
            path="invoice/:id"
            element={
              <PrivateRoute>
                <InvoiceDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="edit-invoice/:id"
            element={
              <PrivateRoute>
                <EditInvoice />
              </PrivateRoute>
            }
          />
          <Route
            path="add-invoice"
            element={
              <PrivateRoute>
                <AddInvoice />
              </PrivateRoute>
            }
          />
        </Route>
      </Route>
    )
  );

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
