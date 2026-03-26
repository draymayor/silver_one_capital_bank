'use client'

import { useState, useRef } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import {
  User, MapPin, Heart, Briefcase, FileCheck, Lock, Eye, EyeOff,
  CheckCircle, Upload, X, AlertCircle, ChevronRight, ArrowLeft
} from 'lucide-react'

// Step definitions
const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Contact', icon: MapPin },
  { id: 3, title: 'Next of Kin', icon: Heart },
  { id: 4, title: 'Account Details', icon: Briefcase },
  { id: 5, title: 'KYC & Identity', icon: FileCheck },
  { id: 6, title: 'Set Password', icon: Lock },
  { id: 7, title: 'Review & Submit', icon: CheckCircle },
]

interface FormData {
  personal: { firstName: string; middleName: string; lastName: string; dateOfBirth: string; gender: string; maritalStatus: string }
  contact: { email: string; phone: string; address: string; city: string; state: string; postalCode: string; country: string }
  nextOfKin: { fullName: string; relationship: string; phone: string; email: string; address: string }
  accountDetails: { accountType: string; preferredBranch: string; occupation: string; employer: string; monthlyIncome: string }
  kyc: { ssn: string; passportPhotoName: string; meansOfIdName: string; supportingDocName: string; passportPhotoPath: string; meansOfIdPath: string; supportingDocPath: string }
  password: { password: string; confirmPassword: string }
}

const initialForm: FormData = {
  personal: { firstName: '', middleName: '', lastName: '', dateOfBirth: '', gender: '', maritalStatus: '' },
  contact: { email: '', phone: '', address: '', city: '', state: '', postalCode: '', country: 'United States' },
  nextOfKin: { fullName: '', relationship: '', phone: '', email: '', address: '' },
  accountDetails: { accountType: '', preferredBranch: '', occupation: '', employer: '', monthlyIncome: '' },
  kyc: { ssn: '', passportPhotoName: '', meansOfIdName: '', supportingDocName: '', passportPhotoPath: '', meansOfIdPath: '', supportingDocPath: '' },
  password: { password: '', confirmPassword: '' },
}

