export type PropertyType = "APARTMENT" | "HOUSE" | "STUDIO";
export type PropertyStatus = "APPROVED" | "PENDING" | "REJECTED";
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ViewingStatus = "REQUESTED" | "CONFIRMED" | "DECLINED" | "COMPLETED";

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
}
