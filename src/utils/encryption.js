// Simple encryption/decryption for API keys
// Note: This is basic encryption for local storage. For production, use more secure methods.

const ENCRYPTION_KEY = 'celestial-sphere-key';

export const encrypt = (text) => {
    try {
        const textToChars = text => text.split('').map(c => c.charCodeAt(0));
        const byteHex = n => ("0" + Number(n).toString(16)).substr(-2);
        const applySaltToChar = code => textToChars(ENCRYPTION_KEY).reduce((a,b) => a ^ b, code);

        return text
            .split('')
            .map(textToChars)
            .map(applySaltToChar)
            .map(byteHex)
            .join('');
    } catch (error) {
        console.error('Encryption error:', error);
        return text;
    }
};

export const decrypt = (encoded) => {
    try {
        const textToChars = text => text.split('').map(c => c.charCodeAt(0));
        const applySaltToChar = code => textToChars(ENCRYPTION_KEY).reduce((a,b) => a ^ b, code);
        
        return encoded
            .match(/.{1,2}/g)
            .map(hex => parseInt(hex, 16))
            .map(applySaltToChar)
            .map(charCode => String.fromCharCode(charCode))
            .join('');
    } catch (error) {
        console.error('Decryption error:', error);
        return encoded;
    }
};
