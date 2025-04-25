export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  summary: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  current: boolean;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
  current: boolean;
}

export interface Skill {
  name: string;
  level: number; // 1-5
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate: string;
  current: boolean;
}

export interface Resume {
  personalInfo: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
} 