
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { PricingRule, RuleStatus, RuleLifecycle, CustomerOriginCondition, ActivityLog, ActivityAction } from './types';
import { mockRules, mockStores, mockChannels, mockCarModels } from './data/mockData';
import PricingRuleList from './components/PricingRuleList';
import RuleDetailsEditor from './components/RuleDetailsEditor';
import RateEditor from './components/RateEditor';
import ActivityLogModal from './components/ActivityLogModal';
import { PlusCircle, Search, History } from 'lucide-react';
import { isEqual } from 'date-fns';

const getRuleLevel = (rule: PricingRule): number => {
  if (rule.conditions.customerOrigin?.condition === CustomerOriginCondition.Exclude) return 1;
  if (rule.conditions.customerOrigin?.condition === CustomerOriginCondition.Include) return 2;
  return 3;
};

const sortRules = (rulesToSort: PricingRule[]): PricingRule[] => {
    return [...rulesToSort].sort((a, b) => {
        const levelA = getRuleLevel(a);
        const levelB = getRuleLevel(b);
        if (levelA !== levelB) {
            return levelA - levelB;
        }
        return a.priority - b.priority;
    });
};

const generateChangeDetails = (before: PricingRule, after: PricingRule): string => {
    const changes: string[] = [];
    if (before.name !== after.name) changes.push(`Name changed to "${after.name}".`);
    if (before.status !== after.status) changes.push(`Status changed to ${after.status}.`);
    
    const beforeRange = before.conditions.rentalDateRange;
    const afterRange = after.conditions.rentalDateRange;
    if (!beforeRange || !afterRange || !isEqual(beforeRange.start, afterRange.start) || !isEqual(beforeRange.end, afterRange.end)) {
        changes.push("Rental date range updated.");
    }

    if (JSON.stringify(before.conditions.applicableStores.sort()) !== JSON.stringify(after.conditions.applicableStores.sort())) {
        changes.push("Applicable stores updated.");
    }
    if (JSON.stringify(before.conditions.sourceChannels.sort()) !== JSON.stringify(after.conditions.sourceChannels.sort())) {
        changes.push("Source channels updated.");
    }
    if (JSON.stringify(before.conditions.customerOrigin) !== JSON.stringify(after.conditions.customerOrigin)) {
        changes.push("Customer origin conditions updated.");
    }
    if (JSON.stringify(before.conditions.rentalDurationBrackets) !== JSON.stringify(after.conditions.rentalDurationBrackets)) {
        changes.push("Rental duration brackets updated.");
    }
    if (JSON.stringify(before.pricing) !== JSON.stringify(after.pricing)) {
        changes.push("Pricing rates updated.");
    }

    return changes.length > 0 ? changes.join(' ') : 'No changes detected.';
};

