import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { Equipment, AppNotification, PerformanceStats, UserProfile, Department } from '../types';
import { initialEquipment, initialNotifications, initialPerformanceStats, mockUsers, DEPARTMENTS } from '../data/mockData';

// Configuration from the provisioned Firebase config
const firebaseConfig = {
  projectId: "gen-lang-client-0230940552",
  appId: "1:831373547522:web:ed0c304e933a9b4297af1b",
  apiKey: "AIzaSyCFL7KurnyMqnvr8bw4eHc1c-WRwxD7d1M",
  authDomain: "gen-lang-client-0230940552.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-qunlthitbyt-c57b5ffe-3c9f-4023-a846-f94ef82a7a20",
  storageBucket: "gen-lang-client-0230940552.firebasestorage.app",
  messagingSenderId: "831373547522"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// COLLECTIONS DEF
const EQUIPMENT_COLL = 'equipment';
const NOTIFICATIONS_COLL = 'notifications';
const STATS_COLL = 'performanceStats';
const USERS_COLL = 'users';
const DEPARTMENTS_COLL = 'departments';

/**
 * Loads all equipment from Firestore.
 * If Firestore is empty, seeds it with initialEquipment and returns it.
 */
export async function loadEquipmentFromFirestore(): Promise<Equipment[]> {
  try {
    const colRef = collection(db, EQUIPMENT_COLL);
    const snapshot = await getDocs(colRef);
    
    if (snapshot.empty) {
      console.log('[Firebase] No equipment found. Seeding initial equipment...');
      // Seed initial equipment
      for (const eq of initialEquipment) {
        await setDoc(doc(db, EQUIPMENT_COLL, eq.id), eq);
      }
      return initialEquipment;
    }

    const list: Equipment[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Equipment);
    });
    return list;
  } catch (error) {
    console.error('[Firebase] Error loading equipment:', error);
    return initialEquipment;
  }
}

/**
 * Saves or updates a single equipment in Firestore.
 */
export async function saveEquipmentToFirestore(eq: Equipment): Promise<void> {
  try {
    const docRef = doc(db, EQUIPMENT_COLL, eq.id);
    await setDoc(docRef, eq, { merge: true });
    console.log(`[Firebase] Saved equipment ${eq.id}`);
  } catch (error) {
    console.error(`[Firebase] Error saving equipment ${eq.id}:`, error);
  }
}

/**
 * Deletes an equipment from Firestore.
 */
export async function deleteEquipmentFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, EQUIPMENT_COLL, id);
    await deleteDoc(docRef);
    console.log(`[Firebase] Deleted equipment ${id}`);
  } catch (error) {
    console.error(`[Firebase] Error deleting equipment ${id}:`, error);
  }
}

/**
 * Loads all notifications from Firestore.
 * If empty, seeds with initialNotifications.
 */
export async function loadNotificationsFromFirestore(): Promise<AppNotification[]> {
  try {
    const colRef = collection(db, NOTIFICATIONS_COLL);
    const snapshot = await getDocs(colRef);
    
    if (snapshot.empty) {
      console.log('[Firebase] No notifications found. Seeding initial notifications...');
      for (const notif of initialNotifications) {
        await setDoc(doc(db, NOTIFICATIONS_COLL, notif.id), notif);
      }
      return initialNotifications;
    }

    const list: AppNotification[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as AppNotification);
    });
    
    // Sort notifications by createdAt descending
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('[Firebase] Error loading notifications:', error);
    return initialNotifications;
  }
}

/**
 * Saves or updates a single notification in Firestore.
 */
export async function saveNotificationToFirestore(notif: AppNotification): Promise<void> {
  try {
    const docRef = doc(db, NOTIFICATIONS_COLL, notif.id);
    await setDoc(docRef, notif, { merge: true });
    console.log(`[Firebase] Saved notification ${notif.id}`);
  } catch (error) {
    console.error(`[Firebase] Error saving notification ${notif.id}:`, error);
  }
}

/**
 * Marks all notifications as read in Firestore.
 */
export async function markAllNotificationsAsReadInFirestore(notifications: AppNotification[]): Promise<void> {
  try {
    for (const notif of notifications) {
      if (!notif.read) {
        const docRef = doc(db, NOTIFICATIONS_COLL, notif.id);
        await updateDoc(docRef, { read: true });
      }
    }
    console.log('[Firebase] Marked all notifications as read');
  } catch (error) {
    console.error('[Firebase] Error marking all read:', error);
  }
}

