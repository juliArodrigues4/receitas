import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, Image, Alert, StyleSheet, GestureResponderEvent } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable, deleteObject } from 'firebase/storage';
import { fire, storage } from '../../firebaseConfig';
import { useNavigation } from "@react-navigation/native";
import { Feather, MaterialIcons  } from '@expo/vector-icons';

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

export default function HomeScreen({}) {
    const [nome, setNome] = useState<string>("");
    const [ing, setIng] = useState<string>("");
    const [prep, setPrep] = useState<string>("");
    const [image, setImage] = useState<string>("");
    const [files, setFiles] = useState<File[]>([]);
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(fire, "receitas"), (snapshot) => {
            setFiles((prevFiles) => {
                const newFiles = [...prevFiles];
                snapshot.docChanges().forEach((change) => {
                    const newFile = { id: change.doc.id, ...change.doc.data() } as File;
                    if (change.type === "added") {
                        const exists = newFiles.find((file) => file.id === newFile.id);
                        if (!exists) {
                            newFiles.push(newFile);
                        }
                    }
                    if (change.type === "modified") {
                        const index = newFiles.findIndex((file) => file.id === newFile.id);
                        if (index !== -1) {
                            newFiles[index] = newFile;
                        }
                    }
                    if (change.type === "removed") {
                        const index = newFiles.findIndex((file) => file.id === newFile.id);
                        if (index !== -1) {
                            newFiles.splice(index, 1);
                        }
                    }
                });
                return newFiles;
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
                if (id) {
                    await updateRecord(id, nome, ing, prep, fileType, downloadURL);
                } else {
                    await saveRecord(nome, ing, prep, fileType, downloadURL, new Date().toISOString());
                }
                setImage("");
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
                createdAt,
            });
        } catch (e) {
            console.log(e);
        }
    }

    async function updateRecord(id: string, nome: string, ing: string, prep: string, fileType: string, url: string): Promise<void> {
        try {
            await updateDoc(doc(fire, "receitas", id), {
                nome,
                ing,
                prep,
                fileType,
                url,
                updatedAt: new Date().toISOString(),
            });
        } catch (e) {
            console.log(e);
        }
    }

    async function deleteRecord(id: string, url: string): Promise<void> {
        try {
            await deleteDoc(doc(fire, "receitas", id));
            const storageRef = ref(storage, url);
            await deleteObject(storageRef);
        } catch (e) {
            console.log(e);
        }
    }

    async function pickImage(nome: string, ing: string, prep: string, updateId: string | null = null): Promise<void> {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        console.log(result);
        if (!result.canceled && result.assets) {
            setImage(result.assets[0].uri);
            await uploadImage(result.assets[0].uri, "img", nome, ing, prep, updateId);
        }
    }
    

    function confirmDelete(id: string, url: string): void {
        Alert.alert(
            "Confirmação",
            "Tem certeza que deseja deletar esta imagem?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Deletar", onPress: () => deleteRecord(id, url) }
            ]
        );
    }

    const handlePickImage = (event: GestureResponderEvent) => {
        pickImage("");
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.texto}>Suas Receitas</Text>
        </View>
    );

    const renderItem = ({ item }: { item: File }) => {
        if (item.fileType === "img") {
            return (
               <SafeAreaView style={styles.container}>
                 <View style={styles.all}>
                    <View style={styles.cont}>
                        <Image
                            source={{ uri: item.url }}
                            style={styles.image}
                        />
                        <Text>Nome: {item.nome}</Text>
                        <Text>Ingredientes: {item.ing}</Text>
                        <Text>Preparo: {item.prep}</Text>
                    <View style={styles.btns}>
                        <TouchableOpacity onPress={() => navigation.navigate("AlterarPlaneta", { id: item.id, nome: item.nome, ing: item.ing, prep: item.prep, url: item.url })}>
                            <Feather name="edit-3" size={24} color="black" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => confirmDelete(item.id, item.url)}>
                            <MaterialIcons name="delete-outline" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                    </View>
                 </View>
               </SafeAreaView>
            );
        }
        return null;
    };

    return (
        <FlatList
            data={files}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            numColumns={1}
            ListHeaderComponent={renderHeader}
        />
    );
}

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        top: 0,
        height: 150,
        width: '100%',
        padding: 8,
        backgroundColor: 'lightblue',
    },
    texto: {
        textAlign: 'center',
        fontSize: 25,
        color: 'lightblack',
        textAlignVertical: 'center'
    },
    btns: {
        width: 'auto',
        position: 'absolute',
        right: "7%",
        bottom: 5,
        flexDirection: 'column',
        marginTop: 15
    },
    itemContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        margin: 5
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 20
    },
    uploadButton: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        padding: 50,
        backgroundColor: 'lightblue',
        marginTop: 10
    },
    cont: {
        width: 200,
        height: 'auto',
        padding: 8,
        backgroundColor: '#FF8C00',
        margin: 5,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'

    },
    all: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 45,
        backgroundColor: '#fff'

    }
});
