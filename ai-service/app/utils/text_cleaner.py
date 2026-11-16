import re


def clean_text(text: str) -> str:
    text = text.replace("\x00", " ")
    text = re.sub(r"\r\n?", "\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_email(text: str) -> str | None:
    match = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", text)
    return match.group(0) if match else None


def extract_phone(text: str) -> str | None:
    match = re.search(r"(\+?\d[\d\s().-]{8,}\d)", text)
    return match.group(0).strip() if match else None


def extract_years(text: str) -> int:
    patterns = [
        r"(\d+)\+?\s*(?:years|yrs)\s*(?:of\s*)?experience",
        r"experience\s*[:\-]?\s*(\d+)\+?\s*(?:years|yrs)",
        r"(\d+)\+?\s*(?:years|yrs)",
    ]
    for p in patterns:
        m = re.search(p, text, re.I)
        if m:
            return int(m.group(1))
    return 0
