// src/utils/transactionGenerator.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { generateTransactionsForRule } from './transactionGenerator';
import type { RecurringTransactionRule, TransactionFormData } from '../types';
import { formatISO, parseISO, addDays, subDays, isSameDay, isBefore, addMonths } from 'date-fns'; // Added isSameDay, isBefore, addMonths

describe('generateTransactionsForRule', () => {
  const baseRule: Omit<RecurringTransactionRule, 'id' | 'nextDueDate' | 'frequency' | 'interval' | 'startDate' | 'name' | 'isActive' | 'lastGeneratedDate'> = {
    type: 'Dépense',
    amount: 100,
    mainCategoryId: 'cat1',
    note: 'Test Rule',
  };

  const today = new Date(); // Date limite pour la génération
  const todayStr = formatISO(today, { representation: 'date' });

  it('should generate no transactions if nextDueDate is in the future', () => {
    const futureDate = formatISO(addDays(today, 5), { representation: 'date' });
    const rule: RecurringTransactionRule = {
      ...baseRule,
      id: 'rule1',
      name: 'Future Rule',
      frequency: 'daily',
      interval: 1,
      startDate: todayStr,
      nextDueDate: futureDate, // Échéance dans le futur
      isActive: true,
    };
    const result = generateTransactionsForRule(rule, today);
    expect(result.transactionsToCreate.length).toBe(0);
    expect(result.newLastGeneratedDate).toBeUndefined();
    expect(result.newNextDueDate).toBe(futureDate); // Doit rester la même
  });

  it('should generate one transaction if nextDueDate is today', () => {
    const rule: RecurringTransactionRule = {
      ...baseRule,
      id: 'rule2',
      name: 'Today Rule',
      frequency: 'daily',
      interval: 1,
      startDate: todayStr,
      nextDueDate: todayStr,
      isActive: true,
    };
    const result = generateTransactionsForRule(rule, today);
    expect(result.transactionsToCreate.length).toBe(1);
    expect(result.transactionsToCreate[0].date).toBe(todayStr);
    expect(result.transactionsToCreate[0].note).toBe('Today Rule - Test Rule (Récurrent)');
    expect(result.newLastGeneratedDate).toBe(todayStr);
    expect(result.newNextDueDate).toBe(formatISO(addDays(today, 1), { representation: 'date' }));
  });

  it('should generate multiple transactions for a daily rule over several days', () => {
    const startDate = subDays(today, 3);
    const startDateStr = formatISO(startDate, { representation: 'date' });
    const rule: RecurringTransactionRule = {
      ...baseRule,
      id: 'rule3',
      name: 'Daily Multi',
      frequency: 'daily',
      interval: 1,
      startDate: startDateStr,
      nextDueDate: startDateStr, // Commence à la date de début
      isActive: true,
    };
    // limitDate est 'today', donc on attend 4 transactions: startDate, startDate+1, startDate+2, startDate+3 (today)
    const result = generateTransactionsForRule(rule, today);
    expect(result.transactionsToCreate.length).toBe(4);
    expect(result.transactionsToCreate[0].date).toBe(startDateStr);
    expect(result.transactionsToCreate[3].date).toBe(todayStr);
    expect(result.newLastGeneratedDate).toBe(todayStr);
    expect(result.newNextDueDate).toBe(formatISO(addDays(today, 1), { representation: 'date' }));
  });

  it('should respect endDate', () => {
    const startDate = subDays(today, 5);
    const endDate = subDays(today, 2); // Se termine il y a 2 jours
    const rule: RecurringTransactionRule = {
      ...baseRule,
      id: 'rule4',
      name: 'Ended Rule',
      frequency: 'daily',
      interval: 1,
      startDate: formatISO(startDate, { representation: 'date' }),
      nextDueDate: formatISO(startDate, { representation: 'date' }),
      endDate: formatISO(endDate, { representation: 'date' }),
      isActive: true,
    };
    // Devrait générer pour startDate, startDate+1, startDate+2, startDate+3 (qui est endDate)
    // startDate = today-5, endDate = today-2. Transactions pour: T-5, T-4, T-3, T-2. (4 transactions)
    const result = generateTransactionsForRule(rule, today);
    expect(result.transactionsToCreate.length).toBe(4);
    expect(result.newLastGeneratedDate).toBe(formatISO(endDate, { representation: 'date' }));
    // La prochaine date calculée sera après endDate, donc c'est la bonne nextDueDate à stocker
    expect(result.newNextDueDate).toBe(formatISO(addDays(endDate, 1), { representation: 'date' }));
  });

  it('should not generate transactions if rule is inactive', () => {
    const rule: RecurringTransactionRule = {
      ...baseRule,
      id: 'rule5',
      name: 'Inactive Rule',
      frequency: 'daily',
      interval: 1,
      startDate: todayStr,
      nextDueDate: todayStr,
      isActive: false, // Inactive
    };
    const result = generateTransactionsForRule(rule, today);
    expect(result.transactionsToCreate.length).toBe(0);
    expect(result.newLastGeneratedDate).toBeUndefined();
    expect(result.newNextDueDate).toBe(todayStr); // nextDueDate ne change pas
  });

  it('should use lastGeneratedDate if provided and nextDueDate is older or same', () => {
    // Ce test est plus pour la logique d'appel dans App.tsx,
    // generateTransactionsForRule commence toujours par rule.nextDueDate.
    // La logique de mise à jour de nextDueDate avant d'appeler generateTransactionsForRule est cruciale.
    // Ici, on s'assure juste que si nextDueDate est dans le passé, ça génère.
    const lastGen = subDays(today, 5);
    const nextDue = subDays(today, 3); // nextDueDate est après lastGeneratedDate

    const rule: RecurringTransactionRule = {
      ...baseRule,
      id: 'rule6',
      name: 'With LastGen',
      frequency: 'daily',
      interval: 1,
      startDate: formatISO(subDays(today,10), {representation: 'date'}),
      lastGeneratedDate: formatISO(lastGen, {representation: 'date'}),
      nextDueDate: formatISO(nextDue, {representation: 'date'}), // Commence à partir d'ici
      isActive: true,
    };
    // limitDate est 'today'. Devrait générer pour T-3, T-2, T-1, T. (4 transactions)
    const result = generateTransactionsForRule(rule, today);
    expect(result.transactionsToCreate.length).toBe(4);
    expect(result.transactionsToCreate[0].date).toBe(formatISO(nextDue, { representation: 'date' }));
    expect(result.newLastGeneratedDate).toBe(todayStr);
    expect(result.newNextDueDate).toBe(formatISO(addDays(today, 1), { representation: 'date' }));
  });

  it('monthly rule: should generate for current month if due and not past limitDate', () => {
    const firstOfMonth = formatISO(new Date(today.getFullYear(), today.getMonth(), 1), {representation: 'date'});
    const rule: RecurringTransactionRule = {
      ...baseRule,
      id: 'rule7',
      name: 'Monthly Test',
      frequency: 'monthly',
      interval: 1,
      startDate: firstOfMonth,
      nextDueDate: firstOfMonth, // Due le 1er du mois actuel
      dayOfMonth: 1,
      isActive: true,
    };
    const result = generateTransactionsForRule(rule, today); // today
    // Si today est le 1er, length = 1, nextDueDate = 1er mois prochain
    // Si today est après le 1er, length = 1, nextDueDate = 1er mois prochain
    if (isSameDay(parseISO(firstOfMonth), today) || isBefore(parseISO(firstOfMonth), today)) {
        expect(result.transactionsToCreate.length).toBe(1);
        expect(result.transactionsToCreate[0].date).toBe(firstOfMonth);
        expect(result.newLastGeneratedDate).toBe(firstOfMonth);
        const expectedNextDue = formatISO(addMonths(parseISO(firstOfMonth), 1), {representation: 'date'});
        expect(result.newNextDueDate).toBe(expectedNextDue);
    } else { // firstOfMonth est dans le futur (ne devrait pas arriver avec ce setup de test)
        expect(result.transactionsToCreate.length).toBe(0);
        expect(result.newNextDueDate).toBe(firstOfMonth);
    }
  });

  it('weekly rule: should generate for current week if due', () => {
    // Example: rule for every Monday, today is Wednesday.
    // Last Monday was 2 days ago. nextDueDate should be that Monday.
    const todayIs = today.getDay(); // 0=Sun, 6=Sat
    const targetDayOfWeek = (todayIs + 5) % 7; // Un lundi, si today est Mercredi (2+5)%7 = 0 (Dimanche), (0+5)%7 = 5 (Vendredi)
                                            // Prenons un lundi (1) comme targetDayOfWeek pour simplifier.
    const mondayThisWeekOrPast = formatISO(subDays(today, (todayIs + 6) % 7), {representation: 'date'});


    const rule: RecurringTransactionRule = {
      ...baseRule,
      id: 'rule8',
      name: 'Weekly Test',
      frequency: 'weekly',
      interval: 1,
      startDate: mondayThisWeekOrPast,
      nextDueDate: mondayThisWeekOrPast,
      dayOfWeek: 1, // Lundi
      isActive: true,
    };
    const result = generateTransactionsForRule(rule, today);
    expect(result.transactionsToCreate.length).toBe(1);
    expect(result.transactionsToCreate[0].date).toBe(mondayThisWeekOrPast);
    expect(result.newLastGeneratedDate).toBe(mondayThisWeekOrPast);
    expect(result.newNextDueDate).toBe(formatISO(addDays(parseISO(mondayThisWeekOrPast), 7), { representation: 'date' }));
  });


});
