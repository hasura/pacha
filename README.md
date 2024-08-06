# Pacha

Connect realtime data to your AI

## What is it?

Pacha is an AI tool that does retrieval of context for a natural language query using a SQL interface and a Python programming environment.
Pacha is specially built to work with Hasura DDN for authorized multi-source querying.

You would use Pacha with your favourite LLMs to generate grounded responses in your AI apps/agents/chatbots.

## Getting Started

### Prerequisites

- Python version 3.12 or later
- Docker Compose version 2.22.0 or later
- Access to OpenAI or Anthropic.
- A datasource available in [Hasura Connector Hub](https://hasura.io/connectors)

### Clone the repo

```bash
git clone https://github.com/hasura/pacha.git
cd pacha
```

### Install Python Dependencies

- Install [Poetry](https://python-poetry.org/docs/)
- Run `poetry install` to install Python dependencies.

### Setup Hasura DDN

- Create a Hasura account at <a href="https://hasura.io/ddn" target="_blank">hasura.io/ddn</a>
- Scaffold a local Hasura project on a hub connector datasource like this:
```bash
poetry run ddn_setup -hc <hub-connector-name> -c <connection string> --dir ddn_project
```

Example (with Postgres):
```bash
poetry run ddn_setup -hc 'hasura/postgres' -c 'postgresql://postgres:postgres@localhost:5432/postgres' --dir ddn_project
```

Example (with SQL Server):
```bash
poetry run ddn_setup -hc 'hasura/sqlserver' -c 'Server=localhost,21433;Uid=SA;Database=sakila;Pwd=Password!;TrustServerCertificate=true' --dir ddn_project
```

- The above generated metadata is where you would configure row / column access control rules for your data.
- Start a local Hasura engine with:
```bash
docker compose -f ddn_project/docker-compose.hasura.yaml up -d
```

### Running Pacha

`examples/chat_with_tool.py` is a CLI chat interface that uses Pacha as a tool provided to a supported LLM.

```bash
ANTHROPIC_API_KEY=<api-key> poetry run chat_with_tool -d ddn -u <DDN SQL URL> -H <header to pass to DDN> --llm anthropic
```

Example:
```bash
ANTHROPIC_API_KEY=<api-key> poetry run chat_with_tool -d ddn -u http://localhost:3000/v1/sql -H 'x-hasura-role: admin' --llm anthropic
```

You can also run Pacha with OpenAI:
```bash
OPENAI_API_KEY=<api-key> poetry run chat_with_tool -d ddn -u <DDN SQL URL> -H <header to pass to DDN> --llm openai
```

## Customizing

### Running against a custom SQL backend

If you want to run against a custom SQL backend that's not Hasura DDN, you can implement the `DataEngine` class in `pacha/data_engine`, and pass that to the Pacha SDK. See usage [here](pacha/sdk/tools/code_tool.py#L57).

You can see example Postgres implementation of DataEngine in `pacha/data_engine/postgres.py`.

### Running against a custom LLM

You can run Pacha against any LLM that supports function/tool calling by using the Pacha tool directly from `pacha/sdk/tools`.
