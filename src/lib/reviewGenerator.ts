/**
 * Review Generator for Itihaas Restaurant & Banquets
 * Generates natural, human-like reviews based on star rating and selected tags.
 */

export interface ReviewGeneratorParams {
  rating: number;
  tags: string[];
}

export function generateReviewText({ rating, tags }: ReviewGeneratorParams): string {
  const selectedTags = tags.length > 0 ? tags : ["Overall Experience"];
  const has = (item: string) => selectedTags.some((t) => t.toLowerCase() === item.toLowerCase());

  // 5 STARS REVIEWS
  if (rating === 5) {
    if (has("Food") && has("Taste")) {
      let text = "Had an extraordinary dining experience at Itihaas. The food was sensational and the authentic taste truly delighted everyone at our table.";
      if (has("Valet Parking")) {
        text += " The valet parking service was exceptionally fast and hassle-free.";
      } else if (has("Ambience") || has("Hospitality")) {
        text += " The majestic ambience and regal hospitality made our evening truly memorable.";
      } else {
        text += " Highly recommended for families and food enthusiasts!";
      }
      return text;
    }

    if (has("Ambience") && (has("Service") || has("Staff"))) {
      let text = "Had a wonderful experience at Itihaas Restaurant & Banquets. The ambience was warm and royal, while the staff provided attentive, top-notch service throughout.";
      if (has("Food")) {
        text += " Every dish served was rich in traditional flavor.";
      }
      if (has("Valet Parking")) {
        text += " Plus, the valet service was effortless and polite.";
      }
      return text;
    }

    if (has("Valet Parking")) {
      let text = "The overall experience at Itihaas was outstanding. Special mention to their valet parking team—extremely courteous, prompt, and convenient!";
      if (has("Food") || has("Taste")) {
        text += " The cuisine was equally memorable with timeless flavors.";
      }
      return text;
    }

    if (has("Cleanliness") || has("Hospitality")) {
      return "Impeccable cleanliness and royal hospitality at Itihaas! The staff took great care of us, making us feel right at home. We will definitely visit again soon.";
    }

    return "Dining at Itihaas was an absolute pleasure! Outstanding food, gorgeous ambience, and wonderful service. Truly timeless flavors rooted in tradition.";
  }

  // 4 STARS REVIEWS
  if (rating === 4) {
    const parts: string[] = ["We had a very enjoyable visit to Itihaas Restaurant & Banquets."];

    if (has("Food") || has("Taste")) {
      parts.push("The food was rich and full of authentic flavor.");
    }
    if (has("Ambience")) {
      parts.push("The setting and décor created a fine dining atmosphere.");
    }
    if (has("Valet Parking")) {
      parts.push("The valet parking service made our arrival and exit seamless.");
    }
    if (has("Service") || has("Staff")) {
      parts.push("Service was polite and helpful.");
    }

    parts.push("Overall a great experience and we look forward to coming back.");
    return parts.join(" ");
  }

  // 3 STARS REVIEWS
  if (rating === 3) {
    let text = "The experience at Itihaas was good overall. ";
    if (has("Food") || has("Taste")) {
      text += "The food tasted nice, though there is a bit of room for improvement in speed. ";
    } else {
      text += "The ambience was decent and pleasant. ";
    }
    if (has("Valet Parking")) {
      text += "The valet team managed the vehicle safely.";
    } else {
      text += "Service was average during peak banquet hours.";
    }
    return text;
  }

  // 1-2 STARS REVIEWS
  let lowText = `Visited Itihaas today. While the potential is clear, our experience was below expectations in terms of ${selectedTags.slice(0, 2).join(" and ")}. `;
  lowText += "We hope management takes note and enhances the customer experience for future visits.";
  return lowText;
}
