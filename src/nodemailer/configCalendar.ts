import { createEvent } from 'ics';

export const generarEventoCalendario = ({
  fecha,
  hora,
}: {
  fecha: string;
  hora: string;
}) => {
  if (!fecha || !hora) {
    throw new Error('Fecha u hora no definidas');
  }

  const [year, month, day] = fecha.split('-').map(Number);
  const [hour, minute] = hora.split(':').map(Number);

  const { error, value } = createEvent({
    title: 'Turno reservado',
    description: 'Turno Psicologia        ',
    start: [year, month, day, hour, minute],
    duration: { minutes: 45 },
    location: 'Virtual',
  });

  if (error) throw error;

  return value;
  //archvo par agoogel calenadar //
};
