// App.js
import { useState, useEffect } from 'react';
import momiImg from "./images/momi.jpeg";
import oliImg from "./images/oli.png";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";



function getLocalDateTimeString() {
  const now = new Date();
  const offsetDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

function App() {
  const [users, setUsers] = useState(["אור", "רון", "תמי", "אלי", "עדי"]);
  const [dogs, setDogs] = useState([
    { name: "מומי", image: momiImg },
    { name: "אולי", image: oliImg },
  ]);

  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    user: "",
    dog: "",
    datetime: getLocalDateTimeString(),
    notes: "",
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLogin, setAdminLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  //פה הוספתי
 useEffect(() => {
  const fetchEntries = async () => {
    const querySnapshot = await getDocs(collection(db, "entries"));
    const firebaseEntries = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setEntries(firebaseEntries);
  };

  fetchEntries();
}, []);


  //עד לפה

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const docRef = await addDoc(collection(db, "entries"), formData);
    setEntries([...entries, { ...formData, id: docRef.id }]);
    setFormData({
      user: "",
      dog: "",
      datetime: getLocalDateTimeString(),
      notes: "",
    });
  } catch (error) {
    console.error("Error adding entry to Firestore:", error);
  }
  console.log("Saved to Firebase");
};


  const handleAdminLogin = () => {
    if (loginForm.username === "or" && loginForm.password === "1234") {
      setIsAdmin(true);
      setAdminLogin(false);
    } else {
      alert("פרטי התחברות שגויים");
    }
  };

  const handleDeleteUser = (name) => {
    setUsers(users.filter((u) => u !== name));
  };

  const handleDeleteDog = (name) => {
    setDogs(dogs.filter((d) => d.name !== name));
  };

  const handleDeleteEntry = async (index) => {
  const entryToDelete = entries[index];
  if (entryToDelete.id) {
    try {
      await deleteDoc(doc(db, "entries", entryToDelete.id));
    } catch (error) {
      console.error("Error deleting from Firestore:", error);
    }
  }
  const newEntries = [...entries];
  newEntries.splice(index, 1);
  setEntries(newEntries);
};


  const handleAddUser = (name) => {
    if (name && !users.includes(name)) {
      setUsers([...users, name]);
    }
  };

  const handleAddDog = (name, image) => {
    if (name && image && !dogs.find((d) => d.name === name)) {
      setDogs([...dogs, { name, image }]);
    }
  };

  const handleUpdateEntry = (index, updatedEntry) => {
    const newEntries = [...entries];
    newEntries[index] = updatedEntry;
    setEntries(newEntries);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'dog_walks_data.json';
    link.click();
  };

  const now = new Date();
  const filteredEntries = entries.filter(e => (now - new Date(e.datetime)) <= 1000 * 60 * 60 * 48);

  if (adminLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-md w-96">
          <h2 className="text-xl font-bold text-center mb-4">התחברות כמנהלת</h2>
          <input
            type="text"
            placeholder="שם משתמש"
            className="w-full border px-3 py-2 rounded mb-3"
            onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="סיסמה"
            className="w-full border px-3 py-2 rounded mb-4"
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
          />
          <button
            onClick={handleAdminLogin}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            התחברי
          </button>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 font-sans text-right">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">מסך ניהול</h1>

        <button
          onClick={() => setIsAdmin(false)}
          className="mb-6 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          חזרה למסך המשתמש
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-bold mb-3">משתמשים</h2>
            <input
              type="text"
              placeholder="הוסיפי שם חדש"
              onKeyDown={(e) => e.key === "Enter" && handleAddUser(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-3"
            />
            <ul className="space-y-2">
              {users.map((u) => (
                <li key={u} className="flex justify-between items-center bg-gray-50 px-3 py-1 rounded">
                  <span>{u}</span>
                  <button onClick={() => handleDeleteUser(u)} className="text-red-600 text-sm">מחק</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-bold mb-3">כלבים</h2>
            <input
              type="text"
              id="dogName"
              placeholder="שם הכלב"
              className="w-full border px-3 py-2 rounded mb-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                const name = document.getElementById("dogName").value;
                if (file && name) {
                  const reader = new FileReader();
                  reader.onload = () => handleAddDog(name, reader.result);
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full border px-3 py-2 rounded mb-3"
            />
            <ul className="space-y-2">
              {dogs.map((d) => (
                <li key={d.name} className="flex justify-between items-center bg-gray-50 px-3 py-1 rounded">
                  <span>{d.name}</span>
                  <button onClick={() => handleDeleteDog(d.name)} className="text-red-600 text-sm">מחק</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <h2 className="text-lg font-bold mb-3">עריכת טיולים</h2>
          <ul className="space-y-3">
            {entries.map((entry, index) => (
              <li key={index} className="border rounded p-3 bg-gray-50">
                <div className="mb-2 flex gap-2 flex-wrap">
                  <select
                    value={entry.user}
                    onChange={(e) => handleUpdateEntry(index, { ...entry, user: e.target.value })}
                    className="border rounded px-2 py-1"
                  >
                    {users.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>

                  <select
                    value={entry.dog}
                    onChange={(e) => handleUpdateEntry(index, { ...entry, dog: e.target.value })}
                    className="border rounded px-2 py-1"
                  >
                    {dogs.map((d) => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>

                  <input
                    type="datetime-local"
                    value={entry.datetime}
                    onChange={(e) => handleUpdateEntry(index, { ...entry, datetime: e.target.value })}
                    className="border rounded px-2 py-1"
                  />

                  <button
                    onClick={() => handleDeleteEntry(index)}
                    className="text-red-600 text-sm"
                  >
                    מחקי
                  </button>
                </div>
                <textarea
                  value={entry.notes}
                  onChange={(e) => handleUpdateEntry(index, { ...entry, notes: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                />
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={exportData}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ייצוא נתונים כ־JSON
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 font-sans text-right">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-blue-700 text-center">
          רישום טיולים עם הכלבים 🐾
        </h1>
        <button
          onClick={() => setAdminLogin(true)}
          className="absolute bottom-6 left-6 text-sm text-blue-700 underline"
        >
          ניהול
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              שם המשתמש
            </label>
            <select
              name="user"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              value={formData.user}
              onChange={handleChange}
              required
            >
              <option value="">בחרי שם...</option>
              {users.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center text-lg">
              בחרי כלב:
            </label>
            <div className="flex justify-center gap-6 flex-wrap">
              {dogs.map((dog) => {
                const isSelected = formData.dog === dog.name;
                return (
                  <button
                    key={dog.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, dog: dog.name })}
                    className={`relative flex flex-col items-center transition transform hover:scale-105 rounded-2xl p-3 w-32 shadow-md border-2 ${isSelected ? "border-blue-600 bg-blue-50 ring-2 ring-blue-300" : "border-gray-200 bg-white"}`}
                  >
                    <img src={dog.image} alt={dog.name} className="w-20 h-20 object-cover rounded-full shadow mb-2" />
                    <span className="text-sm font-semibold">{dog.name}</span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full shadow">
                        נבחר
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              תאריך ושעה
            </label>
            <input
              name="datetime"
              type="datetime-local"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              value={formData.datetime}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              הערות
            </label>
            <textarea
              name="notes"
              className="w-full border rounded-lg px-3 py-2 h-24 resize-none focus:outline-none focus:ring focus:border-blue-300"
              placeholder="למשל: רק פיפי, היה רעש ברחוב..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl text-lg hover:bg-blue-700 transition"
          >
            שלח טיול
          </button>
        </form>
      </div>

      <div className="max-w-xl mx-auto mt-10 bg-white rounded-3xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          טיולים שנרשמו (48 שעות אחרונות)
        </h2>
        <ul className="space-y-3">
          {filteredEntries.map((entry, index) => (
            <li
              key={index}
              className="bg-gray-50 border rounded-lg p-3 text-sm text-gray-700 shadow-sm"
            >
              <span className="font-semibold">{entry.user}</span> הוציא את {" "}
              <span className="font-semibold">{entry.dog}</span> ב־
              {new Date(entry.datetime).toLocaleString("he-IL")} —
              {entry.notes && ` ${entry.notes}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;