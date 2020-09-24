import React, { useState, createContext, useEffect } from 'react';
import firebase from '../services/firebaseConnection';
import { AsyncStorage } from 'react-native'

export const AuthContext = createContext({});

function AuthProvider({ children }){
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function loadStorage() {
            const storageUser = await AsyncStorage.getItem('Auth_user');

            if(storageUser){
                setUser(JSON.parse(storageUser))
                setLoading(false);
            }

            setLoading(false);
        }

        loadStorage();
    }, [])






    //Funcao para logar o usuário
    async function signIn(email,password){
        await firebase.auth().signInWithEmailAndPassword(email, password)
        .then(async (value) => {
            let uid = value.user.uid;
            await firebase.database().ref('users').child(uid).once('value')
            .then((snapshot) => {
                let data = {
                    uid: uid,
                    nome: snapshot.val().nome,
                    email: value.user.email,
                    Tipo: snapshot.val().Tipo,
                    Série: snapshot.val().Série,
                    Matéria: snapshot.val().Matéria,
                    classe: snapshot.val().classe,
                    portfolio: snapshot.val().portfolio,
                }

                setUser(data);
                storageUser(data);
            })
        })
        .catch((error) => {
            alert(error.code);
        });
    }


    //deslogar usuário
    async function signOut(){
        await firebase.auth().signOut();
        await AsyncStorage.clear()
        .then(() => {
            setUser(null);
        })
    } 

    async function signUp(email, password, nome){
                    await firebase.auth().createUserWithEmailAndPassword(email,password)
                    .then(async (value)=>{
                        let uid = value.user.uid;
                        await firebase.database().ref('users').child(uid).set({
                            nome: nome,
                            Tipo:  'aluno',
                            Série: '2º ano',
                            Matéria: 'Álgebra',
                            classe: null,
                            portfolio: null
                        })
                        .then(()=>{
                            let data = {
                                uid: uid,
                                nome: nome,
                                Tipo: 'aluno',
                                email: value.user.email,
                                Série: '2º ano',
                                Matéria: 'Álgebra',
                                classe: null,
                                portfolio: null
                            };
                            setUser(data);
                            storageUser(data);
                        })
                        .catch((error) => {
                            alert(error.code);
                        });
                    })
            }
        
    



    async function storageUser(data){
        await AsyncStorage.setItem('Auth_user', JSON.stringify(data));
    }

    return(
     <AuthContext.Provider value={{ signed: !!user , user, loading, signUp, signIn, signOut}}>
         {children}
     </AuthContext.Provider>   
    );
}

export default AuthProvider;
