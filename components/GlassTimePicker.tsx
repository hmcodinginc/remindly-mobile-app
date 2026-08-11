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
          <Ionicons name="time-outline" size={18} color="#818CF8" style={styles.leftIcon} />
          <Text style={styles.valueText}>{value || '09:00 AM'}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color="#94A3B8" />
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
                  <Text style={styles.modalTitle}>⏰ Select Notification Time</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color="#94A3B8" />
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
                          color={isSelected ? '#A78BFA' : '#818CF8'}
                          style={{ marginRight: 12 }}
                        />
                        <Text style={[styles.timeLabel, isSelected && styles.selectedTimeLabel]}>
                          {t.label}
                        </Text>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={20} color="#A78BFA" />}
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
  timeBox: {
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
    maxWidth: 420,
    backgroundColor: '#0E1424',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    padding: 18,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
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
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  selectedTimeItem: {
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderColor: 'rgba(139, 92, 246, 0.5)',
    borderWidth: 1,
  },
  timeItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  selectedTimeLabel: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
});
