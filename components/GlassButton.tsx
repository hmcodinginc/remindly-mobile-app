import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function GlassButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}: GlassButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: 'rgba(30, 41, 59, 0.8)',
          border: 'rgba(99, 102, 241, 0.4)',
          text: '#818CF8',
        };
      case 'danger':
        return {
          bg: 'rgba(239, 68, 68, 0.2)',
          border: 'rgba(239, 68, 68, 0.5)',
          text: '#F87171',
        };
      case 'ghost':
        return {
          bg: 'transparent',
          border: 'transparent',
          text: '#94A3B8',
        };
      default:
        return {
          bg: 'rgba(99, 102, 241, 0.85)',
          border: 'rgba(139, 92, 246, 0.6)',
          text: '#FFFFFF',
        };
    }
  };

  const vStyle = getVariantStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: vStyle.bg,
          borderColor: vStyle.border,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vStyle.text} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon && <Ionicons name={icon} size={18} color={vStyle.text} style={styles.icon} />}
          <Text style={[styles.text, { color: vStyle.text }, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
