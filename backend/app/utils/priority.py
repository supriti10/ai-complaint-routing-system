from textblob import TextBlob


def get_priority(text: str):

    text_lower = text.lower()

    # HIGH severity keywords
    high_keywords = [
        "fraud",
        "scam",
        "hacked",
        "stolen",
        "unauthorized",
        "money deducted",
        "account blocked"
    ]

    # MEDIUM severity keywords
    medium_keywords = [
        "loan",
        "credit card",
        "atm",
        "transaction",
        "emi",
        "payment"
    ]

    # Urgency words
    urgent_words = [
        "urgent",
        "immediately",
        "asap",
        "critical",
        "serious"
    ]

    # Sentiment analysis
    sentiment = TextBlob(text).sentiment.polarity

    # HIGH priority rules
    if any(word in text_lower for word in high_keywords):
        return "HIGH"

    if any(word in text_lower for word in urgent_words):
        return "HIGH"

    # MEDIUM priority rules
    if any(word in text_lower for word in medium_keywords):
        return "MEDIUM"

    # Negative sentiment → MEDIUM
    if sentiment < -0.3:
        return "MEDIUM"

    return "LOW"