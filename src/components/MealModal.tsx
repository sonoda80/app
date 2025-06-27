// src/components/MealModal.tsx
"use client";

import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    mealType: "朝食" | "昼食" | "夕食" | "間食",
    foodInput: string
  ) => void;
};
// 食品データ
export type FoodItem = {
  name: string;
  cal: number;
  p: number;
  f: number;
  c: number;
  veg: number;
};

const foods: Record<string, FoodItem[]> = {
  主食: [
    { name: "ご飯", cal: 168, p: 3, f: 0.3, c: 37, veg: 0 },
    { name: "食パン", cal: 150, p: 5, f: 2, c: 28, veg: 0 },
    { name: "うどん", cal: 105, p: 3, f: 0.4, c: 21, veg: 0 },
    { name: "そば", cal: 132, p: 5, f: 1, c: 24, veg: 0 },
    { name: "パスタ", cal: 165, p: 6, f: 1, c: 30, veg: 0 },
  ],
  主菜: [
    { name: "焼き魚", cal: 250, p: 20, f: 15, c: 0, veg: 0 },
    { name: "鶏の唐揚げ", cal: 300, p: 20, f: 20, c: 10, veg: 0 },
    { name: "ハンバーグ", cal: 280, p: 15, f: 18, c: 14, veg: 0 },
    { name: "豆腐ステーキ", cal: 200, p: 14, f: 10, c: 6, veg: 0 },
    { name: "卵焼き", cal: 180, p: 12, f: 12, c: 6, veg: 0 },
  ],
  副菜: [
    { name: "サラダ", cal: 50, p: 1, f: 2, c: 8, veg: 80 },
    { name: "ほうれん草のおひたし", cal: 30, p: 3, f: 0, c: 4, veg: 60 },
    { name: "きんぴらごぼう", cal: 120, p: 2, f: 6, c: 15, veg: 50 },
    { name: "味噌汁", cal: 40, p: 2, f: 1, c: 6, veg: 40 },
    { name: "野菜炒め", cal: 150, p: 4, f: 8, c: 12, veg: 90 },
  ],
  果物: [
    { name: "りんご", cal: 80, p: 0, f: 0, c: 21, veg: 0 },
    { name: "バナナ", cal: 90, p: 1, f: 0, c: 23, veg: 0 },
    { name: "みかん", cal: 40, p: 0, f: 0, c: 10, veg: 0 },
    { name: "ぶどう", cal: 60, p: 0, f: 0, c: 15, veg: 0 },
    { name: "キウイ", cal: 50, p: 1, f: 0, c: 13, veg: 0 },
  ],
  飲み物: [
    { name: "水", cal: 0, p: 0, f: 0, c: 0, veg: 0 },
    { name: "コーヒー", cal: 5, p: 0, f: 0, c: 1, veg: 0 },
    { name: "牛乳", cal: 130, p: 7, f: 7, c: 10, veg: 0 },
    { name: "ジュース", cal: 110, p: 0, f: 0, c: 27, veg: 0 },
    { name: "緑茶", cal: 0, p: 0, f: 0, c: 0, veg: 0 },
  ],
  乳製品: [
    { name: "ヨーグルト", cal: 100, p: 4, f: 4, c: 12, veg: 0 },
    { name: "チーズ", cal: 120, p: 7, f: 10, c: 1, veg: 0 },
    { name: "バター", cal: 150, p: 0, f: 17, c: 0, veg: 0 },
    { name: "牛乳", cal: 130, p: 7, f: 7, c: 10, veg: 0 },
    { name: "アイスクリーム", cal: 200, p: 3, f: 12, c: 20, veg: 0 },
  ],
  お菓子: [
    { name: "チョコレート", cal: 250, p: 3, f: 15, c: 30, veg: 0 },
    { name: "クッキー", cal: 180, p: 2, f: 10, c: 22, veg: 0 },
    { name: "ケーキ", cal: 300, p: 5, f: 18, c: 35, veg: 0 },
    { name: "ポテトチップス", cal: 290, p: 3, f: 17, c: 30, veg: 0 },
    { name: "キャンディ", cal: 150, p: 0, f: 0, c: 37, veg: 0 },
  ],
};

