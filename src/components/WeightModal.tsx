'use client';

import { useState } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (weight: number) => void;
};

export default function WeightModal({ isOpen, onClose, onSubmit }: Props) {
  const [inputWeight, setInputWeight] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 max-w-sm p-6 rounded shadow relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
        <h3 className="text-lg font-bold mb-4">体重記録</h3>
        <input
          type="number"
          step="0.1"
          value={inputWeight}
          onChange={(e) => setInputWeight(e.target.value)}
          placeholder="例：68.3"
          className="w-full border p-2 rounded mb-4"
        />
        <button
          onClick={() => {
            const weightValue = parseFloat(inputWeight);
            if (!isNaN(weightValue)) onSubmit(weightValue);
            setInputWeight('');
          }}
          className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700"
        >
          送信
        </button>
      </div>
    </div>
  );
}
