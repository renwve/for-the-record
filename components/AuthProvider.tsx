import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextType = { session: Session | null; user: User | null; loading: boolean };
const AuthContext = createContext<AuthContextType>({session:null,user:null,loading:true});
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({children}:{children:React.ReactNode}) {
  const [session,setSession]=useState<Session|null>(null); const [loading,setLoading]=useState(true);
  useEffect(()=>{ supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoading(false)}); const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s)); return ()=>subscription.unsubscribe(); },[]);
  return <AuthContext.Provider value={{session,user:session?.user??null,loading}}>{children}</AuthContext.Provider>;
}