// よく使う料理候補
const frequentFoods: FoodItem[] = [
  foods["主食"][0],
  foods["主菜"][0],
  foods["副菜"][0],
  foods["果物"][0],
];

// 選択済み料理
type SelectedFood = {
  item: FoodItem;
  amountLabel: string;
  vegLabel: string;
  cal: number;
  p: number;
  f: number;
  c: number;
  veg: number;
};

export default function MealModal({ isOpen, onClose, onSubmit }: Props) {
  const [mealType, setMealType] = useState<"朝食" | "昼食" | "夕食" | "間食">(
    "朝食"
  );
  const [category, setCategory] = useState<keyof typeof foods>("主食");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SelectedFood[]>([]);
  const [freeInput, setFreeInput] = useState("");
  const [detailFood, setDetailFood] = useState<FoodItem | null>(null);

  if (!isOpen) return null;
  const filtered = foods[category].filter((f) => f.name.includes(search));

  const totals = selected.reduce(
    (acc, cur) => {
      acc.cal += cur.cal;
      acc.p += cur.p;
      acc.f += cur.f;
      acc.c += cur.c;
      acc.veg += cur.veg;
      return acc;
    },
    { cal: 0, p: 0, f: 0, c: 0, veg: 0 }
  );

  const handleSelect = (
    food: FoodItem,
    amount: string,
    veg: string,
    amtFactor: number,
    vegGram: number
  ) => {
    setSelected((prev) => [
      ...prev,
      {
        item: food,
        amountLabel: amount,
        vegLabel: veg,
        cal: food.cal * amtFactor,
        p: food.p * amtFactor,
        f: food.f * amtFactor,
        c: food.c * amtFactor,
        veg: vegGram,
      },
    ]);
  };

  const handleSend = () => {
    const foodText = selected
      .map((s) => `${s.item.name}(${s.amountLabel},野菜${s.vegLabel})`)
      .join("、");
    const text = [foodText, freeInput].filter(Boolean).join("、");
    onSubmit(mealType, text);
    setSelected([]);
    setFreeInput("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-sm">
      <div className="bg-white w-11/12 max-w-lg p-4 rounded shadow-lg relative space-y-3 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
        <h3 className="text-lg font-bold">食事記録</h3>

        {/* 食事タイプ選択 */}
        <div className=" flex justify-between">
          {(["朝食", "昼食", "夕食", "間食"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className={`px-2 py-1 rounded ${
                mealType === type
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* 食品入力欄 */}
        {/* 検索 */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="食品検索"
          className="w-full border p-2 rounded"
        />

        {/* カテゴリタブ */}
        <div className="flex flex-wrap gap-1">
          {(Object.keys(foods) as Array<keyof typeof foods>).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setSearch("");
              }}
              className={`px-2 py-1 rounded ${
                category === cat
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 料理一覧 */}
        <div className="grid grid-cols-3 gap-2">
          {filtered.map((food) => (
            <button
              key={food.name}
              onClick={() => setDetailFood(food)}
              className="border rounded p-1 hover:bg-gray-100"
            >
              {food.name}
            </button>
          ))}
        </div>

        {/* 選択された料理 */}
        <div>
          <h4 className="font-semibold">選択済み</h4>
          {selected.length === 0 && <p className="text-gray-500">なし</p>}
          {selected.map((s, idx) => (
            <div key={idx} className="flex justify-between border-b py-1">
              <span>
                {s.item.name} ({s.amountLabel},野菜{s.vegLabel})
              </span>
              <button
                className="text-red-500"
                onClick={() =>
                  setSelected(selected.filter((_, i) => i !== idx))
                }
              >
                削除
              </button>
            </div>
          ))}
        </div>

        {/* 自由入力 */}
        <div>
          <input
            type="text"
            value={freeInput}
            onChange={(e) => setFreeInput(e.target.value)}
            placeholder="見つからない食品など"
            className="w-full border p-2 rounded"
          />
        </div>

        {/* よく使う料理 */}
        <div>
          <h4 className="font-semibold">よく使う料理</h4>
          <div className="flex flex-wrap gap-1">
            {frequentFoods.map((food) => (
              <button
                key={food.name}
                onClick={() => setDetailFood(food)}
                className="border rounded px-2 py-1 hover:bg-gray-100"
              >
                {food.name}
              </button>
            ))}
          </div>
        </div>

        {/* 栄養素表示 */}
        <div className="text-xs space-y-1">
          <div>カロリー: {totals.cal.toFixed(0)} kcal</div>
          <div>
            P: {totals.p.toFixed(1)} g / F: {totals.f.toFixed(1)} g / C:{" "}
            {totals.c.toFixed(1)} g
          </div>
          <div>野菜量: {totals.veg.toFixed(0)} g</div>
        </div>
        <button
          onClick={handleSend}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          送信
        </button>
        {detailFood && (
          <FoodDetailModal
            food={detailFood}
            onClose={() => setDetailFood(null)}
            onSelect={handleSelect}
          />
        )}
      </div>
    </div>
  );
}

// 料理詳細モーダル
function FoodDetailModal({
  food,
  onClose,
  onSelect,
}: {
  food: FoodItem;
  onClose: () => void;
  onSelect: (
    food: FoodItem,
    amountLabel: string,
    vegLabel: string,
    amountFactor: number,
    vegGram: number
  ) => void;
}) {
  const [amount, setAmount] = useState<"多い" | "普通" | "少ない" | "g">(
    "普通"
  );
  const [amountGram, setAmountGram] = useState("");
  const [veg, setVeg] = useState<"多い" | "普通" | "少ない" | "g">("普通");
  const [vegGram, setVegGram] = useState("");

  const getFactor = () => {
    if (amount === "多い") return 1.5;
    if (amount === "少ない") return 0.5;
    if (amount === "g") return parseFloat(amountGram || "0") / 100;
    return 1;
  };

  const getVeg = () => {
    if (veg === "多い") return food.veg * 1.5;
    if (veg === "少ない") return food.veg * 0.5;
    if (veg === "g") return parseFloat(vegGram || "0");
    return food.veg;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-10/12 max-w-sm p-4 rounded shadow space-y-3 relative text-sm">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
        <h4 className="font-bold">{food.name}</h4>
        <div>
          <div className="mb-1">量</div>
          <div className="flex gap-1 mb-2">
            {(["多い", "普通", "少ない", "g"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setAmount(t)}
                className={`px-2 py-1 rounded ${
                  amount === t ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                {t === "g" ? "g入力" : t}
              </button>
            ))}
          </div>
          {amount === "g" && (
            <input
              type="number"
              value={amountGram}
              onChange={(e) => setAmountGram(e.target.value)}
              className="w-full border p-1 rounded mb-2"
              placeholder="g"
            />
          )}
        </div>
        <div>
          <div className="mb-1">野菜量</div>
          <div className="flex gap-1 mb-2">
            {(["多い", "普通", "少ない", "g"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setVeg(t)}
                className={`px-2 py-1 rounded ${
                  veg === t ? "bg-green-500 text-white" : "bg-gray-200"
                }`}
              >
                {t === "g" ? "g入力" : t}
              </button>
            ))}
          </div>
          {veg === "g" && (
            <input
              type="number"
              value={vegGram}
              onChange={(e) => setVegGram(e.target.value)}
              className="w-full border p-1 rounded mb-2"
              placeholder="g"
            />
          )}
        </div>
        <button
          onClick={() => {
            const factor = getFactor();
            const vegValue = getVeg();
            onSelect(
              food,
              amount === "g" ? amountGram + "g" : amount,
              veg === "g" ? vegGram + "g" : veg,
              factor,
              vegValue
            );
            onClose();
          }}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          選択
        </button>
      </div>
    </div>
  );
}
