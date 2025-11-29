import { AudioContextProvider } from '../../contexts/AudioContext';
import { Track } from './track';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AudioContextProvider>
      <Track id={id} />
    </AudioContextProvider>
  );
}
