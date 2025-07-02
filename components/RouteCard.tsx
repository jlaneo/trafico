import React, { useState, useCallback, useMemo } from 'react';
import { Route, TrafficInfo, Settings, NotificationType, TrafficComparisonInfo } from '../types';
import { getTrafficInfo } from '../services/geminiService';
import { TrashIcon } from './icons/TrashIcon';
import { ClockIcon } from './icons/ClockIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import Spinner from './Spinner';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface RouteCardProps {
    route: Route;
    trafficInfo?: TrafficInfo;
    onDelete: (id: string) => void;
    onUpdateTrafficInfo: (routeId: string, info: TrafficInfo) => void;
    settings: Settings;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, trafficInfo, onDelete, onUpdateTrafficInfo, settings }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

    const handleCheckTraffic = useCallback(async () => {
        setIsLoading(true);
        setIsDetailsExpanded(false); // Reset details view on new check
        const comparisons = await getTrafficInfo(route.origin, route.destination);

        if (comparisons && comparisons.length > 0) {
            const sortedComparisons = [...comparisons].sort((a, b) => {
                const timeA = parseInt(a.estimatedTime) || 999;
                const timeB = parseInt(b.estimatedTime) || 999;
                return timeA - timeB;
            });
            const bestRoute = sortedComparisons[0];

            const newTrafficInfo: TrafficInfo = {
                estimatedTime: bestRoute.estimatedTime,
                incidents: bestRoute.incidents,
                lastChecked: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                comparisons: comparisons,
            };
            onUpdateTrafficInfo(route.id, newTrafficInfo);

            if (settings.notificationType === NotificationType.PUSH && Notification.permission === 'granted') {
                 const notificationBody = `Ruta óptima (${bestRoute.via}): ${bestRoute.estimatedTime}. ${bestRoute.incidents.length > 0 ? 'Hay incidencias.' : 'Sin incidencias.'}`;
                new Notification(`Tráfico para: ${route.name}`, {
                    body: notificationBody,
                });
            }

        } else {
            const errorInfo: TrafficInfo = {
                estimatedTime: "Error",
                incidents: ["No se pudo obtener la comparativa de rutas."],
                lastChecked: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                comparisons: [],
            };
            onUpdateTrafficInfo(route.id, errorInfo);
        }

        setIsLoading(false);
    }, [route, onUpdateTrafficInfo, settings]);

    const isOptimal = useCallback((comp: TrafficComparisonInfo) => trafficInfo && trafficInfo.estimatedTime === comp.estimatedTime, [trafficInfo]);

    const optimalComparison = useMemo(() => {
        if (!trafficInfo || !trafficInfo.comparisons) return null;
        return trafficInfo.comparisons.find(isOptimal) || null;
    }, [trafficInfo, isOptimal]);

    return (
        <div className="bg-white rounded-lg border border-neutral-200/80 shadow-sm flex flex-col">
            <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-semibold text-neutral-800">{route.name}</h3>
                    <button onClick={() => onDelete(route.id)} className="text-neutral-400 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1">
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-2 text-sm text-neutral-600 mb-4">
                    <div className="flex items-start">
                        <MapPinIcon className="h-4 w-4 mt-0.5 mr-2 text-green-500 flex-shrink-0" />
                        <span className="truncate">{route.origin}</span>
                    </div>
                    <div className="flex items-start">
                        <MapPinIcon className="h-4 w-4 mt-0.5 mr-2 text-red-500 flex-shrink-0" />
                        <span className="truncate">{route.destination}</span>
                    </div>
                </div>

                {trafficInfo && (
                    <div className="py-4 border-t border-neutral-200/80">
                         <div className="flex items-center text-2xl font-bold text-green-600">
                            <ClockIcon className="h-6 w-6 mr-2" />
                            <span>{trafficInfo.estimatedTime}</span>
                        </div>
                        {trafficInfo.incidents.length > 0 ? (
                            <div className="mt-2 space-y-1">
                                <h4 className="font-semibold text-amber-600 text-sm">Incidencias (Ruta Óptima):</h4>
                                <ul className="list-disc list-inside text-sm text-amber-700">
                                    {trafficInfo.incidents.map((inc, index) => <li key={index}>{inc}</li>)}
                                </ul>
                            </div>
                        ) : (
                             <p className="mt-2 text-sm text-green-700">No se han encontrado incidencias en la ruta óptima.</p>
                        )}

                        {optimalComparison && (
                             <div className="mt-3">
                                <button onClick={() => setIsDetailsExpanded(!isDetailsExpanded)} className="flex items-center text-sm font-medium text-neutral-600 hover:text-neutral-800">
                                    <span>Ver ruta detallada</span>
                                    <ChevronDownIcon className={`h-5 w-5 ml-1 transition-transform ${isDetailsExpanded ? 'rotate-180' : ''}`} />
                                </button>
                                {isDetailsExpanded && (
                                    <div className="mt-2 p-3 bg-neutral-50 rounded-md border border-neutral-200/80">
                                        <p className="text-sm text-neutral-700 whitespace-pre-wrap">{optimalComparison.detailedExplanation}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {trafficInfo.comparisons && trafficInfo.comparisons.length > 0 && (
                             <div className="mt-4">
                                <h4 className="font-semibold text-neutral-700 mb-2 text-sm">Comparativa de Rutas</h4>
                                <ul className="space-y-2">
                                    {trafficInfo.comparisons.map((comp, index) => (
                                        <li key={index} className={`p-3 rounded-md ${ isOptimal(comp) ? 'bg-green-50 border border-green-300' : 'bg-neutral-100 border border-neutral-200/80'}`}>
                                            <div className="flex justify-between items-center font-semibold text-neutral-800">
                                                <span>{comp.via}</span>
                                                <div className="flex items-center space-x-3 text-sm">
                                                    <span>{comp.distance}</span>
                                                    <span className={`font-bold ${isOptimal(comp) ? 'text-green-700' : ''}`}>{comp.estimatedTime}</span>
                                                </div>
                                            </div>
                                            {comp.incidents.length > 0 && (
                                                <ul className="list-disc list-inside text-xs text-amber-700 mt-1.5 pl-1">
                                                    {comp.incidents.map((inc, i) => <li key={i}>{inc}</li>)}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-neutral-200/80 mt-auto">
                 <button
                    onClick={handleCheckTraffic}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center bg-neutral-800 text-white font-semibold px-4 py-2 rounded-lg hover:bg-neutral-700 transition-colors shadow-sm disabled:bg-neutral-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Spinner />
                            Consultando...
                        </>
                    ) : (
                        <>
                           <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                           Consultar Tráfico Ahora
                        </>
                    )}
                </button>
                {trafficInfo && (
                    <p className="text-xs text-neutral-400 mt-3 text-center">
                        Última consulta: {trafficInfo.lastChecked}
                    </p>
                )}
            </div>
        </div>
    );
};

export default RouteCard;
