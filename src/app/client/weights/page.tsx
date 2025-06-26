'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';

interface WeightData {
  date: string;
  weight: number;
}

export default function WeightGraphPage() {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [allWeights, setAllWeights] = useState<WeightData[]>([]);
  const [range, setRange] = useState<'week' | 'month' | 'year' | 'custom'>('week');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push('/login');
        return;
      }
      setUser(u);
      const snap = await getDocs(collection(db, 'users', u.uid, 'weights'));
      const data: WeightData[] = snap.docs.map((d) => ({
        date: d.id,
        weight: d.data().weight as number,
      }));
      data.sort((a, b) => a.date.localeCompare(b.date));
      setAllWeights(data);
      setLoading(false);
    });
    return () => unsub();
  }, [auth, db, router]);

  const parseDate = (s: string) => new Date(s).getTime();

  const filteredWeights = (() => {
    if (allWeights.length === 0) return [] as WeightData[];

    let sDate: Date;
    let eDate: Date;

    if (range === 'custom' && start && end) {
      sDate = new Date(start);
      eDate = new Date(end);
    } else {
      eDate = new Date();
      if (range === 'week') sDate = new Date(eDate.getTime() - 6 * 86400000);
      else if (range === 'month') sDate = new Date(eDate.getTime() - 29 * 86400000);
      else sDate = new Date(eDate.getTime() - 365 * 86400000);
    }

    const s = sDate.toISOString().split('T')[0];
    const e = eDate.toISOString().split('T')[0];
    return allWeights.filter((w) => w.date >= s && w.date <= e);
  })();

  const renderGraph = (data: WeightData[]) => {
    if (data.length < 2) return <p className="text-center">データが不足しています</p>;

    const width = 300;
    const height = 150;
    const startMs = parseDate(data[0].date);
    const endMs = parseDate(data[data.length - 1].date);
    const total = endMs - startMs || 1;
    const minW = Math.min(...data.map((d) => d.weight));
    const maxW = Math.max(...data.map((d) => d.weight));
    const rangeW = maxW - minW || 1;
    const points = data
      .map((d) => {
        const x = ((parseDate(d.date) - startMs) / total) * width;
        const y = height - ((d.weight - minW) / rangeW) * height;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
        <polyline fill="none" stroke="blue" strokeWidth="2" points={points} />
      </svg>
    );
  };

  if (loading) return <p>読み込み中…</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <button onClick={() => router.back()} className="text-blue-600 underline mb-4">
        戻る
      </button>
      <h1 className="text-xl font-bold mb-4">体重推移</h1>
      <div className="mb-4">
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as any)}
          className="border p-2 rounded w-full"
        >
          <option value="week">直近1週間</option>
          <option value="month">直近1ヶ月</option>
          <option value="year">直近1年</option>
          <option value="custom">期間指定</option>
        </select>
      </div>
      {range === 'custom' && (
        <div className="flex space-x-2 mb-4">
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
      )}
      {renderGraph(filteredWeights)}
    </div>
  );
}