const App: React.FC = () => {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [editorState, setEditorState] = useState<{ mode: 'closed' | 'details' | 'rate', rule: PricingRule | null }>({ mode: 'closed', rule: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [isLogVisible, setIsLogVisible] = useState(false);

  useEffect(() => {
    const sortedInitialRules = sortRules(mockRules);
    const prioritizedRules = sortedInitialRules.map((rule, index) => ({ ...rule, priority: index + 1 }));
    setRules(prioritizedRules);
  }, []);

  const logActivity = (action: ActivityAction, rule: PricingRule, details: string) => {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date(),
      action,
      ruleId: rule.id,
      ruleName: rule.name,
      details,
    };
    setActivityLog(prev => [newLog, ...prev]);
  };
  
  const moveRule = useCallback((dragIndex: number, hoverIndex: number) => {
    const currentList = sortRules(rules).filter(rule =>
        rule.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const draggedRule = currentList[dragIndex];
    const hoverRule = currentList[hoverIndex];

    if (!draggedRule || !hoverRule || getRuleLevel(draggedRule) !== getRuleLevel(hoverRule)) {
        return;
    }
    
    setRules(prevRules => {
        const workingRules = [...prevRules];
        const actualDragIndex = workingRules.findIndex(r => r.id === draggedRule.id);
        const actualHoverIndex = workingRules.findIndex(r => r.id === hoverRule.id);

        if (actualDragIndex === -1 || actualHoverIndex === -1) return prevRules;
        
        const [movedItem] = workingRules.splice(actualDragIndex, 1);
        workingRules.splice(actualHoverIndex, 0, movedItem);

        const sorted = sortRules(workingRules);
        const reprioritized = sorted.map((rule, index) => ({ ...rule, priority: index + 1 }));
        
        const movedRuleAfter = reprioritized.find(r => r.id === draggedRule.id);
        if(movedRuleAfter && draggedRule.priority !== movedRuleAfter.priority) {
            logActivity('Reorder', movedRuleAfter, `Priority changed from ${draggedRule.priority} to ${movedRuleAfter.priority}.`);
        }
        
        return reprioritized;
    });
  }, [rules, searchTerm]);

  const handleAddNewRule = () => {
    setEditorState({ mode: 'details', rule: null });
  };

  const handleEditDetails = (rule: PricingRule) => {
    setEditorState({ mode: 'details', rule });
  };
  
  const handleEditRate = (rule: PricingRule) => {
    setEditorState({ mode: 'rate', rule });
  };

  const handleCloseEditor = () => {
    setEditorState({ mode: 'closed', rule: null });
  };

  const handleSaveRule = (savedRule: PricingRule) => {
    let updatedRules;
    const isEditing = editorState.rule || savedRule.id;

    if (isEditing) {
      const originalRule = rules.find(r => r.id === savedRule.id)!;
      logActivity('Update', savedRule, generateChangeDetails(originalRule, savedRule));
      updatedRules = rules.map(r => r.id === savedRule.id ? savedRule : r);
    } else {
      const newRule: PricingRule = { 
        ...savedRule, 
        id: `rule_${Date.now()}`,
        priority: 0, // Will be recalculated
        status: RuleStatus.Enabled,
        lifecycle: RuleLifecycle.Upcoming
      };
      logActivity('Create', newRule, `Rule "${newRule.name}" created.`);
      updatedRules = [...rules, newRule];
    }
    
    const sorted = sortRules(updatedRules);
    setRules(sorted.map((rule, index) => ({...rule, priority: index + 1})));
    handleCloseEditor();
  };

  const handleDeleteRule = (ruleId: string) => {
    const ruleToDelete = rules.find(r => r.id === ruleId);
    if (ruleToDelete) {
        logActivity('Delete', ruleToDelete, `Rule "${ruleToDelete.name}" deleted.`);
        const updatedRules = rules.filter(r => r.id !== ruleId);
        const sorted = sortRules(updatedRules);
        setRules(sorted.map((rule, index) => ({ ...rule, priority: index + 1 })));
    }
  };
  
  const handleToggleStatus = (ruleId: string) => {
    const ruleToToggle = rules.find(r => r.id === ruleId);
    if(ruleToToggle) {
        const newStatus = ruleToToggle.status === RuleStatus.Enabled ? RuleStatus.Disabled : RuleStatus.Enabled;
        logActivity('Toggle Status', ruleToToggle, `Status changed to ${newStatus}.`);
        setRules(rules.map(r => r.id === ruleId ? {...r, status: newStatus} : r));
    }
  };

  const sortedRules = useMemo(() => sortRules(rules), [rules]);

  const filteredRules = useMemo(() =>
    sortedRules.filter(rule =>
      rule.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [sortedRules, searchTerm]
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 text-gray-800">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900">Rental Pricing Rule Management</h1>
            <p className="text-sm text-gray-500 mt-1">Rules are prioritized by level (Exclusion > Inclusion > General), then by order. Drag to reorder within a level.</p>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-transparent">
             <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex justify-between items-center space-x-4">
                   <div className="relative w-full max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by rule name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setIsLogVisible(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <History className="-ml-1 mr-2 h-5 w-5" />
                        Activity Log
                    </button>
                    <button
                        onClick={handleAddNewRule}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                        Add New Rule
                    </button>
                  </div>
                </div>
            </div>
            <PricingRuleList 
              rules={filteredRules} 
              moveRule={moveRule} 
              onEditDetails={handleEditDetails}
              onEditRate={handleEditRate}
              onDelete={handleDeleteRule}
              onToggleStatus={handleToggleStatus}
            />
          </div>
        </main>

        {editorState.mode === 'details' && (
          <RuleDetailsEditor
            rule={editorState.rule}
            onSave={handleSaveRule}
            onClose={handleCloseEditor}
            allStores={mockStores}
            allChannels={mockChannels}
          />
        )}

        {editorState.mode === 'rate' && editorState.rule && (
          <RateEditor
            rule={editorState.rule}
            onSave={handleSaveRule}
            onClose={handleCloseEditor}
            allCarModels={mockCarModels}
          />
        )}
        
        <ActivityLogModal 
            isOpen={isLogVisible}
            onClose={() => setIsLogVisible(false)}
            logs={activityLog}
        />

      </div>
    </DndProvider>
  );
};

export default App;
