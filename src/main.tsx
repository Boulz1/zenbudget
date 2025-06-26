// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { CategoriesPage } from './pages/CategoriesPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { NewTransactionPage } from './pages/NewTransactionPage.tsx';
import { TransactionsListPage } from './pages/TransactionsListPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { EditTransactionPage } from './pages/EditTransactionPage.tsx';
import { RecurringTransactionsPage } from './pages/RecurringTransactionsPage.tsx'; // Importer la nouvelle page

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'transactions/new',
        element: <NewTransactionPage />,
      },
      {
        path: 'transactions/:transactionId/edit', // Nouvelle route pour éditer
        element: <EditTransactionPage />,
      },
      {
        path: 'transactions',
        element: <TransactionsListPage />,
      },
      {
        path: 'categories',
        element: <CategoriesPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'recurring', // Nouvelle route pour les transactions récurrentes
        element: <RecurringTransactionsPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);