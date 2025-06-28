export type FoodItem = {
  name: string;
  cal: number;
  p: number;
  f: number;
  c: number;
  veg: number;
};

export const foods: Record<string, FoodItem[]> = {
  主食: [
    { name: 'ご飯', cal: 168, p: 3, f: 0.3, c: 37, veg: 0 },
    { name: '食パン', cal: 150, p: 5, f: 2, c: 28, veg: 0 },
    { name: 'うどん', cal: 105, p: 3, f: 0.4, c: 21, veg: 0 },
    { name: 'そば', cal: 132, p: 5, f: 1, c: 24, veg: 0 },
    { name: 'パスタ', cal: 165, p: 6, f: 1, c: 30, veg: 0 },
  ],
  主菜: [
    { name: '焼き魚', cal: 250, p: 20, f: 15, c: 0, veg: 0 },
    { name: '鶏の唐揚げ', cal: 300, p: 20, f: 20, c: 10, veg: 0 },
    { name: 'ハンバーグ', cal: 280, p: 15, f: 18, c: 14, veg: 0 },
    { name: '豆腐ステーキ', cal: 200, p: 14, f: 10, c: 6, veg: 0 },
    { name: '卵焼き', cal: 180, p: 12, f: 12, c: 6, veg: 0 },
  ],
  副菜: [
    { name: 'サラダ', cal: 50, p: 1, f: 2, c: 8, veg: 80 },
    { name: 'ほうれん草のおひたし', cal: 30, p: 3, f: 0, c: 4, veg: 60 },
    { name: 'きんぴらごぼう', cal: 120, p: 2, f: 6, c: 15, veg: 50 },
    { name: '味噌汁', cal: 40, p: 2, f: 1, c: 6, veg: 40 },
    { name: '野菜炒め', cal: 150, p: 4, f: 8, c: 12, veg: 90 },
  ],
  果物: [
    { name: 'りんご', cal: 80, p: 0, f: 0, c: 21, veg: 0 },
    { name: 'バナナ', cal: 90, p: 1, f: 0, c: 23, veg: 0 },
    { name: 'みかん', cal: 40, p: 0, f: 0, c: 10, veg: 0 },
    { name: 'ぶどう', cal: 60, p: 0, f: 0, c: 15, veg: 0 },
    { name: 'キウイ', cal: 50, p: 1, f: 0, c: 13, veg: 0 },
  ],
  飲み物: [
    { name: '水', cal: 0, p: 0, f: 0, c: 0, veg: 0 },
    { name: 'コーヒー', cal: 5, p: 0, f: 0, c: 1, veg: 0 },
    { name: '牛乳', cal: 130, p: 7, f: 7, c: 10, veg: 0 },
    { name: 'ジュース', cal: 110, p: 0, f: 0, c: 27, veg: 0 },
    { name: '緑茶', cal: 0, p: 0, f: 0, c: 0, veg: 0 },
  ],
  乳製品: [
    { name: 'ヨーグルト', cal: 100, p: 4, f: 4, c: 12, veg: 0 },
    { name: 'チーズ', cal: 120, p: 7, f: 10, c: 1, veg: 0 },
    { name: 'バター', cal: 150, p: 0, f: 17, c: 0, veg: 0 },
    { name: '牛乳', cal: 130, p: 7, f: 7, c: 10, veg: 0 },
    { name: 'アイスクリーム', cal: 200, p: 3, f: 12, c: 20, veg: 0 },
  ],
  お菓子: [
    { name: 'チョコレート', cal: 250, p: 3, f: 15, c: 30, veg: 0 },
    { name: 'クッキー', cal: 180, p: 2, f: 10, c: 22, veg: 0 },
    { name: 'ケーキ', cal: 300, p: 5, f: 18, c: 35, veg: 0 },
    { name: 'ポテトチップス', cal: 290, p: 3, f: 17, c: 30, veg: 0 },
    { name: 'キャンディ', cal: 150, p: 0, f: 0, c: 37, veg: 0 },
  ],
};

export const frequentFoods: FoodItem[] = [
  foods['主食'][0],
  foods['主菜'][0],
  foods['副菜'][0],
  foods['果物'][0],
];