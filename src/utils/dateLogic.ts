// src/utils/dateLogic.ts
import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  setDay, // Sets the day of the week (0 for Sunday, 6 for Saturday)
  setDate, // Sets the day of the month
  startOfDay,
  isAfter,
  isSameDay,
  parseISO, // Pour convertir les strings YYYY-MM-DD en objets Date
  formatISO // Pour formater les objets Date en string YYYY-MM-DD (partie date seulement)
} from 'date-fns';
import type { Frequency } from '../types'; // Assurez-vous que le type Frequency est exporté

/**
 * Calcule la prochaine date d'échéance pour une règle récurrente.
 * @param baseDate La date à partir de laquelle calculer la prochaine échéance (généralement startDate ou lastGeneratedDate).
 * @param frequency Fréquence de la récurrence.
 * @param interval Intervalle pour la fréquence (tous les X jours/semaines/mois/ans).
 * @param dayOfWeek Jour de la semaine (0-6) pour les récurrences hebdomadaires.
 * @param dayOfMonth Jour du mois (1-31) pour les récurrences mensuelles ou annuelles.
 * @returns La prochaine date d'échéance au format 'YYYY-MM-DD'.
 */
export function calculateNextDueDate(
  baseDateStr: string, // Date de base au format 'YYYY-MM-DD'
  frequency: Frequency,
  interval: number,
  dayOfWeek?: number,
  dayOfMonth?: number
): string {
  let baseDate = startOfDay(parseISO(baseDateStr)); // Normaliser au début du jour
  let nextDate: Date;

  switch (frequency) {
    case 'daily':
      nextDate = addDays(baseDate, interval);
      break;
    case 'weekly':
      // Avancer à la semaine de l'intervalle
      let targetWeekDate = addWeeks(baseDate, interval);
      // Puis ajuster au jour de la semaine souhaité (si différent du jour actuel de targetWeekDate)
      // setDay ajuste au prochain jour de la semaine spécifié DANS la semaine courante de targetWeekDate
      // ou la semaine d'après si le jour est déjà passé dans cette semaine.
      // Si on veut "toutes les X semaines, le Lundi", et que baseDate + X semaines est un Mercredi,
      // setDay(targetWeekDate, 1) donnera le Lundi de la semaine suivante.
      // Si on veut que ce soit le Lundi de la semaine de targetWeekDate, il faut une logique plus fine.
      // Pour l'instant, on avance d'abord, puis on ajuste.
      // Si le baseDate est déjà le bon jour de la semaine, addWeeks le maintiendra.
      // Si après addWeeks, on n'est pas le bon jour, setDay nous y mènera.
      // Il faut s'assurer que si on est déjà sur le bon jour de la semaine *avant* d'ajouter l'intervalle,
      // et que l'intervalle est > 0, on passe bien à la prochaine occurrence.

      // Logique simplifiée pour l'instant : on avance, puis on set le jour.
      // Si on est le Lundi 1er, freq 'weekly', interval 1, dayOfWeek 1 (Lundi)
      // addWeeks(Lundi 1er, 1) -> Lundi 8. setDay(Lundi 8, 1) -> Lundi 8. Correct.
      // Si on est le Lundi 1er, freq 'weekly', interval 0 (pourrait arriver si on veut le prochain lundi après baseDate)
      // addWeeks(Lundi 1er, 0) -> Lundi 1er. setDay(Lundi 1er, 1) -> Lundi 1er.
      // Il faut une logique pour s'assurer qu'on avance si la date de base est déjà une date d'échéance.
      // Pour l'instant, on suppose que baseDate est la *dernière* échéance générée.

      let referenceDate = addWeeks(baseDate, interval);
      if (dayOfWeek !== undefined) {
        // Si referenceDate est déjà le bon jour de la semaine, c'est notre nextDate.
        // Sinon, trouver le prochain dayOfWeek à partir de referenceDate.
        if (referenceDate.getDay() === dayOfWeek) {
          nextDate = referenceDate;
        } else {
          // setDay va trouver le dayOfWeek dans la semaine de referenceDate.
          // Si c'est avant referenceDate (ex: ref=Sam, target=Lun -> setDay donne Lun de la même semaine),
          // alors il faut ajouter une semaine pour aller au prochain.
          let candidate = setDay(referenceDate, dayOfWeek, { weekStartsOn: 0 /* Dimanche par défaut, mais explicite */ });
          if (isAfter(referenceDate, candidate)) {
            nextDate = addWeeks(candidate, 1);
          } else { // candidate est sur ou après referenceDate (dans la même semaine)
            nextDate = candidate;
          }
        }
      } else { // Si pas de dayOfWeek spécifique, on prend juste la date après intervalle de semaines
        nextDate = referenceDate;
      }
      break;
    case 'monthly':
      nextDate = addMonths(baseDate, interval);
      if (dayOfMonth !== undefined) {
        // Gérer le cas où dayOfMonth est > au nombre de jours du mois cible
        const maxDaysInMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
        nextDate = setDate(nextDate, Math.min(dayOfMonth, maxDaysInMonth));
      }
      break;
    case 'yearly':
      nextDate = addYears(baseDate, interval);
      if (dayOfMonth !== undefined) {
        // Gérer le cas où dayOfMonth est > au nombre de jours du mois cible (surtout pour février)
         // Note: month in Date object is 0-indexed, dayOfMonth is 1-indexed.
        const targetMonth = nextDate.getMonth(); // Conserver le mois après addYears
        const maxDaysInMonth = new Date(nextDate.getFullYear(), targetMonth + 1, 0).getDate();
        nextDate = setDate(nextDate, Math.min(dayOfMonth, maxDaysInMonth));
      }
      break;
    default:
      // Devrait être inatteignable avec le type Frequency
      throw new Error('Invalid frequency');
  }
  return formatISO(startOfDay(nextDate), { representation: 'date' });
}

