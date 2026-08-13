import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Avatar, H1, ListRow, Muted, Screen, StatusBadge } from '../../components/ui';
import { useMobileStore } from '../../hooks';
import type { StaffStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StaffStackParamList, 'Assigned'>;

export function AssignedScreen({ navigation }: Props) {
  const store = useMobileStore();
  const rows = store.myAssignments();

  return (
    <Screen>
      <H1>My Assigned</H1>
      <Muted>People you are shepherding right now.</Muted>
      {rows.length === 0 ? <Muted>No active assignments yet.</Muted> : null}
      {rows.map(({ person, journey, assignment }) => (
        <ListRow
          key={assignment.id}
          left={<Avatar firstName={person.firstName} lastName={person.lastName} />}
          title={`${person.firstName} ${person.lastName}`}
          subtitle={`Last contact · ${new Date(assignment.updatedAt).toLocaleDateString()}`}
          right={<StatusBadge status={journey.journeyStatus} />}
          onPress={() => navigation.navigate('PersonProfile', { personId: person.id })}
        />
      ))}
    </Screen>
  );
}
