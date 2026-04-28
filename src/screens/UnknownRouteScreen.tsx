import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const UnknownRouteScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>404</Text>
      <Text style={styles.message}>Page not found</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#333',
  },
  message: {
    fontSize: 18,
    color: '#666',
    marginTop: 8,
  },
});

export default UnknownRouteScreen;