
import { PricingRule, RuleStatus, RuleLifecycle, CustomerOriginCondition, Store, Channel, CarModel } from '../types';

export const mockStores: Store[] = [
    { id: 'store_1', name: 'Asakusabashi Store' },
    { id: 'store_2', name: 'Hachioji Store' },
    { id: 'store_3', name: 'Hakata Store' },
    { id: 'store_4', name: 'Fukuoka Store' }
];

export const mockChannels: Channel[] = [
    { id: 'channel_1', name: 'Zuzuche' },
    { id: 'channel_2', name: 'Ctrip' },
    { id: 'channel_3', name: 'Direct' }
];

export const mockCarModels: CarModel[] = [
    { sippCode: 'CDAR', name: 'Toyota Corolla', group: 'Compact' },
    { sippCode: 'EDAR', name: 'Toyota Yaris', group: 'Economy' },
    { sippCode: 'IVAR', name: 'Nissan Serena', group: 'Intermediate Van' },
    { sippCode: 'SDAR', name: 'Toyota Camry', group: 'Standard' },
];

export const mockRules: PricingRule[] = [
  {
    id: 'rule_1',
    name: 'Tokyo Peak Season - HK Customers',
    priority: 1,
    status: RuleStatus.Enabled,
    lifecycle: RuleLifecycle.Active,
    conditions: {
      rentalDateRange: { start: new Date('2025-07-01'), end: new Date('2025-08-31') },
      applicableStores: ['store_1', 'store_2'],
      sourceChannels: ['channel_2'],
      customerOrigin: {
        condition: CustomerOriginCondition.Include,
        countries: ['HK'],
      },
      rentalDurationBrackets: [
        { from: 1, to: 1 },
        { from: 2, to: 5 },
        { from: 6, to: 15 }
      ]
    },
    pricing: [
        { sippCode: 'CDAR', prices: [
            { from: 1, to: 1, price: 120 },
            { from: 2, to: 5, price: 110 },
            { from: 6, to: 15, price: 100 }
        ]}
    ],
  },
  {
    id: 'rule_2',
    name: 'All Stores - Off-Peak',
    priority: 3,
    status: RuleStatus.Enabled,
    lifecycle: RuleLifecycle.Upcoming,
    conditions: {
      rentalDateRange: { start: new Date('2025-09-01'), end: new Date('2025-11-30') },
      applicableStores: [],
      sourceChannels: [],
      rentalDurationBrackets: [
        { from: 1, to: 1 },
        { from: 2, to: 5 },
        { from: 6, to: 15 }
      ]
    },
    pricing: [
      { sippCode: 'CDAR', prices: [
            { from: 1, to: 1, price: 80 },
            { from: 2, to: 5, price: 75 },
            { from: 6, to: 15, price: 70 }
        ]},
      { sippCode: 'EDAR', prices: [
            { from: 1, to: 1, price: 70 },
            { from: 2, to: 5, price: 65 },
            { from: 6, to: 15, price: 60 }
        ]}
    ],
  },
  {
    id: 'rule_3',
    name: 'Fukuoka Special',
    priority: 2,
    status: RuleStatus.Disabled,
    lifecycle: RuleLifecycle.Active,
    conditions: {
      applicableStores: ['store_3', 'store_4'],
      sourceChannels: [],
      rentalDurationBrackets: [
        { from: 1, to: 7 }
      ]
    },
    pricing: [],
  },
   {
    id: 'rule_4',
    name: 'Old Rule Expired',
    priority: 4,
    status: RuleStatus.Enabled,
    lifecycle: RuleLifecycle.Expired,
    conditions: {
      rentalDateRange: { start: new Date('2024-01-01'), end: new Date('2024-03-31') },
      applicableStores: [],
      sourceChannels: [],
      rentalDurationBrackets: [
        { from: 1, to: 30 }
      ]
    },
    pricing: [],
  },
];

export const mockRuleTemplate = (): PricingRule => ({
  id: '',
  name: '',
  priority: 0,
  status: RuleStatus.Enabled,
  lifecycle: RuleLifecycle.Upcoming,
  conditions: {
    rentalDateRange: { start: new Date(), end: new Date(new Date().setDate(new Date().getDate() + 30))},
    applicableStores: [],
    sourceChannels: [],
    customerOrigin: {
        condition: CustomerOriginCondition.Include,
        countries: []
    },
    rentalDurationBrackets: [
      { from: 1, to: 1 },
      { from: 2, to: 7 },
      { from: 8, to: 30 },
    ]
  },
  pricing: [],
});
