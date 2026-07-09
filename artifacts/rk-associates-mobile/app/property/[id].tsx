import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { api, type Property } from "@/lib/api";
import { formatNumber, formatPrice, statusColors, statusLabels } from "@/lib/format";

const { width: SCREEN_W } = Dimensions.get("window");

function ImageCarousel({ images }: { images: string[] }) {
  const colors = useColors();
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <View style={[styles.imagePlaceholder, { backgroundColor: colors.muted }]}>
        <Feather name="home" size={48} color={colors.mutedForeground} />
        <Text style={[styles.imagePlaceholderText, { color: colors.mutedForeground }]}>
          No photo
        </Text>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
          setActive(idx);
        }}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={[styles.carouselImage, { width: SCREEN_W }]}
            resizeMode="cover"
          />
        )}
      />
      {images.length > 1 && (
        <View style={styles.dots}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === active ? "#ffffff" : "rgba(255,255,255,0.4)",
                  width: i === active ? 20 : 6,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statBox, { backgroundColor: colors.muted }]}>
      <Text style={[styles.statValue, { color: colors.navy }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function WhatsAppForm({
  propertyId,
  propertyTitle,
}: {
  propertyId: string;
  propertyTitle: string;
}) {
  const colors = useColors();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    `Hi, I'm interested in "${propertyTitle}". Please share more details.`,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!name.trim() || !phone.trim()) {
      setError("Please fill in your name and phone number.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await api.post<{ redirectUrl: string }>("/leads", {
        propertyId,
        name: name.trim(),
        phone: phone.trim(),
        message: message.trim(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await Linking.openURL(res.redirectUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={[styles.inquiryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.inquiryTitle, { color: colors.navy }]}>Send an Inquiry</Text>
      <Text style={[styles.inquirySub, { color: colors.mutedForeground }]}>
        We'll open WhatsApp with your message pre-filled.
      </Text>

      <View style={styles.formFields}>
        <View>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Your name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={[
              styles.input,
              {
                borderColor: colors.border,
                backgroundColor: colors.muted,
                color: colors.foreground,
              },
            ]}
            placeholder="Full name"
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="next"
          />
        </View>
        <View>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Your phone</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            style={[
              styles.input,
              {
                borderColor: colors.border,
                backgroundColor: colors.muted,
                color: colors.foreground,
              },
            ]}
            placeholder="+91 99999 99999"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="phone-pad"
            returnKeyType="next"
          />
        </View>
        <View>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Message</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            style={[
              styles.input,
              styles.textArea,
              {
                borderColor: colors.border,
                backgroundColor: colors.muted,
                color: colors.foreground,
              },
            ]}
            multiline
            numberOfLines={3}
            placeholderTextColor={colors.mutedForeground}
          />
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable
        style={({ pressed }) => [
          styles.waBtn,
          { backgroundColor: colors.whatsapp, opacity: pressed || submitting ? 0.8 : 1 },
        ]}
        onPress={submit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Feather name="message-circle" size={18} color="#ffffff" />
        )}
        <Text style={styles.waBtnText}>
          {submitting ? "Opening WhatsApp…" : "Continue to WhatsApp"}
        </Text>
      </Pressable>
    </View>
  );
}

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["property", id],
    queryFn: () =>
      api.get<{ property: Property; related: Property[] }>(`/properties/${id}`),
    enabled: !!id,
  });

  const property = data?.property;
  const status = property
    ? (statusColors[property.status] ?? { bg: "#e5e7eb", text: "#374151" })
    : null;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  if (isError || !property) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
        <Text style={[styles.errorTitle, { color: colors.foreground }]}>Property not found</Text>
        <Text style={[styles.errorSub, { color: colors.mutedForeground }]}>
          It may have been removed or is no longer available.
        </Text>
        <Pressable
          style={[styles.backBtn, { backgroundColor: colors.navy }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backBtnText, { color: colors.beige }]}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: isWeb ? 34 : insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.imageWrapper}>
        <ImageCarousel images={property.images} />

        {/* Gradient overlay for back button legibility */}
        <LinearGradient
          colors={["rgba(0,0,0,0.5)", "transparent"]}
          style={[styles.imageGradient, { height: isWeb ? 67 + 80 : insets.top + 80 }]}
        />
        <Pressable
          style={[styles.backOverlay, { top: isWeb ? 67 + 12 : insets.top + 12 }]}
          onPress={() => router.back()}
        >
          <View style={styles.backCircle}>
            <Feather name="arrow-left" size={20} color="#ffffff" />
          </View>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={[styles.statusBadge, { backgroundColor: status!.bg }]}>
            <Text style={[styles.statusText, { color: status!.text }]}>
              {statusLabels[property.status]}
            </Text>
          </View>
          <Text style={[styles.views, { color: colors.mutedForeground }]}>
            {formatNumber(property.views)} views
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.navy }]}>{property.title}</Text>
        {property.buildingName ? (
          <Text style={[styles.building, { color: colors.mutedForeground }]}>
            {property.buildingName}
          </Text>
        ) : null}
        {property.address ? (
          <View style={styles.addressRow}>
            <Feather name="map-pin" size={13} color={colors.mutedForeground} />
            <Text style={[styles.address, { color: colors.mutedForeground }]}>
              {property.address}
            </Text>
          </View>
        ) : null}

        <Text style={[styles.price, { color: colors.goldDark }]}>
          ₹{formatPrice(property.price)}
        </Text>

        <View style={styles.statsRow}>
          <StatBox label="Rooms" value={String(property.rooms)} />
          <StatBox label="Baths" value={String(property.baths)} />
          <StatBox label="sqft" value={formatNumber(property.areaSqft)} />
        </View>

        <View style={[styles.section, { borderTopColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.navy }]}>Description</Text>
          <Text style={[styles.description, { color: colors.slate }]}>
            {property.description}
          </Text>
        </View>

        <View style={[styles.section, { borderTopColor: colors.border }]}>
          <WhatsAppForm propertyId={property._id} propertyTitle={property.title} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 32 },
  imageWrapper: { position: "relative" },
  carouselImage: { height: 300 },
  imagePlaceholder: { height: 300, alignItems: "center", justifyContent: "center", gap: 8 },
  imagePlaceholderText: { fontSize: 14 },
  imageGradient: { position: "absolute", top: 0, left: 0, right: 0 },
  dots: {
    position: "absolute",
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: { height: 6, borderRadius: 3 },
  backOverlay: { position: "absolute", left: 16 },
  backCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: 20 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 4,
  },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  views: { fontSize: 12 },
  title: { fontSize: 24, fontWeight: "800", lineHeight: 30, marginBottom: 4 },
  building: { fontSize: 14, marginBottom: 4 },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 16 },
  address: { fontSize: 13, flex: 1 },
  price: { fontSize: 28, fontWeight: "800", marginBottom: 20 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statBox: { flex: 1, borderRadius: 12, padding: 14, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "700" },
  statLabel: { fontSize: 11, marginTop: 2 },
  section: { borderTopWidth: 1, paddingTop: 20, marginBottom: 8 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 10 },
  description: { fontSize: 15, lineHeight: 24 },
  inquiryCard: { borderRadius: 16, borderWidth: 1, padding: 20 },
  inquiryTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  inquirySub: { fontSize: 13, marginBottom: 16 },
  formFields: { gap: 14 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 6, letterSpacing: 0.3 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  errorText: { color: "#ef4444", fontSize: 13, marginTop: 10 },
  waBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 16,
  },
  waBtnText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  errorTitle: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  errorSub: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  backBtn: { borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  backBtnText: { fontSize: 15, fontWeight: "600" },
});
