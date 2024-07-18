# Chat server

### Starting

From the root folder:

```
poetry run chat_server -u http://localhost:3000/v1/sql  -H 'x-hasura-role: admin'
```

### Deploying


#### Using Google App Engine

From the root folder:

1. Install `gunicorn`

```
poetry add gunicorn
```

2. Create `requirements.txt` from poetry

```
poetry export -f requirements.txt --output requirements.txt
```

3. Create an `app.yaml` file in root folder with the following contents:

```
runtime: python312

handlers:
- url: /.*
  script: auto

entrypoint: gunicorn -b :$PORT examples.chat_server.server:app
```

4. Run the following command

```
gcloud app deploy
```
