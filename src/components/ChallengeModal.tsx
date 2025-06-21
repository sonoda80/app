// src/components/ChallengeModal.tsx
'use client';

import { useState } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (statuses: { [key: string]: '○' | '×' }) => void;
};

export default function ChallengeModal({ isOpen, onClose, onSubmit }: Props) {
  // まずは３つの目標ステータスだけ管理
  const [sts1, setSts1] = useState<'○' | '×'>('×');
  const [sts2, setSts2] = useState<'○' | '×'>('×');
  const [sts3, setSts3] = useState<'○' | '×'>('×');

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
        <h3 className="text-lg font-bold mb-4">本日のチャレンジ</h3>

        {/* 目標設定（今は文字だけ） */}
        <p className="mb-4 text-sm text-gray-600">目標設定</p>

        {/* 目標１ */}
        <div className="flex items-center justify-between mb-3">
          <span>目標１：（内容）</span>
          <div>
            <button
              onClick={() => setSts1('○')}
              className={`px-2 ${sts1==='○' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            >○</button>
            <button
              onClick={() => setSts1('×')}
              className={`px-2 ${sts1==='×' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
            >×</button>
          </div>
        </div>

        {/* 目標２ */}
        <div className="flex items-center justify-between mb-3">
          <span>目標２：（内容）</span>
          <div>
            <button
              onClick={() => setSts2('○')}
              className={`px-2 ${sts2==='○' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            >○</button>
            <button
              onClick={() => setSts2('×')}
              className={`px-2 ${sts2==='×' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
            >×</button>
          </div>
        </div>

        {/* 目標３ */}
        <div className="flex items-center justify-between mb-6">
          <span>目標３：（内容）</span>
          <div>
            <button
              onClick={() => setSts3('○')}
              className={`px-2 ${sts3==='○' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            >○</button>
            <button
              onClick={() => setSts3('×')}
              className={`px-2 ${sts3==='×' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
            >×</button>
          </div>
        </div>

        <button
          onClick={() => {
            onSubmit({ '目標１': sts1, '目標２': sts2, '目標３': sts3 });
            onClose();
          }}
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
        >
          送信
        </button>
      </div>
    </div>
  );
}
