# symptom_analyzer.py
import openai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
openai.api_key = os.getenv('OPENAI_API_KEY')

# Predefined mappings for common symptoms (Bangladesh-specific)
SYMPTOM_SPECIALIZATION_MAP = {
    'chest pain': 'Cardiology',
    'heart pain': 'Cardiology',
    'breathing problem': 'Pulmonology',
    'headache': 'Neurology',
    'migraine': 'Neurology',
    'fever': 'General Physician',
    'stomach pain': 'Gastroenterology',
    'diarrhea': 'Gastroenterology',
    'vomiting': 'Gastroenterology',
    'skin rash': 'Dermatology',
    'joint pain': 'Orthopedics',
    'back pain': 'Orthopedics',
    'child sickness': 'Pediatrics'
}

def analyze_symptoms(symptoms_text):
    """
    Analyze symptoms and return appropriate medical specialization
    with Bangladesh-specific medical context consideration.
    """
    # Convert to lowercase for case-insensitive matching
    symptoms_lower = symptoms_text.lower()
    
    # First check against predefined mappings
    for symptom, specialization in SYMPTOM_SPECIALIZATION_MAP.items():
        if symptom in symptoms_lower:
            return specialization
    
    # If no direct match, use OpenAI API with Bangladesh context
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{
                "role": "system",
                "content": """You are a medical assistant specialized in Bangladesh healthcare. 
                Analyze the symptoms and return only the most appropriate medical specialization name. 
                Consider common Bangladeshi medical practices and disease patterns.
                Specializations: Cardiology, Neurology, Gastroenterology, General Physician, 
                Dermatology, Orthopedics, Pediatrics, Pulmonology, Endocrinology.
                Return just one specialization name, nothing else."""
            }, {
                "role": "user",
                "content": f"Symptoms: {symptoms_text}\nPatient Location: Bangladesh"
            }],
            temperature=0.3,
            max_tokens=20
        )
        
        # Clean and return the specialization
        specialization = response.choices[0].message.content.strip()
        return specialization.split('.')[0].split('\n')[0]
        
    except Exception as e:
        print(f"AI analysis error: {e}")
        return "General Physician"  # Fallback option

# For testing locally
if __name__ == "__main__":
    test_symptoms = input("Enter symptoms: ")
    result = analyze_symptoms(test_symptoms)
    print(f"Recommended specialization: {result}")