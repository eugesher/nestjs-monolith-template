import base64
import hashlib
import hmac
import json
import time
from pathlib import Path

AUDIENCE = "staff"
OTHER_AUDIENCE = "customer"
ENV_DIR = Path(__file__).resolve().parents[2] / "env" / "apps"
ENV_FILE = ENV_DIR / "staff-app" / ".env"
CUSTOMER_ENV_FILE = ENV_DIR / "customer-app" / ".env"
ADMIN_ID = "1"
EDITOR_ID = "2"
VIEWER_ID = "3"
DISABLED_ID = "4"
CUSTOMER_ANN_ID = "101"


def capture_login(response, posting) -> None:
    data = response.json()
    posting.set_variable("access_token", data["accessToken"])


def as_admin(posting) -> None:
    sign(posting, {"sub": ADMIN_ID})


def as_editor(posting) -> None:
    sign(posting, {"sub": EDITOR_ID})


def as_viewer(posting) -> None:
    sign(posting, {"sub": VIEWER_ID})


def as_viewer_forged_claims(posting) -> None:
    sign(posting, {"sub": VIEWER_ID, "roles": ["admin"], "permissions": ["access-management"]})


def as_disabled(posting) -> None:
    sign(posting, {"sub": DISABLED_ID})


def as_customer(posting) -> None:
    sign(posting, {"sub": CUSTOMER_ANN_ID})


def as_editor_with_customer_secret(posting) -> None:
    sign(posting, {"sub": EDITOR_ID}, CUSTOMER_ENV_FILE)


def as_editor_for_customer_audience(posting) -> None:
    sign(posting, {"sub": EDITOR_ID}, audience=OTHER_AUDIENCE)


def sign(posting, claims: dict, env_file: Path = ENV_FILE, audience: str = AUDIENCE) -> None:
    header = encode(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    payload = encode(json.dumps({**claims, "aud": audience, "iat": int(time.time())}, separators=(",", ":")).encode())
    signing_input = f"{header}.{payload}"
    signature = hmac.new(access_secret(env_file).encode(), signing_input.encode(), hashlib.sha256).digest()
    posting.set_variable("token", f"{signing_input}.{encode(signature)}")


def encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode()


def access_secret(env_file: Path) -> str:
    for line in env_file.read_text().splitlines():
        name, _, value = line.partition("=")
        if name.strip() == "JWT_SECRET":
            return value.strip().strip('"')
    raise KeyError(f"JWT_SECRET is missing in {env_file}")
