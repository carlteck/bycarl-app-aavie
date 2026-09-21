import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { openExternalLink } from '@/lib/open-link';
import {
  parseMarkdown,
  type Inline,
  type MarkdownBlock,
} from '@/lib/simple-markdown';

function Inlines({ items }: { items: Inline[] }) {
  const theme = useTheme();
  return (
    <>
      {items.map((item, index) => (
        <ThemedText
          key={index}
          onPress={
            item.href ? () => void openExternalLink(item.href!) : undefined
          }
          accessibilityRole={item.href ? 'link' : undefined}
          style={[
            item.bold && styles.bold,
            item.italic && styles.italic,
            item.href && {
              color: theme.primary,
              textDecorationLine: 'underline',
            },
          ]}
        >
          {item.text}
        </ThemedText>
      ))}
    </>
  );
}

function Block({ block }: { block: MarkdownBlock }) {
  const theme = useTheme();
  switch (block.type) {
    case 'heading':
      return (
        <ThemedText
          type={block.level === 3 ? 'label' : 'sectionTitle'}
          accessibilityRole="header"
          style={block.level === 1 ? styles.h1 : styles.heading}
        >
          <Inlines items={block.inline} />
        </ThemedText>
      );
    case 'paragraph':
      return (
        <ThemedText selectable>
          <Inlines items={block.inline} />
        </ThemedText>
      );
    case 'quote':
      return (
        <View style={[styles.quote, { borderLeftColor: theme.turquoise }]}>
          <ThemedText themeColor="textSecondary">
            <Inlines items={block.inline} />
          </ThemedText>
        </View>
      );
    case 'rule':
      return (
        <View style={[styles.rule, { backgroundColor: theme.cardBorder }]} />
      );
    case 'list':
      return (
        <View style={styles.list}>
          {block.items.map((item, index) => (
            <View key={index} style={styles.item}>
              <ThemedText style={styles.marker} accessibilityElementsHidden>
                {block.ordered ? `${index + 1}.` : '•'}
              </ThemedText>
              <ThemedText selectable style={styles.itemText}>
                <Inlines items={item} />
              </ThemedText>
            </View>
          ))}
        </View>
      );
  }
}

/** Contenu Markdown restitué en texte natif (voir `simple-markdown.ts`). */
export function RichText({ source }: { source: string }) {
  const blocks = useMemo(() => parseMarkdown(source), [source]);
  return (
    <View style={styles.root}>
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.three },
  bold: { fontWeight: '700' },
  italic: { fontStyle: 'italic' },
  h1: { fontSize: 22, lineHeight: 28 },
  heading: { paddingTop: Spacing.one },
  quote: { borderLeftWidth: 3, paddingLeft: Spacing.three },
  rule: { height: StyleSheet.hairlineWidth },
  list: { gap: Spacing.two },
  item: { flexDirection: 'row', gap: Spacing.two },
  marker: { minWidth: 24 },
  itemText: { flex: 1 },
});
