import React from 'react';
import type { FaqItem as FaqItemType } from '../types';
import FaqItem from './FaqItem';

interface FaqListProps {
  faqs: FaqItemType[];
}

const FaqList: React.FC<FaqListProps> = ({ faqs }) => {
  return (
    <div className="space-y-2 absolute inset-0 overflow-y-auto pr-2">
      {faqs.map((faq, index) => (
        <FaqItem key={index} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  );
};

export default FaqList;
