import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import os

def train_recommender():
    print("Loading profiles for matchmaking...")
    farmers = pd.read_csv('ml/data/farmers.csv')
    buyers = pd.read_csv('ml/data/buyers.csv')
    
    # We need to match Farmers to Buyers.
    # Content-Based: Create a profile string for each.
    
    # Prepare Buyer Profiles for the Vectorizer
    # We will vectorize Buyers based on their requirements
    buyers['features'] = buyers['PreferredCrop'] + " " + buyers['Location'] + " " + buyers['MaxBudget'].astype(str)
    
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(buyers['features'])
    
    # We will save the vectorizer and the buyer dataframe (with the matrix implies storage, 
    # but for simple deployment, we can just save the dataframe and re-compute or save matrix)
    # Better: Save the vectorizer and the vectors.
    
    print("Training Recommender (TF-IDF)...")
    
    model_data = {
        'vectorizer': tfidf,
        'buyer_vectors': tfidf_matrix,
        'buyers_df': buyers
    }
    
    joblib.dump(model_data, 'ml/models/recommender.pkl')
    print("Saved ml/models/recommender.pkl")

if __name__ == "__main__":
    train_recommender()
