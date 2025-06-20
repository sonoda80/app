// src/app/login/page.tsx
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase";

const auth = getAuth(firebaseApp);
const db   = getFirestore(firebaseApp);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin]   = useState(true);
  const [role, setRole]         = useState<"client" | "trainer">("client");
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      let user;
      if (isLogin) {
        // ログイン
        const cred = await signInWithEmailAndPassword(auth, email, password);
        user = cred.user;
      } else {
        // 新規登録＋Firestore に role 保存
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        user = cred.user;
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role,
          createdAt: new Date(),
        });
      }

      // ここからログイン後のリダイレクト
      // └── 新規登録時は role が state にあるが、ログイン時は Firestore から取得
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userRole = userDoc.exists() ? userDoc.data().role : "client";

      // client／trainer のダッシュボードへ遷移
      if (userRole === "trainer") {
        router.push("/trainer");
      } else {
        router.push("/client");
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("不明なエラーが発生しました。");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">
        {isLogin ? "ログイン" : "新規登録"}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
        />

        {/* 新規登録時のみ表示：role 選択 */}
        {!isLogin && (
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="client"
                checked={role === "client"}
                onChange={() => setRole("client")}
                className="mr-1"
              />
              クライアント
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="trainer"
                checked={role === "trainer"}
                onChange={() => setRole("trainer")}
                className="mr-1"
              />
              トレーナー
            </label>
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          {isLogin ? "ログイン" : "登録"}
        </button>
      </form>

      <p className="mt-4 text-sm">
        {isLogin
          ? "アカウントがないですか？"
          : "すでにアカウントをお持ちですか？"}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 underline ml-2"
        >
          {isLogin ? "新規登録へ" : "ログインへ"}
        </button>
      </p>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
