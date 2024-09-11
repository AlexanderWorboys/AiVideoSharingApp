import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';

export default function App() {
  const [name, setName] = useState('');

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{name ? `Hi ${name}!` : 'What is your name?'}</Text>
        <View style={{ width: 100, height: 100, backgroundColor: 'red'}}>
      </View>
      <TextInput
        style={{ padding: 8, backgroundColor: '#f5f5f5', width: 200 }}
        onChangeText={text => setName(text)}
        secureTextEntry
      />
    </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
