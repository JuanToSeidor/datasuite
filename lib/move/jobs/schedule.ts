import { TJob, TScheduleConfig } from './types';
import { CronExpressionParser } from 'cron-parser';
import { getNextExecution } from './cron';

/**
 * Próxima ejecución de un job (mirando todos sus schedules) como instante
 * absoluto. Cada cron se interpreta en su `time_zone_client`; los schedules sin
 * zona guardada (previos a los issues #1171 / #1293) se asumen en UTC.
 */
export const getNextJobExecution = (
  scheduleConfig: TScheduleConfig[] | null | undefined,
  fromDate: Date = new Date(),
): Date | null => {
  if (!scheduleConfig?.length) return null;

  const dates = scheduleConfig
    .map((schedule) =>
      getNextExecution(
        schedule.cron_expression,
        schedule.time_zone_client,
        fromDate,
      ),
    )
    .filter((date): date is Date => date instanceof Date);

  if (!dates.length) return null;
  return dates.reduce((closest, date) => (date < closest ? date : closest));
};

// //Función para obtener las próximas ejecución de un cron a partir desde una fecha inicial hasta una fecha final.
// export const getNextDateExecution = (
//   cron: string,
//   dayStart,
//   dayEnd,
//   type: string,
// ): Date[] => {
//   const executions: Date[] = [];
//   const interval = cronParser?.parseExpression(cron, { currentDate: dayStart });

//   if (type === 'instant') {
//     const nextExecution = interval.next().toDate();
//     // Verificamos si la próxima ejecución sigue dentro del mes
//     if (nextExecution >= dayStart && nextExecution <= dayEnd) {
//       executions.push(nextExecution);
//     }
//   } else if (type === 'interval') {
//     while (cron) {
//       try {
//         const nextExecution = new Date(interval.next().toDate());
//         // Obtener el huso horario del navegador en minutos y convertirlo a horas
//         const browserTimezoneOffset = new Date().getTimezoneOffset() / 60;
//         // Restar o sumar el timezone del navegador para obtener la hora en UTC
//         nextExecution.setHours(nextExecution.getHours() - browserTimezoneOffset );
//         // Verificamos si la próxima ejecución sigue dentro del mes
//         if (nextExecution <= dayEnd) {
//           if(nextExecution >= dayStart ){
//             executions.push(nextExecution);
//           }
//         } else {
//           break;
//         }
//       } catch (err) {
//         // Si el cron ha dejado de generar fechas, terminamos el bucle
//         break;
//       }
//     }
//   } else {
//     // Generar todas las ejecuciones para el mes
//     while (cron) {
//       try {
//         const nextExecution = new Date(interval.next().toDate());
//         // Verificamos si la próxima ejecución sigue dentro del mes
//         if (nextExecution >= dayStart && nextExecution <= dayEnd) {
//           executions.push(nextExecution);
//         } else {
//           break;
//         }
//       } catch (err) {
//         // Si el cron ha dejado de generar fechas, terminamos el bucle
//         break;
//       }
//     }
//   }
//   return executions;
// };




/**
 * Genera todas las fechas de ejecución de un cron entre dos fechas.
 * 
 * @param cron - Expresión cron (ej. "0 12,15,18 7 4 *")
 * @param dayStart - Fecha de inicio del período (Date)
 * @param dayEnd - Fecha de fin del período (Date)
 * @param type - Tipo de repetición: "instant", "interval", u otro
 * @param timeZone - Zona horaria en la que se creó el schedule (time_zone_client)
 * @returns Lista de fechas (Date[]) en las que se ejecutaría el cron
 */
export const getNextDateExecution = (
  cron: string,
  dayStart: Date,
  dayEnd: Date,
  type: string,
  timeZone?: string,
): Date[] => {
  const executions: Date[] = [];

  let interval;
  try {
    interval = CronExpressionParser.parse(cron, {
      currentDate: dayStart,
      endDate: dayEnd,
      tz: timeZone || 'UTC', // el cron se guardó en esta zona; el backend registra el trigger igual
    });
  } catch (err) {
    console.error('Invalid cron expression:', cron, err);
    return [];
  }

  if (type === 'instant') {
    try {
      const nextExecution = interval.next().toDate();
      if (nextExecution >= dayStart && nextExecution <= dayEnd) {
        executions.push(nextExecution);
      }
    } catch (err) {
      // No hay próximas ejecuciones dentro del rango
    }
  } else {
    try {
      while (true) {
        const nextExecution = interval.next().toDate();

        if (nextExecution > dayEnd) break;
        if (nextExecution >= dayStart) {
          executions.push(nextExecution);
        }
      }
    } catch (err) {
      // Fin de las ejecuciones posibles
    }
  }

  return executions;
};




export const getScheduledJobs = (
  jobs: TJob[],
  dayEnd: string,
  dayStart?: Date,
) => {
  const dayStartDate = dayStart
    ? (() => {
        const initialStartDate = new Date(dayStart);
        initialStartDate.setDate(initialStartDate.getDate() - 1);
        initialStartDate.setHours(23, 59, 59, 999);
        return initialStartDate;
      })()
    : new Date();

  const dayEndDate = new Date(
    parseInt(dayEnd.split('-')[0]),
    parseInt(dayEnd.split('-')[1]) - 1,
    parseInt(dayEnd.split('-')[2])
  );
  dayEndDate.setHours(23, 59, 59, 999);

  if (dayStartDate > dayEndDate) return [];
  if (!jobs) return [];


  const jobsScheduledInMonth = [];

  for (const job of jobs) {
    for (const schedule of job.schedule_config) {
      const cron = schedule.cron_expression;
      const repeat = schedule.repeat;

      const executions = getNextDateExecution(
        cron,
        dayStartDate,
        dayEndDate,
        repeat,
        schedule.time_zone_client,
      );

      const executionsFormatted = executions.map((execution) => ({
        nextExecutions: execution,
        job_id: job.job_id,
        schedule_id: schedule.id,
        cron: cron,
        time_zone_client: schedule.time_zone_client ?? 'UTC',
        name: job.name,
        repeat: repeat,
        status: job?.status,
        orderedNodes: job?.workflow_detail?.orderedNodes,
      }));

      jobsScheduledInMonth.push(...executionsFormatted);
    }
  }

  return jobsScheduledInMonth;
};