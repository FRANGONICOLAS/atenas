import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import QueHacemosPage from "./pages/WhatWeDo";
import CategoriesPage from "./pages/CategoriesPage";
import PlayersPage from "./pages/PlayersPage";
import ProjectsPage from "./pages/ProjectsPage";
import GalleryPage from "./pages/GalleryPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import DonationPage from "./pages/DonationPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AuthCallback from "./pages/AuthCallback";
import CompleteProfile from "./pages/CompleteProfile";
import LocationsPage from "./pages/LocationsPage";
import AdminDashboard from "./pages/AdminDashboard";
import DirectorDashboard from "./pages/DirectorPages/DirectorDashboard";
import DirectorHeadquarter from "./pages/DirectorPages/DirectorHeadquarter";
import DirectorProjects from "./pages/DirectorPages/DirectorProjects";
import DirectorBeneficiary from "./pages/DirectorPages/DirectorBeneficiary";
import DonatorDashboard from "./pages/DonatorDashboard";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/quienes-somos" element={<AboutPage />} />
                <Route path="/que-hacemos" element={<QueHacemosPage />} />
                <Route path="/categorias" element={<CategoriesPage />} />
                <Route path="/jugadores" element={<PlayersPage />} />
                <Route path="/proyectos" element={<ProjectsPage />} />
                <Route path="/galeria" element={<GalleryPage />} />
                <Route path="/testimonios" element={<TestimonialsPage />} />
                <Route path="/donar" element={<DonationPage />} />
                <Route path="/sedes" element={<LocationsPage />} />

                {/* Rutas de autenticación */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registro" element={<RegisterPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />

                {/* Rutas protegidas por rol */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/director"
                  element={
                    <ProtectedRoute allowedRoles={["director", "admin"]}>
                      <DirectorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/director-sede"
                  element={
                    <ProtectedRoute allowedRoles={["director_sede", "director", "admin"]}>
                      <DirectorHeadquarter />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/director-proyectos"
                  element={
                    <ProtectedRoute allowedRoles={["director", "admin"]}>
                      <DirectorProjects />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/director-beneficiarios"
                  element={
                    <ProtectedRoute allowedRoles={["director", "admin"]}>
                      <DirectorBeneficiary />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/donator"
                  element={
                    <ProtectedRoute allowedRoles={["donator"]}>
                      <DonatorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
