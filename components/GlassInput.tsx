import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity, Platform, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GlassInputProps extends TextInputProps {
  label?: string;
  error?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export default function GlassInput({
  label,
  error,
  iconName,
  rightIcon,
  onRightIconPress,
  multiline,
  style,
  containerStyle,
  ...props
}: GlassInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          multiline && styles.multilineWrapper,
          error ? styles.inputError : null,
        ]}
      >
        {iconName && (
          <Ionicons
            name={iconName}
            size={18}
            color="#5B5CE2"
            style={[styles.leftIcon, multiline && styles.multilineLeftIcon]}
          />
        )}
        <TextInput
          placeholderTextColor="#9CA3AF"
          multiline={multiline}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
            style,
          ]}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIconBtn}>
            <Ionicons name={rightIcon} size={18} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    width: '100%',
  },
  label: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 46,
  },
  multilineWrapper: {
    height: undefined,
    minHeight: 80,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  leftIcon: {
    marginRight: 10,
  },
  multilineLeftIcon: {
    marginTop: 2,
  },
  input: {
    flex: 1,
    color: '#171717',
    fontSize: 14,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  multilineInput: {
    paddingVertical: 0,
    textAlignVertical: 'top',
  },
  rightIconBtn: {
    padding: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});
