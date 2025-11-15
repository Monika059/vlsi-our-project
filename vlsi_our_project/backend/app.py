from flask import Flask, request, jsonify, send_from_directory, redirect, session, url_for
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime
from werkzeug.utils import secure_filename
import requests
import secrets
from urllib.parse import urlencode
from pathlib import Path
from typing import Any, Dict
from verilog_parser import VerilogParser
from ai_assistant import AIAssistant
from simulator import VerilogSimulator
from verilog_templates import TEMPLATES


BASE_DIR_PATH = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR_PATH / ".env")


raw_allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
if raw_allowed_origins.strip() == "*":
    cors_origins = "*"
    cors_supports_credentials = False
else:
    cors_origins = [origin.strip() for origin in raw_allowed_origins.split(",") if origin.strip()]
    cors_supports_credentials = True

app = Flask(__name__, static_folder="uploads")
app.secret_key = os.getenv("FLASK_SECRET_KEY", "change-this-secret")

if cors_supports_credentials:
    app.config["SESSION_COOKIE_SAMESITE"] = os.getenv("SESSION_COOKIE_SAMESITE", "Lax")
    app.config["SESSION_COOKIE_SECURE"] = (
        os.getenv("SESSION_COOKIE_SECURE", "false").lower() == "true"
    )

CORS(
    app,
    resources={r"/api/*": {"origins": cors_origins}},
    supports_credentials=cors_supports_credentials,
)

default_frontend_origin = (
    cors_origins[0] if isinstance(cors_origins, list) and cors_origins else "http://localhost:5173"
)
FRONTEND_URL = os.getenv("FRONTEND_URL", default_frontend_origin).rstrip("/")

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
FACEBOOK_APP_ID = os.getenv("FACEBOOK_APP_ID")
FACEBOOK_APP_SECRET = os.getenv("FACEBOOK_APP_SECRET")
FACEBOOK_OAUTH_VERSION = os.getenv("FACEBOOK_OAUTH_VERSION", "v19.0")


BASE_DIR = str(BASE_DIR_PATH)
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "pdf", "txt", "v", "sv"}


os.makedirs(UPLOAD_FOLDER, exist_ok=True)


verilog_parser = VerilogParser()
ai_assistant = AIAssistant(api_key=os.getenv("OPENAI_API_KEY"))
simulator = VerilogSimulator()


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _github_not_configured_response():
    return jsonify({"error": "GitHub OAuth is not configured"}), 500


def _facebook_not_configured_response():
    return jsonify({"error": "Facebook OAuth is not configured"}), 500


@app.route("/api/auth/github", methods=["GET"])
def github_login():
    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        return _github_not_configured_response()

    state = secrets.token_urlsafe(16)
    session["github_oauth_state"] = state

    params = {
        "client_id": GITHUB_CLIENT_ID,
        "redirect_uri": url_for("github_callback", _external=True),
        "scope": "read:user user:email",
        "state": state,
        "allow_signup": "true",
    }

    authorize_url = f"https://github.com/login/oauth/authorize?{urlencode(params)}"
    return redirect(authorize_url)


@app.route("/api/auth/github/callback", methods=["GET"])
def github_callback():
    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        return _github_not_configured_response()

    state = request.args.get("state")
    stored_state = session.pop("github_oauth_state", None)
    if not state or not stored_state or state != stored_state:
        return redirect(f"{FRONTEND_URL}/login?error=github_state_mismatch")

    code = request.args.get("code")
    if not code:
        return redirect(f"{FRONTEND_URL}/login?error=github_no_code")

    token_response = requests.post(
        "https://github.com/login/oauth/access_token",
        headers={"Accept": "application/json"},
        data={
            "client_id": GITHUB_CLIENT_ID,
            "client_secret": GITHUB_CLIENT_SECRET,
            "code": code,
            "redirect_uri": url_for("github_callback", _external=True),
        },
        timeout=10,
    )

    if token_response.status_code != 200:
        return redirect(f"{FRONTEND_URL}/login?error=github_token_exchange_failed")

    token_payload = token_response.json()
    access_token = token_payload.get("access_token")
    if not access_token:
        return redirect(f"{FRONTEND_URL}/login?error=github_token_missing")

    user_response = requests.get(
        "https://api.github.com/user",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
        },
        timeout=10,
    )

    if user_response.status_code != 200:
        return redirect(f"{FRONTEND_URL}/login?error=github_user_fetch_failed")

    profile = user_response.json()

    email_response = requests.get(
        "https://api.github.com/user/emails",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
        },
        timeout=10,
    )

    primary_email = None
    if email_response.status_code == 200:
        for entry in email_response.json():
            if entry.get("primary") and entry.get("verified"):
                primary_email = entry.get("email")
                break

    if not primary_email:
        primary_email = profile.get("email")

    session["user"] = {
        "name": profile.get("name") or profile.get("login"),
        "email": primary_email,
        "picture": profile.get("avatar_url"),
        "sub": str(profile.get("id")),
        "login": profile.get("login"),
    }
    session["provider"] = "github"

    return redirect(f"{FRONTEND_URL}/auth/github?success=1")


