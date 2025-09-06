// src/utils/routeMap.ts

// remove spaces so "/Outrich Clinic" => "/OutrichClinic"
export const normalize = (u: string) => (u || '').trim().replace(/\s+/g, '');

// map normalized backend URLs to your app routes
const map: Record<string, string> = {
  '/preg': '/PatientRegistrationSearch',
  '/screening': '/PatientSearchPage',
  '/clinical': '/ClinicSearchPage',
  '/reftohospital': '/ClinicSearchPage', // change to your real route if needed
  '/management': '/DynamicScreen',
  '/PatientEdit': '/PatientEdit',        // injected "Modify Patient Information"
  '/OutrichClinic': '/HomePage',         // backend sent "/Outrich Clinic"
};

// get route for a backend url; falls back to normalized url if not mapped
export const toRoute = (url: string) => {
  const key = normalize(url);
  return map[key] || key;
};
