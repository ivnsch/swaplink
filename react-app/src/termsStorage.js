const acceptTermsKey = "acceptedTerms";

export const needsToAcceptTerms = async () => {
  return !localStorage.getItem(acceptTermsKey);
};

export const saveAcceptedTerms = async () => {
  return localStorage.setItem(acceptTermsKey, true);
};
