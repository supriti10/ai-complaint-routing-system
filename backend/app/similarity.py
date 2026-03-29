from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer("all-MiniLM-L6-v2")


def find_similar_complaint(new_text, existing_texts):

    if not existing_texts:
        return 0, None

    try:
        new_embedding = model.encode(new_text, convert_to_tensor=True)
        existing_embeddings = model.encode(existing_texts, convert_to_tensor=True)

        similarities = util.cos_sim(new_embedding, existing_embeddings)[0]

        best_score = float(similarities.max().item())
        best_index = int(similarities.argmax().item())

        return best_score, best_index

    except Exception as e:
        print("SIMILARITY ERROR:", e)
        return 0, None