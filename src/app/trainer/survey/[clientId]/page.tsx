"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase";

export default function SurveyResultPage({ params }: { params: { clientId: string } }) {
  const { clientId } = params;
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }
      const ref = doc(db, "users", clientId, "surveys", "initial");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setData(snap.data());
        if (!snap.data().trainerViewed) {
          await updateDoc(ref, { trainerViewed: true });
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, [auth, db, router, clientId]);

  if (loading) return <p>読み込み中…</p>;
  if (!data) return <p>回答がありません。</p>;

  const awareness = Array.isArray(data.mealAwareness) ? data.mealAwareness.join("、") : "";

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow space-y-2">
      <button onClick={() => router.back()} className="text-blue-600 underline mb-2">
        戻る
      </button>
      <h1 className="text-xl font-bold mb-4">アンケート結果</h1>
      <div>
        <h2 className="font-semibold">🍽 食習慣</h2>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>朝食を食べる頻度: {data.breakfast}</li>
          <li>1日の食事回数: {data.mealsPerDay}</li>
          <li>間食をとる頻度: {data.snacks}</li>
          <li>甘い飲み物を飲む頻度: {data.sweetDrink}</li>
          <li>外食やコンビニ食の利用頻度: {data.eatingOut}</li>
          <li>食べすぎたと感じる日: {data.overeating}</li>
          <li>食事の時間は決まっている?: {data.mealTimeFixed}</li>
          <li>食事の際に意識していること: {awareness}</li>
        </ul>
      </div>
      <div>
        <h2 className="font-semibold mt-4">🏃‍♂️ 運動習慣</h2>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>週の運動日数: {data.exerciseDays}</li>
          <li>主な運動内容: {data.mainActivity}</li>
          <li>1回の運動時間: {data.exerciseTime}</li>
          <li>運動後の栄養摂取: {data.postWorkout}</li>
          <li>最近しんどい?: {data.tired}</li>
          <li>平均睡眠時間: {data.sleep}</li>
        </ul>
      </div>
      {(data.concerns || data.goal) && (
        <div>
          <h2 className="font-semibold mt-4">✍️ その他</h2>
          {data.concerns && <p className="text-sm">悩み: {data.concerns}</p>}
          {data.goal && <p className="text-sm">目標: {data.goal}</p>}
        </div>
      )}
    </div>
  );
}
