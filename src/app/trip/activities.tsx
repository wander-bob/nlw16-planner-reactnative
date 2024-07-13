import { useState, useEffect } from 'react';

import { Alert, Keyboard, SectionList, Text, View } from 'react-native';
import {
   Calendar as IconCalendar,
   Clock,
   PlusIcon,
   Tag,
} from 'lucide-react-native';
import dayjs from 'dayjs';

import { TripData } from './[id]';
import { Button } from '@/components/button';
import { Modal } from '@/components/modal';

import { colors } from '@/styles/colors';
import { Input } from '@/components/input';
import { Calendar } from '@/components/calendar';
import { activitiesServer } from '@/server/activity-server';
import { Activity, ActivityProps } from '@/components/activity';
import { Loading } from '@/components/loading';

type Props = {
   tripDetails: TripData;
};

type TripActivities = {
   title: {
      dayNumber: number;
      dayName: string;
   };
   data: ActivityProps[];
};

enum MODAL {
   NONE = 0,
   CALENDAR = 1,
   NEW_ACTIVITY = 2,
}

export function Activities({ tripDetails }: Props) {
   const [isCreatingActivity, setIsCreatingActivity] = useState(false);
   const [isLoadingActivities, setIsLoadingActivities] = useState(true);
   const [showModal, setShowModal] = useState(MODAL.NONE);
   const [activityTitle, setActivityTitle] = useState('');
   const [activityDate, setActivityDate] = useState('');
   const [activityHour, setActivityHour] = useState('');
   const [tripActivities, setTripActivities] = useState<TripActivities[]>([]);

   function resetNewActivityFields() {
      setActivityTitle('');
      setActivityDate('');
      setActivityHour('');
      setShowModal(MODAL.NONE);
   }

   async function handleCreateTripActivity() {
      try {
         if (!activityTitle || !activityDate || !activityHour) {
            return Alert.alert(
               'Cadastrar atividade',
               'Preencha todos os campos!',
            );
         }
         setIsCreatingActivity(true);
         await activitiesServer.create({
            tripId: tripDetails.id,
            occurs_at: dayjs(activityDate)
               .add(Number(activityHour), 'h')
               .toString(),
            title: activityTitle,
         });
         Alert.alert(
            'Nova Atividade',
            'Nova atividade cadastrada com sucesso!',
         );
         await getTripActivities();
         resetNewActivityFields();
      } catch (error) {
         console.log(error);
      } finally {
         setIsCreatingActivity(false);
      }
   }

   async function getTripActivities() {
      try {
         const activities = await activitiesServer.getActivitiesByTripId(
            tripDetails.id,
         );

         const activitiesToSectionList = activities.map((dayActivity) => ({
            title: {
               dayNumber: dayjs(dayActivity.date).date(),
               dayName: dayjs(dayActivity.date)
                  .format('dddd')
                  .replace('-feira', ''),
            },
            data: dayActivity.activities.map((activity) => ({
               id: activity.id,
               title: activity.title,
               hour: dayjs(activity.occurs_at).format('hh[:]mm[h]'),
               isBefore: dayjs(activity.occurs_at).isBefore(dayjs()),
            })),
         }));
         setTripActivities(activitiesToSectionList);
      } catch (error) {
         console.log(error);
      } finally {
         setIsLoadingActivities(false);
      }
   }

   useEffect(() => {
      getTripActivities();
   }, []);

   return (
      <View className="flex-1">
         <View className="w-full flex-row mt-5 mb-6 items-center">
            <Text className="text-zinc-50 text-2xl font-semibold flex-1">
               Atividades
            </Text>
            <Button onPress={() => setShowModal(MODAL.NEW_ACTIVITY)}>
               <PlusIcon
                  color={colors.lime[950]}
                  size={20}
               />
               <Button.Title>Nova atividade</Button.Title>
            </Button>
         </View>

         {isLoadingActivities ? (
            <Loading />
         ) : (
            <SectionList
               sections={tripActivities}
               keyExtractor={(item) => item.id}
               renderItem={({ item }) => <Activity data={item} />}
               renderSectionHeader={({ section }) => (
                  <View className="w-full">
                     <Text className="text-zinc-50 text-2xl font-semibold py-2">
                        Dia {section.title.dayNumber + ' '}
                        <Text className="text-zinc-500 text-base font-regular capitalize">
                           {section.title.dayName}
                        </Text>
                     </Text>

                     {section.data.length === 0 && (
                        <Text className="text-zinc-500 font-regular text-sm mb-8">
                           Nenhuma atividade cadastrada nesta data.
                        </Text>
                     )}
                  </View>
               )}
               contentContainerClassName="gap-3 pb-48"
               showsVerticalScrollIndicator={false}
            />
         )}

         <Modal
            visible={showModal === MODAL.NEW_ACTIVITY}
            title="Cadastrar atividade"
            subtitle="Todos os convidados podem visualizar as atividades"
            onClose={() => setShowModal(MODAL.NONE)}
         >
            <View className="mt-4 mb-3">
               <Input variant="secondary">
                  <Tag
                     color={colors.zinc[400]}
                     size={20}
                  />
                  <Input.Field
                     placeholder="Qual atividade?"
                     onChangeText={setActivityTitle}
                     value={activityTitle}
                  />
               </Input>
               <View className="w-full mt-2 flex-row gap-2">
                  <Input
                     variant="secondary"
                     className="flex-1"
                  >
                     <IconCalendar
                        color={colors.zinc[400]}
                        size={20}
                     />
                     <Input.Field
                        placeholder="Data"
                        onChangeText={() => {}}
                        onFocus={() => Keyboard.dismiss()}
                        showSoftInputOnFocus={false}
                        onPressIn={() => setShowModal(MODAL.CALENDAR)}
                        value={
                           activityDate
                              ? dayjs(activityDate).format('DD [de] MMMM')
                              : ''
                        }
                     />
                  </Input>
                  <Input
                     variant="secondary"
                     className="flex-1"
                  >
                     <Clock
                        color={colors.zinc[400]}
                        size={20}
                     />
                     <Input.Field
                        placeholder="Hora"
                        onChangeText={(text) =>
                           setActivityHour(
                              text.replace('.', '').replace(',', ''),
                           )
                        }
                        value={activityHour}
                        keyboardType="numeric"
                        maxLength={2}
                     />
                  </Input>
               </View>
            </View>
            <Button
               onPress={handleCreateTripActivity}
               isLoading={isCreatingActivity}
            >
               <Button.Title>Salvar atividade</Button.Title>
            </Button>
         </Modal>

         <Modal
            title="Selecionar data"
            subtitle="Selecione a data da ativdade"
            visible={showModal === MODAL.CALENDAR}
            onClose={() => setShowModal(MODAL.NONE)}
         >
            <View className="gap-4 mt-4">
               <Calendar
                  onDayPress={(day) => setActivityDate(day.dateString)}
                  markedDates={{ [activityDate]: { selected: true } }}
                  initialDate={tripDetails.starts_at.toString()}
                  minDate={tripDetails.starts_at.toString()}
                  maxDate={tripDetails.ends_at.toString()}
               />
               <Button onPress={() => setShowModal(MODAL.NEW_ACTIVITY)}>
                  <Button.Title>Confirmar</Button.Title>
               </Button>
            </View>
         </Modal>
      </View>
   );
}
