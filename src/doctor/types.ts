export interface EducationEntry {
    id?: string;
    medicalSchool: string;
    graduationYear: number;
    country: string;
    degree: string;
    honors?: string[];
  }
  
  export interface WorkExperience {
    id?: string;
    hospital: string;
    position: string;
    specialty: string;
    startDate: Date;
    endDate?: Date;
    isCurrent: boolean;
    location: string;
    responsibilities?: string[];
  }
  
  export interface Certification {
    id?: string;
    name: string;
    issuingOrganization: string;
    dateObtained: Date;
    expiryDate?: Date;
    certificationNumber?: string;
  }

  export interface Specialty{
    id?:string
    name:string
  }