import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, StyleSheet, Animated, TouchableOpacity,
} from 'react-native';
import AppText from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import HelpCircle from 'lucide-react-native/dist/esm/icons/circle-question-mark';
import Play from 'lucide-react-native/dist/esm/icons/play';
import Users from 'lucide-react-native/dist/esm/icons/users';
import WifiOff from 'lucide-react-native/dist/esm/icons/wifi-off';
import RefreshCw from 'lucide-react-native/dist/esm/icons/refresh-cw';
import ChevronRight from 'lucide-react-native/dist/esm/icons/chevron-right';
import X from 'lucide-react-native/dist/esm/icons/x';
import Lightbulb from 'lucide-react-native/dist/esm/icons/lightbulb';
import CloudDownload from 'lucide-react-native/dist/esm/icons/cloud-download';
import Brain from 'lucide-react-native/dist/esm/icons/brain';
import Car from 'lucide-react-native/dist/esm/icons/car';
import House from 'lucide-react-native/dist/esm/icons/house';
import UtensilsCrossed from 'lucide-react-native/dist/esm/icons/utensils-crossed';
import Clapperboard from 'lucide-react-native/dist/esm/icons/clapperboard';
import Trophy from 'lucide-react-native/dist/esm/icons/trophy';
import PawPrint from 'lucide-react-native/dist/esm/icons/paw-print';
import Briefcase from 'lucide-react-native/dist/esm/icons/briefcase';
import PartyPopper from 'lucide-react-native/dist/esm/icons/party-popper';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import PrimaryButton from '../../components/PrimaryButton';
import InkButton from '../../components/InkButton';
import IconButton from '../../components/IconButton';
import BottomSheet from '../../components/BottomSheet';
import AppMark from '../../components/AppMark';
import TextButton from '../../components/TextButton';
import Pill from '../../components/Pill';
import { CATEGORIES, CategoryIcon, CategoryKey } from '../../data/words';
import { storage } from '../../utils/storage';
import { useGame } from '../../context/GameContext';
import { useHideTabBar } from '../../components/TabBarVisibility';
import {
  checkForNewWords, pendingNewWords, markNewWordsSeen,
} from '../../utils/wordsService';
import { activePackTitles, newWordCount, WordsFeed } from '../../utils/wordsFeed';

const CATEGORY_ICONS: Record<CategoryIcon, typeof Brain> = {
  brain: Brain,
  car: Car,
  house: House,
  utensils: UtensilsCrossed,
  clapperboard: Clapperboard,
  trophy: Trophy,
  paw: PawPrint,
  briefcase: Briefcase,
  party: PartyPopper,
};

