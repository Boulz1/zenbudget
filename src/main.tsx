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
// On importe notre nouvelle page de tableau de bord
import { DashboardPage } from './pages/DashboardPage.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true, // "index: true" signifie que c'est la route par défaut pour le parent ('/')
        element: <DashboardPage />,
      },
      {
        path: 'transactions/new',
        element: <NewTransactionPage />,
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
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);