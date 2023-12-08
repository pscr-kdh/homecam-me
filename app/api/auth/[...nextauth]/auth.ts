import CredentialsProvider from "next-auth/providers/credentials";
import {prisma} from '@/lib/prisma';
import bcrypt from 'bcrypt';
export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: {label: 'E-mail Address', type:'email', placeholder: 'Example: username@example.com'},
                password: {label: 'Password', type: 'password'},
            }, async authorize(credentials, req) {
                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials?.email
                    },
                });

            
                if(user && await bcrypt.compare(credentials!.password, user.password)) {
                    console.log(user);
                    return user;
                } else {
                    return null;
                }
            },
        })
    ]
}; 