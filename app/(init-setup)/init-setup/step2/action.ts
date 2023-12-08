"use server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import bcrypt from 'bcrypt';

export async function SaveGmailAccount(formData: FormData) {
    
    const email = String(formData.get('email')).toLowerCase();
    const password = String(formData.get('password'));
    const retypePassword = formData.get('retype-password');
    const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    if(password != retypePassword) 
        return {message: "Password and Retype-Password fields do not match"};
    
    if(!email.match(re))
        return {message: "Invalid email format"}
    
    const user = await prisma.user.create({
        data: {
            email: email,
            password: password,
            isAdmin: false
        }
    });
    redirect('/');
}