@app.route("/api/auth/facebook", methods=["GET"])
def facebook_login():
    if not FACEBOOK_APP_ID or not FACEBOOK_APP_SECRET:
        return _facebook_not_configured_response()

    state = secrets.token_urlsafe(16)
    session["facebook_oauth_state"] = state

    params = {
        "client_id": FACEBOOK_APP_ID,
        "redirect_uri": url_for("facebook_callback", _external=True),
        "state": state,
        "scope": "email,public_profile",
        "response_type": "code",
    }

    authorize_url = f"https://www.facebook.com/{FACEBOOK_OAUTH_VERSION}/dialog/oauth?{urlencode(params)}"
    return redirect(authorize_url)


@app.route("/api/auth/facebook/callback", methods=["GET"])
def facebook_callback():
    if not FACEBOOK_APP_ID or not FACEBOOK_APP_SECRET:
        return _facebook_not_configured_response()

    state = request.args.get("state")
    stored_state = session.pop("facebook_oauth_state", None)
    if not state or not stored_state or state != stored_state:
        return redirect(f"{FRONTEND_URL}/login?error=facebook_state_mismatch")

    code = request.args.get("code")
    if not code:
        return redirect(f"{FRONTEND_URL}/login?error=facebook_no_code")

    token_response = requests.get(
        f"https://graph.facebook.com/{FACEBOOK_OAUTH_VERSION}/oauth/access_token",
        params={
            "client_id": FACEBOOK_APP_ID,
            "client_secret": FACEBOOK_APP_SECRET,
            "redirect_uri": url_for("facebook_callback", _external=True),
            "code": code,
        },
        timeout=10,
    )

    if token_response.status_code != 200:
        return redirect(f"{FRONTEND_URL}/login?error=facebook_token_exchange_failed")

    token_payload = token_response.json()
    access_token = token_payload.get("access_token")
    if not access_token:
        return redirect(f"{FRONTEND_URL}/login?error=facebook_token_missing")

    profile_response = requests.get(
        "https://graph.facebook.com/me",
        params={"fields": "id,name,email,picture", "access_token": access_token},
        timeout=10,
    )

    if profile_response.status_code != 200:
        return redirect(f"{FRONTEND_URL}/login?error=facebook_user_fetch_failed")

    profile = profile_response.json()
    picture_data = profile.get("picture") or {}
    if isinstance(picture_data, dict):
        picture_data = picture_data.get("data") or {}
    picture_url = picture_data.get("url") if isinstance(picture_data, dict) else None

    session["user"] = {
        "name": profile.get("name"),
        "email": profile.get("email"),
        "picture": picture_url,
        "sub": str(profile.get("id")),
    }
    session["provider"] = "facebook"

    return redirect(f"{FRONTEND_URL}/auth/facebook?success=1")


@app.route("/api/auth/me", methods=["GET"])
def auth_me():
    user = session.get("user")
    if not user:
        return jsonify({"authenticated": False}), 401

    return jsonify({"authenticated": True, "user": user, "provider": session.get("provider")})


@app.route("/api/auth/logout", methods=["POST"])
def auth_logout():
    session.clear()
    return jsonify({"success": True})


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify(
        {
            "status": "healthy",
            "service": "VLSI Design Assistant API",
            "version": "1.0.0",
        }
    )


@app.route("/api/analyze", methods=["POST"])
def analyze_code():
    try:
        data = request.get_json(silent=True) or {}
        code = data.get("code", "")

        if not code:
            return jsonify({"error": "No code provided"}), 400

        parse_result = verilog_parser.parse(code)
        ai_analysis = ai_assistant.analyze_code(code, parse_result)
        testbench = data.get("testbench", "")
        sim_result = simulator.simulate(
            code,
            testbench_code=testbench,
            persist_waveform_dir=app.config["UPLOAD_FOLDER"],
        )
        simulation_section: Dict[str, Any]
        if sim_result.get("success"):
            simulation_section = {
                "waveform_data": sim_result.get("waveform_data", []),
                "signals": sim_result.get("signals", []),
                "waveform_url": sim_result.get("waveform_url"),
                "simulation_log": sim_result.get("log", ""),
            }
        else:
            simulation_section = {
                "simulation_error": sim_result.get("error", "Simulation failed")
            }

        response_body = {
            "success": True,
            "syntax_errors": parse_result.get("errors", []),
            "warnings": parse_result.get("warnings", []),
            "suggestions": ai_analysis.get("suggestions", []),
            "optimizations": ai_analysis.get("optimizations", []),
            "educational_notes": ai_analysis.get("educational_notes", []),
            "code_quality_score": ai_analysis.get("quality_score", 0),
        }
        response_body.update(simulation_section)

        return jsonify(response_body)

    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@app.route("/api/debug", methods=["POST"])
