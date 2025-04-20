import React from 'react';
import { FiActivity, FiUsers, FiShoppingBag, FiMapPin } from 'react-icons/fi';

const DashboardPage = () => {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Résumé des statistiques */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Carte de statistique - Ventes du jour */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiShoppingBag className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Ventes du jour
                    </dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">
                        €12,594
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="/sales" className="font-medium text-blue-600 hover:text-blue-500">
                  Voir les détails
                </a>
              </div>
            </div>
          </div>

          {/* Carte de statistique - Commerciaux actifs */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiUsers className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Commerciaux actifs
                    </dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">
                        7 / 12
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="/team" className="font-medium text-blue-600 hover:text-blue-500">
                  Voir l'équipe
                </a>
              </div>
            </div>
          </div>

          {/* Carte de statistique - Visites du jour */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiMapPin className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Visites du jour
                    </dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">
                        23
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="/map" className="font-medium text-blue-600 hover:text-blue-500">
                  Voir la carte
                </a>
              </div>
            </div>
          </div>

          {/* Carte de statistique - Performance */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiActivity className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Performance hebdo.
                    </dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">
                        +12%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="/sales" className="font-medium text-blue-600 hover:text-blue-500">
                  Voir les rapports
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Message d'information */}
        <div className="rounded-md bg-blue-50 p-4 mt-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Bienvenue sur Fromage Tracker
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Cette application est en cours de développement. Les données affichées sont actuellement simulées.
                  Vous pouvez explorer les différentes fonctionnalités en utilisant le menu de navigation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Espace réservé pour de futurs graphiques */}
        <div className="mt-8 bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-medium text-gray-900">Ventes par produit</h2>
          <div className="mt-4 h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">Graphique de ventes à venir</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;