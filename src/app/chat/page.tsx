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
import ChallengeModal from "@/components/ChallengeModal";
import ChallengeGoalModal, {
  ChallengeGoals,
} from "@/components/ChallengeGoalModal";
import Link from "next/link";
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
  const [challengeModalOpen, setChallengeModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goals, setGoals] = useState<ChallengeGoals>({
    goal1: "",
    goal2: "",
    goal3: "",
  });

  /*朝食*/
  const handleMealSubmit = async (
    mealType: "朝食" | "昼食" | "夕食" | "間食",
    foodInput: string
  ) => {
    if (!user || !trainerId) return;
    const messageText = `${mealType}：${foodInput}`;
    await addDoc(collection(db, "messages"), {
      text: messageText,
      createdAt: new Date(),
      userId: user.uid,
      userEmail: user.email ?? "",
      peerId: trainerId,
      participants: [user.uid, trainerId],
    });
    const today = new Date().toISOString().split("T")[0];
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
    setMealModalOpen(false);
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  /*運動*/
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
    const today = new Date().toISOString().split("T")[0];
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

  /*体重*/
  const handleWeightSubmit = async (weight: number) => {
    if (!user || !trainerId) return;

    const today = new Date().toISOString().split("T")[0];
    const weightText = `⚖️ ${today}の体重：${weight}kg`;

    await addDoc(collection(db, "messages"), {
      text: weightText,
      createdAt: new Date(),
      userId: user.uid,
      userEmail: user.email ?? "",
      peerId: trainerId,
      participants: [user.uid, trainerId],
    });

    const weightRef = doc(db, "users", user.uid, "weights", today);
    await setDoc(weightRef, {
      weight,
    });

    setWeightModalOpen(false);
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  /*チャレンジ*/
  const handleChallengeSubmit = async (statuses: {
    [key: string]: "○" | "×";
  }) => {
    if (!user || !trainerId) return;

    const parts = Object.entries(statuses).map(([k, v]) => `${k}：${v}`);
    const messageText = "🎯 チャレンジ結果\n" + parts.join("\n");
    await addDoc(collection(db, "messages"), {
      text: messageText,
      createdAt: new Date(),
      userId: user.uid,
      userEmail: user.email ?? "",
      peerId: trainerId,
      participants: [user.uid, trainerId],
    });

    const today = new Date().toISOString().split("T")[0];
    const docRef = doc(db, "users", user.uid, "challenges", today);
    const snap = await getDoc(docRef);
    const data = { ...statuses, updatedAt: new Date() };
    if (snap.exists()) {
      await updateDoc(docRef, data);
    } else {
      await setDoc(docRef, data);
    }

    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  const handleGoalSubmit = async (newGoals: ChallengeGoals) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid, "challengeGoals", "current");
    await setDoc(ref, newGoals, { merge: true });
    setGoals(newGoals);
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

  // チャレンジ目標の取得
  useEffect(() => {
    if (!user) return;
    const fetchGoals = async () => {
      const ref = doc(db, "users", user.uid, "challengeGoals", "current");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setGoals({
          goal1: data.goal1 ?? "",
          goal2: data.goal2 ?? "",
          goal3: data.goal3 ?? "",
        });
      }
    };
    fetchGoals();
  }, [user]);

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
            <button
              onClick={() => setChallengeModalOpen(true)}
              className="bg-purple-500 text-white px-3 py-1 rounded"
            >
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
        <ChallengeModal
          isOpen={challengeModalOpen}
          onClose={() => setChallengeModalOpen(false)}
          onSubmit={handleChallengeSubmit}
          goals={goals}
          onOpenGoalSetting={() => setGoalModalOpen(true)}
        />
        <ChallengeGoalModal
          isOpen={goalModalOpen}
          onClose={() => setGoalModalOpen(false)}
          onSubmit={handleGoalSubmit}
          initialGoals={goals}
        />
        {role === "trainer" && (
          <Link
            href="/client/history"
            className="block mt-4 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 text-center"
          >
            過去データ確認
          </Link>
        )}
      </div>
    </div>
  );
}
