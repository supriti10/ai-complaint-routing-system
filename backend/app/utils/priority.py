def get_priority(text: str):
    text = text.lower()

    # 🔴 HIGH PRIORITY KEYWORDS
    high_keywords = [
        "fraud", "unauthorized", "scam", "hack", "threat",
        "harassment", "illegal", "blocked", "not received",
        "money deducted", "account blocked", "charged wrongly",
        "overcharged", "foreclosure", "urgent", "emergency",
        "double deduction", "security issue"
    ]

    # 🟠 MEDIUM PRIORITY
    medium_keywords = [
        "delay", "not updated", "incorrect", "issue",
        "problem", "error", "not working", "pending",
        "failed", "discrepancy"
    ]

    # 🟢 LOW PRIORITY
    low_keywords = [
        "information", "clarification", "help",
        "query", "request", "understand",
        "details", "how to"
    ]

    # 🔥 PRIORITY CHECK
    if any(word in text for word in high_keywords):
        return "High"

    elif any(word in text for word in medium_keywords):
        return "Medium"

    else:
        return "Low"