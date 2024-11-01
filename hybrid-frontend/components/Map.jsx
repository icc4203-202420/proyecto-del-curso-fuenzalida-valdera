import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// Si no utilizas `backend_url`, puedes eliminar esta importación.
import { backend_url } from '@env';

const Map = () => {
  return (
    <View style={styles.container}>
      <Text>No map available at the moment.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Map;