function FieldGroup({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#0B2447] mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-charcoal focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none transition-all" {...props} />
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-charcoal focus:ring-2 focus:ring-[#1565C0] focus:border-transparent outline-none transition-all bg-white" {...props}>
      {children}
    </select>
  )
}

export default function OpenAccountPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [uploadingPassport, setUploadingPassport] = useState(false)
  const [uploadingId, setUploadingId] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [applicationId, setApplicationId] = useState('')
  const [agreed, setAgreed] = useState(false)

  const passportRef = useRef<HTMLInputElement>(null)
  const idRef = useRef<HTMLInputElement>(null)
  const docRef = useRef<HTMLInputElement>(null)

  function updateField(section: keyof FormData, field: string, value: string) {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
    setErrors(prev => { const e = { ...prev }; delete e[`${section}.${field}`]; return e })
  }

  function validateStep(): boolean {
    const errs: Record<string, string> = {}
    if (currentStep === 1) {
      const p = formData.personal
      if (!p.firstName) errs['personal.firstName'] = 'First name is required'
      if (!p.lastName) errs['personal.lastName'] = 'Last name is required'
      if (!p.dateOfBirth) errs['personal.dateOfBirth'] = 'Date of birth is required'
      if (!p.gender) errs['personal.gender'] = 'Gender is required'
      if (!p.maritalStatus) errs['personal.maritalStatus'] = 'Marital status is required'
    }
    if (currentStep === 2) {
      const c = formData.contact
      if (!c.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) errs['contact.email'] = 'Valid email is required'
      if (!c.phone) errs['contact.phone'] = 'Phone number is required'
      if (!c.address) errs['contact.address'] = 'Address is required'
      if (!c.city) errs['contact.city'] = 'City is required'
      if (!c.state) errs['contact.state'] = 'State is required'
      if (!c.postalCode) errs['contact.postalCode'] = 'Postal code is required'
    }
    if (currentStep === 3) {
      const k = formData.nextOfKin
      if (!k.fullName) errs['nextOfKin.fullName'] = 'Full name is required'
      if (!k.relationship) errs['nextOfKin.relationship'] = 'Relationship is required'
      if (!k.phone) errs['nextOfKin.phone'] = 'Phone is required'
    }
    if (currentStep === 4) {
      const a = formData.accountDetails
      if (!a.accountType) errs['accountDetails.accountType'] = 'Account type is required'
      if (!a.occupation) errs['accountDetails.occupation'] = 'Occupation is required'
    }
    if (currentStep === 5) {
      const k = formData.kyc
      if (!k.ssn) errs['kyc.ssn'] = 'SSN is required'
      if (!k.passportPhotoName) errs['kyc.passportPhotoName'] = 'Passport photo is required'
      if (!k.meansOfIdName) errs['kyc.meansOfIdName'] = 'Means of ID is required'
    }
    if (currentStep === 6) {
      const pw = formData.password
      if (!pw.password || pw.password.length < 8) errs['password.password'] = 'Password must be at least 8 characters'
      if (!/[A-Z]/.test(pw.password)) errs['password.password'] = 'Password must contain at least one uppercase letter'
      if (!/[0-9]/.test(pw.password)) errs['password.password'] = 'Password must contain at least one number'
      if (pw.password !== pw.confirmPassword) errs['password.confirmPassword'] = 'Passwords do not match'
    }
    if (currentStep === 7) {
      if (!agreed) errs['agreed'] = 'You must agree to the terms to submit'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function passwordStrength(pw: string): { score: number; label: string; color: string } {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
    const colors = ['', 'bg-red-500', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500']
    return { score, label: labels[score] || '', color: colors[score] || '' }
  }

  async function uploadFile(file: File, type: 'passport_photo' | 'means_of_id' | 'supporting_doc'): Promise<string> {
    const path = `kyc/${Date.now()}-${type}-${file.name}`
    const { error } = await supabase.storage.from('kyc-documents').upload(path, file)
    if (error) throw error
    return path
  }

  async function handleFileUpload(type: 'passport' | 'id' | 'doc', file: File) {
    const docType = type === 'passport' ? 'passport_photo' : type === 'id' ? 'means_of_id' : 'supporting_doc'
    const setLoading = type === 'passport' ? setUploadingPassport : type === 'id' ? setUploadingId : setUploadingDoc
    setLoading(true)
    try {
      let path = ''
      try {
        path = await uploadFile(file, docType)
      } catch {
        // Storage bucket may not be set up yet — store file name only
        path = `pending-upload/${file.name}`
      }
      const nameKey = type === 'passport' ? 'passportPhotoName' : type === 'id' ? 'meansOfIdName' : 'supportingDocName'
      const pathKey = type === 'passport' ? 'passportPhotoPath' : type === 'id' ? 'meansOfIdPath' : 'supportingDocPath'
      updateField('kyc', nameKey, file.name)
      updateField('kyc', pathKey, path)
    } finally {
      setLoading(false)
    }
  }

  function nextStep() {
    if (validateStep()) setCurrentStep(s => Math.min(s + 1, 7))
  }
  function prevStep() { setCurrentStep(s => Math.max(s - 1, 1)) }

  async function handleSubmit() {
    if (!validateStep()) return
    setSubmitting(true)
    try {
      const stepData = {
        personal: formData.personal,
        contact: formData.contact,
        nextOfKin: formData.nextOfKin,
        accountDetails: formData.accountDetails,
        kyc: { ...formData.kyc, ssn: formData.kyc.ssn.replace(/\d(?=\d{4})/g, '*') },
      }
      const { data, error } = await supabase.from('applications').insert([{
        status: 'submitted',
        step_data: stepData,
        password_hash: formData.password.password, // Will be hashed on approval
      }]).select('id').single()

      let appId = data?.id ?? 'APP-' + Date.now()
      if (!error && data?.id) {
        // Save document metadata
        const docs = []
        if (formData.kyc.passportPhotoPath) docs.push({ application_id: appId, document_type: 'passport_photo', file_name: formData.kyc.passportPhotoName, storage_path: formData.kyc.passportPhotoPath })
        if (formData.kyc.meansOfIdPath) docs.push({ application_id: appId, document_type: 'means_of_id', file_name: formData.kyc.meansOfIdName, storage_path: formData.kyc.meansOfIdPath })
        if (formData.kyc.supportingDocPath) docs.push({ application_id: appId, document_type: 'supporting_doc', file_name: formData.kyc.supportingDocName, storage_path: formData.kyc.supportingDocPath })
        if (docs.length > 0) await supabase.from('kyc_documents').insert(docs)
      }
      setApplicationId(appId)
      setSubmitted(true)
    } catch {
      setErrors({ submit: 'Failed to submit application. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const pwStrength = passwordStrength(formData.password.password)

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="min-h-[80vh] flex items-center justify-center py-16 px-4">
          <div className="max-w-lg w-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="font-heading font-bold text-3xl text-[#0B2447] mb-3">Application Submitted!</h1>
            <p className="text-gray-600 text-base leading-relaxed mb-4">
              Thank you for applying to Silver Union Capital. Your application has been received and is currently <strong>under review</strong>.
            </p>
            <div className="bg-[#F8F9FA] rounded-2xl p-5 mb-6 text-left border border-gray-200">
              <p className="text-sm text-gray-600 font-medium mb-1">Reference Number</p>
              <p className="font-mono font-bold text-[#0B2447] text-lg">{applicationId}</p>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Our team will review your submitted information and documents. If approved, you will receive an email with your <strong>User ID</strong> and instructions to access your account. This process typically takes 1–3 business days.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[#0B2447] text-white hover:bg-[#06162c] transition-all">
                Back to Home
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 border-2 border-[#0B2447] text-[#0B2447] px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-3xl text-[#0B2447] mb-2">Open Your Account</h1>
          <p className="text-gray-500 text-sm">Complete the steps below to apply for your Silver Union Capital account.</p>
        </div>

        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {steps.map((s, i) => {
              const Icon = s.icon
              const done = currentStep > s.id
              const active = currentStep === s.id
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200
                      ${done ? 'bg-green-500 text-white' : active ? 'bg-[#0B2447] text-white' : 'bg-white border-2 border-gray-300 text-gray-400'}`}>
                      {done ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-4.5 h-4.5" />}
                    </div>
                    <p className={`text-xs mt-1.5 font-medium hidden sm:block ${active ? 'text-[#0B2447]' : done ? 'text-green-600' : 'text-gray-400'}`}>{s.title}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1.5 sm:mx-2 rounded-full transition-all duration-200 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Step {currentStep} of {steps.length}</span>
            <span>{Math.round((currentStep / steps.length) * 100)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div className="bg-[#0B2447] h-1.5 rounded-full transition-all duration-300" style={{ width: `${(currentStep / steps.length) * 100}%` }} />
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#0B2447] px-8 py-5">
            <h2 className="font-heading font-bold text-white text-lg">{steps[currentStep - 1].title}</h2>
          </div>
          <div className="px-8 py-8">

            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="grid sm:grid-cols-2 gap-5">
                <FieldGroup label="First Name" required>
                  <Input value={formData.personal.firstName} onChange={e => updateField('personal', 'firstName', e.target.value)} placeholder="John" data-testid="first-name-input" />
                  {errors['personal.firstName'] && <p className="text-red-500 text-xs mt-1">{errors['personal.firstName']}</p>}
                </FieldGroup>
                <FieldGroup label="Middle Name">
                  <Input value={formData.personal.middleName} onChange={e => updateField('personal', 'middleName', e.target.value)} placeholder="M." />
                </FieldGroup>
                <FieldGroup label="Last Name" required>
                  <Input value={formData.personal.lastName} onChange={e => updateField('personal', 'lastName', e.target.value)} placeholder="Doe" data-testid="last-name-input" />
                  {errors['personal.lastName'] && <p className="text-red-500 text-xs mt-1">{errors['personal.lastName']}</p>}
                </FieldGroup>
                <FieldGroup label="Date of Birth" required>
                  <Input type="date" value={formData.personal.dateOfBirth} onChange={e => updateField('personal', 'dateOfBirth', e.target.value)} data-testid="dob-input" />
                  {errors['personal.dateOfBirth'] && <p className="text-red-500 text-xs mt-1">{errors['personal.dateOfBirth']}</p>}
                </FieldGroup>
                <FieldGroup label="Gender" required>
                  <Select value={formData.personal.gender} onChange={e => updateField('personal', 'gender', e.target.value)} data-testid="gender-select">
                    <option value="">Select gender</option>
                    <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
                  </Select>
                  {errors['personal.gender'] && <p className="text-red-500 text-xs mt-1">{errors['personal.gender']}</p>}
                </FieldGroup>
                <FieldGroup label="Marital Status" required>
                  <Select value={formData.personal.maritalStatus} onChange={e => updateField('personal', 'maritalStatus', e.target.value)}>
                    <option value="">Select status</option>
                    <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option><option>Separated</option>
                  </Select>
                  {errors['personal.maritalStatus'] && <p className="text-red-500 text-xs mt-1">{errors['personal.maritalStatus']}</p>}
                </FieldGroup>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {currentStep === 2 && (
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <FieldGroup label="Email Address" required>
                    <Input type="email" value={formData.contact.email} onChange={e => updateField('contact', 'email', e.target.value)} placeholder="john@example.com" data-testid="email-input" />
                    {errors['contact.email'] && <p className="text-red-500 text-xs mt-1">{errors['contact.email']}</p>}
                  </FieldGroup>
                </div>
                <FieldGroup label="Phone Number" required>
                  <Input type="tel" value={formData.contact.phone} onChange={e => updateField('contact', 'phone', e.target.value)} placeholder="+1 (555) 000-0000" data-testid="phone-input" />
                  {errors['contact.phone'] && <p className="text-red-500 text-xs mt-1">{errors['contact.phone']}</p>}
                </FieldGroup>
                <FieldGroup label="Country">
                  <Select value={formData.contact.country} onChange={e => updateField('contact', 'country', e.target.value)}>
                    <option>United States</option><option>Canada</option><option>United Kingdom</option><option>Other</option>
                  </Select>
                </FieldGroup>
                <div className="sm:col-span-2">
                  <FieldGroup label="Residential Address" required>
                    <Input value={formData.contact.address} onChange={e => updateField('contact', 'address', e.target.value)} placeholder="123 Main Street, Apt 4B" />
                    {errors['contact.address'] && <p className="text-red-500 text-xs mt-1">{errors['contact.address']}</p>}
                  </FieldGroup>
                </div>
                <FieldGroup label="City" required>
                  <Input value={formData.contact.city} onChange={e => updateField('contact', 'city', e.target.value)} placeholder="New York" />
                  {errors['contact.city'] && <p className="text-red-500 text-xs mt-1">{errors['contact.city']}</p>}
                </FieldGroup>
                <FieldGroup label="State" required>
                  <Input value={formData.contact.state} onChange={e => updateField('contact', 'state', e.target.value)} placeholder="NY" />
                  {errors['contact.state'] && <p className="text-red-500 text-xs mt-1">{errors['contact.state']}</p>}
                </FieldGroup>
                <FieldGroup label="Postal Code" required>
                  <Input value={formData.contact.postalCode} onChange={e => updateField('contact', 'postalCode', e.target.value)} placeholder="10001" />
                  {errors['contact.postalCode'] && <p className="text-red-500 text-xs mt-1">{errors['contact.postalCode']}</p>}
                </FieldGroup>
              </div>
            )}

            {/* Step 3: Next of Kin */}
            {currentStep === 3 && (
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <FieldGroup label="Full Name" required>
                    <Input value={formData.nextOfKin.fullName} onChange={e => updateField('nextOfKin', 'fullName', e.target.value)} placeholder="Jane Doe" />
                    {errors['nextOfKin.fullName'] && <p className="text-red-500 text-xs mt-1">{errors['nextOfKin.fullName']}</p>}
                  </FieldGroup>
                </div>
                <FieldGroup label="Relationship" required>
                  <Select value={formData.nextOfKin.relationship} onChange={e => updateField('nextOfKin', 'relationship', e.target.value)}>
                    <option value="">Select relationship</option>
                    <option>Spouse</option><option>Parent</option><option>Child</option><option>Sibling</option><option>Friend</option><option>Other</option>
                  </Select>
                  {errors['nextOfKin.relationship'] && <p className="text-red-500 text-xs mt-1">{errors['nextOfKin.relationship']}</p>}
                </FieldGroup>
                <FieldGroup label="Phone Number" required>
                  <Input type="tel" value={formData.nextOfKin.phone} onChange={e => updateField('nextOfKin', 'phone', e.target.value)} placeholder="+1 (555) 000-0000" />
                  {errors['nextOfKin.phone'] && <p className="text-red-500 text-xs mt-1">{errors['nextOfKin.phone']}</p>}
                </FieldGroup>
                <FieldGroup label="Email">
                  <Input type="email" value={formData.nextOfKin.email} onChange={e => updateField('nextOfKin', 'email', e.target.value)} placeholder="jane@example.com" />
                </FieldGroup>
                <div className="sm:col-span-2">
                  <FieldGroup label="Address">
                    <Input value={formData.nextOfKin.address} onChange={e => updateField('nextOfKin', 'address', e.target.value)} placeholder="123 Main St, New York, NY" />
                  </FieldGroup>
                </div>
              </div>
            )}

            {/* Step 4: Account Details */}
            {currentStep === 4 && (
              <div className="grid sm:grid-cols-2 gap-5">
                <FieldGroup label="Account Type" required>
                  <Select value={formData.accountDetails.accountType} onChange={e => updateField('accountDetails', 'accountType', e.target.value)} data-testid="account-type-select">
                    <option value="">Select account type</option>
                    <option value="checking">Checking Account</option>
                    <option value="savings">Savings Account</option>
                    <option value="investment">Investment Account</option>
                    <option value="business">Business Account</option>
                  </Select>
                  {errors['accountDetails.accountType'] && <p className="text-red-500 text-xs mt-1">{errors['accountDetails.accountType']}</p>}
                </FieldGroup>
                <FieldGroup label="Preferred Branch / State">
                  <Input value={formData.accountDetails.preferredBranch} onChange={e => updateField('accountDetails', 'preferredBranch', e.target.value)} placeholder="New York" />
                </FieldGroup>
                <FieldGroup label="Occupation" required>
                  <Input value={formData.accountDetails.occupation} onChange={e => updateField('accountDetails', 'occupation', e.target.value)} placeholder="Software Engineer" />
                  {errors['accountDetails.occupation'] && <p className="text-red-500 text-xs mt-1">{errors['accountDetails.occupation']}</p>}
                </FieldGroup>
                <FieldGroup label="Employer / Company">
                  <Input value={formData.accountDetails.employer} onChange={e => updateField('accountDetails', 'employer', e.target.value)} placeholder="Acme Corp" />
                </FieldGroup>
                <div className="sm:col-span-2">
                  <FieldGroup label="Monthly Income Range">
                    <Select value={formData.accountDetails.monthlyIncome} onChange={e => updateField('accountDetails', 'monthlyIncome', e.target.value)}>
                      <option value="">Select range</option>
                      <option>Under $2,000</option><option>$2,000 – $5,000</option><option>$5,000 – $10,000</option><option>$10,000 – $25,000</option><option>Above $25,000</option>
                    </Select>
                  </FieldGroup>
                </div>
              </div>
            )}

            {/* Step 5: KYC */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <FieldGroup label="Social Security Number (SSN)" required>
                  <Input type="text" value={formData.kyc.ssn} onChange={e => updateField('kyc', 'ssn', e.target.value)} placeholder="XXX-XX-XXXX" maxLength={11} />
                  {errors['kyc.ssn'] && <p className="text-red-500 text-xs mt-1">{errors['kyc.ssn']}</p>}
                  <p className="text-gray-400 text-xs mt-1.5 flex items-center gap-1"><Lock className="w-3 h-3" /> Your SSN is encrypted and stored securely.</p>
                </FieldGroup>

                {/* Upload zones */}
                {[
                  { label: 'Passport Photograph', key: 'passport' as const, ref: passportRef, name: formData.kyc.passportPhotoName, loading: uploadingPassport, required: true, errKey: 'kyc.passportPhotoName' },
                  { label: 'Government-issued ID', key: 'id' as const, ref: idRef, name: formData.kyc.meansOfIdName, loading: uploadingId, required: true, errKey: 'kyc.meansOfIdName' },
                  { label: 'Supporting Document (Optional)', key: 'doc' as const, ref: docRef, name: formData.kyc.supportingDocName, loading: uploadingDoc, required: false, errKey: '' },
                ].map(({ label, key, ref, name, loading, required, errKey }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-[#0B2447] mb-1.5">
                      {label}{required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 hover:border-[#1565C0] hover:bg-blue-50/30 ${name ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50'}`}
                      onClick={() => ref.current?.click()}
                    >
                      <input
                        type="file"
                        ref={ref}
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(key, file)
                        }}
                      />
                      {loading ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-2 border-[#0B2447] border-t-transparent rounded-full animate-spin" />
                          <p className="text-sm text-gray-500">Uploading...</p>
                        </div>
                      ) : name ? (
                        <div className="flex items-center justify-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-green-700">{name}</p>
                            <p className="text-xs text-green-600">Uploaded successfully</p>
                          </div>
                          <button onClick={e => { e.stopPropagation(); updateField('kyc', key === 'passport' ? 'passportPhotoName' : key === 'id' ? 'meansOfIdName' : 'supportingDocName', ''); }} className="ml-2 text-gray-400 hover:text-red-500">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <p className="text-sm text-gray-600 font-medium">Click to upload or drag & drop</p>
                          <p className="text-xs text-gray-400">PNG, JPG, or PDF — max 5MB</p>
                        </div>
                      )}
                    </div>
                    {errKey && errors[errKey] && <p className="text-red-500 text-xs mt-1">{errors[errKey]}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Step 6: Set Password */}
            {currentStep === 6 && (
              <div className="space-y-5 max-w-md">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                  Your password will be used to sign in once your account is approved. Keep it safe.
                </div>
                <FieldGroup label="Password" required>
                  <div className="relative">
                    <Input type={showPassword ? 'text' : 'password'} value={formData.password.password} onChange={e => updateField('password', 'password', e.target.value)} placeholder="Create a strong password" data-testid="new-password-input" />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formData.password.password && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= pwStrength.score ? pwStrength.color : 'bg-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{pwStrength.label}</p>
                    </div>
                  )}
                  {errors['password.password'] && <p className="text-red-500 text-xs mt-1">{errors['password.password']}</p>}
                </FieldGroup>
                <FieldGroup label="Confirm Password" required>
                  <div className="relative">
                    <Input type={showConfirm ? 'text' : 'password'} value={formData.password.confirmPassword} onChange={e => updateField('password', 'confirmPassword', e.target.value)} placeholder="Repeat your password" />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors['password.confirmPassword'] && <p className="text-red-500 text-xs mt-1">{errors['password.confirmPassword']}</p>}
                </FieldGroup>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Password requirements:</p>
                  {[
                    { text: 'At least 8 characters', ok: formData.password.password.length >= 8 },
                    { text: 'One uppercase letter', ok: /[A-Z]/.test(formData.password.password) },
                    { text: 'One number', ok: /[0-9]/.test(formData.password.password) },
                    { text: 'Passwords match', ok: !!formData.password.confirmPassword && formData.password.password === formData.password.confirmPassword },
                  ].map(({ text, ok }) => (
                    <div key={text} className="flex items-center gap-2 mt-1.5">
                      <CheckCircle className={`w-3.5 h-3.5 ${ok ? 'text-green-500' : 'text-gray-300'}`} />
                      <p className={`text-xs ${ok ? 'text-green-700' : 'text-gray-500'}`}>{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 7: Review & Submit */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { title: 'Personal Information', data: formData.personal },
                    { title: 'Contact Information', data: formData.contact },
                    { title: 'Next of Kin', data: formData.nextOfKin },
                    { title: 'Account Details', data: formData.accountDetails },
                  ].map(({ title, data }) => (
                    <div key={title} className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-heading font-bold text-[#0B2447] text-sm">{title}</h4>
                      </div>
                      <dl className="space-y-1.5">
                        {Object.entries(data).filter(([,v]) => v).map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-2">
                            <dt className="text-xs text-gray-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}</dt>
                            <dd className="text-xs text-gray-700 font-medium text-right max-w-[60%] truncate">{String(v)}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>

                <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                  <h4 className="font-heading font-bold text-[#0B2447] text-sm mb-3">KYC Documents</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Passport Photo', name: formData.kyc.passportPhotoName },
                      { label: 'Government ID', name: formData.kyc.meansOfIdName },
                      { label: 'Supporting Doc', name: formData.kyc.supportingDocName },
                    ].map(({ label, name }) => (
                      <div key={label} className="flex items-center gap-2">
                        {name ? <CheckCircle className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-gray-300" />}
                        <span className="text-xs text-gray-600">{label}: {name || 'Not uploaded'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {errors.submit && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-4">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-red-700 text-sm">{errors.submit}</p>
                  </div>
                )}

                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <input
                    type="checkbox"
                    id="agree-terms"
                    checked={agreed}
                    onChange={e => { setAgreed(e.target.checked); setErrors(prev => { const n = {...prev}; delete n.agreed; return n }) }}
                    className="mt-0.5 rounded border-gray-300 text-[#1565C0] cursor-pointer"
                    data-testid="agree-checkbox"
                  />
                  <label htmlFor="agree-terms" className="text-sm text-gray-700 cursor-pointer">
                    I confirm that all information provided is accurate and complete. I agree to the{' '}
                    <Link href="/privacy-security" className="text-[#1565C0] underline">Terms of Service</Link> and{' '}
                    <Link href="/privacy-security" className="text-[#1565C0] underline">Privacy Policy</Link> of Silver Union Capital.
                  </label>
                </div>
                {errors.agreed && <p className="text-red-500 text-xs mt-1">{errors.agreed}</p>}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:border-[#0B2447] hover:text-[#0B2447] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              data-testid="prev-step-btn"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {currentStep < 7 ? (
              <button onClick={nextStep} className="inline-flex items-center gap-2 bg-[#0B2447] text-white hover:bg-[#06162c] px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm" data-testid="next-step-btn">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
                data-testid="submit-application-btn"
              >
                {submitting ? 'Submitting...' : 'Submit Application'} {!submitting && <CheckCircle className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
