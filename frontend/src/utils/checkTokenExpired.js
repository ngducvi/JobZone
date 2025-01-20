function CheckTokenExpired(token) {
    if (!token) return true; // Nếu không có token thì coi như hết hạn

    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    const decodedPayload = JSON.parse(window.atob(base64));

    const currentTime = Math.floor(Date.now() / 1000); 
    return decodedPayload.exp < currentTime; 
}

export default  CheckTokenExpired;