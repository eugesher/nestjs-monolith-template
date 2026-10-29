import base64
import hashlib
import hmac
import json
import time
from pathlib import Path

ENV_FILE = Path(__file__).resolve().parents[2] / "env" / "apps" / "staff-app" / ".env.local"
ADMIN_ID = "00000000-0000-4000-8000-000000000001"
EDITOR_ID = "00000000-0000-4000-8000-000000000002"
VIEWER_ID = "00000000-0000-4000-8000-000000000003"
DISABLED_ID = "00000000-0000-4000-8000-000000000004"


def capture_login(response, posting) -> None:
    data = response.json()
    posting.set_variable("access_token", data["accessToken"])
    posting.set_variable("refresh_token", data["refreshToken"])


def as_admin(posting) -> None:
    sign(posting, {"sub": ADMIN_ID})


def as_editor(posting) -> None:
    sign(posting, {"sub": EDITOR_ID})


def as_viewer(posting) -> None:
    sign(posting, {"sub": VIEWER_ID})


def as_viewer_forged_claims(posting) -> None:
    sign(posting, {"sub": VIEWER_ID, "roles": ["admin"], "permissions": ["iam:assign"]})


def as_disabled(posting) -> None:
    sign(posting, {"sub": DISABLED_ID})


def sign(posting, claims: dict) -> None:
    header = encode(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    payload = encode(json.dumps({**claims, "iat": int(time.time())}, separators=(",", ":")).encode())
    signing_input = f"{header}.{payload}"
    signature = hmac.new(access_secret().encode(), signing_input.encode(), hashlib.sha256).digest()
    posting.set_variable("token", f"{signing_input}.{encode(signature)}")


def encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode()


def access_secret() -> str:
    for line in ENV_FILE.read_text().splitlines():
        name, _, value = line.partition("=")
        if name.strip() == "JWT_ACCESS_SECRET":
            return value.strip().strip('"')
    raise KeyError(f"JWT_ACCESS_SECRET is missing in {ENV_FILE}")
