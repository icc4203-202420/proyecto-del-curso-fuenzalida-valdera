import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

const Map = () => {
  return (
    <View style={styles.container}>
      <Text>No hay mapa disponible en este momento.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default Map