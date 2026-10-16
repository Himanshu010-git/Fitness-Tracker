# FitTrack AI — Intelligent Fitness Tracker Website

A modern, full-stack, responsive fitness tracking application powered by machine learning algorithms for activity monitoring, calorie burn estimation, habit consistency analysis, and workout readiness recommendations.

Built as an academic Machine Learning laboratory project combining a professional React + Tailwind CSS frontend with a modular Python FastAPI backend.

---

## 🚀 Key Highlights & Features

1. **Daily Fitness Tracking:**
   - Log workout date, activity type (running, walking, cycling, strength, yoga, swimming, HIIT), duration, distance, steps, water intake, sleep duration, and body weight.
   - Filter, edit, and delete activities with real-time UI updates.

2. **Machine Learning Algorithms (4 Dedicated Implementations):**
   - **Algorithm 1 (KNN Regression):** Predicts continuous calorie expenditure based on duration, distance, steps, modality, and user body weight.
   - **Algorithm 2 (KNN Classification):** Classifies daily movement into *Low Activity*, *Moderate Activity*, or *High Activity* tiers.
   - **Algorithm 3 (Find-S Algorithm):** Implemented **from scratch in pure Python** to learn the most specific hypothesis for optimal habit adherence.
   - **Algorithm 4 (ID3 Decision Tree):** Implemented **from scratch in pure Python** with Shannon Entropy and Information Gain to formulate workout readiness recommendations (*Rest & Recovery*, *Light Mobility*, *Standard Workout*, *High Intensity*).

3. **Fitness Goals & Milestone Tracking:**
   - Create daily and weekly targets (steps, active minutes, running distance, water consumption, sleep).
   - Dynamic progress calculations based directly on logged workouts with percentage completion bars.

4. **Progress Analytics:**
   - Interactive Recharts visualizations with custom dark glassmorphic tooltips.
   - Time-series step trajectory, calorie trends, exercise modality distribution, and weight trends across 7-day, 30-day, 90-day, or all-time ranges.

5. **AI Fitness Insights & Interactive ML Sandbox:**
   - Personalized coaching synthesis without exposing raw formulas to the user.
   - Interactive testing sandboxes for testing all 4 algorithms with live parameter tweaking.
   - College Viva & Model Inspection tab detailing training datasets, algorithm internals, and evaluation metrics.

---

## 🛠️ Technology Stack

- **Frontend:**
  - React 18 / 19 with Vite
  - Tailwind CSS 3.4 for dark modern aesthetics
  - React Router DOM 6+ for client-side routing
  - Recharts for charts and fitness visual analytics
  - Lucide React for consistent icons

- **Backend:**
  - Python 3.10+ / 3.14
  - FastAPI for high-performance REST APIs
  - Uvicorn development ASGI server
  - SQLite for persistent storage with SQLAlchemy ORM
  - Pydantic v2 for request validation and type safety
  - Scikit-learn, Pandas, NumPy for KNN models and data pipelines
  - Pytest for automated unit and integration tests

---

## 📁 Project Folder Structure

