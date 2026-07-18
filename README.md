# Aegis SOC: AI-Powered Cyber Attack Detection & Threat Intelligence Platform

Aegis SOC is a production-grade, enterprise-ready Security Operations Center (SOC) web application that utilizes Machine Learning, Deep Learning, and Explainable AI (SHAP) to detect network-level cyber attacks, classify threats, map them to MITRE ATT&CK vectors, and display real-time analytics.

This project is built as a portfolio-quality Final Year Engineering Project.

---

## 🚀 Key Features

* **Ensemble Prediction Engine**: Blends Random Forest, XGBoost, and sequence-based LSTM deep learning models with weighted voting to compute high-confidence attack predictions and risk scores.
* **Explainable AI (SHAP)**: Renders feature importance explanations for each classification to mitigate alert fatigue.
* **Threat Intelligence Engine**: Automatically maps predicted attack types to MITRE ATT&CK matrices, identifying descriptions and mitigation recipes.
* **Modern SOC Console**: Sleek, glassmorphism-based dark theme dashboard utilizing Framer Motion and Recharts to visualize security operations.
* **Secure API Gateway**: FastAPI backend securing endpoints with JWT authentication and RBAC permissions.
* **Persistent Attack Logs**: Stores alert logs, prediction histories, and model metrics inside a SQLite/PostgreSQL database.

---

## 🛠️ Tech Stack

### Frontend
* **Core**: React, TypeScript, Vite
* **Styles & Motion**: Tailwind CSS, Framer Motion
* **Routing & State**: React Router, React Query
* **Visualizations**: Recharts, Leaflet (threat maps)

### Backend
* **API Engine**: Python, FastAPI, Uvicorn, Pydantic
* **Database**: PostgreSQL (with SQLite fall-back)
* **ML & DL**: Scikit-Learn, XGBoost, TensorFlow, SHAP, Joblib

---

## 📁 Repository Structure

```text
├── backend/
│   ├── app/            # FastAPI Application
│   │   ├── api/        # Endpoint routers
│   │   ├── core/       # Configurations and DB connection
│   │   ├── models/     # SQLAlchemy Database schemas
│   │   ├── schemas/    # Pydantic validation models
│   │   └── services/   # Ensemble engine, SHAP explainer
│   ├── ml/             # Preprocessing & model training pipelines
│   └── data/           # Cache directory for datasets and model binaries
├── frontend/
│   ├── src/            # React/TS Source Files
│   │   ├── components/ # Layout and widget components
│   │   ├── pages/      # Dashboard and Login views
│   │   └── context/    # Session contexts (Auth)
└── README.md
```
