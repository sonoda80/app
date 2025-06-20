'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';

export default function RootPage() {
  const router = useRouter();
  const auth   = getAuth(firebaseApp);
  const db     = getFirestore(firebaseApp);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase 認証状態を監視
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        // 未ログインなら /login へ
        router.replace('/login');
      } else {
        // ログイン済み → users/{uid} から role を取得
        const snap = await getDoc(doc(db, 'users', user.uid));
        const role = snap.exists() ? snap.data().role : null;

        if (role === 'trainer') {
          router.replace('/trainer');
        } else {
          // client または role 不明なら client ダッシュボード
          router.replace('/client');
        }
      }
    });

    return () => unsub();
  }, [auth, db, router]);

  // 認証状態がまだ確定しない間はローディングを表示
  if (loading) {
    return <div className="h-screen flex items-center justify-center">読み込み中…</div>;
  }

  // ここにはもうほぼ到達しない
  return null;
}
