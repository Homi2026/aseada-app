import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { obtenerSesion } from '../../constants/auth';
import { api } from '../../constants/api';

export default function WorkerSolicitudes() {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarSolicitudes();
    const intervalo = setInterval(cargarSolicitudes, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const cargarSolicitudes = async () => {
    try {
      const { token } = await obtenerSesion();
      const data = await api.get('/api/servicios', token);
      if (Array.isArray(data)) setSolicitudes(data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const aceptar = async (servicioId) => {
    try {
      const { token } = await obtenerSesion();
      await api.post('/api/servicios/aceptar', { servicioId }, token);
      router.push('/worker/trabajo-activo?servicioId=' + servicioId);
    } catch (e) { console.log(e); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Solicitudes disponibles</Text>
      {loading ? <ActivityIndicator size='large' color='#6C63FF' /> :
      solicitudes.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioTexto}>No hay solicitudes</Text>
          <Text style={styles.vacioSub}>Esperando nuevos servicios...</Text>
        </View>
      ) : (
        <FlatList data={solicitudes} keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>{item.tipo_hogar}</Text>
              <Text style={styles.cardInfo}>Horas: {item.horas_total}h</Text>
              <Text style={styles.cardPrecio}>{item.total}</Text>
              <TouchableOpacity style={styles.btnAceptar} onPress={() => aceptar(item.id)}>
                <Text style={styles.btnTexto}>Aceptar trabajo</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8ff', padding: 16 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginTop: 50, marginBottom: 16 },
  vacio: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vacioTexto: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  vacioSub: { fontSize: 14, color: '#999', marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  cardTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  cardInfo: { fontSize: 14, color: '#666', marginBottom: 4 },
  cardPrecio: { fontSize: 22, fontWeight: 'bold', color: '#6C63FF', marginVertical: 8 },
  btnAceptar: { backgroundColor: '#6C63FF', borderRadius: 8, padding: 12, alignItems: 'center' },
  btnTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});