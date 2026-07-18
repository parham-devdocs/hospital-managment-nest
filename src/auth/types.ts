

export enum UserRole{
    admin="Admin",
    patient="Patient",
    doctor="Doctor"
}
// types/auth-response.interface.ts
export interface RegisterServiceResponse {
    user: {
      id: string;
      email: string;
    };
    accessToken: string;
  }

  export interface LoginServiceResponse{
    user: {
      id: string;
      email: string;
    };
    accessToken: string;
  }