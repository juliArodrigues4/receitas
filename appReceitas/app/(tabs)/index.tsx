import React, { useState, useEffect } from 'react';
import { Text, View, SafeAreaView, TouchableOpacity, StyleSheet, GestureResponderEvent, TextInput, ImageBackground } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { fire, storage } from '../../firebaseConfig';


interface File {
    id: string;
    nome: string;
    ing: string;
    prep: string;
    fileType: string;
    url: string;
    createdAt: string;
    updatedAt?: string;
}

export default function HomeScreen() {

    const [nome, setNome] = useState<string>("");
    const [ing, setIng] = useState<string>("");
    const [prep, setPrep] = useState<string>("");
    const [image, setImage] = useState<string>("");
    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(fire, "receitas"), (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    setFiles((prevFiles) => [...prevFiles, { id: change.doc.id, ...change.doc.data() } as File]);
                }
            });
        });
        return () => unsubscribe();
    }, []);

    async function uploadImage(uri: string, fileType: string, nome: string, ing: string, prep: string, id: string | null = null): Promise<void> {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(storage, new Date().toISOString());
        const uploadTask = uploadBytesResumable(storageRef, blob);

        uploadTask.on(
            "state_changed",
            null,
            (error) => {
                console.error(error);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                if (!id) {
                    await saveRecord(nome, ing, prep, fileType, downloadURL, new Date().toISOString());
                }
                setImage("");
                setNome("");
                setIng("");
                setPrep("");
            }
        );
    }

    async function saveRecord(nome: string, ing: string, prep: string, fileType: string, url: string, createdAt: string): Promise<void> {
        try {
            await addDoc(collection(fire, "receitas"), {
                nome,
                ing,
                prep,
                fileType,
                url,
                createdAt
            });
        } catch (e) {
            console.log(e);
        }
    }

    async function pickImage(updateId: string | null = null): Promise<void> {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        });
        console.log(result);
        if (!result.canceled && result.assets) {
            setImage(result.assets[0].uri);
            await uploadImage(result.assets[0].uri, "img", nome, ing, prep, updateId);
        }
    }

    const handlePickImage = (event: GestureResponderEvent) => {
        pickImage();
    };

    return (
        <SafeAreaView style={[styles.container, styles.align]}>
            <View style={[styles.header, styles.align]}>
                <Text style={[styles.texto, {fontWeight: '500'}]}> Receitas dos Devs </Text>
            </View>

            <View style={[styles.header, styles.align, {height: 250, top: '40%', backgroundColor: 'none'}]}>
                <TextInput style={styles.nome} 
                    placeholder="Nome" 
                    value={nome} 
                    onChangeText={setNome}
                />
                <TextInput style={styles.nome} 
                    placeholder="Ingredientes" 
                    value={ing} 
                    onChangeText={setIng}
                    multiline={true}
                />
                <TextInput style={styles.nome} 
                    placeholder="Preparo"
                    value={prep} 
                    onChangeText={setPrep}
                    multiline={true}
                />
                <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
                    <Text style={[styles.texto, {fontWeight: '300', fontStyle: 'italic', margin: 7, fontSize: 15}]}>Subir Imagens</Text>
                </TouchableOpacity>
            </View>

          
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        position: 'absolute',
        top: 0,
        height: 150,
        width: '100%',
        padding: 8,
        backgroundColor: 'lightblue',
    },
    align: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    texto: {
        textAlign: 'center',
        fontSize: 25,
        color: 'lightblack',
        textAlignVertical: 'center'
    },
    nome: {
        fontSize: 16,
        color: '#000',
        textAlign: 'left',
        width: '70%',
        height: 50,
        borderRadius: 10,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderBottomWidth: 3,
        borderRightWidth: 3,
        borderColor: 'lightblue',
        margin: 5,
        paddingTop: 1,
        paddingRight: 8,
        paddingLeft: 8,
    },
    uploadButton:{
        width: '70%',
        height: 40,
        borderRadius: 10,
        backgroundColor: 'lightblue',
        marginTop: 15,
        
    },
    
});
