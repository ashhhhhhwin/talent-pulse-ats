import numpy as np

_model = None
_model_name = "all-MiniLM-L6-v2"


def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer(_model_name)
    return _model


def embed_texts(texts: list[str]) -> np.ndarray:
    model = _get_model()
    return model.encode(texts, normalize_embeddings=True)


def semantic_similarity(text_a: str, text_b: str) -> float:
    embeddings = embed_texts([text_a, text_b])
    # Embeddings are L2-normalized, so cosine similarity = dot product
    sim = float(np.dot(embeddings[0], embeddings[1]))
    return max(0.0, min(1.0, sim)) * 100
