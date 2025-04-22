from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
import json
from datetime import datetime
from auth import hash_password, verify_password, generate_token, token_required
from models import db, User

app = Flask(__name__, static_folder='../frontend')
CORS(app)  # Enable CORS for all routes

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///recipefindr.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')

# Initialize database
db.init_app(app)

# Create database tables
with app.app_context():
    db.create_all()

# Authentication routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Check if user already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400
    
    # Create new user
    try:
        password_hash = hash_password(data['password'])
        new_user = User(
            username=data['username'],
            email=data['email'],
            password_hash=password_hash
        )
        db.session.add(new_user)
        db.session.commit()
        
        # Generate token
        token = generate_token(new_user.id)
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': new_user.to_dict()
        }), 201
    except Exception as e:
        return jsonify({'message': 'Error creating user'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Missing username or password'}), 400
    
    # Find user
    user = User.query.filter_by(username=data['username']).first()
    if not user:
        return jsonify({'message': 'Invalid username or password'}), 401
    
    # Verify password
    if not verify_password(data['password'], user.password_hash):
        return jsonify({'message': 'Invalid username or password'}), 401
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Generate token
    token = generate_token(user.id)
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    })

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user():
    token = request.headers.get('Authorization').split(' ')[1]
    payload = verify_token(token)
    if not payload:
        return jsonify({'message': 'Invalid token'}), 401
    
    user = User.query.get(payload['user_id'])
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify(user.to_dict())

# Protected recipe routes
@app.route('/api/recipes', methods=['GET'])
@token_required
def get_recipes():
    # Your existing recipe logic here
    pass

@app.route('/api/recipes/<recipe_id>', methods=['GET'])
@token_required
def get_recipe(recipe_id):
    # Your existing recipe logic here
    pass

@app.route('/api/recipes/search', methods=['POST'])
@token_required
def search_recipes():
    # Your existing recipe logic here
    pass

# Serve static files from the frontend directory
@app.route('/<path:path>')
def serve_frontend(path):
    try:
        return send_from_directory(app.static_folder, path)
    except Exception as e:
        return jsonify({"error": "File not found"}), 404

@app.route('/')
def serve_index():
    try:
        return send_from_directory(app.static_folder, 'index.html')
    except Exception as e:
        return jsonify({"error": "Index file not found"}), 404

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 