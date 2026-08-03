import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface RemindlyLogoProps {
  size?: number;
  showBackground?: boolean;
}

export default function RemindlyLogo({ size = 60, showBackground = true }: RemindlyLogoProps) {
  const width = size;
  const height = size;
  const imageSize = showBackground ? size * 0.75 : size;

  return (
    <View
      style={[
        styles.container,
        { width, height },
        showBackground && {
          backgroundColor: '#0B0F19',
          borderRadius: size * 0.28,
          borderWidth: 1,
          borderColor: 'rgba(99, 102, 241, 0.3)',
          overflow: 'hidden',
        },
      ]}
    >
      <Image
        source={require('../assets/logo.png')}
        style={{ width: imageSize, height: imageSize }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

