const COMPANY_KEY = 'invoiceGuru.selectedCompanyId'
const CUSTOMER_KEY = 'invoiceGuru.selectedCustomerId'

const safeGet = (key) => {
  if (typeof window === 'undefined') return ''
  try {
    return window.localStorage.getItem(key) || ''
  } catch (error) {
    return ''
  }
}

const safeSet = (key, value) => {
  if (typeof window === 'undefined') return
  try {
    if (value) {
      window.localStorage.setItem(key, value)
    } else {
      window.localStorage.removeItem(key)
    }
  } catch (error) {
    // ignore storage failures
  }
}

export const getStoredCompanyId = () => safeGet(COMPANY_KEY)
export const setStoredCompanyId = (value) => safeSet(COMPANY_KEY, value)
export const getStoredCustomerId = () => safeGet(CUSTOMER_KEY)
export const setStoredCustomerId = (value) => safeSet(CUSTOMER_KEY, value)
