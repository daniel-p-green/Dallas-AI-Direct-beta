import { redirect } from 'next/navigation';
import { RoomBoard } from "@/components/room-board"
import { getSessionUser } from '@/lib/auth';
import { getAttendeeSessionUser, isAttendeeAuthEnabled } from '@/lib/attendee-auth';

export default async function RoomPage() {
  if (isAttendeeAuthEnabled()) {
    const adminUser = await getSessionUser();
    const attendeeUser = adminUser ? null : await getAttendeeSessionUser();

    if (!adminUser && !attendeeUser) {
      redirect('/sign-in?redirect_url=/room');
    }
  }

  return <RoomBoard />
}
