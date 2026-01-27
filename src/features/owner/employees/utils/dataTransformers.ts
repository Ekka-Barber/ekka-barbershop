import type {
  EmployeeFinancialRecord,
  EmployeeFinancialRecords,
} from '../types';

/**
 * Transforms an array of financial records into a grouped record by employee name
 */
export const transformFinancialRecordsToRecords = (
  records: EmployeeFinancialRecord[]
): EmployeeFinancialRecords => {
  const recordsObject: EmployeeFinancialRecords = {};

  if (!Array.isArray(records)) {
    return recordsObject;
  }

  records.forEach((record: EmployeeFinancialRecord) => {
    if (!recordsObject[record.employee_name]) {
      recordsObject[record.employee_name] = [];
    }
    recordsObject[record.employee_name].push({
      description: record.description,
      amount: record.amount.toString(),
      date: record.date,
    });
  });

  return recordsObject;
};
