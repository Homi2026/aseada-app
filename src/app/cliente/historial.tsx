import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { obtenerSesion } from '../../constants/auth';
import { api } from '../../constants/api';

export default function Historial() {
  const router = useRouter();
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      const { token } = await obtenerSesion();
      const data = await api.get('/servicios/historial', token);
      if (Array.isArray(data)) setServicios(data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const estadoColor = (estado) => {
    if (estado === 'completado') return '#4CAF50';
    if (estado === 'en_curso') return '#FF9800';
    if (estado === 'pendiente') return '#6C63FF';
    return '#999';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.volver}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Mis servicios</Text>
      </View>
      {loading ? (
        <ActivityIndicator size='large' color='#6C63FF' style={{ marginTop: 40 }} />
      ) : servicios.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioTexto}>No tienes servicios aun</Text>
        </View>
      ) : (
        <FlatList
          data={servicios}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitulo}>{item.tipo_hogar}</Text>
                <View style={[styles.badge, { backgroundColor: estadoColor(item.estado) }]}>
                  <Text style={styles.badgeTexto}>{item.estado}</Text>
                </View>
              </View>
              <Text style={styles.cardInfo}>Horas: {item.horas_total}h</Text>
              <Text style={styles.cardInfo}>Materiales: {item.incluye_materiales ? 'Si' : 'No'}</Text>
              <Text style={styles.cardPrecio}>{item.total}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8ff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  volver: { color: '#6C63FF', fontSize: 16, marginRight: 16 },
  titulo: { fontSize: 20, fontWeight: 'bold' },
  vacio: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vacioTexto: { fontSize: 16, color: '#999' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitulo: { fontSize: 16, fontWeight: 'bold' },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTexto: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  cardInfo: { fontSize: 14, color: '#666', marginBottom: 4 },
  cardPrecio: { fontSize: 20, fontWeight: 'bold', color: '#6C63FF', marginTop: 8 },
});