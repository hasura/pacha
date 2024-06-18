# pacha-ai

Connect your private data to LLMs

## What is it?

Pacha is an AI tool does query planning and retrieval of context for a natural language over a SQL interface.

You would use Pacha with your favourite LLMs to generate grounded responses in your AI apps/agents.

## Quickstart

#### Requirements

- An LLM for response generation
- A SQL layer (you can use Hasura DDN for a unified SQLlayer over all your data)


```python

from pacha import pacha 
from openai import OpenAI

llm = OpenAI(model="gpt-4o")

pachaClient = pacha(llm=llm, query_layer='https://myhasuraproject.com/sql')

response = pachaClient.chat("Write a personalized email to the customer with the most amount of spend and list out some of the movies they have rented in the email ")

```

## Reference Architecture

![Pacha Architecture](architecture.png)

## Integrations

- LangChain
- LlamaIndex

## Examples
