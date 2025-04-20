import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Map, User, ShoppingBag, List } from 'react-native-feather';

// Screens
import LoginScreen from './screens/LoginScreen';
import MapScreen from './screens/MapScreen';
import VisitsScreen from './screens/VisitsScreen';
import ProductsScreen from './screens/ProductsScreen';
import OrdersScreen from './screens/OrdersScreen';
import ProfileScreen from './screens/ProfileScreen';
import VisitDetailScreen from './screens/VisitDetailScreen';
import NewOrderScreen from './screens/NewOrderScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Services
import { startLocationTracking, stopLocationTracking } from './services/LocationService';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tab Navigator pour les écrans principaux
const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Map') {
            return <Map stroke={color} width={size} height={size} />;
          } else if (route.name === 'Visites') {
            return <List stroke={color} width={size} height={size} />;
          } else if (route.name === 'Produits') {
            return <ShoppingBag stroke={color} width={size} height={size} />;
          } else if (route.name === 'Commandes') {
            return <User stroke={color} width={size} height={size} />;
          }
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Carte' }} />
      <Tab.Screen name="Visites" component={VisitsScreen} />
      <Tab.Screen name="Produits" component={ProductsScreen} />
      <Tab.Screen name="Commandes" component={OrdersScreen} />
    </Tab.Navigator>
  );
};

// Stack Navigator pour les écrans de détails
const AppStack = () => {
  const { user, isLoading } = useAuth();

  // Démarrer le service de localisation si l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      startLocationTracking(user.id);
    } else {
      stopLocationTracking();
    }

    // Nettoyer le service lors de la déconnexion
    return () => {
      if (!user) {
        stopLocationTracking();
      }
    };
  }, [user]);

  if (isLoading) {
    return null; // Ou un écran de chargement
  }

  return (
    <Stack.Navigator>
      {!user ? (
        // Écrans non authentifiés
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
      ) : (
        // Écrans authentifiés
        <>
          <Stack.Screen 
            name="Main" 
            component={AppTabs} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="VisitDetail" 
            component={VisitDetailScreen} 
            options={{ title: 'Détail de la visite' }} 
          />
          <Stack.Screen 
            name="NewOrder" 
            component={NewOrderScreen} 
            options={{ title: 'Nouvelle commande' }} 
          />
          <Stack.Screen 
            name="ProductDetail" 
            component={ProductDetailScreen} 
            options={{ title: 'Détail du produit' }} 
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ title: 'Mon profil' }} 
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppStack />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}
