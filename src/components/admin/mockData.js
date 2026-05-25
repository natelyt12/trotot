// Sample Mock KYC Requests
export const INITIAL_KYC_REQUESTS = [
    {
        id: 'kyc-mock-1',
        full_name: 'Phạm Minh Đức',
        email: 'duc.pm@gmail.com',
        phone: '0966554433',
        submitted_at: '2026-05-23',
        document_id: '001096012345',
        doc_front: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&w=400&q=80',
        doc_house: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 'kyc-mock-2',
        full_name: 'Hoàng Thu Trang',
        email: 'trang.ht@yahoo.com',
        phone: '0904123987',
        submitted_at: '2026-05-22',
        document_id: '038192004567',
        doc_front: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=80',
        doc_house: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80'
    }
];

export const getRandomDistrictAndWard = () => {
    const districts = ["Quận Cầu Giấy", "Quận Đống Đa", "Quận Hai Bà Trưng"];
    const wards = ["Phường Dịch Vọng Hậu", "Phường Láng Thượng", "Phường Bách Khoa"];
    const idx = Math.floor(Math.random() * districts.length);
    return { district: districts[idx], ward: wards[idx] };
};
