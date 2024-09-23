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

### Quick Start with Docker

#### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed on your system
- [Hasura CLI](https://hasura.io/docs/latest/hasura-cli/install-hasura-cli/) (optional, for local development)

#### Setup

1. Clone the Pacha repository:
   ```bash
   git clone https://github.com/your-org/pacha.git
   cd pacha
   ```

2. Copy the example environment file and configure it:
   ```bash
   cp .pacha.env.example .pacha.env
   ```
   Edit the `.pacha.env` file and fill in the required details:
   ```
   PORT=5001
   ANTHROPIC_API_KEY=your_anthropic_api_key
   SECRET_KEY=your_secret_key
   CORS_ORIGINS="https://console.hasura.io"
   ```

3. Build and start the Pacha server:
   ```bash
   docker compose up --build
   ```

#### Accessing Pacha UI


1. Open [https://console.hasura.io/local/chat](https://console.hasura.io/local/chat) to open Pacha UI on Hasura Console. 

2. Use the settings icon (gear) next to the "Pacha Chat" title to configure:
   - Pacha server URL (e.g., `http://localhost:5001` if running locally)
   - Secret token (if you've set one in your `.pacha.env` file)

#### Development Notes

- For local development or custom builds, you can modify the `Dockerfile` in the `engine` directory.
- Ensure all required environment variables are set in your `.pacha.env` file or passed to the Docker container.

#### Troubleshooting

- If you encounter CORS issues, verify the `CORS_ORIGINS` setting in your `.pacha.env` file.
- For API key related errors, double-check your `ANTHROPIC_API_KEY` in the `.pacha.env` file.
 


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
