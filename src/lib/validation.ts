export interface FormValues {
  email: string
  name: string
  gender: string
  designation: string
  placeOfAssignment: string
  contactNumber: string
}

export type FormErrors = Partial<Record<keyof FormValues, string>>

export const emptyForm: FormValues = {
  email: '',
  name: '',
  gender: '',
  designation: '',
  placeOfAssignment: '',
  contactNumber: '',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// 09XXXXXXXXX, +639XXXXXXXXX or 639XXXXXXXXX
const PH_MOBILE_RE = /^(?:\+?63|0)9\d{9}$/

export function validate(v: FormValues): FormErrors {
  const e: FormErrors = {}
  if (!v.email.trim()) e.email = 'Email address is required.'
  else if (!EMAIL_RE.test(v.email.trim())) e.email = 'Enter a valid email address.'
  if (!v.name.trim()) e.name = 'Name is required.'
  if (!v.gender) e.gender = 'Please select a gender.'
  if (!v.designation.trim()) e.designation = 'Designation is required.'
  if (!v.placeOfAssignment.trim()) e.placeOfAssignment = 'Place of assignment is required.'
  const phone = v.contactNumber.replace(/[\s-]/g, '')
  if (!phone) e.contactNumber = 'Contact number is required.'
  else if (!PH_MOBILE_RE.test(phone)) e.contactNumber = 'Enter a valid mobile number (e.g. 09171234567).'
  return e
}
