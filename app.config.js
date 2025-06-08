export default {
    expo: {
        name: "VibeTrip",
        slug: "vibetrip",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        splash: {
            image: "./assets/splash.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        ios: {
            bundleIdentifier: "com.jcodd.vibetrip",
            infoPlist: {
                "ITSAppUsesNonExemptEncryption": false
            }
        },
        extra: {
            supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
            supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
            eas: {
                projectId: "439402d5-3cab-402d-afb2-3aef364d108e"
            },

            scheme: "vibetrip",
            plugins: [
                "expo-router"
            ]
        }
    }
}
