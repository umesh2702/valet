export interface RestaurantConfig {
  name: string;
  tagline: string;
  subtagline: string;
  logo: string;
  ucreatesLogo: string;
  websiteUrl: string;
  instagramUrl: string;
  menuUrl: string;
  googleReviewUrl: string;
  phone: string;
  location: string;
  theme: {
    creamBg: string;
    creamCard: string;
    burgundyPrimary: string;
    burgundyHover: string;
    burntOrange: string;
    burntOrangeHover: string;
    warmBeige: string;
    warmBeigeBorder: string;
    textDark: string;
    textMuted: string;
  };
}

export const restaurantConfig: RestaurantConfig = {
  name: process.env.NEXT_PUBLIC_RESTAURANT_NAME || "Itihaas Restaurant & Banquets",
  tagline: "TIMELESS FLAVOURS ROOTED IN TRADITIONS",
  subtagline: "Some functions feel like a festival. Yours could be next.",
  logo: "/images/itihaas-logo.png",
  ucreatesLogo: "/images/ucreates-logo.png",
  websiteUrl: process.env.NEXT_PUBLIC_WEBSITE_URL || "https://itihaasindia.in",
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/itihaas_hyd/",
  menuUrl: "/menu",
  googleReviewUrl: process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || "https://search.google.com/local/writereview?placeid=ChIJ_itihaas_demo_place_id",
  phone: "+91 9876543210",
  location: "Road No. 36, Jubilee Hills, Hyderabad",
  theme: {
    creamBg: "#FFFDF7",
    creamCard: "#FBF7EE",
    burgundyPrimary: "#4A150B",
    burgundyHover: "#3B0F07",
    burntOrange: "#D97706",
    burntOrangeHover: "#B45309",
    warmBeige: "#F3EAD8",
    warmBeigeBorder: "#EADBC8",
    textDark: "#2C1810",
    textMuted: "#6B5E55",
  },
};
