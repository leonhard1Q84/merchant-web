
import React, { useState, useEffect } from 'react';
import { PricingRule, Condition, Store, Channel, CustomerOriginCondition, RentalDurationBracket } from '../types';
import { mockRuleTemplate } from '../data/mockData';
import { X, PlusCircle, Trash2 } from 'lucide-react';
import MultiSelectWithSearch from './MultiSelectWithSearch';

interface RuleDetailsEditorProps {
  rule: PricingRule | null;
  onSave: (rule: PricingRule) => void;
  onClose: () => void;
  allStores: Store[];
  allChannels: Channel[];
}

const RuleDetailsEditor: React.FC<RuleDetailsEditorProps> = ({ rule, onSave, onClose, allStores, allChannels }) => {
  const [editedRule, setEditedRule] = useState<PricingRule>(mockRuleTemplate());

  useEffect(() => {
    const initialRule = rule ? JSON.parse(JSON.stringify(rule)) : mockRuleTemplate();
    if (initialRule.conditions.rentalDateRange) {
        initialRule.conditions.rentalDateRange.start = new Date(initialRule.conditions.rentalDateRange.start);
        initialRule.conditions.rentalDateRange.end = new Date(initialRule.conditions.rentalDateRange.end);
    }
    setEditedRule(initialRule);
  }, [rule]);

  const handleSave = () => {
    if (!editedRule.name || !editedRule.conditions.rentalDateRange) {
        alert('Please fill in Rule Name and Rental Date Range.');
        return;
    }
    onSave(editedRule);
  };
  
  const handleConditionChange = (updatedConditions: Partial<Condition>) => {
    setEditedRule(prev => ({ ...prev, conditions: { ...prev.conditions, ...updatedConditions } }));
  };

  const handleDateChange = (field: 'start' | 'end', value: string) => {
      const newRange = {
          start: editedRule.conditions.rentalDateRange?.start ?? new Date(),
          end: editedRule.conditions.rentalDateRange?.end ?? new Date()
      };
      newRange[field] = new Date(value);
      handleConditionChange({ rentalDateRange: newRange });
  };
  
  const handleBracketChange = (index: number, field: 'from' | 'to', value: string) => {
    const newBrackets = [...editedRule.conditions.rentalDurationBrackets];
    newBrackets[index] = { ...newBrackets[index], [field]: parseInt(value, 10) || 0 };
    handleConditionChange({ rentalDurationBrackets: newBrackets });
  };

  const addBracket = () => {
    const lastBracket = editedRule.conditions.rentalDurationBrackets.slice(-1)[0] || { to: 0 };
    const newFrom = lastBracket.to + 1;
    const newBrackets = [...editedRule.conditions.rentalDurationBrackets, { from: newFrom, to: newFrom }];
    handleConditionChange({ rentalDurationBrackets: newBrackets });
  };

  const removeBracket = (index: number) => {
    const newBrackets = editedRule.conditions.rentalDurationBrackets.filter((_, i) => i !== index);
    handleConditionChange({ rentalDurationBrackets: newBrackets });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-start p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{rule ? 'Edit Rule Details' : 'Create New Rule'}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600">
            <X size={24} />
          </button>
        </header>

        <main className="p-6 space-y-6">
          <div>
            <label htmlFor="ruleName" className="block text-sm font-medium text-gray-700">Rule Name</label>
            <input
              type="text" id="ruleName" value={editedRule.name}
              onChange={(e) => setEditedRule(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Rental Date Range</label>
            <div className="flex items-center space-x-2 mt-1">
              <input type="date" value={editedRule.conditions.rentalDateRange?.start.toISOString().split('T')[0] ?? ''} onChange={(e) => handleDateChange('start', e.target.value)} className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              <span>to</span>
              <input type="date" value={editedRule.conditions.rentalDateRange?.end.toISOString().split('T')[0] ?? ''} onChange={(e) => handleDateChange('end', e.target.value)} className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
            </div>
          </div>
          
          <MultiSelectWithSearch
            label="Applicable Stores"
            items={allStores}
            selectedItems={editedRule.conditions.applicableStores}
            onChange={(selectedIds) => handleConditionChange({ applicableStores: selectedIds })}
          />

          <MultiSelectWithSearch
            label="Source Channels"
            items={allChannels}
            selectedItems={editedRule.conditions.sourceChannels}
            onChange={(selectedIds) => handleConditionChange({ sourceChannels: selectedIds })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rental Duration Brackets (Days)</label>
            <div className="space-y-2">
              {editedRule.conditions.rentalDurationBrackets.map((bracket, index) => (
                  <div key={index} className="flex items-center space-x-2">
                      <input type="number" placeholder="From" value={bracket.from} onChange={e => handleBracketChange(index, 'from', e.target.value)} className="w-24 shadow-sm sm:text-sm border-gray-300 rounded-md" />
                      <span>-</span>
                      <input type="number" placeholder="To" value={bracket.to} onChange={e => handleBracketChange(index, 'to', e.target.value)} className="w-24 shadow-sm sm:text-sm border-gray-300 rounded-md" />
                      <button onClick={() => removeBracket(index)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
              ))}
            </div>
             <button onClick={addBracket} className="mt-2 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                <PlusCircle className="-ml-0.5 mr-1 h-4 w-4" /> Add Bracket
            </button>
          </div>
        </main>
        
        <footer className="flex justify-end p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <button onClick={onClose} className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">Save Details</button>
        </footer>
      </div>
    </div>
  );
};

export default RuleDetailsEditor;
