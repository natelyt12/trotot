/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext } from 'react';
import { useRoomFilter } from '../hooks/useRoomFilter';

const RoomFilterContext = createContext(null);

export const RoomFilterProvider = ({ children }) => {
    const filterState = useRoomFilter();

    return (
        <RoomFilterContext.Provider value={filterState}>
            {children}
        </RoomFilterContext.Provider>
    );
};

export const useRoomFilterContext = () => {
    const context = useContext(RoomFilterContext);
    if (!context) {
        throw new Error('useRoomFilterContext must be used within a RoomFilterProvider');
    }
    return context;
};
