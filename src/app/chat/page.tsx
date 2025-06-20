'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import {
  getAuth,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

type Message = {
  id: string;
  text: string;
  createdAt: Date;
  userEmail?: string;
  userId?: string;
  peerId?: string;
};

export default function ChatPage() {
  const searchParams = useSearchParams();
  const trainerId = searchParams.get('trainerId') || '';

  const [user, setUser] = useState<User | null>(null);
  const [text, setText] = useState('');
  const [msgs, setMsgs] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ログイン中のユーザーを取得
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // メッセージのリアルタイム取得
  useEffect(() => {
    if (!user || !trainerId) return;

    const q = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', user.uid),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const filtered = snap.docs
        .map((doc) => ({
          id: doc.id,
          text: doc.data().text,
          createdAt: doc.data().createdAt?.toDate() ?? new Date(),
          userEmail: doc.data().userEmail,
          userId: doc.data().userId,
          peerId: doc.data().peerId,
        }))
        .filter(
          (m) =>
            (m.userId === user.uid && m.peerId === trainerId) ||
            (m.userId === trainerId && m.peerId === user.uid)
        );

      setMsgs(filtered);
    });

    return () => unsubscribe();
  }, [user, trainerId]);

  // メッセージ送信（送信後にスクロール）
  const handleSend = async () => {
    if (!text.trim() || !user || !trainerId) return;

    await addDoc(collection(db, 'messages'), {
      text,
      createdAt: new Date(),
      userId: user.uid,
      userEmail: user.email ?? '',
      peerId: trainerId,
      participants: [user.uid, trainerId],
    });

    setText('');

    // 自分の送信時だけスクロール
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">チャット</h2>

      <div className="mb-4 h-60 overflow-y-auto space-y-2 bg-gray-50 p-2 rounded">
        {msgs.map((m) => {
          const isMe = m.userId === user?.uid;
          return (
            <div
              key={m.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-lg ${
                  isMe
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                <div className="text-xs mb-1 opacity-75">{m.userEmail}</div>
                <div>{m.text}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex space-x-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="メッセージを入力"
          className="flex-1 border p-2 rounded"
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          送信
        </button>
      </div>
    </div>
  );
}
