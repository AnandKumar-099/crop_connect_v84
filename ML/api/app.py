from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
from tensorflow.keras.models import load_model
from sklearn.metrics.pairwise import cosine_similarity
import os

app = Flask(__name__)
CORS(app)

# Load Models (Lazy loading or at startup)
# We load at startup to ensure speed during requests
print("Loading models...")

# paths
MODEL_DIR = os.path.join(os.path.dirname(__file__), '../models')

# 1. Price Model
try:
    price_model = load_model(os.path.join(MODEL_DIR, 'lstm_price_model.keras'))
    price_scaler = joblib.load(os.path.join(MODEL_DIR, 'scaler_price.pkl'))
    print("Price model loaded.")
except Exception as e:
    print(f"Error loading Price model: {e}")
    price_model = None

# 2. Risk Model
try:
    risk_model = joblib.load(os.path.join(MODEL_DIR, 'risk_model.pkl'))
    print("Risk model loaded.")
except Exception as e:
    print(f"Error loading Risk model: {e}")
    risk_model = None

# 3. Recommender Model
try:
    recommender_data = joblib.load(os.path.join(MODEL_DIR, 'recommender.pkl'))
    tfidf_vectorizer = recommender_data['vectorizer']
    buyer_vectors = recommender_data['buyer_vectors']
    buyers_df = recommender_data['buyers_df']
    print("Recommender model loaded.")
except Exception as e:
    print(f"Error loading Recommender model: {e}")
    recommender_data = None


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

@app.route('/predict-price', methods=['POST'])
def predict_price():
    data = request.json
    crop = data.get('crop', 'Wheat')
    location = data.get('location', '')
    days_ahead = data.get('days_ahead', 30)

    if not price_model:
        # FALLBACK: Random mock prediction if model is missing
        print("Using fallback mock prediction")
        base_price = { 'Wheat': 2200, 'Rice': 4500, 'Corn': 1800, 'Soybean': 4000 }.get(crop, 3000)
        prediction = base_price * (1 + (np.random.random() - 0.5) * 0.1)
        current_price = base_price
        
        # Mock history
        history_data = []
        for i in range(30):
            history_data.append({
                "date": f"Day -{30-i}",
                "price": base_price * (1 + (np.random.random() - 0.5) * 0.05)
            })
    else:
        # Real Inference Logic
        try:
            # 1. Get recent data (from CSV or DB). 
            history = pd.read_csv(os.path.join(os.path.dirname(__file__), '../data/crop_price_history.csv'))
            
            # Filter by crop
            records = history[history['Crop'] == crop]
            if records.empty:
                # Fallback if crop not found
                current_price = 2000
                prediction = 2100
                history_data = []
            else:
                # Take last 30 days
                last_30_df = records.sort_values('Date').tail(30)
                last_30 = last_30_df[['Price', 'Rainfall', 'Temperature']].values
                
                # Prepare history for frontend
                history_data = []
                for _, row in last_30_df.iterrows():
                    history_data.append({
                        "date": row['Date'],
                        "price": float(row['Price'])
                    })

                if len(last_30) < 30:
                     # Pad if not enough data
                     last_30 = np.concatenate([last_30, last_30[:30-len(last_30)]])
                
                # Scale
                last_30_scaled = price_scaler.transform(last_30)
                input_seq = np.array([last_30_scaled])
                
                # Predict
                predicted_scaled = price_model.predict(input_seq)
                
                # Inverse transform
                price_min = price_scaler.data_min_[0]
                price_max = price_scaler.data_max_[0]
                
                predicted_price = predicted_scaled[0][0] * (price_max - price_min) + price_min
                
                current_price = last_30[-1][0]
                prediction = float(predicted_price)
        except Exception as e:
            print(f"Prediction error: {e}")
            base_price = 2500
            prediction = base_price
            current_price = base_price
            history_data = []
        
    trend = "increasing" if prediction > current_price else "decreasing"
    
    return jsonify({
        "predicted_price": round(prediction, 2),
        "trend": trend,
        "days_ahead": days_ahead,
        "history": history_data
    })

@app.route('/predict-risk', methods=['POST'])
def predict_risk():
    if not risk_model:
        return jsonify({"error": "Model not loaded"}), 500
        
    data = request.json
    # Expected: { crop, quantity, amount, past_defaults, weather_risk, reliability }
    
    # Create DataFrame for model
    input_df = pd.DataFrame([{
        'Crop': data.get('crop', 'Rice'),
        'Quantity': float(data.get('quantity', 50)),
        'Amount': float(data.get('amount', 100000)),
        'PastDefaults': int(data.get('past_defaults', 0)),
        'WeatherRiskIndex': float(data.get('weather_risk', 0.5)),
        'FarmerReliability': float(data.get('reliability', 4.0))
    }])
    
    # Predict Probability
    risk_prob = risk_model.predict_proba(input_df)[0][1] # Probability of Class 1 (Breach)
    
    risk_level = "LOW"
    if risk_prob > 0.7:
        risk_level = "HIGH"
    elif risk_prob > 0.3:
        risk_level = "MEDIUM"
        
    return jsonify({
        "risk_score": round(risk_prob, 2),
        "risk_level": risk_level
    })

@app.route('/recommend', methods=['POST'])
def recommend():
    if not recommender_data:
        return jsonify({"error": "Model not loaded"}), 500
        
    data = request.json
    # Input: { crop, location, price_max } 
    # Use these to form a query vector or filter first
    
    crop = data.get('crop', '')
    location = data.get('location', '')
    price = data.get('price', 0)
    
    # Query string construction
    query = f"{crop} {location} {price}"
    
    # Transform query
    query_vec = tfidf_vectorizer.transform([query])
    
    # Similarity
    cosine_sim = cosine_similarity(query_vec, buyer_vectors).flatten()
    
    # Get top 5 indices
    top_indices = cosine_sim.argsort()[-5:][::-1]
    
    recommendations = []
    for idx in top_indices:
        score = cosine_sim[idx]
        if score > 0.1: # Threshold to filter bad matches
            buyer = buyers_df.iloc[idx]
            recommendations.append({
                "buyerId": buyer['BuyerID'],
                "name": buyer['Name'],
                "location": buyer['Location'],
                "preferredCrop": buyer['PreferredCrop'],
                "budget": int(buyer['MaxBudget']),
                "score": round(float(score), 2)
            })
            
    return jsonify({
        "recommended_buyers": recommendations
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
