import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { obtenerSesion } from '../../constants/auth';
import { api } from '../../constants/api';

export default function TrabajoActivo() {
  const router = useRouter();
  const { servicioId } = useLocalSearchParams();
  const [servicio, setServicio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completando, setCompletando] = useState(false);

  useEffect(() => { cargarServicio(); }, []);

  const cargarServicio = async () => {
    try {
      const { token } = await obtenerSesion();
      const data = await api.get('/api/servicios/' + servicioId, token);
      setServicio(data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const completar = async () => {
    setCompletando(true);
    try {
      const { token } = await obtenerSesion();
      await api.post('/api/servicios/' + servicioId + '/completar', {}, token);
      router.replace('/worker/home');
    } catch (e) { console.log(e); }
    finally { setCompletando(false); }
  };

  if (loading) return <ActivityIndicator size='large' color='#6C63FF' style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Trabajo en curso</Text>
      {servicio && (
        <View style={styles.card}>
          <Text style={styles.label}>Tipo de hogar</Text>
          <Text style={styles.valor}>{servicio.tipo_hogar}</Text>
          <Text style={styles.label}>Horas</Text>
          <Text style={styles.valor}>{servicio.horas_total}h</Text>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.precio}>{servicio.total}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.btnCompletar} onPress={completar} disabled={completando}>
        <Text style={styles.btnTexto}>{completando ? 'Completando...' : 'Marcar como completado'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8ff', padding: 24 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginTop: 50, marginBottom: 24 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#eee', marginBottom: 32 },
  label: { fontSize: 13, color: '#999', marginTop: 12 },
  valor: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  precio: { fontSize: 28, fontWeight: 'bold', color: '#6C63FF', marginTop: 4 },
  btnCompletar: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 18, alignItems: 'center' },
  btnTexto: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});