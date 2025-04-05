import tensorflow as tf
import cv2
import numpy as np
import matplotlib.pyplot as plt

# Load the pre-trained MobileNetV2 model
model = tf.keras.applications.MobileNetV2(weights='imagenet')

# Function to preprocess the image
def preprocess_image(image_path):
    img = cv2.imread(image_path)  # Read the image
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # Convert BGR to RGB
    img = cv2.resize(img, (224, 224))  # Resize to 224x224 (the input size for MobileNetV2)
    img = np.expand_dims(img, axis=0)  # Add batch dimension
    img = tf.keras.applications.mobilenet_v2.preprocess_input(img)  # Preprocess the image for the model
    return img

# Function to predict and show the result
def predict_image(image_path):
    # Preprocess the image
    processed_image = preprocess_image(image_path)
    
    # Predict using the model
    predictions = model.predict(processed_image)
    
    # Decode the prediction to get human-readable labels
    decoded_predictions = tf.keras.applications.mobilenet_v2.decode_predictions(predictions, top=1)[0]
    
    print("Prediction:")
    for i, (imagenet_id, label, score) in enumerate(decoded_predictions):
        print(f"{i + 1}. {label}: {score:.2f}")
    
    # Display the image
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # Convert to RGB
    plt.imshow(img)
    plt.axis('off')
    plt.show()

# Example usage
image_path = 'path_to_your_image.jpg'  # Replace with the path to your image
predict_image(image_path)
