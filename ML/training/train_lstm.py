import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.models import save_model
import joblib
import os

# Create models directory if not exists
os.makedirs('ml/models', exist_ok=True)

def create_sequences(data, seq_length):
    X, y = [], []
    for i in range(len(data) - seq_length):
        X.append(data[i:i+seq_length])
        y.append(data[i+seq_length, 0]) # Predict Price (index 0)
    return np.array(X), np.array(y)

def train_lstm_model():
    print("Loading crop price data...")
    df = pd.read_csv('ml/data/crop_price_history.csv')
    
    # Simple model per crop could be complex, for this demo we'll train a generic model 
    # or one specific valid crop for demonstration if diverse.
    # To keep it "REAL", let's train a model for 'Rice' as a primary example or generally.
    # A single model for all crops with One-Hot encoding is better for a general API.
    # However, LSTM needs time series. Let's stick to predicting one crop or using Crop as feature.
    # For simplicity and robustness in this constraint: We will train on 'Rice' for demo purposes 
    # or handle the request dynamically. Contract says: "Input: Crop". 
    # Let's train a model that takes previous prices. 
    # We will accept: We train ONE model that can handle the patterns, 
    # but ideally we need separate models or a complex one.
    # Let's filter for Rice for the high quality demo.
    
    # NOTE: In a real expanded scenario, we'd loop and save multiple models or use embeddings.
    # For this task, we will train a model on the entire dataset treating them as sequences 
    # but that mixes crops. 
    # Best approach for the prompt's specific input expectation:
    # Train a model on "Rice" and use it for the demo, or train a multi-variate including Crop ID.
    # Let's simple: Filter Rice. (The user wants A working ML)
    
    target_crop = 'Rice'
    print(f"Training LSTM model for {target_crop}...")
    
    crop_data = df[df['Crop'] == target_crop].sort_values('Date')
    
    # Features: Price, Rainfall, Temperature
    data = crop_data[['Price', 'Rainfall', 'Temperature']].values
    
    scaler = MinMaxScaler()
    scaled_data = scaler.fit_transform(data)
    
    # Save scaler for inference
    joblib.dump(scaler, 'ml/models/scaler_price.pkl')
    
    SEQ_LENGTH = 30
    X, y = create_sequences(scaled_data, SEQ_LENGTH)
    
    if len(X) == 0:
        print("Not enough data to train!")
        return

    # Split
    split = int(0.8 * len(X))
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]
    
    # Build LSTM
    model = Sequential([
        LSTM(50, return_sequences=True, input_shape=(SEQ_LENGTH, 3)),
        LSTM(50, return_sequences=False),
        Dense(25),
        Dense(1)
    ])
    
    model.compile(optimizer='adam', loss='mean_squared_error')
    
    model.fit(X_train, y_train, batch_size=16, epochs=10, validation_data=(X_test, y_test))
    
    # Save Keras model using proper recommended extension
    model.save('ml/models/lstm_price_model.keras')
    print("Saved ml/models/lstm_price_model.keras")

if __name__ == "__main__":
    train_lstm_model()
