
import React, { useRef } from 'react';
import type { Identifier, XYCoord } from 'dnd-core';
import { useDrag, useDrop } from 'react-dnd';
import { PricingRule, RuleStatus, RuleLifecycle } from '../types';
import { GripVertical, ToggleLeft, ToggleRight, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface PricingRuleListItemProps {
  rule: PricingRule;
  index: number;
  moveRule: (dragIndex: number, hoverIndex: number) => void;
  onEditDetails: (rule: PricingRule) => void;
  onEditRate: (rule: PricingRule) => void;
  onDelete: (ruleId: string) => void;
  onToggleStatus: (ruleId: string) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const ItemTypes = {
  RULE: 'rule',
};

const Tag: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = 'bg-gray-200 text-gray-700' }) => (
  <span className={`inline-block text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${className}`}>
    {children}
  </span>
);

const PricingRuleListItem: React.FC<PricingRuleListItemProps> = ({ rule, index, moveRule, onEditDetails, onEditRate, onDelete, onToggleStatus }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: ItemTypes.RULE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveRule(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.RULE,
    item: () => ({ id: rule.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  const statusConfig = {
    [RuleStatus.Enabled]: { text: 'Enabled', color: 'bg-green-100 text-green-800' },
    [RuleStatus.Disabled]: { text: 'Disabled', color: 'bg-red-100 text-red-800' },
  };
  
  const lifecycleConfig = {
    [RuleLifecycle.Active]: { text: 'Active', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="h-4 w-4 mr-1"/> },
    [RuleLifecycle.Upcoming]: { text: 'Upcoming', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4 mr-1"/>},
    [RuleLifecycle.Expired]: { text: 'Expired', color: 'bg-gray-200 text-gray-600', icon: <AlertTriangle className="h-4 w-4 mr-1"/>},
  };

  return (
    <div ref={preview} style={{ opacity }} data-handler-id={handlerId}>
      <div ref={ref} className="grid grid-cols-12 gap-4 items-center bg-white border border-gray-200 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="col-span-1 flex items-center">
          <div ref={drag} className="cursor-move text-gray-400 hover:text-gray-700 mr-4">
            <GripVertical size={20} />
          </div>
          <span className="text-lg font-bold text-indigo-600">{rule.priority}</span>
        </div>

        <div className="col-span-4">
          <p className="font-semibold text-gray-800">{rule.name}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {rule.conditions.applicableStores.length > 0 && <Tag>{rule.conditions.applicableStores.join(', ')}</Tag>}
            {rule.conditions.sourceChannels.length > 0 && <Tag className="bg-blue-100 text-blue-800">{rule.conditions.sourceChannels.join(', ')}</Tag>}
            {rule.conditions.customerOrigin && <Tag className="bg-purple-100 text-purple-800">{`${rule.conditions.customerOrigin.condition} ${rule.conditions.customerOrigin.countries.join(', ')}`}</Tag>}
          </div>
        </div>
        
        <div className="col-span-2 text-sm text-gray-600">
            {rule.conditions.rentalDateRange ? (
              <>
                <p>{format(rule.conditions.rentalDateRange.start, 'MMM d, yyyy')}</p>
                <p>to {format(rule.conditions.rentalDateRange.end, 'MMM d, yyyy')}</p>
              </>
            ) : <p>All time</p>}
        </div>

        <div className="col-span-2">
            <Tag className={statusConfig[rule.status].color}>{statusConfig[rule.status].text}</Tag>
             <Tag className={lifecycleConfig[rule.lifecycle].color}>
                <span className="flex items-center">{lifecycleConfig[rule.lifecycle].icon}{lifecycleConfig[rule.lifecycle].text}</span>
            </Tag>
        </div>

        <div className="col-span-3 flex justify-end items-center space-x-4 text-sm font-medium">
          <button onClick={() => onEditDetails(rule)} className="text-indigo-600 hover:text-indigo-900 transition-colors">
            Edit Details
          </button>
          <button onClick={() => onEditRate(rule)} className="text-indigo-600 hover:text-indigo-900 transition-colors">
            Edit Rate
          </button>
          <button onClick={() => onDelete(rule.id)} className="text-red-600 hover:text-red-900 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingRuleListItem;
