import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import os

# Ensure data directory exists
os.makedirs('ml/data', exist_ok=True)

# 1. Generate crop_price_history.csv (Time-series for LSTM)
def generate_price_history():
    print("Generating crop_price_history.csv...")
    start_date = datetime(2023, 1, 1)
    end_date = datetime(2025, 12, 31)
    date_range = pd.date_range(start=start_date, end=end_date)
    
    crops = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane']
    markets = ['Guntur', 'Warangal', 'Nizamabad', 'Kurnool', 'Vijayawada']
    
    data = []
    
    for crop in crops:
        base_price = random.randint(2000, 5000)
        for market in markets:
            # Create a localized trend for each market/crop
            price = base_price + random.randint(-200, 200)
            trend = random.choice([-1, 1]) * random.uniform(0.5, 2.0)
            
            for date in date_range:
                # Add seasonality and random noise
                month = date.month
                seasonality = np.sin((month / 12) * 2 * np.pi) * 200
                
                # Random daily fluctuation
                price += trend + random.normalvariate(0, 20) + (seasonality * 0.05)
                price = max(1000, price) # Ensure price doesn't go below 1000
                
                rainfall = random.uniform(0, 20) if month in [6, 7, 8, 9] else random.uniform(0, 5)
                temperature = random.uniform(20, 40) - (rainfall * 0.5)
                
                data.append({
                    'Date': date.strftime('%Y-%m-%d'),
                    'Market': market,
                    'Crop': crop,
                    'Price': round(price, 2),
                    'Rainfall': round(rainfall, 2),
                    'Temperature': round(temperature, 2)
                })
    
    df = pd.DataFrame(data)
    df.to_csv('ml/data/crop_price_history.csv', index=False)
    print("Saved crop_price_history.csv")

# 2. Generate contract_risk_data.csv (For Logistic Regression)
def generate_risk_data():
    print("Generating contract_risk_data.csv...")
    num_samples = 1000
    data = []
    
    for i in range(num_samples):
        farmer_id = f"F{random.randint(100, 999)}"
        buyer_id = f"B{random.randint(100, 999)}"
        crop = random.choice(['Rice', 'Wheat', 'Maize', 'Cotton'])
        quantity = random.randint(10, 100) # Quintals
        amount = quantity * random.randint(2000, 4000)
        
        past_defaults = 0
        if random.random() < 0.2:
            past_defaults = random.randint(1, 3)
            
        weather_risk_index = random.uniform(0, 1) # 0 = Safe, 1 = High Risk
        farmer_reliability = random.uniform(0.5, 1.0) - (past_defaults * 0.1)
        
        # Determine breach probability based on factors
        breach_prob = (0.3 * weather_risk_index) + (0.5 * (1 - farmer_reliability))
        if amount > 200000:
            breach_prob += 0.1
            
        contract_breach = 1 if random.random() < breach_prob else 0
        
        data.append({
            'ContractID': f"C{1000+i}",
            'FarmerID': farmer_id,
            'BuyerID': buyer_id,
            'Crop': crop,
            'Quantity': quantity,
            'Amount': amount,
            'PastDefaults': past_defaults,
            'WeatherRiskIndex': round(weather_risk_index, 2),
            'FarmerReliability': round(farmer_reliability, 2),
            'ContractBreach': contract_breach
        })
        
    df = pd.DataFrame(data)
    df.to_csv('ml/data/contract_risk_data.csv', index=False)
    print("Saved contract_risk_data.csv")

# 3. Generate farmers.csv and buyers.csv (For Matchmaking)
def generate_profiles():
    print("Generating user profiles...")
    
    # Farmers
    crops = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Chilli', 'Turmeric']
    locations = ['Guntur', 'Warangal', 'Nizamabad', 'Kurnool', 'Vijayawada', 'Nellore', 'Ongole']
    
    farmers = []
    for i in range(50):
        farmers.append({
            'FarmerID': f"F{100+i}",
            'Name': f"Farmer {i+1}",
            'Location': random.choice(locations),
            'Crop': random.choice(crops),
            'AvgPrice': random.randint(1800, 5500),
            'ReliabilityScore': round(random.uniform(3.5, 5.0), 1)
        })
    pd.DataFrame(farmers).to_csv('ml/data/farmers.csv', index=False)
    
    # Buyers
    buyers = []
    for i in range(30):
        buyers.append({
            'BuyerID': f"B{100+i}",
            'Name': f"Buyer {i+1}",
            'Location': random.choice(locations),
            'PreferredCrop': random.choice(crops),
            'MaxBudget': random.randint(2000, 6000),
            'MinReliability': round(random.uniform(3.0, 4.5), 1)
        })
    pd.DataFrame(buyers).to_csv('ml/data/buyers.csv', index=False)
    print("Saved farmers.csv and buyers.csv")

if __name__ == "__main__":
    generate_price_history()
    generate_risk_data()
    generate_profiles()
    print("All data generated successfully.")