def debug_code():
    try:
        data = request.get_json(silent=True) or {}
        code = data.get("code", "")
        error_message = data.get("error_message", "")

        if not code:
            return jsonify({"error": "No code provided"}), 400

        debug_help = ai_assistant.debug_code(code, error_message)

        return jsonify(
            {
                "success": True,
                "explanation": debug_help.get("explanation", ""),
                "fixes": debug_help.get("fixes", []),
                "corrected_code": debug_help.get("corrected_code", ""),
                "learning_resources": debug_help.get("learning_resources", []),
            }
        )
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@app.route("/api/optimize", methods=["POST"])
def optimize_code():
    try:
        data = request.get_json(silent=True) or {}
        code = data.get("code", "")
        goals = data.get("goals", ["performance", "readability"])

        if not code:
            return jsonify({"error": "No code provided"}), 400

        optimizations = ai_assistant.optimize_code(code, goals)

        return jsonify(
            {
                "success": True,
                "optimizations": optimizations.get("suggestions", []),
                "optimized_code": optimizations.get("optimized_code", ""),
                "improvements": optimizations.get("improvements", {}),
                "explanations": optimizations.get("explanations", []),
            }
        )
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@app.route("/api/simulate", methods=["POST"])
def simulate_code():
    try:
        data = request.get_json(silent=True) or {}
        code = data.get("code", "")
        testbench = data.get("testbench", "")

        if not code:
            return jsonify({"error": "No code provided"}), 400

        sim_result = simulator.simulate(
            code,
            testbench,
            persist_waveform_dir=app.config["UPLOAD_FOLDER"],
        )
        if not sim_result.get("success"):
            return jsonify({"success": False, "error": sim_result.get("error", "Simulation failed")}), 400

        return jsonify(
            {
                "success": True,
                "waveform_data": sim_result.get("waveform_data", []),
                "simulation_log": sim_result.get("log", ""),
                "signals": sim_result.get("signals", []),
                "waveform_file": sim_result.get("waveform_file"),
                "waveform_url": sim_result.get("waveform_url"),
            }
        )
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@app.route("/api/explain", methods=["POST"])
def explain_concept():
    try:
        data = request.get_json(silent=True) or {}
        code = data.get("code", "")
        concept = data.get("concept", "")

        explanation = ai_assistant.explain_concept(code, concept)

        return jsonify(
            {
                "success": True,
                "explanation": explanation.get("explanation", ""),
                "examples": explanation.get("examples", []),
                "best_practices": explanation.get("best_practices", []),
                "common_mistakes": explanation.get("common_mistakes", []),
                "related_topics": explanation.get("related_topics", []),
            }
        )
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@app.route("/api/templates", methods=["GET"])
def get_templates():
    return jsonify({"success": True, "templates": TEMPLATES})


@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json(silent=True) or {}
        message = (data.get("message") or "").strip()

        if not message:
            return jsonify({"error": "No message provided"}), 400

        response = ai_assistant.chat(message)

        return jsonify({"success": True, "response": response})
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@app.route("/api/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]

    if not file or file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    filename = secure_filename(file.filename)
    unique_name = f"{int(datetime.now().timestamp())}_{filename}"
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], unique_name)
    file.save(filepath)
    ai_summary = ai_assistant.analyze_upload(filepath)
    is_hdl = filepath.lower().endswith((".v", ".sv"))
    waveform_payload: Dict[str, Any] = {}
    if is_hdl:
        try:
            code = Path(filepath).read_text(encoding="utf-8", errors="ignore")
            sim_result = simulator.simulate(
                code,
                persist_waveform_dir=app.config["UPLOAD_FOLDER"],
            )
            if sim_result.get("success"):
                waveform_payload = {
                    "waveform_data": sim_result.get("waveform_data", []),
                    "signals": sim_result.get("signals", []),
                    "waveform_url": sim_result.get("waveform_url"),
                    "simulation_log": sim_result.get("log", ""),
                }
            else:
                waveform_payload = {"simulation_error": sim_result.get("error", "Simulation failed")}
        except Exception as exc:
            waveform_payload = {"simulation_error": f"Simulation error: {exc}"}
    response_body = {
        "success": True,
        "filename": unique_name,
        "url": f"/uploads/{unique_name}",
        "analysis": ai_summary,
    }
    response_body.update(waveform_payload)

    return jsonify(response_body)    
    


@app.route("/uploads/<path:filename>")
def uploaded_file(filename: str):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug_mode = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug_mode, host="0.0.0.0", port=port)
