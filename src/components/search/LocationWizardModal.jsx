import React, { useState, useMemo } from 'react';
import AppIcon from '../common/AppIcon.jsx';
import { UNIVERSITIES } from '../../data/universities.js';
import { PROVINCE } from '../../data/province.js';

export default function LocationWizardModal({ isOpen, onClose, onComplete }) {
    // Steps: 'uni', 'city', 'district', 'ward'
    const [step, setStep] = useState('uni');

    // Internal state for the wizard
    const [tempUni, setTempUni] = useState('');
    const [tempCity, setTempCity] = useState('');
    const [tempDistrict, setTempDistrict] = useState('');

    // Search query for lists
    const [searchQuery, setSearchQuery] = useState('');



    // Reset wizard when closed
    const handleClose = () => {
        setStep('uni');
        setTempUni('');
        setTempCity('');
        setTempDistrict('');
        setSearchQuery('');
        onClose();
    };

    const handleUniSelect = (uniName) => {
        onComplete({ university: uniName });
        handleClose();
    };

    const handleCitySelect = (cityName) => {
        setTempCity(cityName);
        setSearchQuery('');
        setStep('district');
    };

    const handleDistrictSelect = (districtName) => {
        setTempDistrict(districtName);
        setSearchQuery('');
        setStep('ward');
    };

    const handleWardSelect = (wardName) => {
        onComplete({
            city: tempCity,
            district: tempDistrict,
            ward: wardName,
            university: '' // Explicitly clear university when choosing a custom location
        });
        handleClose();
    };

    // Filtered lists based on search query
    const filteredUnis = useMemo(() => {
        if (!searchQuery) return UNIVERSITIES;
        const q = searchQuery.toLowerCase();
        return UNIVERSITIES.filter(u =>
            u.name.toLowerCase().includes(q) ||
            (u.aliases && u.aliases.some(a => a.toLowerCase().includes(q)))
        );
    }, [searchQuery]);

    const activeDistricts = useMemo(() => {
        if (!tempCity) return [];
        return PROVINCE.find(p => p.name === tempCity)?.districts || [];
    }, [tempCity]);

    const activeWards = useMemo(() => {
        if (!tempDistrict) return [];
        return activeDistricts.find(d => d.name === tempDistrict)?.wards || [];
    }, [tempDistrict, activeDistricts]);

    const filteredCities = PROVINCE.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredDistricts = activeDistricts.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredWards = activeWards.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!isOpen) return null;

    const renderStepContent = () => {
        switch (step) {
            case 'uni':
                return (
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => { setStep('city'); setSearchQuery(''); }}
                            className="flex items-center justify-between p-4 bg-amber-50 hover:bg-amber-100 rounded-xl mb-3 transition-colors border border-amber-200/50 text-left group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                    <AppIcon name="location" size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-amber-900">Tôi không tìm gần trường ĐH</div>
                                    <div className="text-xs text-amber-700 mt-0.5">Tìm theo Tỉnh/Thành, Quận/Huyện</div>
                                </div>
                            </div>
                            <AppIcon name="chevronRight" size={18} className="text-amber-500" />
                        </button>

                        <div className="px-2 pb-2 pt-1 text-xs font-bold text-stone-400 uppercase tracking-wider">
                            Hoặc chọn trường Đại học
                        </div>

                        {filteredUnis.map((uni, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleUniSelect(uni.name)}
                                className="flex items-center gap-3 p-3 hover:bg-stone-50 rounded-xl transition-colors text-left w-full group"
                            >
                                <div className="w-8 h-8 bg-stone-100 text-stone-500 rounded-lg flex items-center justify-center group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                                    <AppIcon name="bookmark" size={16} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-semibold text-stone-800">{uni.name}</div>
                                    <div className="text-xs text-stone-500 mt-0.5">{uni.district}, {uni.city}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                );

            case 'city':
                return (
                    <div className="flex flex-col gap-1">
                        {filteredCities.map((city, idx) => (
                            <LocationItem key={idx} label={city.name} onClick={() => handleCitySelect(city.name)} />
                        ))}
                    </div>
                );

            case 'district':
                return (
                    <div className="flex flex-col gap-1">
                        <LocationItem
                            label={`Tìm toàn ${tempCity}`}
                            isPrimary
                            onClick={() => handleWardSelect('')}
                        />
                        {filteredDistricts.map((district, idx) => (
                            <LocationItem
                                key={idx}
                                label={district.name}
                                hasChevron
                                onClick={() => handleDistrictSelect(district.name)}
                            />
                        ))}
                    </div>
                );

            case 'ward':
                return (
                    <div className="flex flex-col gap-1">
                        <LocationItem
                            label={`Tìm toàn ${tempDistrict}`}
                            isPrimary
                            onClick={() => handleWardSelect('')}
                        />
                        {filteredWards.map((ward, idx) => (
                            <LocationItem key={idx} label={ward.name} onClick={() => handleWardSelect(ward.name)} />
                        ))}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-stone-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full sm:w-[500px] sm:rounded-2xl rounded-t-2xl h-[85vh] sm:h-[600px] flex flex-col overflow-hidden shadow-2xl transition-transform transform translate-y-0">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                        {step !== 'uni' && (
                            <button
                                onClick={() => {
                                    if (step === 'city') setStep('uni');
                                    if (step === 'district') setStep('city');
                                    if (step === 'ward') setStep('district');
                                    setSearchQuery('');
                                }}
                                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                            >
                                <AppIcon name="arrowLeft" size={20} className="text-stone-700" />
                            </button>
                        )}
                        <h3 className={`font-bold text-lg text-stone-900 ${step == 'uni' && 'ml-3'}`}>
                            {step === 'uni' && 'Bạn muốn tìm trọ ở đâu?'}
                            {step === 'city' && 'Chọn Tỉnh / Thành phố'}
                            {step === 'district' && `Quận/Huyện tại ${tempCity}`}
                            {step === 'ward' && `Phường/Xã tại ${tempDistrict}`}
                        </h3>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                        <AppIcon name="close" size={20} className="text-stone-500" />
                    </button>
                </div>

                {/* Search Input */}
                <div className="p-4 border-b border-stone-100">
                    <div className="relative">
                        <AppIcon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={
                                step === 'uni' ? "Tìm nhanh tên trường đại học..." :
                                    step === 'city' ? "Nhập tên thành phố..." :
                                        "Tìm kiếm..."
                            }
                            className="w-full bg-stone-100 border-none py-3 pl-10 pr-4 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-2">
                    {renderStepContent()}
                </div>
            </div>
        </div>
    );
}

/* --- Sub-components for cleaner UI --- */

function LocationItem({ label, onClick, isPrimary = false, hasChevron = false }) {
    return (
        <button
            onClick={onClick}
            className={`p-4 hover:bg-stone-50 rounded-xl transition-colors text-left w-full text-sm font-semibold border-b border-stone-50 last:border-0 flex justify-between items-center group ${isPrimary ? 'bg-stone-50 text-amber-600 font-bold mb-2' : 'text-stone-800'
                }`}
        >
            <span>{label}</span>
            {(hasChevron || isPrimary) && (
                <AppIcon name="chevronRight" size={16} className={isPrimary ? "text-amber-500" : "text-stone-300 group-hover:text-amber-500"} />
            )}
        </button>
    );
}
