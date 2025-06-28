// src/components/MealModal.tsx
"use client";

import { useState } from "react";
import { foods, FoodItem, frequentFoods } from "@/lib/foods";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    mealType: "朝食" | "昼食" | "夕食" | "間食",
    foodInput: string,
    totals: Totals
  ) => void;
};

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

export type Totals = {
  cal: number;
  p: number;
  f: number;
  c: number;
  veg: number;
  vitA: number;
  vitC: number;
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
  const [vegRatio, setVegRatio] = useState(0.5); // dark green vegetable ratio

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

  const totalsWithVit: Totals = {
    ...totals,
    vitA: totals.veg * (vegRatio * 4 + (1 - vegRatio) * 0.5),
    vitC: totals.veg * (vegRatio * 1 + (1 - vegRatio) * 0.3),
  };

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
      .map((s) =>
        s.vegLabel
          ? `${s.item.name}(${s.amountLabel},野菜${s.vegLabel})`
          : `${s.item.name}(${s.amountLabel})`
      )
      .join("、");
    const text = [foodText, freeInput].filter(Boolean).join("、");
    onSubmit(mealType, text, totalsWithVit);
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

        {/* 濃淡スライダー */}
        <div className="my-2">
          <label className="text-sm">濃い緑野菜比率 {Math.round(vegRatio * 100)}%</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={vegRatio}
            onChange={(e) => setVegRatio(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* 料理一覧 */}
        <div className="max-h-40 overflow-y-auto border rounded">
          {filtered.map((food) => (
            <div
              key={food.name}
              onClick={() => setDetailFood(food)}
              className="p-1 border-b last:border-b-0 cursor-pointer hover:bg-gray-100"
            >
              {food.name}
            </div>
          ))}
        </div>

        {/* 選択された料理 */}
        <div>
          <h4 className="font-semibold">選択済み</h4>
          {selected.length === 0 && <p className="text-gray-500">なし</p>}
          {selected.map((s, idx) => (
            <div key={idx} className="flex justify-between border-b py-1">
              <span>
                {s.item.name} ({s.amountLabel}
                {s.vegLabel ? `,野菜${s.vegLabel}` : ""})
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
          <div>カロリー: {totalsWithVit.cal.toFixed(0)} kcal</div>
          <div>
            P: {totalsWithVit.p.toFixed(1)} g / F: {totalsWithVit.f.toFixed(1)} g
            / C: {totalsWithVit.c.toFixed(1)} g
          </div>
          <div>野菜量: {totalsWithVit.veg.toFixed(0)} g</div>
          <div>ビタミンA: {totalsWithVit.vitA.toFixed(1)} µg</div>
          <div>ビタミンC: {totalsWithVit.vitC.toFixed(1)} mg</div>
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
            category={category}
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
  category,
  onClose,
  onSelect,
}: {
  food: FoodItem;
  category: keyof typeof foods;
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
  const showVeg = category === "主菜" || category === "副菜";

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
        {showVeg && (
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
        )}
        <button
          onClick={() => {
            const factor = getFactor();
            const vegValue = showVeg ? getVeg() : 0;
            onSelect(
              food,
              amount === "g" ? amountGram + "g" : amount,
              showVeg ? (veg === "g" ? vegGram + "g" : veg) : "",
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
