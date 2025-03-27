import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as ImageManipulator from 'expo-image-manipulator';
import { useState, useEffect } from 'react';
import { Image, Platform } from 'react-native'; // Needed for React Native image handling

export function useTFModel() {
  const [model, setModel] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadModel = async () => {
      setLoading(true);
      await tf.ready(); // Ensure TensorFlow.js is ready
      const model = await mobilenet.load(); // Load the MobileNet model
      setModel(model);
      setLoading(false);
    };
    loadModel();
  }, []);

  const predict = async (imageUri: string): Promise<number> => {
    if (!model) return 0;

    try {
      // Fetch the image
      const response = await fetch(imageUri);
      const blob = await response.blob(); // Get image data as a blob
      const image = await createImageBitmap(blob); // Convert the blob to an ImageBitmap (React Native compatible)

      // Convert image into tensor (for use with TensorFlow.js)
      const imgTensor = tf.browser.fromPixels(image);

      // Use the model to classify the image
      const predictions = await model.classify(imgTensor);

      // Map class name to a price (for simplicity)
      const label = predictions[0]?.className;
      const price = label ? estimatePriceBasedOnClass(label) : 0;

      return price;
    } catch (error) {
      console.error('Prediction error:', error);
      return 0;
    }
  };

  return { predict, loading };
}

// Map predicted class to price range
function estimatePriceBasedOnClass(label: string): number {
  // Here you can customize the price range based on the object class
  if (label.includes('phone')) {
    return 300; // Phones cost $300
  } else if (label.includes('laptop')) {
    return 500; // Laptops cost $500
  }
  return 150; // Default price for other objects
}
