
import React from 'react';
import { PricingRule, CustomerOriginCondition } from '../types';
import PricingRuleListItem from './PricingRuleListItem';
import { ShieldAlert, Target, Globe } from 'lucide-react';

interface PricingRuleListProps {
  rules: PricingRule[];
  moveRule: (dragIndex: number, hoverIndex: number) => void;
  onEditDetails: (rule: PricingRule) => void;
  onEditRate: (rule: PricingRule) => void;
  onDelete: (ruleId: string) => void;
  onToggleStatus: (ruleId: string) => void;
}

const RuleGroup: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    rules: PricingRule[];
    allRules: PricingRule[];
    moveRule: (dragIndex: number, hoverIndex: number) => void;
    onEditDetails: (rule: PricingRule) => void;
    onEditRate: (rule: PricingRule) => void;
    onDelete: (ruleId: string) => void;
    onToggleStatus: (ruleId: string) => void;
}> = ({ title, description, icon, rules: groupRules, allRules, ...rest }) => {
    if (groupRules.length === 0) return null;

    return (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex items-center mb-3 pb-3 border-b border-gray-200">
                <div className="mr-3 text-indigo-600">{icon}</div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
            </div>
            <div className="space-y-3">
                {groupRules.map((rule) => {
                    const originalIndex = allRules.findIndex((r) => r.id === rule.id);
                    return (
                        <PricingRuleListItem
                            key={rule.id}
                            index={originalIndex}
                            rule={rule}
                            moveRule={rest.moveRule}
                            onEditDetails={rest.onEditDetails}
                            onEditRate={rest.onEditRate}
                            onDelete={rest.onDelete}
                            onToggleStatus={rest.onToggleStatus}
                        />
                    );
                })}
            </div>
        </div>
    );
};

const PricingRuleList: React.FC<PricingRuleListProps> = ({ rules, ...rest }) => {
    const exclusionRules = rules.filter(r => r.conditions.customerOrigin?.condition === CustomerOriginCondition.Exclude);
    const inclusionRules = rules.filter(r => r.conditions.customerOrigin?.condition === CustomerOriginCondition.Include);
    const generalRules = rules.filter(r => !r.conditions.customerOrigin);

    if (rules.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow">
                <p>No pricing rules found.</p>
                <p className="text-sm">Try adjusting your search or adding a new rule.</p>
            </div>
        );
    }

    return (
        <div>
            <RuleGroup
                title="Level 1 Priority: Excluded Customer Origins"
                description="These rules have the highest priority and will exclude customers from specific countries."
                icon={<ShieldAlert size={24} />}
                rules={exclusionRules}
                allRules={rules}
                {...rest}
            />
            <RuleGroup
                title="Level 2 Priority: Specified Customer Origins"
                description="After exclusion rules, these rules apply to customers from the specific countries listed."
                icon={<Target size={24} />}
                rules={inclusionRules}
                allRules={rules}
                {...rest}
            />
            <RuleGroup
                title="Level 3 Priority: General Rules"
                description="These rules have the lowest priority and apply to any customer not covered by the rules above."
                icon={<Globe size={24} />}
                rules={generalRules}
                allRules={rules}
                {...rest}
            />
        </div>
    );
};

export default PricingRuleList;
