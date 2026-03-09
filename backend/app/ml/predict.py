import torch
import pickle
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification

MODEL_PATH = "app/ml/model"

tokenizer = DistilBertTokenizerFast.from_pretrained(MODEL_PATH)
model = DistilBertForSequenceClassification.from_pretrained(MODEL_PATH)

with open(f"{MODEL_PATH}/label_encoder.pkl", "rb") as f:
    label_encoder = pickle.load(f)

model.eval()


def predict_department(text: str):

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=256
    )

    outputs = model(**inputs)

    predicted_class = torch.argmax(outputs.logits).item()

    department = label_encoder.inverse_transform([predicted_class])[0]

    return department