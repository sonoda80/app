'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';

type Client = {
  uid: string;
  email: string;
  groupId?: string;
};

export default function TrainerDashboard() {
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  const [user, setUser] = useState<User | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. 認証チェック＆クライアント一覧の購読
  useEffect(() => {
    // 認証状態を監視
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push('/login');
        return;
      }
      setUser(u);

      // 自分が担当のクライアントだけを取得
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'client'),
        where('trainerId', '==', u.uid)
      );
      const unsubClients = onSnapshot(q, (snap) => {
        const list: Client[] = snap.docs.map((doc) => ({
          uid: doc.id,
          email: doc.data().email,
          groupId: doc.data().groupId, // 必要なら
        }));
        setClients(list);
        setLoading(false);
      });

      // クリーンアップ
      return () => {
        unsubClients();
        unsubAuth();
      };
    });
  }, [auth, db, router]);

  if (loading) return <p>読み込み中…</p>;
  if (!user) return null; // onAuthStateChanged でリダイレクト済み

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">トレーナーダッシュボード</h1>

      {clients.length === 0 ? (
        <p>担当クライアントがまだいません。</p>
      ) : (
        <div className="space-y-4">
          {/*
            もしグループ分けをしているなら、
            .reduce() で groupId ごとに分けて表示するとGOOD
          */}
          {clients.map((c) => (
            <div
              key={c.uid}
              className="flex items-center justify-between p-4 bg-gray-50 rounded"
            >
              <div>
                <p className="font-semibold">{c.email}</p>
                {c.groupId && (
                  <p className="text-sm text-gray-500">グループ：{c.groupId}</p>
                )}
              </div>
              {/* クライアントIDを trainerId パラメータに渡す */}
              <Link
                href={`/chat?trainerId=${c.uid}`}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                チャットを開く
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
