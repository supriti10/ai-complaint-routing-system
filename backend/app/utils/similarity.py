from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer("all-MiniLM-L6-v2")


def find_similar_complaint(new_text, old_texts):

    if len(old_texts) == 0:
        return None, 0

    embeddings = model.encode([new_text] + old_texts)

    new_embedding = embeddings[0]
    old_embeddings = embeddings[1:]

    scores = cosine_similarity([new_embedding], old_embeddings)[0]

    best_score = max(scores)
    best_index = scores.argmax()

    return best_index, best_score