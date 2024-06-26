# Patcha DDN

Connect realtime data to your AI

## What is it?

Pacha is an AI tool that does retrieval of context for a natural language query using a SQL interface.
Pacha is specially built to work with Hasura DDN for authorized multi-source querying.

You would use Pacha with your favourite LLMs to generate grounded responses in your AI apps/agents/chatbots.

## Getting Started

### Prerequisites

- Atleast Python version 3.12
- Access to OpenAI or Anthropic.
- A postgres database you want to try Pacha out on.

### Install Python Dependencies

- Install [Poetry](https://python-poetry.org/docs/)
- Run `poetry install` to install Python dependencies.

### Setup Hasura DDN

Note: You can skip this step if running Pacha directly against Postgres instead of Hasura DDN.

- Create a Hasura account at hasura.io/ddn
- Scaffold a local Hasura setup on a postgres database like this:
```bash
poetry run ddn_setup -c <postgres connection string> --dir ddn_project
```
- The above generated metadata is where you would configure row / column access control rules for your data.
- Start a local Hasura engine with:
```bash
docker compose -f ddn_project/docker-compose.hasura.yaml up -d
```

### Running Pacha

`examples/chat_with_tool.py` is a CLI chat interface that uses Pacha with Anthropic.

```bash
ANTHROPIC_API_KEY=<api-key> poetry run chat_with_anthropic -d ddn -u <DDN SQL URL> -H <header to pass to DDN> 
```

Example:
```bash
ANTHROPIC_API_KEY=<api-key> poetry run chat_with_anthropic -d ddn -u http://localhost:3000/v1/sql -H 'x-hasura-role: admin'
```

You can also run Pacha with OpenAI:
```bash
OPENAI_API_KEY=<api-key> poetry run chat_with_openai -d ddn -u <DDN SQL URL> -H <header to pass to DDN>
```

## Customizing

### Running against a custom SQL backend

If you want to run against a custom SQL backend that's not Hasura DDN or Postgres, you can implement the `DataEngine` class in `pacha/data_engine`, and pass that to the Pacha SDK. See usage [here](pacha/sdk/tools/code_tool.py#L57).

You can see example Postgres implementation of DataEngine is in `pacha/data_engine/postgres.py`.

### Running against a custom LLM

You can run Pacha against any LLM that supports function/tool calling. You can see the examples in `examples/chat_with_tool_anthropic.py` and `examples/chat_with_tool_openai.py`.