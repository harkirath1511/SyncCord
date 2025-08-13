import React from 'react'


export const isAlphabetsOnly = (str, allowSpaces = false) => {
  if (!str || typeof str !== 'string') {
    return false;
  }
  
  const pattern = allowSpaces ? /^[a-zA-Z\s]+$/ : /^[a-zA-Z]+$/;
  
  return pattern.test(str);
};


export const sanitizeToAlphabetsOnly = (str, allowSpaces = false) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  const pattern = allowSpaces ? /[^a-zA-Z\s]/g : /[^a-zA-Z]/g;
  return str.replace(pattern, '');
};


export const validateAlphabeticString = (str, options = {}) => {
  const {
    allowSpaces = true,
    minLength = 5,
    maxLength = Number.MAX_SAFE_INTEGER
  } = options;
  
  if (!str || typeof str !== 'string') {
    return { 
      isValid: false, 
      error: 'Input must be a string' 
    };
  }
  
  if (str.length < minLength) {
    return { 
      isValid: false, 
      error: `Input must be at least ${minLength} characters` 
    };
  }
  
  if (str.length > maxLength) {
    return { 
      isValid: false, 
      error: `Input must not exceed ${maxLength} characters` 
    };
  }
  
  if (!isAlphabetsOnly(str, allowSpaces)) {
    return { 
      isValid: false, 
      error: `Input must contain only ${allowSpaces ? 'letters and spaces' : 'letters'}` 
    };
  }
  
  return { 
    isValid: true, 
    error: null 
  };
};

function stringCheck() {
  return (
    <div>stringCheck</div>
  )
}

export default stringCheck
