import nodeMailer from "nodemailer";

let adminMail = process.env.MAIL_USER;
let adminPassword = process.env.MAIL_PASSWORD;
let mailHost = process.env.MAIL_HOST;
let mailPort = process.env.MAIL_PORT;

let sendMail = (to, subject, htmlContent) => {
    let transport = nodeMailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: false, // use SSL-TLS
        auth: {
            user: adminMail,
            pass: adminPassword
        }
    });

    let options = {
        from: adminMail,
        to: to,
        subject: subject,
        html: htmlContent
    };
    return transport.sendMail(options);
};

module.exports = sendMail;