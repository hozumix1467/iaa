export interface PhoneUsage {
  id: string;
  date: string;
  hours: number;
  created_at: string;
  updated_at: string;
}

export interface PhoneUsageInsert {
  date: string;
  hours: number;
}

export interface PhoneUsageUpdate {
  hours: number;
}
