import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, ScrollView } from 'react-native';
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

  // Generate date quick choices
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

  // Calendar month dates generator
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
          <Ionicons name="calendar-outline" size={18} color="#818CF8" style={styles.leftIcon} />
          <Text style={styles.valueText}>{selectedDate}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color="#94A3B8" />
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
                  <Text style={styles.modalTitle}>📅 Select Calendar Date</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color="#94A3B8" />
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

                {/* Calendar Days Simulation Grid */}
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
  dateBox: {
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
    maxWidth: 440,
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
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  closeBtn: {
    padding: 4,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#818CF8',
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
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  quickChipActive: {
    backgroundColor: '#6366F1',
    borderColor: '#8B5CF6',
  },
  quickText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
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
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDayCell: {
    backgroundColor: '#8B5CF6',
    borderColor: '#A78BFA',
  },
  dayCellText: {
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  selectedDayCellText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
