# backend/data_processor.py
import pandas as pd
import os
from pathlib import Path

def process_doctor_data(input_folder='data', output_file='backend/doctors.db'):
    # Initialize empty list to store all data
    all_doctors = []
    
    # Get all CSV files in data directory
    csv_files = [f for f in Path(input_folder).glob('*.csv')]
    
    # Process each file
    for file in csv_files:
        try:
            df = pd.read_csv(file)
            
            # Standardize column names (adjust based on your actual CSV structure)
            # Create a mapping of possible column name variations to standard names
            column_mapping = {}
            possible_columns = {
                'name': ['Dr. Name', 'Doctor Name', 'Name', 'Doctor'],
                'specialization': ['Specialization', 'Speciality', 'Department', 'Field'],
                'hospital': ['Hospital', 'Clinic', 'Center', 'Institution'],
                'district': ['District', 'Location', 'City', 'Region'],
                'phone': ['Phone', 'Contact', 'Phone Number', 'Mobile'],
                'experience': ['Experience', 'Years', 'Years of Experience'],
                'rating': ['Rating', 'Score', 'Review Score']
            }
            
            # Find matching columns in the CSV
            for standard_name, possible_names in possible_columns.items():
                for possible_name in possible_names:
                    if possible_name in df.columns:
                        column_mapping[possible_name] = standard_name
                        break
            
            # Rename columns based on mapping
            df = df.rename(columns=column_mapping)
            
            # Add missing columns with default values
            defaults = {
                'name': 'Unknown Doctor',
                'specialization': 'General Physician',
                'hospital': 'Unknown Hospital',
                'district': 'Unknown District',
                'phone': 'Not Available',
                'experience': 'Not Specified',
                'rating': 4.0,
                'languages': 'Bengali,English'
            }
            
            for col, default_val in defaults.items():
                if col not in df.columns:
                    df[col] = default_val
            
            all_doctors.append(df)
        except Exception as e:
            print(f"Error processing {file}: {e}")
    
    # Combine all DataFrames if we found any valid data
    if not all_doctors:
        print("No valid doctor data found in CSV files")
        return
    
    combined_df = pd.concat(all_doctors, ignore_index=True)
    
    # Clean data
    combined_df['languages'] = combined_df['languages'].astype(str).str.split(',')
    
    # Convert rating to numeric safely
    combined_df['rating'] = pd.to_numeric(combined_df['rating'], errors='coerce')
    combined_df['rating'] = combined_df['rating'].fillna(4.0)  # Default to 4.0 if invalid
    
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    # Save to SQLite database
    try:
        import sqlite3
        conn = sqlite3.connect(output_file)
        combined_df.to_sql('doctors', conn, if_exists='replace', index=False)
        conn.close()
        
        print(f"Successfully processed {len(combined_df)} doctors")
        print(f"Database saved to {output_file}")
        
        # Print summary of the processed data
        print("\nData Summary:")
        print(f"Specializations: {combined_df['specialization'].unique()}")
        print(f"Districts: {combined_df['district'].unique()}")
        print(f"Average Rating: {combined_df['rating'].mean():.1f}")
        
    except Exception as e:
        print(f"Error saving database: {e}")

if __name__ == '__main__':
    process_doctor_data()