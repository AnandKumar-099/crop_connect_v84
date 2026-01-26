# CropConnect ML Microservice

This directory contains the Machine Learning microservice for CropConnect.
It provides real-time predictions for Crop Prices, Contract Risk, and Farmer-Buyer Matchmaking.

## 📂 Structure
- `data/`: Synthetic datasets (Prices, Risk logs, Profiles).
- `training/`: Python scripts to train models.
- `models/`: Trained serialized models.
- `api/`: Flask application serving the predictions.

## 🚀 Setup & Installation

1. **Install Python 3.9+**
2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## 🏃‍♂️ Running the Service

Start the ML API server (Runs on Port 8000):
```bash
python api/app.py
```

Check health:
```
GET http://localhost:8000/health
```

## 🧠 Models & Features

### 1. Crop Price Forecasting (LSTM)
- **Endpoint**: `POST /predict-price`
- **Model**: TensorFlow/Keras LSTM trained on `crop_price_history.csv`.
- **Input**: `{ "crop": "Rice", "location": "Guntur" }`

### 2. Contract Risk Prediction (Logistic Regression)
- **Endpoint**: `POST /predict-risk`
- **Model**: Scikit-Learn Logistic Regression trained on `contract_risk_data.csv`.
- **Input**: `{ "crop": "Rice", "quantity": 50, "amount": 100000, ... }`

### 3. Matchmaking (Content-Based Filtering)
- **Endpoint**: `POST /recommend`
- **Model**: TF-IDF Vectorizer + Cosine Similarity on `buyers.csv`.
- **Input**: `{ "crop": "Rice", "location": "Guntur", "price": 4000 }`
