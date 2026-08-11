import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GlassInputProps extends TextInputProps {
  label?: string;
  error?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

export default function GlassInput({
  label,
  error,
  iconName,
  rightIcon,
  onRightIconPress,
  multiline,
  style,
  ...props
}: GlassInputProps) {
  return (
    <View style={styles.container}>
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
            color="#818CF8"
            style={[styles.leftIcon, multiline && styles.multilineLeftIcon]}
          />
        )}
        <TextInput
          placeholderTextColor="#64748B"
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
            <Ionicons name={rightIcon} size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.35)',
    paddingHorizontal: 14,
    height: 48,
  },
  multilineWrapper: {
    height: undefined,
    minHeight: 84,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  inputError: {
    borderColor: '#F87171',
  },
  leftIcon: {
    marginRight: 10,
  },
  multilineLeftIcon: {
    marginTop: 2,
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
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
    color: '#F87171',
    fontSize: 12,
    marginTop: 4,
  },
});
