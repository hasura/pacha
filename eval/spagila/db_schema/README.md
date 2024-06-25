[pagila dataset](https://github.com/devrimgunduz/pagila) at e1e5a85
a pg-idiomatic fork of [sakila](https://dev.mysql.com/doc/sakila/en/sakila-structure-tables.html)
with the following modifications:

- many table and column names modified (in some cases introducing ambiguity and
  inconsistency), to hopefully force the model to understand our provided
  descriptions of the schema, rather than its own knowledge of sakila

`dump.pg.sql` contains the original data. `schema_mods.sql` contains the modifications.

To implement semantic search within the database, run `semantic_search.sql` after modifying it to include your OpenAI API key.

Then vectorize all the movies by running:
```bash
OPENAI_API_KEY=<your key> python vectorize_movies.py
```
NOTEs:
- the data itself (e.g. movie and actor names) is fake which is important to
  keep in mind if we ever try to inspect data to infer semantic descriptions
  for tables

