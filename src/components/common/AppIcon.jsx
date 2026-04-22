import {
    TbAirConditioning,
    TbBed,
    TbBath,
    TbWifi,
    TbParking,
    TbFridge,
    TbToolsKitchen,
    TbToiletPaper,
    TbMapPin,
    TbPhoto,
    TbChecks,
    TbHanger,
    TbChevronLeft,
    TbChevronRight,
    TbCreditCard,
    TbListCheck,
    TbShieldCheck,
    TbMap2,
    TbMessageCircle,
    TbCheck,
    TbX,
    TbPhone,
    TbAlertTriangle,
    TbMessages,
    TbCurrencyDollar,
    TbMaximize,
    TbUsers,
    TbHeart,
    TbShare,
    TbSearch,
    TbFilter,
    TbMenu2,
    TbUser,
    TbSmartHome,
    TbClock
} from 'react-icons/tb';
import { PiWashingMachine } from "react-icons/pi";

/**
 * Centralized Icon Management
 * Usage: <AppIcon name="bed" size={20} />
 */
const ICON_MAP = {
    // Amenities
    bed: TbBed,
    air_conditioner: TbAirConditioning,
    fridge: TbFridge,
    wardrobe: TbHanger,
    kitchen: TbToolsKitchen,
    washing_machine: PiWashingMachine,
    wifi: TbWifi,
    toilet_paper: TbToiletPaper,

    // Stats & Info
    price: TbCurrencyDollar,
    area: TbMaximize,
    occupants: TbUsers,
    address: TbMapPin,
    verified: TbChecks,
    photo: TbPhoto,
    map: TbMap2,
    clock: TbClock,
    parking: TbParking,
    bathroom: TbBath,

    // Navigation & Actions
    chevronLeft: TbChevronLeft,
    chevronRight: TbChevronRight,
    search: TbSearch,
    filter: TbFilter,
    menu: TbMenu2,
    user: TbUser,
    home: TbSmartHome,
    heart: TbHeart,
    share: TbShare,
    phone: TbPhone,
    messages: TbMessages,
    alert: TbAlertTriangle,
    check: TbCheck,
    x: TbX,

    // Section headers
    'credit-card': TbCreditCard,
    'check-square': TbListCheck,
    'shield': TbShieldCheck,
    'message-circle': TbMessageCircle,
};

export default function AppIcon({ name, size = 18, color = 'currentColor', strokeWidth = 2, style, className, ...props }) {
    const IconComponent = ICON_MAP[name];

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found in ICON_MAP`);
        return null;
    }

    return (
        <IconComponent
            size={size}
            color={color}
            strokeWidth={strokeWidth}
            style={style}
            className={`shrink-0 ${className || ''}`}
            {...props}
        />
    );
}
