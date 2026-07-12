import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PropertyCard } from "@/components/PropertyCard";
import { PropertySkeleton } from "@/components/PropertySkeleton";
import { useColors } from "@/hooks/useColors";
import { api, type Property } from "@/lib/api";

type StatusFilter = "" | "available" | "reserved" | "sold";
type SortFilter = "views" | "price-asc" | "price-desc" | "createdAt";

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "" },
  { label: "Available", value: "available" },
  { label: "Reserved", value: "reserved" },
  { label: "Sold", value: "sold" },
];

const SORT_OPTIONS: { label: string; value: SortFilter }[] = [
  { label: "Most Viewed", value: "views" },
  { label: "Price ↑", value: "price-asc" },
  { label: "Price ↓", value: "price-desc" },
  { label: "Newest", value: "createdAt" },
];

export default function BrowseScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const params = useLocalSearchParams<{ near?: string }>();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [sort, setSort] = useState<SortFilter>("views");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nearMode, setNearMode] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const near = params.near === "1";

  const fetchProperties = useCallback(
    async (opts?: { isRefresh?: boolean }) => {
      if (opts?.isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        if (nearMode && coords) {
          const res = await api.get<{ properties: Property[] }>(
            `/properties/near?lat=${coords.lat}&lng=${coords.lng}`,
          );
          setProperties(res.properties);
        } else {
          const p = new URLSearchParams();
          if (query) p.set("q", query);
          if (status) p.set("status", status);
          if (sort) p.set("sort", sort);
          const res = await api.get<{ properties: Property[] }>(
            `/properties?${p.toString()}`,
          );
          setProperties(res.properties);
        }
      } catch {
        setProperties([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [query, status, sort, nearMode, coords],
  );

  useEffect(() => {
    if (!near) return;
    setGeoLoading(true);
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setNearMode(true);
          setGeoLoading(false);
        },
        () => setGeoLoading(false),
        { enableHighAccuracy: true, timeout: 8000 },
      );
    } else {
      setGeoLoading(false);
    }
  }, [near]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProperties();
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchProperties]);

  const topPad = isWeb ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.navy, paddingTop: topPad + 16, paddingBottom: 16 },
        ]}
      >
        <Text style={[styles.heading, { color: colors.beige }]}>
          {nearMode && coords ? "Near You" : "Browse Properties"}
        </Text>

        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: "rgba(255,255,255,0.1)",
              borderColor: "rgba(255,255,255,0.15)",
            },
          ]}
        >
          <Feather name="search" size={16} color="rgba(245,240,235,0.5)" />
          <TextInput
            style={[styles.searchInput, { color: colors.beige }]}
            placeholder="Search by title, area..."
            placeholderTextColor="rgba(245,240,235,0.4)"
            value={query}
            onChangeText={(t) => {
              setQuery(t);
              setNearMode(false);
            }}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Feather name="x" size={16} color="rgba(245,240,235,0.5)" />
            </Pressable>
          )}
        </View>

        <View style={styles.chipRow}>
          {STATUS_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={[
                styles.chip,
                status === opt.value
                  ? { backgroundColor: colors.gold }
                  : { borderColor: "rgba(255,255,255,0.2)", borderWidth: 1 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setStatus(opt.value);
                setNearMode(false);
              }}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color:
                      status === opt.value ? colors.navy : "rgba(245,240,235,0.75)",
                    fontWeight: status === opt.value ? "700" : "500",
                  },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.chipRow}>
          {SORT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={[
                styles.chip,
                sort === opt.value
                  ? {
                      backgroundColor: "rgba(201,167,75,0.2)",
                      borderColor: colors.gold,
                      borderWidth: 1,
                    }
                  : { borderColor: "rgba(255,255,255,0.12)", borderWidth: 1 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSort(opt.value);
              }}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: sort === opt.value ? colors.gold : "rgba(245,240,235,0.6)" },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {nearMode && coords && (
          <View style={styles.nearBanner}>
            <Feather name="navigation" size={14} color={colors.gold} />
            <Text style={[styles.nearBannerText, { color: colors.beige }]}>
              Showing properties near your location
            </Text>
            <Pressable
              onPress={() => {
                setNearMode(false);
                setCoords(null);
              }}
            >
              <Text style={[styles.nearBannerClear, { color: colors.gold }]}>Clear</Text>
            </Pressable>
          </View>
        )}
      </View>

      {geoLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={[styles.geoText, { color: colors.mutedForeground }]}>
            Getting your location…
          </Text>
        </View>
      ) : loading ? (
        <FlatList
          data={[1, 2, 3, 4]}
          keyExtractor={(i) => String(i)}
          renderItem={() => (
            <View style={styles.listPad}>
              <PropertySkeleton />
            </View>
          )}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: isWeb ? 34 : insets.bottom + 80 }}
        />
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.listPad}>
              <PropertyCard property={item} />
            </View>
          )}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: isWeb ? 34 : insets.bottom + 80,
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="home" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                No properties found
              </Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Try adjusting your search or filters
              </Text>
            </View>
          }
          onRefresh={() => fetchProperties({ isRefresh: true })}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, gap: 12 },
  heading: { fontSize: 24, fontWeight: "800", marginBottom: 4 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: { flex: 1, fontSize: 15 },
  chipRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  chipText: { fontSize: 13 },
  nearBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(201,167,75,0.12)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  nearBannerText: { flex: 1, fontSize: 13 },
  nearBannerClear: { fontSize: 13, fontWeight: "700" },
  listPad: { paddingHorizontal: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  geoText: { fontSize: 14 },
  empty: {
    alignItems: "center",
    paddingTop: 64,
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginTop: 8 },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 22 },
});
