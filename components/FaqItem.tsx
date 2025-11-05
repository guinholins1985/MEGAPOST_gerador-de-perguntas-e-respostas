
import React, { useState } from 'react';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface FaqItemProps {
  question: string;
  answer: string;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-700 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-3 px-2 text-left text-slate-200 hover:bg-slate-800/50 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
        <span className="font-medium">{question}</span>
        <ChevronDownIcon className={`w-5 h-5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className="pt-1 pb-4 px-2 text-slate-400">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FaqItem;
