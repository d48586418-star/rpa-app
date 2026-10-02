import { Platform, StyleSheet, TextInput, View } from 'react-native';
import { colors, fonts, glass, radius, shadow } from '../theme';
import { Icon } from './Icon';
import { Photo } from './Photo';
import { Glass, IconButton } from './ui';

const TILES: { photo: string; left: string; top: number; w: number; h: number; rot: number }[] = [
  { photo: 'steadicam', left: '-3%', top: 6, w: 112, h: 138, rot: -5 },
  { photo: 'show-luzes', left: '20%', top: -6, w: 104, h: 128, rot: 3 },
  { photo: 'casamento-lago', left: '42%', top: 12, w: 112, h: 138, rot: -2 },
  { photo: 'drone-rio', left: '65%', top: -4, w: 104, h: 128, rot: 4 },
  { photo: 'edicao-laptop', left: '84%', top: 10, w: 100, h: 132, rot: -4 },
];

/** Barra de busca de vidro fosco sobre um mosaico de fotos (referência digupAI). */
export function SearchHero({
  value, onChangeText, onFilters,
}: { value: string; onChangeText: (t: string) => void; onFilters: () => void }) {
  return (
    <View style={s.hero}>
      {TILES.map((t) => (
        <View key={t.photo} style={[s.tile, { left: t.left as `${number}%`, top: t.top, width: t.w, height: t.h, transform: [{ rotate: `${t.rot}deg` }] }]}>
          <Photo photo={t.photo} style={StyleSheet.absoluteFill} />
        </View>
      ))}
      <Glass style={s.bar}>
        <Icon name="search" size={20} color={colors.muted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Buscar vagas ou pessoas"
          placeholderTextColor={colors.muted}
          accessibilityLabel="Buscar vagas ou pessoas"
          returnKeyType="search"
          style={s.input}
        />
        <IconButton icon="filter" label="Abrir filtros em Explorar" onPress={onFilters} size={40} tone="ink" />
      </Glass>
    </View>
  );
}

const s = StyleSheet.create({
  hero: { height: 150, justifyContent: 'flex-end', overflow: 'visible' },
  tile: { position: 'absolute', borderRadius: 22, overflow: 'hidden', borderWidth: 3, borderColor: '#fff', ...(shadow.card as object) },
  bar: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 16, paddingRight: 6, paddingVertical: 6,
    borderRadius: radius.pill, backgroundColor: glass.fillStrong, ...(shadow.float as object),
  },
  input: { flex: 1, fontSize: 15, fontFamily: fonts.regular, color: colors.text, paddingVertical: 8, minHeight: 40, ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null) },
});
