import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

export default function GlassButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
}: GlassButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          btn: styles.secondaryBtn,
          text: styles.secondaryText,
          iconColor: '#374151',
        };
      case 'danger':
        return {
          btn: styles.dangerBtn,
          text: styles.dangerText,
          iconColor: '#EF4444',
        };
      case 'ghost':
        return {
          btn: styles.ghostBtn,
          text: styles.ghostText,
          iconColor: '#5B5CE2',
        };
      default:
        return {
          btn: styles.primaryBtn,
          text: styles.primaryText,
          iconColor: '#FFFFFF',
        };
    }
  };

  const vStyle = getVariantStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, vStyle.btn, disabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#5B5CE2'} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon && <Ionicons name={icon} size={18} color={vStyle.iconColor} style={{ marginRight: 6 }} />}
          <Text style={[styles.text, vStyle.text]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: '#5B5CE2',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryText: {
    color: '#374151',
  },
  dangerBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  dangerText: {
    color: '#DC2626',
  },
  ghostBtn: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: '#5B5CE2',
  },
  disabled: {
    opacity: 0.5,
  },
});
