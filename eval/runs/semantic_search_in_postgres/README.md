Results produced on commit `19ad827` in `ai-engine` repo, with `enable_semantic_search=True` set in `pacha/data_engine/postgres.py`.

Command used:

```bash
poetry run eval -i eval/spagila/queries -o eval/runs/semantic_search_in_postgres --ignore ignored --ignore uncategorized -d postgres -c postgresql://postgres:postgres@localhost:5432/spagila -s public
```

Analysis in [this sheet](https://docs.google.com/spreadsheets/d/1tu08BQSwyQR9T6rZ6_5FHT3hG89a-DURaS6SGw1Mjls/edit?gid=232696462#gid=232696462).
