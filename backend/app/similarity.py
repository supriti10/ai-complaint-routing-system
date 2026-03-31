from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# 🔥 LAZY LOAD MODEL (AVOIDS CRASH)
model = None

def get_model():
    global model
    if model is None:
        model = SentenceTransformer("all-MiniLM-L6-v2")
    return model


# ✅ THIS MUST EXIST (YOUR ERROR)
def simple_similarity(a: str, b: str):
    import difflib
    return difflib.SequenceMatcher(None, a, b).ratio()

def normalize_text(text: str) -> str:
    return " ".join(text.lower().strip().split())

def find_similar_complaint(new_text, existing_texts):

    if not existing_texts:
        return 0.0, None

    try:
        m = get_model()

        new_text = normalize_text(new_text)
        existing_texts = [normalize_text(t) for t in existing_texts]

        new_emb = m.encode([new_text])
        emb = m.encode(existing_texts)

        sims = cosine_similarity(new_emb, emb)[0]

        best_idx = int(np.argmax(sims))
        best_score = float(sims[best_idx])

        best_score = max(0.0, min(best_score, 1.0))

        return best_score, best_idx

    except Exception as e:
        print("SIM ERROR:", e)
        return 0.0, None