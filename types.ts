
export enum RuleStatus {
  Enabled = 'Enabled',
  Disabled = 'Disabled',
}

export enum RuleLifecycle {
  Active = 'Active',
  Upcoming = 'Upcoming',
  Expired = 'Expired',
}

export enum CustomerOriginCondition {
    Include = 'Include',
    Exclude = 'Exclude',
}

export interface RentalDurationBracket {
    from: number;
    to: number;
}

export interface Condition {
    bookingDateRange?: { start: Date; end: Date };
    rentalDateRange?: { start: Date; end: Date };
    rentalDaysOfWeek?: number[]; // 0 for Sunday, 1 for Monday, etc.
    applicableStores: string[]; // store IDs
    sourceChannels: string[]; // channel IDs
    customerOrigin?: {
        condition: CustomerOriginCondition;
        countries: string[];
    };
    isUrgent?: boolean;
    rentalDurationBrackets: RentalDurationBracket[];
}

export interface RentalDurationPrice {
    from: number; // days
    to: number; // days
    price: number;
}

export interface CarModelPrice {
    sippCode: string;
    prices: RentalDurationPrice[];
}

export interface PricingRule {
  id: string;
  name: string;
  priority: number;
  status: RuleStatus;
  lifecycle: RuleLifecycle;
  conditions: Condition;
  pricing: CarModelPrice[];
}

export interface Store {
    id: string;
    name:string;
}

export interface Channel {
    id: string;
    name: string;
}

export interface CarModel {
    sippCode: string;
    name: string;
    group: string;
}
