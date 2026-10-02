import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SwipeDeck } from '../../components/SwipeDeck';
import { Button, Chip } from '../../components/ui';
import { ROLES } from '../../constants/roles';
import { fetchCandidates, recordSwipe } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import type { Profile } from '../../lib/types';
import { colors } from '../../theme';
import { router } from 'expo-router';

export default function Discover() {
  const { session } = useAuth();
  const me = session!.user.id;
  const qc = useQueryClient();
  const [role, setRole] = useState<string | undefined>();
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [matched, setMatched] = useState<Profile | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['candidates', me, role, onlyAvailable],
    queryFn: () => fetchCandidates(me, { role, onlyAvailable }),
  });
  const deck = (data ?? []).filter((p) => !hidden.includes(p.id));

  const onSwipe = useCallback(
    async (p: Profile, dir: 'like' | 'pass') => {
      setHidden((h) => [...h, p.id]);
      try {
        const isMatch = await recordSwipe(me, p.id, dir);
        if (isMatch) {
          setMatched(p);
          qc.invalidateQueries({ queryKey: ['matches'] });
        }
      } catch (e) {
        setHidden((h) => h.filter((id) => id !== p.id));
        Alert.alert('Erro ao registrar', e instanceof Error ? e.message : 'Tente novamente.');
      }
    },
    [me, qc],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
          <Chip label="Só disponíveis" selected={onlyAvailable} onPress={() => setOnlyAvailable((v) => !v)} />
          {ROLES.map((r) => (
            <Chip key={r} label={r} selected={role === r} onPress={() => setRole(role === r ? undefined : r)} />
          ))}
        </ScrollView>
      </View>
      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={{ color: colors.danger, padding: 20 }}>Erro ao carregar perfis.</Text>
      ) : (
        <SwipeDeck profiles={deck} onSwipe={onSwipe} />
      )}
      <Modal visible={Boolean(matched)} transparent animationType="fade">
        <View style={s.modal}>
          <Text style={s.matchTitle}>É um match! 🎬</Text>
          <Text style={{ color: colors.text, textAlign: 'center' }}>
            Você e {matched?.name} querem trabalhar juntos.
          </Text>
          <View style={{ gap: 10, alignSelf: 'stretch' }}>
            <Button title="Ver conversas" onPress={() => { setMatched(null); router.push('/matches'); }} />
            <Button title="Continuar" variant="ghost" onPress={() => setMatched(null)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  filters: { gap: 8, padding: 12 },
  modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', alignItems: 'center', justifyContent: 'center', padding: 28, gap: 18 },
  matchTitle: { color: colors.accent, fontSize: 34, fontWeight: '900' },
});
