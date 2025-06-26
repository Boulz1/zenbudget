// src/utils/transactionGenerator.ts
import { parseISO, isBefore, isSameDay, startOfDay } from 'date-fns';
import type { RecurringTransactionRule, TransactionFormData, Frequency } from '../types';
import { calculateNextDueDate } from './dateLogic'; // calculateNextDueDate est suffisant ici

interface GenerationResult {
  transactionsToCreate: TransactionFormData[];
  newLastGeneratedDate?: string; // La date de la dernière transaction réellement générée
  newNextDueDate: string; // La prochaine date d'échéance pour la règle
}

/**
 * Génère les transactions dues pour une règle récurrente jusqu'à une date limite.
 * @param rule La règle de transaction récurrente.
 * @param limitDate La date jusqu'à laquelle générer les transactions (inclusivement).
 * @returns Un objet contenant les transactions à créer et les dates mises à jour pour la règle.
 */
export function generateTransactionsForRule(
  rule: RecurringTransactionRule,
  limitDate: Date // Objet Date JavaScript
): GenerationResult {
  const transactionsToCreate: TransactionFormData[] = [];
  let currentProcessingDate = parseISO(rule.nextDueDate); // Commence par la prochaine échéance connue
  const ruleEndDate = rule.endDate ? startOfDay(parseISO(rule.endDate)) : null;
  const normalizedLimitDate = startOfDay(limitDate); // Normaliser la date limite

  let latestGeneratedDateInThisRun: string | undefined = undefined;
  let nextCalculatedDueDate = rule.nextDueDate; // Initialiser avec la nextDueDate actuelle de la règle

  // Boucler tant que la date de traitement actuelle est avant ou égale à la date limite
  // et (si une date de fin de règle existe) avant ou égale à la date de fin de la règle.
  while (
    (isBefore(currentProcessingDate, normalizedLimitDate) || isSameDay(currentProcessingDate, normalizedLimitDate)) &&
    (!ruleEndDate || (isBefore(currentProcessingDate, ruleEndDate) || isSameDay(currentProcessingDate, ruleEndDate))) &&
    rule.isActive // Ne générer que si la règle est active
  ) {
    // Créer la transaction
    const newTransaction: TransactionFormData = {
      type: rule.type,
      amount: rule.amount,
      date: nextCalculatedDueDate, // Utiliser la date d'échéance calculée pour la transaction
      mainCategoryId: rule.mainCategoryId,
      subCategoryId: rule.subCategoryId,
      note: `${rule.name}${rule.note ? ` - ${rule.note}` : ''} (Récurrent)`,
    };
    transactionsToCreate.push(newTransaction);
    latestGeneratedDateInThisRun = nextCalculatedDueDate;

    // Calculer la prochaine date de traitement pour la *prochaine itération potentielle*
    currentProcessingDate = parseISO(calculateNextDueDate(
      nextCalculatedDueDate, // La base est la date qu'on vient de générer
      rule.frequency,
      rule.interval,
      rule.dayOfWeek,
      rule.dayOfMonth
    ));
    // Mettre à jour nextCalculatedDueDate pour la valeur de retour et la prochaine boucle
    nextCalculatedDueDate = currentProcessingDate.toISOString().split('T')[0];
  }

  return {
    transactionsToCreate,
    newLastGeneratedDate: latestGeneratedDateInThisRun, // Sera undefined si aucune transaction n'a été générée
    newNextDueDate: nextCalculatedDueDate, // La prochaine date d'échéance, même si aucune transaction n'a été générée dans cet appel
  };
}
