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
