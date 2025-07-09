import 'dotenv/config'; 

export default {

    expo: {
        name: "네이보",
        slug: "madcamp01",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/app_icon.png",
        userInterfaceStyle: "light",
        newArchEnabled: true,
        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        web: {
            favicon: "./assets/favicon.png"
        },
        android: {
            package: "com.madcamp01.neighbor",
            config: {
                googleMaps: {
                apiKey: process.env.GOOGLE_MAPS_APIKEY,
                },
            },
        },
        ios: {
            bundleIdentifier: "com.madcamp01.neighbor",
        },
        extra: { 
            eas: {
                projectId: "65029d26-c983-4346-bdcb-9b2d63afc9a0" 
            }
        },

    }

}