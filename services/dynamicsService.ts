
import { SavedProject, UserAccount } from '../types';
import * as fb from './firebaseService';

/**
 * Cloud Sync Service
 * Nu gekoppeld aan Firebase voor echte cloud opslag.
 */

const fetchDynamicsProjects = async (): Promise<SavedProject[]> => {
  try {
    return await fb.fetchProjectsFromCloud();
  } catch (e) {
    console.error("Firebase Fetch Fout:", e);
    return [];
  }
};

const syncProjectToDynamics = async (projectData: SavedProject) => {
  try {
    await fb.saveProjectToCloud(projectData);
    return { success: true };
  } catch (e) {
    console.error("Firebase Sync Fout:", e);
    throw e;
  }
};

const fetchDynamicsUsers = async (): Promise<UserAccount[]> => {
  // In een echte app zouden we gebruikers ook uit Firestore halen.
  // Voor nu houden we de lokale lijst aan als fallback.
  const cloudData = localStorage.getItem(`vakman_cloud_users`);
  return cloudData ? JSON.parse(cloudData) : [];
};

const syncUsersToDynamics = async (users: UserAccount[]) => {
  localStorage.setItem(`vakman_cloud_users`, JSON.stringify(users));
  return { success: true };
};

const searchDynamicsAccounts = async (query: string) => {
  return [
    { id: '1', name: 'Woningstichting Baarn', address: 'Hoofdstraat 1, Baarn' },
    { id: '2', name: 'Eigen Haard', address: 'Amstelveenseweg 12, Amsterdam' }
  ]; 
};

export {
  fetchDynamicsProjects,
  syncProjectToDynamics,
  searchDynamicsAccounts,
  fetchDynamicsUsers,
  syncUsersToDynamics
};
