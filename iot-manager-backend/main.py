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
from werkzeug.utils import secure_filename
import json

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
            passEntries = cursor.fetchall()
            password = passEntries[0][0]
            cursor.execute(
                "SELECT user_id FROM users WHERE username = %s", (request.args.get('username'),))
            userIdEntries = cursor.fetchall()
            userId = userIdEntries[0][0]

    except Error as e:
        print("Error while connecting to MySQL", e)
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection is closed")
            result = (decrypt_string(password) == request.args.get('password'))
            if (result == True):
                return jsonify(userId)
            else:
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
    formatted_devices = []  # Initialize the list outside the try block

    try:
        connection = mysql.connector.connect(**db_config)
        if connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            cursor.execute(
                "SELECT * FROM devices WHERE user_id = %s", (userId,))
            devices = cursor.fetchall()

            for device in devices:
                try:
                    ssh = paramiko.SSHClient()
                    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                    ssh.connect(
                        'localhost',
                        port=device['port'],
                        username=device['username'],
                        password=decrypt_string(device['pass'])
                    )

                    # Run the command
                    stdin, stdout, stderr = ssh.exec_command('mpc')
                    status = stdout.read().decode('utf-8')
                    # Close the SSH connection
                    ssh.close()
                except:
                    print('exception')
                    status = "Offline"

                formatted_device = {
                    'value': device['id'],
                    'label': device['device_id'],
                    'port': device['port'],
                    'status': status
                    # 'userId': device['user_id'],
                    # 'username': device['username'],
                    # 'password': decrypt_string(device['pass']),
                }
            formatted_devices.append(formatted_device)

    except Error as e:
        print("Error while connecting to MySQL", e)
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection is closed")

    # Move the return statement outside of the finally block
    return jsonify(formatted_devices)

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

### REMOVE DEVICE FROM DATABASE ###


@app.route('/removeDevice', methods=['DELETE'])
@cross_origin(origin="*")
def removeDevice():
    deviceId = request.args.get('deviceId')
    print(deviceId)
    try:
        connection = mysql.connector.connect(**db_config)
        if connection.is_connected():
            cursor = connection.cursor()
            cursor.execute("DELETE FROM devices WHERE id = %s", (deviceId,))
            connection.commit()
            print('success')
    except Error as e:
        print("Error while connecting to MySQL", e)
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection is closed")
            return "Device Deleted Successfully"

### SEND PLAY COMMAND ###


