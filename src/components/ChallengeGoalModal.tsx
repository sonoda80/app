'use client';

import { useState, useEffect } from 'react';

export type ChallengeGoals = {
  goal1: string;
  goal2: string;
  goal3: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goals: ChallengeGoals) => void;
  initialGoals: ChallengeGoals;
};

export default function ChallengeGoalModal({
  isOpen,
  onClose,
  onSubmit,
  initialGoals,
}: Props) {
  const [goal1, setGoal1] = useState('');
  const [goal2, setGoal2] = useState('');
  const [goal3, setGoal3] = useState('');

  useEffect(() => {
    if (isOpen) {
      setGoal1(initialGoals.goal1 || '');
      setGoal2(initialGoals.goal2 || '');
      setGoal3(initialGoals.goal3 || '');
    }
  }, [isOpen, initialGoals]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 max-w-sm p-6 rounded shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
        <h3 className="text-lg font-bold mb-4">チャレンジ目標設定</h3>
        <div className="space-y-3">
          <div>
            <label className="block mb-1">目標１</label>
            <input
              value={goal1}
              onChange={(e) => setGoal1(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">目標２</label>
            <input
              value={goal2}
              onChange={(e) => setGoal2(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">目標３</label>
            <input
              value={goal3}
              onChange={(e) => setGoal3(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <button
            onClick={() => {
              onSubmit({ goal1, goal2, goal3 });
              onClose();
            }}
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
          >
            目標を設定する
          </button>
        </div>
      </div>
    </div>
  );
}