import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score
import joblib
import os

def train_risk_model():
    print("Loading contract risk data...")
    df = pd.read_csv('ml/data/contract_risk_data.csv')
    
    # Features and Target
    X = df[['Crop', 'Quantity', 'Amount', 'PastDefaults', 'WeatherRiskIndex', 'FarmerReliability']]
    y = df['ContractBreach']
    
    # Preprocessing
    numeric_features = ['Quantity', 'Amount', 'PastDefaults', 'WeatherRiskIndex', 'FarmerReliability']
    categorical_features = ['Crop']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])
    
    # Pipeline
    clf = Pipeline(steps=[('preprocessor', preprocessor),
                          ('classifier', LogisticRegression())])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Logistic Regression model...")
    clf.fit(X_train, y_train)
    
    y_pred = clf.predict(X_test)
    print("Model Accuracy:", accuracy_score(y_test, y_pred))
    
    # Save model
    joblib.dump(clf, 'ml/models/risk_model.pkl')
    print("Saved ml/models/risk_model.pkl")

if __name__ == "__main__":
    train_risk_model()
