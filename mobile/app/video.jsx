import { useState } from 'react';
import { Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Button, Card, Message, PageHeading, Screen, SmallLabel } from '../components/ui';
import { colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import { uploadVideo } from '../services/analysisService';

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const VIDEO_EXTENSIONS = ['.mp4', '.avi', '.mov', '.mkv', '.webm'];

export default function VideoAnalysisScreen() {
  const { token } = useAuth();
  const [video, setVideo] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const chooseVideo = async () => {
    try {
      const selection = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (selection.canceled || !selection.assets?.length) return;
      const asset = selection.assets[0];
      const extension = `.${asset.name.split('.').pop()}`.toLowerCase();
      if (!VIDEO_EXTENSIONS.includes(extension)) {
        setError('Choose an MP4, AVI, MOV, MKV, or WEBM video.');
        setVideo(null);
        return;
      }
      const info = asset.size ? { size: asset.size } : await FileSystem.getInfoAsync(asset.uri);
      if (info.size && info.size > MAX_VIDEO_BYTES) {
        setError('Videos must be 50 MB or smaller.');
        setVideo(null);
        return;
      }
      setVideo({ uri: asset.uri, name: asset.name, size: info.size || 0 });
      setResult(null);
      setError('');
    } catch (pickerError) {
      setError(getErrorMessage(pickerError, 'Unable to select the video.'));
    }
  };

  const submit = async () => {
    if (!video || loading) {
      setError('Choose a video before analysis.');
      return;
    }
    setLoading(true);
    setProgress(0);
    setError('');
    setResult(null);
    try {
      const response = await uploadVideo(video.uri, video.name, token, (event) => {
        if (event.totalBytesExpectedToSend > 0) {
          setProgress(Math.min(100, Math.round(event.totalBytesSent / event.totalBytesExpectedToSend * 100)));
        }
      });
      setResult(response);
    } catch (uploadError) {
      setError(getErrorMessage(uploadError, 'Video analysis failed. Please retry.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <PageHeading eyebrow="Video verification" title="Analyze a video" description="Select a video to check for manipulation signals. Supported formats: MP4, AVI, MOV, MKV, and WEBM (up to 50 MB)." />
      <Card>
        {error ? <Message>{error}</Message> : null}
        {video ? (
          <>
            <VideoPreview uri={video.uri} />
            <Text numberOfLines={1} style={{ marginTop: 9, marginBottom: 13, color: colors.muted, fontSize: 11 }}>{video.name}</Text>
          </>
        ) : (
          <View style={{ minHeight: 130, alignItems: 'center', justifyContent: 'center', marginBottom: 13, borderWidth: 1, borderStyle: 'dashed', borderColor: '#cbd5e1', borderRadius: 12, backgroundColor: '#f8fafc' }}>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Select a video from your device</Text>
          </View>
        )}
        <View style={{ gap: 9 }}>
          <Button title={video ? 'Choose a different video' : 'Choose video'} secondary onPress={chooseVideo} />
          <Button title="Analyze video" onPress={submit} loading={loading} disabled={!video} />
        </View>
        {loading ? (
          <Text style={{ marginTop: 10, color: colors.primary, fontSize: 11, textAlign: 'center' }}>
            Uploading video{progress ? ` · ${progress}%` : '...'}
          </Text>
        ) : null}
      </Card>
      {result ? <VideoResult response={result} /> : null}
    </Screen>
  );
}

function VideoPreview({ uri }) {
  const player = useVideoPlayer(uri);
  return (
    <VideoView
      player={player}
      style={{ width: '100%', height: 205, borderRadius: 10, backgroundColor: '#0f172a' }}
      nativeControls
      contentFit="contain"
    />
  );
}

function VideoResult({ response }) {
  const result = response.result || {};
  return (
    <Card>
      <SmallLabel>ANALYSIS RESULT</SmallLabel>
      <Text style={{ color: colors.text, fontSize: 19, fontWeight: '850' }}>{result.assessment || result.label || 'Analysis complete'}</Text>
      {result.confidence !== undefined ? <Text style={{ marginTop: 7, color: colors.primary, fontSize: 12, fontWeight: '750' }}>{result.confidence}% confidence indicator</Text> : null}
      {result.explanation ? <Text style={{ marginTop: 12, color: colors.muted, fontSize: 12, lineHeight: 19 }}>{result.explanation}</Text> : null}
      {result.fakeProbability !== undefined ? <Text style={{ marginTop: 10, color: colors.muted, fontSize: 11 }}>Manipulation estimate: {result.fakeProbability}% · Authentic estimate: {result.realProbability}%</Text> : null}
      {result.framesAnalyzed !== undefined ? <Text style={{ marginTop: 7, color: colors.muted, fontSize: 11 }}>Frames analyzed: {result.framesAnalyzed}</Text> : null}
      <Text style={{ marginTop: 12, color: colors.subtle, fontSize: 10 }}>This model estimate is not proof that a video was edited.</Text>
    </Card>
  );
}
