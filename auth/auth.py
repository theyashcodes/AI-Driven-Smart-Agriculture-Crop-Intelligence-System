
from passlib.hash import bcrypt

users = {}

def register(username,password):
    hashed = bcrypt.hash(password)
    users[username] = hashed

def login(username,password):
    if username in users:
        return bcrypt.verify(password, users[username])
    return False
