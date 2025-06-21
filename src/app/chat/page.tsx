"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";
import MealModal from "@/components/MealModal";
import ExerciseModal from "@/components/ExerciseModal";
import WeightModal from "@/components/WeightModal";
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
  const trainerId = searchParams.get("trainerId") || "";

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"client" | "trainer" | null>(null);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [mealModalOpen, setMealModalOpen] = useState(false);
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const handleMealSubmit = async (
    mealType: "朝食" | "昼食" | "夕食" | "間食",
    foodInput: string,
    photoFile: File | null
  ) => {
    if (!user || !trainerId) return;
    // 1) まずはメッセージ本文を組み立て
    const messageText = `${mealType}：${foodInput}`;

    // 2) （必要なら）写真を Storage にアップロードして URL を取得
    //    ここでは省略しますが、photoFile があるときは
    //    uploadBytes → getDownloadURL で photoUrl を取得, then:
    //    messageText += `\n📷: ${photoUrl}`;

    // 3) Firestore にメッセージとして投稿
    await addDoc(collection(db, "messages"), {
      text: messageText,
      createdAt: new Date(),
      userId: user.uid,
      userEmail: user.email ?? "",
      peerId: trainerId,
      participants: [user.uid, trainerId],
    });
    // 🔹 日付を "YYYY-MM-DD" 形式で取得
    const today = new Date().toISOString().split("T")[0];

    // 🔹 Firestoreの meals サブコレクションへ保存
    const mealDocRef = doc(db, "users", user.uid, "meals", today);
    const existing = await getDoc(mealDocRef);

    if (existing.exists()) {
      await updateDoc(mealDocRef, {
        [mealType]: foodInput,
      });
    } else {
      await setDoc(mealDocRef, {
        [mealType]: foodInput,
      });
    }
    // 4) モーダルを閉じてフォームクリア
    setMealModalOpen(false);

    // 5) 送信後にチャット最下部へスクロール
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // 運動送信処理
  const handleExerciseSubmit = async (exerciseName: string, detail: string) => {
    if (!user || !trainerId) return;

    const messageText = `🏃‍♂️運動記録\n種目：${exerciseName}\n内容：${detail}`;

    await addDoc(collection(db, "messages"), {
      text: messageText,
      createdAt: new Date(),
      userId: user.uid,
      userEmail: user.email ?? "",
      peerId: trainerId,
      participants: [user.uid, trainerId],
    });

    // Firestoreに運動記録としても保存（例：/users/{uid}/exercises/{日付}）
    const today = new Date().toISOString().split("T")[0]; // 例: 2025-06-21
    const exerciseDocRef = doc(db, "users", user.uid, "exercises", today);
    const existing = await getDoc(exerciseDocRef);

    if (existing.exists()) {
      await updateDoc(exerciseDocRef, {
        [exerciseName]: detail,
      });
    } else {
      await setDoc(exerciseDocRef, {
        [exerciseName]: detail,
      });
    }

    setExerciseModalOpen(false);
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  const handleWeightSubmit = async (weight: number) => {
    if (!user || !trainerId) return;

    const today = new Date().toISOString().split("T")[0];
    const weightText = `⚖️ ${today}の体重：${weight}kg`;

    // チャット投稿
    await addDoc(collection(db, "messages"), {
      text: weightText,
      createdAt: new Date(),
      userId: user.uid,
      userEmail: user.email ?? "",
      peerId: trainerId,
      participants: [user.uid, trainerId],
    });

    // Firestore 保存
    const weightRef = doc(db, "users", user.uid, "weights", today);
    await setDoc(weightRef, {
      weight,
    });

    setWeightModalOpen(false);
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // 認証されたユーザーを取得＋role取得
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, "users", u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setRole(userData.role ?? null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // メッセージのリアルタイム取得
  useEffect(() => {
    if (!user || !trainerId) return;

    const q = query(
      collection(db, "messages"),
      where("participants", "array-contains", user.uid),
      orderBy("createdAt", "asc")
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

  // メッセージ送信＋スクロール
  const handleSend = async () => {
    if (!text.trim() || !user || !trainerId) return;

    await addDoc(collection(db, "messages"), {
      text,
      createdAt: new Date(),
      userId: user.uid,
      userEmail: user.email ?? "",
      peerId: trainerId,
      participants: [user.uid, trainerId],
    });
    setText("");
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-lg ${
                  isMe
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
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

      <div className="flex space-x-2 mb-2">
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

      {/* 🎯 ロールごとのボタン表示 */}
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {role === "client" && (
          <>
            <button
              onClick={() => setMealModalOpen(true)}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              🍚 食事
            </button>
            <button
              onClick={() => setExerciseModalOpen(true)}
              className="bg-orange-500 text-white px-3 py-1 rounded"
            >
              🏃‍♂️ 運動
            </button>
            <button className="bg-purple-500 text-white px-3 py-1 rounded">
              🌟 チャレンジ
            </button>
            <button
              onClick={() => setWeightModalOpen(true)}
              className="bg-pink-500 text-white px-3 py-1 rounded"
            >
              ⚖️ 体重
            </button>
          </>
        )}
        {/* モーダル */}
        <MealModal
          isOpen={mealModalOpen}
          onClose={() => setMealModalOpen(false)}
          onSubmit={handleMealSubmit}
        />
        <ExerciseModal
          isOpen={exerciseModalOpen}
          onClose={() => setExerciseModalOpen(false)}
          onSubmit={handleExerciseSubmit}
        />
        <WeightModal
          isOpen={weightModalOpen}
          onClose={() => setWeightModalOpen(false)}
          onSubmit={handleWeightSubmit}
        />
        {role === "trainer" && (
          <button className="bg-blue-700 text-white px-3 py-1 rounded">
            📊 過去データチェック
          </button>
        )}
      </div>
    </div>
  );
}
