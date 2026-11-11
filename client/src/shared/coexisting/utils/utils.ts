export const getTypeStyle = (typeName: number) => {
    if (typeName === 3) return "bg-red-100 text-red-700";
    if (typeName === 2) return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
};