@app.route('/play', methods=['POST'])
@cross_origin(origin="*")
def play():
    connection = mysql.connector.connect(**db_config)
    try:
        data = request.json
        deviceIds = data.get('deviceIds', [])
        print('Device IDs:', deviceIds)

        # Fetch devices from the database based on the provided IDs
        with connection.cursor(dictionary=True) as cursor:
            sql = f"SELECT id, port, username, pass FROM devices WHERE id IN ({', '.join(map(str, deviceIds))})"
            cursor.execute(sql)
            devices = cursor.fetchall()

        # SSH Command
        ssh_command = "mpc play"

        # Send SSH command to each device
        for device in devices:
            # Replace 'your_ssh_username' and 'your_ssh_password' with your actual SSH credentials
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(
                'localhost',
                port=device['port'],
                username=device['username'],
                password=decrypt_string(device['pass'])
            )

            # Run the command
            stdin, stdout, stderr = ssh.exec_command(ssh_command)
            print(stderr.read().decode('utf-8'))
            print(stdout.read().decode('utf-8'), 'port', device['port'])

            # Close the SSH connection
            ssh.close()

        return jsonify({"message": "SSH command sent successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
### SEND PAUSE COMMAND ###
    
@app.route('/pause', methods=['POST'])
@cross_origin(origin="*")
def pause():
    connection = mysql.connector.connect(**db_config)
    try:
        data = request.json
        deviceIds = data.get('deviceIds', [])
        print('Device IDs:', deviceIds)

        # Fetch devices from the database based on the provided IDs
        with connection.cursor(dictionary=True) as cursor:
            sql = f"SELECT id, port, username, pass FROM devices WHERE id IN ({', '.join(map(str, deviceIds))})"
            cursor.execute(sql)
            devices = cursor.fetchall()

        # SSH Command
        ssh_command = "mpc pause-if-playing"

        # Send SSH command to each device
        for device in devices:
            # Replace 'your_ssh_username' and 'your_ssh_password' with your actual SSH credentials
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(
                'localhost',
                port=device['port'],
                username=device['username'],
                password=decrypt_string(device['pass'])
            )

            # Run the command
            stdin, stdout, stderr = ssh.exec_command(ssh_command)
            print(stderr.read().decode('utf-8'))
            print(stdout.read().decode('utf-8'), 'port', device['port'])

            # Close the SSH connection
            ssh.close()

        return jsonify({"message": "SSH command sent successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

### SEND NEXT COMMAND ###


@app.route('/next', methods=['POST'])
@cross_origin(origin="*")
def next():
    connection = mysql.connector.connect(**db_config)
    try:
        data = request.json
        deviceIds = data.get('deviceIds', [])
        print('Device IDs:', deviceIds)

        # Fetch devices from the database based on the provided IDs
        with connection.cursor(dictionary=True) as cursor:
            sql = f"SELECT id, port, username, pass FROM devices WHERE id IN ({', '.join(map(str, deviceIds))})"
            cursor.execute(sql)
            devices = cursor.fetchall()

        # SSH Command
        ssh_command = "mpc next"
        print(ssh_command)

        # Send SSH command to each device
        for device in devices:
            # Replace 'your_ssh_username' and 'your_ssh_password' with your actual SSH credentials
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(
                'localhost',
                port=device['port'],
                username=device['username'],
                password=decrypt_string(device['pass'])
            )

            # Run the command
            stdin, stdout, stderr = ssh.exec_command(ssh_command)
            print(stderr.read().decode('utf-8'))
            print(stdout.read().decode('utf-8'), 'port', device['port'])

            # Close the SSH connection
            ssh.close()

        return jsonify({"message": "SSH command sent successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

### SEND PREVIOUS COMMAND ###


@app.route('/prev', methods=['POST'])
@cross_origin(origin="*")
def prev():
    connection = mysql.connector.connect(**db_config)
    try:
        data = request.json
        deviceIds = data.get('deviceIds', [])
        print('Device IDs:', deviceIds)

        # Fetch devices from the database based on the provided IDs
        with connection.cursor(dictionary=True) as cursor:
            sql = f"SELECT id, port, username, pass FROM devices WHERE id IN ({', '.join(map(str, deviceIds))})"
            cursor.execute(sql)
            devices = cursor.fetchall()

        # SSH Command
        ssh_command = "mpc prev"
        print(ssh_command)

        # Send SSH command to each device
        for device in devices:
            # Replace 'your_ssh_username' and 'your_ssh_password' with your actual SSH credentials
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(
                'localhost',
                port=device['port'],
                username=device['username'],
                password=decrypt_string(device['pass'])
            )

            # Run the command
            stdin, stdout, stderr = ssh.exec_command(ssh_command)
            print(stderr.read().decode('utf-8'))
            print(stdout.read().decode('utf-8'), 'port', device['port'])

            # Close the SSH connection
            ssh.close()

        return jsonify({"message": "SSH command sent successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

### UPLOAD FILE ENDPOINT ###


@app.route('/addTrack', methods=['POST'])
@cross_origin(origin="*")
def addTrack():
    connection = mysql.connector.connect(**db_config)
    try:
        # Get the file from the request
        file = request.files['file']
        deviceIds_json = request.args.get('deviceIds')
        deviceIds = [int(id) for id in deviceIds_json.split(',')]
        print('Device IDs:', deviceIds)

        # Securely save the file to a temporary location
        filename = secure_filename(file.filename)
        file.save(filename)
        file_extension = filename.split('.')[-1]
        print('File extension:', file_extension)

        # Fetch devices from the database based on the provided IDs
        with connection.cursor(dictionary=True) as cursor:
            sql = f"SELECT id, port, username, pass FROM devices WHERE id IN ({', '.join(map(str, deviceIds))})"
            cursor.execute(sql)
            devices = cursor.fetchall()
            print(devices)

        # Send SSH command to each device
        for device in devices:
            # Replace 'your_ssh_username' and 'your_ssh_password' with your actual SSH credentials
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(
                'localhost',
                port=device['port'],
                username=device['username'],
                password=decrypt_string(device['pass'])
            )
            username = device['username']

            # SFTP the file to the device
            with ssh.open_sftp() as sftp:
                # Change the path as needed
                sftp.put(filename, f'/home/{username}/Music/{filename}')

            # Add the file to the MPC queue
            stdin, stdout, stderr = ssh.exec_command(
                f'mpc update')
            if file_extension == 'm3u':
                stdin, stdout, stderr = ssh.exec_command(
                    f'mpc load {filename}')
            else:
                stdin, stdout, stderr = ssh.exec_command(
                    f'mpc add {filename}')

            print(stderr.read().decode('utf-8'))
            print(stdout.read().decode('utf-8'), 'port', device['port'])

            # Close the SSH connection
            ssh.close()

        return jsonify({"message": "File uploaded successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=env.get("PORT", 3000))
