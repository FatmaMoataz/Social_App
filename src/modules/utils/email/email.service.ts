import nodemailer from "nodemailer"

export async function sendEmail(to:string, subject:string, html:string) {
    const transporter = nodemailer.createTransport({
        service:'gmail',tls:{rejectUnauthorized:false},
        auth: {
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASSWORD
        }
    })
    const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };
   await transporter.sendMail(mailOptions);
}