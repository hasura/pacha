from pydantic import RootModel
from promptql import artifact
artifact = RootModel[artifact.Artifact].model_validate_json('{"identifier": "foo", "title": "Foo", "artifact_type": "table", "data": [{"bar": 1, "baz": 1}, {"bar": 2, "baz": 2 }] }').root
print(repr(artifact))
print(artifact.model_dump_json())