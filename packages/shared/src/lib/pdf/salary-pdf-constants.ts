// EKKAH Brand Colors
export const BRAND_COLORS = {
    gold: '#c6a961',
    goldLight: '#d4bc7f',
    goldDark: '#a88d4a',
    darkGray: '#4a4a4a',
    lightGray: '#f5f3ee',
    white: '#ffffff',
    cream: '#faf8f3',
};

export interface PDFSummary {
    totalEmployees: number;
    totalTransferAmount: number;
    totalLoansAmount: number;
    branchSummaries: BranchSummary[];
    sponsorSummaries: SponsorSummary[];
}

export interface BranchSummary {
    branchName: string;
    employeeCount: number;
    totalTransfer: number;
    totalLoans: number;
}

export interface SponsorSummary {
    sponsorId?: string | null;
    sponsorName: string;
    sponsorNameAr?: string;
    employeeCount: number;
    totalTransfer: number;
}
