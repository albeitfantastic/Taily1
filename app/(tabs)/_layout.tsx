import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors?.accent ?? '#D97757',
        tabBarInactiveTintColor: '#9C948C',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 6,
        },
        tabBarStyle: {
          height: 78,
          paddingTop: 8,
          paddingBottom: 12,
          borderTopWidth: 1,
          backgroundColor: Colors?.surface ?? '#F7F3EF',
          borderTopColor: '#E8DED6',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="planner"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="diary"
        options={{
          title: 'Diary',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="notebook-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="health"
        options={{
          title: 'Health',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}