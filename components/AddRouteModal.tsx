import React, { useState } from 'react';
import { Route } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface AddRouteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddRoute: (route: Omit<Route, 'id'>) => void;
}

const AddRouteModal: React.FC<AddRouteModalProps> = ({ isOpen, onClose, onAddRoute }) => {
    const [name, setName] = useState('');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !origin || !destination) {
            setError('Todos los campos son obligatorios.');
            return;
        }
        onAddRoute({ name, origin, destination });
        setName('');
        setOrigin('');
        setDestination('');
        setError('');
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-5 border-b border-neutral-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-neutral-800">Añadir Nueva Ruta</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-neutral-400 hover:bg-neutral-200/60">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {error && <p className="text-red-600 text-sm bg-red-100 p-3 rounded-md">{error}</p>}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">Nombre de la ruta</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej: Viaje a la oficina"
                                className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                            />
                        </div>
                        <div>
                            <label htmlFor="origin" className="block text-sm font-medium text-neutral-700 mb-1">Origen</label>
                            <input
                                type="text"
                                id="origin"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                placeholder="Ej: Avenida de Oporto 71, Madrid"
                                className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                            />
                        </div>
                        <div>
                            <label htmlFor="destination" className="block text-sm font-medium text-neutral-700 mb-1">Destino</label>
                            <input
                                type="text"
                                id="destination"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                placeholder="Ej: Calle de los Llanos de Jerez, 14, Coslada"
                                className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                            />
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-neutral-50 rounded-b-lg flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md shadow-sm hover:bg-neutral-100">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-neutral-800 border border-transparent rounded-md shadow-sm hover:bg-neutral-700">
                            Añadir Ruta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddRouteModal;