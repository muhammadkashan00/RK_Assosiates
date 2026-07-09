import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PropertyCard } from "@/components/PropertyCard";
import { PropertySkeleton } from "@/components/PropertySkeleton";
import { useColors } from "@/hooks/useColors";
import { api, type Property } from "@/lib/api";

const features = [
  {
    icon: "map" as const,
    title: "Mapped Coverage",
    body: "Every listing shows its exact coverage area and location.",
  },
  {
    icon: "navigation" as const,
    title: "Near You",
    body: "Find properties around your current location instantly.",
  },
  {
    icon: "message-circle" as const,
    title: "WhatsApp Direct",
    body: "Reach our team in one tap — no forms, no waiting.",
  },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["featured"],
    queryFn: () =>
      api.get<{ properties: Property[] }>("/properties?sort=views&limit=6"),
  });

  const featured = data?.properties ?? [];

  const renderHeader = useCallback(
    () => (
      <>
        <LinearGradient
          colors={["#1a2a3a", "#243850", "#1a2a3a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.hero,
            { paddingTop: isWeb ? 67 + 24 : insets.top + 24, paddingBottom: 40 },
          ]}
        >
          <View style={styles.heroBadgeRow}>
            <View
              style={[
                styles.heroBadge,
                {
                  borderColor: "rgba(201,167,75,0.4)",
                  backgroundColor: "rgba(201,167,75,0.12)",
                },
              ]}
            >
              <Text style={[styles.heroBadgeText, { color: colors.gold }]}>
                RK Associates — Trusted Real Estate
              </Text>
            </View>
          </View>
          <Text style={[styles.heroTitle, { color: colors.beige }]}>
            Find a home in the neighborhood you'll love
          </Text>
          <Text style={[styles.heroSubtitle, { color: "rgba(245,240,235,0.72)" }]}>
            Explore verified listings with real coverage areas. See exactly where each property
            sits before you reach out.
          </Text>
          <View style={styles.heroButtons}>
            <Pressable
              style={({ pressed }) => [
                styles.heroPrimaryBtn,
                { backgroundColor: colors.gold, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={() => router.push("/browse")}
            >
              <Feather name="search" size={16} color={colors.navy} />
              <Text style={[styles.heroPrimaryBtnText, { color: colors.navy }]}>
                Browse Properties
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.heroSecondaryBtn,
                {
                  borderColor: "rgba(255,255,255,0.3)",
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => router.push("/browse?near=1")}
            >
              <Feather name="navigation" size={16} color={colors.beige} />
              <Text style={[styles.heroSecondaryBtnText, { color: colors.beige }]}>Near Me</Text>
            </Pressable>
          </View>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.navy }]}>Featured Listings</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
              Our most-viewed properties this week
            </Text>
          </View>
          <Pressable onPress={() => router.push("/browse")}>
            <Text style={[styles.viewAll, { color: colors.goldDark }]}>View all →</Text>
          </Pressable>
        </View>
      </>
    ),
    [colors, insets.top, isWeb],
  );

  const renderFooter = useCallback(
    () => (
      <LinearGradient colors={["#1a2a3a", "#243850"]} style={styles.featuresSection}>
        {features.map((f) => (
          <View
            key={f.title}
            style={[styles.featureCard, { borderColor: "rgba(255,255,255,0.1)" }]}
          >
            <View style={[styles.featureIcon, { backgroundColor: "rgba(201,167,75,0.15)" }]}>
              <Feather name={f.icon} size={20} color={colors.gold} />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: colors.gold }]}>{f.title}</Text>
              <Text style={[styles.featureBody, { color: "rgba(245,240,235,0.7)" }]}>
                {f.body}
              </Text>
            </View>
          </View>
        ))}
        <View style={{ height: isWeb ? 34 : insets.bottom + 100 }} />
      </LinearGradient>
    ),
    [colors, insets.bottom, isWeb],
  );

  if (isLoading) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        {renderHeader()}
        <View style={styles.listPad}>
          <PropertySkeleton />
          <PropertySkeleton />
          <PropertySkeleton />
        </View>
      </ScrollView>
    );
  }

  return (
    <FlatList
      data={featured}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={styles.listPad}>
          <PropertyCard property={item} />
        </View>
      )}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Feather name="home" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No featured listings right now
          </Text>
        </View>
      }
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.gold} />
      }
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 24 },
  heroBadgeRow: { flexDirection: "row", marginBottom: 16 },
  heroBadge: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 6 },
  heroBadgeText: { fontSize: 12, fontWeight: "600", letterSpacing: 0.3 },
  heroTitle: { fontSize: 30, fontWeight: "800", lineHeight: 38, marginBottom: 12 },
  heroSubtitle: { fontSize: 15, lineHeight: 24, marginBottom: 28 },
  heroButtons: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  heroPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  heroPrimaryBtnText: { fontSize: 15, fontWeight: "700" },
  heroSecondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  heroSecondaryBtnText: { fontSize: 15, fontWeight: "600" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 8,
  },
  sectionTitle: { fontSize: 22, fontWeight: "700" },
  sectionSub: { fontSize: 13, marginTop: 2 },
  viewAll: { fontSize: 13, fontWeight: "600" },
  listPad: { paddingHorizontal: 20 },
  featuresSection: { marginTop: 8, padding: 24, gap: 16 },
  featureCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  featureContent: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  featureBody: { fontSize: 13, lineHeight: 20 },
  empty: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 15 },
});
