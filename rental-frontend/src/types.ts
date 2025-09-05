export type Role = "TENANT" | "OWNER";

export interface RegisterForm {
  email: string;
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  phone?: string;
  role: Role;
}

export type AdminUser = {
  id: number;
  email: string;
  roles?: string[];
  isActive?: boolean;
  isVerified?: boolean;
  firstname?: string;
  lastname?: string;
};

export type BoolFilter = "" | "true" | "false";

export const RoleOptions = [
  { value: "", label: "Ρόλος: Όλοι" },
  { value: "OWNER", label: "Ιδιοκτήτης" },   // <-- αν backend = LANDLORD, άλλαξέ το
  { value: "TENANT", label: "Ενοικιαστής" },
] as const;

export const RoleLabel: Record<string, string> = {
  OWNER: "Ιδιοκτήτης", // <-- αν backend = LANDLORD, άλλαξέ το
  TENANT: "Ενοικιαστής",
  ADMIN: "Διαχειριστής",
};

export type PropertyType = "APARTMENT" | "HOUSE" | "STUDIO";
export type PropertyStatus = "APPROVED" | "PENDING" | "REJECTED";
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ViewingStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "DECLINED"
  | "COMPLETED";

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  APARTMENT: "Διαμέρισμα",
  HOUSE: "Μονοκατοικία",
  STUDIO: "Γκαρσονιέρα",
};

export function getPropertyTypeLabel(t?: PropertyType | null): string {
  return t ? PROPERTY_TYPE_LABEL[t] ?? String(t) : "-";
}

export interface Property {
  id: number;
  title: string;
  description: string;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  price: number;
  type: PropertyType;
  status: PropertyStatus;
  ownerId: number;
}

export interface PagedResponse<T> {
  data: T[];
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  currentPage: number;
  pageSize: number;
}

export type PropertyCreateForm = {
  title: string;
  description: string;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  price: number;
  type: PropertyType;
};