const HOW_TO_PLAY = [
  {
    title: 'One word, one imposter',
    body: 'Everyone sees the same secret word except the imposter, who has to blend in.',
  },
  {
    title: 'Give one-word clues',
    body: 'Take turns. Say a clue about the word without saying the word itself.',
  },
  {
    title: 'Vote and reveal',
    body: 'Vote for the imposter. Crew wins by catching them. The imposter wins by surviving.',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { setGame } = useGame();
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [newWords, setNewWords] = useState<WordsFeed | null>(null);
  const [lastGame, setLastGame] = useState<{ category: CategoryKey; players: number } | null>(null);

  const entryAnim = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(16)).current;

  // The sheet is drawn inside this screen, so the tab bar steps aside.
  useHideTabBar(showHowToPlay || !!newWords);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [entryAnim, entryY]);

  // Word updates. The check is fire and forget: it never blocks the screen,
  // and if it fails the player keeps the words they already had. The sheet
  // is shown once per feed version.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await checkForNewWords();
      const pending = await pendingNewWords();
      if (!cancelled && pending) setNewWords(pending);
    })().catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const dismissNewWords = useCallback(() => {
    const version = newWords?.version;
    setNewWords(null);
    if (version !== undefined) markNewWordsSeen(version).catch(() => {});
  }, [newWords]);

  // Refresh the "Play again" summary whenever the tab regains focus, so it
  // reflects a game that was just played.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([storage.getLastCategory(), storage.getGameSettings()]).then(([cat, gs]) => {
        if (!active) return;
        const known = CATEGORIES.some(c => c.id === cat);
        setLastGame(known ? { category: cat as CategoryKey, players: gs.playerCount } : null);
      });
      return () => { active = false; };
    }, [])
  );

  const startFresh = () => router.push('/setup');

  const playAgain = () => {
    if (!lastGame) return;
    setGame(g => ({ ...g, category: lastGame.category }));
    router.push('/game-settings');
  };

  const openCategory = (id: CategoryKey) => {
    setGame(g => ({ ...g, category: id }));
    router.push('/setup');
  };

  const lastCategoryLabel = lastGame
    ? CATEGORIES.find(c => c.id === lastGame.category)?.label ?? 'General'
    : '';

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <Animated.ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          style={{ opacity: entryAnim, transform: [{ translateY: entryY }] } as any}
        >
          {/* Masthead */}
          <View style={styles.masthead}>
            <View style={styles.brand}>
              <AppMark size={36} />
              <View style={styles.brandText}>
                <AppText style={styles.label}>PARTY WORD GAME</AppText>
                <AppText style={styles.brandName}>Impostr</AppText>
              </View>
            </View>
            <IconButton onPress={() => setShowHowToPlay(true)} accessibilityLabel="How to play">
              <HelpCircle size={20} color={COLORS.ink} />
            </IconButton>
          </View>

          {/* Hero */}
          <GlassCard style={styles.hero}>
            <View style={styles.pills}>
              <Pill
                tone="honey"
                label="3 to 12 players"
                icon={<Users size={14} color={COLORS.honeyText} />}
              />
              <Pill
                label="Works offline"
                icon={<WifiOff size={14} color={COLORS.textBody} />}
              />
            </View>

            <AppText style={styles.heroTitle} maxFontSizeMultiplier={1.4}>
              Someone here{'\n'}is <AppText style={styles.heroAccent}>lying.</AppText>
            </AppText>

            <AppText style={styles.heroBody}>
              Everyone gets the secret word except one. Give clues, stay sneaky, then vote.
            </AppText>

            <PrimaryButton
              label="Play now"
              onPress={startFresh}
              icon={<Play size={18} color={COLORS.onHoney} fill={COLORS.onHoney} />}
            />
          </GlassCard>

          {/* Play again */}
          {lastGame && (
            <TouchableOpacity
              onPress={playAgain}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Play again: ${lastCategoryLabel}, ${lastGame.players} players`}
            >
              <GlassCard style={styles.againCard}>
                <View style={styles.againIcon}>
                  <RefreshCw size={18} color={COLORS.honey} />
                </View>
                <View style={styles.againText}>
                  <AppText style={styles.againTitle}>Play again</AppText>
                  <AppText style={styles.againSub} numberOfLines={1}>
                    {lastCategoryLabel} · {lastGame.players} players
                  </AppText>
                </View>
                <ChevronRight size={20} color={COLORS.textMuted} />
              </GlassCard>
            </TouchableOpacity>
          )}

          {/* Categories */}
          <View style={styles.sectionHead}>
            <AppText style={styles.label}>CATEGORIES</AppText>
            <AppText style={[styles.label, styles.labelAccent]}>{CATEGORIES.length} PACKS</AppText>
          </View>

          <View style={styles.catGrid}>
            {CATEGORIES.slice(0, 6).map(cat => {
              const Icon = CATEGORY_ICONS[cat.icon];
              return (
                <View key={cat.id} style={styles.catCell}>
                  <TouchableOpacity
                    onPress={() => openCategory(cat.id)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={cat.label}
                  >
                    <GlassCard style={styles.catTile}>
                      <Icon size={17} color={COLORS.honeyText} strokeWidth={1.8} />
                      <AppText style={styles.catName} numberOfLines={1}>{cat.label}</AppText>
                    </GlassCard>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </Animated.ScrollView>
      </SafeAreaView>

      <HowToPlaySheet visible={showHowToPlay} onClose={() => setShowHowToPlay(false)} />

      <NewWordsSheet
        feed={newWords}
        onClose={dismissNewWords}
        onPlay={() => { dismissNewWords(); router.push('/setup'); }}
      />
    </View>
  );
}

function HowToPlaySheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.sheetHead}>
        <AppText style={styles.sheetTitle}>How to play</AppText>
        <IconButton onPress={onClose} glass={false} accessibilityLabel="Close">
          <X size={20} color={COLORS.ink} />
        </IconButton>
      </View>

      {HOW_TO_PLAY.map((step, i) => (
        <View key={step.title} style={styles.step}>
          <View style={styles.stepNumber}>
            <AppText style={styles.stepNumberText}>{i + 1}</AppText>
          </View>
          <View style={styles.stepText}>
            <AppText style={styles.stepTitle}>{step.title}</AppText>
            <AppText style={styles.stepBody}>{step.body}</AppText>
          </View>
        </View>
      ))}

      <InkButton label="Got it" onPress={onClose} style={styles.sheetButton} />
    </BottomSheet>
  );
}

function NewWordsSheet({
  feed, onClose, onPlay,
}: {
  feed: WordsFeed | null;
  onClose: () => void;
  onPlay: () => void;
}) {
  if (!feed) return null;
  const titles = activePackTitles(feed);
  const added = newWordCount(feed);
  const headline = titles.length === 1
    ? `${titles[0]} pack is here`
    : 'New words are here';

  return (
    <BottomSheet visible onClose={onClose}>
      <View style={styles.newWordsHead}>
        <View style={styles.newWordsTile}>
          <Lightbulb size={24} color={COLORS.honey} />
        </View>
        <View style={styles.newWordsHeadText}>
          <Pill
            tone="honey"
            label="New words"
            icon={<CloudDownload size={14} color={COLORS.honeyText} />}
          />
          <AppText style={styles.newWordsTitle} maxFontSizeMultiplier={1.4}>
            {headline}
          </AppText>
        </View>
      </View>

      <AppText style={styles.sheetBody}>
        {added} new word{added === 1 ? '' : 's'} added
        {titles.length > 0 ? ` across ${titles.join(', ')}` : ''}. Free for everyone.
      </AppText>

      <PrimaryButton
        label="Play now"
        onPress={onPlay}
        icon={<Play size={18} color={COLORS.onHoney} />}
      />
      <TextButton label="Later" onPress={onClose} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  newWordsHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  newWordsTile: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ink,
  },
  newWordsHeadText: { flex: 1, minWidth: 0, alignItems: 'flex-start', gap: 6 },
  newWordsTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.5,
    color: COLORS.ink,
  },

  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: SPACING.screenX,
    paddingTop: 10,
    // Clears the floating tab bar (64 tall, 16 from the bottom inset).
    paddingBottom: 110,
    gap: SPACING.gap,
  },

  // Masthead
  masthead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  brandText: { gap: 1, flexShrink: 1 },
  brandName: {
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    letterSpacing: -0.5,
    color: COLORS.ink,
  },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
  },
  labelAccent: { color: COLORS.honeyText },

  // Hero
  hero: {
    padding: 20,
    borderRadius: RADIUS.xl,
    gap: 16,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  heroTitle: {
    fontFamily: FONTS.displayExtraBold,
    fontSize: 40,
    lineHeight: 42,
    letterSpacing: -1.2,
    color: COLORS.ink,
  },
  heroAccent: { color: COLORS.honeyText },
  heroBody: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13.5,
    lineHeight: 19.6,
    color: COLORS.textBody,
  },

  // Play again
  againCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 18,
  },
  againIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ink,
  },
  againText: { flex: 1, minWidth: 0 },
  againTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.ink,
  },
  againSub: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Categories
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catCell: {
    // Three across, accounting for the two 8px gaps.
    width: '31.5%',
  },
  catTile: {
    padding: 10,
    borderRadius: RADIUS.md,
    gap: 6,
    minWidth: 0,
  },
  catName: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
    color: COLORS.ink,
  },

  // How to play sheet
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  sheetTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 26,
    letterSpacing: -0.7,
    color: COLORS.ink,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ink,
  },
  stepNumberText: {
    fontFamily: FONTS.displayBold,
    fontSize: 14,
    color: COLORS.honey,
  },
  stepText: { flex: 1, gap: 3 },
  stepTitle: {
    fontFamily: FONTS.displaySemiBold,
    fontSize: 16,
    letterSpacing: -0.16,
    color: COLORS.ink,
  },
  stepBody: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13.5,
    lineHeight: 19.6,
    color: COLORS.textBody,
  },
  sheetButton: { marginTop: 4 },
  sheetBody: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13.5,
    lineHeight: 19.6,
    color: COLORS.textBody,
  },
});
