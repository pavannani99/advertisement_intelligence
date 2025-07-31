from typing import List
import re

# Try to import spacy, but don't fail if it's not available
try:
    import spacy
    # Load spaCy model - you'll need to download it: python -m spacy download en_core_web_sm
    try:
        nlp = spacy.load("en_core_web_sm")
    except:
        nlp = None
except ImportError:
    # Fallback to simple extraction if spaCy not installed
    nlp = None


def extract_keywords(text: str) -> List[str]:
    """
    Extract keywords from the input text using NLP.
    Returns a list of relevant keywords for trend analysis.
    """
    keywords = []
    
    if nlp:
        # Use spaCy for advanced extraction
        doc = nlp(text.lower())
        
        # Extract nouns and proper nouns
        for token in doc:
            if token.pos_ in ["NOUN", "PROPN"] and not token.is_stop:
                keywords.append(token.text)
        
        # Extract named entities
        for ent in doc.ents:
            if ent.label_ in ["PERSON", "ORG", "GPE", "PRODUCT", "WORK_OF_ART"]:
                keywords.append(ent.text)
    else:
        # Fallback: Simple keyword extraction
        # Remove common words and extract significant terms
        stop_words = {
            "a", "an", "the", "in", "on", "at", "to", "for", "of", "with",
            "by", "from", "as", "is", "was", "are", "been", "be", "have",
            "has", "had", "do", "does", "did", "will", "would", "could",
            "should", "may", "might", "must", "can", "wearing", "holding"
        }
        
        # Split and clean words
        words = re.findall(r'\b\w+\b', text.lower())
        keywords = [word for word in words if word not in stop_words and len(word) > 2]
    
    # Remove duplicates while preserving order
    seen = set()
    unique_keywords = []
    for keyword in keywords:
        if keyword not in seen:
            seen.add(keyword)
            unique_keywords.append(keyword)
    
    return unique_keywords[:10]  # Limit to top 10 keywords
