import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../components/AuthProvider';

export default function Index(){
 const {session,loading}=useAuth(); const opacity=useRef(new Animated.Value(0)).current; const y=useRef(new Animated.Value(18)).current;
 useEffect(()=>{Animated.parallel([Animated.timing(opacity,{toValue:1,duration:700,easing:Easing.out(Easing.cubic),useNativeDriver:true}),Animated.spring(y,{toValue:0,useNativeDriver:true})]).start()},[]);
 if(loading) return <View style={s.splash}><Animated.View style={{opacity,transform:[{translateY:y}]}}><Text style={s.mark}>for the record</Text><Text style={s.tag}>a little place for everything you watched.</Text></Animated.View></View>;
 return session?<Redirect href="/(tabs)"/>:<Redirect href="/auth"/>;
}
const s=StyleSheet.create({splash:{flex:1,backgroundColor:'#F7F0E8',alignItems:'center',justifyContent:'center',padding:28},mark:{fontSize:42,fontWeight:'700',letterSpacing:-2,color:'#222',textAlign:'center'},tag:{fontSize:14,color:'#777',marginTop:10,textAlign:'center'}});
