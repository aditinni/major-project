import sys
import spacy
from collections import Counter
from heapq import nlargest

# Load the SpaCy model
nlp = spacy.load('en_core_web_sm')

def summarize_text(text, num_points=5):
    # Process the text using SpaCy
    doc = nlp(text)

    # Extract words and filter by part of speech
    allowed_pos = {'ADJ', 'PROPN', 'VERB', 'NOUN'}
    word_freq = Counter(token.text.lower() for token in doc if token.pos_ in allowed_pos)

    # Normalize word frequencies
    max_freq = max(word_freq.values(), default=1)
    for word in word_freq:
        word_freq[word] /= max_freq

    # Score sentences based on word frequency
    sent_score = {}
    for sent in doc.sents:
        sent_score[sent] = sum(word_freq.get(word.lower(), 0) for word in sent.text.split())

    # Select the top N sentences
    summary_sentences = nlargest(num_points, sent_score, key=sent_score.get)

    # Format the summary as a numbered list with each point on a new line
    summary = "\n".join(f"{i + 1}. {sentence.text.strip()}" for i, sentence in enumerate(summary_sentences))
    
    return summary

if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_text = sys.argv[1]
        # Increase num_points to summarize in 5-10 key sentences
        summary = summarize_text(input_text, num_points=10)
        print("\nSummary (Point-wise):\n")
        print(summary)
    else:
        print("Error: No input text provided.")
