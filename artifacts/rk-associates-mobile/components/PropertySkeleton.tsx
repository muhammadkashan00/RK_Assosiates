import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";

function SkeletonBox({ style }: { style?: object }) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ backgroundColor: colors.muted, borderRadius: 6, opacity }, style]}
    />
  );
}

export function PropertySkeleton() {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <SkeletonBox style={styles.image} />
      <View style={styles.content}>
        <SkeletonBox style={styles.price} />
        <SkeletonBox style={styles.title} />
        <SkeletonBox style={styles.address} />
        <View style={styles.statsRow}>
          <SkeletonBox style={styles.stat} />
          <SkeletonBox style={styles.stat} />
          <SkeletonBox style={styles.stat} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 0,
  },
  content: {
    padding: 16,
    gap: 10,
  },
  price: {
    height: 22,
    width: "40%",
  },
  title: {
    height: 16,
    width: "80%",
  },
  address: {
    height: 14,
    width: "60%",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  stat: {
    height: 12,
    width: 70,
  },
});
