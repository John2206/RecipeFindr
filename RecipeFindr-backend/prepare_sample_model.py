import tensorflow as tf
import os

# Create a directory to save the Keras model
keras_model_dir = "mobilenetv2_keras_model"
os.makedirs(keras_model_dir, exist_ok=True)

print("Downloading and saving MobileNetV2 Keras model...")
try:
    # Load MobileNetV2 pre-trained on ImageNet, without the top classification layer
    model = tf.keras.applications.MobileNetV2(weights='imagenet', include_top=True)
    # Save the model in the Keras format
    model.save(keras_model_dir)
    print(f"MobileNetV2 Keras model saved to ./{keras_model_dir}")
    print("Please ensure you have TensorFlow installed: pip install tensorflow")
except Exception as e:
    print(f"Error downloading or saving Keras model: {e}")
    print("Please ensure you have TensorFlow installed: pip install tensorflow")

