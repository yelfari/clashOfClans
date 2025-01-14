// api.js
async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
  }
}

export async function fetchClanWarData() {
    return fetchData('/clanwar', { credentials: 'include' });
}

export async function checkLoginStatus() {
    return fetchData('/checkLogin', { method: 'GET', credentials: 'include' });
}

export async function getLoginInformation(username, password) {
    return fetchData('/loginInformation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password }),
        credentials: 'include'
    });
}

export async function handleLogout() {
    try {
        const response = await fetch('/logout', {
          method: 'POST',
          credentials: 'include'
        });
  
        if (!response.ok) {
           throw new Error(`Logout failed: ${response.status}`);
        }
        const data = await response.json();
        return data.success; // Expecting { success: true } from backend

      } catch(error) {
        console.error('Error during logout:', error);
        throw error;
      }
}