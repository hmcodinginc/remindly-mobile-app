import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface PickerOption {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
}

interface GlassPickerProps {
  label?: string;
  value: string;
  options: PickerOption[];
  onSelect: (value: string) => void;
  iconName?: keyof typeof Ionicons.glyphMap;
  placeholder?: string;
}

export default function GlassPicker({
  label,
  value,
  options,
  onSelect,
  iconName = 'list-outline',
  placeholder = 'Select option...',
}: GlassPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((o) => o.value === value) || {
    label: value || placeholder,
    value,
  };

  const handleChoose = (val: string) => {
    onSelect(val);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
        style={styles.pickerBox}
      >
        <View style={styles.leftRow}>
          <Ionicons
            name={selectedOption.icon || iconName}
            size={18}
            color={selectedOption.color || '#818CF8'}
            style={styles.leftIcon}
          />
          <Text style={styles.valueText}>{selectedOption.label}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color="#94A3B8" />
      </TouchableOpacity>

      {/* Modal Dropdown Picker */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                  {options.map((opt) => {
                    const isSelected = opt.value === value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.optionItem, isSelected && styles.selectedOptionItem]}
                        onPress={() => handleChoose(opt.value)}
                      >
                        <View style={styles.optionLeft}>
                          {opt.icon && (
                            <Ionicons
                              name={opt.icon}
                              size={18}
                              color={opt.color || (isSelected ? '#A78BFA' : '#94A3B8')}
                              style={{ marginRight: 10 }}
                            />
                          )}
                          <Text style={[styles.optionLabel, isSelected && styles.selectedOptionLabel]}>
                            {opt.label}
                          </Text>
                        </View>
                        {isSelected && <Ionicons name="checkmark" size={18} color="#A78BFA" />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  pickerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.35)',
    paddingHorizontal: 14,
    height: 48,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leftIcon: {
    marginRight: 10,
  },
  valueText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 16, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '75%',
    backgroundColor: '#0E1424',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    padding: 16,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  closeBtn: {
    padding: 4,
  },
  optionsList: {
    maxHeight: 320,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  selectedOptionItem: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 14,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  selectedOptionLabel: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
});
