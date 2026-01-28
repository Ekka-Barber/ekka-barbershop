// Business logic types that extend database types

export * from './calculations';
export * from './navigation';

import type { Employee } from '@shared/types/domains';
import type { Branch } from '@shared/types/domains';
import type { Sponsor } from '@shared/types/domains';

export interface EmployeeWithBranch extends Employee {
  branches?: Branch | null;
  sponsors?: Sponsor | null;
}