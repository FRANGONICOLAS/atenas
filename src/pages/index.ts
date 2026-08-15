import { lazy } from 'react';

// Auth Pages
export const LoginPage = lazy(() => import('./Auth/LoginPage'));
export const RegisterPage = lazy(() => import('./Auth/RegisterPage'));
export const ResetPasswordPage = lazy(() => import('./Auth/ResetPasswordPage'));
export const AuthCallback = lazy(() => import('./Auth/AuthCallback'));
export const CompleteProfile = lazy(() => import('./Auth/CompleteProfile'));

// Public Pages (HomePage se mantiene eager para el primer render)
export { default as HomePage } from './Public/pages/HomePage';
export const AboutPage = lazy(() => import('./Public/pages/AboutPage'));
export const WhatWeDo = lazy(() => import('./Public/pages/WhatWeDo'));
export const ProjectsPage = lazy(() => import('./Public/pages/ProjectsPage'));
export const GalleryPage = lazy(() => import('./Public/pages/GalleryPage'));
export const LocationsPage = lazy(() => import('./Public/pages/LocationsPage'));
export const VakiPage = lazy(() => import('./Public/pages/VakiPage'));

// Beneficiary Pages
export const CategoriesPage = lazy(() => import('./Public/pages/CategoriesPage'));
export const PlayersPage = lazy(() => import('./Public/pages/PlayersPage'));
export const TestimonialsPage = lazy(() => import('./Public/pages/TestimonialsPage'));

// Dashboard Pages
export const AdminView = lazy(() => import('./AdminView/AdminView'));
export const DirectorView = lazy(() => import('./DirectorView/DirectorView'));
export const DirectorSedeView = lazy(() => import('./DirectorSedeView/DirectorSedeView'));
export const EvaluationDetailPage = lazy(() => import('./DirectorSedeView/pages/EvaluationDetailPage'));
export const DonatorView = lazy(() => import('./DonatorView/DonatorView'));

// Common Pages
export const DonationPage = lazy(() => import('./Common/DonationPage'));
export const DonationResultPage = lazy(() => import('./Common/DonationResultPage'));
export const ProfilePage = lazy(() => import('./Common/ProfilePage'));
export const NotFound = lazy(() => import('./Common/NotFound'));
