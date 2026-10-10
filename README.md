# 🛡️ Gadget Guardian

### Smart E-Waste Management and Gadget Lifespan Prediction System Using Machine Learning

Gadget Guardian is a machine-learning-powered web application designed to help users understand the health and remaining lifespan of their electronic gadgets and make responsible e-waste management decisions.

The system analyzes gadget condition, usage patterns, battery health, performance, maintenance, and environmental factors to predict the **remaining lifespan of a gadget in months**.

It also provides:

- 📊 Gadget health score
- ⏳ Remaining lifespan prediction
- ⚠️ Risk factors
- 🔧 Maintenance recommendations
- 💡 Lifespan extension tips
- ♻️ E-waste management recommendations

---

## 🚀 Features

### 🔮 Lifespan Prediction

Predicts the remaining useful lifespan of a gadget using a **Multiple Linear Regression** machine learning model.

The system considers factors such as:

- Gadget type
- Age
- Daily usage
- Battery health
- Charge cycles
- Overheating
- Physical condition
- Maintenance frequency
- Repair count
- Performance score
- Storage usage
- Software updates
- Environmental stress
- Expected gadget life

### ❤️ Gadget Health Score

Gadget Guardian calculates a health score from **0–100** using multiple condition indicators.

The score considers:

- Battery health
- Performance
- Physical condition
- Maintenance
- Temperature/overheating condition

Health categories:

| Score | Category |
|---|---|
| 80–100 | Excellent |
| 60–79 | Good |
| 40–59 | Moderate |
| 20–39 | Poor |
| Below 20 | Critical |

### ⚠️ Risk Analysis

The system identifies potential problems such as:

- Poor battery health
- Excessive overheating
- High storage usage
- Low performance
- Poor maintenance
- Frequent repairs
- Outdated software

### 🔧 Maintenance Recommendations

Users receive personalized recommendations based on their gadget's condition.

Examples include:

- Battery replacement
- Cleaning cooling vents
- Reducing heavy usage
- Freeing storage
- Software updates
- Preventive maintenance
- Professional inspection

### ♻️ E-Waste Recommendations

The system promotes responsible e-waste management using the following hierarchy:

**Reuse → Repair → Refurbish → Recycle → Disposal**

Depending on the gadget's remaining lifespan and condition, the system may recommend:

- Continue using
- Repair and maintain
- Refurbish
- Donate
- Resell
- Reuse parts
- Authorized e-waste recycling

---

# 🧠 Machine Learning

The project uses **Multiple Linear Regression** to predict:

```text
Remaining_Lifespan_Months
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
#### System Architecture
                    ┌─────────────────────┐
                    │       User          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Gadget Guardian   │
                    │    Web Interface    │
                    └──────────┬──────────┘
                               │
                               │ JSON Request
                               ▼
                    ┌─────────────────────┐
                    │      Flask API      │
                    │      /predict       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Multiple Linear     │
                    │ Regression Model    │
                    │       (.pkl)        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Prediction + Health │
                    │ Risk + Maintenance  │
                    │ + E-Waste Analysis  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Results Dashboard │
                    └─────────────────────┘


🛠️ Technology Stack
Frontend
- React
- TypeScript
- TanStack Start
- Vite
- Tailwind CSS
- Recharts
Backend
- Python
- Flask
- Flask-CORS
Machine Learning
- Scikit-learn
- Pandas
- NumPy
- Joblib
Development Tools
- VS Code
- Git
- GitHub
- Google Colab


🎯 Project Objectives
1. Predict the remaining lifespan of electronic gadgets.
2. Estimate gadget health using multiple condition indicators.
3. Identify factors that may reduce gadget lifespan.
4. Provide personalized maintenance recommendations.
5. Encourage users to extend gadget life.
6. Promote responsible e-waste management.
7. Demonstrate the practical application of machine learning in sustainability.


🔮 Future Scope
Possible future improvements include:
- Real-world gadget datasets
- More machine learning algorithms
- Random Forest and XGBoost comparison
- Time-series lifespan prediction
- IoT-based gadget monitoring
- Battery degradation prediction
- Mobile application
- User accounts and prediction history
- Cloud deployment
- E-waste collection center integration
- Automated recycling-center recommendations
- Personalized maintenance reminders


⚠️ Limitations
- The current dataset is synthetic.
- Lifespan predictions are estimates and should not be treated as professional hardware diagnostics.
- Gadget lifespan can vary significantly depending on manufacturer, components, usage patterns, and repair quality.
- The current model uses Multiple Linear Regression and may not capture all nonlinear relationships.


👩‍💻 Project
Gadget Guardian
Smart E-Waste Management and Gadget Lifespan Prediction System Using Machine Learning
Developed as an academic machine learning and web application project.

## Local setup, persistence, and deployment

Install frontend dependencies with `npm install`, copy `.env.example` to
`.env`, and set `VITE_API_BASE_URL` to the Flask service. Vite development
automatically uses `http://127.0.0.1:5000` when this variable is blank; for a
production build it must be set to the deployed Flask origin. The frontend requires Flask by default;
`VITE_USE_MOCK=true` is only an intentional offline UI demo and does not
produce real ML results.

Start the backend from `backend/` with:

```text
<project-root>\.venv\Scripts\python.exe app.py
```

The command must run with `backend/` as its working directory (or use an
equivalent WSGI configuration such as `gunicorn --chdir backend app:app`), so
the local `database` module and model file resolve correctly. The Flask
development server uses port 5000 by default and honors `PORT` when hosted.

The backend loads the existing
`gadget_lifespan_linear_regression_model.pkl` without retraining or replacing
it. `POST /predict` preserves the existing request and response fields and
now saves every successful prediction to SQLite with a unique ID and UTC
timestamp. Configure the database path with `GADGET_GUARDIAN_DATABASE`.

Admin read APIs are available at `/admin/summary`, `/admin/records`,
`/admin/analytics`, and `/admin/model-metrics`. They require the
`X-Admin-Token` header matching the backend-only `ADMIN_API_TOKEN` environment
variable. The `/admin` UI does not claim to authenticate users; it asks for
this server-configured token and keeps it only in session storage. If the
token is not configured, the server returns an explicit configuration error.
Configure `CORS_ORIGINS` with exact trusted frontend origins rather than
using the wildcard in production.

MAE, MSE, RMSE, and R² are intentionally shown as unavailable until verified
evaluation outputs are supplied in `backend/model_metrics.json`. Recommendation
counts are inferred opportunities, not measured e-waste saved or environmental
impact.

SQLite is suitable for local development and persists across backend restarts,
but should not be used as a writable database on a Vercel/serverless
filesystem. Deploy Flask separately on a managed Python/container host and
use managed PostgreSQL for production. In the frontend hosting provider,
set the build-time variable `VITE_API_BASE_URL` to the complete deployed
backend origin, for example `https://api.example.com` (without `/predict`).
Redeploy the frontend after changing it because Vite embeds `VITE_*` values at
build time. Do not leave localhost URLs in production configuration.
