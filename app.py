from flask import Flask, request, jsonify, render_template
import numpy as np
from PIL import Image
import io
import base64
from tensorflow.keras.models import load_model

app = Flask(__name__)

# Load the pre-trained model
model = load_model('hcr_model.h5')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json['imageData']
        base64_string = data.split(',')[1]
        image = Image.open(io.BytesIO(base64.b64decode(base64_string)))

        image = image.convert('L')
        image = image.resize((28, 28), Image.Resampling.LANCZOS)
        image = np.array(image)
        image = image / 255.0
        image = np.expand_dims(image, axis=-1)
        image = image.reshape(1, 28, 28, 1)

        # Make prediction
        prediction = model.predict(image)[0]  # Extract the first (and only) prediction array

        # Get top 2 predictions with probabilities
        top_2_indices = prediction.argsort()[-2:][::-1]  # Get indices of the top 2 predictions
        top_2_probs = prediction[top_2_indices] * 100  # Convert to percentage

        mapp = {0: 48, 1: 49, 2: 50, 3: 51, 4: 52, 5: 53, 6: 54, 7: 55, 8: 56, 9: 57,
                10: 65, 11: 66, 12: 67, 13: 68, 14: 69, 15: 70, 16: 71, 17: 72, 18: 73,
                19: 74, 20: 75, 21: 76, 22: 77, 23: 78, 24: 79, 25: 80, 26: 81, 27: 82,
                28: 83, 29: 84, 30: 85, 31: 86, 32: 87, 33: 88, 34: 89, 35: 90, 36: 97,
                37: 98, 38: 100, 39: 101, 40: 102, 41: 103, 42: 104, 43: 110, 44: 113,
                45: 114, 46: 116}

        # Convert top predictions to characters
        pred_char_1 = chr(mapp[top_2_indices[0]])
        pred_char_2 = chr(mapp[top_2_indices[1]])

        # Return prediction result with probability percentage
        return jsonify({
            'prediction': pred_char_1,
            'probability': f"{top_2_probs[0]:.2f}%",
            'alternative_prediction': pred_char_2,
            'alternative_probability': f"{top_2_probs[1]:.2f}%"
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True)
