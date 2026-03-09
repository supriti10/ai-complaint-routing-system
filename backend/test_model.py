from app.ml.predict import predict_department

tests = [
    "My loan EMI is wrongly calculated",
    "ATM deducted money but cash not received",
    "My credit card limit was reduced",
    "Bank transferred money to wrong account",
    "Credit card interest is too high"
]

for text in tests:
    prediction = predict_department(text)
    print("\nComplaint:", text)
    print("Predicted Department:", prediction)