from flask import Flask, request
import paramiko
import subprocess
import random
from flask import Flask
import logging
from flask import Flask
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)

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
def verify_device(username,password):
    try:
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
        stdout = ssh.exec_command(command)
        stdout.channel.set_combine_stderr(True)
        output = stdout.readlines()
        ssh.close()
        if output:
            result = True
        return str(result)  # Convert the boolean to a string before returning
    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return "An error occurred", 500  # Return a 500 Internal Server Error status

@app.route('/get_connection_credentials', methods=['GET'])
@cross_origin(origin="*")
def get_connection_credentials():
    try:
        generate_random_number()
        ipaddress = subprocess.run(["ipconfig", "getifaddr", "en0"], capture_output=True).stdout.decode('utf-8')
        username = subprocess.run(["id", "-un"], capture_output=True).stdout.decode('utf-8')
        connectionCommand = 'ssh -R %d:localhost:22 %s@%s' % (port,username,ipaddress)
        return connectionCommand 
    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return "An error occurred", 500  # Return a 500 Internal Server Error status

# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=env.get("PORT", 3000))