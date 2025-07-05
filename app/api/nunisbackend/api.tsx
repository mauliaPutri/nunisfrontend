// import forge from 'node-forge';

// const keyWord = 'coba';

// const generateKeyPair = (keyword: string) => {
//   const seed = forge.md.sha256.create().update(keyword).digest().getBytes();
//   const prng = forge.random.createInstance();
//   prng.seedFileSync = () => seed;

//   return forge.pki.rsa.generateKeyPair({
//     bits: 2048,
//     e: 0x10001,
//     prng: prng,
//   });
// };

// export function decryptText(encryptedText: string): string {
//   try {
//     const keyPair = generateKeyPair(keyWord!.toString());
//     const decoded = forge.util.decode64(encryptedText);
//     return keyPair.privateKey.decrypt(decoded, 'RSA-OAEP');
//   } catch (error) {
//     console.error('Dekripsi gagal:', error);
//     return 'Gagal mendekripsi. Pastikan teks terenkripsi dan kata kunci benar.';
//   }
// }

// const api_url = "https://nunisbackend-production.up.railway.app/api"; //baru ya
const api_url = "https://nunisbackendbaru-production.up.railway.app/api"; //baru tapi lama
// const api_url = "https://powerful-communication-production.up.railway.app/api"; // lama
// const api_url = "http://192.168.58.198:8000/api";
// export const api_url = decryptText(api_base_url);

export const API_ENDPOINTS = {
  CATEGORIES: `${api_url}/categories`,
  DELETE_CATEGORY: (id: string) => `${api_url}/categories/${id}`,
  CONTACT: `${api_url}/contact`,
  STATISTICS: `${api_url}/statistics`,
  TRANSAKSI_DATE_RANGE: `${api_url}/transaksi-date-range`,
  MENU_ITEMS: `${api_url}/menu-items`,
  ADD_MENU_ITEMS: `${api_url}/addmenuitems`,
  DELETE_MENU_ITEM: (kode_menu: string) =>
    `${api_url}/menu-items/${kode_menu}`,
  CATEGORY_MENU_ITEMS: (categoryId: string) => `${api_url}/categories/${categoryId}/menu-items`,
  DELETE_CONTACT: (id: string) => `${api_url}/contact/${id}`,
  ALL_TRANSAKSI: `${api_url}/alltransaksi`,
  GET_USER: `${api_url}/getUser`,
  UPDATE_USER_STATUS: (email: string) => `${api_url}/update-user-status/${email}`,
  DELETE_USER: (id: string) => `${api_url}/deleteuser/${id}`,
  USER: (email: string) => `${api_url}/user/${email}`,
  TRANSAKSI_WITH_DETAILS: (userId: string, start?: string) =>
    `${api_url}/transaksi/${userId}/with-details${
      start ? `?start_date=${start}` : ""
    }`,
  TRANSAKSI: `${api_url}/transaksi`,
  UPLOAD_PROFILE_PICTURE: `${api_url}/upload-profile-picture`,
  LOGIN: `${api_url}/login`,
  REGISTER: `${api_url}/register`,
  ADD_CATEGORY: `${api_url}/categoriesAdd`,
  EDIT_CATEGORY: `${api_url}/editcategories`,
  EDIT_MENU: `${api_url}/editmenu`,
  ALL_MENU: `${api_url}/allmenu`,
  UPDATE_USER_PROFILE: `${api_url}/update-user-profile`,
  UPDATE_STATUS_BY_FAKTUR: `${api_url}/update-status-by-faktur`,
  STATISTICS_BY_DATE: `${api_url}/statistics-by-date`,
  MENU_TERLARIS: `${api_url}/menu-terlaris`,

  FORGOT_PASSWORD: (email: string) => `${api_url}/forgot-password/${email}`,
  VERIFY_OTP: `${api_url}/verify-otp`,
  RESET_PASSWORD: `${api_url}/reset-password`,
};