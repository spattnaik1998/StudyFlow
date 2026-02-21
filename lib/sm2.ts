/**
 * SM-2 Spaced Repetition Algorithm
 * Reference: https://en.wikipedia.org/wiki/Spaced_repetition#SM-2
 */

export interface SM2Result {
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review_at: Date;
  mastery_level: "not_started" | "learning" | "familiar" | "proficient" | "mastered";
}

export function computeSM2(
  quality: number,
  current_ef: number = 2.5,
  current_interval: number = 0,
  current_reps: number = 0
): SM2Result {
  // Quality must be 0-5
  const q = Math.max(0, Math.min(5, quality));

  let new_ef = current_ef;
  let new_interval = current_interval;
  let new_reps = current_reps;

  if (q < 3) {
    // Failed to recall — reset
    new_reps = 0;
    new_interval = 1;
    new_ef = current_ef; // Keep ease factor unchanged on failure
  } else {
    // Successful recall
    new_reps = current_reps + 1;

    // Calculate interval
    if (new_reps === 1) {
      new_interval = 1;
    } else if (new_reps === 2) {
      new_interval = 6;
    } else {
      new_interval = Math.round(current_interval * current_ef);
    }

    // Update ease factor
    new_ef = current_ef + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);

    // Clamp ease factor (minimum 1.3)
    new_ef = Math.max(1.3, new_ef);
  }

  // Calculate next review date
  const next_review_at = new Date();
  next_review_at.setDate(next_review_at.getDate() + new_interval);

  // Determine mastery level based on repetitions
  let mastery_level: "not_started" | "learning" | "familiar" | "proficient" | "mastered";
  if (new_reps === 0) {
    mastery_level = "not_started";
  } else if (new_reps === 1) {
    mastery_level = "learning";
  } else if (new_reps <= 3) {
    mastery_level = "familiar";
  } else if (new_reps <= 6) {
    mastery_level = "proficient";
  } else {
    mastery_level = "mastered";
  }

  return {
    ease_factor: parseFloat(new_ef.toFixed(2)),
    interval: new_interval,
    repetitions: new_reps,
    next_review_at,
    mastery_level,
  };
}
