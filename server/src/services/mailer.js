import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host : "smtp.ethereal.email",
    port : 587,
    secure : false,
    auth : {
        user  : "singharkirath1511@gmail.com",
        pass : "<your_password>"
    },
    service : "gmail"
});

export {transporter};
