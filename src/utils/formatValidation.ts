import {  ZodError } from 'zod';

/**
 * 
 * @param errors 
 * @returns Schema validation errors
 */
export const formatValidationError = (errors: ZodError) => {
  if(!errors || !errors.issues) return 'Validation Failed';

  if(Array.isArray(errors.issues)) return errors.issues.map((v) => v.message).join(', ');

  return JSON.stringify(errors);

};