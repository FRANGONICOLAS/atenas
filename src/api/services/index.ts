export { authService } from "./auth.service";
export { userService } from "./user.service";
export { storageService } from "./storage.service";
export { galleryService } from "./gallery.service";
export { headquarterService } from "./headquarter.service";
export { beneficiaryService } from "./beneficiary.service";
export { projectService } from "./project.service";
export { donationService } from "./donation.service";

// Re-exportar tipos de donation para facilitar el acceso
export type { DonationFromDB, DonationWithProject, DonationStats } from '@/types/donation.types';
