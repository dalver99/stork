from flask import Flask, jsonify, Blueprint
from flask_cors import CORS
import os
from dotenv import load_dotenv
import pymysql
import pandas as pd

# Load environment variables
load_dotenv()

# Database credentials
STORK_USER = os.getenv("STORK_USER")
STORK_PW = os.getenv("STORK_PW")

# Create Flask app
app = Flask(__name__)

# Configure CORS to allow requests from NextJS
CORS(app, 
     resources={r"/flask-api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}},
     supports_credentials=True)

# Add OPTIONS method handling for preflight requests
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Create API Blueprint
sparkapi = Blueprint('sparkapi', __name__)

@sparkapi.route('/', methods=['GET'])
def sparkapi_handler():
    try:
        # Connect to MySQL directly
        connection = pymysql.connect(
            host='autodart25.mysql.database.azure.com',
            user=STORK_USER,
            password=STORK_PW,
            database='stork',
            port=3306,
            cursorclass=pymysql.cursors.DictCursor,
            ssl={'ssl': True}
        )
        
        # Execute query
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM stocks LIMIT 5")
            result = cursor.fetchall()
        
        connection.close()
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Test endpoint to verify the server is running
@app.route('/test', methods=['GET'])
def test_endpoint():
    return jsonify({"status": "Server is running", "message": "This is a test endpoint"})

# Register blueprint
app.register_blueprint(sparkapi, url_prefix='/flask-api/sparkapi')

if __name__ == "__main__":
    print("Starting Flask server on port 5000...")
    app.run(debug=True, host='0.0.0.0', port=5000)
