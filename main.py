from flask import Flask, render_template, request
import os
import paramiko
import subprocess
import json
from os import environ as env
from urllib.parse import quote_plus, urlencode
import random

from authlib.integrations.flask_client import OAuth
from dotenv import find_dotenv, load_dotenv
from flask import Flask, redirect, render_template, session, url_for

# Environment variable file import

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

app = Flask(__name__)

app.secret_key = env.get("APP_SECRET_KEY")

port = random.randint(0, 10000)

# Connection to Auth0

oauth = OAuth(app)

oauth.register(
    "auth0",
    client_id=env.get("AUTH0_CLIENT_ID"),
    client_secret=env.get("AUTH0_CLIENT_SECRET"),
    client_kwargs={
        "scope": "openid profile email",
    },
    server_metadata_url=f'https://{env.get("AUTH0_DOMAIN")}/.well-known/openid-configuration'
)

# Declaration of home page


@app.route("/")
def home():
    return render_template("index.html", session=session.get('user'), port=port)

# Login Page (Redirect to Auth0)


@app.route("/login")
def login():
    return oauth.auth0.authorize_redirect(
        redirect_uri=url_for("callback", _external=True)
    )

# Auth0 callback page (not visible to user)


@app.route("/callback", methods=["GET", "POST"])
def callback():
    token = oauth.auth0.authorize_access_token()
    session["user"] = token
    return redirect("/")

# Logout redirect page


@app.route("/logout")
def logout():
    session.clear()
    return redirect(
        "https://" + env.get("AUTH0_DOMAIN")
        + "/v2/logout?"
        + urlencode(
            {
                "returnTo": url_for("home", _external=True),
                "client_id": env.get("AUTH0_CLIENT_ID"),
            },
            quote_via=quote_plus,
        )
    )

# Demo page to execute SSH command


@app.route('/ssh_command', methods=['POST'])
def ssh_command():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('localhost', username='antonis',
                password='Ml4ke14x!', port=port)
    command = 'ls -l'
    stdin, stdout, stderr = ssh.exec_command(command)
    stdout.channel.set_combine_stderr(True)
    output = stdout.readlines()
    ssh.close()
    return output
    # render_template("index.html", session=session.get('user'))

# Demo page to execute terminal Command


@app.route('/terminal_command', methods=['POST'])
def terminal_command():
    string = 'The Result is: '
    result = subprocess.check_output(['who'])  # replace with your command
    return render_template('index.html', result=result, session=session.get('user'))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=env.get("PORT", 3000))
