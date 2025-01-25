const nodeMailer = require("nodemailer")
const pug = require('pug')
const {convert} = require('html-to-text')

module.exports = class Email {
    constructor(user,url){
        this.to = user.email
        this.name = user.name.split(' ')[0]
        this.url = url
        this.from = `Muhammad Bilal <${process.env.EMAIL_FROM}>`
    }

    createTransporter(){
        if(process.env.NODE_ENV==='production'){
            return
        }

        const transporter = nodeMailer.createTransport({
            host:"sandbox.smtp.mailtrap.io",
            port:25,
            auth:{
                user:"5248628754672c",
                pass:"5bd9ca22c365ea"
            }
        })
        
        return transporter
    }

    async send(template,subject){
        // 1) Render the html file for email
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,{
            firstName:this.name,
            url:this.url,
            subject:subject
        })
        // 2) Mail Options
        const mailOptions={
            from:this.from,
            to:this.to,
            subject:subject,
            text:convert(html),
            html:html
        }

        // 3) Sending mail using mailtransporter
        await this.createTransporter().sendMail(mailOptions)
    }

    async sendWelcome(){
        await this.send('welcome','Welcome to Natours Family!')
    }

    async sendPasswordReset(){
        await this.send('passwordReset','Your password reset token (valid for only 10 minutes)')
    }
}
