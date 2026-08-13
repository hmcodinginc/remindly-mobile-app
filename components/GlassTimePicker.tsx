import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GlassTimePickerProps {
  label?: string;
  value: string; // e.g. "09:00 AM"
  onSelect: (timeStr: string) => void;
}

export default function GlassTimePicker({
  label = 'Time of Day',
  value = '09:00 AM',
  onSelect,
}: GlassTimePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const times = [
    { label: 'Morning (09:00 AM)', value: '09:00 AM', icon: 'sunny-outline' },
    { label: 'Noon (12:00 PM)', value: '12:00 PM', icon: 'partly-sunny-outline' },
    { label: 'Afternoon (03:00 PM)', value: '03:00 PM', icon: 'time-outline' },
    { label: 'Evening (06:00 PM)', value: '06:00 PM', icon: 'cloudy-night-outline' },
    { label: 'Night (09:00 PM)', value: '09:00 PM', icon: 'moon-outline' },
  ];

  const handleChoose = (tVal: string) => {
    onSelect(tVal);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
        style={styles.timeBox}
      >
        <View style={styles.leftRow}>
          <Ionicons name="time-outline" size={18} color="#5B5CE2" style={styles.leftIcon} />
          <Text style={styles.valueText}>{value || '09:00 AM'}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color="#6B7280" />
      </TouchableOpacity>

      {/* Time Picker Modal */}
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
                  <Text style={styles.modalTitle}>Select Time</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {times.map((t) => {
                  const isSelected = t.value === value;
                  return (
                    <TouchableOpacity
                      key={t.value}
                      style={[styles.timeItem, isSelected && styles.selectedTimeItem]}
                      onPress={() => handleChoose(t.value)}
                    >
                      <View style={styles.timeItemLeft}>
                        <Ionicons
                          name={t.icon as any}
                          size={20}
                          color={isSelected ? '#5B5CE2' : '#6B7280'}
                          style={{ marginRight: 12 }}
                        />
                        <Text style={[styles.timeLabel, isSelected && styles.selectedTimeLabel]}>
                          {t.label}
                        </Text>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={20} color="#5B5CE2" />}
                    </TouchableOpacity>
                  );
                })}
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
    marginBottom: 14,
    width: '100%',
  },
  label: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 46,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIcon: {
    marginRight: 10,
  },
  valueText: {
    color: '#171717',
    fontSize: 14,
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 18,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#171717',
  },
  closeBtn: {
    padding: 4,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  selectedTimeItem: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  timeItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedTimeLabel: {
    color: '#5B5CE2',
    fontWeight: '700',
  },
});
