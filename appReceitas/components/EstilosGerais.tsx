import { StyleSheet } from "react-native";
import { useFonts, Comforter_400Regular } from '@expo-google-fonts/comforter';

export const estilizar = () => {

    let [ fontsLoaded, fontError ] = useFonts({ Comforter_400Regular }) 

    if ( !fontsLoaded && !fontError ) { return {}; }
    else {

        return StyleSheet.create({

            texto: { flex: 1, backgroundColor: '#003399', alignItems: 'center', justifyContent: 'center' },

        })

    }
    
}