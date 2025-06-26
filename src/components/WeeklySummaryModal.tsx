'use client';

import { useState } from 'react';

export type WeeklySummaryData = {
  startLabel: string;
  endLabel: string;
  weightDiffText: string;
  weightDays: number;
  goal1: number;
  goal2: number;
  goal3: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
  data: WeeklySummaryData;
};

export default function WeeklySummaryModal({ isOpen, onClose, onSubmit, data }: Props) {
  const [comment, setComment] = useState('');

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 max-w-md p-6 rounded shadow-lg relative space-y-4 text-sm">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
        <p className="font-bold">
          📅 今週のサマリー（{data.startLabel}〜{data.endLabel}）
        </p>
        <div>
          <h3 className="font-semibold">🥗 食事</h3>
          <p>・平均摂取カロリー：1,850 kcal / 2,000 kcal（目標）</p>
          <p>・食事記録日数：5 / 7日</p>
        </div>
        <div>
          <h3 className="font-semibold">🏃‍♂️ 運動</h3>
          <p>・運動消費カロリー：1,200 kcal（合計）</p>
          <p>・平均運動時間：32分 / 日</p>
          <p>・運動実施日数：4 / 7日</p>
        </div>
        <div>
          <h3 className="font-semibold">⚖️ 体重</h3>
          <p>・体重減少量：{data.weightDiffText}</p>
          <p>・体重記録日数：{data.weightDays} / 7日</p>
        </div>
        <div>
          <h3 className="font-semibold">🌟 チャレンジ達成状況</h3>
          <p>・目標1：{data.goal1} / 7日</p>
          <p>・目標2：{data.goal2} / 7日</p>
          <p>・目標3：{data.goal3} / 7日</p>
        </div>
        <div>
          <h3 className="font-semibold mb-1">📝 今週の総評</h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full border p-2 rounded"
          />
        </div>
        <button
          onClick={() => {
            onSubmit(comment);
            setComment('');
          }}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          送信
        </button>
      </div>
    </div>
  );
}