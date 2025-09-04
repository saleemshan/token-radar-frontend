import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';

const SafetyMetric = ({
  name,
  pass,
  tooltip,
  value,
}: {
  name: string;
  pass: boolean;
  tooltip: string;
  value: string;
}) => {
  return (
    <div className="border-border border p-3 rounded-lg flex relative items-center gap-2 overflow-hidden">
      <div
        className={`absolute inset-y-0 left-0  w-1 ${
          pass ? 'bg-positive' : 'bg-negative'
        }`}
      ></div>
      <FaInfoCircle title={tooltip} />

      <div className=" font-semibold">{name}</div>
      <div className="min-w-8 max-w-8 ml-auto font-semibold">{value}</div>
    </div>
  );
};

export default SafetyMetric;
