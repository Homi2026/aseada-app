import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { api } from '../../constants/api';
import { obtenerSesion, cerrarSesion } from '../../constants/auth';

export default function HomeWorker() {
  const [usuario, setUsuario] = useState<any>(null);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    obtenerSesion().then(({ usuario }) => setUsuario(usuario));
    cargarSolicitudes();
    const interval = setInterval(cargarSolicitudes, 5000);
    return () => clearInterval(interval);
  }, []);

  const cargarSolicitudes = async () => {
    try {
      const { token } = await obtenerSesion();
      const res = await api.get('/api/servicios', token!);
      const pendientes = res.filter((s: any) => s.estado === 'buscando_worker' || s.estado === 'pendiente_pago');
      setSolicitudes(pendientes);
    } catch (e) {}
  };

  const aceptar = async (servicioId: number, workerRecibe: number) => {
    Alert.alert('¿Aceptar trabajo?', `Recibirás $${workerRecibe.toLocaleString()}`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Aceptar', onPress: async () => {
        setLoading(true);
        try {
          const { token } = await obtenerSesion();
          await api.post(`/api/servicios/${servicioId}/aceptar`, {}, token!);
          cargarSolicitudes();
          Alert.alert('¡Trabajo aceptado!', 'El cliente ha sido notificado');
        } catch (e) {
          Alert.alert('Error', 'No se pudo aceptar');
        }
        setLoading(false);
      }}
    ]);
  };

  const salir = async () => {
    await cerrarSesion();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.saludo}>Hola, {usuario?.nombre?.split(' ')[0]} 🧹</Text>
          <Text style={styles.subtitulo}>Aseador profesional</Text>
        </View>
        <TouchableOpacity onPress={salir}>
          <Text style={styles.salir}>Salir</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.seccion}>Solicitudes disponibles ({solicitudes.length})</Text>

      {solicitudes.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioIcono}>⏳</Text>
          <Text style={styles.vacioTexto}>Esperando solicitudes...</Text>
          <Text style={styles.vacioSub}>Te notificaremos cuando haya trabajo</Text>
        </View>
      ) : (
        <FlatList
          data={solicitudes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.tarjeta}>
              <Text style={styles.tarjetaDireccion}>📍 {item.direccion}</Text>
              <Text style={styles.tarjetaDetalle}>🏠 {item.metros}m² · {item.horas_extra > 0 ? `+${item.horas_extra}h extra` : '3 horas base'}</Text>
              <Text style={styles.tarjetaDetalle}>{item.con_materiales ? '🧴 Con materiales' : '🧹 Sin materiales'}</Text>
              <View style={styles.tarjetaPrecio}>
                <Text style={styles.precioTexto}>Recibirías</Text>
                <Text style={styles.precioMonto}>${item.worker_recibe?.toLocaleString()}</Text>
              </View>
              <TouchableOpacity style={styles.btnAceptar} onPress={() => aceptar(item.id, item.worker_recibe)} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTexto}>✅ Aceptar trabajo</Text>}
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/worker/ganancias')}>
          <Text style={styles.menuIcono}>💰</Text>
          <Text style={styles.menuTexto}>Ganancias</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/worker/historial')}>
          <Text style={styles.menuIcono}>📋</Text>
          <Text style={styles.menuTexto}>Historial</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8ff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: '#fff' },
  saludo: { fontSize: 20, fontWeight: 'bold' },
  subtitulo: { fontSize: 14, color: '#6C63FF' },
  salir: { color: '#999', fontSize: 14 },
  seccion: { fontSize: 16, fontWeight: '600', padding: 16, color: '#333' },
  vacio: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vacioIcono: { fontSize: 64, marginBottom: 16 },
  vacioTexto: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  vacioSub: { fontSize: 14, color: '#666' },
  tarjeta: { backgroundColor: '#fff', margin: 12, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  tarjetaDireccion: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  tarjetaDetalle: { fontSize: 14, color: '#666', marginBottom: 4 },
  tarjetaPrecio: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 12, backgroundColor: '#f0efff', borderRadius: 8, padding: 12 },
  precioTexto: { fontSize: 14, color: '#666' },
  precioMonto: { fontSize: 24, fontWeight: 'bold', color: '#6C63FF' },
  btnAceptar: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  menu: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  menuItem: { flex: 1, alignItems: 'center', padding: 8 },
  menuIcono: { fontSize: 24, marginBottom: 4 },
  menuTexto: { fontSize: 12, color: '#666' }
});
