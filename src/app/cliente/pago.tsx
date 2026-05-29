import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { obtenerSesion } from '../../constants/auth';
import { api } from '../../constants/api';

export default function Pago() {
  const router = useRouter();
  const { servicioId, total } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pagar = async () => {
    setLoading(true);
    setError('');
    try {
      const { token } = await obtenerSesion();
      const data = await api.post('/pagos/crear', { servicioId }, token);
      if (data.url) {
        await Linking.openURL(data.url);
      } else {
        setError(data.error || 'No se pudo iniciar el pago');
      }
    } catch (e) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.volver}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Confirmar pago</Text>
      </View>
      <View style={styles.resumen}>
        <Text style={styles.label}>Servicio</Text>
        <Text style={styles.valor}>#{servicioId}</Text>
        <Text style={styles.label}>Total a pagar</Text>
        <Text style={styles.precio}>${total}</Text>
      </View>
      <View style={styles.infoFlow}>
        <Text style={styles.infoTexto}>Pago seguro procesado por Flow</Text>
        <Text style={styles.infoSub}>Acepta tarjetas de credito, debito y transferencias</Text>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.btnPagar} onPress={pagar} disabled={loading}>
        {loading ? <ActivityIndicator color='#fff' /> : <Text style={styles.btnTexto}>Pagar con Flow</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8ff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  volver: { color: '#6C63FF', fontSize: 16, marginRight: 16 },
  titulo: { fontSize: 20, fontWeight: 'bold' },
  resumen: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#eee' },
  label: { fontSize: 13, color: '#999', marginTop: 12 },
  valor: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  precio: { fontSize: 32, fontWeight: 'bold', color: '#6C63FF', marginTop: 4 },
  infoFlow: { backgroundColor: '#f0f0ff', margin: 16, borderRadius: 12, padding: 16 },
  infoTexto: { fontSize: 14, fontWeight: 'bold', color: '#6C63FF', textAlign: 'center' },
  infoSub: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 4 },
  error: { color: 'red', textAlign: 'center', margin: 16 },
  btnPagar: { backgroundColor: '#6C63FF', margin: 16, borderRadius: 12, padding: 18, alignItems: 'center' },
  btnTexto: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});