"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase";

export default function SurveyPage() {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 食習慣
  const [breakfast, setBreakfast] = useState("毎日");
  const [mealsPerDay, setMealsPerDay] = useState("3回");
  const [snacks, setSnacks] = useState("まれに");
  const [sweetDrink, setSweetDrink] = useState("まれに");
  const [eatingOut, setEatingOut] = useState("まれに");
  const [overeating, setOvereating] = useState("0日");
  const [mealTimeFixed, setMealTimeFixed] = useState("はい");
  const [mealAwareness, setMealAwareness] = useState<string[]>([]);

  // 運動習慣
  const [exerciseDays, setExerciseDays] = useState("0日");
  const [mainActivity, setMainActivity] = useState("ウォーキング");
  const [exerciseTime, setExerciseTime] = useState("20分未満");
  const [postWorkout, setPostWorkout] = useState("とらない");
  const [tired, setTired] = useState("いいえ");
  const [sleep, setSleep] = useState("7〜8時間");

  // その他
  const [concerns, setConcerns] = useState("");
  const [goal, setGoal] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }
      setUser(u);
      const snap = await getDoc(doc(db, "users", u.uid, "surveys", "initial"));
      if (snap.exists()) {
        const d = snap.data();
        setBreakfast(d.breakfast || "毎日");
        setMealsPerDay(d.mealsPerDay || "3回");
        setSnacks(d.snacks || "まれに");
        setSweetDrink(d.sweetDrink || "まれに");
        setEatingOut(d.eatingOut || "まれに");
        setOvereating(d.overeating || "0日");
        setMealTimeFixed(d.mealTimeFixed || "はい");
        setMealAwareness(d.mealAwareness || []);
        setExerciseDays(d.exerciseDays || "0日");
        setMainActivity(d.mainActivity || "ウォーキング");
        setExerciseTime(d.exerciseTime || "20分未満");
        setPostWorkout(d.postWorkout || "とらない");
        setTired(d.tired || "いいえ");
        setSleep(d.sleep || "7〜8時間");
        setConcerns(d.concerns || "");
        setGoal(d.goal || "");
      }
      setLoading(false);
    });
    return () => unsub();
  }, [auth, db, router]);

  const toggleAwareness = (val: string) => {
    setMealAwareness((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const handleSubmit = async () => {
    if (!user) return;
    await setDoc(
      doc(db, "users", user.uid, "surveys", "initial"),
      {
        breakfast,
        mealsPerDay,
        snacks,
        sweetDrink,
        eatingOut,
        overeating,
        mealTimeFixed,
        mealAwareness,
        exerciseDays,
        mainActivity,
        exerciseTime,
        postWorkout,
        tired,
        sleep,
        concerns,
        goal,
        trainerViewed: false,
        updatedAt: new Date(),
      },
      { merge: true }
    );
    alert("送信しました");
    router.push("/client");
  };

  if (loading) return <p>読み込み中…</p>;

  const awarenessOptions = [
    "カロリー",
    "タンパク質",
    "野菜",
    "食べ過ぎ防止",
    "特になし",
  ];

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow space-y-4">
      <h1 className="text-xl font-bold">初回アンケート</h1>

      <div>
        <h2 className="font-semibold mb-2">🍽 食習慣</h2>
        <div className="space-y-2">
          <div>
            <label className="block mb-1">朝食を食べる頻度は？</label>
            <select
              value={breakfast}
              onChange={(e) => setBreakfast(e.target.value)}
              className="w-full border p-1 rounded"
            >
              <option>毎日</option>
              <option>週4〜6日</option>
              <option>週1〜3日</option>
              <option>食べない</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">1日の食事回数は？</label>
            <select
              value={mealsPerDay}
              onChange={(e) => setMealsPerDay(e.target.value)}
              className="w-full border p-1 rounded"
            >
              <option>1回</option>
              <option>2回</option>
              <option>3回</option>
              <option>4回以上</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">間食をとる頻度は？</label>
            <select
              value={snacks}
              onChange={(e) => setSnacks(e.target.value)}
              className="w-full border p-1 rounded"
            >
              <option>毎日</option>
              <option>週数回</option>
              <option>まれに</option>
              <option>とらない</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">甘い飲み物を飲む頻度は？</label>
            <select
              value={sweetDrink}
              onChange={(e) => setSweetDrink(e.target.value)}
              className="w-full border p-1 rounded"
            >
              <option>毎日</option>
              <option>週数回</option>
              <option>まれに</option>
              <option>飲まない</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">外食やコンビニ食の利用頻度は？</label>
            <select
              value={eatingOut}
              onChange={(e) => setEatingOut(e.target.value)}
              className="w-full border p-1 rounded"
            >
              <option>毎日</option>
              <option>週数回</option>
              <option>まれに</option>
              <option>利用しない</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">食べすぎたと感じる日は週にどのくらい？</label>
            <select
              value={overeating}
              onChange={(e) => setOvereating(e.target.value)}
              className="w-full border p-1 rounded"
            >
              <option>0日</option>
              <option>1〜2日</option>
              <option>3日以上</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">食事の時間は毎日だいたい決まっている？</label>
            <select
              value={mealTimeFixed}
              onChange={(e) => setMealTimeFixed(e.target.value)}
              className="w-full border p-1 rounded"
            >
              <option>はい</option>
              <option>いいえ</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">食事の際に意識していることは？</label>
            <div className="flex flex-wrap gap-2">
              {awarenessOptions.map((opt) => (
                <label key={opt} className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={mealAwareness.includes(opt)}
                    onChange={() => toggleAwareness(opt)}
                    className="mr-1"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-2">🏃‍♂️ 運動習慣</h2>
        <div className="space-y-2">
          <div>
            <label className="block mb-1">現在、週に何日運動していますか？</label>
            <select
              value={exerciseDays}
              onChange={(e) => setExerciseDays(e.target.value)}
              className="w-full border p-1 rounded"
            >
              <option>0日</option>
              <option>1〜2日</option>
              <option>3〜4日</option>
              <option>5日以上</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">主な運動内容は？</label>
            <select
              value={mainActivity}
              onChange={(e) => setMainActivity(e.target.value)}
              className="w-full border p-1 rounded"
            >
              <option>ウォーキング</option>
              <option>ジョギング</option>
              <option>筋トレ</option>
              <option>スポーツ</option>
              <option>その他</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">1回の運動時間はどのくらい？</label>
            <select
              value={exerciseTime}
              onChange={(e) => setExerciseTime(e.target.value)}
              className="w-full border p-1 rounded"
            >
              <option>20分未満</option>
              <option>20〜40分</option>
              <option>40〜60分</option>
              <option>1時間以上</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">運動後に食事やプロテインをとりますか？</label>
            <select
              value={postWorkout}
              onChange={(e) => setPostWorkout(e.target.value)}
              className="w-full border p-1 rounded"
            >
              <option>いつも</option>
              <option>時々</option>
              <option>とらない</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">最近、体を動かすのがしんどいと感じますか？</label>
            <select
              value={tired}
              onChange={(e) => setTired(e.target.value)}
              className="w-full border p-1 rounded"
            >
              <option>はい</option>
              <option>いいえ</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">睡眠時間は平均してどのくらい？</label>
            <select
              value={sleep}
              onChange={(e) => setSleep(e.target.value)}
              className="w-full border p-1 rounded"
            >
              <option>6時間未満</option>
              <option>6〜7時間</option>
              <option>7〜8時間</option>
              <option>8時間以上</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-2">✍️ その他（任意）</h2>
        <div className="space-y-2">
          <div>
            <label className="block mb-1">現在の体重管理で悩んでいること</label>
            <textarea
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              className="w-full border p-1 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">ダイエットにおいて目標にしていること</label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full border p-1 rounded"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        送信
      </button>
    </div>
  );
}