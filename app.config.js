import 'dotenv/config'; 

export default {

    expo: {
        name: "madcamp01",
        slug: "madcamp01",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        newArchEnabled: true,
        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        android: {
            config: {
                googleMaps: {
                apiKey: process.env.GOOGLE_MAPS_APIKEY,
                },
            },
        },
        ios: {
            config: {
                googleMapsApiKey: process.env.GOOGLE_MAPS_APIKEY,
            }
         },
         web: {
            favicon: "./assets/favicon.png"
        }
        

    }

}