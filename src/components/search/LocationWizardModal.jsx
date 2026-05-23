import React, { useState, useMemo, useEffect } from 'react';
import AppIcon from '../common/AppIcon.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { UNIVERSITIES } from '../../constants/universities.js';
import { PROVINCE } from '../../constants/province.js';
import { useRoomFilterContext } from '../../context/RoomFilterContext.jsx';

export default function LocationWizardModal({ isOpen, onClose }) {
    const { updateFilter } = useRoomFilterContext();
    // Steps: 'uni', 'city', 'district', 'ward'
    const [step, setStep] = useState('uni');

    // Internal state for the wizard
    const [tempCity, setTempCity] = useState('');
    const [tempDistrict, setTempDistrict] = useState('');

    // Search query for lists
    const [searchQuery, setSearchQuery] = useState('');

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Reset wizard when closed
    const handleClose = () => {
        setStep('uni');
        setTempCity('');
        setTempDistrict('');
        setSearchQuery('');
        onClose();
    };

    const handleUniSelect = (uniName) => {
        updateFilter({ university: uniName, search: '' });
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
        updateFilter({
            city: tempCity,
            district: tempDistrict,
            ward: wardName,
            university: '', // Explicitly clear university when choosing a custom location
            search: ''
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

    const renderStepContent = () => {
        switch (step) {
            case 'uni':
                return (
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => { setStep('city'); setSearchQuery(''); }}
                            className="flex items-center justify-between p-4 bg-amber-50 hover:bg-amber-100 rounded-xl mb-3 transition-colors border border-amber-200/50 text-left group cursor-pointer"
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
                                className="flex items-center gap-3 p-3 hover:bg-stone-50 rounded-xl transition-colors text-left w-full group cursor-pointer border-none bg-transparent"
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
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-200 flex items-end sm:items-center justify-center">
                    {/* Backdrop - No blur, just dark */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-stone-900/60"
                        onClick={handleClose}
                    />

                    {/* Modal Content - Slide up with expoOut */}
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
                        className="relative w-full max-w-[500px] bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden mt-auto sm:mt-0"
                        style={{ maxHeight: '92vh' }}
                    >
                        {/* Drag Handle Bar (Visual only) */}
                        <div className="flex justify-center py-3 shrink-0 sm:hidden">
                            <div className="w-12 h-1.5 bg-stone-300 rounded-full" />
                        </div>

                        <div className="flex flex-col max-h-[85vh] sm:max-h-[600px] overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-stone-100 shrink-0">
                                <div className="flex items-center gap-3">
                                    {step !== 'uni' && (
                                        <button
                                            onClick={() => {
                                                if (step === 'city') setStep('uni');
                                                if (step === 'district') setStep('city');
                                                if (step === 'ward') setStep('district');
                                                setSearchQuery('');
                                            }}
                                            className="p-2 hover:bg-stone-100 rounded-full transition-colors cursor-pointer border-none bg-transparent"
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
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => {
                                            setStep('uni');
                                            setTempCity('');
                                            setTempDistrict('');
                                            setSearchQuery('');
                                            updateFilter({ university: '', city: '', district: '', ward: '', search: '' });
                                        }}
                                        className="bg-transparent border-none text-amber-600 text-sm font-semibold cursor-pointer hover:text-amber-700 transition-colors duration-200"
                                    >
                                        Xóa tất cả
                                    </button>
                                    <button onClick={handleClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors cursor-pointer border-none bg-transparent">
                                        <AppIcon name="close" size={20} className="text-stone-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Search Input */}
                            <div className="px-4 py-2">
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
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

/* --- Sub-components for cleaner UI --- */

function LocationItem({ label, onClick, isPrimary = false, hasChevron = false }) {
    return (
        <button
            onClick={onClick}
            className={`p-4 hover:bg-stone-50 rounded-xl transition-colors text-left w-full text-sm font-semibold border-b border-stone-50 last:border-0 flex justify-between items-center group cursor-pointer border-none ${isPrimary ? 'bg-stone-50 text-amber-600 font-bold mb-2' : 'text-stone-800'
                }`}
        >
            <span>{label}</span>
            {(hasChevron || isPrimary) && (
                <AppIcon name="chevronRight" size={16} className={isPrimary ? "text-amber-500" : "text-stone-300 group-hover:text-amber-500"} />
            )}
        </button>
    );
}
