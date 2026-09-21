"use client";

import React, { useState } from "react";
import Image from "next/image";
import { restaurantConfig } from "@/config/restaurantConfig";
import { Search, Star } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: "starters" | "main" | "biryani" | "desserts" | "beverages";
  isVeg: boolean;
  isBestseller?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  // Starters
  {
    id: "m-1",
    name: "Paneer Tikka Subz-E-Khas",
    description: "Cottage cheese marinated in royal saffron yoghurt, charred to perfection in tandoor.",
    price: "₹425",
    category: "starters",
    isVeg: true,
    isBestseller: true,
  },
  {
    id: "m-2",
    name: "Murgh Malai Kebab",
    description: "Tender chicken morsels infused with green cardamom, cream, and roasted cashews.",
    price: "₹495",
    category: "starters",
    isVeg: false,
    isBestseller: true,
  },
  {
    id: "m-3",
    name: "Subz Kurkuri Kebab",
    description: "Crispy garden vegetable patties stuffed with spiced hung curd and nuts.",
    price: "₹385",
    category: "starters",
    isVeg: true,
  },

  // Main Course
  {
    id: "m-4",
    name: "Nizami Dal Makhani",
    description: "Slow-cooked black lentils simmered overnight over wood charcoal with fresh cream & butter.",
    price: "₹395",
    category: "main",
    isVeg: true,
    isBestseller: true,
  },
  {
    id: "m-5",
    name: "Butter Chicken Itihaas Special",
    description: "Tandoori chicken in a silky, honey-infused tomato cashew gravy with fenugreek.",
    price: "₹545",
    category: "main",
    isVeg: false,
    isBestseller: true,
  },
  {
    id: "m-6",
    name: "Paneer Khas Lababdar",
    description: "Paneer cubes sautéed with diced bell peppers in a rich onion tomato gravy.",
    price: "₹465",
    category: "main",
    isVeg: true,
  },

  // Biryani
  {
    id: "m-7",
    name: "Hyderabadi Dum Gosht Biryani",
    description: "Fragrant long-grain basmati rice cooked on dum with succulent tender mutton pieces.",
    price: "₹625",
    category: "biryani",
    isVeg: false,
    isBestseller: true,
  },
  {
    id: "m-8",
    name: "Royal Subz Dum Biryani",
    description: "Seasonal vegetables sealed in handi with saffron, mint, and secret royal spices.",
    price: "₹445",
    category: "biryani",
    isVeg: true,
  },

  // Desserts
  {
    id: "m-9",
    name: "Zafrani Shahi Tukda",
    description: "Crispy fried bread soaked in saffron rabri, garnished with pistachios and silver leaf.",
    price: "₹275",
    category: "desserts",
    isVeg: true,
    isBestseller: true,
  },
  {
    id: "m-10",
    name: "Warm Gulab Jamun with Ice Cream",
    description: "Classic khoya dumplings served hot with artisanal vanilla bean ice cream.",
    price: "₹225",
    category: "desserts",
    isVeg: true,
  },

  // Beverages
  {
    id: "m-11",
    name: "Kesar Badam Thandai",
    description: "Traditional chilled almond milk spiced with saffron, rose petals, and cardamom.",
    price: "₹195",
    category: "beverages",
    isVeg: true,
  },
  {
    id: "m-12",
    name: "Fresh Mint & Lime Cooler",
    description: "Refreshing sparkling lime juice muddled with garden mint and black salt.",
    price: "₹165",
    category: "beverages",
    isVeg: true,
  },
];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Header Banner */}
      <div className="bg-[#4A150B] rounded-3xl p-8 text-[#FFFDF7] border-2 border-[#D97706]/40 shadow-xl text-center relative overflow-hidden">
        <div className="relative w-20 h-20 rounded-full bg-[#FFFDF7] p-1 border-2 border-[#D97706] mx-auto mb-3 shadow-md">
          <Image
            src={restaurantConfig.logo}
            alt={restaurantConfig.name}
            width={80}
            height={80}
            className="object-contain"
          />
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#FFFDF7]">
          Culinary Menu
        </h1>
        <p className="text-xs sm:text-sm text-[#F3EAD8]/80 mt-1 italic font-light">
          &quot;{restaurantConfig.tagline}&quot;
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-[#FBF7EE] p-4 rounded-2xl border border-[#EADBC8] shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative max-w-md mx-auto">
          <Search className="w-4 h-4 text-[#6B5E55] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes, ingredients..."
            className="w-full pl-9 pr-4 py-2 bg-[#FFFDF7] border border-[#EADBC8] rounded-xl text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#D97706]"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[
            { id: "all", label: "All Delicacies" },
            { id: "starters", label: "Starters" },
            { id: "main", label: "Main Course" },
            { id: "biryani", label: "Biryani" },
            { id: "desserts", label: "Desserts" },
            { id: "beverages", label: "Beverages" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeCategory === cat.id
                  ? "bg-[#4A150B] text-[#FFFDF7] shadow-sm scale-105"
                  : "bg-[#FFFDF7] text-[#4A150B] border border-[#EADBC8] hover:bg-[#F3EAD8]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-[#FFFDF7] rounded-2xl border border-[#EADBC8] p-5 shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 border-2 flex items-center justify-center rounded-xs ${
                      item.isVeg ? "border-emerald-600" : "border-rose-600"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.isVeg ? "bg-emerald-600" : "bg-rose-600"
                      }`}
                    />
                  </span>
                  <h3 className="font-serif font-bold text-base text-[#4A150B]">
                    {item.name}
                  </h3>
                </div>

                <span className="font-serif font-bold text-base text-[#D97706]">
                  {item.price}
                </span>
              </div>

              {item.isBestseller && (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[#D97706] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 mt-1">
                  <Star className="w-2.5 h-2.5 fill-[#D97706]" /> Itihaas Bestseller
                </span>
              )}

              <p className="text-xs text-[#6B5E55] mt-2 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
