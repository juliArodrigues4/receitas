import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabLayout from "./(tabs)/_layout";

const Stack = createNativeStackNavigator();

const App: React.FC = () => {

    return (

        <NavigationContainer>
           <TabLayout />
        </NavigationContainer>

    );

}