

export enum UserRole{
    admin="Admin",
    patient="Patient",
    doctor="Doctor"
}
// types/auth-response.interface.ts
export interface AuthServiceResponse {
    user: {
      id: string;
      email: string;
    };
    accessToken: string;
  }