from pacha.data_engine.postgres import PostgresDataEngine

import openai

data_engine = PostgresDataEngine(
    connection_string="postgresql://postgres:postgres@localhost:5432/spagila", included_schemas=["public"])

movies = data_engine.execute_sql(
    "SELECT id, title, logline FROM movie ORDER BY id")
client = openai.Client()
chunks = [f'{row["logline"]}' for row in movies]
embeddings = client.embeddings.create(
    input=chunks, model="text-embedding-3-small")
for i in range(0, len(movies)):
    movie = movies[i]
    embedding = embeddings.data[i].embedding
    print(movie["id"])
    data_engine.execute_mutation(f'INSERT INTO movie_embeddings (id, movie_id, embedding) VALUES ({movie["id"]}, {movie["id"]}, \'{embedding}\') ON CONFLICT (id) DO UPDATE SET embedding = EXCLUDED.embedding')

