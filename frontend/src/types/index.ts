export type ApplicationStatus = 'submitted' | 'under_review' | 'approved' | 'rejected'
export type UserStatus = 'active' | 'suspended' | 'deactivated'
export type AccountType = 'checking' | 'savings' | 'investment' | 'business'

export interface PersonalInfo {
  firstName: string
  middleName?: string
  lastName: string
  dateOfBirth: string
  gender: string
  maritalStatus: string
}

export interface ContactInfo {
  email: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface NextOfKin {
  fullName: string
  relationship: string
  phone: string
  email: string
  address: string
}

export interface AccountDetails {
  accountType: string
  preferredBranch: string
  occupation: string
  employer: string
  monthlyIncome: string
}

export interface KYCData {
  ssn: string
  passportPhotoPath?: string
  passportPhotoName?: string
  meansOfIdPath?: string
  meansOfIdName?: string
  supportingDocPath?: string
  supportingDocName?: string
}

export interface ApplicationStepData {
  personal?: PersonalInfo
  contact?: ContactInfo
  nextOfKin?: NextOfKin
  accountDetails?: AccountDetails
  kyc?: KYCData
}

export interface Application {
  id: string
  status: ApplicationStatus
  step_data: ApplicationStepData
  created_at: string
  updated_at: string
  user_id?: string
  admin_notes?: AdminNote[]
}

export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string
  status: UserStatus
  application_id: string
  auth_user_id?: string
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  user_profile_id: string
  account_number: string
  account_type: AccountType
  balance: number
  status: string
  created_at: string
}

export interface Notification {
  id: string
  user_profile_id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export interface AdminNote {
  id: string
  application_id: string
  note: string
  created_at: string
}

export interface AuditLog {
  id: string
  action: string
  entity_type: string
  entity_id: string
  details: Record<string, unknown>
  created_at: string
}
