
import React from 'react';
import { PricingRule } from '../types';
import PricingRuleListItem from './PricingRuleListItem';

interface PricingRuleListProps {
  rules: PricingRule[];
  moveRule: (dragIndex: number, hoverIndex: number) => void;
  onEditDetails: (rule: PricingRule) => void;
  onEditRate: (rule: PricingRule) => void;
  onDelete: (ruleId: string) => void;
  onToggleStatus: (ruleId: string) => void;
}

const PricingRuleList: React.FC<PricingRuleListProps> = ({ rules, moveRule, onEditDetails, onEditRate, onDelete, onToggleStatus }) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50 rounded-t-md">
        <div className="col-span-1">Priority</div>
        <div className="col-span-4">Rule Name / Conditions</div>
        <div className="col-span-2">Date Range</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-3 text-right">Actions</div>
      </div>
      {rules.length > 0 ? (
        rules.map((rule, index) => (
          <PricingRuleListItem
            key={rule.id}
            index={index}
            rule={rule}
            moveRule={moveRule}
            onEditDetails={onEditDetails}
            onEditRate={onEditRate}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        ))
      ) : (
        <div className="text-center py-10 text-gray-500">
          <p>No pricing rules found.</p>
          <p className="text-sm">Try adjusting your search or adding a new rule.</p>
        </div>
      )}
    </div>
  );
};

export default PricingRuleList;
