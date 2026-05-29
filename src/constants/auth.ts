import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const guardarSesion = async (token: string, usuario: any) => {
  if (Platform.OS === 'web') {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
  } else {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('usuario', JSON.stringify(usuario));
  }
};

export const obtenerSesion = async () => {
  if (Platform.OS === 'web') {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    return { token, usuario: usuario ? JSON.parse(usuario) : null };
  }
  const token = await AsyncStorage.getItem('token');
  const usuario = await AsyncStorage.getItem('usuario');
  return { token, usuario: usuario ? JSON.parse(usuario) : null };
};

export const cerrarSesion = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  } else {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('usuario');
  }
};
