import { useState, useCallback, useMemo, useEffect } from "react";
import { useAuth } from "../context/contexts";
import { db } from "../firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, writeBatch, orderBy } from "firebase/firestore";

export function useFoodData() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "meals"), where("userId", "==", user.uid), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const meals = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setData(meals);
      } catch (error) {
        console.error("Error fetching meals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const saveMeal = useCallback(
    async (entry) => {
      if (!user) return;
      try {
        const mealWithUser = { ...entry, userId: user.uid };
        const docRef = await addDoc(collection(db, "meals"), mealWithUser);
        setData((prev) => [...prev, { id: docRef.id, ...mealWithUser }]);
      } catch (error) {
        console.error("Error saving meal:", error);
      }
    },
    [user]
  );

  const updateEntry = useCallback(
    async (id, entry) => {
      if (!user) return;
      try {
        const docRef = doc(db, "meals", id);
        await updateDoc(docRef, entry);
        setData((prev) => prev.map((item) => (item.id === id ? { ...item, ...entry } : item)));
      } catch (error) {
        console.error("Error updating meal:", error);
      }
    },
    [user]
  );

  const deleteEntry = useCallback(
    async (id) => {
      if (!user) return;
      try {
        await deleteDoc(doc(db, "meals", id));
        setData((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Error deleting meal:", error);
      }
    },
    [user]
  );

  const replaceAll = useCallback(
    async (rows) => {
      if (!user) return;
      try {
        const batch = writeBatch(db);
        // Delete all existing meals
        const q = query(collection(db, "meals"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        // Add new meals
        rows.forEach((row) => {
          const newDocRef = doc(collection(db, "meals"));
          batch.set(newDocRef, { ...row, userId: user.uid });
        });
        await batch.commit();
        // Update local state
        const newMeals = rows.map((row, index) => ({ id: `temp-${index}`, ...row, userId: user.uid }));
        newMeals.sort((a, b) => new Date(b.date) - new Date(a.date));
        setData(newMeals);
      } catch (error) {
        console.error("Error replacing all meals:", error);
      }
    },
    [user]
  );

  const clearAll = useCallback(async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "meals"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      setData([]);
    } catch (error) {
      console.error("Error clearing meals:", error);
    }
  }, [user]);

  const suggestions = useMemo(() => {
    const dc = {},
      pc = {};
    data.forEach((r) => {
      if (r.dish) dc[r.dish] = (dc[r.dish] || 0) + 1;
      if (r.preparedBy)
        pc[r.preparedBy] = (pc[r.preparedBy] || 0) + 1;
    });
    const rank = (obj) =>
      Object.keys(obj).sort((a, b) => obj[b] - obj[a]);
    return {
      dishes: rank(dc),
      persons: rank(pc),
      topDish: rank(dc)[0] || "",
      topPerson: rank(pc)[0] || "",
    };
  }, [data]);

  const streak = useMemo(() => {
    const logged = new Set(
      data.filter((r) => r.type !== "Skipped").map((r) => r.date)
    );
    let n = 0,
      d = new Date();
    while (logged.has(d.toISOString().split("T")[0])) {
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }, [data]);

  return {
    data,
    loading,
    saveMeal,
    updateEntry,
    deleteEntry,
    replaceAll,
    clearAll,
    suggestions,
    streak,
  };
}
