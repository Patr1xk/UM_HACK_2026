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
        
        # Health check on init
        print(f"[INFO] GLMClient initialized with model={model}")
        print(f"[INFO] API key set: {api_key[:10]}...")
        try:
            self.health_check()
        except Exception as e:
            print(f"[WARNING] GLMClient health check failed: {e}")

    def health_check(self) -> bool:
        """Test if GLM API is reachable and working."""
        try:
            response = self.send_messages(
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=100,
                temperature=0.0,
            )
            if response.choices and response.choices[0].message.content:
                print(f"[INFO] GLMClient health check passed ✓")
                return True
            else:
                print(f"[WARNING] GLMClient health check: Empty response from API")
                return False
        except Exception as e:
            print(f"[ERROR] GLMClient health check failed: {type(e).__name__}: {e}")
            return False

    def send_messages(
        self,
        messages: list[dict],
        max_tokens: int = 1000,
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
        max_tokens: int = 1000,
        temperature: float = 0.0,
    ) -> str:
        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": user_message})

        try:
            response = self.send_messages(
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
            )
            
            # Debug: log the full response
            print(f"[DEBUG] GLMClient response status: choices={len(response.choices)}")
            if response.choices:
                content = response.choices[0].message.content
                print(f"[DEBUG] GLMClient content: {content[:100] if content else 'None'}")
                if content:
                    return content.strip()
                else:
                    print(f"[ERROR] GLMClient returned None/empty content")
                    print(f"[DEBUG] Full response: {response}")
                    return ""
            else:
                print(f"[ERROR] GLMClient response has no choices")
                print(f"[DEBUG] Full response: {response}")
                return ""
                
        except Exception as e:
            print(f"[ERROR] GLMClient.chat() failed: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            return ""