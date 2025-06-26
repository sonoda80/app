"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import WeeklySummaryModal, {
  WeeklySummaryData,
} from "@/components/WeeklySummaryModal";
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
  const router = useRouter();

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
  const [surveyUnread, setSurveyUnread] = useState(false);
  const [weeklyOpen, setWeeklyOpen] = useState(false);
  const [summaryUnread, setSummaryUnread] = useState(false);
  const [weeklyData, setWeeklyData] = useState<WeeklySummaryData | null>(null);
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
  const fetchWeeklyData = async () => {
    if (!trainerId) return null;
    const end = new Date();
    const start = new Date(end.getTime() - 6 * 86400000);
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start.getTime() + i * 86400000);
      dates.push(d.toISOString().split("T")[0]);
    }

    const weightSnaps = await Promise.all(
      dates.map((d) => getDoc(doc(db, "users", trainerId, "weights", d)))
    );
    const weights = weightSnaps
      .map((s, idx) =>
        s.exists()
          ? { date: dates[idx], weight: s.data().weight as number }
          : null
      )
      .filter(Boolean) as { date: string; weight: number }[];
    let weightDiffText = "データなし";
    if (weights.length >= 2) {
      const diff = weights[weights.length - 1].weight - weights[0].weight;
      weightDiffText = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)} kg（${
        weights[0].weight
      }kg → ${weights[weights.length - 1].weight}kg）`;
    }

    const challengeSnaps = await Promise.all(
      dates.map((d) => getDoc(doc(db, "users", trainerId, "challenges", d)))
    );
    let g1 = 0,
      g2 = 0,
      g3 = 0;
    challengeSnaps.forEach((s) => {
      if (s.exists()) {
        if (s.data()["目標１"] === "○") g1++;
        if (s.data()["目標２"] === "○") g2++;
        if (s.data()["目標３"] === "○") g3++;
      }
    });

    return {
      startLabel: `${start.getMonth() + 1}/${start.getDate()}`,
      endLabel: `${end.getMonth() + 1}/${end.getDate()}`,
      weightDiffText,
      weightDays: weights.length,
      goal1: g1,
      goal2: g2,
      goal3: g3,
    } as WeeklySummaryData;
  };

  const handleWeeklySubmit = async (comment: string) => {
    if (!user || !trainerId || !weeklyData) return;
    const lines = [
      "━━━━━━━━━━━━━━━━━━━━━━",
      `📅 今週のサマリー（${weeklyData.startLabel}〜${weeklyData.endLabel}）`,
      "━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "🥗 食事",
      "・平均摂取カロリー：1,850 kcal / 2,000 kcal（目標）",
      "・食事記録日数：5 / 7日",
      "",
      "🏃‍♂️ 運動",
      "・運動消費カロリー：1,200 kcal（合計）",
      "・平均運動時間：32分 / 日",
      "・運動実施日数：4 / 7日",
      "",
      "⚖️ 体重",
      `・体重減少量：${weeklyData.weightDiffText}`,
      `・体重記録日数：${weeklyData.weightDays} / 7日`,
      "",
      "🌟 チャレンジ達成状況",
      `・目標1：${weeklyData.goal1} / 7日`,
      `・目標2：${weeklyData.goal2} / 7日`,
      `・目標3：${weeklyData.goal3} / 7日`,
      "",
      "━━━━━━━━━━━━━━━━━━━━━━",
      "📝 今週の総評",
      "━━━━━━━━━━━━━━━━━━━━━━",
      comment,
    ];
    const text = lines.join("\n");
    await addDoc(collection(db, "messages"), {
      text,
      createdAt: new Date(),
      userId: user.uid,
      userEmail: user.email ?? "",
      peerId: trainerId,
      participants: [user.uid, trainerId],
    });
    const start = new Date();
    start.setDate(start.getDate() - 6);
    const id = start.toISOString().split("T")[0];
    await setDoc(
      doc(db, "users", trainerId, "weeklySummaries", id),
      { comment, createdAt: new Date() },
      { merge: true }
    );
    setWeeklyOpen(false);
    setSummaryUnread(false);
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

  // アンケート未読チェック（トレーナー側）
  useEffect(() => {
    if (role !== "trainer" || !trainerId) return;
    const fetch = async () => {
      const ref = doc(db, "users", trainerId, "surveys", "initial");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setSurveyUnread(!snap.data().trainerViewed);
      }
    };
    fetch();
  }, [role, trainerId]);
  // 週次サマリー未送信チェック（トレーナー側）
  useEffect(() => {
    if (role !== "trainer" || !trainerId) return;
    const check = async () => {
      const end = new Date();
      const start = new Date(end.getTime() - 6 * 86400000);
      const id = start.toISOString().split("T")[0];
      const ref = doc(db, "users", trainerId, "weeklySummaries", id);
      const snap = await getDoc(ref);
      setSummaryUnread(!snap.exists());
    };
    check();
  }, [role, trainerId]);
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
      {role && (
        <button
          onClick={() =>
            router.push(role === "trainer" ? "/trainer" : "/client")
          }
          className="text-blue-600 underline mb-4"
        >
          ダッシュボードに戻る
        </button>
      )}

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
        <WeeklySummaryModal
          isOpen={weeklyOpen}
          onClose={() => setWeeklyOpen(false)}
          onSubmit={handleWeeklySubmit}
          data={
            weeklyData || {
              startLabel: "",
              endLabel: "",
              weightDiffText: "",
              weightDays: 0,
              goal1: 0,
              goal2: 0,
              goal3: 0,
            }
          }
        />
        {role === "trainer" && (
          <>
            <Link
              href={`/trainer/survey/${trainerId}`}
              className="relative block mt-4 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 text-center"
            >
              アンケート結果
              {surveyUnread && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              )}
            </Link>
            <Link
              href="/client/history"
              className="block mt-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 text-center"
            >
              過去データ確認
            </Link>
            <button
              onClick={async () => {
                const data = await fetchWeeklyData();
                if (data) setWeeklyData(data);
                setWeeklyOpen(true);
              }}
              className="relative block mt-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 text-center w-full"
            >
              今週のサマリー入力
              {summaryUnread && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
