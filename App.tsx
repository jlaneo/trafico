import React, { useState, useEffect, useCallback } from 'react';
import { Route, TrafficInfo, Settings, NotificationType } from './types';
import RouteCard from './components/RouteCard';
import AddRouteModal from './components/AddRouteModal';
import SettingsModal from './components/SettingsModal';
import { PlusIcon } from './components/icons/PlusIcon';
import { Cog6ToothIcon } from './components/icons/Cog6ToothIcon';

const App: React.FC = () => {
    const [routes, setRoutes] = useState<Route[]>(() => {
        const savedRoutes = localStorage.getItem('trafficAppRoutes');
        return savedRoutes ? JSON.parse(savedRoutes) : [
             { id: '1', name: 'Al trabajo', origin: 'Avenida de Oporto 71, Madrid', destination: 'Calle de los Llanos de Jerez, 14, Coslada' },
             { id: '2', name: 'A casa', origin: 'Calle de los Llanos de Jerez, 14, Coslada', destination: 'Avenida de Oporto 71, Madrid' },
        ];
    });

    const [trafficData, setTrafficData] = useState<Record<string, TrafficInfo | undefined>>({});
    const [settings, setSettings] = useState<Settings>(() => {
        const savedSettings = localStorage.getItem('trafficAppSettings');
        return savedSettings ? JSON.parse(savedSettings) : {
            notificationTime: '06:45',
            notificationType: NotificationType.PUSH,
        };
    });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('trafficAppRoutes', JSON.stringify(routes));
    }, [routes]);

    useEffect(() => {
        localStorage.setItem('trafficAppSettings', JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        if (settings.notificationType === NotificationType.PUSH && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, [settings.notificationType]);

    const addRoute = (newRoute: Omit<Route, 'id'>) => {
        setRoutes(prev => [...prev, { ...newRoute, id: Date.now().toString() }]);
        setIsAddModalOpen(false);
    };

    const deleteRoute = (id: string) => {
        setRoutes(prev => prev.filter(route => route.id !== id));
        setTrafficData(prev => {
            const newData = { ...prev };
            delete newData[id];
            return newData;
        });
    };
    
    const updateTrafficInfo = useCallback((routeId: string, info: TrafficInfo) => {
        setTrafficData(prev => ({
            ...prev,
            [routeId]: info,
        }));
    }, []);

    return (
        <div className="min-h-screen bg-neutral-100">
            <header className="bg-white/80 backdrop-blur-lg border-b border-neutral-200/80 sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-neutral-800">Asistente de Tráfico</h1>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsSettingsModalOpen(true)}
                            className="p-2 rounded-full text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-700 transition-colors"
                            aria-label="Configuración"
                        >
                            <Cog6ToothIcon className="h-6 w-6" />
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center bg-neutral-800 text-white font-medium px-4 py-2 rounded-lg hover:bg-neutral-700 transition-colors text-sm"
                        >
                            <PlusIcon className="h-4 w-4 mr-1.5" />
                            Añadir Ruta
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {routes.length === 0 ? (
                    <div className="text-center py-16 px-6 bg-white rounded-lg border border-neutral-200/80">
                        <h2 className="text-xl font-semibold text-neutral-700">Aún no tienes rutas guardadas</h2>
                        <p className="text-neutral-500 mt-2">¡Añade tu primera ruta para empezar a monitorear el tráfico!</p>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="mt-6 flex items-center mx-auto bg-neutral-800 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-neutral-700 transition-colors"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Añadir mi primera ruta
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {routes.map(route => (
                            <RouteCard
                                key={route.id}
                                route={route}
                                trafficInfo={trafficData[route.id]}
                                onDelete={deleteRoute}
                                onUpdateTrafficInfo={updateTrafficInfo}
                                settings={settings}
                            />
                        ))}
                    </div>
                )}
            </main>

            <AddRouteModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddRoute={addRoute}
            />

            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                settings={settings}
                onSave={setSettings}
            />
        </div>
    );
};

export default App;