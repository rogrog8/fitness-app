
const foodDatabase = {
  // Carbohydrates
  "white rice": { calories: 130, serving: "100 grams", protein: 2.7, fat: 0.3, carbs: 28.2 },
  "brown rice": { calories: 111, serving: "100 grams", protein: 2.6, fat: 0.9, carbs: 23 },
  "white bread": { calories: 265, serving: "100 grams", protein: 9, fat: 3.2, carbs: 49 },
  "instant noodles": { calories: 380, serving: "1 package (80g)", protein: 8, fat: 14, carbs: 54 },
  "boiled potatoes": { calories: 86, serving: "100 grams", protein: 1.7, fat: 0.1, carbs: 20 },

  // Animal Protein
  "grilled chicken without skin": { calories: 165, serving: "100 grams", protein: 31, fat: 3.6, carbs: 0 },
  "lean beef": { calories: 250, serving: "100 grams", protein: 26, fat: 15, carbs: 0 },
  "salmon": { calories: 208, serving: "100 grams", protein: 20, fat: 13, carbs: 0 },
  "boiled eggs": { calories: 155, serving: "2 eggs (100g)", protein: 13, fat: 11, carbs: 1.1 },
  "tofu": { calories: 76, serving: "100 grams", protein: 8, fat: 4.8, carbs: 1.9 },

  // Vegetables
  "boiled broccoli": { calories: 35, serving: "100 grams", protein: 2.4, fat: 0.4, carbs: 7.2 },
  "boiled carrots": { calories: 41, serving: "100 grams", protein: 0.8, fat: 0.2, carbs: 9.6 },
  "boiled spinach": { calories: 23, serving: "100 grams", protein: 2.9, fat: 0.4, carbs: 3.6 },

  // Fruits
  "apple": { calories: 52, serving: "1 medium (182g)", protein: 0.3, fat: 0.2, carbs: 14 },
  "banana": { calories: 89, serving: "1 fruit (118g)", protein: 1.1, fat: 0.3, carbs: 22.8 },
  "avocado": { calories: 160, serving: "100 grams", protein: 2, fat: 15, carbs: 9 },
  "orange": { calories: 47, serving: "1 fruit (131g)", protein: 0.9, fat: 0.1, carbs: 12 },

  // Dairy Products
  "whole milk": { calories: 61, serving: "100 ml", protein: 3.2, fat: 3.3, carbs: 4.8 },
  "plain yogurt": { calories: 59, serving: "100 grams", protein: 3.5, fat: 3.3, carbs: 4.7 },
  "cheddar cheese": { calories: 403, serving: "100 grams", protein: 25, fat: 33, carbs: 1.3 },

  // Snacks & Beverages
  "vanilla ice cream": { calories: 207, serving: "100 grams", protein: 3.5, fat: 11, carbs: 24 },
  "chocolate bar": { calories: 546, serving: "100 grams", protein: 4.9, fat: 31, carbs: 61 },
  "potato chips": { calories: 536, serving: "100 grams", protein: 7, fat: 35, carbs: 53 },
  "black coffee": { calories: 2, serving: "250 ml", protein: 0.3, fat: 0, carbs: 0 },
  "unsweetened tea": { calories: 2, serving: "250 ml", protein: 0, fat: 0, carbs: 0.3 },

  // Indonesian Foods
  "beef rendang": { calories: 193, serving: "100 grams", protein: 22, fat: 10, carbs: 2 },
  "gado-gado (Indonesian salad)": { calories: 180, serving: "1 serving (200g)", protein: 8, fat: 10, carbs: 15 },
  "chicken satay": { calories: 150, serving: "1 skewer (50g)", protein: 12, fat: 9, carbs: 3 },
  "fried tempeh": { calories: 193, serving: "100 grams", protein: 19, fat: 11, carbs: 9 },
  "fried instant noodles": { calories: 380, serving: "1 package (80g)", protein: 8, fat: 14, carbs: 54 },

  // Western Foods
  "pepperoni pizza": { calories: 296, serving: "1 slice (107g)", protein: 12, fat: 11, carbs: 36 },
  "hamburger": { calories: 295, serving: "1 unit (120g)", protein: 17, fat: 12, carbs: 30 },
  "spaghetti bolognese": { calories: 158, serving: "100 grams", protein: 7, fat: 5, carbs: 21 },

  // Breakfast
  "oatmeal": { calories: 68, serving: "100 grams", protein: 2.4, fat: 1.4, carbs: 12 },
  "granola": { calories: 471, serving: "100 grams", protein: 10, fat: 20, carbs: 64 },
  "omelette": { calories: 154, serving: "1 large egg (61g)", protein: 10.6, fat: 11.5, carbs: 0.6 },

  // Nuts
  "almonds": { calories: 579, serving: "100 grams", protein: 21, fat: 50, carbs: 22 },
  "peanuts": { calories: 567, serving: "100 grams", protein: 26, fat: 49, carbs: 16 },
  "edamame": { calories: 121, serving: "100 grams", protein: 12, fat: 5, carbs: 10 },
  
  // === VEGETABLES ===
  "boiled water spinach": { calories: 19, serving: "100 grams", protein: 1.7, fat: 0.2, carbs: 3.4 },
  "button mushrooms": { calories: 22, serving: "100 grams", protein: 3.1, fat: 0.3, carbs: 3.3 },

  // === LOCAL FRUITS ===
  "harum manis mango": { calories: 60, serving: "100 grams", protein: 0.5, fat: 0.3, carbs: 15 },
  "durian": { calories: 147, serving: "100 grams", protein: 1.5, fat: 5.3, carbs: 27 },

  // === ANIMAL PROTEIN ===
  "fried squid": { calories: 175, serving: "100 grams", protein: 18, fat: 9, carbs: 4 },
  "boiled shrimp": { calories: 99, serving: "100 grams", protein: 24, fat: 0.3, carbs: 0.2 },

  // === STREET FOOD ===
  "sweet martabak": { calories: 420, serving: "1 slice (100g)", protein: 8, fat: 18, carbs: 55 },
  "siomay (dumplings)": { calories: 91, serving: "1 piece (50g)", protein: 7, fat: 3, carbs: 8 },

  // === WESTERN FOODS ===
  "croissant": { calories: 406, serving: "100 grams", protein: 8, fat: 21, carbs: 46 },
  "caesar salad": { calories: 184, serving: "100 grams", protein: 6, fat: 15, carbs: 7 },

  // === BEVERAGES ===
  "bubble tea": { calories: 250, serving: "500 ml", protein: 2, fat: 5, carbs: 50 },
  "guava juice": { calories: 56, serving: "250 ml", protein: 1, fat: 0.5, carbs: 13 },

  // === BASIC INGREDIENTS ===
  "coconut oil": { calories: 862, serving: "100 grams", protein: 0, fat: 100, carbs: 0 },
  "palm sugar": { calories: 380, serving: "100 grams", protein: 0, fat: 0, carbs: 98 },
};
