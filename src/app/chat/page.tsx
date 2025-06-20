// src/app/chat/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getFirestore, collection, addDoc,
  onSnapshot, query, orderBy, where
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';

const db   = getFirestore(firebaseApp);
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
  const trainerId    = searchParams.get('trainerId') || '';
  const user         = auth.currentUser;

  const [text, setText] = useState('');
  const [msgs, setMsgs] = useState<Message[]>([]);

  // ① 該当1対1メッセージのみをリアルタイム取得
  useEffect(() => {
    if (!user || !trainerId) return;
    const q = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', user.uid),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setMsgs(
        snap.docs
          .map((d) => ({
            id: d.id,
            text: d.data().text,
            createdAt: d.data().createdAt?.toDate() ?? new Date(),
            userEmail: d.data().userEmail,
            userId:    d.data().userId,
            peerId:    d.data().peerId,
          }))
          .filter(
            (m) =>
              (m.userId === user.uid && m.peerId === trainerId) ||
              (m.userId === trainerId && m.peerId === user.uid)
          )
      );
    });
    return () => unsub();
  }, [user, trainerId]);

  // ② 送信時に participants と peerId をセット
  const handleSend = async () => {
    if (!text.trim() || !user || !trainerId) return;
    await addDoc(collection(db, 'messages'), {
      text,
      createdAt: new Date(),
      userId:    user.uid,
      userEmail: user.email,
      peerId:    trainerId,
      // 「この2人のチャットですよ」とわかる配列
      participants: [user.uid, trainerId],
    });
    setText('');
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">チャット</h2>
      <div className="mb-4 h-60 overflow-y-auto space-y-2">
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
