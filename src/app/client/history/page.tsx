'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc
} from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';

type CalendarProps = {
  month: string; // YYYY-MM
  selected: string; // YYYY-MM-DD
  onSelect: (date: string) => void;
  onMonthChange: (month: string) => void;
};

function Calendar({ month, selected, onSelect, onMonthChange }: CalendarProps) {
  const [year, mon] = month.split('-').map((v) => parseInt(v, 10));
  const first = new Date(year, mon - 1, 1);
  const daysInMonth = new Date(year, mon, 0).getDate();
  const firstDay = first.getDay();

  const prevMonth = () => {
    const d = new Date(year, mon - 2, 1);
    onMonthChange(d.toISOString().slice(0, 7));
  };
  const nextMonth = () => {
    const d = new Date(year, mon, 1);
    onMonthChange(d.toISOString().slice(0, 7));
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <button onClick={prevMonth} className="px-2">«</button>
        <span className="font-semibold">
          {year}年 {mon}月
        </span>
        <button onClick={nextMonth} className="px-2">»</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['日','月','火','水','木','金','土'].map((d) => (
          <div key={d} className="font-bold">
            {d}
          </div>
        ))}
        {days.map((d, idx) => {
          if (!d) return <div key={idx}></div>;
          const dateStr = `${year}-${String(mon).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          const isSel = selected === dateStr;
          return (
            <button
              key={idx}
              onClick={() => onSelect(dateStr)}
              className={
                'p-1 rounded ' + (isSel ? 'bg-blue-500 text-white' : 'hover:bg-gray-200')
              }
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().split('T')[0]
  );
  const [displayMonth, setDisplayMonth] = useState(
    today.toISOString().slice(0, 7)
  ); // YYYY-MM
  const [weight, setWeight] = useState<number | null>(null);
  const [meals, setMeals] = useState<Record<string, string>>({});
  const [exercises, setExercises] = useState<Record<string, string>>({});
  const [challenges, setChallenges] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push('/login');
        return;
      }
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, [auth, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const weightSnap = await getDoc(
        doc(db, 'users', user.uid, 'weights', selectedDate)
      );
      setWeight(weightSnap.exists() ? weightSnap.data().weight : null);

      const mealSnap = await getDoc(
        doc(db, 'users', user.uid, 'meals', selectedDate)
      );
      setMeals(mealSnap.exists() ? (mealSnap.data() as Record<string, string>) : {});

      const exerciseSnap = await getDoc(
        doc(db, 'users', user.uid, 'exercises', selectedDate)
      );
      setExercises(
        exerciseSnap.exists()
          ? (exerciseSnap.data() as Record<string, string>)
          : {}
      );

      const challengeSnap = await getDoc(
        doc(db, 'users', user.uid, 'challenges', selectedDate)
      );
      setChallenges(
        challengeSnap.exists()
          ? (challengeSnap.data() as Record<string, string>)
          : {}
      );
    };

    fetchData();
  }, [user, selectedDate, db]);

  if (loading) return <p>読み込み中…</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <button
        onClick={() => router.back()}
        className="text-blue-600 underline mb-4"
      >
        戻る
      </button>
      <h1 className="text-xl font-bold mb-4">過去データ確認</h1>
      <Calendar
        month={displayMonth}
        selected={selectedDate}
        onSelect={(d) => {
          setSelectedDate(d);
          setDisplayMonth(d.slice(0, 7));
        }}
        onMonthChange={setDisplayMonth}
      />
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">体重</h2>
          <p>{weight !== null ? `${weight}kg` : '記録なし'}</p>
        </div>
        <div>
          <h2 className="font-semibold">食事</h2>
          {Object.keys(meals).length > 0 ? (
            <ul className="list-disc pl-5">
              {Object.entries(meals).map(([k, v]) =>
                k !== 'updatedAt' && v ? (
                  <li key={k}>{k}：{v}</li>
                ) : null
              )}
            </ul>
          ) : (
            <p>記録なし</p>
          )}
        </div>
        <div>
          <h2 className="font-semibold">運動</h2>
          {Object.keys(exercises).length > 0 ? (
            <ul className="list-disc pl-5">
              {Object.entries(exercises).map(([k, v]) =>
                k !== 'updatedAt' && v ? (
                  <li key={k}>{k}：{v}</li>
                ) : null
              )}
            </ul>
          ) : (
            <p>記録なし</p>
          )}
        </div>
        <div>
          <h2 className="font-semibold">チャレンジ</h2>
          {Object.keys(challenges).length > 0 ? (
            <ul className="list-disc pl-5">
              {Object.entries(challenges).map(([k, v]) =>
                k !== 'updatedAt' && v ? (
                  <li key={k}>{k}：{v}</li>
                ) : null
              )}
            </ul>
          ) : (
            <p>記録なし</p>
          )}
        </div>
      </div>
    </div>
  );
}