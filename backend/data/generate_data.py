"""
Script to generate documented academic fitness datasets for FitTrack AI:
1. fitness_regression.csv (for KNN Regression calorie estimation)
2. fitness_classification.csv (for KNN Classification activity level)
3. fitness_concepts.csv (for Find-S concept learning and ID3 Decision Tree)
"""
import os
import csv
import random

def generate_datasets(output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    random.seed(42)

    # 1. Regression Dataset: Estimating Calories Burned
    # MET values: Walking: 3.8, Running: 9.8, Cycling: 7.5, Strength Training: 5.0, Yoga: 3.0, Swimming: 8.0, HIIT: 10.0
    met_map = {
        "Walking": 3.8,
        "Running": 9.8,
        "Cycling": 7.5,
        "Strength Training": 5.0,
        "Yoga": 3.0,
        "Swimming": 8.0,
        "HIIT": 10.0
    }
    activities = list(met_map.keys())

    reg_file = os.path.join(output_dir, "fitness_regression.csv")
    with open(reg_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["duration_min", "distance_km", "steps", "activity_type", "body_weight_kg", "target_calories"])
        for _ in range(350):
            act = random.choice(activities)
            duration = random.randint(15, 120)
            weight = round(random.uniform(50.0, 95.0), 1)

            if act == "Walking":
                dist = round(duration * random.uniform(0.06, 0.09), 2)
                steps = int(dist * 1300 + random.randint(-150, 150))
            elif act == "Running":
                dist = round(duration * random.uniform(0.13, 0.20), 2)
                steps = int(dist * 1100 + random.randint(-100, 100))
            elif act == "Cycling":
                dist = round(duration * random.uniform(0.25, 0.45), 2)
                steps = random.randint(200, 1500)
            elif act == "Strength Training":
                dist = round(random.uniform(0.2, 0.8), 2)
                steps = random.randint(800, 3000)
            elif act == "Yoga":
                dist = round(random.uniform(0.1, 0.5), 2)
                steps = random.randint(300, 1200)
            elif act == "Swimming":
                dist = round(duration * random.uniform(0.02, 0.04), 2)
                steps = random.randint(200, 800)
            else: # HIIT
                dist = round(duration * random.uniform(0.08, 0.15), 2)
                steps = random.randint(2000, 6000)

            # Realistic formula: Calories = (MET * 3.5 * weight / 200) * duration + minor noise
            met = met_map[act]
            calories = (met * 3.5 * weight / 200.0) * duration
            # add minor natural physiological variance (+- 5%)
            calories = round(calories * random.uniform(0.95, 1.05), 1)
            writer.writerow([duration, dist, steps, act, weight, calories])

    # 2. Classification Dataset: Daily Activity Level
    clf_file = os.path.join(output_dir, "fitness_classification.csv")
    with open(clf_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["steps", "active_minutes", "distance_km", "exercise_frequency", "target_activity_level"])
        for _ in range(300):
            level = random.choices(["Low Activity", "Moderate Activity", "High Activity"], weights=[0.3, 0.4, 0.3])[0]
            if level == "Low Activity":
                steps = random.randint(1200, 4800)
                active_min = random.randint(10, 28)
                dist = round(steps * 0.00075 + random.uniform(-0.2, 0.2), 2)
                freq = random.randint(0, 2)
            elif level == "Moderate Activity":
                steps = random.randint(5200, 9600)
                active_min = random.randint(30, 58)
                dist = round(steps * 0.00075 + random.uniform(-0.3, 0.3), 2)
                freq = random.randint(2, 4)
            else: # High Activity
                steps = random.randint(10000, 19000)
                active_min = random.randint(60, 140)
                dist = round(steps * 0.00075 + random.uniform(-0.5, 0.5), 2)
                freq = random.randint(4, 7)
            writer.writerow([steps, active_min, max(0.5, dist), freq, level])

    # 3. Concepts Dataset: For Find-S & ID3 Decision Tree
    cnc_file = os.path.join(output_dir, "fitness_concepts.csv")
    duration_cats = ["Short", "Moderate", "Long"]
    frequency_cats = ["Low", "Medium", "High"]
    sleep_cats = ["Poor", "Adequate", "Optimal"]
    hydration_cats = ["Low", "Adequate", "Optimal"]
    step_cats = ["Low", "Moderate", "High"]
    fatigue_cats = ["Low", "Moderate", "High"]

    with open(cnc_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "step_cat", "duration_cat", "frequency_cat", "sleep_cat",
            "hydration_cat", "fatigue_level", "target_goal_met", "target_recommendation"
        ])

        # Generate a coherent dataset for rule learning
        for _ in range(150):
            step = random.choice(step_cats)
            dur = random.choice(duration_cats)
            freq = random.choice(frequency_cats)
            sleep = random.choice(sleep_cats)
            hyd = random.choice(hydration_cats)
            fatigue = random.choice(fatigue_cats)

            # Find-S target concept: An active day that meets goals
            # Positive if duration is not Short and sleep is not Poor and hyd is not Low
            if dur in ["Moderate", "Long"] and sleep in ["Adequate", "Optimal"] and hyd in ["Adequate", "Optimal"] and freq in ["Medium", "High"]:
                goal_met = "Yes"
            else:
                goal_met = "No"

            # ID3 Target Recommendation:
            # Deterministic/rule-oriented target for training the decision tree
            if sleep == "Poor" or fatigue == "High":
                rec = "Rest & Recovery"
            elif fatigue == "Moderate" or dur == "Short" or step == "Low":
                rec = "Light Mobility"
            elif sleep == "Optimal" and fatigue == "Low" and step == "High":
                rec = "High Intensity"
            else:
                rec = "Standard Workout"

            writer.writerow([step, dur, freq, sleep, hyd, fatigue, goal_met, rec])

    print("Successfully generated all 3 datasets in", output_dir)

if __name__ == "__main__":
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else "data"
    generate_datasets(out)
