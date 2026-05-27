"""LLM client helpers."""

from functools import lru_cache
import os

from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv()

DEFAULT_CHAT_MODEL = "Qwen/Qwen2.5-7B-Instruct:together"


@lru_cache(maxsize=1)
def get_hf_client() -> InferenceClient:
	token = os.environ.get("HF_TOKEN")
	if not token:
		raise RuntimeError("HF_TOKEN nao encontrado no ambiente.")

	return InferenceClient(api_key=token)


def chat_completion(messages, model: str = DEFAULT_CHAT_MODEL):
	client = get_hf_client()
	return client.chat.completions.create(model=model, messages=messages)


def ask_hf(prompt: str, model: str = DEFAULT_CHAT_MODEL, max_tokens: int = 512) -> str:
	completion = get_hf_client().chat.completions.create(
		model=model,
		messages=[{"role": "user", "content": prompt}],
		max_tokens=max_tokens,
	)

	message = completion.choices[0].message
	return message.content if getattr(message, "content", None) is not None else str(message)
