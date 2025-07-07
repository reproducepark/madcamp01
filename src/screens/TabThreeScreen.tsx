import React, { useState, useEffect } from 'react';
 import { Text, View, ScrollView, SafeAreaView, StyleSheet, FlatList, Image, Dimensions, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
 import { NavigationContainer } from '@react-navigation/native';
 import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
 import { Ionicons } from '@expo/vector-icons';
 import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
 import * as Location from 'expo-location';
 import { getPostsInViewport, PostResponse, Viewport } from '../../api/post'; // Adjust the import path as needed

 const { width } = Dimensions.get('window');
 const ITEM_MARGIN = 8;
 const ITEM_SIZE = (width - 16 * 2 - ITEM_MARGIN * 2) / 3;

 // Define a custom map style (e.g., 'Aubergine' from Snazzy Maps)
 // You can find many more at https://snazzymaps.com/
 const mapStyle = [
  {
    "featureType": "landscape.man_made",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f7f7f7"
      }
    ]
  },
  {
    "featureType": "poi.business",
    "elementType": "labels",
    "stylers": [
      {
        "weight": 0.5
      }
    ]
  },
  {
    "featureType": "poi.business",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "simplified"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#deeecf"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#d1cdc5"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#fdf0b5"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#ebcc79"
      },
      {
        "weight": 1
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffeb3b"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#d1cdc5"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#a5d1f3"
      }
    ]
  }
];

 export function TabThreeScreen() {
   const [currentRegion, setCurrentRegion] = useState<null | Region>(null);
   const [initialMapRegion, setInitialMapRegion] = useState<null | Region>(null);
   const [posts, setPosts] = useState<PostResponse[]>([]);
   const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
     (async () => {
       const { status } = await Location.requestForegroundPermissionsAsync();
       if (status !== 'granted') {
         Alert.alert('Permission Denied', 'Location access is needed to show your current position on the map.');
         return;
       }

       try {
         const { coords } = await Location.getCurrentPositionAsync({});
         const regionData = {
           latitude: coords.latitude,
           longitude: coords.longitude,
           latitudeDelta: 0.01,
           longitudeDelta: 0.01,
         };
         setInitialMapRegion(regionData);
         setCurrentRegion(regionData);
       } catch (err) {
         console.error("Error getting current position:", err);
         Alert.alert('Location Error', 'Could not fetch your current location.');
         // Set a default region if location cannot be fetched
         setInitialMapRegion({
           latitude: 36.3504, // Default to Daejeon latitude
           longitude: 127.3845, // Default to Daejeon longitude
           latitudeDelta: 0.0922,
           longitudeDelta: 0.0421,
         });
         setCurrentRegion({
           latitude: 36.3504,
           longitude: 127.3845,
           latitudeDelta: 0.0922,
           longitudeDelta: 0.0421,
         });
       }
     })();
   }, []);

   const handleLoadPosts = async () => {
     if (!currentRegion) {
       console.log("Map region not available yet.");
       Alert.alert('Error', 'Map region not available yet. Please wait for the map to load.');
       return;
     }

     setLoadingPosts(true);
     setError(null);
     setPosts([]); // Clear previous posts

     try {
       const viewport: Viewport = {
         centerLat: currentRegion.latitude,
         centerLon: currentRegion.longitude,
         deltaLat: currentRegion.latitudeDelta,
         deltaLon: currentRegion.longitudeDelta,
         deltaRatioLat: 0.4, // Optional: Adjust if you want to scale the delta
         deltaRatioLon: 0.4, // Optional: Adjust if you want to scale the delta
       };
       console.log("Fetching posts with viewport:", viewport);
       const fetchedPosts = await getPostsInViewport(viewport);
       setPosts(fetchedPosts);
       console.log("Fetched posts:", fetchedPosts);
     } catch (err) {
       console.error("Error fetching posts:", err);
       setError('Failed to load posts. Please try again.');
     } finally {
       setLoadingPosts(false);
     }
   };

   if (!initialMapRegion) {
     return (
       <View style={styles.loading}>
         <ActivityIndicator size="large" color="#007AFF" />
         <Text style={{ marginTop: 10 }}>Loading map...</Text>
       </View>
     );
   }

   return (
     <View style={styles.mapContainer}>
       <MapView
         style={styles.map}
         provider={PROVIDER_GOOGLE}
         initialRegion={initialMapRegion}
         onRegionChangeComplete={(region) => {
           setCurrentRegion(region); // Update currentRegion on map interaction
         }}
         showsUserLocation
         showsMyLocationButton
         customMapStyle={mapStyle} // Apply the custom map style here
       >
         {posts.map((post) => (
           <Marker
             key={post.id}
             coordinate={{ latitude: post.lat, longitude: post.lon }}
             title={post.title}
             description={post.content}
           >
             <View style={styles.customMarker}>
               {/* This inner View creates the orange dot */}
               <View style={styles.innerMarker} />
             </View>
           </Marker>
         ))}
       </MapView>

       <TouchableOpacity
         style={styles.loadPostsButton}
         onPress={handleLoadPosts}
         disabled={loadingPosts}
       >
         {loadingPosts ? (
           <ActivityIndicator size="small" color="#007AFF" />
         ) : (
           <Text style={styles.loadPostsButtonText}>
             <Ionicons name="location-outline" size={16} color="#007AFF" /> 이 지역의 글 불러오기
           </Text>
         )}
       </TouchableOpacity>

       {error && (
         <View style={styles.errorContainer}>
           <Text style={styles.errorText}>{error}</Text>
         </View>
       )}
        {posts.length > 0 && !loadingPosts && (
         <View style={styles.postsCountContainer}>
           <Text style={styles.postsCountText}>
             <Ionicons name="documents-outline" size={14} color="#555" /> {posts.length}개의 글이 로드되었습니다.
           </Text>
         </View>
       )}
     </View>
   );
 }

 const styles = StyleSheet.create({
   safe: {
     flex: 1,
     backgroundColor: '#fff',
   },
   container: {
     flex: 1,
     backgroundColor: '#fff',
     justifyContent: 'center',
     padding: 20,
   },
   text: {
     fontSize: 24,
     fontWeight: 'bold',
     marginBottom: 10,
     textAlign: 'center',
   },
   subText: {
     fontSize: 16,
     color: 'gray',
     textAlign: 'center',
   },
   listContainer: {
     paddingHorizontal: 16,
     paddingVertical: 8,
   },
   listItem: {
     flexDirection:'row',
     justifyContent:'space-between',
     padding: 12,
     borderRadius: 8,
     backgroundColor: '#fafafa',
     marginBottom: 12,
     shadowColor: '#000',
     shadowOpacity: 0.1,
     shadowRadius: 4,
     elevation: 2,
   },
   itemTitle: {
     fontSize: 16,
     fontWeight: '500',
   },
   itemSubtitle: {
     fontSize: 12,
     color: '#999',
     marginTop: 4,
   },
   list: {},
   row: {
     justifyContent: 'flex-start',
     marginBottom: ITEM_MARGIN,
   },
   image: {
     width: ITEM_SIZE,
     height: ITEM_SIZE,
     borderRadius: 8,
     marginRight : ITEM_MARGIN,
     backgroundColor: '#eee',
   },
   itemImage: {
     width: 50,
     height: 50,
     borderRadius: 4,
     backgroundColor: '#ddd',
   },
   textContainer:{
     flexDirection:'column'
   },
   imageContainer: {},
   loading: {
     flex: 1,
     alignItems: 'center',
     justifyContent: 'center',
   },
   mapContainer: {
     flex: 1,
   },
   map: {
     flex: 1,
   },
   loadPostsButton: {
     position: 'absolute',
     top: 20,
     alignSelf: 'center',
     backgroundColor: '#fff',
     paddingVertical: 10,
     paddingHorizontal: 15,
     borderRadius: 20,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.25,
     shadowRadius: 3.84,
     elevation: 5,
     flexDirection: 'row',
     alignItems: 'center',
   },
   loadPostsButtonText: {
     fontSize: 16,
     fontWeight: 'bold',
     color: '#007AFF',
     marginLeft: 5,
   },
   errorContainer: {
     position: 'absolute',
     bottom: 20,
     alignSelf: 'center',
     backgroundColor: 'rgba(255, 0, 0, 0.8)',
     paddingVertical: 8,
     paddingHorizontal: 15,
     borderRadius: 10,
   },
   errorText: {
     color: '#fff',
     fontSize: 14,
     fontWeight: 'bold',
   },
   postsCountContainer: {
     position: 'absolute',
     bottom: 20,
     alignSelf: 'center',
     backgroundColor: 'rgba(255, 255, 255, 0.9)',
     paddingVertical: 8,
     paddingHorizontal: 15,
     borderRadius: 10,
     flexDirection: 'row',
     alignItems: 'center',
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.15,
     shadowRadius: 3,
     elevation: 3,
   },
   postsCountText: {
     color: '#555',
     fontSize: 14,
     marginLeft: 5,
   },
   customMarker: {
     height: 18, // Slightly larger for the border
     width: 18,  // Slightly larger for the border
     borderRadius: 9, // Half of height/width for a perfect circle
     backgroundColor: 'orange', // This will be the outer white circle/border
     borderWidth: 2, // Width of the white border
     borderColor: 'black', // Color of the border
     alignItems: 'center',
     justifyContent: 'center',
   },
   innerMarker: {
     height: 12, // Inner orange circle size
     width: 12,  // Inner orange circle size
     borderRadius: 6, // Half of inner height/width for a perfect circle
     backgroundColor: 'orange', // Orange fill color
   },
 });