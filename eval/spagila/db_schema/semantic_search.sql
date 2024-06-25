CREATE TABLE movie_embeddings
(
    id integer NOT NULL,
    movie_id integer,
    embedding vector(1536),
    CONSTRAINT movie_embeddings_pkey PRIMARY KEY (id),
    CONSTRAINT movie_embeddings_movie_id_fkey FOREIGN KEY (movie_id)
        REFERENCES public.movie (id)
);

COMMENT ON TABLE movie_embeddings IS 'Contains vector embeddings of movies in the "movie" table based their description. Use this table for semantic queries about movies which can be answered based on movie descriptions.';

COMMENT ON COLUMN movie_embeddings.embedding IS 'Vector embedding based on movie description or logline. If searching for movies based on this embedding, also select the movie description/logline as context of why the movie was considered similar/relevant.';

CREATE OR REPLACE FUNCTION VECTORIZE(text_input text)
RETURNS vector(1536)
LANGUAGE plpython3u
AS $$
import requests

cache: dict = SD.setdefault("cache", {})

cached_vector = cache.get(text_input)
if cached_vector is not None:
    return cached_vector

headers = {
    'Authorization': 'Bearer <OPENAI API KEY>'
}
body = {
    'input': text_input,
    'model': 'text-embedding-3-small'
}
response = requests.post(
    'https://api.openai.com/v1/embeddings', headers=headers, json=body)

vector = str(response.json()["data"][0]["embedding"])
cache[text_input] = vector
return vector
$$;

CREATE OR REPLACE FUNCTION RELEVANCE(embedding vector(1536), text_input text)
RETURNS double precision AS $$
BEGIN
  RETURN 1 - (embedding <=> VECTORIZE(text_input));
END;
$$ LANGUAGE plpgsql;

-- Sometimes the LLM uses RELEVANCE instead of SIMILARITY when comparing two vectors, so we overload this function too
CREATE OR REPLACE FUNCTION RELEVANCE(embedding1 vector(1536), embedding2 vector(1536))
RETURNS double precision AS $$
BEGIN
  RETURN 1 - (embedding1 <=> embedding2);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION SIMILARITY(embedding1 vector(1536), embedding2 vector(1536))
RETURNS double precision AS $$
BEGIN
  RETURN 1 - (embedding1 <=> embedding2);
END;
$$ LANGUAGE plpgsql;