/**
 * Calcule la *première* date d'échéance à partir de la startDate d'une règle.
 * C'est différent de calculateNextDueDate qui part d'une baseDate (potentiellement lastGeneratedDate).
 */
export function calculateFirstDueDate(
  startDateStr: string,
  frequency: Frequency,
  dayOfWeek?: number,
  dayOfMonth?: number
): string {
  let startDate = startOfDay(parseISO(startDateStr));
  let firstDueDate = startDate; // Par défaut, la première échéance est la date de début

  // Pour certaines fréquences, la première occurrence pourrait être *après* la startDate
  // si des conditions spécifiques (jour de la semaine/mois) sont définies.
  if (frequency === 'weekly' && dayOfWeek !== undefined) {
    let candidate = setDay(startDate, dayOfWeek, { weekStartsOn: 0 });
    // Si le jour calculé est avant la startDate, on prend le suivant
    if (isAfter(startDate, candidate) && !isSameDay(startDate, candidate)) {
       candidate = addWeeks(candidate, 1); // Ou setDay sur startDate la semaine d'après?
                                          // setDay(addWeeks(startDate,1), dayOfWeek) serait plus direct
                                          // Non, setDay sur la date de début, si c'est avant, on ajoute 1 semaine au résultat de setDay.
       candidate = setDay(startDate, dayOfWeek, { weekStartsOn: 0});
       if(isAfter(startDate,candidate) || (isSameDay(startDate,candidate) && startDate.getDay() !== dayOfWeek)){
         // if startDate is a Tuesday, and dayOfWeek is Monday, setDay(tuesday, monday) gives monday of the same week.
         // if startDate is a Tuesday, and dayOfWeek is Wednesday, setDay(tuesday, wednesday) gives wednesday of the same week.
         // We want the *first* occurrence on or *after* startDate.
         if (startDate.getDay() !== dayOfWeek) { // if not already the correct day
            candidate = setDay(startDate, dayOfWeek); // get the day in the current week
            if (isAfter(startDate, candidate)) { // if that day was in the past for this week
                candidate = addWeeks(candidate, 1); // move to next week
            }
         }
       }
    }
    firstDueDate = candidate;

  } else if ((frequency === 'monthly' || frequency === 'yearly') && dayOfMonth !== undefined) {
    const maxDaysInStartMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    let candidate = setDate(startDate, Math.min(dayOfMonth, maxDaysInStartMonth));
    // Si le jour calculé est avant la startDate (ex: startDate=15/10, dayOfMonth=1 -> candidate=01/10)
    // on passe au mois suivant
    if (isAfter(startDate, candidate) && !isSameDay(startDate, candidate)) {
      candidate = addMonths(candidate, 1);
      // Ré-appliquer dayOfMonth au cas où le mois suivant est plus court
      const maxDaysInNextMonth = new Date(candidate.getFullYear(), candidate.getMonth() + 1, 0).getDate();
      candidate = setDate(candidate, Math.min(dayOfMonth, maxDaysInNextMonth));
    }
    firstDueDate = candidate;
  }

  return formatISO(startOfDay(firstDueDate), { representation: 'date' });
}
