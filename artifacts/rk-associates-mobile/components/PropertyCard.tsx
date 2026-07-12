import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { Property } from "@/lib/api";
import { formatNumber, formatPrice, statusColors, statusLabels } from "@/lib/format";

interface Props {
  property: Property;
}

export function PropertyCard({ property }: Props) {
  const colors = useColors();
  const cover = property.images[0];
  const status = statusColors[property.status] ?? { bg: "#e5e7eb", text: "#374151" };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
      onPress={() => router.push(`/property/${property._id}`)}
      testID="property-card"
    >
      <View style={styles.imageContainer}>
        {cover ? (
          <Image
            source={{ uri: cover }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder, { backgroundColor: colors.muted }]}>
            <Feather name="home" size={32} color={colors.mutedForeground} />
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.text }]}>
            {statusLabels[property.status] ?? property.status}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.price, { color: colors.goldDark }]} numberOfLines={1}>
          ₹{formatPrice(property.price)}
        </Text>
        <Text style={[styles.title, { color: colors.navy }]} numberOfLines={2}>
          {property.title}
        </Text>
        {property.address ? (
          <Text style={[styles.address, { color: colors.mutedForeground }]} numberOfLines={1}>
            {property.address}
          </Text>
        ) : null}

        <View style={[styles.stats, { borderTopColor: colors.border }]}>
          <View style={styles.stat}>
            <Feather name="grid" size={12} color={colors.mutedForeground} />
            <Text style={[styles.statText, { color: colors.slate }]}>{property.rooms} Rooms</Text>
          </View>
          <View style={styles.stat}>
            <Feather name="droplet" size={12} color={colors.mutedForeground} />
            <Text style={[styles.statText, { color: colors.slate }]}>{property.baths} Baths</Text>
          </View>
          <View style={styles.stat}>
            <Feather name="maximize-2" size={12} color={colors.mutedForeground} />
            <Text style={[styles.statText, { color: colors.slate }]}>
              {formatNumber(property.areaSqft)} sqft
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#1a2a3a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 200,
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  content: {
    padding: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    marginBottom: 12,
  },
  stats: {
    flexDirection: "row",
    gap: 16,
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 4,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
});
