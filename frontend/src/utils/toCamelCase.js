export const toCamelCase = (str) => {
    const words = str.split('/').filter(word => word !== ''); // Split by / and filter out empty strings
    return words
        .map((word, index) => {
            if (index === 0) {
                return word;
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join('');
}

