import { useState } from 'react';
import { Alert, Image, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button, Card, Message, PageHeading, Screen, SmallLabel } from '../components/ui';
import { colors } from '../constants/theme';
import { getErrorMessage } from '../services/api';
import { analyzeImage } from '../services/analysisService';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export default function ImageAnalysisScreen() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const acceptImage = (selection) => {
    if (selection.canceled || !selection.assets?.length) return;
    const asset = selection.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_IMAGE_BYTES) {
      setError('Choose a PNG, JPG, or WEBP image up to 8 MB.');
      setImage(null);
      return;
    }
    if (!asset.base64) {
      setError('The selected image could not be read. Please choose it again.');
      return;
    }
    setImage({ ...asset, mimeType: asset.mimeType || 'image/jpeg' });
    setResult(null);
    setError('');
  };

  const chooseImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError('Allow photo access in Android settings to select an image.');
        return;
      }
      const selection = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.9,
        base64: true,
      });
      acceptImage(selection);
    } catch (pickerError) {
      setError(getErrorMessage(pickerError, 'Unable to open the image gallery.'));
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Camera permission needed', 'Allow camera access to take an image for analysis.');
        return;
      }
      const selection = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.9,
        base64: true,
      });
      acceptImage(selection);
    } catch (pickerError) {
      setError(getErrorMessage(pickerError, 'Unable to open the camera.'));
    }
  };

  const submit = async () => {
    if (!image || loading) {
      setError('Choose or take an image before analysis.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const filename = image.fileName || `truthlens-image-${Date.now()}.jpg`;
      const response = await analyzeImage(filename, `data:image/jpeg;base64,${image.base64}`);
      setResult(response);
    } catch (analysisError) {
      setError(getErrorMessage(analysisError, 'Image analysis failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <PageHeading eyebrow="Image verification" title="Analyze an image" description="Choose an image or take a photo. PNG, JPG, and WEBP images up to 8 MB are supported." />
      <Card>
        {error ? <Message>{error}</Message> : null}
        {image ? (
          <View style={{ alignItems: 'center', marginBottom: 15 }}>
            <Image source={{ uri: image.uri }} resizeMode="contain" style={{ width: '100%', height: 220, borderRadius: 10, backgroundColor: '#f1f5f9' }} />
            <Text numberOfLines={1} style={{ marginTop: 8, color: colors.muted, fontSize: 11 }}>{image.fileName || 'Selected image'}</Text>
          </View>
        ) : (
          <View style={{ minHeight: 150, alignItems: 'center', justifyContent: 'center', marginBottom: 15, borderWidth: 1, borderStyle: 'dashed', borderColor: '#cbd5e1', borderRadius: 12, backgroundColor: '#f8fafc' }}>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Select an image or use your camera</Text>
          </View>
        )}
        <View style={{ gap: 9 }}>
          <Button title="Choose from gallery" secondary onPress={chooseImage} />
          <Button title="Take a photo" secondary onPress={takePhoto} />
          <Button title="Analyze image" onPress={submit} loading={loading} disabled={!image} />
          {image ? <Button title="Change image" secondary onPress={chooseImage} /> : null}
        </View>
      </Card>
      {result ? <ImageResult response={result} /> : null}
    </Screen>
  );
}

function ImageResult({ response }) {
  const result = response.result || {};
  return (
    <Card>
      <SmallLabel>ANALYSIS RESULT</SmallLabel>
      <Text style={{ color: colors.text, fontSize: 19, fontWeight: '850' }}>
        {result.assessment || result.label || 'Analysis complete'}
      </Text>
      {result.confidence !== undefined ? <Text style={{ marginTop: 7, color: colors.primary, fontSize: 12, fontWeight: '750' }}>{result.confidence}% confidence indicator</Text> : null}
      {result.explanation ? <Text style={{ marginTop: 12, color: colors.muted, fontSize: 12, lineHeight: 19 }}>{result.explanation}</Text> : null}
      {result.aiProbability !== undefined ? <Text style={{ marginTop: 10, color: colors.muted, fontSize: 11 }}>AI-generated estimate: {result.aiProbability}% · Real estimate: {result.realProbability}%</Text> : null}
      <Text style={{ marginTop: 12, color: colors.subtle, fontSize: 10 }}>This model estimate alone cannot prove how an image was created.</Text>
    </Card>
  );
}
