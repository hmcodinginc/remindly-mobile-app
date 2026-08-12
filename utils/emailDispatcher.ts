import { Linking, Platform } from 'react-native';

export const openRealEmailApp = async (email: string, subject: string, body: string) => {
  const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.open(mailtoUrl, '_blank');
      }
    } else {
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (supported) {
        await Linking.openURL(mailtoUrl);
      } else {
        await Linking.openURL(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
      }
    }
    return true;
  } catch (err) {
    console.warn('Could not open email application:', err);
    return false;
  }
};
