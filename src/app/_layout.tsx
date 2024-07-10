import { Slot } from 'expo-router';
import { View, StatusBar } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Loading } from '@/components/Loading';

import '@/styles/global.css';

export default function Layout() {
   const [fontsLoaded] = useFonts({
      Inter_400Regular,
      Inter_500Medium,
      Inter_600SemiBold,
   });
   if (!fontsLoaded) {
      return <Loading />;
   }
   return (
      <View className="flex-1 bg-zinc-950">
         <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
         />
         <Slot />
      </View>
   );
}
