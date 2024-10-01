# PromptQL Playground

Sample AI Assistant built using [Hasura PromptQL](../promptql).

## Running

### Prerequisites

- Python version 3.12 or later
- [Poetry](https://python-poetry.org/docs/) 
- Access to a PromptQL runtime URL and API key
- Access to a Hasura DDN /sql endpoint
- Access to an OpenAI or Anthropic API key

### Running

Install python dependencies

```bash
poetry install --all-extras
```

Note: If you make changes in `../promptql` then you need to re-run the above command here.

#### Running the CLI based assistant

```bash
PROMPTQL_URI=<promptql runtime url> \
PROMPTQL_SECRET_KEY=<promptql runtime secret key> \
ANTHROPIC_API_KEY=<anthropic api key if using anthropic> \
OPENAI_API_KEY=<openai api key if using openai> \
poetry run cli_chat \
  -u <Hasura DDN /v1/sql endpoint URL> \
  -H <any header you want to pass to DDN> \
  --llm <anthropic|openai>
```

#### Running the chat server

```bash
PROMPTQL_URI=<promptql runtime url> \
PROMPTQL_SECRET_KEY=<promptql runtime secret key> \
ANTHROPIC_API_KEY=<anthropic api key if using anthropic> \
OPENAI_API_KEY=<openai api key if using openai> \
poetry run chat_server \
  -u <Hasura DDN /v1/sql endpoint URL> \
  -H <any header you want to pass to DDN> \
  --llm <anthropic|openai>
```

Then you can modify and use the websocket test script in `scripts/websocket_test_client.py`.

```bash
poetry run python scripts/websocket_test_client.py
```