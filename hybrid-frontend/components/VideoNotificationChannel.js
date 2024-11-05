import React, { useEffect } from 'react'; 
import ActionCable from 'react-native-actioncable'; 
import Config from 'react-native-config'; 

const VideoNotificationChannel = () => {
  useEffect(() => {
    console.log('Config:', Config);
    console.log('Backend URL:', Config.BACKEND_URL); // Verifica la URL del backend

    if (Config.BACKEND_URL) {
      const cable = ActionCable.createConsumer(`${Config.BACKEND_URL}/cable`);
      const subscription = cable.subscriptions.create(
        { channel: 'VideoNotificationChannel' }, // Asegúrate de que este nombre coincida
        {
          received(data) {
            console.log('Data received:', data);
          },
        }
      );      

      return () => {
        subscription.unsubscribe();
      };
    } else {
      console.error('BACKEND_URL is not defined');
    }
  }, []);

  return null; // Este componente no necesita renderizar nada visualmente
};

export default VideoNotificationChannel;