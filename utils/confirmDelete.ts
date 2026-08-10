import { Alert, Platform } from 'react-native';

export const confirmDelete = (
  title: string,
  message: string,
  onConfirm: () => void | Promise<void>
) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onConfirm(),
      },
    ]);
  }
};
