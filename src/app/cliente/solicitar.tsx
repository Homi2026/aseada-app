import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { api } from '../../constants/api';
import { obtenerSesion } from '../../constants/auth';

const TAMANIOS = [
  { label: 'Departamento pequeño', metros: 40, icono: '🏠' },
  { label: 'Departamento mediano', metros: 65, icono: '🏡' },
  { label: 'Casa mediana', metros: 100, icono: '🏘️' },
  { label: 'Casa grande', metros: 150, icono: '🏰' },
  { label: 'Casa muy grande', metros: 250, icono: '🏯' },
];

export default function Solicitar() {
  const [tamanio, setTamanio] = useState<any>(null);
  const [horasExtra, setHorasExtra] = useState(0);
  const [conMateriales, setConMateriales] = useState(false);
  const [precio, setPrecio] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calcular = async (t: any, h: number, m: boolean) => {
    const res = await api.post('/api/calcular-precio', { metros: t.metros, horas_extra: h, con_materiales: m });
    setPrecio(res);
  };

  const seleccionarTamanio = (t: any) => {
    setTamanio(t);
    calcular(t, horasExtra, conMateriales);
  };

  const cambiarHoras = (h: number) => {
    setHorasExtra(h);
    if (tamanio) calcular(tamanio, h, conMateriales);
  };

  const cambiarMateriales = (m: boolean) => {
    setConMateriales(m);
    if (tamanio) calcular(tamanio, horasExtra, m);
  };

  const solicitar = async () => {
    if (!tamanio) return Alert.alert('Error', 'Selecciona el tamaño');
    setLoading(true);
    try {
      const { token } = await obtenerSesion();
      const res = await api.post('/api/servicios', {
        metros: tamanio.metros,
        horas_extra: horasExtra,
        con_materiales: conMateriales,
        direccion: 'Por confirmar',
        fecha_servicio: new Date().toISOString()
      }, token!);
      if (res.id) {
        router.push({ pathname: '/cliente/buscando', params: { servicioId: res.id, total: precio.total_cliente } });
      } else {
        Alert.alert('Error', res.error || 'Error al crear servicio');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo conectar');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>¿Qué necesitas limpiar?</Text>

      <Text style={styles.seccion}>Tamaño del hogar</Text>
      {TAMANIOS.map((t) => (
        <TouchableOpacity key={t.metros} style={[styles.opcion, tamanio?.metros === t.metros && styles.opcionActiva]} onPress={() => seleccionarTamanio(t)}>
          <Text style={styles.opcionIcono}>{t.icono}</Text>
          <Text style={[styles.opcionTexto, tamanio?.metros === t.metros && styles.opcionTextoActivo]}>{t.label}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.seccion}>Horas adicionales (base: 3 horas)</Text>
      <View style={styles.horas}>
        {[0,1,2,3].map((h) => (
          <TouchableOpacity key={h} style={[styles.horaBtn, horasExtra === h && styles.horaBtnActivo]} onPress={() => cambiarHoras(h)}>
            <Text style={[styles.horaTexto, horasExtra === h && styles.horaTextoActivo]}>{h === 0 ? 'Sin extra' : `+${h}h`}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.seccion}>Materiales de limpieza</Text>
      <View style={styles.horas}>
        <TouchableOpacity style={[styles.horaBtn, !conMateriales && styles.horaBtnActivo]} onPress={() => cambiarMateriales(false)}>
          <Text style={[styles.horaTexto, !conMateriales && styles.horaTextoActivo]}>Yo los tengo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.horaBtn, conMateriales && styles.horaBtnActivo]} onPress={() => cambiarMateriales(true)}>
          <Text style={[styles.horaTexto, conMateriales && styles.horaTextoActivo]}>El aseador los trae</Text>
        </TouchableOpacity>
      </View>

      {precio && (
        <View style={styles.resumen}>
          <Text style={styles.resumenTitulo}>Resumen de precio</Text>
          <View style={styles.resumenFila}><Text>Servicio base (3 hrs)</Text><Text>${precio.precio_base?.toLocaleString()}</Text></View>
          {precio.extra > 0 && <View style={styles.resumenFila}><Text>Horas extra</Text><Text>${precio.extra?.toLocaleString()}</Text></View>}
          <View style={styles.resumenFila}><Text>Comisión plataforma</Text><Text>${precio.comision?.toLocaleString()}</Text></View>
          <View style={[styles.resumenFila, styles.resumenTotal]}><Text style={styles.totalTexto}>Total a pagar</Text><Text style={styles.totalPrecio}>${precio.total_cliente?.toLocaleString()}</Text></View>
        </View>
      )}

      <TouchableOpacity style={[styles.btn, !tamanio && styles.btnDesactivado]} onPress={solicitar} disabled={!tamanio || loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTexto}>Confirmar y buscar aseador</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8ff', padding: 24 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, marginTop: 40 },
  seccion: { fontSize: 16, fontWeight: '600', marginBottom: 12, marginTop: 16, color: '#333' },
  opcion: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#eee', marginBottom: 8, backgroundColor: '#fff' },
  opcionActiva: { borderColor: '#6C63FF', backgroundColor: '#f0efff' },
  opcionIcono: { fontSize: 24, marginRight: 12 },
  opcionTexto: { fontSize: 16, color: '#333' },
  opcionTextoActivo: { color: '#6C63FF', fontWeight: 'bold' },
  horas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  horaBtn: { padding: 12, borderRadius: 8, borderWidth: 2, borderColor: '#eee', backgroundColor: '#fff' },
  horaBtnActivo: { borderColor: '#6C63FF', backgroundColor: '#f0efff' },
  horaTexto: { color: '#666' },
  horaTextoActivo: { color: '#6C63FF', fontWeight: 'bold' },
  resumen: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 24, marginBottom: 16 },
  resumenTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  resumenFila: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  resumenTotal: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8, marginTop: 4 },
  totalTexto: { fontSize: 16, fontWeight: 'bold' },
  totalPrecio: { fontSize: 16, fontWeight: 'bold', color: '#6C63FF' },
  btn: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 18, alignItems: 'center', marginBottom: 40 },
  btnDesactivado: { backgroundColor: '#ccc' },
  btnTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
