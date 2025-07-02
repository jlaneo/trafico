import React, { useState, useEffect } from 'react';
import { Settings, NotificationType } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';
import { BellAlertIcon } from './icons/BellAlertIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { DevicePhoneMobileIcon } from './icons/DevicePhoneMobileIcon';


interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: Settings;
    onSave: (newSettings: Settings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
    const [currentSettings, setCurrentSettings] = useState<Settings>(settings);

    useEffect(() => {
        setCurrentSettings(settings);
    }, [settings, isOpen]);

    const handleSave = () => {
        onSave(currentSettings);
        onClose();
        if (currentSettings.notificationType === NotificationType.PUSH && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    };
    
    if (!isOpen) return null;

    const notificationOptions = [
        { id: NotificationType.PUSH, label: 'Push', icon: BellAlertIcon },
        { id: NotificationType.EMAIL, label: 'Email', icon: PaperAirplaneIcon },
        { id: NotificationType.SMS, label: 'SMS', icon: DevicePhoneMobileIcon },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-5 border-b border-neutral-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-neutral-800">Configuración</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-neutral-400 hover:bg-neutral-200/60">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label htmlFor="notificationTime" className="block text-sm font-medium text-neutral-700 mb-1">
                            Hora de la consulta automática
                        </label>
                        <input
                            type="time"
                            id="notificationTime"
                            value={currentSettings.notificationTime}
                            onChange={(e) => setCurrentSettings({ ...currentSettings, notificationTime: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                        />
                         <p className="text-xs text-neutral-500 mt-1">Una tarea automática (simulada) consultará el tráfico a esta hora.</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-neutral-700 mb-2">Canal de notificación</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                             {notificationOptions.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setCurrentSettings({ ...currentSettings, notificationType: id })}
                                    className={`flex flex-col items-center justify-center p-3 border rounded-md text-sm transition-all ${
                                        currentSettings.notificationType === id
                                            ? 'bg-neutral-100 border-neutral-500 text-neutral-800 ring-1 ring-neutral-500'
                                            : 'bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-100/50'
                                    }`}
                                >
                                    <Icon className="h-5 w-5 mb-1.5"/>
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-neutral-500 mt-2">
                            {currentSettings.notificationType !== NotificationType.PUSH && 'Email y SMS son demostrativos y no enviarán notificaciones reales.'}
                            {currentSettings.notificationType === NotificationType.PUSH && Notification.permission !== 'granted' && 'Las notificaciones push requieren tu permiso.'}
                            {currentSettings.notificationType === NotificationType.PUSH && Notification.permission === 'granted' && 'Las notificaciones push están activadas.'}
                         </p>
                    </div>
                </div>
                 <div className="px-6 py-4 bg-neutral-50 rounded-b-lg flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md shadow-sm hover:bg-neutral-100">
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-neutral-800 border border-transparent rounded-md shadow-sm hover:bg-neutral-700">
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;