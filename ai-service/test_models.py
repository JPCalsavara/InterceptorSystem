import asyncio
from langchain_google_genai import ChatGoogleGenerativeAI
import os

os.environ["GOOGLE_API_KEY"] = "AIzaSyD-kfvDTOhy99_je1Ie0c8ooDrE_ryzTNQ"

async def test_model(model_name):
    llm = ChatGoogleGenerativeAI(model=model_name, temperature=0.3)
    try:
        response = await llm.ainvoke("oi")
        print(f"{model_name}: {response.content}")
    except Exception as e:
        print(f"{model_name} erro: {e}")

async def main():
    await test_model("gemini-1.5-flash")
    await test_model("gemini-1.5-pro")
    await test_model("gemini-1.0-pro")
    await test_model("gemini-pro")

asyncio.run(main())
