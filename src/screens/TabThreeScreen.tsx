import React, {useState, useEffect} from 'react';
import { Text, View, ScrollView, SafeAreaView, StyleSheet, FlatList, Image, Dimensions, ActivityIndicator, TouchableOpacity, Alert } from 'react-native'; // Import Alert for simple feedback
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps'; // Import Region type
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');
const ITEM_MARGIN = 8;
const ITEM_SIZE = (width - 16 * 2 - ITEM_MARGIN * 2) / 3;

const DATA = [
  {
    id: '1',
    image: require('../../assets/adaptive-icon.png'),
    title: '맛집 A',
    description: '맛집 A입니다'
  },
  {
    id: '2',
    image: require('../../assets/favicon.png'),
    title: '카페 B',
    description: '카페 B입니다'
  },
  {
    id: '3',
    image: require('../../assets/icon.png'),
    title: '풍경 C',
    description: '풍경 C입니다'
  },
  {
    id: '4',
    image: require('../../assets/splash-icon.png'),
    title: '전시 D',
    description: '전시 D입니다'
  },
  {
    id: '5',
    image: require('../../assets/splash-icon.png'),
    title: '전시 D',
    description: '전시 D입니다'
  },
  {
    id: '6',
    image: require('../../assets/splash-icon.png'),
    title: '전시 D',
    description: '전시 D입니다'
  },
  {
    id: '7',
    image: require('../../assets/splash-icon.png'),
    title: '전시 D',
    description: '전시 D입니다'
  },
  {
    id: '8',
    image: require('../../assets/splash-icon.png'),
    title: '전시 D',
    description: '전시 D입니다'
  },
];

export function TabThreeScreen() {
  // `currentRegion` will store the region currently visible on the map
  const [currentRegion, setCurrentRegion] = useState<null | Region>(null);
  const [initialMapRegion, setInitialMapRegion] = useState<null | Region>(null);


  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is needed to show your current position on the map.');
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      const regionData = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setInitialMapRegion(regionData); // Set initial region for MapView
      setCurrentRegion(regionData); // Also set currentRegion to initial location
    })();
  }, []);

  const handleLoadPosts = () => {
    if (currentRegion) {
      console.log("Loading posts for the current region:", currentRegion);
      // Here you would send `currentRegion` to your server.
      // For example, you might make an API call:
      /*
      fetch('YOUR_API_ENDPOINT/posts-by-region', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: currentRegion.latitude,
          longitude: currentRegion.longitude,
          latitudeDelta: currentRegion.latitudeDelta,
          longitudeDelta: currentRegion.longitudeDelta,
        }),
      })
      .then(response => response.json())
      .then(data => {
        console.log('Posts loaded:', data);
        // Update your UI with the loaded posts (e.g., display markers)
      })
      .catch(error => {
        console.error('Error loading posts:', error);
      });
      */
      Alert.alert(
        'Region Coordinates',
        `Latitude: ${currentRegion.latitude}\nLongitude: ${currentRegion.longitude}\nLatitude Delta: ${currentRegion.latitudeDelta}\nLongitude Delta: ${currentRegion.longitudeDelta}`
      );
    } else {
      console.log("Map region not available yet.");
      Alert.alert('Error', 'Map region not available yet. Please wait for the map to load.');
    }
  };

  if (!initialMapRegion) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialMapRegion} // Use initialMapRegion here
        onRegionChangeComplete={(region) => setCurrentRegion(region)} // Update currentRegion on map interaction
        showsUserLocation
        showsMyLocationButton
      >
        {/* You can add markers here based on posts fetched from the server */}
      </MapView>

      <TouchableOpacity
        style={styles.loadPostsButton}
        onPress={handleLoadPosts}
      >
        <Text style={styles.loadPostsButtonText}>
          <Ionicons name="location-outline" size={16} color="#007AFF" /> 이 지역의 글 불러오기
        </Text>
      </TouchableOpacity>
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
});