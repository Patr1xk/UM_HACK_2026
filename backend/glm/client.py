import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

class GLMClient:
    def __init__(self, model: str = "ilmu-glm-5.1"):
        api_key = os.getenv("ILMU_API_KEY")
        if not api_key:
            raise ValueError("ILMU_API_KEY is not set in environment variables.")

        self.client = OpenAI(
            api_key=api_key,
            base_url="https://api.ilmu.ai/v1",
        )
        self.model = model

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
        }

        response = self.client.chat.completions.create(**payload)

        # Debug: Print response details
        print(f"DEBUG: response.choices = {response.choices}")
        if response.choices:
            print(f"DEBUG: message.content = {repr(response.choices[0].message.content)}")

        return response

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