
const User = require('../models/user');
require('dotenv').config();
const { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail } = require('firebase/auth');

const {
    getFirestore,
    doc,
    setDoc,
    getDoc
} = require('firebase/firestore');

const { uploadImgs } = require('../controllers/img.controller');

const {app} = require('../config/db');

// 1. Función para loguear un usuario en Firebase Authentication
exports.loginAuthUser = async (email, password) => {
    const auth = getAuth(app);
    try {
        const userCredentials = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredentials) {
            throw new Error('Error al iniciar sesión');
        }
        return userCredentials.user;
        
    } catch (error) {
        console.error('Error al iniciar sesión:', error.message);
        return null;
    }
    
    

};

// 2. Función para crear un usuario en Firebase Authentication
const createAuthUser = async (email, password) => {
    const auth = getAuth(app);
    const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
    return userCredentials.user;
};

// 3. Función para crear un documento en Firestore
const createFirestoreUser = async (uid, userData) => {
    try {
        // Agregar rol de User
        userData.role = 'User';
        const firestore = getFirestore(app);
        const userRef = doc(firestore, "users", uid); // Referencia al documento
        await setDoc(userRef, userData); // Guardar datos en Firestore

        console.log("Usuario creado exitosamente en Firestore");

        // Respuesta en formato JSON
        return {
            success: true,
            message: "Usuario creado exitosamente en Firestore",
            data: { uid, ...userData },
        };
    } catch (error) {
        // Manejo de errores con formato JSON
        console.error("Error al crear el usuario en Firestore:", error.message);
        return {
            success: false,
            message: "Error al crear el usuario en Firestore",
            error: error.message,
        };
    }
};

exports.getUserData = async (uid) => {
    const firestore = getFirestore(app);
    const userRef = doc(firestore, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        throw new Error('No se encontró el usuario');
    }

    return userSnap.data();
}

// 4. Función principal que orquesta las demás funciones
exports.createUser = async (userData, files) => {
    const { userName, bornDate, email, password } = userData;

    try {
        const user = await createAuthUser(email, password);
        if (!user) {
            throw new Error('Error al crear el usuario');
        }
        const uid = user.uid;

        const userObject = new User(userName, bornDate, email);
        userObject.setId(uid);

        let results = [];
        if (files && files.length > 0) {
            // Llamar a la función uploadImgs y pasarle los archivos y otros datos necesarios
            const folder = `public/images/profile`;
            results = await uploadImgs(files, folder);
            
            if (results instanceof Error) {
                throw new Error('Error al subir las imágenes');
            }

            const imagesPrefix = process.env.BUCKET_IMAGES_PREFIX;
            results.forEach((result) => {
                if (result.status === 'success') {
                    userObject.addPictureLink(`${imagesPrefix}${result.data.path}`);
                }
            });
        }

        const firestore = await createFirestoreUser(uid, userObject.toJson());

        if (!firestore.success) {
            throw new Error(firestore.message);
        }

                return userObject;
    } catch (error) {
        return error;
    }
};