/**
 * Loads all performance stats from Firestore.
 * If empty, seeds with initialPerformanceStats.
 */
export async function loadStatsFromFirestore(): Promise<PerformanceStats[]> {
  try {
    const colRef = collection(db, STATS_COLL);
    const snapshot = await getDocs(colRef);
    
    if (snapshot.empty) {
      console.log('[Firebase] No stats found. Seeding initial stats...');
      for (const stat of initialPerformanceStats) {
        // Use date as ID after escaping potential slashes
        const docId = stat.date.replace('/', '-');
        await setDoc(doc(db, STATS_COLL, docId), stat);
      }
      return initialPerformanceStats;
    }

    const list: PerformanceStats[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as PerformanceStats);
    });
    return list;
  } catch (error) {
    console.error('[Firebase] Error loading stats:', error);
    return initialPerformanceStats;
  }
}

/**
 * Loads all users from Firestore.
 * If empty, seeds with mockUsers.
 */
export async function loadUsersFromFirestore(): Promise<UserProfile[]> {
  try {
    const colRef = collection(db, USERS_COLL);
    const snapshot = await getDocs(colRef);
    
    if (snapshot.empty) {
      console.log('[Firebase] No users found. Seeding initial users...');
      for (const user of mockUsers) {
        await setDoc(doc(db, USERS_COLL, user.id), user);
      }
      return mockUsers;
    }

    const list: UserProfile[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as UserProfile);
    });
    return list;
  } catch (error) {
    console.error('[Firebase] Error loading users:', error);
    return mockUsers;
  }
}

/**
 * Saves or updates a single user in Firestore.
 */
export async function saveUserToFirestore(user: UserProfile): Promise<void> {
  try {
    const docRef = doc(db, USERS_COLL, user.id);
    await setDoc(docRef, user, { merge: true });
    console.log(`[Firebase] Saved user ${user.id} (${user.username})`);
  } catch (error) {
    console.error(`[Firebase] Error saving user ${user.id}:`, error);
  }
}

/**
 * Deletes a user from Firestore.
 */
export async function deleteUserFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, USERS_COLL, id);
    await deleteDoc(docRef);
    console.log(`[Firebase] Deleted user ${id}`);
  } catch (error) {
    console.error(`[Firebase] Error deleting user ${id}:`, error);
  }
}

/**
 * Loads all departments from Firestore.
 * If empty, seeds with initial DEPARTMENTS from mockData.
 */
export async function loadDepartmentsFromFirestore(): Promise<Department[]> {
  try {
    const colRef = collection(db, DEPARTMENTS_COLL);
    const snapshot = await getDocs(colRef);
    
    if (snapshot.empty) {
      console.log('[Firebase] No departments found. Seeding initial departments...');
      const list: Department[] = [];
      for (const name of DEPARTMENTS) {
        const id = `DEP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const dept: Department = { id, name };
        await setDoc(doc(db, DEPARTMENTS_COLL, id), dept);
        list.push(dept);
      }
      return list;
    }

    const list: Department[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Department);
    });
    return list;
  } catch (error) {
    console.error('[Firebase] Error loading departments:', error);
    return DEPARTMENTS.map((name, index) => ({ id: `DEP-${index}`, name }));
  }
}

/**
 * Saves or updates a single department in Firestore.
 */
export async function saveDepartmentToFirestore(dept: Department): Promise<void> {
  try {
    const docRef = doc(db, DEPARTMENTS_COLL, dept.id);
    await setDoc(docRef, dept, { merge: true });
    console.log(`[Firebase] Saved department ${dept.id} (${dept.name})`);
  } catch (error) {
    console.error(`[Firebase] Error saving department ${dept.id}:`, error);
  }
}

/**
 * Deletes a department from Firestore.
 */
export async function deleteDepartmentFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, DEPARTMENTS_COLL, id);
    await deleteDoc(docRef);
    console.log(`[Firebase] Deleted department ${id}`);
  } catch (error) {
    console.error(`[Firebase] Error deleting department ${id}:`, error);
  }
}
