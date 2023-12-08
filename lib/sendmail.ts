import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { prisma } from './prisma';

const directoryPath = path.join('/hc-tmp/'); 

async function checkAndSendPngFiles() {
    const admin = await prisma.user.findFirst({where:{isAdmin: true}});
    const notadmin = await prisma.user.findFirst({where:{isAdmin: false}});
    const sendermail:string = notadmin?.email!;
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: sendermail,
            pass: notadmin?.password,
        },
    });
    

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        const pngFiles = files.filter(file => file.endsWith('.png'));

        if (pngFiles.length === 0) {
            console.log('No PNG files found.');
            return;
        }

        const attachments = pngFiles.map(file => ({
            filename: file,
            path: path.join(directoryPath, file),
        }));

        const mailOptions = {
            from: sendermail?.toString(),
            to: admin?.email?.toString(),
            subject: '[HomeCam.me] 동작 감지 안내',
            text: '지난 5분 동안 동작이 감지되었습니다.',
            attachments,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
    });
};

setInterval(checkAndSendPngFiles, 5 * 60 * 1000);