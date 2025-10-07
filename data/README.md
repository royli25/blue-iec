Place your RAG JSON files in this folder.

Suggested usage:
- Put source files like `my_kb.json`, `policies.json`, etc. here.
- The ingestion script can point to a file via INPUT_PATH (e.g., `./data/my_kb.json`).

Recommended JSON shape per item:
{
  "kind": "document",          // e.g., rubric | exemplar | taxonomy | playbook | pref | document
  "title": "Optional title",
  "body": "Main text content...", // if you only have a big object, you can also store it under `content` and map it during ingestion
  "metadata": { "source": "json", "field": "Business", "city": "San Jose" }
}

Notes:
- If your file is a single object, the ingestion can wrap it as an array.
- If it's already chunked, the ingestion can insert chunks as-is.




