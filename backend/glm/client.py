import os
from dotenv import load_dotenv
from zai import ZaiClient

load_dotenv()

class GLMClient:
    def __init__(self, model: str = "glm-4.7-flash", thinking_enabled: bool = False):
        api_key = os.getenv("ZAI_GLM_API_KEY")
        if not api_key:
            raise ValueError("ZAI_GLM_API_KEY is not set in environment variables.")

        self.client = ZaiClient(api_key=api_key)
        self.model = model
        self.thinking_enabled = thinking_enabled

    def send_messages(
        self,
        messages: list[dict],
        max_tokens: int = 300,
        temperature: float = 0.0,
    ):
        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "thinking": {
                "type": "enabled" if self.thinking_enabled else "disabled"
            },
        }

        return self.client.chat.completions.create(**payload)

    def chat(
        self,
        user_message: str,
        system_message: str | None = None,
        max_tokens: int = 300,
        temperature: float = 0.0,
    ) -> str:
        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": user_message})

        response = self.send_messages(
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )

        return response.choices[0].message.content or ""