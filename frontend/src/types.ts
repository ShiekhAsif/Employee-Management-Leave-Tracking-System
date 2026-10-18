export type Role = 'ADMIN' | 'EMPLOYEE';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
}

export interface LoginResponse extends User {
  token: string;
}

export interface Employee {
  id: number;
  fullName: string;
  email: string;
  department: string;
  designation: string;
  salary: number;
  joiningDate: string;
  role: Role;
}

export interface LeaveApplication {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
}
