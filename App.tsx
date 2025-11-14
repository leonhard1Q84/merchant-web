
import React, { useState, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { PricingRule, RuleStatus, RuleLifecycle } from './types';
import { mockRules, mockStores, mockChannels, mockCarModels, mockRuleTemplate } from './data/mockData';
import PricingRuleList from './components/PricingRuleList';
import RuleDetailsEditor from './components/RuleDetailsEditor';
import RateEditor from './components/RateEditor';
import { PlusCircle, Search } from 'lucide-react';

const App: React.FC = () => {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [editorState, setEditorState] = useState<{ mode: 'closed' | 'details' | 'rate', rule: PricingRule | null }>({ mode: 'closed', rule: null });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate fetching data
    setRules(mockRules.sort((a, b) => a.priority - b.priority));
  }, []);

  const moveRule = useCallback((dragIndex: number, hoverIndex: number) => {
    setRules(prevRules => {
      const newRules = [...prevRules];
      const [draggedRule] = newRules.splice(dragIndex, 1);
      newRules.splice(hoverIndex, 0, draggedRule);
      // Update priorities based on new order
      return newRules.map((rule, index) => ({ ...rule, priority: index + 1 }));
    });
  }, []);

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
    if (editorState.rule || savedRule.id) { // Editing existing rule
      setRules(rules.map(r => r.id === (savedRule.id || editorState.rule?.id) ? savedRule : r));
    } else { // Adding new rule
      const newRule: PricingRule = { 
        ...savedRule, 
        id: `rule_${Date.now()}`,
        priority: rules.length + 1,
        status: RuleStatus.Enabled,
        lifecycle: RuleLifecycle.Upcoming
      };
      setRules([...rules, newRule]);
    }
    handleCloseEditor();
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(rules.filter(r => r.id !== ruleId));
  };
  
  const handleToggleStatus = (ruleId: string) => {
    setRules(rules.map(r => r.id === ruleId 
      ? {...r, status: r.status === RuleStatus.Enabled ? RuleStatus.Disabled : RuleStatus.Enabled} 
      : r
    ));
  };

  const filteredRules = rules.filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 text-gray-800">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900">Rental Pricing Rule Management</h1>
            <p className="text-sm text-gray-500 mt-1">Drag and drop rules to change their priority. Higher on the list means higher priority.</p>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
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
              <button
                onClick={handleAddNewRule}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                Add New Rule
              </button>
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
      </div>
    </DndProvider>
  );
};

export default App;
