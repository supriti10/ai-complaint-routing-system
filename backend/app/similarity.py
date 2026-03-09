from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer("all-MiniLM-L6-v2")

def find_similar_complaint(new_text, existing_texts):

    new_embedding = model.encode(new_text, convert_to_tensor=True)
    existing_embeddings = model.encode(existing_texts, convert_to_tensor=True)

    similarities = util.cos_sim(new_embedding, existing_embeddings)[0]

    best_score = similarities.max().item()
    best_index = similarities.argmax().item()

    return best_score, best_index