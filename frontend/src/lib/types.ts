export type SpotType = "TRUCK" | "TRAILER" | "FLEET_VEHICLE";

export type BookingStatus = "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "EXPIRED";

export type MechanicRequestStatus = "PENDING" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";

export interface SpotDto {
  id: number;
  spotNumber: string;
  spotType: SpotType;
  monthlyRateCents: number;
  dailyRateCents: number;
  active: boolean;
}

export interface CreateBookingRequest {
  spotId: number;
  startDate: string;
  endDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  vehicleInfo?: string;
}

export interface CreateBookingResponse {
  bookingId: number;
  clientSecret: string;
  amountCents: number;
  status: BookingStatus;
}

export interface BookingDto {
  id: number;
  spotNumber: string;
  spotType: string;
  startDate: string;
  endDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  vehicleInfo?: string;
  amountCents: number;
  status: BookingStatus;
  createdAt: string;
}

export interface MechanicRequestCreateRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleInfo: string;
  issueDescription: string;
  preferredDate?: string;
}

export interface MechanicRequestDto {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleInfo: string;
  issueDescription: string;
  preferredDate?: string;
  status: MechanicRequestStatus;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface DashboardSummary {
  totalSpots: number;
  occupiedSpots: number;
  availableSpots: number;
  confirmedBookings: number;
  pendingPaymentBookings: number;
  pendingMechanicRequests: number;
}

export interface ApiErrorBody {
  timestamp: string;
  status: number;
  error: string;
  message: string;
}

export interface CustomerSignupRequest {
  email: string;
  password: string;
}

export interface CustomerLoginRequest {
  email: string;
  password: string;
}

export interface CustomerAuthResponse {
  token: string;
  email: string;
  expiresInSeconds: number;
}
