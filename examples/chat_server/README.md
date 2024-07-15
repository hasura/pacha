# Chat server

### Starting

From the root folder:

```
poetry run chat_server -u http://localhost:3000/v1/sql  -H 'x-hasura-role: admin'
```

### Deploying

From the root folder:

1. Create `requirements.txt` from poetry

```
poetry export -f requirements.txt --output requirements.txt
```

2. Use Google App Engine to deploy

```
gcloud app deploy
```
