import { upcomingEvents } from '../../content';
import { EventRow, H1, Muted, Screen } from '../../components/ui';

export function EventsScreen() {
  return (
    <Screen>
      <H1>Upcoming events</H1>
      <Muted>Key dates for IEEC Young Adults.</Muted>
      {upcomingEvents.map((e) => (
        <EventRow key={e.id} day={e.day} month={e.month} title={e.title} meta={`${e.time} · ${e.location}`} />
      ))}
    </Screen>
  );
}
