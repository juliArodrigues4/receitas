import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet, GestureResponderEvent } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { fire, storage } from '../../firebaseConfig';
import { useNavigation, useRoute } from "@react-navigation/native";

const AlterarPlaneta = () => {
    const route = useRoute();
    const { id, nome: initialNome, ing: initialIng, prep: initialPrep, url: initialUrl } = route.params;
    const [nome, setNome] = useState<string>(initialNome);
    const [ing, setIng] = useState<string>(String(initialIng));
    const [prep, setPrep] = useState<string>(String(initialPrep));
    const [image, setImage] = useState<string>(initialUrl);

    const navigation = useNavigation();

    async function uploadImage(nome: string, ing: string, prep: string, uri: string, fileType: string, id: string): Promise<void> {
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
                await updateRecord(id, nome, ing, prep, fileType, downloadURL);
                setImage(downloadURL);
            }
        );
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

    async function pickImage(updateId: string | null = null): Promise<void> {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled && result.assets) {
            setImage(result.assets[0].uri);
            await uploadImage(nome, ing, prep, result.assets[0].uri, "img", id);
        }
    }

    const handlePickImage = (event: GestureResponderEvent) => {
        pickImage(id);
    };

    return (
        <View style={styles.container}>
            <TextInput 
                style={styles.nome} 
                placeholder="Nomeie o planeta" 
                value={nome} 
                onChangeText={setNome}
            />
            <TextInput 
                style={styles.nome2} 
                placeholder="Ingredientes" 
                value={ing} 
                onChangeText={setIng}
            />
            <TextInput 
                style={styles.nome2} 
                placeholder="Ingredientes" 
                value={prep} 
                onChangeText={setPrep}
            />
            <TouchableOpacity onPress={handlePickImage}>
                <Image
                    source={{ uri: image }}
                    style={styles.image}
                />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => updateRecord(id, nome, ing, prep, "img", image)}>
                <Text>Salvar Alterações</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#fff'
    },
    nome: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 10,
        width: '80%',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        padding: 8,
    },
    nome2: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 10,
        width: '80%',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        padding: 8,
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 20,
        marginVertical: 20,
    },
});

export default AlterarPlaneta;
