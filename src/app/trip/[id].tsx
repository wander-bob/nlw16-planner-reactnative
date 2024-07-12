import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import { Keyboard, TouchableOpacity, View } from 'react-native';
import {
   CalendarRange,
   Info,
   MapPin,
   Settings2,
   Calendar as IconCalendar,
} from 'lucide-react-native';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Loading } from '@/components/loading';
import { Modal } from '@/components/modal';
import { Activities } from './activities';
import { Details } from './details';

import { TripDetails, tripServer } from '@/server/trip-server';
import { colors } from '@/styles/colors';

export type TripData = TripDetails & { when: string };

enum MODAL {
   NONE = 0,
   UPDATE_TRIP = 1,
   CALENDAR = 2,
}

export default function Trip() {
   const [isLoadindTrip, setIsLoadingTrip] = useState(true);

   const [tripDetails, setTripDetails] = useState({} as TripData);
   const [option, setOption] = useState<'activity' | 'details'>('activity');
   const tripId = useLocalSearchParams<{ id: string }>().id;
   const [showModal, setShowModal] = useState(MODAL.NONE);
   const [destination, setDestination] = useState('');

   async function getTripDetails() {
      try {
         setIsLoadingTrip(true);

         if (!tripId) {
            return router.back();
         }

         const trip = await tripServer.getById(tripId);

         const maxLengthDestination = 14;
         const destination =
            trip.destination.length > maxLengthDestination
               ? trip.destination.slice(0, maxLengthDestination) + '...'
               : trip.destination;
         const starts_at = dayjs(trip.starts_at).format('DD');
         const ends_at = dayjs(trip.ends_at).format('DD');
         const month = dayjs(trip.starts_at).format('MMM');

         setTripDetails({
            ...trip,
            when: `${destination} de ${starts_at} a ${ends_at} de ${month}.`,
         });
      } catch (error) {
         console.log(error);
      } finally {
         setIsLoadingTrip(false);
      }
   }

   useEffect(() => {
      getTripDetails();
   }, []);

   if (isLoadindTrip) {
      return <Loading />;
   }

   return (
      <View className="flex-1 px-5 pt-16">
         <Input variant="tertiary">
            <MapPin
               color={colors.zinc[400]}
               size={20}
            />
            <Input.Field
               value={tripDetails.when}
               readOnly
            />
            <TouchableOpacity
               activeOpacity={0.6}
               className="w-9 h-9 bg-zinc-800 items-center justify-center rounded-none"
               onPress={() => setShowModal(MODAL.UPDATE_TRIP)}>
               <Settings2
                  color={colors.zinc[400]}
                  size={20}
               />
            </TouchableOpacity>
         </Input>

         {option === 'activity' ? (
            <Activities tripDetails={tripDetails} />
         ) : (
            <Details tripId={tripDetails.id} />
         )}

         <View className="w-full absolute -bottom-1 self-center justify-end pb-5 z-10 bg-zinc-950">
            <View className="w-full flex-row bg-zinc-900 p-4 rounded-lg border border-zinc-800 gap-2">
               <Button
                  className="flex-1"
                  onPress={() => setOption('activity')}
                  variant={option === 'activity' ? 'primary' : 'secondary'}>
                  <CalendarRange
                     color={
                        option === 'activity'
                           ? colors.lime[950]
                           : colors.zinc[200]
                     }
                     size={20}
                  />
                  <Button.Title>Atividades</Button.Title>
               </Button>

               <Button
                  className="flex-1"
                  onPress={() => setOption('details')}
                  variant={option === 'details' ? 'primary' : 'secondary'}>
                  <Info
                     color={
                        option === 'details'
                           ? colors.lime[950]
                           : colors.zinc[200]
                     }
                     size={20}
                  />
                  <Button.Title>Detalhes</Button.Title>
               </Button>
            </View>
         </View>

         <Modal
            title="Atualizar viagem"
            subtitle="Somente quem criou a viagem pode editar."
            visible={showModal === MODAL.UPDATE_TRIP}
            onClose={() => setShowModal(MODAL.NONE)}>
            <View className="gap-2 my-4">
               <Input variant="secondary">
                  <MapPin
                     color={colors.zinc[400]}
                     size={20}
                  />
                  <Input.Field
                     placeholder="Para onde?"
                     onChangeText={setDestination}
                     value={destination}
                  />
               </Input>

               <Input variant="secondary">
                  <IconCalendar
                     color={colors.zinc[400]}
                     size={20}
                  />
                  <Input.Field
                     placeholder="Quando?"
                     onChangeText={setDestination}
                     value={destination}
                     onPressIn={() => setShowModal(MODAL.CALENDAR)}
                     onFocus={() => Keyboard.dismiss()}
                  />
               </Input>
            </View>
         </Modal>
      </View>
   );
}
