// src/components/MealModal.tsx
'use client';

import { Dispatch, SetStateAction, useState } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mealType: '朝食' | '昼食' | '夕食' | '間食', foodInput: string) => void;
};

export default function MealModal({ isOpen, onClose, onSubmit }: Props) {
  const [mealType, setMealType] = useState<'朝食'|'昼食'|'夕食'|'間食'>('朝食');
  const [foodInput, setFoodInput] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 max-w-md p-6 rounded shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
        <h3 className="text-lg font-bold mb-4">食事記録</h3>

        {/* 食事タイプ選択 */}
        <div className="mb-4 flex justify-between">
          {(['朝食','昼食','夕食','間食']as const).map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className={`px-2 py-1 rounded ${
                mealType === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* 食品入力欄 */}
        <div className="mb-4">
          <label className="block text-sm mb-1">食品名</label>
          <input
            type="text"
            value={foodInput}
            onChange={(e) => setFoodInput(e.target.value)}
            placeholder="食品名を入力 or 選択"
            className="w-full border p-2 rounded"
          />
        </div>

        {/* 送信ボタン */}
        <button
          onClick={() => {
            onSubmit(mealType, foodInput);
            setFoodInput('');
          }}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          送信
        </button>
      </div>
    </div>
  );
}