```text
FitBuddy/
├── backend/
│   ├── main.py                     # FastAPI entry point & CORS configuration
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Backend configuration template
│   ├── database/
│   │   ├── connection.py           # SQLite engine & session management
│   │   └── models.py               # SQLAlchemy ORM models (Activity, Goal, Profile)
│   ├── data/
│   │   ├── fitness_regression.csv  # Calorie regression training data
│   │   ├── fitness_classification.csv # Activity level classification data
│   │   ├── fitness_concepts.csv    # Habit concept & decision rules data
│   │   ├── generate_data.py        # Dataset generation script
│   │   └── seed_db.py              # Initial activity database seeder
│   ├── ml_models/
│   │   ├── __init__.py             # Model exports
│   │   ├── preprocessing.py        # Feature validation, binning & scaling
│   │   ├── knn_regression.py       # Algorithm 1: KNN Calorie Regressor
│   │   ├── knn_classification.py   # Algorithm 2: KNN Activity Classifier
│   │   ├── find_s.py               # Algorithm 3: Find-S (from scratch)
│   │   ├── id3_decision_tree.py    # Algorithm 4: ID3 Decision Tree (from scratch)
│   │   └── model_service.py        # Singleton coordinating all 4 models
│   ├── routes/
│   │   ├── schemas.py              # Pydantic validation models
│   │   ├── activity_routes.py      # /api/activities endpoints
│   │   ├── goal_routes.py          # /api/goals endpoints
│   │   ├── profile_routes.py       # /api/profile endpoints
│   │   ├── analytics_routes.py     # /api/analytics endpoints
│   │   └── insight_routes.py       # /api/insights endpoints
│   ├── services/
│   │   ├── activity_service.py     # Activity business logic
│   │   ├── goal_service.py         # Dynamic goal calculation
│   │   └── recommendation_service.py # Synthesized coaching engine
│   └── tests/
│       ├── test_knn_regression.py  # KNN regression unit tests
│       ├── test_knn_classification.py # KNN classification unit tests
│       ├── test_find_s.py          # Find-S concept learning unit tests
│       ├── test_id3_decision_tree.py # ID3 decision tree unit tests
│       └── test_api_endpoints.py   # FastAPI integration test suite
├── frontend/
│   ├── index.html                  # HTML5 entry with Inter font
│   ├── package.json                # Frontend dependencies
│   ├── vite.config.js              # Vite configuration
│   ├── tailwind.config.js          # Tailwind theme & color tokens
│   ├── postcss.config.js           # PostCSS configuration
│   ├── .env                        # Vite API URL configuration
│   └── src/
│       ├── main.jsx                # React DOM render entry
│       ├── App.jsx                 # Route management & modal orchestration
│       ├── index.css               # Tailwind directives & glassmorphic styles
│       ├── components/
│       │   ├── Sidebar.jsx         # Responsive sidebar navigation
│       │   ├── Navbar.jsx          # Top bar with quick action & profile avatar
│       │   ├── StatCard.jsx        # Metric summary card
│       │   ├── ProgressBar.jsx     # Gradient progress indicator
│       │   ├── ActivityForm.jsx    # Workout logging & live preview form
│       │   ├── ActivityTable.jsx   # Filterable activity records table
│       │   ├── FitnessChart.jsx    # Recharts wrapper for Area/Bar/Pie
│       │   ├── GoalCard.jsx        # Goal tracking milestone card
│       │   ├── InsightCard.jsx     # AI model output card
│       │   ├── Modal.jsx           # Accessible dialog overlay
│       │   ├── LoadingState.jsx    # Animated loading spinner
│       │   └── EmptyState.jsx      # Clean zero-data fallback
│       ├── pages/
│       │   ├── Dashboard.jsx       # Overview dashboard
│       │   ├── ActivityTracker.jsx # Activity logging & history
│       │   ├── FitnessGoals.jsx    # Milestone targets
│       │   ├── ProgressAnalytics.jsx # Time-series charts & distributions
│       │   ├── AIFitnessInsights.jsx # ML insights & interactive sandboxes
│       │   └── ProfileSettings.jsx # Personal metrics & BMI calculator
│       └── services/
│           └── api.js              # Centralized backend HTTP client
├── ML_ALGORITHM_NOTES.md           # Student viva and theoretical guide
└── README.md                       # Comprehensive setup and documentation
```

---

## ⚡ Windows Quickstart & Execution

### Prerequisites
- **Python 3.10+** (with pip)
- **Node.js 18+** (with npm)

### Step 1: Clone or Open Workspace
Open a PowerShell terminal in the project directory:
```powershell
cd "c:\Users\Himanshu Sharma\OneDrive\ドキュメント\Himanshu personal\5th_Semester\Machine_Learning_LAB\FitBuddy"
```

### Step 2: Backend Setup & Execution
1. Install Python dependencies:
   ```powershell
   python -m pip install -r backend/requirements.txt
   ```
2. (Optional) Run automated test suite:
   ```powershell
   python -m pytest backend/tests -v
   ```
   *(All 21 unit and integration tests will execute and pass.)*

3. Start the FastAPI backend server:
   ```powershell
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   - **Backend API Docs (Swagger UI):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - **Backend Health Check:** [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### Step 3: Frontend Setup & Execution
Open a second PowerShell terminal in the `frontend` folder:
```powershell
cd "c:\Users\Himanshu Sharma\OneDrive\ドキュメント\Himanshu personal\5th_Semester\Machine_Learning_LAB\FitBuddy\frontend"
```

1. Install frontend packages:
   ```powershell
   npm install
   ```

2. Start the Vite local development server:
   ```powershell
   npm run dev
   ```
   - **Website Local URL:** [http://localhost:5173](http://localhost:5173)

---

## 🧪 Testing Verification

The backend includes a comprehensive test suite in `backend/tests/`:
- `test_knn_regression.py`: Validates predictions, input bounds, feature scaling, and zero-duration cases.
- `test_knn_classification.py`: Validates activity tiers, probability distribution, and edge cases.
- `test_find_s.py`: Validates hypothesis generalization, negative example ignoring, and concept satisfaction.
- `test_id3_decision_tree.py`: Validates Shannon entropy, Information Gain, recursive tree building, and fallback on unseen categories.
- `test_api_endpoints.py`: Tests full CRUD operations for activities, goals, profile, analytics, and insights.

Execute tests with:
```powershell
python -m pytest backend/tests
```

---

## 📖 Student Learning & Viva Notes

For detailed mathematical derivations, entropy equations, worked step-by-step examples, and answers to typical viva examination questions, refer to:
👉 **[`ML_ALGORITHM_NOTES.md`](file:///c:/Users/Himanshu%20Sharma/OneDrive/ドキュメント/Himanshu%20personal/5th_Semester/Machine_Learning_LAB/FitBuddy/ML_ALGORITHM_NOTES.md)**

---

## ⚠️ Notes & Limitations

- **Non-Medical Disclaimer:** Predictions generated by the models are designed for academic and motivational purposes; they are not scientifically or medically validated measurements.
- **Single-User Architecture:** Designed as an academic single-user application. Database is local SQLite.
