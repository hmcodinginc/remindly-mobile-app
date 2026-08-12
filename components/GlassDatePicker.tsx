import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GlassDatePickerProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onSelect: (dateStr: string) => void;
}

export default function GlassDatePicker({
  label = 'Due / Renewal Date',
  value,
  onSelect,
}: GlassDatePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const selectedDate = value || todayStr;

  const getOffsetDateStr = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const quickDates = [
    { label: 'Today', date: todayStr },
    { label: 'Tomorrow', date: getOffsetDateStr(1) },
    { label: 'In 3 Days', date: getOffsetDateStr(3) },
    { label: 'Next Week (7d)', date: getOffsetDateStr(7) },
    { label: 'In 14 Days', date: getOffsetDateStr(14) },
    { label: 'Next Month (30d)', date: getOffsetDateStr(30) },
  ];

  const currYear = parseInt(selectedDate.split('-')[0]) || new Date().getFullYear();
  const currMonth = parseInt(selectedDate.split('-')[1]) || new Date().getMonth() + 1;

  const handleSelectDate = (dateStr: string) => {
    onSelect(dateStr);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
        style={styles.dateBox}
      >
        <View style={styles.leftRow}>
          <Ionicons name="calendar-outline" size={18} color="#5B5CE2" style={styles.leftIcon} />
          <Text style={styles.valueText}>{selectedDate}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color="#6B7280" />
      </TouchableOpacity>

      {/* Date Picker Modal */}
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
                  <Text style={styles.modalTitle}>Select Date</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionHeading}>Quick Preset Choices</Text>
                <View style={styles.quickGrid}>
                  {quickDates.map((q) => {
                    const isSelected = q.date === selectedDate;
                    return (
                      <TouchableOpacity
                        key={q.label}
                        style={[styles.quickChip, isSelected && styles.quickChipActive]}
                        onPress={() => handleSelectDate(q.date)}
                      >
                        <Text style={[styles.quickText, isSelected && styles.quickTextActive]}>
                          {q.label} ({q.date.slice(5)})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.sectionHeading}>Month View ({currYear}-{String(currMonth).padStart(2, '0')})</Text>
                <View style={styles.calendarGrid}>
                  {Array.from({ length: 28 }, (_, i) => {
                    const dayNum = i + 1;
                    const dateStr = `${currYear}-${String(currMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const isSelected = dateStr === selectedDate;

                    return (
                      <TouchableOpacity
                        key={dayNum}
                        style={[styles.dayCell, isSelected && styles.selectedDayCell]}
                        onPress={() => handleSelectDate(dateStr)}
                      >
                        <Text style={[styles.dayCellText, isSelected && styles.selectedDayCellText]}>
                          {dayNum}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
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
  dateBox: {
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
    maxWidth: 440,
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
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#171717',
  },
  closeBtn: {
    padding: 4,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5B5CE2',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 4,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickChipActive: {
    backgroundColor: '#5B5CE2',
    borderColor: '#5B5CE2',
  },
  quickText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
  },
  quickTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: 44,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDayCell: {
    backgroundColor: '#5B5CE2',
    borderColor: '#5B5CE2',
  },
  dayCellText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  selectedDayCellText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
