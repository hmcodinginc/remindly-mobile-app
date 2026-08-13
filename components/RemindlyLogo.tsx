import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface RemindlyLogoProps {
  size?: number;
  showBackground?: boolean;
}

export default function RemindlyLogo({ size = 60, showBackground = true }: RemindlyLogoProps) {
  const width = size;
  const height = size;
  const imageSize = showBackground ? size * 0.8 : size;

  return (
    <View
      style={[
        styles.container,
        { width, height },
        showBackground && {
          backgroundColor: '#FFFFFF',
          borderRadius: size * 0.28,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          overflow: 'hidden',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        },
      ]}
    >
      <Image
        source={require('../assets/logo1.png')}
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
