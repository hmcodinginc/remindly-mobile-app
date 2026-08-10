import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  glow?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

export default function GlassCard({ children, style, onPress, glow = false, intensity = 'medium' }: GlassCardProps) {
  const getBgColor = () => {
    switch (intensity) {
      case 'low': return 'rgba(15, 23, 42, 0.55)';
      case 'high': return 'rgba(24, 34, 56, 0.85)';
      default: return 'rgba(18, 25, 42, 0.72)';
    }
  };

  const cardStyle = [
    styles.card,
    {
      backgroundColor: getBgColor(),
      borderColor: glow ? 'rgba(139, 92, 246, 0.5)' : 'rgba(99, 102, 241, 0.25)',
      shadowColor: glow ? '#8B5CF6' : '#6366F1',
      shadowOpacity: glow ? 0.35 : 0.15,
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.82} onPress={onPress} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
});
