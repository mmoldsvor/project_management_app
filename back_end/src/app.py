import os

from flask import Flask

app = Flask(__name__)

@app.route('/')
def index():
    return 'test'

port = int(os.getenv('API_PORT', default=5000))
app.run(host='0.0.0.0', port=port)