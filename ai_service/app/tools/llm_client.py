"""LLM client helpers."""

import logging
import os

from functools import lru_cache

from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv()

logger = logging.getLogger(__name__)

DEFAULT_CHAT_MODEL = "Qwen/Qwen2.5-7B-Instruct:together"
DEFAULT_TIMEOUT = 60


@lru_cache(maxsize=1)
def get_hf_client() -> InferenceClient:
	token = os.environ.get("HF_TOKEN")
	if not token:
		raise RuntimeError("HF_TOKEN nao encontrado no ambiente.")

	return InferenceClient(api_key=token, timeout=DEFAULT_TIMEOUT)


def chat_completion(messages, model: str = DEFAULT_CHAT_MODEL):
	client = get_hf_client()
	return client.chat.completions.create(model=model, messages=messages)


def ask_hf(prompt: str, model: str = DEFAULT_CHAT_MODEL, max_tokens: int = 512) -> str:
	try:
		completion = get_hf_client().chat.completions.create(
			model=model,
			messages=[{"role": "user", "content": prompt}],
			max_tokens=max_tokens,
		)
	except Exception as exc:
		logger.error("LLM request failed: %s", exc)
		raise RuntimeError(f"Falha na comunicacao com o servico de IA: {exc}") from exc

	message = completion.choices[0].message
	return message.content if getattr(message, "content", None) is not None else str(message)
