import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../theme/colors';

const OPTIONS = [
  {label: 'Desligado', minutes: 0},
  {label: '15 min', minutes: 15},
  {label: '30 min', minutes: 30},
  {label: '45 min', minutes: 45},
  {label: '1 hora', minutes: 60},
  {label: '1h 30min', minutes: 90},
];

type Props = {
  visible: boolean;
  sleepMinutes: number;
  onSelect: (minutes: number) => void;
  onClose: () => void;
  remainingSeconds: number | null;
};

function formatRemaining(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s.toString().padStart(2, '0')}s` : `${s}s`;
}

export function SleepTimerModal({visible, sleepMinutes, onSelect, onClose, remainingSeconds}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.sheet, {paddingBottom: (insets.bottom || 16) + 8}]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Icon name="moon-outline" size={20} color={colors.accent} />
            <Text style={styles.title}>Sleep Timer</Text>
            {remainingSeconds != null && sleepMinutes > 0 && (
              <Text style={styles.countdown}>{formatRemaining(remainingSeconds)}</Text>
            )}
          </View>
          {OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.minutes}
              style={styles.option}
              onPress={() => { onSelect(opt.minutes); onClose(); }}>
              <Text style={[styles.optionText, sleepMinutes === opt.minutes && styles.optionActive]}>
                {opt.label}
              </Text>
              {sleepMinutes === opt.minutes && (
                <Icon name="checkmark" size={18} color={colors.accent} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  countdown: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    color: colors.text,
    fontSize: 15,
  },
  optionActive: {
    color: colors.accent,
    fontWeight: '700',
  },
});
