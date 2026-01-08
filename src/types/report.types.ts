export type ReportType = 'monthly' | 'quarterly' | 'annual';

export interface SedeReport {
  id: number;
  title: string;
  type: ReportType;
  generatedDate: string;
  beneficiariesCount: number;
  attendanceAverage: number;
}
