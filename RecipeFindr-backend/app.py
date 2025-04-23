from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import json
from datetime import datetime

app = Flask(__name__, static_folder='../frontend')
CORS(app)  # Enable CORS for all routes

# Sample recipe data (replace with actual database in production)
SAMPLE_RECIPES = {
    "1": {
        "id": "1",
        "title": "Classic Spaghetti Bolognese",
        "readyInMinutes": 45,
        "servings": 4,
        "difficulty": "Medium",
        "image": "https://example.com/spaghetti.jpg",
        "extendedIngredients": [
            {"amount": 500, "unit": "g", "name": "ground beef"},
            {"amount": 1, "unit": "can", "name": "crushed tomatoes"},
            {"amount": 1, "unit": "medium", "name": "onion"},
            {"amount": 2, "unit": "cloves", "name": "garlic"},
            {"amount": 2, "unit": "tbsp", "name": "olive oil"}
        ],
        "analyzedInstructions": [{
            "steps": [
                {"step": "Heat olive oil in a large pan over medium heat."},
                {"step": "Add chopped onion and garlic, cook until soft."},
                {"step": "Add ground beef and cook until browned."},
                {"step": "Stir in crushed tomatoes and simmer for 20 minutes."},
                {"step": "Serve over cooked spaghetti."}
            ]
        }],
        "nutrition": {
            "calories": 450,
            "protein": 25,
            "carbs": 45,
            "fat": 15
        }
    },
    "2": {
        "id": "2",
        "title": "Chicken Stir Fry",
        "readyInMinutes": 30,
        "servings": 2,
        "difficulty": "Easy",
        "image": "https://example.com/stirfry.jpg",
        "extendedIngredients": [
            {"amount": 300, "unit": "g", "name": "chicken breast"},
            {"amount": 2, "unit": "cups", "name": "mixed vegetables"},
            {"amount": 2, "unit": "tbsp", "name": "soy sauce"},
            {"amount": 1, "unit": "tbsp", "name": "ginger"},
            {"amount": 2, "unit": "cloves", "name": "garlic"}
        ],
        "analyzedInstructions": [{
            "steps": [
                {"step": "Cut chicken into bite-sized pieces."},
                {"step": "Heat oil in a wok or large pan."},
                {"step": "Add chicken and cook until no longer pink."},
                {"step": "Add vegetables and stir fry for 5 minutes."},
                {"step": "Add soy sauce and cook for 2 more minutes."}
            ]
        }],
        "nutrition": {
            "calories": 350,
            "protein": 30,
            "carbs": 20,
            "fat": 12
        }
    },
    "3": {
        "id": "3",
        "title": "Vegetable Curry",
        "readyInMinutes": 40,
        "servings": 4,
        "difficulty": "Medium",
        "image": "https://example.com/curry.jpg",
        "extendedIngredients": [
            {"amount": 2, "unit": "cups", "name": "mixed vegetables"},
            {"amount": 1, "unit": "can", "name": "coconut milk"},
            {"amount": 2, "unit": "tbsp", "name": "curry powder"},
            {"amount": 1, "unit": "medium", "name": "onion"},
            {"amount": 2, "unit": "cloves", "name": "garlic"}
        ],
        "analyzedInstructions": [{
            "steps": [
                {"step": "Sauté onion and garlic until soft."},
                {"step": "Add curry powder and cook for 1 minute."},
                {"step": "Add vegetables and stir to coat with spices."},
                {"step": "Pour in coconut milk and simmer for 20 minutes."},
                {"step": "Serve with rice."}
            ]
        }],
        "nutrition": {
            "calories": 280,
            "protein": 8,
            "carbs": 35,
            "fat": 15
        }
    }
}

@app.route('/api/recipes/<recipe_id>', methods=['GET'])
def get_recipe(recipe_id):
    if recipe_id in SAMPLE_RECIPES:
        return jsonify(SAMPLE_RECIPES[recipe_id])
    return jsonify({"error": "Recipe not found"}), 404

@app.route('/api/recipes/search', methods=['POST'])
def search_recipes():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        ingredients = data.get('ingredients', [])
        if not ingredients:
            return jsonify({"error": "No ingredients provided"}), 400
        
        # Convert ingredients to lowercase for case-insensitive matching
        ingredients = [ing.lower() for ing in ingredients]
        
        matching_recipes = []
        for recipe_id, recipe in SAMPLE_RECIPES.items():
            recipe_ingredients = [ing['name'].lower() for ing in recipe['extendedIngredients']]
            # Count how many ingredients match
            matches = sum(1 for ing in ingredients if any(ing in recipe_ing for recipe_ing in recipe_ingredients))
            if matches > 0:
                matching_recipes.append({
                    "id": recipe_id,
                    "title": recipe['title'],
                    "image": recipe['image'],
                    "readyInMinutes": recipe['readyInMinutes'],
                    "matchingIngredients": matches,
                    "totalIngredients": len(recipe['extendedIngredients'])
                })
        
        # Sort recipes by number of matching ingredients
        matching_recipes.sort(key=lambda x: x['matchingIngredients'] / x['totalIngredients'], reverse=True)
        
        return jsonify(matching_recipes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/recipes', methods=['GET'])
def get_all_recipes():
    try:
        # Return simplified recipe data for the list view
        recipes = [{
            "id": recipe_id,
            "title": recipe['title'],
            "image": recipe['image'],
            "readyInMinutes": recipe['readyInMinutes'],
            "difficulty": recipe['difficulty']
        } for recipe_id, recipe in SAMPLE_RECIPES.items()]
        return jsonify(recipes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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