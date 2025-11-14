
import React, { useState, useEffect } from 'react';
import { PricingRule, CarModelPrice, CarModel } from '../types';
import { X } from 'lucide-react';

interface RateEditorProps {
  rule: PricingRule;
  onSave: (rule: PricingRule) => void;
  onClose: () => void;
  allCarModels: CarModel[];
}

const RateEditor: React.FC<RateEditorProps> = ({ rule, onSave, onClose, allCarModels }) => {
  const [editedPricing, setEditedPricing] = useState<CarModelPrice[]>([]);

  useEffect(() => {
    // Deep copy pricing to avoid mutating the original state
    setEditedPricing(JSON.parse(JSON.stringify(rule.pricing)));
  }, [rule]);

  const handleSave = () => {
    onSave({ ...rule, pricing: editedPricing });
  };

  const handlePriceChange = (sippCode: string, from: number, to: number, newPrice: string) => {
    const updatedPricing = [...editedPricing];
    let carModelPricing = updatedPricing.find(p => p.sippCode === sippCode);
    
    if (!carModelPricing) {
        carModelPricing = { sippCode, prices: [] };
        updatedPricing.push(carModelPricing);
    }

    let durationPrice = carModelPricing.prices.find(p => p.from === from && p.to === to);
    if(durationPrice) {
        durationPrice.price = parseFloat(newPrice) || 0;
    } else {
        carModelPricing.prices.push({ from, to, price: parseFloat(newPrice) || 0 });
    }
    setEditedPricing(updatedPricing);
  };
  
  const getPrice = (sippCode: string, from: number, to: number) => {
    return editedPricing.find(p => p.sippCode === sippCode)?.prices.find(dp => dp.from === from && dp.to === to)?.price ?? '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Edit Rates</h2>
            <p className="text-sm text-gray-500">{rule.name}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600">
            <X size={24} />
          </button>
        </header>

        <main className="flex-grow p-6 overflow-y-auto">
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                      <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-100 z-10">Car Model</th>
                          {rule.conditions.rentalDurationBrackets.map((bracket, index) => (
                              <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {bracket.from === bracket.to ? `${bracket.from} Day${bracket.from > 1 ? 's': ''}` : `${bracket.from}-${bracket.to} Days`}
                              </th>
                          ))}
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {allCarModels.map(car => (
                          <tr key={car.sippCode} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white hover:bg-gray-50">
                                  <div className="text-sm font-medium text-gray-900">{car.name}</div>
                                  <div className="text-xs text-gray-500">{car.sippCode} ({car.group})</div>
                              </td>
                              {rule.conditions.rentalDurationBrackets.map((d, index) => (
                                  <td key={`${car.sippCode}-${index}`} className="px-6 py-4 whitespace-nowrap">
                                      <div className="relative">
                                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">$</span>
                                          <input
                                              type="number"
                                              className="pl-7 pr-2 py-1 w-24 block shadow-sm sm:text-sm border-gray-300 rounded-md"
                                              placeholder="0.00"
                                              value={getPrice(car.sippCode, d.from, d.to)}
                                              onChange={(e) => handlePriceChange(car.sippCode, d.from, d.to, e.target.value)}
                                          />
                                      </div>
                                  </td>
                              ))}
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
        </main>
        
        <footer className="flex justify-end p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <button onClick={onClose} className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">Save Rates</button>
        </footer>
      </div>
    </div>
  );
};

export default RateEditor;
