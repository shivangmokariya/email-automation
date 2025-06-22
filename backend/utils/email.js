const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport(options.transporterConfig);

    // 2) Define the email options
    const mailOptions = {
        from: options.transporterConfig.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
    };

    // 3) Actually send the email
    return transporter.sendMail(mailOptions);
};

module.exports = sendEmail; 