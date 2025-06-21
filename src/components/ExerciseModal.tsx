'use client';

import { useState } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (exerciseName: string, detail: string) => void;
};

export default function ExerciseModal({ isOpen, onClose, onSubmit }: Props) {
  const [exerciseName, setExerciseName] = useState('');
  const [detail, setDetail] = useState('');

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
        <h3 className="text-lg font-bold mb-4">運動記録</h3>

        <div className="mb-3">
          <label className="block text-sm mb-1">種目</label>
          <input
            type="text"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm mb-1">内容（時間・距離など）</label>
          <input
            type="text"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          onClick={() => {
            onSubmit(exerciseName, detail);
            setExerciseName('');
            setDetail('');
          }}
          className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700"
        >
          送信
        </button>
      </div>
    </div>
  );
}
