import os
import sys
from pathlib import Path

# Provide defaults for tests if not set
os.environ.setdefault("API_BEARER_TOKEN", "devsecret123")
os.environ.setdefault("WEBHOOK_TOKEN", "mentra_webhook_secret")
os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///./test.db")
os.environ.setdefault("DEV_FAKE_LLM", "1")

# Add repo path to sys.path to import 'app'
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
	sys.path.insert(0, str(ROOT))
