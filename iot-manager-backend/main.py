from flask import Flask, request, jsonify
import os
import paramiko
import subprocess
import mysql.connector
from mysql.connector import Error
import random
from flask import Flask
import logging
from flask import Flask
from flask_cors import CORS, cross_origin
from cryptography.fernet import Fernet
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

load_dotenv()
encrypt_key = os.getenv("encrypt_key")
db_username = os.getenv("db_username")
db_password = os.getenv("db_password")
cipher_suite = Fernet(encrypt_key)

port = 0

# Declaration of port randomizer
excluded_numbers = {22, 80}

# Configure Database
db_config = {'host': 'localhost', 'database': 'IOT_MANAGER',
             'user': db_username, 'password': db_password}


def encrypt_string(plaintext):
    # Encrypt the string
    ciphertext = cipher_suite.encrypt(plaintext.encode())
    return ciphertext.decode()


def decrypt_string(ciphertext):
    # Decrypt the string
    plaintext = cipher_suite.decrypt(ciphertext.encode())
    return plaintext.decode()


def generate_random_number():
    global port
    # Create a set of available numbers by subtracting excluded_numbers from all possible numbers
    available_numbers = set(range(1, 10000)) - excluded_numbers
    # Choose one random number from the available numbers
    port = random.sample(available_numbers, 1)[0]

### REGISTER USER ###


@app.route('/register', methods=['POST'])
@cross_origin(origin="*")
def register():
    content_type = request.headers.get('Content-Type')
    if (content_type == 'application/json'):
        json = request.json
        username = json.get('username')
        password = json.get('password')
        encyptedPass = encrypt_string(password)
        try:
            connection = mysql.connector.connect(**db_config)
            if connection.is_connected():
                print("Connected to MySQL database")
                cursor = connection.cursor()
                cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)",
                               (username, encyptedPass))
                connection.commit()
                return 'User added successfully!'

        except Error as e:
            print("Error while connecting to MySQL", e)
            # Return a 500 Internal Server Error status
            return str(e), 500
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
                print("MySQL connection is closed")


### LOGIN USER ###


@app.route('/login', methods=['GET'])
@cross_origin(origin="*")
def login():
    try:
        connection = mysql.connector.connect(**db_config)
        if connection.is_connected():
            cursor = connection.cursor()
            cursor.execute(
                "SELECT password FROM users WHERE username = %s", (request.args.get('username'),))
            entries = cursor.fetchall()
            password = entries[0][0]
            if (decrypt_string(password) == request.args.get('password')):
                return "True"
            else:
                return "False"

    except Error as e:
        print("Error while connecting to MySQL", e)
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection is closed")
            result = (decrypt_string(password) == request.args.get('password'))
            return jsonify(result)


### VERIFY DEVICE CREDENTIALS ###

@app.route('/verifyDevice', methods=['POST'])
def verifyDevice():
    global port
    content_type = request.headers.get('Content-Type')
    if (content_type == 'application/json'):
        json = request.json
    else:
        print('Content-Type not supported!')
    try:
        result = False
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        username, password = json.values()
        try:
            print('Username', username)
            ssh.connect('localhost', username=username,
                        password=password, port=port)
        except (paramiko.AuthenticationException, paramiko.SSHException) as message:
            print("ERROR: SSH connection failed" + str(message))
            return "False"

        return "True"
    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return "An error occurred", 500  # Return a 500 Internal Server Error status

### FETCH CONNECTION CREDENTIALS TO DISPLAY ###


@app.route('/getCredentials', methods=['GET'])
@cross_origin(origin="*")
def getCredentials():
    try:
        generate_random_number()
        ipaddress = subprocess.run(
            ["ipconfig", "getifaddr", "en0"], capture_output=True).stdout.decode('utf-8')
        username = subprocess.run(
            ["id", "-un"], capture_output=True).stdout.decode('utf-8')
        connectionCommand = 'ssh -R %d:localhost:22 %s@%s' % (
            port, username, ipaddress)
        return connectionCommand
    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return "An error occurred", 500  # Return a 500 Internal Server Error status

### DEV: FOR INTERNAL USE ONLY ###


@app.route('/generate_key', methods=['GET'])
@cross_origin(origin="*")
def generate_key():
    key = Fernet.generate_key()
    print(key)
    print(encrypt_key)
    return key

### FETCH ALL DEVICES ON THE DB ###


@app.route('/getDevices', methods=['GET'])
@cross_origin(origin="*")
def getDevices():
    try:
        connection = mysql.connector.connect(**db_config)
        if connection.is_connected():
            cursor = connection.cursor()
            cursor.execute("SELECT * FROM devices")
            entries = cursor.fetchall()
            for entry in entries:
                password = entry[5]  # Get password from entry
                print("Password:", decrypt_string(password))

    except Error as e:
        print("Error while connecting to MySQL", e)
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection is closed")
            return (entries)

### GET USER DEVICES ###


@app.route('/getUserDevices', methods=['GET'])
@cross_origin(origin="*")
def getUserDevices():
    userId = request.args.get('userId')
    print(userId)
    devices = []
    try:
        connection = mysql.connector.connect(**db_config)
        if connection.is_connected():
            cursor = connection.cursor()
            cursor.execute(
                "SELECT * FROM devices WHERE user_id = %s", (userId,))  # The , is necessary to make it a tuple
            devices = cursor.fetchall()
            for device in devices:
                password = device[5]  # Get password from entry
                print("Password:", decrypt_string(password))
            return jsonify(devices)

    except Error as e:
        print("Error while connecting to MySQL", e)
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection is closed")
            return jsonify(devices)

### ADD DEVICE TO DATABASE ###


@app.route('/addDevice', methods=['POST'])
@cross_origin(origin="*")
def addDevice():
    content_type = request.headers.get('Content-Type')
    global port
    if (content_type == 'application/json'):
        data = request.json
        username = data.get('username')
        password = data.get('password')
        deviceId = data.get('deviceId')
        userId = data.get('userId')

        print(data)

        encyptedPass = encrypt_string(password)

        try:
            connection = mysql.connector.connect(**db_config)
            if connection.is_connected():
                print("Connected to MySQL database")
                cursor = connection.cursor()
                cursor.execute("INSERT INTO devices (device_id, user_id, username, port, pass ) VALUES (%s, %s, %s, %s, %s)",
                               (deviceId, userId, username, port, encyptedPass))
                connection.commit()
                return 'Device added successfully!'

        except Error as e:
            print("Error while connecting to MySQL", e)
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
                print("MySQL connection is closed")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=env.get("PORT", 3000))
