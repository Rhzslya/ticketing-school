import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MainLayout from "./layout/MainLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { AdminRoute, GuestRoute, ProtectedRoute } from "./layout/AuthGuard";
import CreateTicketPage from "./pages/CreateTicketPage";
import { MyTicketPage } from "./pages/MyTicketPage";
import DetailedTicketPage from "./pages/DetailedTicketPage";
import { Toaster } from "sonner";
import UpdateTicketPage from "./pages/UpdateTicketPage";
import SidebarLayout from "./layout/SidebarLayout";
import { DashboardPage } from "./pages/DashboardPage";
import DashboardTicketPage from "./pages/DashboardTicketPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import TrackTicketPage from "./pages/TrackTicketPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />

          <Route
            path="*"
            element={
              <NotFoundPage
                variant="minimal"
                entityName="Page"
                isDashboard={false}
              />
            }
          />
        </Route>

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/tickets/create" element={<CreateTicketPage />} />
          <Route path="/tickets/:id/edit" element={<UpdateTicketPage />} />
          <Route path="/tickets/my-tickets" element={<MyTicketPage />} />
          <Route path="/tickets/:id" element={<DetailedTicketPage />} />
          <Route path="/tickets/track/:id" element={<TrackTicketPage />} />

          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route
            element={
              <SidebarLayout>
                <Outlet />
              </SidebarLayout>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/dashboard/tickets"
              element={<DashboardTicketPage />}
            />
          </Route>

          <Route
            path="*"
            element={
              <NotFoundPage
                variant="minimal"
                entityName="Page"
                isDashboard={true}
              />
            }
          />
        </Route>

        <Route
          path="*"
          element={
            <NotFoundPage
              variant="minimal"
              entityName="Page"
              isDashboard={false}
            />
          }
        />
      </Routes>
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}

export default App;
