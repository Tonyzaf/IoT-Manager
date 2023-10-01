from flask import Flask, render_template, request
import os
import paramiko
import subprocess
import json
from os import environ as env
from urllib.parse import quote_plus, urlencode
import random
from flask import Flask, redirect, render_template, session, url_for
import logging
from flask import Flask
from flask_cors import CORS, cross_origin

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'

port = 0

# # Declaration of port randomizer
excluded_numbers = {22, 80}


def generate_random_number():
    global port
    # Create a set of available numbers by subtracting excluded_numbers from all possible numbers
    available_numbers = set(range(1, 10000)) - excluded_numbers
    # Choose one random number from the available numbers
    port = random.sample(available_numbers, 1)[0]

@app.route('/verify_device/<username>/<password>', methods=['GET','OPTIONS'])
@cross_origin()
def verify_device(username,password):
    try:
        generate_random_number()
        result = False
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        try:
            ssh.connect('localhost', username=username,
                        password=password)
        except Exception as e:
            logging.error("SSH connection error: {str(e)}")
            result = False
            return str(result)
        command = 'ls -l'
        stdin, stdout, stderr = ssh.exec_command(command)
        stdout.channel.set_combine_stderr(True)
        output = stdout.readlines()
        ssh.close()
        if output:
            result = True
        return str(result)  # Convert the boolean to a string before returning
    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return "An error occurred", 500  # Return a 500 Internal Server Error status

# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=env.get("PORT", 3000))