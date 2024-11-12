import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

const Feed = () => {
  return (
    <View style={styles.container}>
      <Text>No Feed available at the moment.</Text>
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

export default Feed;
