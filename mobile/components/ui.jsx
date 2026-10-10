import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';

export function Screen({ children, scroll = true, contentStyle, ...props }) {
  const Body = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Body
        style={styles.body}
        contentContainerStyle={[styles.content, contentStyle]}
        keyboardShouldPersistTaps="handled"
        {...props}
      >
        {children}
      </Body>
    </SafeAreaView>
  );
}

export function Brand({ caption = 'Evidence-based AI analysis', onPress }) {
  const content = (
    <View style={styles.brand}>
      <View style={styles.brandIcon}><Text style={styles.brandIconText}>TL</Text></View>
      <View>
        <Text style={styles.brandName}>TruthLens</Text>
        <Text style={styles.brandCaption}>{caption}</Text>
      </View>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="TruthLens. Tap for account options."
      onPress={onPress}
      style={({ pressed }) => pressed && styles.brandPressed}
    >
      {content}
    </Pressable>
  );
}

export function PageHeading({ eyebrow, title, description }) {
  return (
    <View style={styles.heading}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Field({ label, multiline, style, ...props }) {
  return (
    <View style={styles.fieldGroup}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.subtle}
        style={[styles.input, multiline && styles.multiline, style]}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...props}
      />
    </View>
  );
}

export function Button({ title, onPress, loading, disabled, secondary, style }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        pressed && styles.buttonPressed,
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? colors.primary : '#ffffff'} />
      ) : (
        <Text style={[styles.buttonText, secondary && styles.buttonSecondaryText]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Message({ children, tone = 'error' }) {
  return (
    <View style={[styles.message, tone === 'success' ? styles.messageSuccess : styles.messageError]}>
      <Text style={[styles.messageText, tone === 'success' ? styles.successText : styles.errorText]}>
        {children}
      </Text>
    </View>
  );
}

export function LoadingView({ label = 'Loading...' }) {
  return (
    <SafeAreaView style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>{label}</Text>
    </SafeAreaView>
  );
}

export function SmallLabel({ children }) {
  return <Text style={styles.smallLabel}>{children}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: spacing.screen, paddingTop: 18, paddingBottom: 28 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 26 },
  brandPressed: { opacity: 0.72 },
  brandIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  brandIconText: { color: '#ffffff', fontSize: 14, fontWeight: '900' },
  brandName: { color: colors.text, fontSize: 18, fontWeight: '800' },
  brandCaption: { marginTop: 3, color: colors.subtle, fontSize: 10, fontWeight: '600' },
  heading: { marginBottom: 20 },
  eyebrow: { marginBottom: 7, color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { color: colors.text, fontSize: 27, fontWeight: '850', letterSpacing: -0.6 },
  description: { marginTop: 8, color: colors.muted, fontSize: 13, lineHeight: 20 },
  card: { marginBottom: 15, padding: 17, borderWidth: 1, borderColor: colors.border, borderRadius: 15, backgroundColor: colors.surface },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { marginBottom: 7, color: '#334155', fontSize: 12, fontWeight: '700' },
  input: { minHeight: 48, paddingHorizontal: 13, borderWidth: 1, borderColor: '#dce4ee', borderRadius: 10, backgroundColor: colors.surface, color: colors.text, fontSize: 14 },
  multiline: { minHeight: 145, paddingTop: 13 },
  button: { minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, borderWidth: 1, borderColor: colors.primary, borderRadius: 10, backgroundColor: colors.primary },
  buttonSecondary: { borderColor: '#d5e0ee', backgroundColor: colors.surface },
  buttonPressed: { opacity: 0.82 },
  buttonDisabled: { opacity: 0.58 },
  buttonText: { color: '#ffffff', fontSize: 13, fontWeight: '750' },
  buttonSecondaryText: { color: colors.text },
  message: { marginBottom: 14, padding: 12, borderRadius: 10 },
  messageError: { backgroundColor: colors.dangerBg },
  messageSuccess: { backgroundColor: colors.successBg },
  messageText: { fontSize: 12, lineHeight: 18 },
  errorText: { color: colors.danger },
  successText: { color: colors.success },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: colors.background },
  loadingText: { color: colors.muted, fontSize: 13 },
  smallLabel: { marginBottom: 9, color: colors.muted, fontSize: 11, fontWeight: '700' },
});
