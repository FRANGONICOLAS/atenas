import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/common/ScrollToTop";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  // Auth Pages
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
  AuthCallback,
  CompleteProfile,
  // Public Pages
  HomePage,
  AboutPage,
  WhatWeDo,
  ProjectsPage,
  GalleryPage,
  LocationsPage,
  // Beneficiary Pages
  CategoriesPage,
  PlayersPage,
  TestimonialsPage,
  // Dashboard Pages
  AdminDashboard,
  DonatorDashboard,
  ProfilePage,
  // Director Pages
  DirectorDashboard,
  DirectorHeadquarter,
  DirectorProjects,
  DirectorBeneficiary,
  // Common Pages
  DonationPage,
  NotFound,
} from "@/pages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/quienes-somos" element={<AboutPage />} />
                <Route path="/que-hacemos" element={<WhatWeDo />} />
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
                    <ProtectedRoute
                      allowedRoles={["director_sede", "director", "admin"]}
                    >
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
