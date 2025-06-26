"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase";

export default function ClientDashboard() {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [trainerId, setTrainer] = useState<string>("");
  const [inputId, setInputId] = useState<string>("");

  // 認証＆trainerId取得
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }
      setUser(u);
      const snap = await getDoc(doc(db, "users", u.uid));
      if (snap.exists()) {
        setTrainer(snap.data().trainerId || "");
      }
      setLoading(false);
    });
    return () => unsub();
  }, [auth, db, router]);

  // 担当トレーナー設定
  const assignTrainer = async () => {
    if (!user || !inputId.trim()) return;
    await setDoc(
      doc(db, "users", user.uid),
      { trainerId: inputId.trim() },
      { merge: true }
    );
    setTrainer(inputId.trim());
    setInputId("");
  };

  if (loading) return <p>読み込み中…</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">クライアントダッシュボード</h1>

      {trainerId ? (
        <>
          <p className="mb-4">
            担当トレーナーID: <span className="font-medium">{trainerId}</span>
          </p>
          <Link
            href={`/chat?trainerId=${trainerId}`}
            className="block bg-green-500 text-white py-2 rounded hover:bg-green-600 text-center"
          >
            チャットを開く
          </Link>
        </>
      ) : (
        <>
          <p className="mb-2">担当トレーナーIDを入力してください：</p>
          <div className="flex space-x-2">
            <input
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder="トレーナーのUID"
              className="flex-1 border p-2 rounded"
            />
            <button
              onClick={assignTrainer}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              設定
            </button>
          </div>
        </>
      )}
      <Link
        href="/client/history"
        className="block mt-4 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 text-center"
      >
        過去データ確認
      </Link>
    </div>
  );
}
