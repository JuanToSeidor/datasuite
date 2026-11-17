import moment from 'moment-timezone';
import { CronExpressionParser } from 'cron-parser';

/**
 * Próxima ejecución de un schedule, como instante absoluto (Date).
 *
 * El cron se interpreta en la zona horaria en la que fue creado
 * (`schedule.time_zone_client`), que es la misma que el backend usa para
 * registrar el trigger en APScheduler. Los schedules creados antes de que se
 * guardara la zona caen a UTC.
 *
 * El Date que devuelve es un instante absoluto: al mostrarlo con
 * `toLocaleString()` cada usuario lo ve en su propia hora local, pero todos
 * miran el mismo momento.
 */
export function getNextExecution(
  cronExpression: string,
  timeZone?: string,
  fromDate: Date = new Date(),
): Date | null {
  if (!cronExpression || cronExpression.trim().split(/\s+/).length < 5) {
    return null;
  }
  try {
    return CronExpressionParser.parse(cronExpression, {
      currentDate: fromDate,
      tz: timeZone || 'UTC',
    })
      .next()
      .toDate();
  } catch (err) {
    console.error('Invalid cron expression:', cronExpression, err);
    return null;
  }
}


/**
 * Función que recibe parámetros de tiempo y fecha y retorna una expresión cron.
 * La expresión queda en hora de pared (la que eligió el usuario); la zona horaria
 * se guarda aparte en `schedule.time_zone_client` y la aplica el backend.
 */
export function getCron(
  time: string | null | undefined,
  dayMonth: Date | null | undefined,
  dayWeek: Array<string | number> | null | undefined,
  repeat: string,
) {
  const minutesCron = time ? time.split(':')[1] : '*';
  const hoursCron = time ? time.split(':')[0] : '*';
  const timeCron = minutesCron + ' ' + hoursCron;
  const dayMonthCron = dayMonth ? dayMonth.getDate() : '';
  const monthCron = dayMonth ? dayMonth.getMonth() + 1 : '';
  const dayCron = dayMonth
    ? `${dayMonthCron} ${repeat !== 'once-month' ? monthCron : '*'} *`
    : `* * ${(dayWeek?.length ?? 0) > 0 ? dayWeek!.join(',') : '*'}`;

  return `${timeCron} ${dayCron}`;
}

/**
 * Función que convierte una hora en formato UTC a la hora local del navegador.
 */
export function convertUTCToLocalTime(utcTime: string) {
  const timeInUTC = moment.utc(utcTime, 'HH:mm');
  const localTime = timeInUTC.local().format('HH:mm');
  const isPm = parseInt(localTime.split(':')[0], 10) >= 12;
  return isPm ? localTime + ' PM' : localTime + ' AM';
}

/**
 * Función que retorna el mes en formato legible.
 */
export function formattedMonth(month: number) {
  switch (month) {
    case 1:
      return 'January';
    case 2:
      return 'February';
    case 3:
      return 'March';
    case 4:
      return 'April';
    case 5:
      return 'May';
    case 6:
      return 'June';
    case 7:
      return 'July';
    case 8:
      return 'August';
    case 9:
      return 'September';
    case 10:
      return 'October';
    case 11:
      return 'November';
    case 12:
      return 'December';
    default:
      return '';
  }
}








/**
 * Desglosa una expresión cron en un objeto legible (hora, días, fecha, intervalo).
 * Opera sobre la expresión tal cual: la hora que devuelve es la hora de pared
 * configurada, que hay que mostrar junto con `schedule.time_zone_client`.
 */
// export function cronToHumanReadable(cronExpression, repeat) {
//   console.log(repeat, 'repeat');
//   const convertedCron = cronExpression
//   const cronReadableObject = {
//     interval: '',
//     date: '',
//     time: '',
//     daysOfWeek: '',
//   };

