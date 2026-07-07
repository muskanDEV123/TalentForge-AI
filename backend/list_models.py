"""
Backend folder ke andar chalao: python list_models.py
Ye batayega kaunse Gemini models abhi tumhari API key ke liye available hain
aur kaunse generateContent support karte hain.
"""
import os
import google.generativeai as genai
from dotenv import load_dotenv
 
load_dotenv()
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
 
print("=" * 60)
print("Available models that support generateContent:")
print("=" * 60)
for m in genai.list_models():
    if "generateContent" in m.supported_generation_methods:
        print(m.name)
print("=" * 60)
 