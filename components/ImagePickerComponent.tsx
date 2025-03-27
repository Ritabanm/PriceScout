import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';

const ImagePickerComponent = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [condition, setCondition] = useState(3);
  const [age, setAge] = useState(6);
  const [warranty, setWarranty] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<any>(null);
  const [label, setLabel] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkStyles : lightStyles;

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      const mobilenetModel = await mobilenet.load();
      setModel(mobilenetModel);
    };
    loadModel();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setLabel('');
      setEstimatedPrice('');
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setLabel('');
      setEstimatedPrice('');
    }
  };

  const getBasePrice = (label: string): number => {
    const mapping: Record<string, number> = {
      phone: 600,
      laptop: 1000,
      camera: 700,
      monitor: 300,
      television: 400,
      keyboard: 80,
    };
    for (let key in mapping) {
      if (label.toLowerCase().includes(key)) return mapping[key];
    }
    return 100;
  };

  const handleEstimatePrice = async () => {
    if (!imageUri || !model) return;
    setIsLoading(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const rawImageData = tf.util.encodeString(base64, 'base64').buffer;
      const imageTensor = decodeJpeg(new Uint8Array(rawImageData));

      const predictions = await model.classify(imageTensor);
      const topPrediction = predictions[0]?.className || 'Unknown';
      setLabel(topPrediction);

      const basePrice = getBasePrice(topPrediction);
      const conditionFactor = 1 + (condition - 3) / 10;
      const warrantyFactor = 1 + Math.sqrt(warranty) / 10;
      const ageFactor = 1 - Math.log1p(age) / Math.log1p(48);
      const noise = 0.95 + Math.random() * 0.1;

      const adjustedPrice = basePrice * conditionFactor * warrantyFactor * ageFactor * noise;
      setEstimatedPrice(`$${adjustedPrice.toFixed(2)}`);
    } catch (err) {
      console.error('Error estimating price:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={theme.container} contentContainerStyle={styles.container}>
      <Text style={[styles.title, theme.text]}>PriceScout</Text>

      <View style={[styles.imageBox, theme.imageBox]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={theme.text}>No image selected</Text>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Ionicons name="images" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.buttonText}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Ionicons name="camera" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.buttonText}>Camera</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sliderLabel, theme.text]}>Condition: {condition}</Text>
      <Slider
        minimumValue={1}
        maximumValue={5}
        step={1}
        value={condition}
        onValueChange={setCondition}
        minimumTrackTintColor="#A259FF"
        thumbTintColor="#A259FF"
      />

      <Text style={[styles.sliderLabel, theme.text]}>Age (months): {age}</Text>
      <Slider
        minimumValue={0}
        maximumValue={48}
        step={1}
        value={age}
        onValueChange={setAge}
        minimumTrackTintColor="#A259FF"
        thumbTintColor="#A259FF"
      />

      <Text style={[styles.sliderLabel, theme.text]}>Warranty (months): {warranty}</Text>
      <Slider
        minimumValue={0}
        maximumValue={24}
        step={1}
        value={warranty}
        onValueChange={setWarranty}
        minimumTrackTintColor="#A259FF"
        thumbTintColor="#A259FF"
      />

      <View style={{ alignItems: 'center', marginTop: 20 }}>
        <TouchableOpacity style={styles.estimateButton} onPress={handleEstimatePrice} disabled={isLoading}>
          <Text style={styles.estimateButtonText}>Estimate Price</Text>
        </TouchableOpacity>
        {isLoading && <ActivityIndicator size="large" color="#A259FF" style={{ marginTop: 10 }} />}
      </View>

      {label !== '' && (
        <Text style={[styles.resultText, theme.text]}>Detected Object: <Text style={styles.bold}>{label}</Text></Text>
      )}
      {estimatedPrice !== '' && (
        <Text style={[styles.resultText, theme.text]}>Estimated Price: <Text style={styles.bold}>{estimatedPrice}</Text></Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  imageBox: {
    height: 250,
    borderRadius: 16,
    marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 6,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#A259FF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
  },
  sliderLabel: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  estimateButton: {
    backgroundColor: '#A259FF',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 16,
    marginTop: 10,
  },
  estimateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
});

const lightStyles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
  },
  text: {
    color: '#222222',
  },
  imageBox: {
    backgroundColor: '#f2f2f2',
  },
});

const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
  },
  text: {
    color: '#eeeeee',
  },
  imageBox: {
    backgroundColor: '#1f1f1f',
  },
});

export default ImagePickerComponent;