//   if (repeat === 'interval') {
//     const formatInterval = convertedCron.split(' ')[1].split('/')[1];
//     cronReadableObject.interval = 'Every ' + formatInterval + ' hours';
//   } else {
//     const formatMinutes =
//       parseInt(convertedCron.split(' ')[0], 10) > 10
//         ? `${convertedCron.split(' ')[0]}`
//         : `0${convertedCron.split(' ')[0]}`;
//     const isPm = parseInt(convertedCron.split(' ')[1], 10) >= 12;
//     cronReadableObject.time =
//       convertedCron.split(' ')[1] +
//       ':' +
//       formatMinutes +
//       (isPm ? ' PM' : ' AM');
//   }

//   if (repeat === 'instant') {
//     const month = convertedCron.split(' ')[3];
//     const monthFormatted = formattedMonth(parseInt(month, 10));
//     cronReadableObject.date =
//       monthFormatted + ' ' + convertedCron.split(' ')[2];
//   } else if (repeat === 'once-month') {
//     cronReadableObject.date =
//       'Every ' + convertedCron.split(' ')[2] + 'th of the month';
//   } else {
//     let days = convertedCron.split(' ')[4];
//     if ((repeat === 'custom-cron' || repeat === 'once-day') && days !== '*') {
//       days = ((parseInt(days, 10) + 1) % 7).toString();
//     }
//     const daysArray = days.split(',');
//     const daysOfWeek = daysArray.map(day => {
//       switch (day) {
//         case '0':
//           return 'Sunday';
//         case '1':
//           return 'Monday';
//         case '2':
//           return 'Tuesday';
//         case '3':
//           return 'Wednesday';
//         case '4':
//           return 'Thursday';
//         case '5':
//           return 'Friday';
//         case '6':
//           return 'Saturday';
//         default:
//           return '';
//       }
//     });
//     cronReadableObject.daysOfWeek = daysOfWeek.join(', ');
//   }
//   return cronReadableObject;
// }




export function cronToHumanReadable(cronExpression: string, repeat: string) {
  const [minute, hour, dayOfMonth, month, dayOfWeekRaw] = cronExpression.split(' ');
  const cronReadableObject = {
    interval: '',
    date: '',
    time: '',
    daysOfWeek: '',
  };

  // ✅ Formateo de hora
  const hourInt = parseInt(hour, 10);
  const minuteInt = parseInt(minute, 10);
  const hour12 = hourInt % 12 === 0 ? 12 : hourInt % 12;
  const minuteFormatted = minuteInt < 10 ? `0${minuteInt}` : `${minuteInt}`;
  const period = hourInt >= 12 ? 'PM' : 'AM';
  cronReadableObject.time = `${hour12}:${minuteFormatted} ${period}`;

  // ✅ Repetición por tipo
  if (repeat === 'interval') {
    const formatInterval = hour.split('/')[1];
    cronReadableObject.interval = 'Every ' + formatInterval + ' hours';
  } else if (repeat === 'instant') {
    const monthFormatted = formattedMonth(parseInt(month, 10));
    cronReadableObject.date = `${monthFormatted} ${dayOfMonth}`;
  } else if (repeat === 'once-month') {
    cronReadableObject.date = `Every ${dayOfMonth}th of the month`;
  }

  // ✅ Días de la semana
  if ((repeat === 'custom-cron' || repeat === 'once-day') && dayOfWeekRaw !== '*') {
    const dayList = dayOfWeekRaw.split(',');
    const daysOfWeek = dayList.map((day: string) => {
      const dayNum = parseInt(day, 10);
      switch (dayNum) {
        case 0: return 'Sunday';
        case 1: return 'Monday';
        case 2: return 'Tuesday';
        case 3: return 'Wednesday';
        case 4: return 'Thursday';
        case 5: return 'Friday';
        case 6: return 'Saturday';
        default: return '';
      }
    });
    cronReadableObject.daysOfWeek = daysOfWeek.join(', ');
  }

  return cronReadableObject;
}
